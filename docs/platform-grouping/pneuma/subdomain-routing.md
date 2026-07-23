---
sidebar_label: Subdomain Routing
description: How teams route HTTP traffic under their own subdomain on the shared Istio Gateway.
---

# Subdomain Routing

Application teams expose services under their own subdomain — `<subdomain>.osinfra.io` (e.g. `ethos.osinfra.io` for st-ethos) — by declaring **route intent in their [pt-logos](../logos/index.md) team spec**, nested under the namespace. Pneuma renders each declared route as a Gateway API [`HTTPRoute`](https://gateway-api.sigs.k8s.io/api-types/httproute/) on its shared [`Gateway`](./service-mesh.md). The Platform Team owns the Gateway, TLS, WAF, and DNS; teams own their route intent through Logos.

Teams do **not** author `HTTPRoute` objects themselves. The shared Gateway lives on pneuma's gateway clusters, Istio multi-cluster propagates only service endpoints (not Gateway API config), and teams have no RBAC on those clusters — so route intent must be declared centrally in Logos and rendered by pneuma onto the gateway clusters.

Subdomain ownership is enforced in the **IaC/GitOps layer**, not the runtime data plane. The shared Gateway carries a single catch-all HTTPS listener (no `hostname`, `allowedRoutes.namespaces.from: All`, wildcard TLS certificate); isolation rests on three properties that together bind a team to its own subdomain:

- **Route intent is PR-reviewed in Logos** — teams declare only `service`, `port`, and `path`; they never supply a hostname.
- **Hostnames are derived from team identity** — pneuma sets each rendered route's `hostnames` from the team's authoritative DNS zone (`dns_subdomain`), keyed by team, never from team free-text. A team cannot claim another team's host or the apex because it never names a host at all.
- **Only the pneuma pipeline applies manifests** — teams have no RBAC on the gateway clusters, so a team cannot create or edit an `HTTPRoute` directly.

Summary: **teams declare intent, the platform binds the hostname, and only the pipeline applies it.**

:::note

An earlier design used a per-team HTTPS listener whose `hostname` constrained the routes that could attach. That fails on GCP: the fronting global external Application Load Balancer does not forward client TLS SNI to backends, so concrete-hostname listeners return universal `502`s. See the [Team-Isolated Gateway Configuration Model ADR](./service-mesh.md#architecture-decision-records) for the full rationale.

:::

## Glossary

| Term | Meaning in this context |
|---|---|
| Catch-all listener | The single HTTPS listener on the shared `Gateway` (no `hostname`, `allowedRoutes.namespaces.from: All`, wildcard TLS cert) that terminates TLS for every team host. |
| `HTTPRoute` | The Kubernetes Gateway API resource pneuma **renders** from route intent, co-located with the backend `Service` in the team's namespace on the gateway cluster, attached to the shared `Gateway`. Pneuma sets its `hostnames` from the team's DNS zone. |
| Route intent | A `routes` entry in the team's Logos namespace spec (`service`, `port`, optional `path`). The team-facing declaration of what to expose. |
| Subdomain | The DNS label a team owns (`dns_subdomain` in the team's Logos spec); becomes the subdomain `<subdomain>.osinfra.io` and the hostname pneuma binds to the team's rendered routes. |

## Prerequisites

Everything below is provisioned by the platform from the team's Logos spec, not by the team:

- **The team is onboarded via [pt-logos](../logos/index.md) with `dns_subdomain` set** in its `kubernetes_engine` block (and owns at least one GKE location). This is the single source of truth for the subdomain — the hostname pneuma binds to every rendered route is derived from it.
- **The shared Gateway terminates TLS for the team's hosts** via its wildcard certificate — no per-team listener or certificate is required.

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
| `ethos.osinfra.io/api` from a route declared on the `api` namespace | ✅ Served — pneuma binds the `ethos` hostname to the rendered route |
| `us-east1.ethos.osinfra.io/api` (per-zone probe host) | ✅ Served — the zonal host is derived from the same subdomain |
| A team trying to claim `other-team.osinfra.io` | ❌ Impossible — teams never supply a hostname; pneuma binds only the team's own subdomain |
| `osinfra.io` (apex) | ❌ Impossible — the apex is not a team subdomain and is never bound |
| An `HTTPRoute` created directly on a gateway cluster | ❌ Cannot be applied — teams have no RBAC there; only the pneuma pipeline applies manifests |

## Troubleshooting

Route intent lives in Logos and the rendered `HTTPRoute` lives on pneuma's gateway clusters, so most checks are platform-side. If a route is not being served, work through these in order:

- **Confirm the route is declared** on a mesh-enabled namespace in the team's Logos spec, with the correct `service` and `port`. Routes on non-mesh namespaces are rejected by Logos validation.
- **Confirm `dns_subdomain` is set** for the team — the hostname pneuma binds to the route is derived from it.
- **Confirm the backend `Service` exists** in the namespace on the gateway cluster and listens on the declared `port`.
- **Inspect the rendered route** (Platform Team, on the gateway cluster) — `Accepted` and `ResolvedRefs` should both be `True`:

  ```bash
  kubectl get httproute -n st-ethos-api api-ethos -o yaml
  # → status.parents[].conditions
  ```

## Core invariant

A team can serve traffic **only** on its own `<subdomain>.osinfra.io` subdomain (and labels beneath it). It never supplies a hostname — pneuma derives every rendered route's hostname from the team's authoritative DNS zone, and only the pneuma pipeline applies manifests to the gateway clusters — so neither the apex nor another team's host is reachable, and the guarantee holds without any per-team action by the Platform Team.
