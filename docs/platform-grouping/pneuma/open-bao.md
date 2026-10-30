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

Logos team declarations are the source of truth for OpenBao onboarding. Every team must declare OpenBao Secret Admins, Readers, and Writers, whether or not it has GKE clusters or projects. Admins must have at least one member in each of sandbox, non-production, and production. Only reader and writer memberships may be empty; those groups still create team-policy inputs without granting access to any user.

Membership changes flow from Logos through Nomos Helpers and then through Pneuma reconciliation. The declared membership in Logos and the live access currently applied in OpenBao are separate states; an update is not effective until the corresponding Pneuma reconciliation has completed. For team ACL policies, plan can only read names beginning with `pt-`, `st-`, `ct-`, or `et-`. A protected apply can manage exactly three reserved policy paths per currently registered Logos team key: `<team-key>-openbao-secret-admins`, `<team-key>-openbao-secret-readers`, and `<team-key>-openbao-secret-writers`. These permissions do not grant write access to arbitrary unrelated policies or team secrets; actual team policies and identity bindings are created for declared OpenBao groups. Removing a team key also removes its generated apply permissions, so deprovisioning must retain explicit cleanup permissions first.

The `kv2` KV v2 mount scopes policies by the stable team key. The three group keys are:

| Group | Capabilities |
| --- | --- |
| `openbao-secret-readers` | Read secret values and list paths under the team's prefix; no writes |
| `openbao-secret-writers` | Create and update secrets under the team's prefix; no delete, undelete, destroy, or metadata deletion |
| `openbao-secret-admins` | Manage secret data, metadata, and versions under the team's prefix; no OpenBao system or mount administration |

For example, Pneuma's team prefix is `pt-pneuma`; use the KV path `kv2/pt-pneuma/<secret-name>`. Policies are enforced against the KV v2 API paths and do not grant access to another team's prefix. OIDC tokens have a maximum lifetime of one hour. Removing a user from a group prevents future logins from receiving that group's policy, but does not revoke an already-issued token; it expires within the configured maximum lifetime.

The login page advertises the `oidc/` mount as its primary login tab for Google-backed Authentik login. The GitHub Actions JWT mount stays hidden from the unauthenticated mount listing. OpenBao's stock UI retains an **Other** tab with generic method choices; those choices do not mean the methods are enabled. Token authentication remains available there for administrative recovery.

Set `BAO_ADDR` to the endpoint for the environment. A browser-enabled CLI can authenticate with:

```bash
BAO_ADDR=https://openbao.sb.osinfra.io bao login -method=oidc -path=oidc role=default
```

Replace the sandbox endpoint with the non-production or production endpoint when appropriate.

### Renaming the existing KV v2 mount

Existing installations migrate `team-kv2/` to `kv2/` through the provider's in-place remount operation, preserving secret data and versions. The OpenTofu resource address stays unchanged. The apply updates its workflow policies before moving the mount; remount permission is constrained to that source and destination. Read access to the old mount is retained for pre-migration refresh.

Schedule the apply while the mount is not in use. Confirm the plan updates the mount in place rather than destroying and recreating it. Team policies change to `kv2/<team-key>/...`; callers must update their paths, and access can be briefly interrupted while the mount and policies are updated. Do not manually disable the old mount: disabling a secrets engine deletes its data.

## GitHub Actions operator bootstrap

Before the first `openbao-config` deployment in each environment, an OpenBao operator must bootstrap the GitHub Actions JWT auth mount, policies, and roles through a trusted administrative session. The workspace then adopts all five resources with configuration-driven `import` blocks and manages them declaratively. Leave the import blocks in place; subsequent runs do not reimport resources already in state.

From the `pt-pneuma` repository root, use the checked-in bootstrap script with `bao`, `jq`, and an existing administrative login:

```bash
export BAO_ADDR=https://openbao.sb.osinfra.io
bao login -no-print
bash scripts/bootstrap/openbao-github-actions.sh sandbox
```

The script configures the mount, policies, and roles without running workflows or approving gates. Sandbox roles accept Pneuma PR runs using `refs/pull/*/merge`; bootstrap is not required for each PR. Apply still requires the protected environment gate. The script and workspace read the same policy files from `regional/openbao-config/policies/`. It refuses a `BAO_ADDR` that differs from the selected environment or an existing non-JWT mount at `github-actions/`. It assumes GitHub's default OIDC subject format, including `%3A` for colons inside environment names.

If the environment was bootstrapped before these imports were added, rerun the updated script once before the first importing plan. This grants the plan role read access to the GitHub JWT configuration and grants the apply role permission to manage it. After adoption, make routine changes in `openbao-config`; retain the script for new installations and administrative recovery. An approved apply can change its own future authentication and permissions, controlled by GitHub review and protected environment approvals.

For the other environments, log into their OpenBao endpoint and run `bash scripts/bootstrap/openbao-github-actions.sh non-production` or `bash scripts/bootstrap/openbao-github-actions.sh production`. Those roles accept main-branch push and manual-dispatch runs; sandbox accepts PR-triggered runs. The apply policy is privileged configuration administration, not team secret access. Bootstrap establishes the baseline workflow permissions; Pneuma composes them with the three exact reserved policy paths per currently registered Logos team key. When a team is added or its groups change, let the Logos/Nomos declaration and subsequent Pneuma reconciliation establish the required policy scope.

Team deprovisioning requires staged, reviewed changes:

1. While the team is still registered, add temporary exact-path permissions for its three reserved ACL policy names to Pneuma's `regional/openbao-config/policies/github-actions-apply.hcl`. Grant `create`, `read`, `update`, and `delete` on each `sys/policies/acl/<team-key>-openbao-secret-{admins,readers,writers}` path, using three literal paths rather than a wildcard or brace expression. Deploy this change through the protected `openbao-config` workflow in every environment and verify the live apply policy retains all three paths. Do not remove any required group declarations from a registered team.
2. Remove the entire team definition from Logos and its Helpers registration using the normal reviewed deprovisioning process. Reconcile the downstream authentik configuration and Pneuma `openbao-config` in every environment. The temporary permissions keep cleanup authorized even when the generated apply policy drops the retired team. Verify that its authentik groups, OpenBao identity aliases, identity groups, and three ACL policies have been deleted. Existing OIDC tokens may retain access until their maximum one-hour lifetime expires.
3. Only after cleanup succeeds in every environment, remove the temporary exact-path permissions from `github-actions-apply.hcl`, reconcile Pneuma again, and verify those paths are absent from the live apply policy.

Do not remove the team before the temporary permissions are deployed, or remove those permissions in the same apply that deletes its policies: an in-place apply-policy update can revoke permission before stale policies are deleted, and resource dependencies do not prevent that race. Keep the exception limited to the retiring team's three exact ACL paths; it grants no access to its secret data. Team secret data is not deleted by this procedure; arrange retention or deletion separately before retiring the team. Membership-only changes likewise require reconciliation before live access changes; verify the resulting identity bindings rather than treating a Logos edit as immediate revocation.

Configure the `github-actions` JWT auth mount to trust GitHub's issuer and JWKS endpoint (`https://token.actions.githubusercontent.com`). Create distinct `pt-pneuma-openbao-plan` and `pt-pneuma-openbao-apply` roles with the `pt-pneuma-openbao` audience. Bind the plan role to the Pneuma repository/ref and grant only the read capabilities required to plan the configuration workspace. Bind the apply role to the matching protected GitHub deployment environment and grant only the configuration capabilities required by that workspace. Review the exact repository, refs, and environment claims against the workflow before enabling the roles.

The reusable workflow uses `hashicorp/vault-action` to exchange a job-scoped GitHub OIDC token for an OpenBao token. OpenBao maintains compatibility with Vault API clients; see the [OpenBao discussion](https://github.com/orgs/openbao/discussions/2310). The action masks the token and returns it as a step output, passed only to the corresponding OpenTofu step rather than a job output or job-wide environment variable. Do not store an OpenBao root token or long-lived OpenBao token in GitHub. Apply continues to use the existing protected `OpenBao: us-east1-b` environment gate; an operator must not bypass or approve that gate as part of bootstrap.

## Ingress

OpenBao runs outside the Istio ambient mesh. It has its own global multi-cluster ingress and per-zone ingress endpoints; requests reach OpenBao directly rather than traversing the shared Istio gateway.

OpenBao uses a service-specific `BackendConfig`, separate from the Istio gateway's, retaining its own health check and referencing the shared `shared-ingress` Cloud Armor security policy through `securityPolicy.name`. Its ingress `FrontendConfig` resources reference the shared SSL policy, also named `shared-ingress`, through `sslPolicy`. The Pneuma main workspace manages both policies, not the Arche Istio module. See [Shared Ingress Policies](./service-mesh.md#shared-ingress-policies).

The shared policy exempts OpenBao API requests on the global OpenBao hostname under `/v1/` from method enforcement for `DELETE`, `LIST`, `PATCH`, and `PUT`. These methods are required by the OpenBao API; other WAF checks remain active. Apply the Pneuma main workspace before bootstrapping GitHub Actions authentication. An HTML `403 Forbidden` response can indicate Cloud Armor blocked the request; inspect load balancer logs for `denied_by_security_policy`.

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

For the dedicated local integration fixture, `tests/integration/openbao/teardown.sh` removes its routing and runtime without requiring an administrative API session. This supports recovery when OpenBao is sealed or its local initialization file is missing. It verifies cluster ownership and namespace tracking, then clears local configuration state and initialization keys only after the OpenBao namespace and its data volumes have been removed.

## Core invariant

Secrets are delivered through approved OpenBao identities and policies with the shortest practical lifetime and least privilege.
