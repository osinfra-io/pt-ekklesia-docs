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
</div>
