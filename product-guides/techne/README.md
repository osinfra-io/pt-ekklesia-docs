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

<table data-card-size="large" data-view="cards" data-full-width="false"><thead><tr><th align="center"></th><th></th><th data-hidden data-card-cover data-type="files"></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td align="center">OpenTofu Workflows</td><td>Reusable GitHub Actions called workflows for OpenTofu plan/apply with OIDC auth, state encryption, and job summaries.</td><td><a href="../../.gitbook/assets/github.png">github.png</a></td><td><a href="https://github.com/osinfra-io/pt-techne-opentofu-workflows">https://github.com/osinfra-io/pt-techne-opentofu-workflows</a></td></tr><tr><td align="center">Pre-Commit Hooks</td><td>Custom pre-commit hooks for IaC validation: tofu-fmt, tofu-validate, and tofu-test.</td><td><a href="../../.gitbook/assets/github.png">github.png</a></td><td><a href="https://github.com/osinfra-io/pt-techne-pre-commit-hooks">https://github.com/osinfra-io/pt-techne-pre-commit-hooks</a></td></tr><tr><td align="center">Development Setup</td><td>Standardized Ubuntu IaC developer environment setup script. One command installs all required tools.</td><td><a href="../../.gitbook/assets/ubuntu.png">ubuntu.png</a></td><td><a href="https://github.com/osinfra-io/pt-techne-development-setup">https://github.com/osinfra-io/pt-techne-development-setup</a></td></tr><tr><td align="center">OpenTofu Codespace</td><td>GitHub Codespace definition with pre-installed OpenTofu tooling for cloud-hosted IaC development.</td><td><a href="../../.gitbook/assets/github-codespaces.png">github-codespaces.png</a></td><td><a href="https://github.com/osinfra-io/pt-techne-opentofu-codespace">https://github.com/osinfra-io/pt-techne-opentofu-codespace</a></td></tr></tbody></table>

## OpenTofu Workflows

The [pt-techne-opentofu-workflows](https://github.com/osinfra-io/pt-techne-opentofu-workflows) repository provides reusable GitHub Actions called workflows used by every IaC repository on the platform.

### Three-Tier Workflow Pattern

All infrastructure repositories follow this deployment workflow:

| Workflow | Trigger | Environment |
|---|---|---|
| `sandbox.yml` | Pull requests | Sandbox |
| `non-production.yml` | Merge to `main` | Non-Production |
| `production.yml` | After non-production succeeds | Production |

### Requirements

Each consuming repository must have these three GitHub Variables configured:

* `state_bucket` — Cloud Storage bucket for remote state
* `state_kms_encryption_key` — KMS key for state encryption
* `state_prefix` — Path prefix within the bucket

## Pre-Commit Hooks

The [pt-techne-pre-commit-hooks](https://github.com/osinfra-io/pt-techne-pre-commit-hooks) repository provides Go-based pre-commit hooks for OpenTofu:

| Hook | Description |
|---|---|
| `tofu-fmt` | Rewrites OpenTofu files to canonical format (`.tofu`, `.tf`, `.tfvars`) |
| `tofu-validate` | Validates syntax and internal consistency without making remote API calls |
| `tofu-test` | Executes automated tests from `.tftest.hcl` files in the module root |

{% hint style="info" %}
`pre-commit run -a` must be run after any change in any platform repository. Run `pre-commit autoupdate --freeze` once at the start of each session to update hook SHAs.
{% endhint %}

## Development Setup

See [Development Setup](../../fundamentals/development-setup/README.md) for the full guide. The setup script is maintained in [pt-techne-development-setup](https://github.com/osinfra-io/pt-techne-development-setup).
