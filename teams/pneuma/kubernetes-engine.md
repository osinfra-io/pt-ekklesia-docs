---
description: >-
  Google Cloud Kubernetes Engine provides a managed, production-ready
  environment for deploying containerized applications.
---

# Kubernetes Engine

<figure><img src="../../.gitbook/assets/google-kubernetes-engine.png" alt="" width="256"><figcaption></figcaption></figure>

[Kubernetes](https://kubernetes.io) was accepted to [CNCF](https://www.cncf.io/projects/kubernetes) on March 10, 2016 at the Incubating maturity level and then moved to the Graduated maturity level on March 6, 2018.

Kubernetes was moved to the adopt ring in the [Thoughtworks Technology Radar](https://www.thoughtworks.com/en-us/radar/platforms/kubernetes) in May 2018.

Pneuma provisions GKE clusters via the [pt-arche-google-kubernetes-engine](https://github.com/osinfra-io/pt-arche-google-kubernetes-engine) module with:

* Workload Identity for pod-level GCP authentication
* KMS encryption for etcd data and node boot disks
* CIS GKE Benchmark hardening
* GKE Fleet host/member configuration for multi-cluster service discovery and ingress

## Active Zones

| Zone | Cluster Name |
|---|---|
| us-east1-b | pt-pneuma-us-east1-b |
| us-east4-b | pt-pneuma-us-east4-b |
