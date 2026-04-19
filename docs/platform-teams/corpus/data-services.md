---
sidebar_label: Managed Data Services
---

# Managed Data Services

Corpus owns the VPC-level prerequisites that allow stream-aligned teams to consume Google managed data services — Cloud SQL and Memorystore (Redis) — from within the Shared VPC. It does not own the instances themselves; those belong to the teams that run them.

## Domain

| Entity | Description |
|---|---|
| `managed-services-ip-range` | A reserved IP range in the host VPC allocated for Google managed services Private Services Access |
| `service-networking-connection` | The VPC peering connection between the host VPC and Google's managed services network |

**Key rule:** Managed data service VPC prerequisites are provisioned once per environment by Corpus. Stream-aligned teams provision their own instances after this foundation exists.

## Responsibilities by Team

| Work | Owner | Scope |
|---|---|---|
| Private Services Access peering + reserved IP range in host VPC | **Corpus** | One-time per environment; covers both Cloud SQL and Memorystore |
| `pt-arche-google-cloud-sql` module | **Arche** | Existing module |
| `pt-arche-google-memorystore-redis` module | **Arche** | New module, same pattern as `pt-arche-google-cloud-sql` |
| Instance declarations, Pub/Sub topics/subscriptions, IAM bindings | **Stream-aligned teams** | Self-service, consumed from Arche modules |

## Pub/Sub

Pub/Sub requires no platform prerequisites beyond what already exists. Private Google Access is enabled on all Shared VPC subnets, meaning pods reach `pubsub.googleapis.com` without NAT or additional configuration. Stream-aligned teams declare their own topics and subscriptions in their own repositories.

## Architecture Decision Records

### Corpus Owns the Data Layer VPC Prerequisites

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>April 2026</td><td>Corpus</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Cloud SQL Private IP and Memorystore require a **Private Services Access** peering connection in the Shared VPC host project — a reserved IP range allocated for Google managed services and a `google_service_networking_connection` resource. Service-project teams cannot modify the host VPC. This work must be done by the team that owns it: Corpus.

No new platform team is justified at this scale. Each stream-aligned team owns their own data service instances. The managed services handle backups, failover, and patching. The complexity that would justify a dedicated data platform team does not yet exist.

#### Decision

Corpus adds a **Managed Data Services** bounded context alongside Networking and CI/CD Enablement. Corpus provisions the Private Services Access peering once per environment. Stream-aligned teams are then self-service for Cloud SQL and Memorystore using Arche modules, and for Pub/Sub directly with no module dependency.

#### Alternatives Considered

- **Create a dedicated data platform team** — Rejected. No shared data infrastructure exists today. Each team owns their own instances. A dedicated team creates coordination overhead without delivering value. The signal to revisit: when multiple teams are running instances and the platform team is regularly fielding sizing, upgrade, or incident questions.
- **Have stream-aligned teams provision the peering themselves** — Rejected. The peering lives in the Shared VPC host project, which stream-aligned teams do not own and cannot modify.

#### Consequences

- Cloud SQL and Memorystore Private IP are available to any team on the Shared VPC after the one-time Corpus PR per environment
- Corpus does not own or manage individual data service instances — teams retain full autonomy over their own instances
- The team topology expands to a dedicated data platform team only when shared data infrastructure (pooled clusters, platform-level schemas) appears on the roadmap
