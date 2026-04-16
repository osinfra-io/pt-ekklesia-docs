---
sidebar_label: Overview
description: The embodiment of that order — the structural form where networks, shared services, and core infrastructure take shape, preparing the body that Pneuma will animate.
---

# Corpus

Corpus is the embodiment of that order — the structural form where networks, shared services, and core infrastructure take shape, preparing the body that Pneuma will animate. The abstract principles of Logos are translated here into tangible, reliable infrastructure.

- **[Projects](./projects.md)**: CIS-compliant GCP project creation with standard labels
- **[Networking](./networking.md)**: Shared VPC, subnets, DNS zones, Cloud NAT
- **[CI/CD Enablement](./ci-cd-enablement.md)**: GitHub Actions workload identity, Artifact Registry, encrypted OpenTofu state buckets

Corpus consumes Logos outputs and provides the foundation for Pneuma workload environments.

## Domain

Corpus is a downstream **Customer/Supplier** consumer of Logos, and an upstream supplier to Pneuma in the platform's [context map](/platform-teams#context-map).

**Ubiquitous Language:** project, CIS benchmark, subnet, shared VPC, firewall rule, DNS zone, workload identity, artifact registry, state bucket

### Downstream Interfaces

| Output | Consumed By | Via | Description |
|---|---|---|---|
| Shared VPC and subnet self-links | Pneuma | `module.core_helpers.teams` | GKE cluster node and pod network attachment |
| Project IDs | Pneuma | `module.core_helpers.teams` | Cluster placement and Workload Identity binding |
| Networking CIDRs | Pneuma | `module.core_helpers.teams` | Node, pod, and service IP range allocation |

### Core Invariant

Every GCP project is CIS-compliant at creation — there is no non-compliant state.

## Repositories

- **[pt-corpus](https://github.com/osinfra-io/pt-corpus)**: OpenTofu configuration for GCP projects, shared VPC and networking, GitHub Actions service accounts, and encrypted state buckets

### AI Context

- **[pt-corpus-ai-context](https://github.com/osinfra-io/pt-corpus-ai-context)**: Team-level Copilot instructions for `pt-corpus-*` repositories
