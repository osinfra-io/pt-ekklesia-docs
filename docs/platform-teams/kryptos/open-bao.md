---
sidebar_label: OpenBao
---

# OpenBao

OpenBao is an open-source secrets management platform — a Linux Foundation fork of HashiCorp Vault — deployed on a dedicated Pneuma-managed GKE cluster. It is the platform's canonical source of dynamic credentials, PKI certificates, and short-lived secrets for all teams.

- **[Kubernetes auth](https://openbao.org/docs/auth/kubernetes/)**: Maps Kubernetes service accounts to OpenBao roles using the cluster's token review API — no static credentials required
- **[PKI engine](https://openbao.org/docs/secrets/pki/)**: Issues and renews X.509 certificates on demand; integrates with cert-manager for automated workload certificate lifecycle
- **[KV engine](https://openbao.org/docs/secrets/kv/)**: Versioned key-value store for static secrets that cannot be dynamically generated
- **[Database engine](https://openbao.org/docs/secrets/databases/)**: Generates short-lived database credentials on demand and revokes them automatically on lease expiry

All secrets issued by OpenBao are dynamic or time-bounded — no consumer stores long-lived credentials.

## Bounded Context

| Entity | Description |
|---|---|
| `auth-method` | A Kubernetes or OIDC backend that authenticates callers and maps them to OpenBao roles |
| `lease` | A time-bound grant on a dynamic secret — expiry automatically revokes access |
| `policy` | An ACL rule controlling which paths a token can read, write, or delete |
| `role` | A named binding that maps an auth identity to a set of policies and token TTLs |
| `secrets-engine` | A PKI, KV, or database backend mounted at a path that generates or stores credentials |
| `token` | An OpenBao authentication credential scoped to one or more policies |
