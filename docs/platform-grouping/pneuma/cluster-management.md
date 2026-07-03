---
sidebar_label: Cluster Management
---

# Cluster Management

Pneuma is the **central cluster provisioner** for the platform. It reads all team configurations from Logos via `module.core_helpers.teams` and provisions clusters for every team that declares `platform_managed_project.kubernetes_engine` in their team spec. Currently pt-pneuma provisions its own clusters, but any team can get a cluster simply by declaring it in Logos — no changes to pt-pneuma are required.

- **GKE clusters**: Teams declare cluster locations in their Logos team spec under `platform_managed_project.kubernetes_engine`. Pneuma provisions a regional GKE cluster for each declared location — regional control plane (highly available across three zones) with one node pool per zone (e.g., `pt-pneuma-us-east1-b`). Zone-scoped node pools ensure Istio's locality-aware load balancing keeps traffic within a zone, eliminating cross-zone hot spots in the mesh. Clusters are CIS GKE Benchmark hardened and Fleet-enrolled for multi-cluster ingress.
- **Workload Identity**: Kubernetes service accounts are mapped to GCP service accounts, eliminating node-level credential access
- **Namespace onboarding**: A dedicated onboarding workspace in the Pneuma pipeline creates Kubernetes namespaces and Workload Identity bindings per team. It runs automatically within the same pipeline after the zonal cluster job completes — no separate trigger is needed once the pipeline starts. The Pneuma pipeline itself triggers on every merge to `pt-pneuma` main, or a platform engineer can trigger it immediately via `workflow_dispatch`.

## Namespace Provisioning

Namespaces are **driven by Logos team data** — each team declares `kubernetes_engine.namespaces` in their team spec via the Nomos Agent. Each team's onboarding workspace reads its own namespace configuration from `module.core_helpers.teams[team]` and provisions those namespaces into that team's own GKE clusters. No pull request to the cluster-owning team's repo is required.

Corpus and Pneuma are triggered independently — there is no automatic cascade from a Logos PR merge. A platform engineer must either merge a pending PR to each repo or manually trigger their `workflow_dispatch` workflow. Once the cluster-owning team's pipeline runs, the onboarding workspace applies namespace configuration automatically — no additional action is required.

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Components

| Component | Description |
|---|---|
| `gke-cluster` | A regional GKE cluster provisioned by Pneuma for a team, with a regional control plane (highly available across three zones) and zone-based node pools (e.g., `pt-pneuma-us-east1-b`). KMS-encrypted, Workload Identity enabled, CIS GKE Benchmark hardened, and Fleet-enrolled for multi-cluster ingress. |
| `node-pool` | A managed node pool with auto-provisioning, node auto-repair, and auto-upgrade |
| `fleet` | A GKE Fleet registration enabling multi-cluster service discovery and ingress across zones |
| `workload-identity` | Kubernetes-to-GCP service account mapping, allowing pods to authenticate to GCP without keys |

## Core Invariants

- etcd is KMS-encrypted at rest — `database_encryption` with `state = "ENCRYPTED"` is hardcoded in the GKE module.
- Workload Identity is enabled on every node pool — no static credentials for pod-level GCP access.
- Shielded nodes with Secure Boot and integrity monitoring are enforced on every node — no unverified boot path.
- Client certificate authentication is permanently disabled — `issue_client_certificate = false` is hardcoded.
- Dataplane V2 (eBPF) is hardcoded as the network datapath — no legacy kube-proxy on any cluster.

## Architecture Decision Records

### Team-Owned Regional Clusters with Zone-Based Node Pools

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>April 2026</td><td>Pneuma</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Teams that run Kubernetes workloads need dedicated clusters with lifecycles they control independently. A shared cluster creates coordination problems — one team's upgrade or misconfiguration can affect every other tenant, and the cluster's lifetime becomes coupled to the slowest consumer.

The platform must also provide a consistent cluster topology that works well with Istio's locality-aware routing. Spreading a single cluster across all zones causes the Istio control plane to route traffic cross-zone by default, introducing unnecessary latency.

#### Decision

Each team that needs Kubernetes infrastructure declares its cluster locations in the Logos team spec under `platform_managed_project.kubernetes_engine`. Corpus provisions the GCP project; Pneuma — the platform's central cluster provisioner — reads all team data from Logos via `module.core_helpers.teams` and provisions clusters for every declared location. Adding a new cluster requires only a Logos team spec change; no changes to `pt-pneuma` are needed.

**Regional control plane with zone-based node pools.** Each cluster has a regional control plane — highly available across three zones — but one node pool per zone (e.g., `pt-pneuma-us-east1-b`). Keeping node pools zone-local ensures Istio's locality-aware load balancing routes traffic within the zone by default, preventing cross-zone hot spots in the mesh. Clusters scale by adding zones; each zone is independently managed, independently upgradeable, and independently recoverable.

**Five add-on layers for every cluster.** The workload runtime is decomposed into five areas of concern, each deployed and managed independently from `pt-pneuma`:

| Layer | Tool | Concern |
|---|---|---|
| [Cluster Management](./cluster-management.md) | GKE | Compute, networking attachment, Workload Identity, Fleet enrollment |
| [Service Mesh](./service-mesh.md) | Istio | mTLS, traffic management, ingress, Datadog AAP |
| [Certificate Management](./certificate-management.md) | cert-manager | Istio CA, mTLS PKI, and workload certificate signing via istio-csr |
| [Policy Enforcement](./policy-enforcement.md) | OPA Gatekeeper | Kubernetes admission control and audit |
| [Observability](./observability.md) | Datadog Operator | Metrics, logs, and traces from all workloads |

Each layer maps to a dedicated subdirectory workspace in `pt-pneuma`, deployed in the correct order via GitHub Actions `needs` dependencies.

#### Alternatives Considered

- **One large cluster per environment shared by all teams** — Rejected. Single point of failure per environment. Blast radius of a misconfiguration or upgrade failure is the entire environment. Cannot scale horizontally without redesign. Creates cross-team coordination overhead for upgrades.
- **Bundle all add-ons into a single deployment step** — Rejected. CRD ordering constraints (e.g., cert-manager CRDs must exist before Istio certificate resources) require a defined deployment order. Separate workspaces with explicit dependencies makes this order visible and enforceable.

#### Consequences

- Zone failure is contained — other clusters continue serving traffic
- Add-on upgrades (e.g., Istio minor version) are applied per cluster without touching cluster infrastructure
- Teams control their cluster configuration through Logos — adding or changing a cluster requires only a Nomos Agent PR, no changes to `pt-pneuma`
- Adding a new zone requires claiming a CIDR slot from the Corpus IPAM plan
