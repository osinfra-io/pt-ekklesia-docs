---
sidebar_label: Log Management
---

# Log Management

Corpus is the centralized log destination for the platform. Every GCP project created by Corpus — the Corpus project itself, all team projects, and all platform-managed projects — routes its logs into a single CMEK-encrypted log bucket owned by the Corpus project. There is no per-project log storage; all audit and activity logs converge here.

- **Centralized log bucket**: The Corpus project holds a single `cis-2-2-logging-sink` log bucket per environment. All projects sink to it — no per-project buckets are created for team workloads
- **Unique per-project sink identities**: Each project gets a dedicated GCP-managed logging service account with `roles/logging.bucketWriter` on the Corpus bucket — no shared sink credentials
- **CMEK encryption**: The log bucket is encrypted with a KMS key in the Corpus project, with a 90-day automatic rotation schedule
- **CIS metric filters and alerts**: Eight CIS 2.4–2.11 log metric filters are deployed to every project, each wired to a Cloud Monitoring alert policy that notifies the security channel on first occurrence

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## How It Works

The Corpus project is the only project that creates a log bucket. When corpus provisions any other project — team or platform-managed — it passes the Corpus project ID as the sink destination. That project's `cis-2-2-logging-sink` log sink writes to `logging.googleapis.com/projects/{corpus-project-id}/locations/{region}/buckets/cis-2-2-logging-sink`.

The org-level `_Default` sink is disabled to prevent duplicate log entries. All log routing is explicit and version-controlled.

## Aggregate

| Entity | Description |
|---|---|
| `log-bucket` | The `cis-2-2-logging-sink` bucket in the Corpus project; CMEK-encrypted, 30-day retention, receives all platform log sinks |
| `log-sink` | A per-project `cis-2-2-logging-sink` project sink with a unique writer identity; present in every project Corpus creates |
| `logging-kms-key` | A `cis-2-2-logging-sink` KMS crypto key in the Corpus project, used to encrypt the log bucket; rotates every 90 days |
| `cis-metric-filter` | Eight per-project log metric filters (CIS 2.4–2.11) monitoring ownership changes, IAM modifications, VPC, firewall, route, storage, and SQL configuration events |

## Architecture Decision Records

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
