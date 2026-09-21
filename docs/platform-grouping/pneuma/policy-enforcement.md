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
| `K8sProtectGatewayAuth` | deny | Restricts gateway authentication and authorization resources — and the lifecycle and `Secrets` of the Authentik namespace — to an explicit allow-list of platform principals |

## Gateway Authentication Guardrail

`K8sProtectGatewayAuth` closes the gap left by [Gateway Authentication](./gateway-authentication.md): auth intent is declared in Logos, so nobody should be able to edit the rendered Istio resources directly on a cluster. The guardrail denies any change to those resources unless the requesting principal is explicitly allow-listed.

The policy is defined once in `pt-arche-kubernetes-opa-gatekeeper` and parameterized by the consumer, so each environment supplies its own principals and protected scope rather than carrying a forked copy of the Rego.

| Parameter | Description |
|---|---|
| `allowed_users` | Usernames and service-account identities permitted to manage the protected resources. Pneuma allow-lists its GitHub Actions deployer, which is bound as a namespaced `User` rather than a member of `system:masters`. |
| `allowed_groups` | Break-glass groups. Defaults to `system:masters`. |
| `protected_kinds` | The `apiGroup` and `kind` pairs the guardrail protects. Defaults to the Istio `EnvoyFilter`, `AuthorizationPolicy`, and `RequestAuthentication` resources. |
| `protected_namespaces` | Namespaces whose lifecycle and `Secrets` are protected. Pneuma protects the Authentik namespace. |

Gatekeeper audit reviews carry no requesting principal, so identity cannot be evaluated for them. The policy treats those reviews as allowed — otherwise every pre-existing protected resource would be reported as a violation. Enforcement still applies to admission requests, which always identify the requester.

| Boundary | Responsibility |
|---|---|
| Arche | Owns the reusable `K8sProtectGatewayAuth` template, Rego policy, and constraint. |
| Pneuma | Supplies the environment-specific principals and protected scope, and deploys the constraint to every cluster. |

## Components

The primary resource is `constraint-template` — a reusable Rego policy definition deployed to every cluster. Each template is parameterizable and cluster-scoped; concrete policies are instances of a template applied with specific parameters.

| Component | Description |
|---|---|
| `constraint` | An instance of a `constraint-template` with specific parameters (e.g., the namespace exemption list for `K8sBlockIngress`) |
| `rego-policy` | The Rego logic embedded in a `constraint-template` defining what is and is not admitted |
| `audit-result` | A violation record produced when an existing resource fails a constraint in audit mode |

## Core Invariants

- OPA Gatekeeper policy enforcement is active on every cluster — no workload is accepted without passing admission.
- Gateway authentication resources are changed only by explicitly allow-listed platform principals.

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

### Parameterize the gateway authentication guardrail

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>September 2026</td><td>Pneuma, Arche</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

The `K8sProtectGatewayAuth` guardrail originally hardcoded its break-glass allow-list to the `system:masters` group, along with the protected kinds and namespaces. That assumption does not hold for every consumer. Pneuma's GitHub Actions deployer is bound as a namespaced `User` and is not a member of `system:masters`, so the guardrail would have denied Pneuma's own deployments of the very resources it renders. Pneuma worked around this by forking the template, Rego policy, and constraint into its own repository — leaving two copies of the same policy that rendered identical Kubernetes object names and drifted apart.

#### Decision

Parameterize the guardrail in `pt-arche-kubernetes-opa-gatekeeper`. The allow-listed users and groups, the protected kinds, and the protected namespaces are module inputs validated by the constraint template's `openAPIV3Schema`. The defaults preserve the original behavior, so consumers that do not configure anything are unaffected. Pneuma consumes the module and supplies its own values.

#### Alternatives Considered

- **Keep the fork in Pneuma** — Rejected. Two copies of the same policy rendered the same template and constraint names, which collide when both are declared, and security logic diverges as only one copy receives fixes.
- **Add Pneuma's deployer to `system:masters`** — Rejected. Granting cluster-admin to a CI identity to satisfy a policy defeats the purpose of the guardrail and vastly widens the blast radius of a compromised workflow.

#### Consequences

- The guardrail's Rego logic is maintained and tested in exactly one place
- Consumers declare their own platform principals rather than inheriting an assumption about cluster-admin membership
- Adding a protected resource or namespace is a configuration change rather than a policy rewrite
- Consumers are responsible for keeping their allow-list minimal — a permissive `allowed_users` weakens the guardrail silently
