# pt-ekklesia-docs

Platform documentation site built with [Docusaurus](https://docusaurus.io) and deployed via GitHub Pages.

## Branching

Follow standard GitHub Flow: branch off `main`, open a PR, merge after the test-deploy check passes.

## Local Development

```bash
npm ci
npm run start   # dev server at http://localhost:3000
npm run build   # production build to verify before pushing
```

## Project Structure

- `docs/` — Markdown documentation pages
- `src/` — Custom pages and React components
- `static/` — Static assets copied to build root (includes `CNAME` for custom domain)
- `docusaurus.config.js` — Site configuration
- `sidebars.js` — Docs sidebar structure

