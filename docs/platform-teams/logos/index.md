---
sidebar_label: Logos
description: The foundational principle of order across systems, integrating multi-provider infrastructure, establishing boundaries, governance, and stable standards for teams to operate autonomously.
---

# Logos

Logos is the foundational principle of order across systems — integrating multi-provider infrastructure, establishing boundaries, governance, and stable standards for teams to operate autonomously. It is the platform's primordial principle from which all other structure emerges.

- **GCP folder hierarchy**: Environment-scoped folders for sandbox, non-production, and production
- **Google Identity groups**: Team-based access control groups
- **GitHub teams and repositories**: Team membership and repo configuration with branch protection
- **Datadog teams**: Observability team structure
- **User management**: Centralized identity and access

All downstream platform teams depend on Logos outputs for folder IDs, team data, and identity group references.

## Repositories

- **[pt-logos](https://github.com/osinfra-io/pt-logos)**: OpenTofu configuration for GCP folder hierarchy, Google Identity groups, GitHub teams and repositories, and Datadog teams

### AI Context

- **[pt-ai-context](https://github.com/osinfra-io/pt-ai-context)**: Platform-level Copilot instructions applying universally to all `pt-*` repositories
- **[pt-logos-ai-context](https://github.com/osinfra-io/pt-logos-ai-context)**: Team-level Copilot instructions for `pt-logos-*` repositories
