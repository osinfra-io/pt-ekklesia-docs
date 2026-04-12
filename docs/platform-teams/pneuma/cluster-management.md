---
sidebar_label: Cluster Management
---

# Cluster Management

Pneuma provisions one GKE cluster per zone, consuming Corpus networking and Logos team data. Clusters are CIS-hardened, Fleet-enrolled, and configured for Workload Identity from the start.

- **GKE clusters**: One cluster per zone (e.g., `pt-pneuma-us-east1-b`) with node auto-provisioning, KMS encryption, and CIS GKE Benchmark hardening
- **Workload Identity**: Kubernetes service accounts are mapped to GCP service accounts, eliminating node-level credential access
- **Fleet enrollment**: Clusters are registered to a GKE Fleet for multi-cluster service discovery and ingress
