---
sidebar_label: Corpus
description: The embodiment of that order — the structural form where networks, shared services, and core infrastructure take shape, preparing the body that Pneuma will animate.
---

import Card from '@site/src/components/Card';
import CardGrid from '@site/src/components/CardGrid';
import NetworkCard from '@site/src/components/NetworkCard';

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

<CardGrid>
  <Card item={{ icon: '🌐', title: '10.0.0.0/10', note: 'standard-shared VPC' }} />
</CardGrid>

#### VPC Name: `standard-shared`

This VPC uses the same sandbox, non-production, and production ranges. Each environment has a project and operates independently from each other. It uses the GKE default subnet sizes: `/20` for the primary node range, `/24` per-node alias IP range for Pods, and `/20` for the Services range.

[GKE IPAM calculator](https://googlecloudplatform.github.io/gke-ip-address-management)

We break up the `10.0.0.0/10` CIDR block with the above calculator using the following inputs:

```json
{
  "network": "10.0.0.0",
  "netmask": 10,
  "nodeNetmask": 20,
  "clusterNetmask": 15,
  "serviceNetmask": 20,
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

This will give us up to 30 clusters (in each /10), and each cluster will support the following:

- Up to 510 nodes per cluster
- Up to 4,096 services per cluster
- Up to 110 pods per node

All subnet CIDRs — primary, pod, service, and master — are defined together in the `google_subnets` map in [pt-logos](https://github.com/osinfra-io/pt-logos) and flow through [pt-corpus](https://github.com/osinfra-io/pt-corpus) to [pt-pneuma](https://github.com/osinfra-io/pt-pneuma). This keeps all network addressing consolidated in one place.

<CardGrid>
  <NetworkCard cluster="pt-pneuma-us-east1-b" logo="/img/gke.svg" primary="10.60.0.0/20" pods="10.0.0.0/15" services="10.61.224.0/20" master="10.63.192.0/28" />
  <NetworkCard cluster="pt-pneuma-us-east1-c" logo="/img/gke.svg" primary="10.60.16.0/20" pods="10.2.0.0/15" services="10.61.240.0/20" master="10.63.192.16/28" />
  <NetworkCard cluster="pt-pneuma-us-east1-d" logo="/img/gke.svg" primary="10.60.32.0/20" pods="10.4.0.0/15" services="10.62.0.0/20" master="10.63.192.32/28" />
  <NetworkCard cluster="pt-pneuma-us-east4-a" logo="/img/gke.svg" primary="10.60.48.0/20" pods="10.6.0.0/15" services="10.62.16.0/20" master="10.63.192.48/28" />
  <NetworkCard cluster="pt-pneuma-us-east4-b" logo="/img/gke.svg" primary="10.60.64.0/20" pods="10.8.0.0/15" services="10.62.32.0/20" master="10.63.192.64/28" />
  <NetworkCard cluster="pt-pneuma-us-east4-c" logo="/img/gke.svg" primary="10.60.80.0/20" pods="10.10.0.0/15" services="10.62.48.0/20" master="10.63.192.80/28" />
</CardGrid>

<details>
  <summary>Available cluster slots (24 remaining)</summary>

  <CardGrid>
    <NetworkCard cluster="Available – Slot 07" primary="10.60.96.0/20" pods="10.12.0.0/15" services="10.62.64.0/20" master="10.63.192.96/28" />
    <NetworkCard cluster="Available – Slot 08" primary="10.60.112.0/20" pods="10.14.0.0/15" services="10.62.80.0/20" master="10.63.192.112/28" />
    <NetworkCard cluster="Available – Slot 09" primary="10.60.128.0/20" pods="10.16.0.0/15" services="10.62.96.0/20" master="10.63.192.128/28" />
    <NetworkCard cluster="Available – Slot 10" primary="10.60.144.0/20" pods="10.18.0.0/15" services="10.62.112.0/20" master="10.63.192.144/28" />
    <NetworkCard cluster="Available – Slot 11" primary="10.60.160.0/20" pods="10.20.0.0/15" services="10.62.128.0/20" master="10.63.192.160/28" />
    <NetworkCard cluster="Available – Slot 12" primary="10.60.176.0/20" pods="10.22.0.0/15" services="10.62.144.0/20" master="10.63.192.176/28" />
    <NetworkCard cluster="Available – Slot 13" primary="10.60.192.0/20" pods="10.24.0.0/15" services="10.62.160.0/20" master="10.63.192.192/28" />
    <NetworkCard cluster="Available – Slot 14" primary="10.60.208.0/20" pods="10.26.0.0/15" services="10.62.176.0/20" master="10.63.192.208/28" />
    <NetworkCard cluster="Available – Slot 15" primary="10.60.224.0/20" pods="10.28.0.0/15" services="10.62.192.0/20" master="10.63.192.224/28" />
    <NetworkCard cluster="Available – Slot 16" primary="10.60.240.0/20" pods="10.30.0.0/15" services="10.62.208.0/20" master="10.63.192.240/28" />
    <NetworkCard cluster="Available – Slot 17" primary="10.61.0.0/20" pods="10.32.0.0/15" services="10.62.224.0/20" master="10.63.193.0/28" />
    <NetworkCard cluster="Available – Slot 18" primary="10.61.16.0/20" pods="10.34.0.0/15" services="10.62.240.0/20" master="10.63.193.16/28" />
    <NetworkCard cluster="Available – Slot 19" primary="10.61.32.0/20" pods="10.36.0.0/15" services="10.63.0.0/20" master="10.63.193.32/28" />
    <NetworkCard cluster="Available – Slot 20" primary="10.61.48.0/20" pods="10.38.0.0/15" services="10.63.16.0/20" master="10.63.193.48/28" />
    <NetworkCard cluster="Available – Slot 21" primary="10.61.64.0/20" pods="10.40.0.0/15" services="10.63.32.0/20" master="10.63.193.64/28" />
    <NetworkCard cluster="Available – Slot 22" primary="10.61.80.0/20" pods="10.42.0.0/15" services="10.63.48.0/20" master="10.63.193.80/28" />
    <NetworkCard cluster="Available – Slot 23" primary="10.61.96.0/20" pods="10.44.0.0/15" services="10.63.64.0/20" master="10.63.193.96/28" />
    <NetworkCard cluster="Available – Slot 24" primary="10.61.112.0/20" pods="10.46.0.0/15" services="10.63.80.0/20" master="10.63.193.112/28" />
    <NetworkCard cluster="Available – Slot 25" primary="10.61.128.0/20" pods="10.48.0.0/15" services="10.63.96.0/20" master="10.63.193.128/28" />
    <NetworkCard cluster="Available – Slot 26" primary="10.61.144.0/20" pods="10.50.0.0/15" services="10.63.112.0/20" master="10.63.193.144/28" />
    <NetworkCard cluster="Available – Slot 27" primary="10.61.160.0/20" pods="10.52.0.0/15" services="10.63.128.0/20" master="10.63.193.160/28" />
    <NetworkCard cluster="Available – Slot 28" primary="10.61.176.0/20" pods="10.54.0.0/15" services="10.63.144.0/20" master="10.63.193.176/28" />
    <NetworkCard cluster="Available – Slot 29" primary="10.61.192.0/20" pods="10.56.0.0/15" services="10.63.160.0/20" master="10.63.193.192/28" />
    <NetworkCard cluster="Available – Slot 30" primary="10.61.208.0/20" pods="10.58.0.0/15" services="10.63.176.0/20" master="10.63.193.208/28" />
  </CardGrid>

</details>

<details>
  <summary>Free subnets (3 available /10 blocks)</summary>

  <CardGrid>
    <Card item={{ icon: '⬜', title: '10.64.0.0/10', note: 'Available' }} />
    <Card item={{ icon: '⬜', title: '10.128.0.0/10', note: 'Available' }} />
    <Card item={{ icon: '⬜', title: '10.192.0.0/10', note: 'Available' }} />
  </CardGrid>

</details>

## Repositories

- **[pt-corpus](https://github.com/osinfra-io/pt-corpus)**: OpenTofu configuration for GCP projects, shared VPC and networking, GitHub Actions service accounts, and encrypted state buckets

### AI Context

- **[pt-corpus-ai-context](https://github.com/osinfra-io/pt-corpus-ai-context)**: Team-level Copilot instructions for `pt-corpus-*` repositories
