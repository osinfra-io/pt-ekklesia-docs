---
sidebar_label: Techne
description: The practiced art of making — the disciplined craft through which raw materials of infrastructure are shaped into purposeful, refined platform instruments.
---

# Techne

Techne is the practiced art of making — the disciplined craft through which raw materials of infrastructure are shaped into purposeful, refined platform instruments.

Techne operates as the platform's conformist tooling layer: versioned GitHub Actions called workflows, pre-commit hooks, and developer tooling published on GitHub and consumed by every platform repo as pinned dependencies. See the [conformist tooling ADR](#techne-as-a-conformist-platform-tooling-layer) for the rationale.

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Domain

Techne operates using a **Conformist** pattern in the [context map](/platform-teams#context-map) — all platform teams adopt its workflows, hooks, and tooling as-is. There is no negotiation of interfaces.

**Ubiquitous Language:** workflow, job, OIDC, pre-commit hook, codespace, toolchain

### Bounded Contexts

| Bounded Context | Artifacts | Consumed By |
|---|---|---|
| [Deployment Automation](./deployment-automation.md) | Called workflows, OIDC auth, state config, job summaries | All platform teams |
| [Developer Experience](./developer-experience.md) | Codespace, pre-commit hooks, development setup | All platform teams |

### Core Invariant

All deployments use short-lived OIDC tokens — no static credentials exist anywhere on the platform.

## Repositories

- **[pt-techne-opentofu-workflows](https://github.com/osinfra-io/pt-techne-opentofu-workflows)**: Reusable GitHub Actions called workflows for OpenTofu deployments — see [Deployment Automation](./deployment-automation.md)
- **[pt-techne-misc-workflows](https://github.com/osinfra-io/pt-techne-misc-workflows)**: Reusable GitHub Actions called workflows for common repository tasks
- **[pt-techne-pre-commit-hooks](https://github.com/osinfra-io/pt-techne-pre-commit-hooks)**: Pre-commit hooks for IaC validation and formatting — see [Developer Experience](./developer-experience.md)
- **[pt-techne-opentofu-codespace](https://github.com/osinfra-io/pt-techne-opentofu-codespace)**: GitHub Codespace configuration for standardized OpenTofu development environments
- **[pt-techne-development-setup](https://github.com/osinfra-io/pt-techne-development-setup)**: Local development setup and tooling configuration

### AI Context

- **[pt-techne-ai-context](https://github.com/osinfra-io/pt-techne-ai-context)**: Team-level Copilot instructions for `pt-techne-*` repositories

## Architecture Decision Records

### Techne as a Conformist Platform Tooling Layer

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

This follows a similar inner-source contribution model to [Arche](/platform-teams/arche#arche-as-an-inner-source-shared-kernel) and [Ekklesia](/platform-teams/ekklesia#ekklesia-as-the-platforms-shared-knowledge-domain) — the difference is artifact type and domain relationship pattern. Arche shares OpenTofu modules as a Shared Kernel; Techne shares GitHub Actions called workflows, pre-commit hooks, and Codespace configuration as a Conformist; Ekklesia shares documentation as a Shared Knowledge Domain.

#### Decision

Organize all shared platform tooling as a conformist platform layer under the `pt-techne-*` namespace. Each repository is:

- A standalone GitHub repository with its own versioning and release pipeline
- Consumed by callers via pinned references (commit SHAs for actions, tagged versions for hooks)
- Owned by the Techne team and open for contribution from any platform team

The scope of consumers is broader than Arche — every platform repository uses Techne tooling, not just the three infrastructure domains.

#### Alternatives Considered

- **Inline workflows and hooks per repo** — Rejected. Each repo would implement its own deployment pipeline and validation hooks independently, leading to drift and security gaps that must be fixed in dozens of places.
- **A shared monorepo for all tooling** — Rejected. Couples unrelated tools (deployment workflows, pre-commit hooks, Codespace config) to the same release cycle. Independent repositories allow each tool to evolve and be versioned separately.

#### Consequences

- Deployment pipeline improvements (new inputs, job summary changes) propagate to all consumers on their next workflow ref bump
- Pre-commit hook fixes apply uniformly across all repos on the next `.pre-commit-config.yaml` update
- The Techne team owns the upgrade path when called workflow interfaces change
