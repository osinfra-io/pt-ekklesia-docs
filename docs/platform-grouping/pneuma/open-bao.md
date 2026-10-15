---
sidebar_label: OpenBao
---

# OpenBao

OpenBao is the platform secrets service. Pneuma deploys the OpenBao Helm release into the `pt-pneuma-openbao` namespace on its GKE clusters in every active zone.

## Current service

| Pneuma owns | Consumers own |
| --- | --- |
| GKE clusters, cluster add-ons, OpenBao release, configuration, authentication methods, policies, and secret-engine lifecycle | Workload identities and requests for approved secret or policy paths |

The current implementation establishes the OpenBao runtime. Kubernetes authentication, PKI, KV, database engines, and consumer-specific policies are added only when their lifecycle and ownership model are defined.

## Requesting access or a capability

Provide the workload identity, environment, required secret type, expected rotation or lease behavior, and the minimum paths or operations needed. Pneuma reviews the request and implements the policy or engine as code.

Do not place static credentials in source repositories, OpenTofu variables, or CI environment settings while waiting for an integration.

## Deployment lifecycle

Pull requests deploy sandbox, merges to `main` deploy non-production, and successful non-production runs promote to production. The zonal OpenBao workspaces deploy in parallel after the cluster runtime is available.

## Core invariant

Secrets are delivered through approved OpenBao identities and policies with the shortest practical lifetime and least privilege.
