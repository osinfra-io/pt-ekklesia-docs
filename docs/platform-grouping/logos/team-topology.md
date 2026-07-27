---
sidebar_label: Team Topology
---

import SchemaViewer from '@site/src/components/SchemaViewer';

# Team Topology

Logos codifies the team structure that all platform tooling — GitHub, GCP, and Datadog — reflects. Every team, its repositories, and its observability scope are defined here and flow downstream.

- **GitHub teams**: Hierarchical parent/child teams with membership and repository access managed as code; four standard child teams (sandbox-approvers, non-production-approvers, production-approvers, repository-administrators) are created for every team
- **GitHub repositories**: Repositories are registered in pt-logos and provisioned with standard settings — squash-only merges, repository rulesets enforcing PR reviews and signed commits, Datadog webhooks, and standard repository files (release notes config, security policy)
- **Datadog teams**: Observability team structure mirrors GitHub teams; each team gets a service account with a per-team API key and app key stored as GitHub Actions secrets in that team's repositories

## Team Configuration Schema

Each team is defined as an entry in the `teams` map inside a `.tfvars` file under `teams/`. The schema below documents every available field — click any object or map to expand its properties.

<SchemaViewer title="teams.<team-key>" />

## Components

| Component | Description |
|---|---|
| `team` | A platform or stream-aligned team with a name, type, and member list |
| `github-team` | A GitHub team mirroring the Logos team — controls repo access |
| `repository` | A GitHub repository registered in Logos with standard settings and branch protection |
| `branch-protection` | Rules applied to default branch: required reviews, status checks, no force push |
| `datadog-team` | An observability team in Datadog mirroring the Logos team — owns dashboards and monitors |

## Declaring Mesh Route Auth

Mesh-enabled Kubernetes namespaces can declare external route intent and route auth intent in the same Logos team spec. Logos is the source of truth; Pneuma consumes the resolved data through `module.core_helpers` and renders the Gateway API `HTTPRoute`, Istio `RequestAuthentication`, and Istio `AuthorizationPolicy` resources centrally. Teams should use the [Nomos Agent](/onboarding) to author these changes so the `pt-techne-mcp-server` schema validates the route and auth policy before a PR is opened.

`route_auth_policies` is a map keyed by an existing `routes` entry in the same namespace. Each policy supports:

- `enforced` — Optional boolean. Defaults to `true`, which means fail-closed gateway enforcement.
- `public_paths` — Optional list of path prefixes that bypass auth. Each path must be under the referenced route path and cannot be `/`.
- `required_groups` — Optional list of Keycloak groups accepted for the route.
- `required_roles` — Optional list of Keycloak realm roles accepted for the route.

Enforced policies must include at least one required group or role. Omit `route_auth_policies` only when the route is intentionally unauthenticated, or set `enforced = false` for an explicit public route.

### Example

```hcl
platform_managed_project = {
  kubernetes_engine = {
    dns_subdomain = "ethos"

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

        route_auth_policies = {
          "api" = {
            public_paths    = ["/api/healthz", "/api/readyz"]
            required_groups = ["st-ethos-developers"]
            required_roles  = ["ethos-api-reader"]
          }
        }
      }
    }
  }
}
```

This declaration lets unauthenticated callers reach only the health and readiness paths. All other requests under `/api` must arrive with a valid Keycloak-backed browser session cookie or bearer token and match one of the declared group or role claims.

### Ownership Boundaries

| Owner | Boundary |
|---|---|
| App teams | Declare route and auth intent in Logos; own the backend Service and application behavior. |
| Logos | Stores the reviewed contract for namespaces, routes, and `route_auth_policies`. |
| Pneuma | Renders and operates the gateway auth resources; RBAC and admission guardrails prevent teams from managing them directly. |
| Arche | Provides the reusable Keycloak and OAuth2 Proxy modules consumed by Pneuma. |
| Techne | Provides the schema and Nomos self-serve flow used to validate and submit team intent. |

## Core Invariants

- Every team definition produces exactly one set of GCP, GitHub, and Datadog resources.
- Every provisioned GitHub repository has signed commits required, linear history enforced, and PR review active — the branch ruleset is hardcoded with `enforcement = "active"` and no variable to disable it.
