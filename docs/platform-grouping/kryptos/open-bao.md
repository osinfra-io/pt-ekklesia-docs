---
sidebar_label: OpenBao
---

# OpenBao

OpenBao is the platform secrets service. Kryptos deploys the OpenBao Helm release into the `pt-kryptos-openbao` namespace on Pneuma-managed GKE clusters in `us-east1-b` and `us-east4-a`.

## Current service

| Kryptos owns | Pneuma owns | Consumers own |
| --- | --- | --- |
| OpenBao release, configuration, authentication methods, policies, and secret-engine lifecycle | GKE clusters, cluster connectivity, and cluster-level add-ons | Workload identities and requests for approved secret or policy paths |

The current implementation establishes the OpenBao runtime. Kubernetes authentication, PKI, KV, database engines, and consumer-specific policies are added only when their lifecycle and ownership model are defined.

## Requesting access or a capability

Provide the workload identity, environment, required secret type, expected rotation or lease behavior, and the minimum paths or operations needed. Kryptos reviews the request and implements the policy or engine as code.

Do not place static credentials in source repositories, OpenTofu variables, or CI environment settings while waiting for an integration.

## Deployment lifecycle

Pull requests deploy sandbox, merges to `main` deploy non-production, and successful non-production runs promote to production. The two zonal OpenBao workspaces deploy in parallel after their Pneuma runtime is available.

## Core invariant

Secrets are delivered through approved OpenBao identities and policies with the shortest practical lifetime and least privilege.
