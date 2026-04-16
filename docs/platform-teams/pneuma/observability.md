---
sidebar_label: Observability
---

# Observability

The Datadog Operator runs on every GKE cluster and manages the Datadog Agent DaemonSet via a `DatadogAgent` custom resource. The operator authenticates using per-team API and app keys provisioned by Logos and injected as GitHub Actions secrets.

## Always-on features

These features are hardcoded enabled in the `DatadogAgent` spec:

- **Admission Controller**: Mutates application pods at admission time to inject the Datadog library and environment variables, enabling traces, logs, and metrics to reach the agent without code changes
- **Workload Autoscaling**: Implements the Kubernetes external metrics API so HPAs can scale workloads on Datadog metrics

## Default-enabled features

These features are on by default but can be disabled:

- **Log collection**: Collects stdout/stderr logs from all containers with automatic Kubernetes metadata enrichment
- **Network Performance Monitoring (NPM)**: Tracks network traffic between services using eBPF — bytes sent/received, TCP retransmits, connection counts — without instrumentation
- **Universal Service Monitoring (USM)**: Automatically detects service-to-service communication via eBPF and generates RED metrics (requests, errors, duration) per service without code changes
- **Orchestrator Explorer**: Provides a live view of Kubernetes resources (pods, deployments, services, nodes) in the Datadog UI, equivalent to a real-time kubectl dashboard
- **Software Bill of Materials (SBOM)**: Scans container images and generates an inventory of OS packages and libraries with version and CVE status

## Integrations

Autodiscovery rules are pre-configured for the following cluster components:

- **Cilium**: Scrapes Cilium eBPF dataplane metrics from the agent endpoint using OpenMetrics
- **Envoy (Istio sidecars)**: Scrapes Envoy proxy metrics from the Istio stats endpoint and collects Envoy access logs

## Optional features

These features are disabled by default and carry additional per-host cost when enabled:

- **APM**: Distributed tracing — collects spans from instrumented services and assembles flame graphs and service maps
- **APM Single-Step Instrumentation**: Auto-instruments all eligible pods at admission time without requiring code changes
- **App & API Protection (ASM Threats)**: Runtime application security — detects and blocks attacks in real time using the Datadog Agent
- **Interactive Application Security Testing (IAST)**: Finds exploitable vulnerabilities in running application code
- **Software Composition Analysis (SCA)**: Identifies vulnerable open-source dependencies in deployed container images
- **Cloud Security Posture Management (CSPM)**: Evaluates cloud resource configurations against security benchmarks (CIS, PCI-DSS, etc.)
- **Cloud Workload Security (CWS)**: Detects runtime threats at the OS level using eBPF kernel event monitoring

## Domain

| Entity | Description |
|---|---|
| `datadog-operator` | The Kubernetes operator that manages the lifecycle of Datadog Agent deployments |
| `datadog-agent` | A cluster-level CRD defining the desired state of the Datadog Agent (features, log collection, APM) |
| `daemon-set` | The underlying Kubernetes DaemonSet that runs a Datadog Agent pod on every node |
| `cluster-agent` | A single-instance Datadog Cluster Agent that aggregates cluster-level metrics and forwards them to Datadog |
| `metrics-config` | Configuration enabling specific metric collection (container, Kubernetes state, network) |

