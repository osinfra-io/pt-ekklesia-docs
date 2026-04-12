---
sidebar_label: Observability
---

# Observability

The Datadog Operator runs on every GKE cluster, deploying the Datadog Agent as a DaemonSet to collect metrics, traces, and logs from all cluster workloads.

- **Cluster monitoring**: Node and pod metrics are collected and sent to Datadog, providing visibility into cluster health and workload performance
- **Log collection**: Container logs are forwarded to Datadog with automatic Kubernetes metadata enrichment
- **Integration with Corpus**: The operator authenticates to Datadog using credentials provisioned by the Datadog Google Cloud integration in Corpus
