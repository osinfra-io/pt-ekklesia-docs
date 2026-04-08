# Ekklesia Documentation

[![Tests](https://img.shields.io/github/actions/workflow/status/osinfra-io/pt-ekklesia-docs/test-deploy.yml?style=for-the-badge&logo=github&color=2088FF&label=Tests)](https://github.com/osinfra-io/pt-ekklesia-docs/actions/workflows/test-deploy.yml)
[![Dependabot](https://img.shields.io/github/actions/workflow/status/osinfra-io/pt-ekklesia-docs/dependabot.yml?style=for-the-badge&logo=github&color=2088FF&label=Dependabot)](https://github.com/osinfra-io/pt-ekklesia-docs/actions/workflows/dependabot.yml)

Platform documentation site for [osinfra.io](https://docs.osinfra.io), built with [Docusaurus](https://docusaurus.io) and deployed via GitHub Pages.

## Local Development

**Prerequisites:** Node.js >= 20

```bash
yarn
yarn start       # dev server at http://localhost:3000
yarn build       # production build — run before pushing to catch broken links
```

## Project Structure

| Path | Purpose |
| --- | --- |
| `docs/` | Markdown documentation pages |
| `src/` | Custom React components and CSS |
| `static/` | Static assets copied to the build root |
| `docusaurus.config.js` | Site configuration |
| `sidebars.js` | Sidebar navigation structure |

## Upgrading Docusaurus

Upgrade all `@docusaurus/*` packages together to keep versions in sync:

```bash
yarn upgrade --latest --pattern "@docusaurus/*"
```

Check the [Docusaurus changelog](https://github.com/facebook/docusaurus/blob/main/CHANGELOG.md) for breaking changes, then verify the build:

```bash
yarn build
```

## Upgrading Dependencies

Upgrade all dependencies to their latest versions:

```bash
yarn upgrade --latest
```

## Contributing

Branch off `main`, make your changes, and open a pull request. The test deployment workflow runs automatically on PRs to verify the build succeeds before merging.
