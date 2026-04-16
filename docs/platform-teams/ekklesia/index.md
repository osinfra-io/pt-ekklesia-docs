---
sidebar_label: Ekklesia
description: The assembly of the called-out — where distinct capabilities are gathered into a unified body, deliberating and acting in concert toward shared platform purpose.
---

# Ekklesia

Ekklesia is the assembly of the called-out — where distinct capabilities are gathered into a unified body, deliberating and acting in concert toward shared platform purpose. This is that assembly.

Ekklesia operates as the platform's shared knowledge domain: a single centralized documentation site where every platform team contributes, rather than maintaining scattered per-repo READMEs or per-team wikis. See the [knowledge domain ADR](#ekklesia-as-the-platforms-shared-knowledge-domain) for the rationale.

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Repositories

- **[pt-ekklesia-docs](https://github.com/osinfra-io/pt-ekklesia-docs)**: Platform documentation site powered by Docusaurus, published at [docs.osinfra.io](https://docs.osinfra.io) — see [Documentation](./documentation.md)

### AI Context

- **[pt-ekklesia-ai-context](https://github.com/osinfra-io/pt-ekklesia-ai-context)**: Team-level Copilot instructions for `pt-ekklesia-*` repositories

## Domain

Ekklesia operates as the platform's **Shared Knowledge Domain** in the [context map](/platform-teams#context-map) — all teams contribute documentation here and consume it as the canonical reference for platform knowledge.

**Ubiquitous Language:** page, architecture decision record, sidebar, contributor

### Core Invariant

When platform behaviour changes, the relevant doc page is updated in the same PR.

## Architecture Decision Records

### Ekklesia as the Platform's Shared Knowledge Domain

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

This follows a similar inner-source contribution model to [Arche](/platform-teams/arche#arche-as-an-inner-source-shared-kernel) and [Techne](/platform-teams/techne#techne-as-a-conformist-platform-tooling-layer) — the difference is artifact type and domain relationship pattern. Arche shares OpenTofu modules as a Shared Kernel; Techne shares GitHub Actions workflows and tooling as a Conformist; Ekklesia shares documentation as a Shared Knowledge Domain.

#### Decision

Operate a single Docusaurus site (`pt-ekklesia-docs`) as the canonical platform documentation hub. All teams contribute their documentation here — architecture decisions, module references, operational guides — rather than maintaining it separately. The site is:

- Version-controlled alongside the code it documents
- Automatically built on pull requests and deployed to [docs.osinfra.io](https://docs.osinfra.io) on merge to `main`
- Open for contribution from any platform team via GitHub Flow

#### Alternatives Considered

- **Per-repo README files** — Rejected. Scattered across dozens of repositories; no single place to understand how the platform fits together. Engineers must know which repo to look in before they can find anything.
- **Per-team wikis (GitHub Wiki / Confluence)** — Rejected. Edited outside of Git, bypassing the PR review process. Content drifts from reality with no mechanism to catch it.

#### Consequences

- Platform knowledge has a single discoverable home for engineers and stakeholders
- Documentation changes go through the same review process as code
- All teams share responsibility for keeping their sections accurate — no single team owns the whole site
