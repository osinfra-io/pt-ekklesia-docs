---
sidebar_label: Overview
description: The embodiment of that order — the structural form where networks, shared services, and core infrastructure take shape, preparing the body that Pneuma will animate.
---

# Corpus

Corpus is the embodiment of that order — the structural form where networks, shared services, and core infrastructure take shape, preparing the body that Pneuma will animate. The abstract principles of Logos are translated here into tangible, reliable infrastructure.

- **GCP projects**: CIS-compliant project creation with standard labels
- **Shared VPC and networking**: Subnets, firewall rules, and network peering
- **DNS zones**: Cloud DNS management for platform domains
- **Artifact Registry**: Container image and package storage
- **GitHub Actions service accounts**: Workload identity for CI/CD pipelines
- **State buckets**: Encrypted OpenTofu state storage with KMS

Corpus consumes Logos outputs and provides the foundation for Pneuma workload environments.

## Repositories

- **[pt-corpus](https://github.com/osinfra-io/pt-corpus)**: OpenTofu configuration for GCP projects, shared VPC and networking, GitHub Actions service accounts, and encrypted state buckets

### AI Context

- **[pt-corpus-ai-context](https://github.com/osinfra-io/pt-corpus-ai-context)**: Team-level Copilot instructions for `pt-corpus-*` repositories
