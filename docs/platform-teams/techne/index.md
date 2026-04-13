---
sidebar_label: Techne
description: The practiced art of making — the disciplined craft through which raw materials of infrastructure are shaped into purposeful, refined platform instruments.
---

# Techne

Techne is the practiced art of making — the disciplined craft through which raw materials of infrastructure are shaped into purposeful, refined platform instruments.

Techne operates as an inner-source shared kernel: versioned GitHub Actions called workflows, pre-commit hooks, and developer tooling published on GitHub and consumed by every platform repo as pinned dependencies. See the [shared kernel ADR](#techne-as-an-inner-source-shared-kernel) for the rationale.

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Architecture Decision Records

### Techne as an Inner-Source Shared Kernel

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>April 2026</td><td>Techne</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Every platform repository needs the same foundational tooling: consistent OpenTofu deployment pipelines (OIDC auth, KMS-encrypted state, job summaries), pre-commit validation hooks, and a standardized developer environment. Without a shared approach, each repo would implement these independently, leading to drift and duplicated maintenance across dozens of repositories.

This follows the same pattern as [Arche's shared kernel](/platform-teams/arche#arche-as-an-inner-source-shared-kernel) and [Ekklesia's shared kernel](/platform-teams/ekklesia#ekklesia-as-an-inner-source-shared-kernel) — the difference is artifact type. Arche shares OpenTofu modules; Techne shares GitHub Actions called workflows, pre-commit hooks, and Codespace configuration; Ekklesia shares documentation.

#### Decision

Organize all shared platform tooling as an inner-source shared kernel under the `pt-techne-*` namespace. Each repository is:

- A standalone GitHub repository with its own versioning and release pipeline
- Consumed by callers via pinned references (commit SHAs for actions, tagged versions for hooks)
- Owned by the Techne team and open for contribution from any platform team

The scope of consumers is broader than Arche — every platform repository uses Techne tooling, not just the three infrastructure domains.

#### Consequences

- Deployment pipeline improvements (new inputs, job summary changes) propagate to all consumers on their next workflow ref bump
- Pre-commit hook fixes apply uniformly across all repos on the next `.pre-commit-config.yaml` update
- The Techne team owns the upgrade path when called workflow interfaces change

## Repositories

- **[Deployment Automation](./deployment-automation.md)**: Reusable GitHub Actions workflows for OpenTofu deployments and common repository tasks
- **[Developer Experience](./developer-experience.md)**: Codespace, pre-commit hooks, and local development setup

### AI Context

- **[pt-techne-ai-context](https://github.com/osinfra-io/pt-techne-ai-context)**: Team-level Copilot instructions for `pt-techne-*` repositories
