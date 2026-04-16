---
sidebar_label: CI/CD Enablement
---

# CI/CD Enablement

Corpus provisions the shared infrastructure that enables continuous delivery across the platform — keyless authentication for pipelines, a central registry for built artifacts, and encrypted remote state storage for OpenTofu.

- **GitHub Actions service accounts**: Workload identity federation allows GitHub Actions workflows to authenticate to GCP without long-lived credentials
- **Artifact Registry**: A central registry for container images and packages, scoped per team and consumed by workloads running on GKE
- **State buckets**: Encrypted GCS buckets backed by Cloud KMS, with a dedicated bucket per repository per environment, used as the OpenTofu remote backend

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Domain-Driven Design

| Entity | Description |
|---|---|
| `service-account` | A GCP service account created per repository and environment for GitHub Actions workloads |
| `workload-identity-pool` | A Workload Identity Federation pool that maps GitHub OIDC tokens to GCP service accounts — no static credentials |
| `workload-identity-provider` | An OIDC provider within the pool, scoped to a specific GitHub org and repository |
| `artifact-registry` | A container image and package registry scoped per team, consumed by GKE workloads |
| `state-bucket` | An encrypted GCS bucket per repository per environment used as the OpenTofu remote backend, protected by a per-environment KMS key |

## Architecture Decision Records

### Keyless Authentication via Workload Identity Federation

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>April 2026</td><td>Corpus</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

GitHub Actions workflows need to authenticate to GCP to deploy infrastructure, push container images to Artifact Registry, and read and write OpenTofu state in GCS. The conventional approach is to create a service account key, store it as a GitHub Actions secret, and pass it to the workflow. Service account keys are long-lived credentials — they do not expire, cannot be scoped to a single job, and represent a persistent attack surface if leaked.

The platform manages repositories across three environments. Each repository needs its own identity for least-privilege enforcement. Storing and rotating service account keys at that scale is operationally unsustainable and creates significant credential leak risk.

#### Decision

Use [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation) to allow GitHub Actions workflows to authenticate to GCP using short-lived OIDC tokens — no service account keys are created, stored, or rotated.

Each repository and environment gets a dedicated GCP service account. GitHub Actions exchanges a per-job OIDC token (minted by GitHub, scoped to the repository and workflow ref) for a short-lived GCP access token via a Workload Identity Pool. The token expires automatically when the job ends.

Environment-separated identity pools mean a token issued for sandbox cannot be used in production, even if intercepted.

#### Alternatives Considered

- **Service account keys stored as GitHub secrets** — Rejected. Long-lived credentials that cannot be automatically scoped, do not expire, and require manual rotation. Any leak is a persistent breach.
- **Shared service account across repositories** — Rejected. Violates least-privilege. A compromise in one repository would grant access to all environments.
- **Self-hosted runners with attached service accounts** — Rejected. Adds infrastructure to manage, increases attack surface, and provides no meaningful security improvement over Workload Identity Federation on GitHub-hosted runners.

#### Consequences

- No static credentials exist anywhere in the platform
- Token scope is limited to a single job, repository, and environment
- Compromise of a GitHub Actions secret does not grant GCP access
- Adding a new repository requires provisioning a new service account and Workload Identity binding in Corpus — this is automated via pt-logos team definitions
