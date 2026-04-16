---
sidebar_label: Policy Enforcement
---

# Policy Enforcement

OPA Gatekeeper enforces platform policies on every GKE cluster, preventing non-compliant Kubernetes resources from being admitted.

- **Constraint templates**: Reusable policy definitions built on OPA's Rego language
- **Constraints**: Cluster-scoped policy instances that enforce rules with `deny` enforcement action

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Policies

| Constraint | Enforcement | Description |
|---|---|---|
| `K8sBlockIngress` | deny | Blocks creation of Kubernetes `Ingress` resources cluster-wide, except in the `istio-ingress` namespace, ensuring all external traffic flows through the Istio ingress gateway |

## Domain

| Entity | Description |
|---|---|
| `constraint-template` | A reusable policy definition written in Rego — parameterizable and cluster-scoped |
| `constraint` | An instance of a `constraint-template` with specific parameters (e.g., required label keys) |
| `rego-policy` | The Rego logic embedded in a `constraint-template` that defines what is and is not admitted |
| `audit-result` | A violation record produced when an existing resource fails a constraint in audit mode |

## Architecture Decision Records

### Block Ingress resources cluster-wide

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>April 2026</td><td>Pneuma</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

When Istio is the platform's ingress layer, allowing teams to create native Kubernetes `Ingress` resources alongside it creates an unmanaged bypass path. Traffic that enters via a standard ingress controller skips Istio's mTLS enforcement, traffic policies, and the Datadog Application-Aware Profiling integration. Policy must close this gap at admission time, before a misconfigured resource reaches the cluster.

#### Decision

Enforce `K8sBlockIngress` via OPA Gatekeeper across all clusters. All external traffic must enter through the Istio ingress gateway. The `istio-ingress` namespace is explicitly excluded so the gateway itself can be managed normally.

#### Alternatives Considered

- **Allow Ingress alongside Istio** — Rejected. Creates a dual-path traffic model that bypasses mTLS and service mesh policy. Enforcement becomes inconsistent — some traffic is governed by Istio, some is not.
- **Restrict via RBAC only** — Rejected. RBAC role bindings that remove `create` permission on `Ingress` are fragile and implicit; intent is buried in role definitions rather than surfaced as a visible cluster policy.

#### Consequences

- All external traffic enters through the Istio ingress gateway, maintaining uniform mTLS and traffic policy coverage across all workloads
- Application teams must use Istio `Gateway` and `VirtualService` resources instead of `Ingress` — this is documented in the [Service Mesh](./service-mesh.md) page
- The `istio-ingress` namespace is exempt, allowing the gateway itself to be created and managed
