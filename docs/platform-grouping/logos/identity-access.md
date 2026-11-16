---
sidebar_label: Identity & Access
---

# Identity & Access

Logos manages centralized identity and access control for the platform. Google Identity groups map team boundaries to GCP IAM, ensuring access is granted to groups rather than individuals.

- **Team identity groups**: Admin, reader, and writer groups are created for each team in its current environment workspace and bound to that team's folder, enabling per-environment access control with membership managed as code
- **Corpus access groups**: Browser, project creator, and XPN administrator groups are bound to the environment folder so their permissions inherit to every team beneath it
- **GKE security groups**: An organization-wide security group used for Kubernetes RBAC across all GKE clusters; team identity groups are nested as members
- **Billing users group**: An organization-wide group that grants the billing user IAM role, used by team service accounts that need to associate projects with the billing account

Shared billing-users, state-readers, and GKE security groups are externally created organization bootstrap prerequisites, not resources for the regular environment flow to create or adopt. Establish their IAM grants and initial membership-management delegation to stable environment runner identities once. Consumer stacks own separate member-specific resources, so routine membership changes need no organization bootstrap run. Never manage the same membership in both states. Environment workspaces own only their environment-specific groups; the Corpus team state alone owns the browser, project-creator, and XPN grants on its environment root. GitHub and Datadog retain their existing Production owners.

## Components

| Component | Description |
|---|---|
| `identity-group` | A Google Identity group scoped to a team, environment, and role (e.g., `pt-corpus-sandbox-administrators`) |
| `user` | A platform user provisioned into one or more identity groups |
| `iam-binding` | A mapping of a team identity group to a role on its team folder, or of a Corpus access group to a role on the environment folder |
