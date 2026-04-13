---
sidebar_label: Arche
description: The origin and first cause — the primordial source from which all platform foundations draw their initial form and essential nature.
---

# Arche

Arche is the origin and first cause — the primordial source from which all platform foundations draw their initial form and essential nature. Nothing above it exists without it.

Arche operates as an inner-source shared kernel: versioned OpenTofu modules published on GitHub, consumed by Logos, Corpus, and Pneuma as pinned dependencies. All modules build on `pt-arche-core-helpers` for environment detection, standard labels, and team data. See the [shared kernel ADR](#arche-as-an-inner-source-shared-kernel) for the rationale behind this design.

- **[Core Helpers](./core-helpers.md)**: Foundational module providing workspace parsing, standard labels, and Logos integration — consumed by every other `pt-arche-*` module
- **[Module Development](./module-development.md)**: Copilot agent and skeleton template for creating new `pt-arche-*` modules
- **[Google Cloud](./google-cloud.md)**: GCP infrastructure modules — projects, networking, GKE, storage, Cloud SQL, and Datadog integration
- **[Kubernetes](./kubernetes.md)**: Kubernetes add-on modules — Istio, cert-manager, Datadog Operator, and OPA Gatekeeper

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Architecture Decision Records

### Arche as an Inner-Source Shared Kernel

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>April 2026</td><td>Arche</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

The platform needs reusable infrastructure patterns — CIS-compliant GCP projects, shared VPC networks, GKE clusters, Istio, cert-manager, OPA Gatekeeper, and Datadog — consumed consistently by Logos, Corpus, and Pneuma. Without a shared approach, each domain would implement these patterns independently, leading to drift, duplicated effort, and inconsistent security posture.

The modules also need to evolve independently of the domains that consume them. A bug fix in the GKE module should not require changes to Corpus or Pneuma source code — only a version pin update.

#### Decision

Organize all reusable OpenTofu modules as an inner-source shared kernel under the `pt-arche-*` namespace. Each module is:

- A standalone GitHub repository with its own versioning, tests, and release pipeline
- Published with semver tags; consumers pin to a full 40-character post-merge commit SHA
- Built on `pt-arche-core-helpers` as the single foundational dependency for environment detection, labels, and team data

Modules are decomposed into two bounded contexts reflecting their infrastructure layer:

- **Google Cloud** — GCP-level infrastructure (projects, networking, GKE, storage, Cloud SQL, Datadog integration)
- **Kubernetes** — Cluster add-ons that run on GKE (Istio, cert-manager, Datadog Operator, OPA Gatekeeper)

This decomposition maps directly to the deployment layers in Corpus (GCP) and Pneuma (Kubernetes), making it clear which modules each domain consumes.

The same pattern is applied in [Techne's shared kernel](/platform-teams/techne#techne-as-an-inner-source-shared-kernel) for shared platform tooling and [Ekklesia's shared kernel](/platform-teams/ekklesia#ekklesia-as-an-inner-source-shared-kernel) for platform documentation — the difference is artifact type. Arche shares OpenTofu modules; Techne shares GitHub Actions called workflows, pre-commit hooks, and Codespace configuration; Ekklesia shares documentation.

#### Alternatives Considered

- **Inline modules within each domain repo** — Rejected. Prevents reuse across domains and creates divergent implementations of the same patterns. A security fix would need to be applied in multiple places.
- **A single monorepo with all modules** — Rejected. Couples unrelated modules to the same release cycle. A change to the GKE module would require re-releasing all modules. Independent repositories allow independent versioning.
- **Use a Terraform Registry** — Rejected. Adds operational overhead (registry hosting, auth) with no benefit over direct GitHub source pinning, which is already reproducible and auditable.

#### Consequences

- All platform infrastructure patterns are defined once and consumed everywhere
- Security and compliance improvements propagate to all consumers on their next module version bump
- New modules follow an established template (`pt-arche-child-module-template`) and are registered in pt-logos
- Consumers must coordinate module upgrades across domains when breaking changes are released — mitigated by semver signalling and the upgrade order convention (core-helpers → other arche modules → consumers)

## Repositories

### AI Context

- **[pt-arche-ai-context](https://github.com/osinfra-io/pt-arche-ai-context)**: Team-level Copilot instructions for `pt-arche-*` repositories
