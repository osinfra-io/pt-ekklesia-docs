---
sidebar_label: OpenBao
---

# OpenBao

OpenBao is the platform secrets service. Pneuma deploys the OpenBao Helm release into the `pt-pneuma-openbao` namespace on its GKE clusters in every active zone.

Each deployment runs one OpenBao server replica with persistent Raft storage in every environment, including production. Raft mode remains enabled, but a single replica provides no server-level failover: pod restarts, node maintenance, and storage unavailability interrupt that deployment. Separate deployments do not automatically replicate their Raft data.

Before reducing an existing multi-member Raft cluster to one replica, back up its data and remove the retiring voters through the supported Raft peer-removal procedure while quorum is available. Changing the Helm replica count alone does not change Raft membership. Reusing PVCs after a Helm uninstall also preserves that membership; do not delete storage or reinitialize OpenBao as a scaling shortcut.

## Current service

| Pneuma owns | Consumers own |
| --- | --- |
| GKE clusters, cluster add-ons, OpenBao release, OIDC configuration, team policies, and secret-engine lifecycle | Workload identities and requests for approved secret or policy paths |

OpenBao provides Google-backed Authentik OIDC login and a KV v2 engine for Pneuma team secrets. Consumers must use the supported endpoint and approved team paths; they must not assume that data or authentication is replicated between zonal OpenBao installations.

## Supported endpoint and data scope

The global endpoint routes only to the `us-east1-b` OpenBao instance:

| Environment | Endpoint |
| --- | --- |
| Sandbox | `openbao.sb.osinfra.io` |
| Non-production | `openbao.nonprod.osinfra.io` |
| Production | `openbao.osinfra.io` |

OpenBao is deployed in multiple zones, but each installation has independent Raft data. The supported global hostname is deliberately backed only by `us-east1-b`; there is no cross-zone data replication. Use the environment's endpoint for all supported logins and secret access.

## Google-backed login and team access

OpenBao authenticates users through the dedicated Authentik OIDC provider, with Google as Authentik's upstream identity source. Authentik's `groups` claim maps membership to team-scoped policies. Team membership is managed per environment through the existing Logos/Nomos onboarding process.

The `team-kv` KV v2 mount scopes policies by the stable team key. The three group keys are:

| Group | Capabilities |
| --- | --- |
| `openbao-secret-readers` | Read secret values and list paths under the team's prefix; no writes |
| `openbao-secret-writers` | Create and update secrets under the team's prefix; no delete, undelete, destroy, or metadata deletion |
| `openbao-secret-admins` | Manage secret data, metadata, and versions under the team's prefix; no OpenBao system or mount administration |

For example, Pneuma's team prefix is `pt-pneuma`; use the KV path `team-kv/pt-pneuma/<secret-name>`. Policies are enforced against the KV v2 API paths and do not grant access to another team's prefix. OIDC tokens have a maximum lifetime of one hour. Removing a user from a group prevents future logins from receiving that group's policy, but does not revoke an already-issued token; it expires within the configured maximum lifetime.

Set `BAO_ADDR` to the endpoint for the environment. The UI offers OIDC login, and a browser-enabled CLI can authenticate with:

```bash
BAO_ADDR=https://openbao.sb.osinfra.io bao login -method=oidc -path=oidc role=default
```

Replace the sandbox endpoint with the non-production or production endpoint when appropriate.

## GitHub Actions operator bootstrap

Before the first `openbao-config` deployment in each environment, an OpenBao operator must bootstrap the GitHub Actions JWT auth mount and roles through a trusted administrative session. This is a one-time setup per environment; the OpenBao configuration workspace does not create its own credentials.

Configure the `github-actions` JWT auth mount to trust GitHub's issuer and JWKS endpoint (`https://token.actions.githubusercontent.com`). Create distinct `pt-pneuma-openbao-plan` and `pt-pneuma-openbao-apply` roles with the `pt-pneuma-openbao` audience. Bind the plan role to the Pneuma repository/ref and grant only the read capabilities required to plan the configuration workspace. Bind the apply role to the matching protected GitHub deployment environment and grant only the configuration capabilities required by that workspace. Review the exact repository, refs, and environment claims against the workflow before enabling the roles.

The reusable workflow uses `hashicorp/vault-action` to exchange a job-scoped GitHub OIDC token for an OpenBao token. OpenBao maintains compatibility with Vault API clients; see the [OpenBao discussion](https://github.com/orgs/openbao/discussions/2310). The action masks the token and returns it as a step output, passed only to the corresponding OpenTofu step rather than a job output or job-wide environment variable. Do not store an OpenBao root token or long-lived OpenBao token in GitHub. Apply continues to use the existing protected `OpenBao: us-east1-b` environment gate; an operator must not bypass or approve that gate as part of bootstrap.

## Ingress

OpenBao runs outside the Istio ambient mesh. It has its own global multi-cluster ingress and per-zone ingress endpoints; requests reach OpenBao directly rather than traversing the shared Istio gateway.

OpenBao uses a service-specific `BackendConfig`, separate from the Istio gateway's, retaining its own health check and referencing the shared `shared-ingress` Cloud Armor security policy through `securityPolicy.name`. Its ingress `FrontendConfig` resources reference the shared SSL policy, also named `shared-ingress`, through `sslPolicy`. The Pneuma main workspace manages both policies, not the Arche Istio module. See [Shared Ingress Policies](./service-mesh.md#shared-ingress-policies).

## End-to-end TLS

HTTPS requests are encrypted from the client to the load balancer and again from the load balancer to the OpenBao pod. HTTP requests are redirected to HTTPS by the `FrontendConfig` (`redirectToHttps`), and the zonal ingress disallows HTTP. Each cluster runs a namespaced cert-manager CA `Issuer` in `pt-pneuma-openbao` that issues the `openbao-tls` certificate mounted by the OpenBao listener. The CA is valid for ten years (renewed one year before expiry) so it outlives every leaf it signs; the leaf uses cert-manager's 90-day default. Its SANs cover the external hostnames, the in-cluster service names, the `openbao-internal` pod names used for Raft, and `127.0.0.1` for the in-pod CLI. The OpenBao `Service` declares the `https` port as `HTTPS` with `cloud.google.com/app-protocols`, and the multi-cluster `Service` does the same with `networking.gke.io/app-protocols`, and the `BackendConfig` health check uses `type: HTTPS`. The load balancer does not validate the backend certificate, so the private CA is sufficient for that leg. The OpenBao workspaces deploy after cert-manager in each zone, and are destroyed before it.

The OpenBao StatefulSet uses the chart's `OnDelete` update strategy, so enabling TLS on an existing cluster requires replacing pods after the apply: delete the standby pods one at a time, waiting for each to become healthy and rejoin, then delete the active pod. The HTTPS health check marks pods unhealthy until they are replaced.

OpenBao reloads its listener certificate only on `SIGHUP` or restart, and cert-manager renewal updates the mounted Secret without triggering either. After a renewal of `openbao-tls`, send `SIGHUP` to each OpenBao pod (standbys first, then the active pod) or replace the pods in the same order, before the previous certificate expires.

## Auto-unseal

OpenBao unseals itself with a Cloud KMS key, so pods that restart (node upgrades, evictions, crashes) rejoin the cluster without manual `bao operator unseal` steps. The Pneuma main workspace creates a per-environment `openbao-unseal` key ring and `unseal` key in the Pneuma project's `us` multi-region location, protected with `prevent_destroy` because losing the key means losing access to every secret. OpenBao pods reach the key through GKE Workload Identity: the `openbao` Kubernetes service account is bound to the `openbao-kms` Google service account, which holds `roles/cloudkms.cryptoKeyEncrypterDecrypter` on the key. The regional OpenBao workspaces render a `seal "gcpckms"` stanza (project, region, key ring and crypto key from the main workspace's `openbao_kms_seal` output) into the Helm release's Raft configuration, and annotate the service account with the Google service account, so the seal is configured by deployment rather than by hand. Apply that deployment before running `bao operator init` or the seal migration below.

A new cluster still needs a one-time `bao operator init`; the output is recovery keys rather than unseal keys. An existing cluster initialized with Shamir keys must be migrated once, node by node, following the OpenBao [seal migration procedure](https://openbao.org/docs/concepts/seal/): back up first, then for each standby in turn update its seal configuration, restart it, and submit the threshold number of Shamir shares with `bao operator unseal -migrate`; once all standbys are migrated, step down the active node, let a migrated standby take over, allow the migration to replicate, and migrate the former active node last.

The service account also requires `roles/cloudkms.viewer`, scoped to the unseal key, for the `cloudkms.cryptoKeys.get` metadata lookup during [seal initialization](https://openbao.org/docs/configuration/seal/gcpckms/#authentication--permissions). The encrypt/decrypt role alone does not include this permission. If OpenBao crash-loops with `IAM_PERMISSION_DENIED` for `cloudkms.cryptoKeys.get`, apply the main workspace's key-level IAM bindings and allow IAM propagation; crash-looping pods retry automatically. Do not recreate the key or reinitialize existing OpenBao storage to resolve this error.

## Requesting access or a capability

Provide the workload identity, environment, required secret type, expected rotation or lease behavior, and the minimum paths or operations needed. Pneuma reviews the request and implements the policy or engine as code.

Do not place static credentials in source repositories, OpenTofu variables, or CI environment settings while waiting for an integration.

## Deployment lifecycle

Pull requests deploy sandbox, merges to `main` deploy non-production, and successful non-production runs promote to production. The zonal OpenBao workspaces deploy in parallel after the cluster runtime is available.

## Core invariant

Secrets are delivered through approved OpenBao identities and policies with the shortest practical lifetime and least privilege.
