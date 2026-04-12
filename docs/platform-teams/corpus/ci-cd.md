---
sidebar_label: CI/CD
---

# CI/CD

Corpus provisions the shared infrastructure that all platform CI/CD pipelines depend on — workload identity for keyless authentication, a container and package registry, and encrypted remote state storage for OpenTofu.

- **GitHub Actions service accounts**: Dedicated service accounts with workload identity federation allow GitHub Actions workflows to authenticate to GCP without long-lived credentials
- **Artifact Registry**: A central registry for container images and packages, scoped per team and consumed by workloads running on GKE
- **State buckets**: Encrypted GCS buckets backed by Cloud KMS store OpenTofu state for every environment, with a separate bucket per repository and per environment
