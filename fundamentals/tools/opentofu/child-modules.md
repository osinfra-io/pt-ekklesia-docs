---
description: >-
  An OpenTofu module (usually the root module of a configuration) can call other
  modules to include their resources into the configuration.
---

# Child Modules

> An OpenTofu module (usually the root module of a configuration) can _call_ other modules to include their resources into the configuration. A module that has been called by another module is often referred to as a _child module._
>
> Child modules can be called multiple times within the same configuration, and multiple configurations can use the same child module.

## Catalog

### Core

<table data-view="cards"><thead><tr><th align="center"></th><th data-hidden data-card-target data-type="content-ref"></th><th data-hidden data-card-cover data-type="files"></th></tr></thead><tbody><tr><td align="center">Core Helpers</td><td><a href="https://github.com/osinfra-io/pt-arche-core-helpers">https://github.com/osinfra-io/pt-arche-core-helpers</a></td><td><a href="../../../.gitbook/assets/administration-card.png">administration-card.png</a></td></tr></tbody></table>

### Google Cloud Platform

<table data-view="cards"><thead><tr><th align="center"></th><th data-hidden data-card-target data-type="content-ref"></th><th data-hidden data-card-cover data-type="files"></th></tr></thead><tbody><tr><td align="center">Cloud SQL</td><td><a href="https://github.com/osinfra-io/pt-arche-google-cloud-sql">https://github.com/osinfra-io/pt-arche-google-cloud-sql</a></td><td><a href="../../../.gitbook/assets/cloud-sql-card.png">cloud-sql-card.png</a></td></tr><tr><td align="center">Datadog Integration</td><td><a href="https://github.com/osinfra-io/pt-arche-datadog-google-integration">https://github.com/osinfra-io/pt-arche-datadog-google-integration</a></td><td><a href="../../../.gitbook/assets/datadog-card.png">datadog-card.png</a></td></tr><tr><td align="center">Kubernetes Engine</td><td><a href="https://github.com/osinfra-io/pt-arche-google-kubernetes-engine">https://github.com/osinfra-io/pt-arche-google-kubernetes-engine</a></td><td><a href="../../../.gitbook/assets/kubernetes-engine-card.png">kubernetes-engine-card.png</a></td></tr><tr><td align="center">Network</td><td><a href="https://github.com/osinfra-io/pt-arche-google-network">https://github.com/osinfra-io/pt-arche-google-network</a></td><td><a href="../../../.gitbook/assets/virtual-private-cloud-card.png">virtual-private-cloud-card.png</a></td></tr><tr><td align="center">Project</td><td><a href="https://github.com/osinfra-io/pt-arche-google-project">https://github.com/osinfra-io/pt-arche-google-project</a></td><td><a href="../../../.gitbook/assets/project-card.png">project-card.png</a></td></tr><tr><td align="center">Storage Bucket</td><td><a href="https://github.com/osinfra-io/pt-arche-google-storage-bucket">https://github.com/osinfra-io/pt-arche-google-storage-bucket</a></td><td><a href="../../../.gitbook/assets/cloud-storage-card.png">cloud-storage-card.png</a></td></tr></tbody></table>

### Kubernetes

<table data-view="cards" data-full-width="false"><thead><tr><th align="center"></th><th data-hidden data-card-cover data-type="files"></th><th data-hidden></th><th data-hidden></th><th data-hidden data-card-target data-type="content-ref"></th><th data-hidden></th></tr></thead><tbody><tr><td align="center">cert-manager</td><td><a href="../../../.gitbook/assets/cert-manager-card.png">cert-manager-card.png</a></td><td></td><td></td><td><a href="https://github.com/osinfra-io/pt-arche-kubernetes-cert-manager">https://github.com/osinfra-io/pt-arche-kubernetes-cert-manager</a></td><td></td></tr><tr><td align="center">Datadog Operator</td><td><a href="../../../.gitbook/assets/datadog-card.png">datadog-card.png</a></td><td></td><td></td><td><a href="https://github.com/osinfra-io/pt-arche-kubernetes-datadog-operator">https://github.com/osinfra-io/pt-arche-kubernetes-datadog-operator</a></td><td></td></tr><tr><td align="center">Istio</td><td><a href="../../../.gitbook/assets/istio-card.png">istio-card.png</a></td><td></td><td></td><td><a href="https://github.com/osinfra-io/pt-arche-kubernetes-istio">https://github.com/osinfra-io/pt-arche-kubernetes-istio</a></td><td></td></tr><tr><td align="center">OPA Gatekeeper</td><td><a href="../../../.gitbook/assets/opa-card.png">opa-card.png</a></td><td></td><td></td><td><a href="https://github.com/osinfra-io/pt-arche-kubernetes-opa-gatekeeper">https://github.com/osinfra-io/pt-arche-kubernetes-opa-gatekeeper</a></td><td></td></tr></tbody></table>
