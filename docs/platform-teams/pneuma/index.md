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

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Repositories

- **[pt-pneuma](https://github.com/osinfra-io/pt-pneuma)**: OpenTofu configuration for GKE clusters and Kubernetes add-ons (cert-manager, Istio, OPA Gatekeeper, Datadog Operator)
- **[pt-pneuma-istio-test](https://github.com/osinfra-io/pt-pneuma-istio-test)**: Example Istio test application that displays GKE cluster information; deployed as a container image to Google Artifact Registry and run on GKE clusters managed by pt-pneuma

### AI Context

- **[pt-pneuma-ai-context](https://github.com/osinfra-io/pt-pneuma-ai-context)**: Team-level Copilot instructions for `pt-pneuma-*` repositories

## Bounded Context

Pneuma is a downstream **Customer/Supplier** consumer of Corpus (networking and project infrastructure) and the Arche Shared Kernel (team data originating in Logos). It is an upstream supplier of Kubernetes clusters to all teams that need one — including Kryptos, which runs OpenBao on a Pneuma-managed cluster. See the [context map](/platform-teams#context-map).

### Ubiquitous Language

| Term | Meaning in this context |
|---|---|
| Certificate | An mTLS leaf certificate issued by cert-manager and signed by the mesh CA |
| Cluster | A GKE Kubernetes cluster deployed to one or more zones within a Corpus project |
| Constraint | An OPA Gatekeeper policy rule enforced at admission time against incoming Kubernetes resources |
| Fleet | A GCP construct grouping GKE clusters for unified management and policy |
| Operator | A Kubernetes controller deployed as an add-on (Datadog Operator, cert-manager) managing its resource lifecycle |
| Policy | A set of constraints defining the compliance posture for a cluster |
| Service mesh | The Istio control plane managing mTLS, traffic routing, and observability across all pods |
| Workload identity | See [Corpus Ubiquitous Language](/platform-teams/corpus#ubiquitous-language) — Pneuma consumes Workload Identity bindings provisioned by Corpus |

### Downstream Interfaces

| Output | Consumed By | Via | Description |
|---|---|---|---|
| GKE cluster | All teams | Direct cluster provisioning | Kubernetes environment for workload deployment |
| Kubernetes namespace | All teams | Pneuma onboarding workspace | Isolated namespace per team per cluster |

### Core Invariants

- mTLS is enforced on every cluster via Istio — no plaintext pod-to-pod traffic
- OPA Gatekeeper policy enforcement is active on every cluster — no workload is accepted without passing admission
- Datadog Operator observability is running on every cluster — no cluster ships without metrics, traces, and logs
- etcd is KMS-encrypted at rest — `database_encryption` with `state = "ENCRYPTED"` is hardcoded in the GKE module
- Workload Identity is enabled on every node pool — no static credentials for pod-level GCP access
- Shielded nodes with Secure Boot and integrity monitoring are enforced on every node — no unverified boot path
- Client certificate authentication is permanently disabled — `issue_client_certificate = false` is hardcoded
- Dataplane V2 (eBPF) is hardcoded as the network datapath — no legacy kube-proxy on any cluster

## Team Topologies

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
- Called workflows provide OpenTofu deployment pipelines — no CI/CD to build or maintain

**Germane load is built through:**

- Cloud-native orchestration: GKE internals, autoscaling, Workload Identity, and Fleet enrollment
- Zero-trust networking: Istio mTLS, traffic policy, and Datadog AAP integration
- Applied PKI: ECDSA root CA chains, cert-manager issuers, and istio-csr for mesh certificate signing
- Policy-as-code: Rego constraint authoring and audit-mode enforcement patterns

### Team Capacity

| | |
|---|---|
| **Headcount** | 1–2 platform engineers |
| **Day-to-day work** | GKE cluster operations, Kubernetes add-on upgrades, networking support for stream-aligned teams |
| **Scale signal** | Add a second engineer when cluster count grows or multiple add-on upgrades run in parallel — the one team where headcount scales with the platform |

## Architecture Decision Records

### Pneuma Cognitive Load Mitigation

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>April 2026</td><td>Pneuma, Platform Lead</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Pneuma operates 5 working domains against the Team Topologies recommended limit of 4, with 3 high-intrinsic domains at the guideline ceiling of 3. This places the team formally at 🔴 over limit in the platform cognitive load table. The structural risk is that an overloaded team becomes a bottleneck, accrues technical debt faster, and is more vulnerable to failure when any single domain demands sustained attention. Acknowledging the overload without a documented mitigation and re-evaluation commitment leaves the risk unmanaged organizationally.

The five domains — Cluster Management, Service Mesh, Certificate Management, Policy Enforcement, and Observability — cannot be separated without creating artificial coupling problems. cert-manager CRDs must exist before Istio certificate resources; OPA Gatekeeper runs against all workloads on the cluster. Splitting these concerns across teams would require tight coordination at every upgrade cycle and introduce more extraneous load than the split would remove.

#### Decisions

1. **Accept the 🔴 overload state as a managed risk.** The five domains are operationally inseparable at the cluster layer. This is a structural reality of the platform, not a resourcing failure. The risk is acknowledged, documented, and mitigated — not ignored.

2. **Arche Kubernetes modules are the primary load mitigation.** Each of the five domains has a corresponding `pt-arche-kubernetes-*` module that encapsulates all Helm chart management and complex resource orchestration. Pneuma engineers own configuration and integration, not implementation. This mitigation is load-bearing: if Arche module coverage degrades, Pneuma's effective cognitive load increases proportionally.

3. **Headcount of 1–2 engineers is an acknowledged trade-off.** One engineer can operate the domain within current scope because Arche modules absorb implementation complexity. A second engineer is the first scaling response when cluster count grows or parallel add-on upgrades become routine. This is a deliberate trade-off, not an oversight — a third engineer is not warranted while the scope remains at five domains and Arche coverage is intact.

4. **Explicit trigger conditions govern when this decision must be re-evaluated:**
   - A sixth domain is added to Pneuma's scope
   - Any `pt-arche-kubernetes-*` module loses coverage or is removed without a replacement
   - Incident rate or on-call burden increases in a pattern consistent with cognitive overload
   - The team drops below minimum headcount (fewer than 1 active engineer)
   - A stream-aligned team reports consistent delays in namespace provisioning or cluster support

#### Alternatives Considered

- **Split Pneuma into two teams (Cluster Management + Mesh/Add-ons)** — Rejected. The five domains are tightly coupled at deployment time: the `needs` dependency chain in the pipeline (cluster → onboarding → cert-manager → Istio → OPA → Datadog) requires a single owner who understands the full ordering. Splitting ownership would require cross-team coordination at every upgrade cycle, adding more extraneous load than the split removes.
- **Reduce scope by removing Policy Enforcement or Observability** — Rejected. Both domains are required for the Core Invariant: every cluster must have mTLS enforced, policy enforcement active, and observability running before any workload is accepted. Removing either breaks the platform's baseline readiness guarantee.
- **Add a third engineer proactively** — Deferred. Current headcount is sufficient while Arche module coverage is intact and cluster count is stable. Adding headcount ahead of a clear scaling signal increases coordination overhead without reducing cognitive load.

#### Consequences

- Arche module coverage is a **load-bearing dependency** for the Pneuma team's capacity. Any PR that removes or degrades an Arche module without a replacement must be evaluated for its impact on Pneuma's cognitive load before merge.
- Every new domain proposed for Pneuma must be accompanied by a corresponding Arche module that absorbs its implementation complexity, or by an explicit scope trade-off that removes an existing domain.
- The 🔴 overload state in the platform cognitive load table is a known, managed risk. It must be re-examined at every headcount change, every scope change, and every Arche coverage change.
