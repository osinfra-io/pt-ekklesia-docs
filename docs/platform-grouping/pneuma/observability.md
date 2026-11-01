---
sidebar_label: Observability
---

# Observability

The Datadog Operator runs on every production GKE cluster and manages the Datadog Agent DaemonSet via a `DatadogAgent` custom resource. The operator authenticates using per-team API and app keys provisioned by Logos and injected as GitHub Actions secrets.

## Core Invariants

The Datadog Operator runs on every production cluster — no production cluster ships without metrics, traces, and logs. To avoid per-host costs, sandbox and non-production do not run Datadog. Datadog is not exposed to teams as an option; the only control is a platform-level kill switch: the `datadog_enable` variable (default `false`) in the `regional/datadog` workspaces, set to `true` in the production tfvars. Corpus has the matching `datadog_enable` variable for project-level integrations. The features below are hardcoded enabled in the `DatadogAgent` spec and cannot be disabled by individual teams:

- **Admission Controller**: Mutates application pods at admission time to inject the Datadog library and environment variables, enabling traces, logs, and metrics to reach the agent without code changes
- **Workload Autoscaling**: Implements the Kubernetes external metrics API so HPAs can scale workloads on Datadog metrics
- **Log collection**: Collects stdout/stderr logs from all containers with automatic Kubernetes metadata enrichment
- **Network Performance Monitoring (NPM)**: Tracks network traffic between services using eBPF — bytes sent/received, TCP retransmits, connection counts — without instrumentation
- **Orchestrator Explorer**: Provides a live view of Kubernetes resources (pods, deployments, services, nodes) in the Datadog UI, equivalent to a real-time kubectl dashboard
- **Software Bill of Materials (SBOM)**: Scans container images and host filesystems and generates an inventory of OS packages and libraries with version and CVE status
- **Cloud Security Posture Management (CSPM)**: Evaluates cloud resource configurations against security benchmarks (CIS, PCI-DSS, etc.)
- **Cloud Workload Security (CWS)**: Detects runtime threats at the OS level using eBPF kernel event monitoring, with network detection also enabled

The following are also always enabled:

- **APM**: Distributed tracing — collects spans from instrumented services and assembles flame graphs and service maps ($31/host/month annual with Infrastructure Monitoring)
- **Universal Service Monitoring (USM)**: Automatically detects service-to-service communication via eBPF and generates RED metrics (requests, errors, duration) per service without code changes — enabled automatically alongside APM at no additional cost

## Optional features

These features are disabled by default and carry additional per-host cost when enabled. They are configured as module inputs in pt-pneuma:

- **APM Single-Step Instrumentation**: Auto-instruments all eligible pods at admission time without requiring code changes; requires APM
- **App & API Protection (ASM Threats)**: Runtime application security — detects and blocks attacks in real time using the Datadog Agent
- **Interactive Application Security Testing (IAST)**: Finds exploitable vulnerabilities in running application code
- **Software Composition Analysis (SCA)**: Identifies vulnerable open-source dependencies in deployed container images

## Integrations

Autodiscovery rules are pre-configured for the following cluster components:

- **Cilium**: Scrapes Cilium eBPF dataplane metrics from the agent endpoint using OpenMetrics
- **Envoy ingress gateway**: Scrapes gateway proxy metrics from the Envoy stats endpoint and collects access logs for shared ingress traffic
- **Ambient mesh telemetry**: Collects `ztunnel` and workload mesh telemetry through the mesh data plane so service-to-service traffic can be correlated without workload sidecars

## Components

| Component | Description |
|---|---|
| `datadog-operator` | The Kubernetes operator that manages the lifecycle of Datadog Agent deployments |
| `datadog-agent` | A cluster-level CRD defining the desired state of the Datadog Agent (features, log collection, APM) |
| `cluster-agent` | A single-instance Datadog Cluster Agent that aggregates cluster-level metrics and forwards them to Datadog |
| `metrics-config` | Configuration enabling specific metric collection (container, Kubernetes state, network) |
