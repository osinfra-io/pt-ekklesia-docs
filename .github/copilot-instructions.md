# pt-ekklesia-docs

Platform documentation site built with [Docusaurus](https://docusaurus.io) and deployed via GitHub Pages.

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

## Architecture Decision Records

ADRs live at the bottom of the relevant documentation page under a `## Architecture Decision Records` heading — not in separate files. Each ADR is a `###` subsection with a descriptive title.

Add a `:::tip` admonition near the top of the page (after the intro paragraph) to signal that ADRs are present:

```md
:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions behind <topic>.

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
