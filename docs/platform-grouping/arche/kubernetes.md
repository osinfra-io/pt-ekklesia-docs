---
sidebar_label: Kubernetes
---

import ModuleCard from '@site/src/components/ModuleCard';

# Kubernetes

Kubernetes add-on modules for service mesh, certificate management, policy enforcement, and cluster-level observability. These modules run on the GKE clusters provisioned by Pneuma.

## Modules

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
      description="OpenTofu module that deploys the Datadog Operator via Helm and manages a DatadogAgent custom resource. Platform invariants — Admission Controller, Workload Autoscaling, log collection, NPM, Orchestrator Explorer, SBOM, CSPM, and CWS — are always enabled. APM and Universal Service Monitoring are opt-in per team via the Logos schema."
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
  <div className="col col--4 margin-bottom--lg">
    <ModuleCard
      image="/img/agentgateway.svg"
      title="pt-arche-kubernetes-agentgateway"
      description="OpenTofu module that deploys the AgentGateway controller and an internal, ClusterIP-only AgentGateway proxy enrolled in Istio ambient mesh. Istio remains the public edge and Authentik enforcement point. Provides ordinary HTTP connectivity only; LLM, MCP, and A2A connectivity are not configured."
      href="https://github.com/osinfra-io/pt-arche-kubernetes-agentgateway"
    />
  </div>
  <div className="col col--4 margin-bottom--lg">
    <ModuleCard
      image="/img/authentik.svg"
      title="pt-arche-kubernetes-authentik"
      description="OpenTofu module that deploys Authentik on GKE via Helm and configures it as the centralized gateway identity provider, providing both an OIDC identity provider for Istio RequestAuthentication and an embedded outpost for the Istio ext_authz check endpoint"
      href="https://github.com/osinfra-io/pt-arche-kubernetes-authentik"
    />
  </div>
</div>
