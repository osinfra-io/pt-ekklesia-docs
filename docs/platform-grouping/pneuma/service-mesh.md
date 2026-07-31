---
sidebar_label: Service Mesh
---

# Service Mesh

Istio runs on every GKE cluster as a single multi-cluster mesh via GKE Fleet. It provides mTLS between services, traffic management, and an ingress gateway backed by Cloud Armor WAF and Datadog AAP. Ingress uses the vendor-neutral [Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/).

- **mTLS**: All pod-to-pod traffic is encrypted and authenticated via per-cluster istiod instances
- **Ingress gateway**: External traffic enters exclusively through pneuma's gateway — a Gateway API `Gateway` reconciled by istiod, backed by MCI global load balancer, Cloud Armor WAF, and Datadog AAP
- **Routing**: Teams declare route intent in Logos; pneuma renders `HTTPRoute`s with hostnames derived from the team's authoritative DNS zone
- **cert-manager**: Istio's built-in CA is replaced by cert-manager via istio-csr for all workload mTLS certificates

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Components

| Component | Description |
|---|---|
| `istio-control-plane` | istiod deployed via Helm on every cluster — manages traffic policy and mTLS certificate distribution |
| `gateway` | Gateway API `Gateway` (gatewayClassName `istio`) on pneuma clusters only. istiod auto-provisions the `gateway-istio` data plane; exposed via MCI global and zonal load balancers |
| `waf-policy` | Cloud Armor security policy on the ingress gateway (OWASP rules, rate limiting, adaptive DDoS) |
| `http-route` | Gateway API `HTTPRoute` per team host, co-located with the backend `Service` in the team's namespace |
| `destination-rule` | Istio connection pool and circuit breaker settings per destination |
| `peer-authentication` | Mesh-wide strict mTLS enforcement |

## Multi-Cluster Mesh

All GKE clusters join a GKE Fleet and form a single Istio mesh. Fleet membership enables cross-cluster endpoint discovery: a route on a pneuma cluster can reach a pod on a member team cluster with no additional configuration.

Each cluster runs its own istiod — a control plane failure on one cluster does not affect workloads on another.

### Gateway and Member Cluster Roles

| Role | Clusters | Responsibilities |
|---|---|---|
| **Gateway** | `pt-pneuma-*` | Ingress gateway, MCI global load balancer, Cloud Armor WAF, Datadog AAP, `HTTPRoute`s for all teams |
| **Member** | `pt-kryptos-*` (and future teams) | istiod for mTLS and sidecar injection; no gateway — receives traffic from the mesh |

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

Teams declare route intent (`service`, `port`, optional `path`) under a mesh-enabled namespace in the Logos team spec. Routes may only be declared on namespaces with `istio_injection = "enabled"`. Pneuma renders each declaration into an `HTTPRoute` with:

- `hostnames` derived from the team's authoritative DNS zone (`dns_subdomain`) — never team-supplied text
- `backendRef` pointing to the `Service` in the team's prefixed namespace on the gateway cluster

The shared `Gateway` carries a single catch-all HTTPS listener (no hostname filter, wildcard TLS cert). Route changes take effect on the next pneuma pipeline run.

**Example declaration** (in the team's Logos spec):

```hcl
namespaces = {
  "api" = {
    istio_injection = "enabled"

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
4. Inspect the rendered route — `Accepted` and `ResolvedRefs` should both be `True`:

   ```bash
   kubectl get httproute -n st-ethos-api api-ethos -o yaml
   ```

### Gateway Auth Policies

For any declared route, a team may attach a **gateway auth policy** so pneuma enforces authentication and authorization at the shared gateway through Authentik. Policies are declared under `route_auth_policies`, keyed by the matching route name, and may only be set on mesh-enabled namespaces. Each policy selects one of three **modes** (default `browser`):

| Mode | Purpose | Required fields | Forbidden fields |
|---|---|---|---|
| `public` | No authentication — the route is open | none | `audiences`, `public_paths`, `required_groups`, `required_roles` |
| `browser` | Interactive Authentik SSO for human users | at least one of `required_groups` / `required_roles` | `audiences` |
| `api-jwt` | Machine-to-machine bearer JWT validation | at least one `audiences` value | none |

`public_paths` (allowed on `browser` and `api-jwt`) list unauthenticated sub-paths under the route's `path` prefix — each must start with `/`, must not be `/`, and must fall under the route path. `required_groups` and `required_roles` reference Authentik identity groups and application roles carried in the token claims.

**Example declaration** (in the team's Logos spec):

```hcl
namespaces = {
  "api" = {
    istio_injection = "enabled"

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

Pneuma renders `browser` policies as a forward-auth `AuthorizationPolicy` (Envoy `ext_authz` to the Authentik embedded outpost) plus a native-claim authorization check for the declared groups/roles, and `api-jwt` policies as a `RequestAuthentication` + `AuthorizationPolicy` validating the bearer token audience. `public` routes and any declared `public_paths` are excluded from enforcement.

### End-to-End Validation

The `istio-test` workspace deploys a lightweight metadata service into each team's prefixed istio-test namespace (`pt-pneuma-istio-test`, `pt-kryptos-istio-test`, etc.). A validation script checks every global and zonal endpoint, confirming the returned cluster name matches the expected team and zone.

## Core Invariants

- mTLS is enforced on every cluster via `PeerAuthentication` in strict mode — no plaintext pod-to-pod traffic.
- The ingress gateway runs only on pneuma clusters — member clusters have no public endpoint.
- `HTTPRoute` hostnames are derived from the team's `dns_subdomain` — teams cannot serve traffic on another team's subdomain.
- Member namespace names carry the team-key prefix (`{team_key}-{namespace}`) — no cross-team endpoint aggregation in the mesh.

## Architecture Decision Records

### Single Gateway Owner with Fleet-Wide Mesh

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>July 2026</td><td>Pneuma</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Multiple GKE clusters must be reachable from the public internet without each team managing its own gateway, SSL certificate, WAF policy, and global load balancer. Duplicating that infrastructure per team adds cost and creates inconsistent security posture.

#### Decision

Only pneuma clusters run the ingress gateway (Gateway API `Gateway`, MCI global load balancer, Cloud Armor WAF, Datadog AAP). All external DNS — including member team subdomains — points to pneuma's gateway IPs. `HTTPRoute`s for all teams are rendered on pneuma's clusters and route traffic across the Fleet mesh to the correct member cluster.

Member clusters join the Fleet and run istiod for mTLS and sidecar injection. They have no public endpoint.

#### Alternatives Considered

- **Each team runs its own ingress gateway** — Rejected. Multiplies WAF policies, SSL certs, and load balancers per team; security posture diverges.
- **Shared ingress on a single cluster** — Rejected. Ties all traffic to one cluster's availability. MCI across a gateway cluster set achieves multi-zone resilience.

#### Consequences

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
