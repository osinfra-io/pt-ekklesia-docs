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

## Domain

Pneuma is a downstream **Customer/Supplier** consumer of Corpus (networking and project infrastructure) and the Arche Shared Kernel (team data originating in Logos). It is an upstream supplier of Kubernetes clusters to all teams that need one — including Kryptos, which runs OpenBao on a Pneuma-managed cluster. See the [context map](/platform-teams#context-map).

### Ubiquitous Language

| Term | Meaning in this domain |
|---|---|
| Certificate | An mTLS leaf certificate issued by cert-manager and signed by the mesh CA |
| Cluster | A GKE Kubernetes cluster deployed to one or more zones within a Corpus project |
| Constraint | An OPA Gatekeeper policy rule enforced at admission time against incoming Kubernetes resources |
| Fleet | A GCP construct grouping GKE clusters for unified management and policy |
| Node pool | A group of identically configured VMs within a cluster that run workload pods |
| Operator | A Kubernetes controller deployed as an add-on (Datadog Operator, cert-manager) managing its resource lifecycle |
| Policy | A set of constraints defining the compliance posture for a cluster |
| Service mesh | The Istio control plane managing mTLS, traffic routing, and observability across all pods |
| Workload identity | A binding between a Kubernetes service account and a GCP service account — no static keys |
| Zone | A GCP availability zone where cluster nodes run |

### Downstream Interfaces

| Output | Consumed By | Via | Description |
|---|---|---|---|
| GKE cluster | All teams | Direct cluster provisioning | Kubernetes environment for workload deployment |
| Kubernetes namespace | All teams | Logos team provisioning | Isolated namespace per team per cluster |
| GKE cluster | Kryptos | Direct cluster provisioning | Dedicated cluster for OpenBao secrets infrastructure |

### Core Invariant

Every cluster has mTLS enforced, policy enforcement active, and observability running.

### Cognitive Load

Pneuma is the most cognitively demanding platform team. It operates three domains of high inherent complexity simultaneously — Kubernetes clusters, an Istio service mesh, and a full PKI chain for workload certificates — alongside policy enforcement and observability. This is by design: these domains are inseparable at the cluster layer, and Arche modules carry the implementation weight so Pneuma engineers focus on orchestration and configuration rather than raw tooling.

| Working Domains | High Intrinsic Domains |
|---|---|
| 🔴 5 / 4 | 🟠 3 / 3 |

Cognitive load by domain:

| Domain | Intrinsic | Extraneous Reduced By | Germane Expertise |
|---|---|---|---|
| Cluster Management | 🔴 High | Arche GKE module | GKE internals, Fleet enrollment |
| Service Mesh | 🔴 High | Arche Istio module | mTLS, traffic policy |
| Certificate Management | 🔴 High | Arche cert-manager module | PKI chains, issuers |
| Policy Enforcement | 🟡 Medium | Arche OPA module | Rego, constraint authoring |
| Observability | 🟡 Medium | Arche Datadog module | Cluster metrics & traces |

**Capacity**: 3 high-complexity domains — at the Team Topologies guideline of 2–3; team members hold 5 active domains — above the ~4 working-knowledge limit. Arche Kubernetes modules are the primary mitigation: all Helm-based add-on deployment is encapsulated, leaving Pneuma to own configuration and integration rather than implementation.

**Extraneous load is minimized by:**

- Arche Kubernetes modules (`pt-arche-kubernetes-*`) wrap Istio, cert-manager, OPA Gatekeeper, and the Datadog Operator — no raw Helm chart management
- Corpus handles all networking prerequisites; Pneuma consumes them via `module.core_helpers`
- All state is managed exclusively in GitHub Actions — no local backend access required

**Germane load is built through:**

- Cloud-native orchestration: GKE internals, autoscaling, Workload Identity, and Fleet enrollment
- Zero-trust networking: Istio mTLS, traffic policy, and Datadog AAP integration
- Applied PKI: ECDSA root CA chains, cert-manager issuers, and istio-csr for mesh certificate signing
- Policy-as-code: Rego constraint authoring and audit-mode enforcement patterns

### Team Capacity

| | |
|---|---|
| **Headcount** | 1–2 domain engineers |
| **Day-to-day work** | GKE cluster operations, Kubernetes add-on upgrades, networking support for stream-aligned teams |
| **Scale signal** | Add a second engineer when cluster count grows or multiple add-on upgrades run in parallel — the one team where headcount scales with the platform |
