---
sidebar_label: Team Topology
---

# Team Topology

Logos codifies the team structure that all platform tooling — GitHub, GCP, and Datadog — reflects. Every team, its repositories, and its observability scope are defined here and flow downstream.

- **GitHub teams**: Hierarchical parent/child teams with membership and repository access managed as code; four standard child teams (sandbox-approvers, non-production-approvers, production-approvers, repository-administrators) are created for every team
- **GitHub repositories**: Repositories are registered in pt-logos and provisioned with standard settings — squash-only merges, repository rulesets enforcing PR reviews and signed commits, Datadog webhooks, and standard repository files (release notes config, security policy)
- **Datadog teams**: Observability team structure mirrors GitHub teams; each team gets a service account with a per-team API key and app key stored as GitHub Actions secrets in that team's repositories
