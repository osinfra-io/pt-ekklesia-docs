---
description: >-
  A standard network resource layer that aligns with our Google Cloud platform
  design. A landing zone should be a prerequisite to deploying enterprise
  workloads in a cloud environment.
---

# Networking

This layer provides platform teams with common networking resources like VPCs, subnets, DNS, and NATs. It is managed as code in [pt-corpus](https://github.com/osinfra-io/pt-corpus) and provides a consistent foundation for all workloads.

## CIDR Blocks

The following CIDR blocks are available:

<table data-card-size="large" data-view="cards"><thead><tr><th>CIDRs</th><th>VPC</th><th data-hidden data-card-cover data-type="files"></th></tr></thead><tbody><tr><td>10.0.0.0/10</td><td>standard-shared</td><td><a href="../../.gitbook/assets/virtual-private-cloud-card.png">virtual-private-cloud-card.png</a></td></tr><tr><td>10.64.0.0/10</td><td>free</td><td><a href="../../.gitbook/assets/virtual-private-cloud-card.png">virtual-private-cloud-card.png</a></td></tr><tr><td>10.128.0.0/10</td><td>free</td><td><a href="../../.gitbook/assets/virtual-private-cloud-card.png">virtual-private-cloud-card.png</a></td></tr><tr><td>10.192.0.0/10</td><td>free</td><td><a href="../../.gitbook/assets/virtual-private-cloud-card.png">virtual-private-cloud-card.png</a></td></tr></tbody></table>

### VPC Name: `standard-shared`

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

{% hint style="info" %}
The size of the cluster's secondary ranges determines the maximum number of Pods and Services for a given GKE cluster. The maximum number of nodes in the cluster is limited by the size of the cluster's subnet's primary IP address range and the cluster's Pod address range.
{% endhint %}

This will give us up to 31 clusters (in each /10), and each cluster will support the following:

* Up to 510 nodes per cluster
* Up to 2048 services per cluster
* Up to 110 pods per node

All subnet CIDRs — primary, pod, service, and master — are defined together in the `google_subnets` map in [pt-logos](https://github.com/osinfra-io/pt-logos) and flow through [pt-corpus](https://github.com/osinfra-io/pt-corpus) to [pt-pneuma](https://github.com/osinfra-io/pt-pneuma). This keeps all network addressing consolidated in one place.

<table data-view="cards"><thead><tr><th>Cluster</th><th>Primary CIDRs</th><th>Secondary PODs CIDRs</th><th>Secondary Services CIDRs</th><th>Master CIDRs</th><th data-hidden data-card-cover data-type="files"></th></tr></thead><tbody><tr><td>pt-pneuma-us-east1-b</td><td>10.62.0.0/21</td><td>10.0.0.0/15</td><td>10.62.248.0/21</td><td>10.63.240.0/28</td><td><a href="../../.gitbook/assets/kubernetes-engine-card.png">kubernetes-engine-card.png</a></td></tr><tr><td>pt-pneuma-us-east1-c</td><td>10.62.8.0/21</td><td>10.2.0.0/15</td><td>10.63.0.0/21</td><td>10.63.240.16/28</td><td><a href="../../.gitbook/assets/kubernetes-engine-card.png">kubernetes-engine-card.png</a></td></tr><tr><td>pt-pneuma-us-east1-d</td><td>10.62.16.0/21</td><td>10.4.0.0/15</td><td>10.63.8.0/21</td><td>10.63.240.32/28</td><td><a href="../../.gitbook/assets/kubernetes-engine-card.png">kubernetes-engine-card.png</a></td></tr><tr><td>pt-pneuma-us-east4-a</td><td>10.62.24.0/21</td><td>10.6.0.0/15</td><td>10.63.16.0/21</td><td>10.63.240.48/28</td><td><a href="../../.gitbook/assets/kubernetes-engine-card.png">kubernetes-engine-card.png</a></td></tr><tr><td>pt-pneuma-us-east4-b</td><td>10.62.32.0/21</td><td>10.8.0.0/15</td><td>10.63.24.0/21</td><td>10.63.240.64/28</td><td><a href="../../.gitbook/assets/kubernetes-engine-card.png">kubernetes-engine-card.png</a></td></tr><tr><td>pt-pneuma-us-east4-c</td><td>10.62.40.0/21</td><td>10.10.0.0/15</td><td>10.63.32.0/21</td><td>10.63.240.80/28</td><td><a href="../../.gitbook/assets/kubernetes-engine-card.png">kubernetes-engine-card.png</a></td></tr></tbody></table>
