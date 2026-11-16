---
sidebar_label: Resource Hierarchy
---

# Resource Hierarchy

Logos defines the GCP folder hierarchy that organizes all platform infrastructure. Environment-scoped folders establish the structural boundaries within which Corpus provisions projects and Pneuma runs workloads. Team-type folders inherit environment baselines, while team folders provide the scope for team-specific access and future exceptions.

- **GCP folder hierarchy**: `Organization → Environment → Team Type → Team → Projects`; each environment's `pt-logos` foundation workspace creates its environment and team-type folders before team workspaces run
- **Folder IAM**: Corpus service account groups receive browser, project creator, and XPN admin roles on the environment folder; team role groups receive admin, writer, and reader roles on their team folder
- **Billing budgets**: A monthly budget with threshold alerts is created per team folder
- **Folder IDs**: The environment root and each team's folder are exposed through Logos state and consumed downstream by Corpus via `module.core_helpers`

## Components

| Component | Description |
|---|---|
| `organization` | The GCP organization root — the top-level billing and IAM boundary |
| `environment-folder` | One folder per environment: `sandbox`, `non-production`, `production` |
| `team-type-folder` | One folder per Team Topologies type beneath each environment |
| `team-folder` | One folder per team beneath its environment's team-type folder |
| `folder-iam-policy` | IAM bindings applied at the folder level, inherited by all child projects |
