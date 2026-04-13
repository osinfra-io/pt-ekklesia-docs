---
sidebar_label: Policy Enforcement
---

# Policy Enforcement

OPA Gatekeeper enforces platform policies on every GKE cluster, preventing non-compliant Kubernetes resources from being admitted.

- **Constraint templates**: Reusable policy definitions built on OPA's Rego language
- **Constraints**: Cluster-scoped policy instances that enforce rules with `deny` enforcement action

## Policies

| Constraint | Enforcement | Description |
|---|---|---|
| `K8sBlockIngress` | deny | Blocks creation of Kubernetes `Ingress` resources cluster-wide, except in the `istio-ingress` namespace, ensuring all external traffic flows through the Istio ingress gateway |
