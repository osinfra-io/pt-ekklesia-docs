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

All downstream platform teams consume Logos data via [Arche](/platform-grouping/arche).

## Repositories

- **[pt-logos](https://github.com/osinfra-io/pt-logos)**: OpenTofu configuration for GCP folder hierarchy, Google Identity groups, GitHub teams and repositories, and Datadog teams

### AI Context

- **[pt-ai-context](https://github.com/osinfra-io/pt-ai-context)**: Platform-level Copilot instructions applying universally to all `pt-*` repositories
- **[pt-logos-ai-context](https://github.com/osinfra-io/pt-logos-ai-context)**: Team-level Copilot instructions for `pt-logos-*` repositories

## Scope

Logos feeds team and identity data into all downstream platform teams. See [team dependencies](/platform-grouping#team-dependencies).

### Glossary

| Term | Meaning in this context |
|---|---|
| Branch protection | A GitHub policy enforcing review and status check requirements on a repository |
| Environment (GCP) | A GCP folder scoping a deployment tier (sandbox, non-production, production) — for the canonical definition see the [Arche glossary](/platform-grouping/arche#glossary) |
| Environment (GitHub) | A GitHub Actions deployment environment attached to a repository, with reviewer teams and branch protection policies that gate workflow runs |
| Folder | A GCP resource container that scopes IAM and billing within an environment |
| Identity group | A Google Workspace group that grants role-based access to GCP resources |
| Membership | The assignment of a user to an identity group or GitHub team |
| Organization (Datadog) | The Datadog org that owns all monitors, teams, dashboards, and observability settings |
| Organization (GCP) | The top-level GCP resource container that owns all folders, projects, and IAM policies |
| Organization (GitHub) | The GitHub org that owns all repositories, teams, and Actions settings |
| Repository | A GitHub repository registered to a team and managed as code in Logos |
| Team | An ownership unit — one GitHub team, one GCP folder, one Datadog team, provisioned together from a single definition |

### Downstream Interfaces

| Output | Consumed By | Via | Description |
|---|---|---|---|
| `environment_folder_id` | Corpus | `module.core_helpers` | Places projects in the correct environment folder |
| `teams` | Corpus | `module.core_helpers.teams` | Team data map — project names, folder IDs, and group emails |

### Core Invariants

- Every team definition produces exactly one set of GCP, GitHub, and Datadog resources
- Every provisioned GitHub repository has signed commits required, linear history enforced, and PR review active — the branch ruleset is hardcoded with `enforcement = "active"` and no variable to disable it
- Organization administrators (Datadog and GitHub) are indestructible — `prevent_destroy = true` is set on both; no accidental removal is possible via OpenTofu
- Singleton organization-level resources (Datadog API keys, GitHub org settings, Google Groups) are only created in the `logos-production-main` workspace — preventing duplicates or conflicts across environments

## Team Topologies

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
- Called workflows provide OpenTofu deployment pipelines — no CI/CD to build or maintain

**Germane load is built through:**

- Multi-provider governance patterns and how org-wide policy propagates downstream
- Modeling teams with explicit ownership boundaries and dependency relationships
- Reasoning about how changes in Logos ripple through Corpus and Pneuma

### Team Capacity

| | |
|---|---|
| **Headcount** | 1 platform engineer |
| **Day-to-day work** | New team onboarding, user membership changes, governance policy updates across GitHub, GCP, and Datadog |
| **Scale signal** | Stable — organizational structure is established; workload is routine maintenance |
