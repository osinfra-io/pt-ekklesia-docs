---
sidebar_label: Documentation
---

# Documentation

[`pt-ekklesia-docs`](https://github.com/osinfra-io/pt-ekklesia-docs) is the platform documentation site, published at **[docs.osinfra.io](https://docs.osinfra.io)**.

## Domain

| Entity | Description |
|---|---|
| `doc-page` | A Markdown page in the Docusaurus site, organized by team and bounded context |
| `adr` | An Architecture Decision Record embedded in a doc page, capturing context, decision, alternatives, and consequences |
| `sidebar` | The Docusaurus navigation structure reflecting the domain model |

## Tech stack

Built on [Docusaurus 3](https://docusaurus.io/) with the following features enabled:

- **Mermaid diagrams** — architecture and workflow diagrams rendered inline
- **Local search** — full-text search with highlighted results, no external service
- **Syntax highlighting** — HCL and Bash in addition to Docusaurus defaults
- **Edit on GitHub** — every page has a direct link to edit the source on GitHub

## Deployment

- **Pull requests** — a test build runs on every PR to catch broken links and build errors before merge
- **Merge to main** — the site is built and deployed to GitHub Pages automatically; the custom domain `docs.osinfra.io` is served via CNAME

## Contributing

Every page in the docs has an **Edit this page** link at the bottom that opens the source file directly on GitHub. Changes follow the standard GitHub Flow: branch, edit, open a pull request.

When adding a new page:

1. Create the Markdown file under `docs/`
2. Register it in `sidebars.js` — the page will not appear in navigation until it is added there
3. Open a pull request — the test build will validate there are no broken links before merge
