---
description: >-
  The Datadog Kubernetes Operator enables agent deployment and monitoring
  configuration via Kubernetes CRDs.
---

# Datadog Operator

<figure><img src="../../.gitbook/assets/datadog.png" alt="" width="188"><figcaption></figcaption></figure>

Pneuma deploys the [Datadog Kubernetes Operator](https://docs.datadoghq.com/containers/datadog_operator/) via the [pt-arche-kubernetes-datadog-operator](https://github.com/osinfra-io/pt-arche-kubernetes-datadog-operator) module. The operator manages the Datadog Agent lifecycle on each cluster using Kubernetes CRDs, providing:

* Cluster-level monitoring and metrics
* Application Performance Monitoring (APM)
* Log collection and forwarding to Datadog
* Cloud Security Posture Management (CSPM) integration

The Datadog integration with Google Cloud is configured at the project level in [Corpus](../corpus/README.md), while the Kubernetes-level operator and agent configuration is managed here in Pneuma.
