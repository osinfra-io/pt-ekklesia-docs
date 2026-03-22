---
description: >-
  Techne provides the shared tooling that powers the entire platform: reusable
  GitHub Actions workflows, pre-commit hooks, development environments, and
  Codespaces.
icon: wrench
---

# Techne

Techne provides the shared tooling consumed by all platform teams. Changes to Techne repositories can have cross-team impact — all consumers pin to commit SHAs, so releases are coordinated when breaking changes are introduced.

## Platform Repositories 🏗️

<table data-card-size="large" data-view="cards" data-full-width="false"><thead><tr><th align="center"></th><th></th><th data-hidden data-card-cover data-type="files"></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td align="center">OpenTofu Workflows</td><td>Reusable GitHub Actions called workflows for OpenTofu plan/apply with OIDC auth, state encryption, and job summaries.</td><td><a href="../.gitbook/assets/github.png">github.png</a></td><td><a href="https://github.com/osinfra-io/pt-techne-opentofu-workflows">https://github.com/osinfra-io/pt-techne-opentofu-workflows</a></td></tr><tr><td align="center">Pre-Commit Hooks</td><td>Custom pre-commit hooks for IaC validation: tofu-fmt, tofu-validate, and tofu-test.</td><td></td><td><a href="https://github.com/osinfra-io/pt-techne-pre-commit-hooks">https://github.com/osinfra-io/pt-techne-pre-commit-hooks</a></td></tr><tr><td align="center">Development Setup</td><td>Standardized Ubuntu IaC developer environment setup script. One command installs all required tools.</td><td><a href="../.gitbook/assets/ubuntu.png">ubuntu.png</a></td><td><a href="https://github.com/osinfra-io/pt-techne-development-setup">https://github.com/osinfra-io/pt-techne-development-setup</a></td></tr><tr><td align="center">OpenTofu Codespace</td><td>GitHub Codespace definition with pre-installed OpenTofu tooling for cloud-hosted IaC development.</td><td><a href="../.gitbook/assets/github-codespaces.png">github-codespaces.png</a></td><td><a href="https://github.com/osinfra-io/pt-techne-opentofu-codespace">https://github.com/osinfra-io/pt-techne-opentofu-codespace</a></td></tr></tbody></table>
