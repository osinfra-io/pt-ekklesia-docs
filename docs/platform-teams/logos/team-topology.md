---
sidebar_label: Team Topology
---

import SchemaViewer from '@site/src/components/SchemaViewer';
import logosTeamSchema from '@site/src/components/SchemaViewer/logosTeamSchema';

# Team Topology

Logos codifies the team structure that all platform tooling — GitHub, GCP, and Datadog — reflects. Every team, its repositories, and its observability scope are defined here and flow downstream.

- **GitHub teams**: Hierarchical parent/child teams with membership and repository access managed as code; four standard child teams (sandbox-approvers, non-production-approvers, production-approvers, repository-administrators) are created for every team
- **GitHub repositories**: Repositories are registered in pt-logos and provisioned with standard settings — squash-only merges, repository rulesets enforcing PR reviews and signed commits, Datadog webhooks, and standard repository files (release notes config, security policy)
- **Datadog teams**: Observability team structure mirrors GitHub teams; each team gets a service account with a per-team API key and app key stored as GitHub Actions secrets in that team's repositories

## Team Configuration Schema

Each team is defined as an entry in the `teams` map inside a `.tfvars` file under `teams/`. The schema below documents every available field — click any object or map to expand its properties.

<SchemaViewer schema={logosTeamSchema} title="teams.<team-key>" />

## Domain

| Entity | Description |
|---|---|
| `team` | A platform or stream-aligned team with a name, type, and member list |
| `github-team` | A GitHub team mirroring the Logos team — controls repo access |
| `repository` | A GitHub repository registered in Logos with standard settings and branch protection |
| `branch-protection` | Rules applied to default branch: required reviews, status checks, no force push |
| `datadog-team` | An observability team in Datadog mirroring the Logos team — owns dashboards and monitors |

