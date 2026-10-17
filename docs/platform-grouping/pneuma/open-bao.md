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

## Ingress

OpenBao runs outside the Istio ambient mesh. It has its own global multi-cluster ingress and per-zone ingress endpoints; requests reach OpenBao directly rather than traversing the shared Istio gateway.

OpenBao uses a service-specific `BackendConfig`, separate from the Istio gateway's, retaining its own health check and referencing the shared `shared-ingress` Cloud Armor security policy through `securityPolicy.name`. Its ingress `FrontendConfig` resources reference the shared SSL policy, also named `shared-ingress`, through `sslPolicy`. The Pneuma main workspace manages both policies, not the Arche Istio module. See [Shared Ingress Policies](./service-mesh.md#shared-ingress-policies).

## End-to-end TLS

Traffic is encrypted from the client to the load balancer and again from the load balancer to the OpenBao pod. Each cluster runs a namespaced cert-manager CA `Issuer` in `pt-pneuma-openbao` that issues the `openbao-tls` certificate mounted by the OpenBao listener. Its SANs cover the external hostnames, the in-cluster service names, the `openbao-internal` pod names used for Raft, and `127.0.0.1` for the in-pod CLI. The OpenBao `Service` and multi-cluster `Service` declare the `https` port as `HTTPS` with `cloud.google.com/app-protocols`, and the `BackendConfig` health check uses `type: HTTPS`. The load balancer does not validate the backend certificate, so the private CA is sufficient for that leg. The OpenBao workspaces deploy after cert-manager in each zone, and are destroyed before it.

The OpenBao StatefulSet uses the chart's `OnDelete` update strategy, so enabling TLS on an existing cluster requires replacing pods after the apply: delete the standby pods one at a time, waiting for each to become healthy and rejoin, then delete the active pod. The HTTPS health check marks pods unhealthy until they are replaced.

## Auto-unseal

OpenBao unseals itself with a Cloud KMS key, so pods that restart (node upgrades, evictions, crashes) rejoin the cluster without manual `bao operator unseal` steps. The Pneuma main workspace creates a per-environment `openbao-unseal` key ring and `unseal` key in the Pneuma project's `us` multi-region location, protected with `prevent_destroy` because losing the key means losing access to every secret. OpenBao pods reach the key through GKE Workload Identity: the `openbao` Kubernetes service account is bound to the `openbao-kms` Google service account, which holds `roles/cloudkms.cryptoKeyEncrypterDecrypter` on the key.

A new cluster still needs a one-time `bao operator init`; the output is recovery keys rather than unseal keys. An existing cluster that was initialized with Shamir keys must be migrated once with `bao operator unseal -migrate`.

## Requesting access or a capability

Provide the workload identity, environment, required secret type, expected rotation or lease behavior, and the minimum paths or operations needed. Pneuma reviews the request and implements the policy or engine as code.

Do not place static credentials in source repositories, OpenTofu variables, or CI environment settings while waiting for an integration.

## Deployment lifecycle

Pull requests deploy sandbox, merges to `main` deploy non-production, and successful non-production runs promote to production. The zonal OpenBao workspaces deploy in parallel after the cluster runtime is available.

## Core invariant

Secrets are delivered through approved OpenBao identities and policies with the shortest practical lifetime and least privilege.
