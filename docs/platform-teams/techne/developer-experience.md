---
sidebar_label: Developer Experience
---

# Developer Experience

Standardized tooling and environments that make developing and iterating on platform infrastructure consistent and reproducible.

- **[pt-techne-opentofu-codespace](https://github.com/osinfra-io/pt-techne-opentofu-codespace)**: A GitHub Codespace pre-configured with OpenTofu, pre-commit, and all platform tooling — ready to use without local setup
- **[pt-techne-pre-commit-hooks](https://github.com/osinfra-io/pt-techne-pre-commit-hooks)**: Custom pre-commit hooks written in Go that enforce IaC formatting (`tofu fmt`), configuration validation (`tofu validate`), and automated testing (`tofu test`) before every commit
- **[pt-techne-development-setup](https://github.com/osinfra-io/pt-techne-development-setup)**: Local development environment setup for engineers who prefer working outside of Codespaces

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Domain-Driven Design

| Entity | Description |
|---|---|
| `codespace` | A GitHub Codespace pre-configured with OpenTofu, pre-commit, gcloud, kubectl, and all platform tooling |
| `pre-commit-config` | A `.pre-commit-config.yaml` file pinned to specific hook versions — enforces `tofu fmt`, `tofu validate`, `tofu test`, YAML lint, and trailing whitespace |
| `pre-commit-hook` | A custom hook (written in Go) implementing platform-specific IaC checks beyond what stock hooks provide |
| `development-setup` | A local setup guide and script for engineers preferring native tooling over Codespaces |

**Key rule:** `pre-commit run -a` must pass before any commit. The CI pipeline enforces the same checks — local and CI are identical environments.

## Architecture Decision Records

### GitHub Codespace as the Standard Development Environment

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>April 2026</td><td>Techne</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Platform engineers need OpenTofu, gcloud, kubectl, pre-commit, and a set of custom hooks available in a consistent, reproducible environment. Without a standardized environment, engineers spend time debugging toolchain differences rather than building infrastructure. Version mismatches between local tools and CI are a common source of failures that are hard to diagnose.

The platform has a small team (1-2 engineers). Onboarding time is a meaningful cost. Any new engineer should be productive within hours, not days.

#### Decision

Provide a GitHub Codespace (`pt-techne-opentofu-codespace`) as the primary development environment, pre-configured with the full platform toolchain. The Codespace is defined as code, version-controlled, and updated alongside the platform.

A local setup guide (`pt-techne-development-setup`) is maintained for engineers who prefer native tooling, but the Codespace is the supported default. Pre-commit hooks (`pt-techne-pre-commit-hooks`) enforce the same checks locally and in CI — the environment a developer uses does not change what passes or fails.

#### Alternatives Considered

- **Document required tools and let engineers install them manually** — Rejected. Leads to version drift across machines and between local and CI. Debugging environment-specific failures is expensive and opaque.
- **Self-hosted runner with a fixed Docker image** — Rejected. Adds infrastructure to manage and does not improve the local development experience. The Codespace serves both purposes.
- **Devcontainer without Codespace (local Docker only)** — Rejected. Requires Docker to be running locally and adds setup steps. The Codespace works immediately from any browser or VS Code instance without local Docker.

#### Consequences

- New engineers are productive within hours of repository access
- Local and CI environments enforce identical pre-commit checks — no environment-specific failures
- Toolchain updates are applied once in the Codespace definition and inherited by all engineers on next rebuild
- Engineers on restricted machines (no local Docker, managed endpoints) can still contribute via browser-based Codespace
