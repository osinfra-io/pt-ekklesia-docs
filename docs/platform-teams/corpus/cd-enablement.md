---
sidebar_label: CD Enablement
---

# CD Enablement

Corpus provisions the shared infrastructure that enables continuous delivery across the platform — keyless authentication for pipelines, a central registry for built artifacts, and encrypted remote state storage for OpenTofu.

- **GitHub Actions service accounts**: Workload identity federation allows GitHub Actions workflows to authenticate to GCP without long-lived credentials
- **Artifact Registry**: A central registry for container images and packages, scoped per team and consumed by workloads running on GKE
- **State buckets**: Encrypted GCS buckets backed by Cloud KMS, with a dedicated bucket per repository per environment, used as the OpenTofu remote backend
