---
sidebar_label: Deployment Automation
---

# Deployment Automation

Reusable GitHub Actions called workflows that standardize OpenTofu deployments across all platform teams — handling OIDC authentication, state encryption, and job summaries consistently.

- **[pt-techne-opentofu-workflows](https://github.com/osinfra-io/pt-techne-opentofu-workflows)**: Called workflows for OpenTofu deployments with OIDC auth, KMS-encrypted state, and structured job summaries — covers sandbox, sandbox destroy, non-production, production, module test, and child module test
- **[pt-techne-misc-workflows](https://github.com/osinfra-io/pt-techne-misc-workflows)**: Reusable workflows for common repository tasks — Dependabot approve and merge, release automation, GitHub project tracking, container image build and push, and Nuclei vulnerability scanning

## Domain-Driven Design

| Entity | Description |
|---|---|
| `called-workflow` | A reusable GitHub Actions workflow invoked by every infrastructure repo's `sandbox.yml`, `non-production.yml`, and `production.yml` |
| `oidc-token` | A short-lived GitHub Actions OIDC token exchanged for a GCP access token via Workload Identity Federation |
| `plan-job` | A workflow job that runs `tofu plan` and uploads the plan artifact for review |
| `apply-job` | A workflow job that downloads and applies a previously generated plan — never re-plans at apply time |
| `state-backend-config` | The GCS bucket and KMS key configuration injected into each workflow job |
| `job-summary` | A structured GitHub Actions job summary displaying plan output, drift, and resource counts |

**Key rule:** All OpenTofu state lives in GitHub Actions. Local `tofu apply` against remote state is not permitted.
