---
description: >-
  Corpus translates Logos structure into real infrastructure: GCP projects,
  shared VPC and subnets, DNS zones, Artifact Registry, workload identity pools,
  and encrypted state buckets.
icon: building-columns
---

# Corpus

<figure><img src="../../.gitbook/assets/my-cloud.png" alt="" width="256"><figcaption></figcaption></figure>

Corpus embodies the foundational Google Cloud infrastructure. It creates the project scaffolding, networking fabric, and security primitives that all workload environments depend upon. A Corpus deployment is a prerequisite to deploying any workload infrastructure in the platform.

## Platform Repositories 🏗️

<table data-card-size="large" data-view="cards" data-full-width="false"><thead><tr><th align="center"></th><th></th><th data-hidden data-card-cover data-type="files"></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td align="center">Corpus</td><td>This repository manages GCP projects, shared VPC networking, DNS, Artifact Registry, workload identity federation, audit logging, and encrypted state storage.</td><td><a href="../../.gitbook/assets/administration-card.png">administration-card.png</a></td><td><a href="https://github.com/osinfra-io/pt-corpus">https://github.com/osinfra-io/pt-corpus</a></td></tr></tbody></table>

## What Corpus Manages

<table data-card-size="large" data-view="cards" data-full-width="false"><thead><tr><th align="center"></th><th></th><th data-hidden data-card-cover data-type="files"></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td align="center">Resource Hierarchy and IAM</td><td>Creates Google Cloud projects with CIS GCP Benchmark compliance, billing budgets, required APIs, and IAM bindings sourced from Logos team data.</td><td><a href="../../.gitbook/assets/administration-card.png">administration-card.png</a></td><td><a href="resource-hierarchy-and-iam.md">resource-hierarchy-and-iam.md</a></td></tr><tr><td align="center">Networking</td><td>Manages a shared VPC host project with regional subnets, Cloud NAT, and Cloud DNS managed zones (public with DNSSEC and private).</td><td><a href="../../.gitbook/assets/virtual-private-cloud-card.png">virtual-private-cloud-card.png</a></td><td><a href="networking.md">networking.md</a></td></tr><tr><td align="center">Workload Identity</td><td>Configures workload identity federation so GitHub Actions can authenticate to GCP without service account keys using OIDC.</td><td><a href="../../.gitbook/assets/workload-identity-pool-card.png">workload-identity-pool-card.png</a></td><td><a href="workload-identity.md">workload-identity.md</a></td></tr><tr><td align="center">Audit Logging</td><td>Manages centralized audit logging. Google Cloud services write audit logs that record administrative activities and access within your Google Cloud resources.</td><td><a href="../../.gitbook/assets/cloud-audit-logs-card.png">cloud-audit-logs-card.png</a></td><td><a href="audit-logging.md">audit-logging.md</a></td></tr><tr><td align="center">OpenTofu State Backend</td><td>Manages KMS-encrypted Cloud Storage buckets used as the OpenTofu remote state backend for all platform team repositories.</td><td><a href="../../.gitbook/assets/cloud-storage-card.png">cloud-storage-card.png</a></td><td><a href="state-backend.md">state-backend.md</a></td></tr></tbody></table>
