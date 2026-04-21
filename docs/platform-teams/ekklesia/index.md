---
sidebar_label: Ekklesia
description: The assembly of the called-out — where distinct capabilities are gathered into a unified body, deliberating and acting in concert toward shared platform purpose.
---

# Ekklesia

Ekklesia is the assembly of the called-out — where distinct capabilities are gathered into a unified body, deliberating and acting in concert toward shared platform purpose. This is that assembly.

Ekklesia operates as the platform's shared knowledge domain: a single centralized documentation site where any team member can contribute, rather than maintaining scattered per-repo READMEs or per-team wikis. See the [knowledge domain ADR](#ekklesia-as-the-platforms-shared-knowledge-domain) for the rationale.

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Repositories

- **[pt-ekklesia-docs](https://github.com/osinfra-io/pt-ekklesia-docs)**: Platform documentation site powered by Docusaurus, published at [docs.osinfra.io](https://docs.osinfra.io) — see [Documentation](./documentation.md)

### AI Context

- **[pt-ekklesia-ai-context](https://github.com/osinfra-io/pt-ekklesia-ai-context)**: Team-level Copilot instructions for `pt-ekklesia-*` repositories

## Domain

Ekklesia operates as the platform's **Shared Knowledge Domain** in the [context map](/platform-teams#context-map) — all teams contribute documentation here and consume it as the canonical reference for platform knowledge. Because documentation lives in version control and goes through the same PR process as code, it is subject to the same quality standards. Every team owns their section; Ekklesia owns the structure and tooling that makes contribution frictionless.

### Ubiquitous Language

| Term | Meaning in this domain |
|---|---|
| Architecture decision record | A structured record of a significant design decision — context, decision, alternatives considered, and consequences |
| Contributor | Any team member who opens a PR to add or update documentation |
| Page | A Markdown file in `pt-ekklesia-docs` that renders as a documentation page in the Docusaurus site |
| Sidebar | The Docusaurus navigation tree defined in `sidebars.js` that organizes pages into sections |

### Downstream Interfaces

| Output | Consumed By | Via | Description |
|---|---|---|---|
| Documentation site | All teams and stakeholders | [docs.osinfra.io](https://docs.osinfra.io) | Canonical reference for platform architecture, module usage, deployment patterns, and operational guides |
| Architecture decision records | All teams | [docs.osinfra.io](https://docs.osinfra.io) | Structured records of design decisions that inform how teams build and operate on the platform |

### Cognitive Load

Ekklesia carries the lightest operational load of any platform team — its domain is documentation tooling, which is low inherent complexity. The real challenge is breadth of knowledge: contributing meaningfully to platform docs requires understanding every other team's domain.

| Working Domains | High Intrinsic Domains |
|---|---|
| 🟢 1 / 4 | 🟢 0 / 3 |

Cognitive load by domain:

| Domain | Intrinsic | Extraneous Reduced By | Germane Expertise |
|---|---|---|---|
| Documentation | 🟢 Low | Docusaurus + GitHub Pages | Technical writing, platform-wide context |

**Capacity**: 0 high-complexity domains (Team Topologies guideline: 2–3); team members hold 1 active domain — well within the ~4 working-knowledge limit.

**Extraneous load is minimized by:**

- Docusaurus and GitHub Pages handle all build and hosting automatically
- All teams contribute via standard GitHub Flow — no separate wiki system or access model
- Documentation lives in version control alongside the code it describes

**Germane load is built through:**

- Technical writing: structuring complex infrastructure concepts for different audiences
- Information architecture: organizing platform knowledge so engineers can find what they need quickly
- Platform-wide context: Ekklesia contributors develop a uniquely broad understanding of how all domains fit together

### Team Capacity

| | |
|---|---|
| **Headcount** | Inner source — no dedicated engineer |
| **Contribution model** | Every team updates their section as part of their own PRs; Ekklesia owns the site structure and tooling, not the content |
| **Scale signal** | No scaling expected — documentation is a distributed responsibility by design |

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
- Open for contribution from any team member via GitHub Flow

#### Alternatives Considered

- **Per-repo README files** — Rejected. Scattered across dozens of repositories; no single place to understand how the platform fits together. Engineers must know which repo to look in before they can find anything.
- **Per-team wikis (GitHub Wiki / Confluence)** — Rejected. Edited outside of Git, bypassing the PR review process. Content drifts from reality with no mechanism to catch it.

#### Consequences

- Platform knowledge has a single discoverable home for engineers and stakeholders
- Documentation changes go through the same review process as code
- All teams share responsibility for keeping their sections accurate — no single team owns the whole site
