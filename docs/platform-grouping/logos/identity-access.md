---
sidebar_label: Identity & Access
---

# Identity & Access

Logos manages centralized identity and access control for the platform. Google Identity groups map team boundaries to GCP IAM, ensuring access is granted to groups rather than individuals.

- **Team identity groups**: Nine groups per team (admin, reader, writer × sandbox, non-production, production) bound directly to environment folders, enabling per-environment access control with membership managed as code
- **GKE security groups**: An organization-wide security group used for Kubernetes RBAC across all GKE clusters; team identity groups are nested as members
- **Billing users group**: An organization-wide group that grants the billing user IAM role, used by team service accounts that need to associate projects with the billing account

## Components

| Component | Description |
|---|---|
| `identity-group` | A Google Identity group scoped to a team, environment, and role (e.g., `pt-corpus-sandbox-administrators`) |
| `user` | A platform user provisioned into one or more identity groups |
| `iam-binding` | A mapping of an identity group to a GCP role on an environment folder |
