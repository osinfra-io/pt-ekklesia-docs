---
sidebar_label: Identity & Access
---

# Identity & Access

Logos manages centralized identity and access control for the platform. Google Identity groups map team boundaries to GCP IAM, ensuring access is granted to groups rather than individuals.

- **Team identity groups**: Admin, reader, and writer groups are created for each team in its current environment workspace and bound to that team's folder, enabling per-environment access control with membership managed as code
- **Corpus access groups**: Browser, project creator, and XPN administrator groups are bound to the environment folder so their permissions inherit to every team beneath it
- **GKE security groups**: An organization-wide security group used for Kubernetes RBAC across all GKE clusters; team identity groups are nested as members
- **Billing users group**: An organization-wide group that grants the billing user IAM role, used by team service accounts that need to associate projects with the billing account

The dedicated `pt-logos-global` workspace owns the shared billing-users, state-readers, and GKE security groups and publishes their identifiers through `organization_groups`. Environment workspaces own only their environment-specific groups; the Corpus team state alone owns the browser, project-creator, and XPN grants on its environment root. Moving an existing shared group to the global workspace requires an explicit state handoff, not a second apply against empty state. GitHub and Datadog retain their existing Production owners.

## Components

| Component | Description |
|---|---|
| `identity-group` | A Google Identity group scoped to a team, environment, and role (e.g., `pt-corpus-sandbox-administrators`) |
| `user` | A platform user provisioned into one or more identity groups |
| `iam-binding` | A mapping of a team identity group to a role on its team folder, or of a Corpus access group to a role on the environment folder |
