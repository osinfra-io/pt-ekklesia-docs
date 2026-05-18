# pt-ekklesia-docs

Platform documentation site built with [Docusaurus](https://docusaurus.io) and deployed via GitHub Pages.

## Markdown Lint

In addition to the platform-wide disabled rules (`MD013`, `MD033`, `MD045`), this Docusaurus site also disables:

| Rule | Reason |
| --- | --- |
| `MD041` (first line should be a top-level heading) | Pages start with YAML front matter, not a heading |
| `MD046` (consistent code block style) | Docusaurus admonitions and MDX mix fenced and indented code blocks |

## Branching

Follow standard GitHub Flow: branch off `main`, open a PR, merge after the test-deploy check passes.

## Local Development

```bash
yarn
yarn start      # dev server at http://localhost:3000
yarn build      # production build to verify before pushing
```

## Project Structure

- `docs/` — Markdown documentation pages
- `src/` — Custom pages and React components
- `static/` — Static assets copied to build root (includes `CNAME` for custom domain)
- `docusaurus.config.js` — Site configuration
- `sidebars.js` — Docs sidebar structure

## Adding a New Team

Every team (platform or stream-aligned) gets a folder, not a flat page. This allows child pages to be added later without restructuring.

1. Create `docs/<section>/<team>/index.md` with `sidebar_label` set to the team name and a `description` in the frontmatter.
2. Add a plain doc reference to `sidebars.js` under the appropriate section:

```js
'<section>/<team>/index',
```

3. When a team gets its first child page, convert it to a category in `sidebars.js`, change `sidebar_label` in `index.md` to `Overview`, and register child pages in `items: []`:

```js
{
  type: 'category',
  label: '<Team>',
  link: { type: 'doc', id: '<section>/<team>/index' },
  items: [
    '<section>/<team>/<page>',
  ],
},
```

## Context Section

### DDD Mapping

The platform documentation uses DDD concepts at two levels:

| DDD Concept | Maps To |
|---|---|
| **Domain** | The platform itself — the internal developer platform problem space |
| **Subdomain** | Each team's area of concern (identity & structure, infrastructure, Kubernetes runtime, etc.) |
| **Bounded Context** | Each team's implementation boundary — the `index.md` page documents this |
| **Aggregate / Capability** | A sub-page within a team (e.g., `certificate-management.md`, `cluster-management.md`) |

The `## Context` section documents the team's DDD bounded context: its glossary, interfaces, and any foundational concepts. The `## Team Topologies` section documents the team's cognitive load and capacity.

Sub-pages document **aggregates or capabilities** within that bounded context. They share the team's boundary and glossary but do not have their own cognitive load or team capacity — those belong to the bounded context (team index page) only.

### Team Index Pages (`index.md`)

Team index pages use these top-level sections in this order:

**`## Repositories`** → **`## Context`** → **`## Team Topologies`** → **`## Architecture Decision Records`** (last, if ADRs exist)

`## Context` contains:

1. **`### Glossary`** — a `| Term | Meaning in this context |` table sorted alphabetically. Establishes shared vocabulary before anything else.
2. **`### Downstream Interfaces`** — a table mapping outputs to their consumers. Include only for teams with explicit downstream consumers (e.g., Logos, which feeds team data to all other teams); omit for teams with no single downstream.
3. Any additional subsections relevant to the team's context (e.g., `### Foundation` for Arche to describe `pt-arche-core-helpers`).

Core invariants belong on sub-pages, not on team index pages.

`## Team Topologies` is a separate section immediately after `## Context`, containing:

4. **`### Cognitive Load`** — Team Topologies cognitive load analysis: summary paragraph, working/high-intrinsic heat table, domain-by-domain table, capacity statement, extraneous load mitigations, germane load.
5. **`### Team Capacity`** — bullet list documenting headcount and scaling:

For staffed teams (dedicated engineer):

```md
- **Headcount**: `1 platform engineer` / `1–2 platform engineers`
- **Scale signal**: When (or whether) to add headcount
```

For inner source teams (no dedicated engineer):

```md
- **Headcount**: Inner source — no dedicated engineer
- **Contribution model**: What the contribution model looks like day-to-day
- **Scale signal**: When (or whether) to change the model
```

### Sub-Pages (Aggregates / Capabilities)

Sub-pages use flat `##`-level sections — there is no `## Aggregate` wrapper. DDD-related sections are placed at the `##` level alongside content sections:

- **`## Glossary`** — terms specific to this aggregate/capability, using the same `| Term | Meaning in this context |` format sorted alphabetically. Include only if the sub-page introduces terms not covered by the team index glossary.
- **`## Downstream Interfaces`** — if this aggregate/capability exposes a concrete interface consumed elsewhere within the bounded context or externally.
- **`## Core Invariant`** or **`## Core Invariants`** — the non-negotiable rule(s) this aggregate enforces. Use singular for one rule, plural for multiple. Place near the end of the page, before `## Architecture Decision Records`.

`### Cognitive Load` and `### Team Capacity` are **not used on sub-pages** — they belong to the team index page only.

## Architecture Decision Records

ADRs live at the bottom of the relevant documentation page under a `## Architecture Decision Records` heading — not in separate files. This must always be the **last `##` heading on the page** — no sections follow it. Each ADR is a `###` subsection with a descriptive title.

If a page contains ADRs, add a `:::tip` admonition immediately after the opening intro content (paragraphs and any bullet list), before the first `##` section heading:

```md
:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::
```

Each ADR follows this structure:

```md
### <Descriptive Title>

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td><Month YYYY></td><td><Team></td></tr>
  </tbody>
</table>

#### Context and Problem Statement

<What forced this decision and why it was non-trivial.>

#### Decisions

1. **<Decision>.** <Rationale.>
2. **<Decision>.** <Rationale.>

#### Alternatives Considered

- **<Alternative>** — <Why it was rejected.>

#### Consequences

- <Bullet list of outcomes, constraints, or follow-on requirements.>

#### Links

- [<Link text>](<url>)
```

See `docs/platform-grouping/corpus/networking.md` for a complete example.
