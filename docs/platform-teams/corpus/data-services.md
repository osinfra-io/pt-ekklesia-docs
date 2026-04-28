---
sidebar_label: Data Services
---

# Data Services

Corpus provisions Private Services Access peering for the Shared VPC and Cloud SQL instances in team platform-managed projects, consuming Logos team configuration.

- **Private Services Access**: A reserved IP range and peering connection enable Cloud SQL and Memorystore with private IP from any Shared VPC workload
- **Cloud SQL**: One PostgreSQL instance per declared region in the team's platform-managed project, with private IP through the Shared VPC peering connection
- **Pub/Sub**: No platform prerequisites required; Private Google Access on all subnets covers pod connectivity without NAT

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Aggregates

### Private Services Access

**Aggregate Root:** `service-networking-connection`

The VPC peering connection between the Shared VPC host project and Google's managed services network. Provisioned once per environment by Corpus; required before any Cloud SQL or Memorystore instance can be created with a private IP.

| Member | Role | Description |
|---|---|---|
| `managed-services-ip-range` | Entity | Reserved IP range in the host VPC allocated for Google managed services peering |

### Cloud SQL Instance

**Aggregate Root:** `cloud-sql-instance`

A managed PostgreSQL instance provisioned by Corpus in a team's platform-managed project — at most one per declared region. Created via `pt-arche-google-cloud-sql` with private IP through the Shared VPC peering connection (`ipv4_enabled = false`) and SSL enforced (`ssl_mode = "ENCRYPTED_ONLY"`).

## Ubiquitous Language

| Term | Meaning in this context |
|---|---|
| `cloud-sql-instance` | A managed PostgreSQL instance per region in the team's platform-managed project, accessible via private IP through the Shared VPC peering connection |
| `managed-services-ip-range` | A reserved IP range in the host VPC allocated for Google managed services Private Services Access |
| `service-networking-connection` | The VPC peering connection between the host VPC and Google's managed services network |

## Core Invariant

Each team has at most one Cloud SQL instance per declared region — never more than one instance per team per region.

## Architecture Decision Records

### Corpus Owns the Data Layer Foundation

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>April 2026</td><td>Corpus</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Cloud SQL Private IP and Memorystore require a **Private Services Access** peering connection in the Shared VPC host project — a reserved IP range and a `google_service_networking_connection` resource. Service-project teams cannot modify the host VPC; this provisioning belongs to the team that owns it: Corpus.

Platform-managed projects require data services provisioned within them, driven by team configuration in Logos. Without a platform team owning this, each team would manage their own instance provisioning inside a Corpus-owned project — bypassing the Logos-schema-driven model and duplicating the Arche module usage across teams.

#### Decision

Corpus adds a **Managed Data Services** bounded context alongside Networking and CI/CD Enablement. Corpus provisions the Private Services Access peering once per environment, enabling private IP connectivity to Cloud SQL and Memorystore across the Shared VPC. For teams with a `platform_managed_project`, Corpus also provisions Cloud SQL instances using `pt-arche-google-cloud-sql` — teams declare the configuration in Logos and Corpus creates the instance; no team-side provisioning work is required.

Stream-aligned teams without a platform-managed project provision their own instances using the Arche module in their own repositories.

#### Alternatives Considered

- **Have each team provision their own Cloud SQL instance inside their platform-managed project** — Rejected. Teams do not own the platform-managed project lifecycle; Corpus does. Direct team provisioning into Corpus-managed projects bypasses the Logos-schema-driven model.
- **Create a dedicated data platform team** — Rejected. No shared data infrastructure exists today. A dedicated team adds coordination overhead without delivering value. The signal to revisit: when multiple teams are running instances and the platform team regularly fields sizing, upgrade, or incident questions.
- **Have stream-aligned teams provision the peering themselves** — Rejected. The peering lives in the Shared VPC host project, which stream-aligned teams do not own and cannot modify.

#### Consequences

- Cloud SQL and Memorystore Private IP are available to any workload on the Shared VPC after the one-time Corpus PR per environment
- Teams declare `cloud_sql` in Logos; Corpus provisions the instance in their platform-managed project automatically on the next deployment
- Stream-aligned teams without a platform-managed project provision their own instances using the Arche module directly
- The team topology expands to a dedicated data platform team only when shared data infrastructure appears on the roadmap
