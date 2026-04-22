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

## Bounded Context Section

### DDD Mapping

The platform documentation uses DDD concepts at two levels:

| DDD Concept | Maps To |
|---|---|
| **Domain** | The platform itself — the internal developer platform problem space |
| **Subdomain** | Each team's area of concern (identity & structure, infrastructure, Kubernetes runtime, etc.) |
| **Bounded Context** | Each team's implementation boundary — the `index.md` page documents this |
| **Aggregate / Capability** | A sub-page within a team (e.g., `certificate-management.md`, `cluster-management.md`) |

The `## Bounded Context` section documents the team's DDD bounded context: its ubiquitous language, interfaces, and invariants. The `## Team Topologies` section documents the team's cognitive load and capacity.

Sub-pages document **aggregates or capabilities** within that bounded context. They share the team's boundary and ubiquitous language but do not have their own cognitive load or team capacity — those belong to the bounded context (team index page) only.

### Team Index Pages (`index.md`)

Team index pages use two top-level sections for team context, in this order:

**`## Bounded Context`** → **`## Team Topologies`** → **`## Architecture Decision Records`** (last, if ADRs exist)

`## Bounded Context` contains only the DDD subsections, in this order:

1. **`### Ubiquitous Language`** — a `| Term | Meaning in this context |` table sorted alphabetically. Establishes shared vocabulary before anything else.
2. **`### Downstream Interfaces`** or **`### Bounded Contexts`** — a table mapping bounded contexts or artifacts to their consumers. Use `Downstream Interfaces` for teams with explicit customer/supplier relationships; use `Bounded Contexts` for shared kernel teams (Arche, Techne).
3. **`### Core Invariant`** — a single sentence stating the one rule this context must never violate. Omit only if there is no enforceable invariant (see Ekklesia).

`## Team Topologies` is a separate section immediately after `## Bounded Context`, containing:

4. **`### Cognitive Load`** — Team Topologies cognitive load analysis: summary paragraph, working/high-intrinsic heat table, domain-by-domain table, capacity statement, extraneous load mitigations, germane load.
5. **`### Team Capacity`** — a 3-row definition-style table (no header labels on columns):

```md
| | |
|---|---|
| **Headcount** | `1 domain engineer` / `1–2 domain engineers` / `Inner source — no dedicated engineer` |
| **Day-to-day work** or **Contribution model** | What the work actually looks like day-to-day |
| **Scale signal** | When (or whether) to add headcount |
```

Use `**Day-to-day work**` for staffed teams; use `**Contribution model**` for inner source teams.

### Sub-Pages (Aggregates / Capabilities)

Sub-pages may include a `## Aggregate` section scoped to their aggregate. The allowed subsections are:

1. **`### Ubiquitous Language`** — terms specific to this aggregate, using the same `| Term | Meaning in this context |` format sorted alphabetically.
2. **`### Downstream Interfaces`** — if this aggregate exposes a concrete interface consumed elsewhere within the bounded context or externally.
3. **`### Core Invariant`** — if this aggregate has an enforceable invariant distinct from the team's.

`### Cognitive Load` and `### Team Capacity` are **not used on sub-pages** — they belong to the bounded context (team index page) only.

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

See `docs/platform-teams/corpus/networking.md` for a complete example.
