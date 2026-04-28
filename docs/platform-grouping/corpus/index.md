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

## Context

Corpus consumes from Logos and feeds into Pneuma. See [team dependencies](/platform-grouping#team-dependencies).

### Glossary

| Term | Meaning in this context |
|---|---|
| Artifact registry | A GCP container and artifact repository for storing built images |
| CIS benchmark | The Center for Internet Security hardening standard applied to every project at creation |
| Cloud SQL instance | A managed PostgreSQL database provisioned by Corpus in a team's platform-managed project |
| Log bucket | A Cloud Logging bucket in the Corpus project that receives all platform log sinks per environment |
| Log sink | A per-project sink routing audit logs to the Corpus log bucket with a unique writer identity |
| Managed services IP range | A private IP range reserved for Cloud SQL and Memorystore peering |
| Project | A GCP project scoped to a team and environment, CIS-compliant at creation |
| Service networking connection | A VPC peering link enabling Private Services Access for managed databases |
| Shared VPC | A centrally-managed GCP network whose subnets are shared across team projects |
| State bucket | A GCS bucket holding encrypted OpenTofu state for a team's infrastructure |
| Tenancy | The governed GCP presence assigned to a team — project provisioned, CIS controls applied, and log routing established |
| Workload identity | A GCP mechanism mapping a Kubernetes service account to a GCP service account — no static credentials |

## Team Topologies

### Cognitive Load

Corpus translates Logos abstractions into concrete GCP infrastructure — team tenancy, networking, and CI/CD foundations. Networking is the domain of highest inherent complexity here, spanning VPC design, multi-region subnets, DNS, NAT, and Private Services Access.

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

- **Headcount**: 1 platform engineer
- **Day-to-day work**: Onboarding new team tenancies, occasional subnet expansion, supporting Pneuma's cluster networking requirements
- **Scale signal**: Stable — networking and project infrastructure changes infrequently once designed
