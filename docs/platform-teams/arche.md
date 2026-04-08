---
sidebar_label: Arche
description: The origin and first cause — the primordial source from which all platform foundations draw their initial form and essential nature.
---

import ModuleCard from '@site/src/components/ModuleCard';

# Arche

Arche is the origin and first cause — the primordial source from which all platform foundations draw their initial form and essential nature. Nothing above it exists without it.

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
      image="/img/istio.png"
      title="pt-arche-kubernetes-istio"
      description="OpenTofu module that deploys the Istio service mesh on GKE using Helm charts with optional ingress gateway, Cloud Armor WAF protection, and cert-manager integration for mTLS"
      href="https://github.com/osinfra-io/pt-arche-kubernetes-istio"
    />
  </div>
  <div className="col col--4 margin-bottom--lg">
    <ModuleCard
      image="/img/cert-manager.png"
      title="pt-arche-kubernetes-cert-manager"
      description="OpenTofu module for cert-manager on Google Kubernetes Engine"
      href="https://github.com/osinfra-io/pt-arche-kubernetes-cert-manager"
    />
  </div>
  <div className="col col--4 margin-bottom--lg">
    <ModuleCard
      image="/img/datadog.png"
      title="pt-arche-kubernetes-datadog-operator"
      description="OpenTofu module for the Datadog Kubernetes Operator on Google Kubernetes Engine"
      href="https://github.com/osinfra-io/pt-arche-kubernetes-datadog-operator"
    />
  </div>
  <div className="col col--4 margin-bottom--lg">
    <ModuleCard
      image="/img/opa.png"
      title="pt-arche-kubernetes-opa-gatekeeper"
      description="OpenTofu module for Open Policy Agent Gatekeeper on Google Kubernetes Engine"
      href="https://github.com/osinfra-io/pt-arche-kubernetes-opa-gatekeeper"
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
