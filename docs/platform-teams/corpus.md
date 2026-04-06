---
sidebar_label: Corpus — Infrastructure
description: GCP projects, networking, DNS, service accounts, and state management.
---

# Corpus — Infrastructure

Corpus translates organizational structure into real cloud infrastructure:

- **GCP projects** — CIS-compliant project creation with standard labels
- **Shared VPC and networking** — Subnets, firewall rules, and network peering
- **DNS zones** — Cloud DNS management for platform domains
- **Artifact Registry** — Container image and package storage
- **GitHub Actions service accounts** — Workload identity for CI/CD pipelines
- **State buckets** — Encrypted OpenTofu state storage with KMS

Corpus consumes Logos outputs and provides the foundation for Pneuma workload environments.

## Repository

- [pt-corpus](https://github.com/osinfra-io/pt-corpus)
