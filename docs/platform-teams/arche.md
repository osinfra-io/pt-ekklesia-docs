---
sidebar_label: Arche — Modules
description: Reusable OpenTofu child modules for GCP, Kubernetes, and observability.
---

# Arche — Modules

Arche provides the reusable OpenTofu child modules consumed by all platform infrastructure layers:

- **[pt-arche-core-helpers](https://github.com/osinfra-io/pt-arche-core-helpers)** — Environment detection, labels, project naming
- **[pt-arche-google-project](https://github.com/osinfra-io/pt-arche-google-project)** — GCP project creation with CIS compliance
- **[pt-arche-google-network](https://github.com/osinfra-io/pt-arche-google-network)** — VPC, subnets, and firewall rules
- **[pt-arche-google-kubernetes-engine](https://github.com/osinfra-io/pt-arche-google-kubernetes-engine)** — GKE cluster provisioning
- **[pt-arche-google-storage-bucket](https://github.com/osinfra-io/pt-arche-google-storage-bucket)** — Cloud Storage with KMS encryption
- **[pt-arche-google-cloud-sql](https://github.com/osinfra-io/pt-arche-google-cloud-sql)** — Cloud SQL instances
- **[pt-arche-kubernetes-istio](https://github.com/osinfra-io/pt-arche-kubernetes-istio)** — Istio service mesh
- **[pt-arche-kubernetes-cert-manager](https://github.com/osinfra-io/pt-arche-kubernetes-cert-manager)** — cert-manager
- **[pt-arche-kubernetes-datadog-operator](https://github.com/osinfra-io/pt-arche-kubernetes-datadog-operator)** — Datadog Operator
- **[pt-arche-kubernetes-opa-gatekeeper](https://github.com/osinfra-io/pt-arche-kubernetes-opa-gatekeeper)** — OPA Gatekeeper
- **[pt-arche-datadog-google-integration](https://github.com/osinfra-io/pt-arche-datadog-google-integration)** — Datadog GCP integration

All modules are pinned to full 40-character commit SHAs and follow strict versioning.
