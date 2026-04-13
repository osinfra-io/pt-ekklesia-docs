---
sidebar_label: Kubernetes
---

import ModuleCard from '@site/src/components/ModuleCard';

# Kubernetes

Kubernetes add-on modules for service mesh, certificate management, policy enforcement, and cluster-level observability. These modules run on the GKE clusters provisioned by Pneuma.

<div className="row">
  <div className="col col--4 margin-bottom--lg">
    <ModuleCard
      image="/img/istio.png"
      title="pt-arche-kubernetes-istio"
      description="OpenTofu module that deploys the Istio service mesh on GKE using Helm charts with optional ingress gateway, Cloud Armor WAF with adaptive protection and rate limiting, and cert-manager integration for ingress gateway TLS"
      href="https://github.com/osinfra-io/pt-arche-kubernetes-istio"
    />
  </div>
  <div className="col col--4 margin-bottom--lg">
    <ModuleCard
      image="/img/cert-manager.png"
      title="pt-arche-kubernetes-cert-manager"
      description="OpenTofu module that generates a self-signed ECDSA root CA and deploys cert-manager via Helm; the regional subdirectory deploys istio-csr to replace istiod's Citadel CA for Kubernetes workload certificate signing"
      href="https://github.com/osinfra-io/pt-arche-kubernetes-cert-manager"
    />
  </div>
  <div className="col col--4 margin-bottom--lg">
    <ModuleCard
      image="/img/datadog.png"
      title="pt-arche-kubernetes-datadog-operator"
      description="OpenTofu module that deploys the Datadog Operator via Helm and manages a DatadogAgent custom resource with configurable observability features including log collection, NPM, USM, Orchestrator Explorer, SBOM, and optional APM and security modules"
      href="https://github.com/osinfra-io/pt-arche-kubernetes-datadog-operator"
    />
  </div>
  <div className="col col--4 margin-bottom--lg">
    <ModuleCard
      image="/img/opa.png"
      title="pt-arche-kubernetes-opa-gatekeeper"
      description="OpenTofu module that deploys OPA Gatekeeper via Helm and manages ConstraintTemplate and Constraint resources for admission-time policy enforcement across GKE clusters"
      href="https://github.com/osinfra-io/pt-arche-kubernetes-opa-gatekeeper"
    />
  </div>
</div>
