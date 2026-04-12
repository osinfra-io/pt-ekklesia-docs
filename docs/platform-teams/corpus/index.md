---
sidebar_label: Overview
description: The embodiment of that order — the structural form where networks, shared services, and core infrastructure take shape, preparing the body that Pneuma will animate.
---

# Corpus

Corpus is the embodiment of that order — the structural form where networks, shared services, and core infrastructure take shape, preparing the body that Pneuma will animate. The abstract principles of Logos are translated here into tangible, reliable infrastructure.

- **[Project Factory](./project-factory)**: CIS-compliant GCP project creation with standard labels
- **[Networking](./networking)**: Shared VPC, subnets, firewall rules, DNS zones
- **[CI/CD](./ci-cd)**: GitHub Actions workload identity, Artifact Registry, encrypted OpenTofu state buckets

Corpus consumes Logos outputs and provides the foundation for Pneuma workload environments.

## Repositories

- **[pt-corpus](https://github.com/osinfra-io/pt-corpus)**: OpenTofu configuration for GCP projects, shared VPC and networking, GitHub Actions service accounts, and encrypted state buckets

### AI Context

- **[pt-corpus-ai-context](https://github.com/osinfra-io/pt-corpus-ai-context)**: Team-level Copilot instructions for `pt-corpus-*` repositories
