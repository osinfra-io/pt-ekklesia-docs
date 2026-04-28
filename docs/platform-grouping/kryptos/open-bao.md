---
sidebar_label: OpenBao
---

# OpenBao

OpenBao is an open-source secrets management platform — a Linux Foundation fork of HashiCorp Vault — planned for deployment on a dedicated Pneuma-managed GKE cluster as the platform's canonical source of dynamic credentials, PKI certificates, and short-lived secrets for all teams.

:::note Status

`pt-kryptos` does not yet contain an OpenBao deployment. This page describes the intended scope; component details will land here once the implementation does.

:::

- **[Kubernetes auth](https://openbao.org/docs/auth/kubernetes/)**: Maps Kubernetes service accounts to OpenBao roles using the cluster's token review API — no static credentials required
- **[PKI engine](https://openbao.org/docs/secrets/pki/)**: Issues and renews X.509 certificates on demand; integrates with cert-manager for automated workload certificate lifecycle
- **[KV engine](https://openbao.org/docs/secrets/kv/)**: Versioned key-value store for static secrets that cannot be dynamically generated
- **[Database engine](https://openbao.org/docs/secrets/databases/)**: Generates short-lived database credentials on demand and revokes them automatically on lease expiry

## Core Invariant

All secrets distributed to consumers are dynamic or short-lived — no static credentials are stored in consumer repositories or CI environments.
