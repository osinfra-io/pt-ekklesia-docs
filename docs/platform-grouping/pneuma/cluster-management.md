---
sidebar_label: Cluster Management
---

# Cluster Management

Pneuma is the **central cluster provisioner** for the platform. It reads all team configurations from Logos via `module.core_helpers.teams` and provisions clusters for every team that declares `platform_managed_project.kubernetes_engine` in their team spec. Currently pt-pneuma provisions its own clusters, but any team can get a cluster simply by declaring it in Logos — no changes to pt-pneuma are required.

- **GKE clusters**: Teams declare cluster locations in their Logos team spec under `platform_managed_project.kubernetes_engine`. Pneuma provisions a regional GKE cluster for each declared location — regional control plane (highly available across three zones) with one node pool per zone (e.g., `pt-pneuma-us-east1-b`). Zone-scoped node pools ensure Istio's locality-aware load balancing keeps traffic within a zone, eliminating cross-zone hot spots in the mesh. Clusters are CIS GKE Benchmark hardened and Fleet-enrolled for multi-cluster ingress.
- **Workload Identity**: Kubernetes service accounts are mapped to GCP service accounts, eliminating node-level credential access
- **Namespace onboarding**: A dedicated onboarding workspace in the Pneuma pipeline creates Kubernetes namespaces per team, provisions a Workload Identity service account for each namespace, and binds the team's GitHub Actions service account as a namespace-scoped administrator (RBAC). It runs automatically within the same pipeline after the zonal cluster job completes — no separate trigger is needed once the pipeline starts. The Pneuma pipeline itself triggers on every merge to `pt-pneuma` main, or a platform engineer can trigger it immediately via `workflow_dispatch`.

## Namespace Provisioning

Namespaces are **driven by Logos team data** — each team declares `kubernetes_engine.namespaces` in their team spec via the Nomos Agent. Each team's onboarding workspace reads its own namespace configuration from `module.core_helpers.teams[team]` and provisions those namespaces into that team's own GKE clusters. No pull request to the cluster-owning team's repo is required.

Pneuma **owns the clusters; each team owns the namespaces it declares within its own cluster.** For every namespace it creates, Pneuma provisions a dedicated Workload Identity service account and binds the team's GitHub Actions service account (created in Corpus) as a namespace-scoped `namespace-admin` via Kubernetes RBAC. This lets a stream-aligned team deploy its own workloads into its namespaces — from its own GitHub Actions pipelines — without granting any access to another team's namespaces or to the cluster itself. A per-namespace Workload Identity service account is always provisioned; teams no longer supply a service account in the namespace spec.

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

### Platform-Owned Clusters with Team-Scoped Namespace Administration

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>July 2026</td><td>Pneuma</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Stream-aligned teams need to deploy their own workloads into their own clusters from their own CI/CD pipelines. The platform team has high trust in each stream-aligned team within that team's own boundary, but trust **between** stream-aligned teams is deliberately low — one team must never be able to read or mutate another team's namespaces, and no team should be able to reconfigure the cluster itself.

Provisioning also needs a single source of truth. Letting each team manage namespaces from its own repository would fragment cluster access, duplicate provider wiring across many pipelines, and make cluster-wide invariants (naming, Workload Identity, sidecar policy) impossible to enforce centrally.

#### Decision

Pneuma provisions namespaces and Kubernetes add-ons across **every** team's clusters from a single pipeline, iterating all teams' clusters via a per-cluster Kubernetes and Helm provider `for_each`. The cluster set is sourced from Logos team data and passed to each zone workspace as an input variable so it satisfies OpenTofu's static requirement for provider `for_each`.

The platform team owns the clusters; each stream-aligned team owns the namespaces it declares within its own cluster. For every namespace it creates, Pneuma:

- provisions a dedicated Workload Identity service account, and
- binds that team's GitHub Actions service account (created in Corpus) as a **namespace-scoped `namespace-admin`** via Kubernetes RBAC.

A team's GitHub Actions pipeline can therefore deploy workloads into its own namespaces without any access to another team's namespaces or to cluster-scoped resources. The per-namespace Workload Identity service account is always provisioned, so the namespace spec no longer carries an optional service account field.

#### Alternatives Considered

- **Each team provisions its own namespaces from its own repository** — Rejected. Fragments cluster credentials across many pipelines, duplicates provider wiring, and prevents the platform team from enforcing cluster-wide invariants. It also requires per-team workflow plumbing in every sibling workspace, which does not scale.
- **Grant each team's GitHub Actions service account cluster-admin** — Rejected. Violates the low inter-team trust boundary. A cluster-admin binding would let any team read or mutate every other team's namespaces and reconfigure the cluster.

#### Consequences

- One pipeline (`pt-pneuma`) provisions namespaces and add-ons for all teams; cluster-wide invariants are enforced centrally
- Each team's GitHub Actions service account can self-serve deployments into its own namespaces, but cannot touch another team's namespaces or the cluster itself
- Every namespace is guaranteed a Workload Identity service account; runtime GCP-API bindings for a workload are requested separately through the Nomos Agent when needed
- The cluster set must reach each zone workspace as an input variable (`TF_VAR_clusters`), because provider `for_each` cannot read module outputs or remote state — the deployment workflow passes the main workspace's `clusters` output into each zone job
