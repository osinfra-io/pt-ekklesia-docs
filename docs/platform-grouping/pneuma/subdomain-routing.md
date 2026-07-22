---
sidebar_label: Subdomain Routing
description: How teams route HTTP traffic under their own subdomain on the shared Istio Gateway.
---

# Subdomain Routing

Application teams expose services under their own subdomain — `<subdomain>.osinfra.io` (e.g. `ethos.osinfra.io` for st-ethos) — by declaring **route intent in their [pt-logos](../logos/index.md) team spec**, nested under the namespace. Pneuma renders each declared route as a Gateway API [`HTTPRoute`](https://gateway-api.sigs.k8s.io/api-types/httproute/) on its shared [`Gateway`](./service-mesh.md). The Platform Team owns the Gateway, TLS, WAF, DNS, and the per-team listeners; teams own their route intent through Logos.

Teams do **not** author `HTTPRoute` objects themselves. The shared Gateway lives on pneuma's gateway clusters, Istio multi-cluster propagates only service endpoints (not Gateway API config), and teams have no RBAC on those clusters — so route intent must be declared centrally in Logos and rendered by pneuma onto the gateway clusters.

Subdomain ownership is enforced **natively by the Gateway API** — there is no admission controller or policy engine in the path. The shared Gateway carries **a listener pair per team**, generated from Logos team data, and each listener pairs two mechanisms:

- **Listener `hostname`** — Gateway API intersects each attached route's `hostnames` with the listener hostname. Each team gets two listeners: an **apex** listener (`<subdomain>.osinfra.io`) and a **wildcard** listener (`*.<subdomain>.osinfra.io`) that covers labels below the subdomain (e.g. `us-east1.<subdomain>.osinfra.io`). A route claiming another team's host or the bare apex intersects to empty and is not served, so a team **cannot route out** of its subdomain.
- **`allowedRoutes.namespaces.from: Selector`** matching the `osinfra.io/route-prefix: <subdomain>` namespace label — only the owning team's labeled namespaces may attach to those listeners, so another team **cannot route into** your subdomain.

Summary: **hostname = you can't route out; label selector = others can't route in.**

## Glossary

| Term | Meaning in this context |
|---|---|
| Route intent | A `routes` entry in the team's Logos namespace spec (`service`, `port`, optional `path`). The team-facing declaration of what to expose. |
| `HTTPRoute` | The Kubernetes Gateway API resource pneuma **renders** from route intent, co-located with the backend `Service` in the team's namespace on the gateway cluster, attached to the shared `Gateway`. |
| Listener | A named entry on the shared `Gateway` for one team — an apex and a wildcard listener that combine the team's `hostname` with an `allowedRoutes` label selector. Platform-generated from Logos team data. |
| Subdomain | The DNS label a team owns (`dns_subdomain` in the team's Logos spec); becomes the subdomain `<subdomain>.osinfra.io` and the value of the `osinfra.io/route-prefix` namespace label. |

## Prerequisites

Everything below is provisioned by the platform from the team's Logos spec, not by the team:

- **The team is onboarded via [pt-logos](../logos/index.md) with `dns_subdomain` set** in its `kubernetes_engine` block (and owns at least one GKE location). This is the single source of truth for the subdomain — the route-prefix label and the Gateway listeners are both derived from it.
- **The team's namespaces carry the `osinfra.io/route-prefix` label** matching that subdomain (e.g. `st-ethos-api` is labeled `osinfra.io/route-prefix: ethos`). Namespace provisioning applies this automatically to mesh-enabled namespaces.
- **The shared Gateway has an apex and wildcard listener for the team's subdomain** — generated automatically from `dns_subdomain`.

## Declaring a route

Declare routes under the namespace in your Logos team spec. Routes may only be declared on **mesh-enabled** namespaces (`istio_injection = "enabled"`); a namespace off the mesh (e.g. `openbao`) cannot carry routes. Each route names the backend `service` and `port` in that namespace, and an optional `path` prefix (default `/`):

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

Pneuma renders this as an `HTTPRoute` in the `st-ethos-api` namespace on the gateway cluster, serving `ethos.osinfra.io/api` from the `api-service` Service:

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

Route changes take effect on the next pneuma pipeline run — no team deploy is involved.

## What's served vs not served

| Scenario | Result |
|---|---|
| `ethos.osinfra.io/api` from a route in the `st-ethos-api` namespace | ✅ Served — matches the apex listener |
| `us-east1.ethos.osinfra.io/api` (per-zone probe host) | ✅ Served — matches the wildcard listener |
| A route claiming `other-team.osinfra.io` | ❌ Not served — empty hostname intersection with the ethos listeners |
| `osinfra.io` (apex) | ❌ Not served — the bare apex is not a team subdomain |
| `*.osinfra.io` (platform-wide wildcard) | ❌ Not served — narrower than the team's own subdomain listeners |
| A route in a namespace without the `osinfra.io/route-prefix` label | ❌ Cannot attach — no listener's selector matches |

## Troubleshooting

Route intent lives in Logos and the rendered `HTTPRoute` lives on pneuma's gateway clusters, so most checks are platform-side. If a route is not being served, work through these in order:

- **Confirm the route is declared** on a mesh-enabled namespace in the team's Logos spec, with the correct `service` and `port`. Routes on non-mesh namespaces are rejected by Logos validation.
- **Confirm `dns_subdomain` is set** for the team — the listeners and the `osinfra.io/route-prefix` label are both derived from it.
- **Confirm the backend `Service` exists** in the namespace on the gateway cluster and listens on the declared `port`.
- **Inspect the rendered route** (Platform Team, on the gateway cluster) — `Accepted` and `ResolvedRefs` should both be `True`:

  ```bash
  kubectl get httproute -n st-ethos-api api-ethos -o yaml
  # → status.parents[].conditions
  ```

## Core invariant

A team can serve traffic **only** on its own `<subdomain>.osinfra.io` subdomain (and labels beneath it), and **only** from namespaces labeled with its `osinfra.io/route-prefix`. Neither the apex nor another team's host is reachable, and both guarantees hold without any per-team action by the Platform Team.
