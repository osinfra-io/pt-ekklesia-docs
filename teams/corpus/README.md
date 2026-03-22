---
description: >-
  Corpus translates Logos structure into real infrastructure: GCP projects,
  shared VPC and subnets, DNS zones, Artifact Registry, workload identity
  pools, and encrypted state buckets.
icon: building-columns
---

# Corpus

<figure><img src="../../.gitbook/assets/my-cloud.png" alt="" width="256"><figcaption></figcaption></figure>

Corpus embodies the foundational Google Cloud infrastructure. It creates the project scaffolding, networking fabric, and security primitives that all workload environments depend upon. A Corpus deployment is a prerequisite to deploying any workload infrastructure in the platform.

## Service Interfaces 🔩

* [Add or update a project](https://github.com/osinfra-io/pt-corpus/issues/new/choose)
* [Add or update networking resources](https://github.com/osinfra-io/pt-corpus/issues/new/choose)

## Response Times 🕙

* Responsible team: [Platform - Corpus](https://github.com/orgs/osinfra-io/teams/pt-corpus)
* Response time for incidents: `60 minutes`
* Response time for other incidents: `120 minutes`
* Response time for support: `60 minutes`
* Response time for feedback: `30 minutes`

## Roadmap 🗺️

* Link to the roadmap: [GitHub Project](https://github.com/orgs/osinfra-io/projects/1/views/7)

## Communication Channels 🗨️

{% tabs %}
{% tab title="Possible incident" %}
Contact exclusively via:

* Discord: [Platform - Corpus](https://discord.gg/YPg4AmMDvF)
* Phone number:
{% endtab %}

{% tab title="Support or provide feedback" %}
Contact via any of these:

* Discord: [Platform - Corpus](https://discord.gg/YPg4AmMDvF)
* Email address: [platform-corpus@osinfra.io](mailto:platform-corpus@osinfra.io)
* Phone number:
* Office hours (EST): `Weekdays 5:00PM - 10:00PM` `Weekends 8:00AM - 5:00PM`
{% endtab %}
{% endtabs %}

## Platform Repositories 🏗️

<table data-card-size="large" data-view="cards" data-full-width="false"><thead><tr><th align="center"></th><th></th><th data-hidden data-card-cover data-type="files"></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td align="center">Corpus</td><td>This repository manages GCP projects, shared VPC networking, DNS, Artifact Registry, workload identity federation, audit logging, and encrypted state storage.</td><td><a href="../../.gitbook/assets/administration-card.png">administration-card.png</a></td><td><a href="https://github.com/osinfra-io/pt-corpus">https://github.com/osinfra-io/pt-corpus</a></td></tr></tbody></table>

## What Corpus Manages

<table data-card-size="large" data-view="cards" data-full-width="false"><thead><tr><th align="center"></th><th></th><th data-hidden data-card-cover data-type="files"></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td align="center">Resource Hierarchy and IAM</td><td>Creates Google Cloud projects with CIS GCP Benchmark compliance, billing budgets, required APIs, and IAM bindings sourced from Logos team data.</td><td><a href="../../.gitbook/assets/administration-card.png">administration-card.png</a></td><td><a href="resource-hierarchy-and-iam.md">resource-hierarchy-and-iam.md</a></td></tr><tr><td align="center">Networking</td><td>Manages a shared VPC host project with regional subnets, Cloud NAT, and Cloud DNS managed zones (public with DNSSEC and private).</td><td><a href="../../.gitbook/assets/virtual-private-cloud-card.png">virtual-private-cloud-card.png</a></td><td><a href="networking.md">networking.md</a></td></tr><tr><td align="center">Workload Identity</td><td>Configures workload identity federation so GitHub Actions can authenticate to GCP without service account keys using OIDC.</td><td><a href="../../.gitbook/assets/workload-identity-pool-card.png">workload-identity-pool-card.png</a></td><td><a href="workload-identity.md">workload-identity.md</a></td></tr><tr><td align="center">Audit Logging</td><td>Manages centralized audit logging. Google Cloud services write audit logs that record administrative activities and access within your Google Cloud resources.</td><td><a href="../../.gitbook/assets/cloud-audit-logs-card.png">cloud-audit-logs-card.png</a></td><td><a href="audit-logging.md">audit-logging.md</a></td></tr><tr><td align="center">State Backend</td><td>Manages KMS-encrypted Cloud Storage buckets used as the OpenTofu remote state backend for all platform team repositories.</td><td><a href="../../.gitbook/assets/cloud-storage-card.png">cloud-storage-card.png</a></td><td><a href="state-backend.md">state-backend.md</a></td></tr></tbody></table>
