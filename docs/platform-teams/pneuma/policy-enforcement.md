---
sidebar_label: Policy Enforcement
---

# Policy Enforcement

OPA Gatekeeper enforces platform policies on every GKE cluster, preventing non-compliant Kubernetes resources from being admitted.

- **Constraint templates**: Reusable policy definitions built on OPA's Rego language
- **Constraints**: Cluster-scoped policy instances that enforce rules such as required labels, disallowed image registries, and resource limit requirements
- **Audit mode**: Existing resources are periodically evaluated against constraints, surfacing violations without blocking workloads
