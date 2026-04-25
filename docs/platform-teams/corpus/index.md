---
sidebar_label: Corpus
description: The embodiment of the order Logos defines — the structural form where networks, shared services, and core infrastructure take shape, preparing the body that Pneuma will animate.
---

# Corpus

Corpus is the embodiment of the order Logos defines — the structural form where networks, shared services, and core infrastructure take shape, preparing the body that Pneuma will animate. The abstract principles of Logos are translated here into tangible, reliable infrastructure.

- **[Tenancy](./tenancy.md)**: CIS-compliant GCP project creation, centralized log governance, and audit log routing for all platform projects
- **[Networking](./networking.md)**: Shared VPC, subnets, DNS zones, Cloud NAT
- **[Data Services](./data-services.md)**: Private Services Access peering for managed services; Cloud SQL instances in team platform-managed projects
- **[CI/CD Enablement](./ci-cd-enablement.md)**: GitHub Actions workload identity, Artifact Registry, encrypted OpenTofu state buckets

Corpus consumes Logos outputs and provides the foundation for Pneuma workload environments.

## Repositories

- **[pt-corpus](https://github.com/osinfra-io/pt-corpus)**: OpenTofu configuration for GCP projects, shared VPC and networking, GitHub Actions service accounts, and encrypted state buckets

### AI Context

- **[pt-corpus-ai-context](https://github.com/osinfra-io/pt-corpus-ai-context)**: Team-level Copilot instructions for `pt-corpus-*` repositories

## Bounded Context

Corpus is a downstream **Customer/Supplier** consumer of Logos, and an upstream supplier to Pneuma in the platform's [context map](/platform-teams#context-map).

### Ubiquitous Language

| Term | Meaning in this context |
|---|---|
| Artifact registry | A GCP container and artifact repository for storing built images |
| CIS benchmark | The Center for Internet Security hardening standard applied to every project at creation |
| Cloud SQL instance | A managed PostgreSQL database provisioned by Corpus in a team's platform-managed project |
| Managed services IP range | A private IP range reserved for Cloud SQL and Memorystore peering |
| Project | A GCP project scoped to a team and environment, CIS-compliant at creation |
| Service networking connection | A VPC peering link enabling Private Services Access for managed databases |
| Shared VPC | A centrally-managed GCP network whose subnets are shared across team projects |
| State bucket | A GCS bucket holding encrypted OpenTofu state for a team's infrastructure |
| Workload identity | A GCP mechanism mapping a Kubernetes service account to a GCP service account — no static credentials |

### Downstream Interfaces

| Output | Consumed By | Via | Description |
|---|---|---|---|
| Platform-managed GCP projects | Pneuma | `data "google_projects"` (GCP label query) | Cluster placement and Workload Identity binding |
| Shared VPC | Pneuma | `data "google_projects"` (GCP label query) | GKE cluster network and subnet attachment |
| Cloud SQL instances | Teams | `data "terraform_remote_state"` (corpus regional) | Private IP and instance name per team in each region |

### Core Invariants

- Every GCP project is CIS-compliant at creation — there is no non-compliant state.
- Every team's OpenTofu state is encrypted at rest with a KMS key protected from destruction.
- GitHub Actions authenticates via Workload Identity Federation — no static credentials exist.
- Every platform-managed project is a Shared VPC service project with subnet access granted at creation.
- Every Cloud SQL instance has no public IP — private connectivity only, with SSL enforced.

## Team Topologies

### Cognitive Load

Corpus translates Logos abstractions into concrete GCP infrastructure — projects, networks, and CI/CD foundations. Networking is the domain of highest inherent complexity here, spanning VPC design, multi-region subnets, DNS, NAT, and Private Services Access.

| Working Domains | High Intrinsic Domains |
|---|---|
| 🟠 4 / 4 | 🟢 1 / 3 |

Cognitive load by domain:

| Domain | Intrinsic | Extraneous Reduced By | Germane Expertise |
|---|---|---|---|
| Tenancy | 🟡 Medium | Arche module | CIS compliance, log governance |
| Networking | 🔴 High | Arche module | VPC design, IP planning |
| Data Services | 🟡 Medium | Arche module | Managed services connectivity |
| CI/CD Enablement | 🟡 Medium | Techne workflows | Workload identity, OIDC |

**Capacity**: 1 high-complexity domain (Team Topologies guideline: 2–3); team members hold 4 active domains — at the ~4 working-knowledge limit.

**Extraneous load is minimized by:**

- Arche modules encapsulate CIS-compliant GCP project and network resource creation
- Logos outputs drive project placement and team data — no manual cross-referencing
- Called workflows provide OpenTofu deployment pipelines — no CI/CD to build or maintain

**Germane load is built through:**

- GCP networking architecture: VPC design, peering, and IP range planning
- Cloud security posture: CIS benchmark controls, workload identity federation, and state encryption
- Infrastructure supply chain thinking: how Corpus outputs shape what Pneuma can do

### Team Capacity

| | |
|---|---|
| **Headcount** | 1 platform engineer |
| **Day-to-day work** | Provisioning new team projects, occasional subnet expansion, supporting Pneuma's cluster networking requirements |
| **Scale signal** | Stable — networking and project infrastructure changes infrequently once designed |
