---
sidebar_label: Service Mesh
---

# Service Mesh

Istio is deployed on every GKE cluster as part of a single multi-cluster mesh, providing mTLS between services, fine-grained traffic management, and an ingress gateway backed by Cloud Armor WAF protection. Ingress is expressed with the vendor-neutral [Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/) (`Gateway` and `HTTPRoute`). All clusters join a GKE Fleet, which enables cross-cluster endpoint discovery — pods on member team clusters are reachable from routes defined on pneuma clusters without any manual endpoint configuration.

- **mTLS**: All service-to-service traffic within the mesh is encrypted and authenticated automatically via istiod, which runs on every cluster
- **Traffic management**: Kubernetes Gateway API `HTTPRoute` resources and Istio `DestinationRule`s control routing, retries, and timeouts
- **Ingress gateway**: External traffic enters the mesh exclusively through pneuma's managed gateway. The gateway is a Gateway API `Gateway` reconciled by istiod, which automatically provisions the `gateway-istio` data plane (no Helm gateway release). It is backed by Cloud Armor WAF and Datadog AAP (Application and API Protection) deployed as an Envoy external processor for WAF and threat detection
- **cert-manager integration**: Istio's built-in CA is replaced by cert-manager via istio-csr, which issues and rotates all workload mTLS certificates across the entire mesh

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Components

| Component | Description |
|---|---|
| `istio-control-plane` | The Istio control plane (istiod) deployed via Helm on every cluster — manages traffic policy and mTLS certificate distribution |
| `gateway` | A Kubernetes Gateway API `Gateway` (gatewayClassName `istio`) deployed only on pneuma clusters. istiod reconciles it and auto-provisions the `gateway-istio` data plane; it is exposed via a GCP Multi-Cluster Ingress global load balancer and zonal load balancers |
| `waf-policy` | A Cloud Armor security policy attached to the ingress gateway (OWASP rules, rate limiting, adaptive DDoS) |
| `http-route` | A Kubernetes Gateway API `HTTPRoute` defining routing for a host — pneuma manages the shared istio-test routes; teams author their own routes into their namespaces |
| `destination-rule` | An Istio policy defining connection pool and circuit breaker settings for a destination |
| `peer-authentication` | A mesh-wide policy enforcing strict mTLS between all services |

## Multi-Cluster Mesh

All GKE clusters — both pneuma's own clusters and member team clusters (e.g., kryptos) — join a GKE Fleet and form a single Istio service mesh. Fleet membership enables cross-cluster endpoint discovery: a route defined on a pneuma cluster can send traffic to a pod running on a member team cluster with no additional configuration.

Each cluster runs its own istiod instance for local mTLS policy enforcement and sidecar injection. Clusters are not coupled at the control plane level — each istiod operates independently, and a control plane failure on one cluster does not affect workloads on another.

### Gateway and Member Cluster Roles

Clusters have one of two roles in the mesh:

| Role | Clusters | Responsibilities |
|---|---|---|
| **Gateway** | `pt-pneuma-*` | Runs the Gateway API `Gateway` and its auto-provisioned `gateway-istio` data plane, the MCI global load balancer, Cloud Armor WAF, Datadog AAP, the shared istio-test `HTTPRoute`s, and hosts teams' `HTTPRoute`s |
| **Member** | `pt-kryptos-*` (and future team clusters) | Runs istiod for mTLS and sidecar injection; no gateway — receives traffic forwarded from the gateway via the mesh |

### DNS and Ingress Routing

All external DNS for every team subdomain points to pneuma's gateway IPs — even for member team clusters:

| Record | Target |
|---|---|
| `{team}.{env}.osinfra.io` | Pneuma's MCI global IP (anycast, routes to lowest-latency zone) |
| `{zone}.{team}.{env}.osinfra.io` | Pneuma's zonal load balancer in that zone |

Traffic to `kryptos.sb.osinfra.io` enters pneuma's gateway, which matches the `HTTPRoute` for that host and forwards the request across the mesh to the kryptos cluster. The kryptos cluster has no public IP and no gateway.

### HTTPRoute Routing and Team Namespace Isolation

The shared istio-test `HTTPRoute`s — including those for member team hosts — are defined on pneuma's clusters in the `istio-ingress` namespace and attach to the shared `Gateway` via `parentRefs`. Unlike an Istio `VirtualService` (which routed to an arbitrary destination FQDN), a Gateway API `HTTPRoute` `backendRef` references a real `Service` object by name, namespace, and port.

Member team namespaces receive a team-key prefix when provisioned: a namespace declared as `openbao` in the kryptos team spec is created as `pt-kryptos-openbao` in the cluster. This prefix scopes the backend `Service` to that team's own clusters (e.g. `istio-test` in `pt-kryptos-istio-test`).

Because a `backendRef` must resolve to a `Service` that exists locally on the gateway cluster, pneuma creates a **selectorless stub `Service`** (and its namespace) on the gateway cluster for each peer team's istio-test backend. Fleet endpoint discovery fills that stub's endpoints from the owning team's clusters only — no pods with that service name exist on any other cluster — so traffic routes exclusively to the owning team without any explicit `DestinationRule` subset or locality filter. A `ReferenceGrant` in each backend namespace authorizes the `istio-ingress` `HTTPRoute` to reference the cross-namespace `Service`.

### Team-Authored Routes

Pneuma owns the shared ingress infrastructure — the `Gateway`, TLS, Cloud Armor WAF, and DNS — while teams own their route intent. A team exposes a service by authoring an `HTTPRoute` in its own namespace on the pneuma gateway cluster and attaching it to the shared `Gateway` via `parentRefs`. The `Gateway`'s `allowedRoutes` and a `ReferenceGrant` authorize the attachment, so teams change routing through their own pipelines without a pneuma deploy. In this phase the model is scaffolded and the istio-test routes are pneuma-managed; no team route is wired yet.

### End-to-End Validation

The `istio-test` workspace deploys a lightweight metadata service in each team's istio-test namespace (`istio-test` on pneuma, `pt-{team_key}-istio-test` on member clusters). A validation script checks every global and zonal endpoint and confirms the returned cluster name contains the expected team subdomain and zone, verifying that traffic routes to the correct cluster.

## Core Invariants

- mTLS is enforced on every cluster via `PeerAuthentication` in strict mode — no plaintext pod-to-pod traffic.
- The Istio ingress gateway runs only on pneuma clusters — no member team cluster accepts external traffic directly.
- Pneuma owns the shared `Gateway`, TLS, WAF, and DNS; teams own their own `HTTPRoute`s attached to that Gateway.
- Member team namespace names carry the team-key prefix (`{team_key}-{namespace}`) — no two teams can collide on a service DNS name within the mesh.

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

The platform runs multiple GKE clusters — one set owned by pneuma and additional sets owned by member teams (e.g., kryptos). All clusters must be reachable from the public internet without each team managing its own ingress gateway, SSL certificate, WAF policy, and global load balancer. Duplicating that infrastructure per team adds cost, operational overhead, and inconsistent security posture across teams.

#### Decision

Pneuma is the sole gateway owner. Only pneuma clusters run the ingress gateway (a Gateway API `Gateway` with its auto-provisioned `gateway-istio` data plane), MCI global load balancer, Cloud Armor WAF policy, and Datadog AAP external processor. All external DNS — including DNS for member team subdomains — points to pneuma's gateway IPs. The shared istio-test `HTTPRoute`s for all team hosts are defined centrally on pneuma's clusters and route traffic across the GKE Fleet mesh to the correct member cluster; teams may additionally author their own `HTTPRoute`s attached to the shared Gateway.

Member team clusters join the Fleet and run istiod for local mTLS and sidecar injection. They have no public endpoint of their own; they receive traffic exclusively via the cross-cluster mesh from pneuma's gateway.

#### Alternatives Considered

- **Each team runs its own ingress gateway** — Rejected. Multiplies WAF policies, SSL certificates, Cloud Armor configs, and MCI global addresses per team. Each team's pipeline would need to manage GCP load balancer infrastructure in addition to Kubernetes workloads, and security posture diverges over time.
- **Shared ingress namespace on a single cluster** — Rejected. Ties all external traffic to one cluster's availability. GKE Fleet MCI with a gateway-owning cluster set achieves multi-zone resilience without coupling availability to a single node.

#### Consequences

- All external TLS termination, WAF inspection, and threat detection happens at a single controlled point (pneuma gateway) for every team
- Adding a new team cluster requires only a Logos spec change — Corpus creates the team's DNS zone and pneuma provisions its shared istio-test routes and stub backends; no gateway or load balancer changes are needed
- Pneuma's gateway clusters are critical infrastructure — their availability determines the reachability of every team's workloads
- Pneuma owns the shared Gateway, TLS, WAF, and DNS; teams own their own `HTTPRoute`s attached to that Gateway

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

With all clusters in a single Fleet mesh, cross-cluster endpoint discovery means a route on a pneuma cluster can send traffic to any pod in any namespace on any cluster. If two teams deploy a service with the same name in the same namespace name (e.g., `istio-test/istio-test`), fleet discovery aggregates their endpoints and a route's backend becomes non-deterministic — it may route to either team's cluster depending on load and locality.

E2E validation requires that traffic to `kryptos.sb.osinfra.io` reaches only a kryptos cluster. Without namespace isolation, a backend `Service` named `istio-test` in namespace `istio-test` would resolve to endpoints on all clusters in the mesh.

#### Decision

All member team namespaces are provisioned with a team-key prefix: a namespace declared as `{name}` in the team spec is created as `{team_key}-{name}` in the cluster (e.g., `pt-kryptos-openbao`, `pt-kryptos-istio-test`). Pneuma's own namespaces are unchanged.

`HTTPRoute` `backendRef`s for member team services reference a `Service` in the prefixed namespace (e.g. `istio-test` in `pt-kryptos-istio-test`). Because a `backendRef` must resolve locally on the gateway cluster, pneuma creates a selectorless stub `Service` there for each peer team; fleet endpoint discovery only returns pods from the owning team's clusters, so cluster-level isolation is achieved through naming — no explicit `DestinationRule` subset or locality filter is needed.

#### Alternatives Considered

- **Explicit DestinationRule subsets with cluster labels** — Rejected. Requires a DestinationRule per team per service, plus consistent cluster labels across the fleet. More configuration surface area that must be kept in sync with team topology changes.
- **Locality failover rules** — Rejected. Locality load balancing routes by proximity to the gateway, not by cluster ownership. It cannot guarantee traffic stays within a specific team's cluster when teams have clusters in the same zone.
- **Separate gateways per team with different selectors** — Rejected. Requires each team to run its own gateway, which contradicts the single-gateway-owner decision.

#### Consequences

- Each team's namespace DNS is globally unique in the mesh — no cross-team endpoint aggregation is possible
- Namespace names visible to end users (in Logos team specs and Nomos) remain unprefixed; the prefix is a platform-internal implementation detail applied at provision time
- The `istio-test` E2E validation is reliable: `kryptos.sb.osinfra.io` provably reaches only kryptos clusters
- Any team accidentally including their own team-key prefix in a namespace name would produce a double-prefixed name — schema validation does not currently prevent this edge case

### Migration to the Kubernetes Gateway API

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>July 2026</td><td>Pneuma</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Ingress was expressed with proprietary Istio `Gateway` and `VirtualService` resources, and the gateway data plane was a Helm-managed deployment. Exposing or changing a route required a pneuma pull request and deploy, so teams could not own their own route intent. The routing API was also Istio-specific rather than vendor-neutral.

#### Decision

Migrate north-south ingress to the vendor-neutral Kubernetes Gateway API. Pneuma owns a shared `Gateway` (gatewayClassName `istio`) plus TLS, Cloud Armor WAF, and DNS; istiod reconciles the `Gateway` and automatically provisions the `gateway-istio` data plane, so the Helm gateway release is dropped. Data-plane customization moves to an `infrastructure.parametersRef` ConfigMap. Routing moves from `VirtualService` to `HTTPRoute`: pneuma keeps the shared istio-test routes, and teams author their own `HTTPRoute`s in their namespaces, attaching to the shared Gateway via `allowedRoutes` and a `ReferenceGrant`. Cross-cluster backends resolve through selectorless stub `Service`s on the gateway cluster, with endpoints filled by Istio multicluster discovery.

#### Alternatives Considered

- **Keep Istio `VirtualService`/`Gateway`** — Rejected. Locks routing to an Istio-specific API and keeps all route changes gated behind pneuma pull requests, preventing team-owned route intent.
- **Manual (self-managed) gateway data plane** — Rejected. The gateway Helm chart is not Gateway-API-aware (it only runs Envoy pods), so keeping it would mean hand-maintaining native gateway manifests. Automated provisioning by istiod is less code and idiomatic to the Gateway API.

#### Consequences

- Routing is expressed in a vendor-neutral API; teams own their `HTTPRoute`s without a pneuma deploy
- The data plane is Istio-owned and tracks istiod, removing the Helm gateway release and its values
- GCP load balancer objects, policies, and selectors repoint to the generated `gateway-istio` service, label, and ServiceAccount
- Cross-cluster `HTTPRoute` backends require a local `Service` object, so pneuma maintains selectorless stub `Service`s on the gateway cluster for peer teams

#### Links

- [Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/)
- [Istio Kubernetes Gateway API support](https://istio.io/latest/docs/tasks/traffic-management/ingress/gateway-api/)
- [GKE Gateway API](https://cloud.google.com/kubernetes-engine/docs/concepts/gateway-api)
