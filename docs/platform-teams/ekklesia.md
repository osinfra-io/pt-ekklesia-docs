---
sidebar_label: Ekklesia — Documentation
description: Platform documentation powered by Docusaurus and deployed via GitHub Pages.
---

# Ekklesia — Documentation

Ekklesia manages the platform documentation:

- **Docusaurus** — Static site generator for modern documentation
- **GitHub Pages** — Hosting at [docs.osinfra.io](https://docs.osinfra.io)
- **GitHub Actions** — Automated build and deployment on push to `main`
- **Dark theme** — Custom dark color scheme with amber accents

## Repository

- [pt-ekklesia-docs](https://github.com/osinfra-io/pt-ekklesia-docs)

## Local Development

```bash
npm ci
npm run start
```

This starts a local development server at `http://localhost:3000`.

## Build

```bash
npm run build
```

This generates the static site in the `build/` directory.
