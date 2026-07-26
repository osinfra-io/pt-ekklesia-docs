---
sidebar_label: Cluster Management
---

# Cluster Management

Pneuma provisions one GKE cluster per zone for every team that declares `platform_managed_project.kubernetes_engine_locations` in its Logos team spec. Each cluster has a regional control plane (HA across three zones) with nodes pinned to a single zone — keeping Istio's locality-aware routing within the zone and preventing cross-zone scheduling hot spots.

Clusters are named `{team}-{zone}` (e.g., `pt-pneuma-us-east1-b`) and filtered per environment: sandbox and non-production deploy two zones (one per region), production deploys all six.

## Namespace Provisioning

Teams declare `kubernetes_engine.namespaces` in their Logos team spec. Pneuma's onboarding workspace provisions those namespaces and for each one:

- creates a dedicated Workload Identity service account, and
- binds the team's GitHub Actions service account (from Corpus) as a namespace-scoped `namespace-admin` via RBAC.

This gives each team self-serve deployment into its own namespaces without access to other teams' namespaces or the cluster itself.

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Components

| Component | Description |
|---|---|
| `gke-cluster` | Regional GKE cluster with nodes pinned to a single zone. KMS-encrypted etcd, Workload Identity, CIS GKE Benchmark hardened, Fleet-enrolled. |
| `node-pool` | Managed node pool with auto-provisioning, auto-repair, and auto-upgrade |
| `fleet` | GKE Fleet registration for multi-cluster service discovery and ingress |
| `workload-identity` | Kubernetes-to-GCP service account mapping — pods authenticate to GCP without keys |

## Core Invariants

- etcd is KMS-encrypted at rest — `database_encryption` with `state = "ENCRYPTED"` is hardcoded in the GKE module.
- Workload Identity is enabled on every node pool — no static credentials for pod-level GCP access.
- Shielded nodes with Secure Boot and integrity monitoring are enforced on every node — no unverified boot path.
- Client certificate authentication is permanently disabled — `issue_client_certificate = false` is hardcoded.
- Dataplane V2 (eBPF) is hardcoded as the network datapath — no legacy kube-proxy on any cluster.

## Architecture Decision Records

### Per-Zone Clusters with Regional Control Planes

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>April 2026</td><td>Pneuma</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Teams need dedicated clusters with independent lifecycles. A shared cluster couples every tenant to the slowest consumer's upgrade cadence and makes one team's misconfiguration everyone's problem.

The cluster topology must also work with Istio's locality-aware routing — spreading nodes across all zones causes cross-zone traffic by default.

#### Decision

Each team declares cluster locations in its Logos team spec under `platform_managed_project.kubernetes_engine`. Corpus provisions the GCP project; Pneuma provisions clusters for every declared location. Adding a cluster requires only a Logos change.

**Regional control plane with single-zone node placement.** Each cluster has a regional control plane (HA across three zones) but nodes pinned to one zone via `node_locations`. This keeps Istio routing zone-local by default and avoids cross-zone scheduling hot spots. Clusters scale by adding zones; each zone is independently upgradeable and recoverable.

**Five add-on layers.** The workload runtime is decomposed into independently deployed layers:

| Layer | Tool | Concern |
|---|---|---|
| [Cluster Management](./cluster-management.md) | GKE | Compute, networking, Workload Identity, Fleet enrollment |
| [Service Mesh](./service-mesh.md) | Istio | mTLS, traffic management, ingress |
| [Certificate Management](./certificate-management.md) | cert-manager | Istio CA, mTLS PKI via istio-csr |
| [Policy Enforcement](./policy-enforcement.md) | OPA Gatekeeper | Admission control and audit |
| [Observability](./observability.md) | Datadog Operator | Metrics, logs, and traces |

Each layer maps to a subdirectory workspace in `pt-pneuma`, deployed in order via GitHub Actions `needs` dependencies.

#### Alternatives Considered

- **One shared cluster per environment** — Rejected. Single point of failure; blast radius is the entire environment; cannot scale horizontally; creates cross-team upgrade coordination overhead.
- **Bundle all add-ons into one deployment step** — Rejected. CRD ordering constraints (e.g., cert-manager CRDs before Istio certificate resources) require explicit sequencing. Separate workspaces make the order visible and enforceable.

#### Consequences

- Zone failure is contained — other clusters continue serving
- Add-on upgrades apply per cluster without touching cluster infrastructure
- Teams add or change clusters via Logos only — no `pt-pneuma` changes required
- Adding a zone requires claiming a CIDR slot from the Corpus IPAM plan

### Centralized Namespace Provisioning with Per-Team RBAC

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>July 2026</td><td>Pneuma</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Namespace provisioning needs a single source of truth. Letting each team manage namespaces from its own repo would fragment cluster credentials across many pipelines and make cluster-wide invariants (naming, Workload Identity, sidecar injection) impossible to enforce.

At the same time, each team needs to deploy workloads from its own CI/CD pipeline without accessing other teams' namespaces or the cluster itself.

#### Decision

Pneuma centralizes all namespace provisioning in a single pipeline via per-cluster provider `for_each`. Teams declare namespaces in their Logos team spec; Pneuma creates them and grants each team scoped access through RBAC:

- A dedicated Workload Identity service account per namespace
- The team's GitHub Actions service account (from Corpus) bound as a namespace-scoped `namespace-admin`

Teams deploy into their own namespaces from their own pipelines. No cross-team access is possible.

#### Alternatives Considered

- **Each team provisions namespaces from its own repo** — Rejected. Fragments cluster credentials across many pipelines and prevents centrally enforced invariants.
- **Grant each team cluster-admin** — Rejected. Violates inter-team trust boundary; any team could access every other team's namespaces.

#### Consequences

- Cluster-wide invariants (naming, Workload Identity, sidecar policy) are enforced in one place
- Each team can self-serve deployments into its own namespaces only
- Every namespace gets a Workload Identity service account; runtime GCP bindings are requested separately via the Nomos Agent
- The cluster set must reach zone workspaces as `TF_VAR_clusters` because provider `for_each` cannot read module outputs
