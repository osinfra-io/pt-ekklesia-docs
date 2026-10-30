---
sidebar_label: Team Topology
---

import SchemaViewer from '@site/src/components/SchemaViewer';

# Team Topology

Logos codifies the team structure that all platform tooling — GitHub, GCP, and Datadog — reflects. Every team, its repositories, and its observability scope are defined here and flow downstream.

- **GitHub teams**: Hierarchical parent/child teams with membership and repository access managed as code; four standard child teams (sandbox-approvers, non-production-approvers, production-approvers, repository-administrators) are created for every team
- **GitHub repositories**: Repositories are registered in pt-logos and provisioned with standard settings — squash-only merges, repository rulesets enforcing PR reviews and signed commits, Datadog webhooks, and standard repository files (release notes config, security policy)
- **Datadog teams**: Observability team structure mirrors GitHub teams; every team has at least one Datadog team admin (ordinary members may be empty), and each team gets a service account with a per-team API key and app key stored as GitHub Actions secrets in that team's repositories

## Team Configuration Schema

Each team is defined as an entry in the `teams` map inside a `.tfvars` file under `teams/`. The schema below documents every available field — click any object or map to expand its properties.

<SchemaViewer title="teams.<team-key>" />

### authentik group declarations

`authentik_groups` declares team-owned application-access and OpenBao secret-access groups independently of ordinary team membership. Every team must declare OpenBao Secret Admins, Readers, and Writers. OpenBao admins must have at least one member in sandbox, non-production, and production; reader and writer memberships may be empty. Logos stores the contract; it does not connect to Authentik. Pneuma consumes the declarations through core helpers and owns runtime reconciliation.

Use a stable slug key and a human-readable application/role label. The group name is derived as `<team-key>: <label>`, for example **`pt-pneuma: agentgateway Admins`** or **`st-ethos: Reports Readers`**. Preserve application branding in the label. The `pt-`/`st-` prefix identifies the Team Topologies type.

```hcl
authentik_groups = {
  openbao-secret-admins = {
    description = "Manage secrets and versions within the st-example team prefix"
    label       = "OpenBao Secret Admins"

    members = {
      non-production = ["member@example.com"]
      production     = ["member@example.com"]
      sandbox        = ["member@example.com"]
    }
  }

  openbao-secret-readers = {
    description = "Read and list secrets within the st-example team prefix"
    label       = "OpenBao Secret Readers"
  }

  openbao-secret-writers = {
    description = "Create and update secrets within the st-example team prefix"
    label       = "OpenBao Secret Writers"
  }

  reports-admins = {
    description = "Access to the Reports administration UI"
    label       = "Reports Admins"
  }
}
```

Member emails are lowercase, unique within each environment, and explicit. An omitted environment has no members. Joining a team never implicitly grants application access. Labels must be unique within the owning team; changing a label requires updating matching route references, while the stable slug remains unchanged.

The `agentgateway-admins` and `authentik-admins` groups are Pneuma-only. `authentik-admins` grants Authentik-wide superuser permissions and must include `brett@osinfra.io` in every environment. Other Authentik application groups do not grant global Authentik administration.

#### Connecting a group to an application route

The group map defines membership, not routing. Within the application's namespace declaration, use the same key in `routes` and `route_auth_policies`, then reference the owning team's full group name:

```hcl
routes = {
  admin = {
    path    = "/app/admin"
    port    = 8080
    service = "my-app"
  }
}

route_auth_policies = {
  admin = {
    mode            = "browser"
    required_groups = ["st-example: Reports Admins"]
  }
}
```

This example requires an `authentik_groups` entry on `st-example` with the label `Reports Admins`. The stable group slug is not the route key: `admin` connects the policy to the route, while the full group name connects the policy to membership.

Pneuma derives the host from the owning team's gateway DNS zone and renders policies for the global and zonal hostnames. The route supplies the path prefix: `/app/admin` includes that path and its descendants, but not `/app/administrator`. After browser authentication, the managed-access guard checks that host and path against the current environment's declared membership. Naming a group after an application does not automatically attach it to any route.

The cloud consumer still rejects different browser group requirements on the same host. The local member/nonmember and existing-session revocation tests have passed, but cloud host-policy restrictions remain until the corresponding consumer changes are deployed and verified.

:::caution Runtime rollout

The declaration and reusable membership module do not by themselves enable new application routes. A consumer must use a released module implementing the contract. After Logos deployment, reconcile the selected environment through Pneuma's existing manually dispatched workflow and environment approvals; a merged Logos PR is not evidence that access has changed.

The current [browser policy limitations](../pneuma/gateway-authentication.md#browser-authorization) remain in force until request-level isolation and existing-session revocation are implemented and verified.

:::

## Components

| Component | Description |
|---|---|
| `team` | A platform or stream-aligned team with a name, type, and member list |
| `github-team` | A GitHub team mirroring the Logos team — controls repo access |
| `repository` | A GitHub repository registered in Logos with standard settings and branch protection |
| `branch-protection` | Rules applied to default branch: required reviews, status checks, no force push |
| `datadog-team` | An observability team in Datadog mirroring the Logos team — owns dashboards and monitors |

## Core Invariants

- Every team definition produces exactly one set of GCP, GitHub, and Datadog resources.
- Every GitHub parent team and standard or custom child team has at least one maintainer. Parent-team membership does not inherit into children, and parent maintainers cannot manage child-team membership unless they also maintain that child team.
- Every admin, reader, and writer Google Cloud Identity group has at least one owner in each environment. Teams with a Kubernetes cluster also configure Artifact Registry reader and writer groups, each with at least one owner.
- Every team has at least one Datadog team admin; ordinary Datadog members may be empty. Every team also has an OpenBao admins group with at least one member in each environment.
- Every provisioned GitHub repository has signed commits required, linear history enforced, and PR review active — the branch ruleset is hardcoded with `enforcement = "active"` and no variable to disable it.
