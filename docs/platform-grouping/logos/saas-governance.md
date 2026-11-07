---
sidebar_label: SaaS Governance
---

# SaaS Governance

Logos manages organization-level settings for GitHub and Datadog, establishing platform-wide policies that apply across all teams and repositories.

- **GitHub organization**: Org-level configuration including the Actions allowed-actions allowlist (restricting which third-party actions may run), member permissions, and security defaults (Dependabot alerts, secret scanning, vulnerability alerts enabled for all new repositories)
- **Datadog organization**: Org-level settings and logs indexes with multiple retention tiers (high-retention for errors/critical logs, low-retention for debug/agent noise, and a main catch-all index) — index order and daily limits are managed here to control cost and signal quality

The high-retention index is evaluated before source-based tiers, so Agent and mesh errors remain eligible for the longer error retention instead of matching a shorter tier first. Size its daily quota for that combined traffic before changing index order; lowering a quota is not a substitute for classifying noise.

Routine INFO Datadog operator reconciliation messages from the known controller loggers are sampled to retain 10%, without adding audit exclusions or sampling error-level logs. Index sampling reduces indexed volume, not the volume ingested by Datadog. Retention periods are unchanged.

## Components

| Component | Description |
|---|---|
| `datadog-org-policy` | Org-level Datadog settings — logs indexes, retention tiers, and daily limits |
| `github-org-policy` | Org-level GitHub configuration — member permissions, security defaults, and Actions allowlist |

## Core Invariants

- Organization administrators (Datadog and GitHub) are indestructible — `prevent_destroy = true` is set on both; no accidental removal is possible via OpenTofu.
- Singleton organization-level resources (Datadog API keys, GitHub org settings, Google Groups) are only created in the `logos-production-main` workspace — preventing duplicates or conflicts across environments.
