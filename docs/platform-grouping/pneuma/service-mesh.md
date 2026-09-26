---
sidebar_label: Service Mesh
---

# Service Mesh

Istio runs on every GKE cluster as a single multi-cluster ambient mesh via GKE Fleet. It provides workload identity and mTLS via `ztunnel`, L4 policy enforcement in the data plane, centralized [gateway authentication](./gateway-authentication.md), and an ingress gateway backed by Cloud Armor WAF and Datadog AAP. Ingress uses the vendor-neutral [Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/).

- **Ambient data plane**: `ztunnel` runs on each node and establishes identity-based mTLS and L4 policy enforcement without per-pod sidecars.
- **Ingress gateway**: External traffic enters exclusively through pneuma's dedicated Gateway API Envoy data plane, backed by MCI global load balancer, Cloud Armor WAF, Datadog AAP, and Authentik external authorization.
- **Routing and auth**: Teams declare route intent and auth policy in Logos; pneuma renders `HTTPRoute`s and gateway policies for namespaces enrolled in the ambient mesh.
- **Waypoint-on-demand**: Advanced L7 routing, traffic shaping, and richer observability require a waypoint; workloads stay ambient by default without always-on proxies.
- **cert-manager**: `cert-manager-istio-csr` signs ztunnel identities for workload mTLS certificates across the mesh.

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Components

| Component | Description |
|---|---|
| `istio-control-plane` | `istiod` deployed via Helm on every cluster — manages traffic policy, service discovery, and certificate distribution for the mesh |
| `ztunnel` | Per-node ambient dataplane component that provides identity, mTLS, L4 policy enforcement, and telemetry for workloads in mesh-enabled namespaces |
| `waypoint` | Optional L7 proxy provisioned on demand when a namespace or service needs advanced routing, policy, or observability beyond ambient L4 functionality |
| `gateway` | Gateway API `Gateway` (gatewayClassName `istio`) on pneuma clusters only. The dedicated Envoy data plane terminates external traffic and is separate from ambient workload mode |
| `gateway-auth` | Istio `RequestAuthentication` and `AuthorizationPolicy` resources on the gateway data plane — validates Authentik JWTs, forwards `browser` routes to the Authentik embedded outpost via `ext_authz`, and enforces route-scoped claims for `api-jwt` routes. See [Gateway Authentication](./gateway-authentication.md) |
| `waf-policy` | Cloud Armor security policy on the ingress gateway (OWASP rules, rate limiting, adaptive DDoS) |
| `http-route` | Gateway API `HTTPRoute` per team host, co-located with the backend `Service` in the team's namespace |
| `destination-rule` | Ambient traffic policy configuration for cross-cluster routing and service selection when a waypoint or explicit policy is needed |
| `peer-authentication` | Mesh-wide mTLS enforcement at the ambient dataplane boundary |

## Multi-Cluster Mesh

All GKE clusters join a GKE Fleet and form a single ambient Istio mesh. Fleet membership enables cross-cluster endpoint discovery: a route on a pneuma cluster can reach a pod on a member team cluster with no additional configuration.

Each cluster runs its own `istiod` control plane and has `ztunnel` deployed on the node pool. A control-plane failure on one cluster does not affect workloads on another, and workloads remain ambient-only unless a waypoint is explicitly provisioned.

### Gateway and Member Cluster Roles

| Role | Clusters | Responsibilities |
|---|---|---|
| **Gateway** | `pt-pneuma-*` | Shared ingress gateway, MCI global load balancer, Cloud Armor WAF, Datadog AAP, and `HTTPRoute` rendering for all teams |
| **Member** | `pt-kryptos-*` (and future teams) | `ztunnel` ambient dataplane and optional waypoint proxies; no public gateway — receives traffic from the mesh |

### DNS and Ingress Routing

All external DNS points to pneuma's gateway IPs:

| Record | Target |
|---|---|
| `{team}.{env}.osinfra.io` | MCI global IP (anycast, lowest-latency zone) |
| `{zone}.{team}.{env}.osinfra.io` | Zonal load balancer in that zone |

Traffic to `kryptos.sb.osinfra.io` enters pneuma's gateway, matches the `HTTPRoute` for that host, and forwards across the mesh to the kryptos cluster. Member clusters have no public IP.

### Cross-Cluster Routing

Gateway API `HTTPRoute` `backendRef`s must resolve to a local `Service` on the gateway cluster. For member teams, pneuma creates a **selectorless stub `Service`** (and its namespace) on the gateway cluster. Fleet endpoint discovery fills that stub's endpoints from the owning team's clusters only — no pods with that service name exist elsewhere — so traffic routes exclusively to the correct team without explicit `DestinationRule` subsets.

Each `HTTPRoute` lives in the same namespace as its backend `Service`, so no `ReferenceGrant` is required. The shared `Gateway` authorizes attachment from all namespaces (`allowedRoutes.namespaces.from: All`).

### Logos-Declared Routes

Teams declare route intent (`service`, `port`, optional `path`) under a mesh-enabled namespace in the Logos team spec. Routes may only be declared on namespaces with `mesh_enabled = true`. Pneuma renders each declaration into an `HTTPRoute` with:

- `hostnames` derived from the team's authoritative DNS zone (`dns_subdomain`) — never team-supplied text
- `backendRef` pointing to the `Service` in the team's prefixed namespace on the gateway cluster
- no requirement for per-pod sidecar injection because the workload traffic is handled by the ambient `ztunnel` data plane

The shared `Gateway` carries a single catch-all HTTPS listener (no hostname filter, wildcard TLS cert). Route changes take effect on the next pneuma pipeline run.

**Example declaration** (in the team's Logos spec):

```hcl
namespaces = {
  "api" = {
    mesh_enabled = true

    routes = {
      "api" = {
        path    = "/api"
        port    = 8080
        service = "api-service"
      }
    }
  }
}
```

Pneuma renders this as an `HTTPRoute` in the `st-ethos-api` namespace on the gateway cluster, serving `ethos.osinfra.io/api`:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: api-ethos
  namespace: st-ethos-api
spec:
  parentRefs:
    - name: gateway
      namespace: istio-ingress
  hostnames:
    - ethos.osinfra.io
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /api
      backendRefs:
        - name: api-service
          port: 8080
```

**What's served vs not:**

| Scenario | Result |
|---|---|
| `ethos.osinfra.io/api` from a declared route | ✅ Served — pneuma binds the team's subdomain |
| `us-east1-b.ethos.osinfra.io/api` (zonal probe) | ✅ Served — derived from the same subdomain |
| A team claiming `other-team.osinfra.io` | ❌ Impossible — teams never supply a hostname |
| An `HTTPRoute` applied directly to a gateway cluster | ❌ Teams have no RBAC there |

**Troubleshooting** — if a route is not being served:

1. Confirm the route is declared on a mesh-enabled namespace with correct `service` and `port`
2. Confirm `dns_subdomain` is set for the team
3. Confirm the backend `Service` exists on the gateway cluster and listens on the declared port
4. Confirm the namespace is enrolled in the ambient mesh (`mesh_enabled = true`)
5. Inspect the rendered route — `Accepted` and `ResolvedRefs` should both be `True`:

   ```bash
   kubectl get httproute -n st-ethos-api api-ethos -o yaml
   ```

## Gateway Authentication Policies

For any declared route, a team may attach a **gateway auth policy** so pneuma enforces authentication and authorization at the shared gateway through Authentik. Policies are declared under `route_auth_policies`, keyed by the matching route name, and may only be set on mesh-enabled namespaces. Each policy selects one of three **modes** (default `browser`). The gateway data plane is the auth enforcement boundary; workload ambient mode is independent of it.

| Mode | Purpose | Required fields | Forbidden fields |
|---|---|---|---|
| `public` | No authentication — the route is open | none | `audiences`, `public_paths`, `required_groups`, `required_roles` |
| `browser` | Interactive Authentik SSO for human users | at least one of `required_groups` / `required_roles` | `audiences` |
| `api-jwt` | Machine-to-machine bearer JWT validation | at least one `audiences` value | none |

`public_paths` (allowed on `browser` and `api-jwt`) list unauthenticated sub-paths under the route's `path` prefix — each must start with `/`, must not be `/`, and must fall under the route path. Entries are matched **as declared**: `/api/healthz` exempts only that exact path, so to exempt a subtree add a trailing wildcard (`/api/healthz/*`). A root or wildcard-only entry (`/`, `/*`, `*`) is rejected because it would exempt the whole route. `required_groups` and `required_roles` reference Authentik identity groups and application roles carried in the token claims.

**Claim and path matching semantics:**

- **Non-empty lists.** Logos rejects an empty `required_groups`/`required_roles` on a `browser` policy and an empty `audiences` on an `api-jwt` policy, so an enforced route always has at least one principal to match.
- **OR within a list, AND across lists.** A request satisfies a single claim list if it carries **any one** of the listed values (OR). When more than one claim type is declared (e.g. `audiences` plus `required_roles` on an `api-jwt` route), the request must satisfy **each** list (AND).
- **Route `path` is a prefix.** A route with `path = "/api"` matches `/api` and everything under it; a route that omits `path` defaults to `/` and matches all paths under the host. Enforcement covers the whole prefix except the declared `public_paths` and pneuma's built-in exemptions (Authentik callback and health-check paths).

**Example declaration** (in the team's Logos spec):

```hcl
namespaces = {
  "api" = {
    mesh_enabled = true

    route_auth_policies = {
      "api" = {
        mode            = "browser"
        public_paths    = ["/api/healthz"]
        required_groups = ["platform-engineers"]
      }
    }

    routes = {
      "api" = {
        path    = "/api"
        port    = 8080
        service = "api-service"
      }
    }
  }
}
```

Pneuma renders `browser` policies as a forward-auth `AuthorizationPolicy` (Envoy `ext_authz` to the Authentik embedded outpost) that authenticates the interactive session; group and role authorization for `browser` routes is enforced by per-host Authentik application, provider, and policy-binding resources that Pneuma renders automatically from the declared `required_groups` / `required_roles`. Because these resources are host-scoped, all browser routes for a team must declare identical `required_groups` and `required_roles`; Logos rejects conflicting requirements rather than allowing one route's policy to authorize another route on the same host. The one remaining manual step is Authentik group **membership** itself, which is not yet synced from Logos/Google Identity groups (tracked in [pt-pneuma#181](https://github.com/osinfra-io/pt-pneuma/issues/181)). `api-jwt` policies render a `RequestAuthentication` plus a native-claim DENY `AuthorizationPolicy` that rejects any request without a validated JWT or whose `aud`, `groups`, or `roles` claims do not satisfy the configured `audiences`, `required_groups`, or `required_roles` values. `public` routes and any declared `public_paths` are excluded from enforcement.

See [Gateway Authentication](./gateway-authentication.md) for the full request evaluation order, component ownership, and operational expectations.

### End-to-End Validation

The `istio-test` workspace deploys a lightweight metadata service into each team's prefixed istio-test namespace (`pt-pneuma-istio-test`, `pt-kryptos-istio-test`, etc.). A validation script checks every global and zonal endpoint, confirming the returned cluster name matches the expected team and zone.

## Core Invariants

- Ambient mTLS is enforced on every cluster via `ztunnel` and `PeerAuthentication` in strict mode — no plaintext pod-to-pod traffic.
- The ingress gateway runs only on pneuma clusters — member clusters have no public endpoint.
- `HTTPRoute` hostnames are derived from the team's `dns_subdomain` — teams cannot serve traffic on another team's subdomain.
- Member namespace names carry the team-key prefix (`{team_key}-{namespace}`) — no cross-team endpoint aggregation in the mesh.
- Ambient-only mode is the default target state — a permanent mixed sidecar/ambient deployment and always-on waypoints are both rejected.

## Architecture Decision Records

### Ambient-only workload mesh with waypoint-on-demand

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>September 2026</td><td>Pneuma</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

The platform needs a single workload mesh that is predictable, secure, and easy to operate across many GKE clusters. A permanent mix of sidecars and ambient data planes would create two lifecycle models for the same workloads, duplicate policy and telemetry semantics, and increase operational complexity during upgrades. Always-on waypoints would add unnecessary L7 proxy overhead for namespaces that do not need advanced routing or observability.

#### Decision

Pneuma standardizes on an ambient-only workload mesh. All mesh-enabled namespaces enroll their workloads into the ambient data plane via `ztunnel`; the gateway remains a dedicated Envoy data plane for ingress and auth, and waypoint proxies are created only when a service or namespace genuinely needs L7 policy, routing, or observability. The target state rejects both permanently mixed sidecar/ambient workloads and always-on waypoint usage.

#### Alternatives Considered

- **Permanent mixed mode** — Rejected. It keeps two parallel workload data planes, creates conflicting telemetry and policy expectations, and complicates upgrades.
- **Always-on waypoints for every namespace** — Rejected. It adds unnecessary proxy overhead and turns a lightweight ambient mesh into a sidecar-like deployment model for every workload.
- **A separate team-owned ingress mesh** — Rejected. It fragments platform ownership, duplicates policy, and makes cross-cluster routing more complex.

#### Consequences

- Workloads remain lightweight and consistent across all clusters.
- Advanced L7 policy and telemetry are introduced only when needed through explicit waypoint deployment.
- Gateway auth remains independent of ambient workload mode, keeping ingress enforcement centralized and predictable.
- Platform operators maintain a simpler upgrade path because the mesh has one primary data plane.

- TLS termination, WAF, and threat detection happen at a single controlled point for every team
- Adding a team requires only a Logos spec change — no gateway or load balancer changes
- Pneuma gateway clusters are critical infrastructure — their availability determines reachability of all teams

### Team-Prefixed Namespace Isolation in the Mesh

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>July 2026</td><td>Pneuma</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

In a single Fleet mesh, cross-cluster endpoint discovery aggregates endpoints by service name and namespace. If two teams deploy a `Service` with the same name in the same namespace, fleet discovery merges their endpoints — traffic becomes non-deterministic.

#### Decision

All team namespaces are provisioned with a team-key prefix: `{name}` in the team spec becomes `{team_key}-{name}` in the cluster (e.g., `pt-kryptos-istio-test`). Pneuma is prefixed the same way — no platform-team exception.

For member teams, pneuma creates a selectorless stub `Service` on the gateway cluster in the prefixed namespace. Fleet discovery returns endpoints only from the owning team's clusters, achieving isolation through naming alone.

#### Alternatives Considered

- **Explicit DestinationRule subsets with cluster labels** — Rejected. Requires a DestinationRule for each team/service, each of which must stay in sync with topology changes.
- **Locality failover rules** — Rejected. Routes by proximity, not ownership — cannot guarantee traffic stays within a team's cluster.
- **Separate gateways per team** — Rejected. Contradicts single-gateway-owner decision.

#### Consequences

- Each team's namespace DNS is globally unique — no cross-team endpoint aggregation
- Namespace names in Logos specs remain unprefixed; the prefix is applied at provision time
- The istio-test validation provably reaches only the correct team's cluster

### Kubernetes Gateway API over Native Istio Gateway

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>July 2026</td><td>Pneuma</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Istio provides two models for ingress: its native `Gateway`/`VirtualService` CRDs, and the vendor-neutral Kubernetes Gateway API (`Gateway`/`HTTPRoute`). The native model couples routing to Istio-specific resources, requires a separately managed Helm-deployed data plane, and gates all route changes behind pneuma PRs since teams cannot own route intent through `VirtualService`.

#### Decision

Use the Kubernetes Gateway API. Pneuma owns a shared `Gateway` (gatewayClassName `istio`); istiod reconciles it and auto-provisions the `gateway-istio` data plane. Routing uses `HTTPRoute` instead of `VirtualService`: each route is co-located with its backend `Service` and attaches to the shared Gateway via `parentRefs`. Cross-cluster backends resolve through selectorless stub `Service`s with Fleet-filled endpoints.

#### Alternatives Considered

- **Native Istio `Gateway`/`VirtualService`** — Rejected. Vendor-specific API; all route changes gated behind pneuma PRs; requires a separately managed Helm data plane.
- **Manual gateway data plane with Gateway API routing** — Rejected. The Helm chart is not Gateway-API-aware; auto-provisioning by istiod is less code and idiomatic.

#### Consequences

- Routing is vendor-neutral; teams own route intent in Logos
- Data plane is Istio-owned, removing the Helm release
- Cross-cluster backends require selectorless stub `Service`s on the gateway cluster

#### Links

- [Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/)
- [Istio Kubernetes Gateway API support](https://istio.io/latest/docs/tasks/traffic-management/ingress/gateway-api/)
- [GKE Gateway API](https://cloud.google.com/kubernetes-engine/docs/concepts/gateway-api)

### IaC-Layer Subdomain Isolation (Single Catch-All Listener)

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>July 2026</td><td>Pneuma</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Each team must serve traffic only on its own `<subdomain>.osinfra.io` host. The Gateway-native approach — per-team HTTPS listeners with concrete hostnames — fails on GCP: the fronting global external ALB (GFE) does not forward client SNI to backends. Per-team listeners build only SNI-matched Envoy filter chains with no default chain, so every GFE connection hits `NR filter_chain_not_found` → universal `502`.

#### Decision

Keep a single catch-all HTTPS listener (no hostname filter, wildcard cert, `allowedRoutes.namespaces.from: All`) so the GFE→Envoy hop always matches. Move subdomain isolation to the IaC layer:

- Teams declare route intent in Logos (PR-reviewed); they never supply hostnames
- Pneuma derives `HTTPRoute` hostnames from the team's `dns_subdomain`
- Only the pneuma pipeline applies manifests to gateway clusters; teams have no RBAC there

#### Alternatives Considered

- **Per-team SNI listeners** — Rejected. GCP L7 ALB does not forward client SNI; returns universal `502`.
- **L4 TLS-passthrough load balancer** — Rejected. Preserves SNI but drops L7 features (Cloud Armor WAF, URL maps) and requires public ACME certs. Revisit only if teams gain direct `HTTPRoute` apply rights.
- **OPA Gatekeeper admission policy** — Rejected. Adds Rego + webhook + second source of truth to replicate a guarantee the pipeline already provides.

#### Consequences

- Subdomain isolation is enforced in reviewed IaC and the deploy pipeline, not the data plane
- End-to-end TLS, L7 ALB features, and Gateway API are all retained
- Wildcard cert covers all team hosts; adding a team requires no per-team platform action
- Residual risk: a rendering bug or compromised pipeline could mis-bind a hostname — same trust surface as all pneuma-managed resources
