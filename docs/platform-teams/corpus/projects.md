---
sidebar_label: Projects
---

# Projects

Corpus provisions and governs all GCP projects in the platform. Every project is created with a consistent structure, CIS-aligned security controls, and standard labels derived from [pt-logos](https://github.com/osinfra-io/pt-logos) team data.

- **CIS-compliant project creation**: Projects are created with CIS benchmark controls applied by default, including audit logging, OS Login enforcement, and uniform bucket-level access
- **Standard labels**: All projects inherit a consistent label set from `module.core_helpers.labels`, ensuring cost attribution, environment tagging, and team ownership are always present
- **Datadog monitoring**: All GCP projects are registered with Datadog via the Google Cloud integration, enabling metrics and log collection without per-team configuration

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Domain

| Entity | Description |
|---|---|
| `gcp-project` | A GCP project created under the correct environment folder with billing and APIs enabled |
| `cis-policy` | A set of CIS GCP Foundation Benchmark controls applied at project creation (audit logging, OS Login, no default VPC) |
| `billing-budget` | Automatic spending alerts at 50%, 75%, and 100% of threshold on every project |
| `labels` | Standard label set derived from `module.core_helpers.labels` — always includes `env`, `team`, `managed-by` |
| `monitoring-channel` | Cloud Monitoring notification channels for budget and infrastructure change alerts |

## Project Types

Corpus creates up to two distinct GCP projects per team, driven entirely by team configuration in [pt-logos](https://github.com/osinfra-io/pt-logos):

| Type | Logos field | Label | Purpose |
|---|---|---|---|
| **Team project** | `enable_google_project: true` | `project-type: team` | Ad-hoc team workloads, additional APIs, team-specific resources |
| **Platform-managed project** | `platform_managed_project: { ... }` | `project-type: platform-managed` | GKE clusters, managed data services (Cloud SQL, Redis), Artifact Registry |

The **platform-managed project** is the shared workload project for a team. Its presence is declared in pt-logos and the project is created by pt-corpus. Its contents — GKE clusters, data services — are provisioned by pt-pneuma and stream-aligned team repositories consuming Arche modules.

A team declares a platform-managed project by adding a `platform_managed_project` block to their `.tfvars` entry. Within that block, `kubernetes_engine` is optional — a team may have:

- **GKE only** — `platform_managed_project.kubernetes_engine` with `locations`; no data services
- **Data services only** — `platform_managed_project` block present, `kubernetes_engine` omitted
- **Both** — `platform_managed_project.kubernetes_engine` with `locations` and data service configuration in the project



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
