---
sidebar_label: Subdomain Routing
description: How teams self-serve HTTP routing under their own subdomain on the shared Istio Gateway.
---

# Subdomain Routing

Application teams expose services under their own subdomain — `<subdomain>.osinfra.io` (e.g. `ethos.osinfra.io` for st-ethos) — by authoring their own [`HTTPRoute`](https://gateway-api.sigs.k8s.io/api-types/httproute/) and attaching it to pneuma's shared [`Gateway`](./service-mesh.md). The Platform Team owns the Gateway, TLS, WAF, DNS, and the per-team listeners; teams own their route intent and change routing through their own pipelines without a pneuma deploy.

Subdomain ownership is enforced **natively by the Gateway API** — there is no admission controller or policy engine in the path. The shared Gateway carries **a listener pair per team**, generated from Logos team data, and each listener pairs two mechanisms:

- **Listener `hostname`** — Gateway API intersects each attached route's `hostnames` with the listener hostname. Each team gets two listeners: an **apex** listener (`<subdomain>.osinfra.io`) and a **wildcard** listener (`*.<subdomain>.osinfra.io`) that covers labels below the subdomain (e.g. `us-east1.<subdomain>.osinfra.io`). A route claiming another team's host or the bare apex intersects to empty and is not served, so a team **cannot route out** of its subdomain.
- **`allowedRoutes.namespaces.from: Selector`** matching the `osinfra.io/route-prefix: <subdomain>` namespace label — only the owning team's labeled namespaces may attach to those listeners, so another team **cannot route into** your subdomain.

Summary: **hostname = you can't route out; label selector = others can't route in.**

## Glossary

| Term | Meaning in this context |
|---|---|
| `HTTPRoute` | A Kubernetes Gateway API resource, authored by a team in its own namespace, that attaches to the shared `Gateway` and defines host and path routing to a backend `Service`. |
| Listener | A named entry on the shared `Gateway` for one team — an apex and a wildcard listener that combine the team's `hostname` with an `allowedRoutes` label selector. Platform-generated from Logos team data. |
| Subdomain | The DNS label a team owns (`dns_subdomain` in the team's Logos spec); becomes the subdomain `<subdomain>.osinfra.io` and the value of the `osinfra.io/route-prefix` namespace label. |

## Prerequisites

Before a team can attach routes, three things must already be in place — all provisioned by the platform from the team's Logos spec, not by the team:

- **The team is onboarded via [pt-logos](../logos/index.md) with `dns_subdomain` set** in its `kubernetes_engine` block (and owns at least one GKE location). This is the single source of truth for the subdomain — the route-prefix label and the Gateway listeners are both derived from it.
- **The team's namespaces carry the `osinfra.io/route-prefix` label** matching that subdomain (e.g. `st-ethos-api` is labeled `osinfra.io/route-prefix: ethos`). Namespace provisioning applies this automatically.
- **The shared Gateway has an apex and wildcard listener for the team's subdomain** — generated automatically from `dns_subdomain`.

## Creating an HTTPRoute

Author the `HTTPRoute` in your own namespace and attach it to the shared `Gateway` in `istio-ingress` via `parentRefs`. The route's `hostnames` must fall within your subdomain.

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: api
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

## What's Served vs Not Served

| Scenario | Result |
|---|---|
| `ethos.osinfra.io` in the `st-ethos-api` namespace | ✅ Served — matches the apex listener |
| `us-east1.ethos.osinfra.io` in the `st-ethos-api` namespace | ✅ Served — matches the wildcard listener |
| `other-team.osinfra.io` in the `st-ethos-api` namespace | ❌ Not served — empty hostname intersection with the ethos listeners |
| `osinfra.io` (apex) | ❌ Not served — the bare apex is not a team subdomain |
| `*.osinfra.io` (platform-wide wildcard) | ❌ Not served — narrower than the team's own subdomain listeners |
| `HTTPRoute` in a namespace without the `osinfra.io/route-prefix` label | ❌ Cannot attach — no listener's selector matches |

## Troubleshooting

If a route is not being served, work through these checks in order:

- **Confirm the namespace label.** The namespace must carry `osinfra.io/route-prefix` matching your prefix; without it the route matches no listener selector.

  ```bash
  kubectl get ns st-ethos-api --show-labels
  ```

- **Check the route attached to a listener.** Inspect the route's status conditions — `Accepted` and `ResolvedRefs` should both be `True`.

  ```bash
  kubectl get httproute -n st-ethos-api api -o yaml
  # → status.parents[].conditions
  ```

- **Common causes of a route not being served:**
  - Missing or incorrect `osinfra.io/route-prefix` namespace label (route matches no listener).
  - `hostnames` outside the team's subdomain (empty intersection with the listener hostname).
  - Wrong `parentRefs` — must reference `gateway` in the `istio-ingress` namespace.

## Core Invariant

A team can serve traffic **only** on its own `<subdomain>.osinfra.io` subdomain (and labels beneath it), and **only** from namespaces labeled with its `osinfra.io/route-prefix`. Neither the apex nor another team's host is reachable, and both guarantees hold without any per-team action by the Platform Team.
