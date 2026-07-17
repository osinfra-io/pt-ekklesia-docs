---
sidebar_label: Identity & Access
---

# Identity & Access

Logos manages centralized identity and access control for the platform. Google Identity groups map team boundaries to GCP IAM, ensuring access is granted to groups rather than individuals.

- **Team identity groups**: Nine groups per team (admin, reader, writer × sandbox, non-production, production) bound directly to environment folders, enabling per-environment access control with membership managed as code
- **GKE security groups**: An organization-wide security group used for Kubernetes RBAC across all GKE clusters; team identity groups are nested as members
- **Billing users group**: An organization-wide group that grants the billing user IAM role, used by team service accounts that need to associate projects with the billing account

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Components

| Component | Description |
|---|---|
| `identity-group` | A Google Identity group scoped to a team, environment, and role (e.g., `pt-corpus-sandbox-administrators`) |
| `user` | A platform user provisioned into one or more identity groups |
| `iam-binding` | A mapping of an identity group to a GCP role on an environment folder |

## Architecture Decision Records

### Per-environment Google Cloud Identity groups

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>July 2026</td><td>Platform Team</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Each team previously had three Google Cloud Identity groups (admin, reader, writer) bound to the team folder via IAM. Because GCP IAM inherits down the folder hierarchy, all three environment folders (sandbox, non-production, production) received identical access. There was no way to grant write access in sandbox or non-production while restricting production to read-only for a given user.

#### Decision

Replace the three team-folder groups with nine per-environment groups (3 roles × 3 environments), each bound directly to its corresponding environment folder. Group emails follow the pattern `{team-key}-{environment}-{role-plural}@osinfra.io` (e.g. `pt-arche-production-administrators@osinfra.io`). Membership for each role can now differ per environment, giving teams fine-grained access control without custom IAM policies.

#### Alternatives Considered

- **Keep team-folder binding, add environment-level deny policies** — deny policies are harder to reason about, audit, and manage as code; explicit group membership is clearer.
- **Project-level IAM** — projects are provisioned by Corpus, not Logos; binding at the environment folder is the correct layer for team-wide access and consistent with how Corpus already scopes its own service account groups.

#### Consequences

- Teams gain the ability to grant different access levels per environment (e.g. writer in sandbox, reader in production).
- Each team now has 9 identity groups instead of 3; existing 3-group configurations are destroyed and replaced on next apply.
- Membership must be specified per environment in `teams/*.tfvars` under `google_basic_groups_env_memberships`.
