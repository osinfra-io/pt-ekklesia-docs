---
sidebar_label: Resource Hierarchy
---

# Resource Hierarchy

Logos defines the GCP folder hierarchy that organizes all platform infrastructure. Environment-scoped folders establish the structural boundaries within which Corpus provisions projects and Pneuma runs workloads.

- **GCP folder hierarchy**: Separate folders for sandbox, non-production, and production environments, created under the organization root
- **Folder IDs**: Exposed as outputs and consumed downstream by Corpus via `module.core_helpers.environment_folder_id`
