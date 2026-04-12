---
sidebar_label: Corpus
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

## Networking

This layer provides platform teams with common networking resources like VPCs, subnets, DNS, and NATs. It is managed as code in [pt-corpus](https://github.com/osinfra-io/pt-corpus) and provides a consistent foundation for all workloads.

### CIDR Blocks

The following CIDR blocks are available:

| CIDRs | VPC |
|---|---|
| 10.0.0.0/10 | standard-shared |
| 10.64.0.0/10 | free |
| 10.128.0.0/10 | free |
| 10.192.0.0/10 | free |

#### VPC Name: `standard-shared`

This VPC uses the same sandbox, non-production, and production ranges. Each environment has a project and operates independently from each other. It uses the default size for the subnet's primary IP range, the subnet's secondary IP range for Pods, and the subnet's secondary IP range for Services.

[GKE IPAM calculator](https://googlecloudplatform.github.io/gke-ip-address-management)

We break up the `10.0.0.0/10` CIDR block with the above calculator using the following inputs:

```json
{
  "network": "10.0.0.0",
  "netmask": 10,
  "nodeNetmask": 21,
  "clusterNetmask": 15,
  "serviceNetmask": 21,
  "nodePodNetmask": "24",
  "masterNetwork": "UNIQUE",
  "locationType": "REGIONAL",
  "extraZones": 1
}
```

A Kubernetes [VPC-native cluster](https://cloud.google.com/kubernetes-engine/docs/concepts/alias-ips) uses [secondary ranges](https://cloud.google.com/kubernetes-engine/docs/concepts/alias-ips#cluster_sizing_secondary_range_pods) for Pods & Services.

:::note

The size of the cluster's secondary ranges determines the maximum number of Pods and Services for a given GKE cluster. The maximum number of nodes in the cluster is limited by the size of the cluster's subnet's primary IP address range and the cluster's Pod address range.

:::

This will give us up to 31 clusters (in each /10), and each cluster will support the following:

- Up to 510 nodes per cluster
- Up to 2048 services per cluster
- Up to 110 pods per node

All subnet CIDRs — primary, pod, service, and master — are defined together in the `google_subnets` map in [pt-logos](https://github.com/osinfra-io/pt-logos) and flow through [pt-corpus](https://github.com/osinfra-io/pt-corpus) to [pt-pneuma](https://github.com/osinfra-io/pt-pneuma). This keeps all network addressing consolidated in one place.

| Cluster | Primary CIDRs | Secondary PODs CIDRs | Secondary Services CIDRs | Master CIDRs |
|---|---|---|---|---|
| pt-pneuma-us-east1-b | 10.62.0.0/21 | 10.0.0.0/15 | 10.63.0.0/21 | 10.63.240.0/28 |
| pt-pneuma-us-east1-c | 10.62.8.0/21 | 10.2.0.0/15 | 10.63.8.0/21 | 10.63.240.16/28 |
| pt-pneuma-us-east1-d | 10.62.16.0/21 | 10.4.0.0/15 | 10.63.40.0/21 | 10.63.240.32/28 |
| pt-pneuma-us-east4-a | 10.62.24.0/21 | 10.6.0.0/15 | 10.63.16.0/21 | 10.63.240.48/28 |
| pt-pneuma-us-east4-b | 10.62.32.0/21 | 10.8.0.0/15 | 10.63.24.0/21 | 10.63.240.64/28 |
| pt-pneuma-us-east4-c | 10.62.40.0/21 | 10.10.0.0/15 | 10.63.32.0/21 | 10.63.240.80/28 |

## Repositories

- **[pt-corpus](https://github.com/osinfra-io/pt-corpus)**: OpenTofu configuration for GCP projects, shared VPC and networking, GitHub Actions service accounts, and encrypted state buckets

### AI Context

- **[pt-corpus-ai-context](https://github.com/osinfra-io/pt-corpus-ai-context)**: Team-level Copilot instructions for `pt-corpus-*` repositories
