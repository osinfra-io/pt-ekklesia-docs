---
sidebar_label: Cluster Management
---

# Cluster Management

Pneuma provisions one GKE cluster per zone, consuming Corpus networking and Logos team data. Clusters are CIS-hardened, Fleet-enrolled, and configured for Workload Identity from the start.

- **GKE clusters**: Regional clusters (highly available control plane) with a single-zone node pool per cluster — one cluster per zone (e.g., `pt-pneuma-us-east1-b`). Zone-scoped node pools ensure Istio's locality-aware load balancing keeps traffic within a zone, eliminating cross-zone hot spots in the mesh. Clusters are CIS GKE Benchmark hardened and Fleet-enrolled for multi-cluster ingress.
- **Workload Identity**: Kubernetes service accounts are mapped to GCP service accounts, eliminating node-level credential access
- **Namespace onboarding**: A dedicated onboarding workspace handles namespace creation and Workload Identity bindings per team after the cluster is provisioned

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Domain-Driven Design

| Entity | Description |
|---|---|
| `gke-cluster` | A regional GKE cluster (regional control plane with zone-scoped node pools, e.g., `pt-pneuma-us-east1`) with KMS encryption, Workload Identity, and CIS hardening — regional control planes with zone-scoped node pools reduce Istio control plane hotspots |
| `node-pool` | A managed node pool with auto-provisioning, node auto-repair, and auto-upgrade |
| `fleet` | A GKE Fleet registration enabling multi-cluster service discovery and ingress across zones |
| `workload-identity` | Kubernetes-to-GCP service account mapping, allowing pods to authenticate to GCP without keys |

## Architecture Decision Records

### One Cluster Per Zone with Five Bounded Contexts

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>April 2026</td><td>Pneuma</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Kubernetes workload environments require more than just a cluster — they need a service mesh, certificate management, admission policy enforcement, and observability before they are ready to receive application teams. These concerns are operationally distinct: they have different upgrade cycles, failure modes, and ownership boundaries. Running them as one undifferentiated deployment creates coordination problems and makes individual components hard to reason about or replace.

The platform also needs a clear scaling model for clusters. Sizing a single large cluster per environment requires predicting peak load. Cluster failure affects all tenants. Regional failure affects all zones at once.

#### Decisions

1. **Regional clusters with zone-scoped node pools.** Each cluster has a regional control plane (highly available across three zones) but a single-zone node pool — one cluster per zone (e.g., `pt-pneuma-us-east1-b`, `pt-pneuma-us-east4-a`). Keeping node pools zone-local ensures Istio's locality-aware load balancing routes traffic within the zone by default, preventing cross-zone hot spots in the mesh. Clusters scale by adding zones, not by growing individual cluster size. Each cluster is independently managed, independently upgradeable, and independently recoverable.

2. **Five bounded contexts for cluster add-ons.** The workload runtime is decomposed into five areas of concern, each deployed and managed independently:

| Context | Tool | Concern |
|---|---|---|
| [Cluster Management](./cluster-management.md) | GKE | Compute, networking attachment, Workload Identity, Fleet enrollment |
| [Service Mesh](./service-mesh.md) | Istio | mTLS, traffic management, ingress, Datadog AAP |
| [Certificate Management](./certificate-management.md) | cert-manager | TLS issuance and renewal via Let's Encrypt |
| [Policy Enforcement](./policy-enforcement.md) | OPA Gatekeeper | Kubernetes admission control and audit |
| [Observability](./observability.md) | Datadog Operator | Metrics, logs, and traces from all workloads |

Each context maps to a dedicated subdirectory workspace in `pt-pneuma`, deployed in the correct order via GitHub Actions `needs` dependencies.

#### Alternatives Considered

- **One large cluster per environment** — Rejected. Single point of failure per environment. Blast radius of a misconfiguration or upgrade failure is the entire environment. Cannot scale horizontally without redesign.
- **One cluster per team** — Rejected. Multiplies operational overhead without a commensurate benefit. The one-cluster-per-zone model provides tenant isolation via namespaces and OPA policies without per-team cluster sprawl.
- **Bundle all add-ons into a single deployment step** — Rejected. CRD ordering constraints (e.g., cert-manager CRDs must exist before Istio certificate resources) require a defined deployment order. Separate workspaces with explicit dependencies makes this order visible and enforceable.

#### Consequences

- Zone failure is contained — other clusters continue serving traffic
- Add-on upgrades (e.g., Istio minor version) are applied per cluster without touching cluster infrastructure
- Adding a new zone requires claiming a CIDR slot from the Corpus IPAM plan and adding a zonal workspace to `pt-pneuma`
- Each bounded context has its own subdirectory, workspace, and deployment job in the workflow
