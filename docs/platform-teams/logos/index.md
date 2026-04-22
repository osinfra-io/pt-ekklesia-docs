---
sidebar_label: Logos
description: The foundational principle of order across systems, integrating multi-provider infrastructure, establishing boundaries, governance, and stable standards for teams to operate autonomously.
---

# Logos

Logos is the foundational principle of order across systems — integrating multi-provider infrastructure, establishing boundaries, governance, and stable standards for teams to operate autonomously. It is the platform's primordial principle from which all other structure emerges.

- **[Resource Hierarchy](./resource-hierarchy.md)**: GCP folder structure with environment-scoped folders for sandbox, non-production, and production
- **[Identity & Access](./identity-access.md)**: Google Identity groups and centralized user management
- **[Team Topology](./team-topology.md)**: GitHub teams and repositories, Datadog teams, and branch protection
- **[SaaS Governance](./saas-governance.md)**: GitHub and Datadog organization-level settings and policies

Corpus depends directly on Logos outputs. All other infrastructure bounded contexts consume Logos data transitively via the [Arche Shared Kernel](/platform-teams/arche).

## Repositories

- **[pt-logos](https://github.com/osinfra-io/pt-logos)**: OpenTofu configuration for GCP folder hierarchy, Google Identity groups, GitHub teams and repositories, and Datadog teams

### AI Context

- **[pt-ai-context](https://github.com/osinfra-io/pt-ai-context)**: Platform-level Copilot instructions applying universally to all `pt-*` repositories
- **[pt-logos-ai-context](https://github.com/osinfra-io/pt-logos-ai-context)**: Team-level Copilot instructions for `pt-logos-*` repositories

## Bounded Context

Logos is the upstream **Customer/Supplier** to Corpus in the platform's [context map](/platform-teams#context-map).

### Ubiquitous Language

| Term | Meaning in this context |
|---|---|
| Branch protection | A GitHub policy enforcing review and status check requirements on a repository |
| Environment | A GCP folder scoping a deployment tier (sandbox, non-production, production) — for the canonical definition see [Arche Ubiquitous Language](/platform-teams/arche#ubiquitous-language) |
| Folder | A GCP resource container that scopes IAM and billing within an environment |
| Identity group | A Google Workspace group that grants role-based access to GCP resources |
| Membership | The assignment of a user to an identity group or GitHub team |
| Organization | The top-level GCP and GitHub entity that owns all platform resources |
| Repository | A GitHub repository registered to a team and managed as code in Logos |
| Team | A bounded ownership unit — one GitHub team, one GCP folder, one Datadog team, provisioned together from a single definition |

### Downstream Interfaces

| Output | Consumed By | Via | Description |
|---|---|---|---|
| `environment_folder_id` | Corpus | `module.core_helpers` | Places projects in the correct environment folder |
| `teams` | Corpus | `module.core_helpers.teams` | Team data map — project names, folder IDs, and group emails |

### Core Invariant

Every team definition produces exactly one set of GCP, GitHub, and Datadog resources.

### Cognitive Load

Logos spans four domains across three SaaS providers — all driven from a single OpenTofu configuration. The cross-provider synchronization (GitHub + GCP + Datadog from one tfvars change) is the primary source of inherent complexity.

| Working Domains | High Intrinsic Domains |
|---|---|
| 🟠 4 / 4 | 🟢 0 / 3 |

Cognitive load by domain:

| Domain | Intrinsic | Extraneous Reduced By | Germane Expertise |
|---|---|---|---|
| Resource Hierarchy | 🟡 Medium | IaC, no manual ops | GCP org & folder design |
| Identity & Access | 🟡 Medium | IaC, no manual ops | Identity federation |
| Team Topology | 🟡 Medium | One tfvars → three providers | Cross-provider team modeling |
| SaaS Governance | 🟢 Low | Stable config, rarely changes | Org compliance policy |

**Capacity**: 0 high-complexity domains (Team Topologies guideline: 2–3); team members hold 4 active domains — at the ~4 working-knowledge limit.

**Extraneous load is minimized by:**

- Everything is code — no manual GCP console, GitHub UI, or Datadog UI operations
- A single tfvars edit propagates to all three providers in one deployment
- Pre-commit hooks enforce format and validate before any change reaches CI

**Germane load is built through:**

- Multi-provider governance patterns and how org-wide policy propagates downstream
- Domain-Driven Design: modeling teams as bounded contexts with explicit ownership boundaries
- Reasoning about how changes in Logos ripple through Corpus and Pneuma

### Team Capacity

| | |
|---|---|
| **Headcount** | 1 domain engineer |
| **Day-to-day work** | New team onboarding, user membership changes, governance policy updates across GitHub, GCP, and Datadog |
| **Scale signal** | Stable — organizational structure is established; workload is routine maintenance |
