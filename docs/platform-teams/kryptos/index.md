---
sidebar_label: Kryptos
description: The hidden foundation of platform security — managing cryptographic primitives, secrets infrastructure, and security controls that underpin all teams on the platform.
---

# Kryptos

The hidden foundation of platform security — managing cryptographic primitives, secrets infrastructure, and security controls that underpin all teams on the platform.

- **[OpenBao](./open-bao.md)**: Dynamic secrets, PKI certificate issuance, and short-lived credentials for all teams — deployed on a dedicated Pneuma-managed cluster

## Repositories

- **[pt-kryptos](https://github.com/osinfra-io/pt-kryptos)**: Secrets infrastructure and cryptographic primitives — OpenBao deployment and platform security controls

### AI Context

- **[pt-kryptos-ai-context](https://github.com/osinfra-io/pt-kryptos-ai-context)**: Team-level Copilot instructions for `pt-kryptos-*` repositories

## Bounded Context

Kryptos is a downstream **Customer/Supplier** consumer of Pneuma (runs OpenBao on Pneuma-managed clusters) and an upstream supplier of secrets management to all teams in the [context map](/platform-teams#context-map).

### Ubiquitous Language

| Term | Meaning in this context |
|---|---|
| Dynamic credential | A short-lived secret generated on demand and automatically revoked on lease expiry |
| Engine | A secrets backend (PKI, KV, database) that generates or stores credentials |
| Key | A cryptographic key managed by GCP KMS for encryption or signing |
| Lease | A time-bound grant on a dynamic secret — expiry automatically revokes access |
| Path | The OpenBao mount path addressing a specific secret or engine endpoint |
| Policy | An OpenBao ACL rule controlling which paths a token can read or write |
| Rotation | Replacing a secret or key before its lease or validity period expires |
| Secret | A sensitive value (password, certificate, API key) managed by OpenBao |
| Token | An OpenBao authentication credential scoped to one or more policies |

### Downstream Interfaces

| Artifact | Description | Consumed By |
|---|---|---|
| Dynamic credentials | Short-lived database, cloud, and API secrets issued on demand via OpenBao | All teams |
| PKI certificates | Workload and service identity certificates issued from Kryptos-managed CA | All teams |
| KV secrets | Static secrets (API keys, tokens) stored and versioned in OpenBao KV | All teams |

### Core Invariant

All secrets distributed to consumers are dynamic or short-lived — no static credentials are stored in consumer repositories or CI environments.

## Team Topologies

### Cognitive Load

Kryptos owns two domains of high inherent complexity — secrets infrastructure and cryptographic primitives. The scope is deliberately narrow: depth over breadth, with no cluster operations burden (Pneuma handles that) and no deployment pipeline overhead (Techne handles that).

| Working Domains | High Intrinsic Domains |
|---|---|
| 🟢 2 / 4 | 🟡 2 / 3 |

Cognitive load by domain:

| Domain | Intrinsic | Extraneous Reduced By | Germane Expertise |
|---|---|---|---|
| Secrets Infrastructure | 🔴 High | Pneuma-managed cluster | OpenBao, dynamic secrets |
| Cryptographic Primitives | 🔴 High | GCP KMS handles key infrastructure | PKI, key lifecycle design |

**Capacity**: 2 high-complexity domains (Team Topologies guideline: 2–3); team members hold 2 active domains — well within the ~4 working-knowledge limit. This leaves intentional headroom — scope expansion into a third high-complexity domain would approach the team's cognitive ceiling.

**Extraneous load is minimized by:**

- OpenBao runs on Pneuma-managed clusters — no cluster operations burden
- GCP KMS manages key infrastructure at scale — Kryptos configures policy, not key primitives
- Called workflows provide OpenTofu deployment pipelines — no CI/CD to build or maintain

**Germane load is built through:**

- Security engineering: OpenBao policy authoring, dynamic secrets, and secrets lifecycle management
- Applied cryptography: PKI chains, key rotation, and zero-trust secrets distribution
- Zero-trust architecture: designing secrets access patterns that minimize blast radius

### Team Capacity

| | |
|---|---|
| **Headcount** | 1 platform engineer |
| **Day-to-day work** | OpenBao policy authoring, PKI configuration, cryptographic key lifecycle management |
| **Scale signal** | Intentionally narrow — scope should not grow to fill capacity; a third high-complexity domain would approach the cognitive ceiling |
