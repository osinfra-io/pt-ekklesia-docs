---
sidebar_label: Networking
---

import Card from '@site/src/components/Card';
import CardGrid from '@site/src/components/CardGrid';
import NetworkCard from '@site/src/components/NetworkCard';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Networking

This layer provides platform teams with common networking resources. It is managed as code in [pt-corpus](https://github.com/osinfra-io/pt-corpus) and provides a consistent foundation for all workloads.

- **Shared VPC**: A single host project VPC is shared across team service projects, centralizing network control while allowing teams to run workloads in isolated projects
- **Subnets**: Per-zone node subnets and master subnets with secondary ranges for GKE pods and services, with Private Google Access enabled; IAM bindings grant GKE service accounts the network user role on each subnet
- **Cloud NAT**: Regional Cloud NAT gateways provide outbound internet access for private cluster nodes without exposing them to inbound traffic
- **DNS zones**: A public `osinfra.io` zone, a private zone for internal resolution, and per-team subdomain zones with NS delegation records in the parent zone
- **Private service networking**: A reserved IP range and service networking connection enable private connectivity to managed services (e.g., Cloud SQL)

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Domain

| Entity | Description |
|---|---|
| `shared-vpc` | A VPC host project network shared across all team projects in an environment |
| `subnet` | A regional subnetwork with primary node CIDR, pod secondary range, and service secondary range |
| `firewall-rule` | Network-level traffic controls applied to the shared VPC |
| `dns-zone` | A Cloud DNS managed zone for a platform domain (e.g., `osinfra.io`) |
| `cloud-nat` | Managed NAT for private nodes to reach the internet without public IPs |

## IP Address Management

The `10.0.0.0/8` RFC 1918 space is divided into four `/10` blocks, each supporting up to 30 isolated GKE clusters. VPCs use the same address space across sandbox, non-production, and production environments, with each environment isolated to its own project. All CIDR ranges are defined in [pt-logos](https://github.com/osinfra-io/pt-logos) and flow through [pt-corpus](https://github.com/osinfra-io/pt-corpus) to [pt-pneuma](https://github.com/osinfra-io/pt-pneuma).

<Tabs>
  <TabItem value="10-0" label="10.0.0.0/10" default>

VPC: standard-shared

<details>
  <summary>IPAM calculator configuration</summary>

  We break up the `10.0.0.0/10` CIDR block with the [GKE IPAM calculator](https://googlecloudplatform.github.io/gke-ip-address-management) using the following inputs:

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

</details>

<Tabs>
  <TabItem value="active" label="Active Clusters (8)" default>

    <CardGrid>
      <NetworkCard cluster="pt-pneuma-us-east1-b" logo="/img/gke.svg" primary="10.60.0.0/20" pods="10.0.0.0/15" services="10.61.224.0/20" master="10.63.192.0/28" />
      <NetworkCard cluster="pt-pneuma-us-east1-c" logo="/img/gke.svg" primary="10.60.16.0/20" pods="10.2.0.0/15" services="10.61.240.0/20" master="10.63.192.16/28" />
      <NetworkCard cluster="pt-pneuma-us-east1-d" logo="/img/gke.svg" primary="10.60.32.0/20" pods="10.4.0.0/15" services="10.62.0.0/20" master="10.63.192.32/28" />
      <NetworkCard cluster="pt-pneuma-us-east4-a" logo="/img/gke.svg" primary="10.60.48.0/20" pods="10.6.0.0/15" services="10.62.16.0/20" master="10.63.192.48/28" />
      <NetworkCard cluster="pt-pneuma-us-east4-b" logo="/img/gke.svg" primary="10.60.64.0/20" pods="10.8.0.0/15" services="10.62.32.0/20" master="10.63.192.64/28" />
      <NetworkCard cluster="pt-pneuma-us-east4-c" logo="/img/gke.svg" primary="10.60.80.0/20" pods="10.10.0.0/15" services="10.62.48.0/20" master="10.63.192.80/28" />
      <NetworkCard cluster="pt-kryptos-us-east1-b" logo="/img/gke.svg" primary="10.60.96.0/20" pods="10.12.0.0/15" services="10.62.64.0/20" master="10.63.192.96/28" />
      <NetworkCard cluster="pt-kryptos-us-east4-a" logo="/img/gke.svg" primary="10.60.112.0/20" pods="10.14.0.0/15" services="10.62.80.0/20" master="10.63.192.112/28" />
    </CardGrid>

  </TabItem>
  <TabItem value="available" label="Available Slots (22)">

    <CardGrid>
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

  </TabItem>
  <TabItem value="free" label="Free Space">

    Unused address space within `10.0.0.0/10` after all 30 cluster slots are allocated.

    <CardGrid>
      <Card item={{ icon: '⬜', title: '10.63.193.224/27', note: '10.63.193.224 – 10.63.193.255' }} />
      <Card item={{ icon: '⬜', title: '10.63.194.0/23', note: '10.63.194.0 – 10.63.195.255' }} />
      <Card item={{ icon: '⬜', title: '10.63.196.0/22', note: '10.63.196.0 – 10.63.199.255' }} />
      <Card item={{ icon: '⬜', title: '10.63.200.0/21', note: '10.63.200.0 – 10.63.207.255' }} />
      <Card item={{ icon: '⬜', title: '10.63.208.0/20', note: '10.63.208.0 – 10.63.223.255' }} />
      <Card item={{ icon: '⬜', title: '10.63.224.0/19', note: '10.63.224.0 – 10.63.255.255' }} />
    </CardGrid>

  </TabItem>
</Tabs>

  </TabItem>
  <TabItem value="10-64" label="10.64.0.0/10">

This block is available for future use.

  </TabItem>
  <TabItem value="10-128" label="10.128.0.0/10">

This block is available for future use.

  </TabItem>
  <TabItem value="10-192" label="10.192.0.0/10">

This block is available for future use.

  </TabItem>
</Tabs>

## Architecture Decision Records

### GKE IP Address Management for Shared VPC

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>April 2026</td><td>Corpus</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

GKE VPC-native clusters using Shared VPC require all IP address ranges — primary node subnets, pod secondary ranges, service secondary ranges, and control plane ranges — to be pre-created and user-managed. GKE cannot auto-manage these ranges in a Shared VPC. This forces upfront address planning before any cluster can be created and means every range must be tracked centrally.

The platform uses a one-cluster-per-zone model (e.g., `pt-pneuma-us-east1-b`, `pt-pneuma-us-east4-a`), so the number of clusters scales with zone coverage rather than workload size. Address space must accommodate growth across multiple regions and zones without requiring re-addressing.

The guiding principle throughout: **use GKE defaults unless there is a clear reason not to.**

#### Decisions

1. **Carve `10.0.0.0/8` into four `/10` blocks.** Each `/10` is large enough for 30 clusters. Four blocks give the platform room to grow across independent address spaces without redesign.

2. **Follow GKE defaults for all subnet sizes where possible.**
   - `/20` primary node range — GKE default
   - `/24` per-node pod alias range — GKE default, supports 110 pods per node
   - `/20` service range — GKE default, supports 4,096 services per cluster
   - `/28` control plane range — GKE default for private cluster masters

3. **Use `/15` for the cluster-level pod secondary range.** This is the one deliberate deviation from defaults. A `/14` would roughly double per-cluster node capacity (~1,022 nodes) but would halve the number of clusters per `/10` (~15 vs 30) with nearly identical total node capacity across the block. The one-cluster-per-zone model benefits more from cluster count than cluster size, so `/15` was chosen.

4. **Use the GKE IPAM calculator for address planning.** This ensures ranges are correctly sized, non-overlapping, and documented reproducibly.

5. **Define all ranges centrally in `pt-logos`.** All CIDRs — primary, pod, service, and master — are defined in the `google_subnets` map in [pt-logos](https://github.com/osinfra-io/pt-logos) and flow through [pt-corpus](https://github.com/osinfra-io/pt-corpus) to [pt-pneuma](https://github.com/osinfra-io/pt-pneuma). This keeps all network addressing consolidated and visible in one place.

6. **Use the same address space across sandbox, non-production, and production.** Each environment has its own project for isolation. Keeping ranges consistent across environments reduces cognitive overhead and eliminates environment-specific address planning.

#### Alternatives Considered

- **`/14` cluster pod CIDR** — ~1,022 nodes per cluster, but only ~15 clusters per `/10`. Total node capacity across the block is nearly identical. Rejected in favour of more clusters at a still-generous 510 nodes each.
- **Auto-managed secondary ranges** — Not possible with Shared VPC. GKE requires user-managed secondary ranges when using a host project.
- **Separate address spaces per environment** — Rejected. Project-level isolation is sufficient; duplicating the address plan per environment adds complexity with no benefit.

#### Consequences

- 30 cluster slots available per `/10` block
- 510 nodes per cluster maximum
- 4,096 services per cluster maximum
- 110 pods per node maximum
- All IP address ranges must be defined in `pt-logos` before any cluster can be created
- Adding a new cluster requires claiming an available slot from the IPAM plan

#### Links

- [GKE IPAM Calculator](https://googlecloudplatform.github.io/gke-ip-address-management)
- [VPC-native clusters](https://cloud.google.com/kubernetes-engine/docs/concepts/alias-ips)
- [Cluster sizing — secondary range for Pods](https://cloud.google.com/kubernetes-engine/docs/concepts/alias-ips#cluster_sizing_secondary_range_pods)
