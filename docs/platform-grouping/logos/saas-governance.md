---
sidebar_label: SaaS Governance
---

# SaaS Governance

Logos manages organization-level settings for GitHub and Datadog, establishing platform-wide policies that apply across all teams and repositories.

- **GitHub organization**: Org-level configuration including the Actions allowed-actions allowlist (restricting which third-party actions may run), member permissions, and security defaults (Dependabot alerts, secret scanning, vulnerability alerts enabled for all new repositories)
- **Datadog organization**: Org-level settings and logs indexes with multiple retention tiers (high-retention for errors/critical logs, low-retention for debug/agent noise, and a main catch-all index) — index order and daily limits are managed here to control cost and signal quality

## Components

| Component | Description |
|---|---|
| `datadog-org-policy` | Org-level Datadog settings — logs indexes, retention tiers, and daily limits |
| `github-org-policy` | Org-level GitHub configuration — member permissions, security defaults, and Actions allowlist |

## Core Invariants

- Organization administrators (Datadog and GitHub) are indestructible — `prevent_destroy = true` is set on both; no accidental removal is possible via OpenTofu.
- Singleton organization-level resources (Datadog API keys, GitHub org settings, Google Groups) are only created in the `logos-production-main` workspace — preventing duplicates or conflicts across environments.
