---
sidebar_label: Tenancy
---

# Tenancy

Corpus owns the full tenancy lifecycle for every team on the platform. When a team is declared in [pt-logos](https://github.com/osinfra-io/pt-logos), Corpus provisions its GCP project, applies CIS-compliant controls at creation, and wires it into the platform's centralized log infrastructure — all before any workload runs. There is no intermediate state where a project exists without governance.

- **CIS-compliant project creation**: Projects are created with CIS benchmark controls applied by default, including audit logging, OS Login enforcement, and uniform bucket-level access
- **Standard labels**: All projects inherit a consistent label set from `module.core_helpers.labels`, ensuring cost attribution, environment tagging, and team ownership are always present
- **Datadog monitoring**: All GCP projects are registered with Datadog via the Google Cloud integration, enabling metrics and log collection without per-team configuration
- **Centralized log bucket**: The Corpus project holds a single `cis-2-2-logging-sink` log bucket per environment — all projects sink to it; no per-project log storage
- **Unique per-project sink identities**: Each project gets a dedicated GCP-managed logging service account with `roles/logging.bucketWriter` on the Corpus bucket — no shared sink credentials
- **CMEK encryption**: The log bucket is encrypted with a KMS key in the Corpus project, with a 90-day automatic rotation schedule
- **CIS metric filters and alerts**: Eight CIS 2.4–2.11 log metric filters are deployed to every project, each wired to a Cloud Monitoring alert policy that notifies the security channel on first occurrence

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Project Types

Corpus creates up to two distinct GCP projects per team, driven entirely by team configuration in [pt-logos](https://github.com/osinfra-io/pt-logos):

| Type | Logos field | Label | Purpose |
|---|---|---|---|
| **Team project** | `enable_google_project: true` | `project-type: team` | Ad-hoc team workloads, additional APIs, team-specific resources |
| **Platform-managed project** | `platform_managed_project: { ... }` | `project-type: platform-managed` | GKE clusters, managed data services (Cloud SQL, Redis, etc.) |

The **platform-managed project** is the shared workload project for a team. Its presence is declared in pt-logos and the project is created by pt-corpus. Its contents — GKE clusters, data services — are provisioned by pt-pneuma and stream-aligned team repositories consuming Arche modules.

A team declares a platform-managed project by adding a `platform_managed_project` block to their `.tfvars` entry. Within that block, `kubernetes_engine` is optional — a team may have:

- **GKE only** — `platform_managed_project.kubernetes_engine` with `locations`; no data services
- **Data services only** — `platform_managed_project` block present, `kubernetes_engine` omitted
- **Both** — `platform_managed_project.kubernetes_engine` with `locations` and data service configuration in the project

## Log Routing

The Corpus project is the only project that creates a log bucket. When Corpus provisions any other project — team or platform-managed — it passes the Corpus project ID as the sink destination. That project's `cis-2-2-logging-sink` log sink writes to `logging.googleapis.com/projects/{corpus-project-id}/locations/{region}/buckets/cis-2-2-logging-sink`.

The org-level `_Default` sink is disabled to prevent duplicate log entries. All log routing is explicit and version-controlled.

## Aggregate

### Ubiquitous Language

| Term | Meaning in this context |
|---|---|
| Tenancy | The governed GCP presence assigned to a team — project provisioned, CIS controls applied, and log routing established |
| CIS policy | A set of CIS GCP Foundation Benchmark controls applied at project creation |
| Log sink | A per-project `cis-2-2-logging-sink` project sink with a unique writer identity; present in every project Corpus creates |
| Log bucket | The `cis-2-2-logging-sink` bucket in the Corpus project; CMEK-encrypted, 30-day retention, receives all platform log sinks |

### Downstream Interfaces

| Entity | Consumed By | Description |
|---|---|---|
| `gcp-project` | All downstream | A GCP project created under the correct environment folder with billing and APIs enabled |
| `billing-budget` | Finance / alerting | Automatic spending alerts at 50%, 75%, and 100% of threshold on every project |
| `monitoring-channel` | Operations | Cloud Monitoring notification channels for budget and infrastructure change alerts |
| `logging-kms-key` | Log bucket | A `cis-2-2-logging-sink` KMS crypto key in the Corpus project, used to encrypt the log bucket; rotates every 90 days |
| `cis-metric-filter` | Security | Eight per-project log metric filters (CIS 2.4–2.11) monitoring ownership changes, IAM modifications, VPC, firewall, route, storage, and SQL configuration events |

### Core Invariant

Every GCP project is CIS-compliant and log-governed from the first second of its existence — there is no non-compliant or unobserved intermediate state.

## Architecture Decision Records

### CIS GCP Foundation Benchmark Compliance by Default

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>April 2026</td><td>Corpus</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

GCP projects created manually or with minimal configuration are not compliant with security benchmarks by default. Teams commonly enable APIs, create service accounts, and grant IAM roles before applying security controls — resulting in a window where resources exist in a non-compliant state. At scale, manual compliance remediation is expensive and prone to drift.

The platform manages projects across three environments for multiple teams. Each project needs identical baseline security controls without requiring team-by-team configuration.

#### Decision

All GCP projects are created through `pt-arche-google-project`, which applies CIS GCP Foundation Benchmark v1.3.0 controls at creation time. There is no non-compliant intermediate state — projects are born compliant.

Controls applied automatically to every project:

- Audit logging enabled for all admin and data operations (CIS 2.1)
- No default VPC network created (CIS 3.1)
- OS Login enforced on all compute instances (CIS 4.4)
- Uniform bucket-level access enforced on all GCS buckets
- Billing budget alerts at 50%, 75%, and 100% of threshold
- Cloud Monitoring notification channels provisioned at creation

#### Alternatives Considered

- **Apply CIS controls post-creation via a separate remediation pipeline** — Rejected. Creates a compliance gap between project creation and remediation. Any resource created in the gap is potentially non-compliant.
- **Rely on Security Command Center to flag violations and fix manually** — Rejected. Reactive, not preventive. Requires ongoing toil and does not eliminate drift.
- **Use GCP Organization Policy constraints only** — Rejected. Org policies enforce hard blocks but do not configure audit logging, monitoring channels, or billing budgets — all of which require project-level resources.

#### Consequences

- Every project is CIS-compliant from the first second of its existence
- Compliance is version-controlled and auditable via the module source
- Adding a new CIS control requires updating the module and releasing a new version — all consumers inherit it on their next upgrade
- Teams cannot create projects outside the module — direct project creation is not permitted

### Centralized Log Bucket in the Corpus Project

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>April 2026</td><td>Corpus</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Every GCP project generates audit logs. CIS 2.2 requires that a sink be configured to export all log entries. The default option — a log bucket in each project — means audit logs are fragmented across dozens of projects per environment, with no single place to query or retain them. Each project also needs its own KMS key, retention policy, and IAM configuration, multiplying operational surface area with each new team.

#### Decision

The Corpus project owns the log bucket for its environment. All other projects sink to it. The Corpus project creates:

- A `cis-2-2-logging-sink` log bucket, CMEK-encrypted, with 30-day retention
- A KMS key ring and `cis-2-2-logging-sink` crypto key, with 90-day automatic rotation

Every other project created by Corpus (team and platform-managed) creates:

- A `cis-2-2-logging-sink` project sink pointed at the Corpus bucket
- A unique GCP-managed writer identity (`service-{project-number}@gcp-sa-logging.iam.gserviceaccount.com`) granted `roles/logging.bucketWriter` on the Corpus project

The org-level `_Default` sink is disabled to prevent duplicate ingestion.

#### Alternatives Considered

- **Per-project log buckets** — Rejected. Fragments audit data, duplicates KMS and retention configuration for every project, and makes cross-project querying impractical.
- **Org-level sink to a shared bucket** — Rejected. Org-level sinks mix logs from all organizations and are harder to scope per environment. Explicit project-level sinks provide clearer provenance and tighter control.
- **Log export to GCS** — Rejected for primary retention. Cloud Logging buckets support log analytics queries directly; GCS export is suitable for long-term archival but not interactive investigation.

#### Consequences

- All audit logs for an environment are queryable from a single bucket in the Corpus project
- One KMS key and one retention policy to manage per environment, not one per project
- Adding a new project requires granting the project's logging SA write access to the Corpus bucket — this is handled automatically by `pt-arche-google-project`
- Loss of the Corpus project's KMS key would make the log bucket contents unreadable — the key is protected from destruction and rotates automatically
