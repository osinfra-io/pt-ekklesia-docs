---
sidebar_label: Ekklesia
description: The assembly of the called-out — where distinct capabilities are gathered into a unified body, deliberating and acting in concert toward shared platform purpose.
---

# Ekklesia

Ekklesia is the assembly of the called-out — where distinct capabilities are gathered into a unified body, deliberating and acting in concert toward shared platform purpose. This is that assembly.

Ekklesia operates as an inner-source shared kernel: a single centralized documentation site where every platform team contributes, rather than maintaining scattered per-repo READMEs or per-team wikis. See the [shared kernel ADR](#ekklesia-as-an-inner-source-shared-kernel) for the rationale.

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Architecture Decision Records

### Ekklesia as an Inner-Source Shared Kernel

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>April 2026</td><td>Ekklesia</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Platform knowledge — architecture decisions, module usage, deployment patterns, operational guides — is spread across multiple teams and repositories. Without a shared home, documentation lives in README files that are hard to navigate, per-team wikis that fall out of sync, or not at all. Engineers must hunt across repositories to understand how the platform fits together.

This follows the same pattern as [Arche's shared kernel](/platform-teams/arche#arche-as-an-inner-source-shared-kernel) and [Techne's shared kernel](/platform-teams/techne#techne-as-an-inner-source-shared-kernel) — the difference is artifact type. Arche shares OpenTofu modules; Techne shares GitHub Actions workflows and tooling; Ekklesia shares documentation.

#### Decision

Operate a single Docusaurus site (`pt-ekklesia-docs`) as the canonical platform documentation hub. All teams contribute their documentation here — architecture decisions, module references, operational guides — rather than maintaining it separately. The site is:

- Version-controlled alongside the code it documents
- Automatically built on pull requests and deployed to [docs.osinfra.io](https://docs.osinfra.io) on merge to `main`
- Open for contribution from any platform team via GitHub Flow

#### Consequences

- Platform knowledge has a single discoverable home for engineers and stakeholders
- Documentation changes go through the same review process as code
- All teams share responsibility for keeping their sections accurate — no single team owns the whole site

## Repositories

- **[Documentation](./documentation.md)**: Platform documentation site powered by Docusaurus, published at [docs.osinfra.io](https://docs.osinfra.io)
- **[pt-ekklesia-docs](https://github.com/osinfra-io/pt-ekklesia-docs)**: Platform documentation powered by Docusaurus and deployed via GitHub Pages

### AI Context

- **[pt-ekklesia-ai-context](https://github.com/osinfra-io/pt-ekklesia-ai-context)**: Team-level Copilot instructions for `pt-ekklesia-*` repositories
