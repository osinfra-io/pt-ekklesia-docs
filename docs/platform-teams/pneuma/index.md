---
sidebar_label: Pneuma
description: The breath of life animating the platform via Kubernetes, orchestrating dynamic, self-healing, and scalable services atop the Logos foundation.
---

# Pneuma

Pneuma is the breath of life animating the platform via Kubernetes — orchestrating dynamic, self-healing, and scalable services atop the Logos foundation. Where Corpus gives form, Pneuma gives life, transforming infrastructure into workload environments capable of receiving and running application teams.

- **[Cluster Management](./cluster-management.md)**: GKE clusters with autoscaling node pools, Workload Identity, and Fleet enrollment
- **[Service Mesh](./service-mesh.md)**: Istio with mTLS, traffic management, and Datadog AAP-backed ingress
- **[Certificate Management](./certificate-management.md)**: cert-manager with istio-csr as the mesh CA, issuing all workload mTLS certificates from a self-signed root
- **[Policy Enforcement](./policy-enforcement.md)**: OPA Gatekeeper constraint templates and audit mode
- **[Observability](./observability.md)**: Datadog Operator for cluster metrics, traces, and log collection

Pneuma consumes Corpus networking and Logos team data to create fully operational Kubernetes environments.

## Repositories

- **[pt-pneuma](https://github.com/osinfra-io/pt-pneuma)**: OpenTofu configuration for GKE clusters and Kubernetes add-ons (cert-manager, Istio, OPA Gatekeeper, Datadog Operator)
- **[pt-pneuma-istio-test](https://github.com/osinfra-io/pt-pneuma-istio-test)**: Example Istio test application that displays GKE cluster information; deployed as a container image to Google Artifact Registry and run on GKE clusters managed by pt-pneuma

### AI Context

- **[pt-pneuma-ai-context](https://github.com/osinfra-io/pt-pneuma-ai-context)**: Team-level Copilot instructions for `pt-pneuma-*` repositories
