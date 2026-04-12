---
sidebar_label: Logos
description: The foundational principle of order across systems, integrating multi-provider infrastructure, establishing boundaries, governance, and stable standards for teams to operate autonomously.
---

# Logos

Logos is the foundational principle of order across systems — integrating multi-provider infrastructure, establishing boundaries, governance, and stable standards for teams to operate autonomously. It is the platform's primordial principle from which all other structure emerges.

- **[Resource Hierarchy](./resource-hierarchy.md)**: GCP folder structure with environment-scoped folders for sandbox, non-production, and production
- **[Identity & Access](./identity-access.md)**: Google Identity groups and centralized user management
- **[Team Topology](./team-topology.md)**: GitHub teams and repositories, Datadog teams, and branch protection

All downstream platform teams depend on Logos outputs for folder IDs, team data, and identity group references.

## Repositories

- **[pt-logos](https://github.com/osinfra-io/pt-logos)**: OpenTofu configuration for GCP folder hierarchy, Google Identity groups, GitHub teams and repositories, and Datadog teams

### AI Context

- **[pt-ai-context](https://github.com/osinfra-io/pt-ai-context)**: Platform-level Copilot instructions applying universally to all `pt-*` repositories
- **[pt-logos-ai-context](https://github.com/osinfra-io/pt-logos-ai-context)**: Team-level Copilot instructions for `pt-logos-*` repositories
