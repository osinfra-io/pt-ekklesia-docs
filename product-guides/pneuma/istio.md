---
description: >-
  Istio addresses the challenges developers and operators face with a
  distributed or microservices architecture.
---

# Istio

<figure><img src="../../../.gitbook/assets/istio.png" alt="" width="100"><figcaption></figcaption></figure>

[Istio](https://istio.io) extends Kubernetes to establish a programmable, application-aware network. Working with Kubernetes and traditional workloads, Istio brings standard, universal traffic management, telemetry, and security to complex deployments.

<figure><img src="../../../.gitbook/assets/cncf.png" alt=""><figcaption></figcaption></figure>

Istio was accepted to [CNCF](https://www.cncf.io/projects/istio) on September 30, 2022, at the **Incubating** maturity level and then moved to the **Graduated** maturity level on July 12, 2023.

Istio was moved to the adopt ring in the [Thoughtworks Technology Radar](https://www.thoughtworks.com/en-us/radar/platforms/istio) in May 2020.&#x20;

### Troubleshooting

The [`istioctl`](https://istio.io/latest/docs/reference/commands/istioctl) configuration command line utility for service operators can be used to debug and diagnose the Istio mesh.

#### Ingress

Check the Istio ingress gateway routes:&#x20;

`istioctl proxy-config route -n istio-ingress <pod-name>`



