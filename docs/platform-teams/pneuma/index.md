---
sidebar_label: Pneuma
description: The breath of life animating the platform via Kubernetes, orchestrating dynamic, self-healing, and scalable services atop the Logos foundation.
---

# Pneuma

Pneuma is the breath of life animating the platform via Kubernetes — orchestrating dynamic, self-healing, and scalable services atop the Logos foundation. Where Corpus gives form, Pneuma gives life, transforming infrastructure into workload environments capable of receiving and running application teams.

- **[Cluster Management](./cluster-management)**: GKE clusters with node auto-provisioning, Workload Identity, and Fleet enrollment
- **[Service Mesh](./service-mesh)**: Istio with mTLS, traffic management, and Cloud Armor-backed ingress
- **[Certificate Management](./certificate-management)**: Automated TLS provisioning via cert-manager and Let's Encrypt
- **[Policy Enforcement](./policy-enforcement)**: OPA Gatekeeper constraint templates and audit mode
- **[Observability](./observability)**: Datadog Operator for cluster metrics, traces, and log collection

Pneuma consumes Corpus networking and Logos team data to create fully operational Kubernetes environments.

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

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

#### Decision

**One cluster per zone.** Pneuma provisions one GKE cluster per zone (e.g., `pt-pneuma-us-east1-b`, `pt-pneuma-us-east4-a`). Clusters scale by adding zones, not by growing individual cluster size. Each cluster is independently managed, independently upgradeable, and independently recoverable.

**Five bounded contexts for cluster add-ons.** The workload runtime is decomposed into five areas of concern, each deployed and managed independently:

| Context | Tool | Concern |
|---|---|---|
| [Cluster Management](./cluster-management) | GKE | Compute, networking attachment, Workload Identity, Fleet enrollment |
| [Service Mesh](./service-mesh) | Istio | mTLS, traffic management, ingress, WAF |
| [Certificate Management](./certificate-management) | cert-manager | TLS issuance and renewal via Let's Encrypt |
| [Policy Enforcement](./policy-enforcement) | OPA Gatekeeper | Kubernetes admission control and audit |
| [Observability](./observability) | Datadog Operator | Metrics, logs, and traces from all workloads |

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

## Repositories

- **[pt-pneuma](https://github.com/osinfra-io/pt-pneuma)**: OpenTofu configuration for GKE clusters and Kubernetes add-ons (cert-manager, Istio, OPA Gatekeeper, Datadog Operator)
- **[pt-pneuma-istio-test](https://github.com/osinfra-io/pt-pneuma-istio-test)**: Example Istio test application that displays GKE cluster information; deployed as a container image to Google Artifact Registry and run on GKE clusters managed by pt-pneuma

### AI Context

- **[pt-pneuma-ai-context](https://github.com/osinfra-io/pt-pneuma-ai-context)**: Team-level Copilot instructions for `pt-pneuma-*` repositories
