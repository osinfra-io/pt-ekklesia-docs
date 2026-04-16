---
sidebar_label: Core Helpers
---

# Core Helpers

[`pt-arche-core-helpers`](https://github.com/osinfra-io/pt-arche-core-helpers) is the foundational dependency that every `pt-arche-*` module builds on. It solves a problem every module in the platform has: knowing *where* and *for whom* it is deploying, and labeling everything consistently.

Without it, every module would need to independently parse the OpenTofu workspace name, compute environment labels, read Logos remote state, and validate cost center and data classification. Core helpers does all of that once, in one place.

## Domain-Driven Design

In DDD terms, `pt-arche-core-helpers` is the platform's **Anti-Corruption Layer (ACL)**. It stands between raw OpenTofu workspace state and every module that needs deployment context. All environment strings, labels, team data, and folder IDs flow through it — no module accesses these values independently. This boundary prevents environment-specific logic from leaking into module implementations and ensures that adding a new environment or team requires no changes outside Logos and core-helpers.

## Two variants

The module ships two variants consumed via different source paths:

| Variant | Source path | Used by |
|---|---|---|
| **Child** | `//child` | All `pt-arche-*` child modules |
| **Root** | `//` (root) | Root modules in Logos, Corpus, Pneuma |

The child variant provides only workspace parsing (no GCP provider required). The root variant adds standard labels and Logos remote state integration.

## Workspace name parsing

The workspace name is the sole source of deployment context. Core helpers parses it with a regex to extract environment, region, and zone — no variables, no hardcoding.

| Workspace name | environment | region | zone |
|---|---|---|---|
| `main-production` | `production` | `null` | `null` |
| `us-east1-non-production` | `non-production` | `us-east1` | `null` |
| `us-east1-b-sandbox` | `sandbox` | `us-east1` | `b` |
| `us-east1-b-cert-manager-sandbox` | `sandbox` | `us-east1` | `b` |

When running in the `default` workspace (module tests using mock providers), all values return mock strings so tests do not require real infrastructure.

## Standard labels

The root variant builds a standard label map applied to every GCP resource across the platform:

```hcl
labels = {
  cost-center         = "x1234"
  data-classification = "internal"
  env                 = "prod"
  region              = "us-east1"
  repository          = "pt-corpus"
  team                = "pt-corpus"
  zone                = "us-east1-b"  # null when not a zonal deployment
}
```

These labels power Datadog's unified service tagging (`env`, `team`), GCP cost attribution by team and cost center, and data governance reporting by classification.

## Logos integration

When `logos_workspaces` is provided, the root variant reads Logos remote state from GCS and aggregates team data across all specified workspaces. This gives every root module access to the full platform team registry without independently querying Logos.

Consumed outputs include the GCP environment folder ID for the current team (used when creating projects) and the project naming prefix derived from the team type (`pt`, `st`, `ct`, `et`).

## Outputs reference

| Output | Variant | Description |
|---|---|---|
| `env` | both | Short environment: `sb`, `nonprod`, `prod` |
| `environment` | both | Full environment: `sandbox`, `non-production`, `production` |
| `region` | both | Deployment region, e.g. `us-east1` |
| `zone` | both | Deployment zone, e.g. `b`; `null` for regional workspaces |
| `labels` | root | Standard label map for all GCP resources |
| `team` | root | Team identifier, e.g. `pt-corpus` |
| `team_prefix` | root | Team type prefix: `pt`, `st`, `ct`, `et` |
| `environment_folder_id` | root | GCP folder ID for the current team and environment from Logos state |
| `project_naming` | root | Struct with `prefix` and `description` for project creation |
| `teams` | root | Full map of all team data aggregated from Logos workspaces |
