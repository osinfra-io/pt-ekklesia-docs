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

## Architecture Decision Records

ADRs live at the bottom of the relevant documentation page under a `## Architecture Decision Records` heading — not in separate files. Each ADR is a `###` subsection with a descriptive title.

Add a `:::tip` admonition near the top of the page (after the intro paragraph) to signal that ADRs are present:

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
