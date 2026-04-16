---
sidebar_label: Google Cloud
---

import ModuleCard from '@site/src/components/ModuleCard';

# Google Cloud

GCP infrastructure modules covering project governance, networking, compute, storage, and Datadog observability integration. All modules consume `pt-arche-core-helpers` for environment detection, labels, and team data.

## Modules

<div className="row">
  <div className="col col--4 margin-bottom--lg">
    <ModuleCard
      image="/img/administration.svg"
      title="pt-arche-core-helpers"
      description="OpenTofu module for helpers providing core platform functionality including workspace parsing, resource labeling, and logos integration for team and project management"
      href="https://github.com/osinfra-io/pt-arche-core-helpers"
    />
  </div>
  <div className="col col--4 margin-bottom--lg">
    <ModuleCard
      image="/img/project.svg"
      title="pt-arche-google-project"
      description="OpenTofu module that creates a GCP project with CIS GCP Benchmark compliance controls, billing budget alerts, Cloud Monitoring notification channels, and GCP API enablement"
      href="https://github.com/osinfra-io/pt-arche-google-project"
    />
  </div>
  <div className="col col--4 margin-bottom--lg">
    <ModuleCard
      image="/img/virtual-private-cloud.svg"
      title="pt-arche-google-network"
      description="OpenTofu module that creates a Shared VPC host project network with configurable firewall rules, regional subnetworks, VPC flow logging, optional Cloud NAT, and Cloud DNS managed zones"
      href="https://github.com/osinfra-io/pt-arche-google-network"
    />
  </div>
  <div className="col col--4 margin-bottom--lg">
    <ModuleCard
      image="/img/gke.svg"
      title="pt-arche-google-kubernetes-engine"
      description="OpenTofu module that provisions a GKE cluster with Workload Identity, KMS encryption, CIS GKE Benchmark hardening, and GKE Fleet support for multi-cluster service discovery and ingress"
      href="https://github.com/osinfra-io/pt-arche-google-kubernetes-engine"
    />
  </div>
  <div className="col col--4 margin-bottom--lg">
    <ModuleCard
      image="/img/cloud-storage.svg"
      title="pt-arche-google-storage-bucket"
      description="OpenTofu module that creates a Google Cloud Storage bucket with uniform bucket-level access, public access prevention, optional object versioning, and customer-managed encryption key support"
      href="https://github.com/osinfra-io/pt-arche-google-storage-bucket"
    />
  </div>
  <div className="col col--4 margin-bottom--lg">
    <ModuleCard
      image="/img/cloud-sql.svg"
      title="pt-arche-google-cloud-sql"
      description="OpenTofu module that provisions a Google Cloud SQL instance with configurable database version, high availability, automated backups, query insights, and private IP connectivity"
      href="https://github.com/osinfra-io/pt-arche-google-cloud-sql"
    />
  </div>
  <div className="col col--4 margin-bottom--lg">
    <ModuleCard
      image="/img/datadog.png"
      title="pt-arche-datadog-google-integration"
      description="OpenTofu module that configures Datadog's GCP integration using Workload Identity Federation, Pub/Sub log export, Cloud Asset project feeds, and optional BigQuery and GCS for Cloud Cost Management"
      href="https://github.com/osinfra-io/pt-arche-datadog-google-integration"
    />
  </div>
</div>

## Domain

These modules form the **Google Cloud** bounded context within Arche. The **Domain Served** column identifies which platform domain primarily consumes each module.

| Module | Domain Served | Purpose |
|---|---|---|
| `pt-arche-core-helpers` | All | Workspace parsing, labels, team data, environment detection |
| `pt-arche-google-project` | Corpus | CIS-compliant GCP project with billing, APIs, and monitoring |
| `pt-arche-google-network` | Corpus | Shared VPC with subnets, firewall rules, Cloud NAT, DNS |
| `pt-arche-google-kubernetes-engine` | Pneuma | GKE cluster with Workload Identity, KMS, CIS hardening, Fleet |
| `pt-arche-google-storage-bucket` | Corpus | GCS bucket with CMEK, uniform access, versioning |
| `pt-arche-google-cloud-sql` | Stream-aligned teams | Cloud SQL with HA, backups, private IP |
| `pt-arche-datadog-google-integration` | Corpus | Datadog GCP integration via Workload Identity, Pub/Sub, Cloud Asset |
