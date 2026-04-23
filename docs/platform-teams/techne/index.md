---
sidebar_label: Techne
description: The practiced art of making — the disciplined craft through which raw materials of infrastructure are shaped into purposeful, refined platform instruments.
---

# Techne

Techne is the practiced art of making — the disciplined craft through which raw materials of infrastructure are shaped into purposeful, refined platform instruments.

Techne operates as the platform's shared kernel tooling layer: versioned GitHub Actions called workflows, pre-commit hooks, and developer tooling published on GitHub and consumed by platform and stream-aligned repositories as pinned dependencies. Any team can contribute improvements — changes to shared interfaces are coordinated with consumers. See the [shared kernel ADR](#techne-as-a-shared-kernel-platform-tooling-layer) for the rationale.

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Repositories

- **[pt-techne-opentofu-workflows](https://github.com/osinfra-io/pt-techne-opentofu-workflows)**: Reusable GitHub Actions called workflows for OpenTofu deployments — see [Deployment Automation](./deployment-automation.md)
- **[pt-techne-misc-workflows](https://github.com/osinfra-io/pt-techne-misc-workflows)**: Reusable GitHub Actions called workflows for common repository tasks
- **[pt-techne-pre-commit-hooks](https://github.com/osinfra-io/pt-techne-pre-commit-hooks)**: Pre-commit hooks for IaC validation and formatting — see [Developer Experience](./developer-experience.md)
- **[pt-techne-opentofu-codespace](https://github.com/osinfra-io/pt-techne-opentofu-codespace)**: GitHub Codespace configuration for standardized OpenTofu development environments
- **[pt-techne-development-setup](https://github.com/osinfra-io/pt-techne-development-setup)**: Local development setup and tooling configuration

### AI Context

- **[pt-techne-ai-context](https://github.com/osinfra-io/pt-techne-ai-context)**: Team-level Copilot instructions for `pt-techne-*` repositories

## Bounded Context

Techne operates using a **Shared Kernel** pattern in the [context map](/platform-teams#context-map) — all teams share its workflows, hooks, and tooling as a jointly maintained foundation. Unlike a pure Conformist, interface changes are coordinated with consumers, and any team can contribute improvements via pull request. The Platform Lead holds final approval authority on interface changes due to the blast radius across all consumers.

### Ubiquitous Language

| Term | Meaning in this context |
|---|---|
| Codespace | A GitHub-hosted development environment defined in `pt-techne-opentofu-codespace` |
| OIDC | OpenID Connect — the token-based authentication protocol that eliminates static credentials from CI |
| Pre-commit hook | A script in `pt-techne-pre-commit-hooks` that runs automatically before every git commit |
| Workflow | A GitHub Actions called workflow in `pt-techne-opentofu-workflows` consumed via `workflow_call` |

### Bounded Contexts

| Bounded Context | Artifacts | Consumed By |
|---|---|---|
| [Deployment Automation](./deployment-automation.md) | Called workflows, OIDC auth, state config, job summaries | All platform teams |
| [Developer Experience](./developer-experience.md) | Codespace, pre-commit hooks, development setup | All platform and stream-aligned teams |

### Core Invariant

All deployments use short-lived OIDC tokens — no static credentials exist anywhere on the platform.

## Team Topologies

### Cognitive Load

Techne's domains are medium and low complexity individually — the craft is in designing tooling that reliably reduces extraneous load for every other team on the platform. A bug in a Techne called workflow or hook can affect all consumers simultaneously.

| Working Domains | High Intrinsic Domains |
|---|---|
| 🟢 2 / 4 | 🟢 0 / 3 |

Cognitive load by domain:

| Domain | Intrinsic | Extraneous Reduced By | Germane Expertise |
|---|---|---|---|
| Deployment Automation | 🟡 Medium | Reusable called workflows | GitHub Actions, OIDC patterns |
| Developer Experience | 🟢 Low | Pre-commit automation | DevX & productivity design |

**Capacity**: 0 high-complexity domains (Team Topologies guideline: 2–3); team members hold 2 active domains — well within the ~4 working-knowledge limit.

**Extraneous load is minimized by:**

- Reusable called workflows mean no platform team implements its own deployment pipeline
- Pre-commit hooks enforce standards automatically across all repos on every commit
- OIDC authentication eliminates static credentials entirely — no rotation burden on any team

**Germane load is built through:**

- GitHub Actions ecosystem: called workflow design, input/output contracts, and backward compatibility
- CI/CD security patterns: OIDC federation, least-privilege service accounts, and short-lived tokens
- Developer productivity: understanding what friction platform and stream-aligned engineers actually encounter and systematically removing it

### Team Capacity

| | |
|---|---|
| **Headcount** | Inner source — no dedicated engineer |
| **Contribution model** | Any team can contribute improvements; the Platform Lead holds final approval on interface changes due to blast radius across all consumers |
| **Scale signal** | Stable once built — the platform lead or a senior engineer handles occasional updates |

## Architecture Decision Records

### Techne as a Shared Kernel Platform Tooling Layer

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>April 2026</td><td>Techne</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Every platform repository needs consistent OpenTofu deployment pipelines (OIDC auth, KMS-encrypted state, job summaries) and pre-commit validation hooks. All repositories — platform and stream-aligned — benefit from a standardized developer environment and shared toolchain. Without a shared approach, each repository would implement these independently, leading to drift and duplicated maintenance.

This follows a similar inner-source contribution model to [Arche](/platform-teams/arche#arche-as-an-inner-source-shared-kernel) and [Ekklesia](/platform-teams/ekklesia#ekklesia-as-an-inner-source-shared-kernel) — the difference is artifact type. Arche shares OpenTofu modules as a Shared Kernel; Techne shares GitHub Actions called workflows, pre-commit hooks, and Codespace configuration as a Shared Kernel; Ekklesia shares documentation as a Shared Kernel.

#### Decision

Organize all shared tooling as a shared kernel layer under the `pt-techne-*` namespace. Each repository is:

- A standalone GitHub repository with its own versioning and release pipeline
- Consumed by callers via pinned references (commit SHAs for actions, tagged versions for hooks)
- Owned by the Techne team and open for contribution from any team

The scope of consumers is broader than Arche — Techne developer experience tooling (Codespace, pre-commit hooks, development setup) is consumed by all platform and stream-aligned teams, not just the infrastructure domains. Deployment automation is platform-team scoped.

#### Alternatives Considered

- **Inline workflows and hooks per repo** — Rejected. Each repo would implement its own deployment pipeline and validation hooks independently, leading to drift and security gaps that must be fixed in dozens of places.
- **A shared monorepo for all tooling** — Rejected. Couples unrelated tools (deployment workflows, pre-commit hooks, Codespace config) to the same release cycle. Independent repositories allow each tool to evolve and be versioned separately.

#### Consequences

- Deployment pipeline improvements (new inputs, job summary changes) propagate to all consumers on their next workflow ref bump
- Pre-commit hook fixes apply uniformly across all repos on the next `.pre-commit-config.yaml` update
- The Techne team owns the upgrade path when called workflow interfaces change
