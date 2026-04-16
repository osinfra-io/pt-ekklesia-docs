---
sidebar_label: Resource Hierarchy
---

# Resource Hierarchy

Logos defines the GCP folder hierarchy that organizes all platform infrastructure. Environment-scoped folders establish the structural boundaries within which Corpus provisions projects and Pneuma runs workloads.

- **GCP folder hierarchy**: A two-level hierarchy under pre-existing team-type folders (Platform Teams, Stream-aligned Teams, etc.) — Logos creates a team folder for each team, then sandbox, non-production, and production environment folders beneath it
- **Folder IAM**: Corpus service account groups are granted browser, project creator, and XPN admin roles on environment folders, enabling Corpus to discover resources and create projects in the correct folder
- **Billing budgets**: A monthly budget with threshold alerts is created per team folder
- **Folder IDs**: Exposed as outputs and consumed downstream by Corpus via `module.core_helpers.environment_folder_id`

## Domain

| Entity | Description |
|---|---|
| `organization` | The GCP organization root — the top-level billing and IAM boundary |
| `environment-folder` | One folder per environment: `sandbox`, `non-production`, `production` |
| `folder-iam-policy` | IAM bindings applied at the folder level, inherited by all child projects |
