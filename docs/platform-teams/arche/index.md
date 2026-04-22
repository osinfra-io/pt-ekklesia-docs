---
sidebar_label: Arche
description: The origin and first cause — the primordial source from which all platform foundations draw their initial form and essential nature.
---

# Arche

Arche is the origin and first cause — the primordial source from which all platform foundations draw their initial form and essential nature. Nothing above it exists without it.

Arche operates as an inner-source shared kernel: versioned OpenTofu modules published on GitHub, consumed by all teams as pinned dependencies. All modules build on `pt-arche-core-helpers` for environment detection, standard labels, and team data. See the [shared kernel ADR](#arche-as-an-inner-source-shared-kernel) for the rationale behind this design.

- **[Core Helpers](./core-helpers.md)**: Foundational module providing workspace parsing, standard labels, and Logos integration — consumed by every other `pt-arche-*` module
- **[Module Development](./module-development.md)**: Copilot agent and skeleton template for creating new `pt-arche-*` modules
- **[Google Cloud](./google-cloud.md)**: GCP infrastructure modules — projects, networking, GKE, storage, Cloud SQL, and Datadog integration
- **[Kubernetes](./kubernetes.md)**: Kubernetes add-on modules — Istio, cert-manager, Datadog Operator, and OPA Gatekeeper

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Repositories

### AI Context

- **[pt-arche-ai-context](https://github.com/osinfra-io/pt-arche-ai-context)**: Team-level Copilot instructions for `pt-arche-*` repositories

## Bounded Context

Arche operates as the platform's **Shared Kernel** in the [context map](/platform-teams#context-map) — versioned OpenTofu modules consumed by all teams as pinned dependencies.

### Ubiquitous Language

| Term | Meaning in this context |
|---|---|
| Environment | The deployment tier (sandbox, non-production, production) detected from the OpenTofu workspace name |
| Helpers | The `pt-arche-core-helpers` module output struct providing env, labels, region, team, and teams data |
| Label | A standard map of GCP resource tags applied to all resources (env, team, managed-by) |
| Module | A versioned OpenTofu child module published in a `pt-arche-*` GitHub repository |
| Ref | A 40-character commit SHA pinning a module to a specific post-merge state on `main` |
| Source | The GitHub URL referencing a module, including the pinned commit SHA ref |
| Version | A semver tag (e.g., v1.2.3) associated with a module release — documented as a comment alongside the ref |
| Workspace | An OpenTofu workspace name encoding environment and optionally region or zone |

### Bounded Contexts

Arche is decomposed into two bounded contexts that map directly to the infrastructure layer each module targets:

| Bounded Context | Modules | Consumed By |
|---|---|---|
| [Google Cloud](./google-cloud.md) | project, network, GKE, storage, Cloud SQL, Datadog integration | Corpus, Pneuma, stream-aligned teams |
| [Kubernetes](./kubernetes.md) | Istio, cert-manager, Datadog Operator, OPA Gatekeeper | Pneuma |

### Anti-Corruption Layer

[`pt-arche-core-helpers`](./core-helpers.md) is the foundational module that every other module builds on. It is the only module that reads OpenTofu workspace state directly — translating raw workspace names (e.g., `main-production`, `us-east1-b-sandbox`) into structured context all other modules consume. No module hardcodes environment strings, labels, or team data.

### Core Invariant

Every module `ref` must point to a post-merge commit SHA on `main` — never a branch name or semver tag. This makes every deployment reproducible and auditable.

## Team Topologies

### Cognitive Load

Arche's cognitive load centers on module design — building well-abstracted, versioned infrastructure primitives that reduce load for every team that consumes them. The Google Cloud context is medium complexity; the Kubernetes context is high, given the inherent complexity of the add-ons it packages.

| Working Domains | High Intrinsic Domains |
|---|---|
| 🟢 3 / 4 | 🟢 1 / 3 |

Cognitive load by domain:

| Domain | Intrinsic | Extraneous Reduced By | Germane Expertise |
|---|---|---|---|
| Module Design & Versioning | 🟡 Medium | Template + Copilot agent | API design, semver strategy |
| Google Cloud Patterns | 🟡 Medium | Pre-commit, mocked tests | GCP provider APIs |
| Kubernetes Patterns | 🔴 High | Mocked provider tests | Helm, add-on internals |

**Capacity**: 1 high-complexity domain (Team Topologies guideline: 2–3); team members hold 3 active domains — within the ~4 working-knowledge limit.

**Extraneous load is minimized by:**

- `pt-arche-child-module-template` and a Copilot agent scaffold new modules to the correct structure
- Pre-commit hooks run `tofu fmt`, `tofu validate`, and `tofu test` automatically on every change
- Mocked provider tests require no real GCP resources or credentials

**Germane load is built through:**

- IaC module design: API surface decisions, backward compatibility, and the cost of premature abstraction
- Provider API mastery: understanding GCP and Kubernetes provider internals to build reliable, idiomatic modules
- Versioning strategy: semver signalling, SHA pinning discipline, and coordinating the upgrade order across consumers

### Team Capacity

| | |
|---|---|
| **Headcount** | Inner source — no dedicated engineer |
| **Contribution model** | Modules are built when a consuming team needs them and owned by whoever builds them; the child module template and Copilot agent make new module creation frictionless |
| **Scale signal** | Scales with contributor interest — Arche is a domain standard and a set of versioned artifacts, not a team roster |

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

The platform needs reusable infrastructure patterns — CIS-compliant GCP projects, shared VPC networks, GKE clusters, Istio, cert-manager, OPA Gatekeeper, and Datadog — consumed consistently by all platform teams. Without a shared approach, each team would implement these patterns independently, leading to drift, duplicated effort, and inconsistent security posture.

The modules also need to evolve independently of the bounded contexts that consume them. A bug fix in the GKE module should not require changes to Corpus or Pneuma source code — only a version pin update.

#### Decision

Organize all reusable OpenTofu modules as an inner-source shared kernel under the `pt-arche-*` namespace. Each module is:

- A standalone GitHub repository with its own versioning, tests, and release pipeline
- Published with semver tags; consumers pin to a full 40-character post-merge commit SHA
- Built on `pt-arche-core-helpers` as the single foundational dependency for environment detection, labels, and team data

Modules are decomposed into two bounded contexts reflecting their infrastructure layer:

- **Google Cloud** — GCP-level infrastructure (projects, networking, GKE, storage, Cloud SQL, Datadog integration)
- **Kubernetes** — Cluster add-ons that run on GKE (Istio, cert-manager, Datadog Operator, OPA Gatekeeper)

This decomposition maps directly to the deployment layers in Corpus (GCP) and Pneuma (Kubernetes), making it clear which modules each bounded context consumes.

A similar inner-source contribution model is used by [Techne](/platform-teams/techne#techne-as-a-shared-kernel-platform-tooling-layer) and [Ekklesia](/platform-teams/ekklesia#ekklesia-as-an-inner-source-shared-kernel) — the difference is artifact type. Arche shares OpenTofu modules as a Shared Kernel; Techne shares GitHub Actions called workflows, pre-commit hooks, and Codespace configuration as a Shared Kernel; Ekklesia shares documentation as a Shared Kernel.

#### Alternatives Considered

- **Inline modules within each bounded context repo** — Rejected. Prevents reuse across bounded contexts and creates divergent implementations of the same patterns. A security fix would need to be applied in multiple places.
- **A single monorepo with all modules** — Rejected. Couples unrelated modules to the same release cycle. A change to the GKE module would require re-releasing all modules. Independent repositories allow independent versioning.
- **Use a Terraform Registry** — Rejected. Adds operational overhead (registry hosting, auth) with no benefit over direct GitHub source pinning, which is already reproducible and auditable.

#### Consequences

- All platform infrastructure patterns are defined once and consumed everywhere
- Security and compliance improvements propagate to all consumers on their next module version bump
- New modules follow an established template (`pt-arche-child-module-template`) and are registered in pt-logos
- Consumers must coordinate module upgrades across bounded contexts when breaking changes are released — mitigated by semver signalling and the upgrade order convention (core-helpers → other arche modules → consumers)
