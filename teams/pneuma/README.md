---
description: >-
  Pneuma animates Corpus projects into workload environments: GKE clusters,
  cert-manager, Istio service mesh, Datadog cluster monitoring, and OPA
  Gatekeeper policy enforcement.
icon: wind
---

# Pneuma

<figure><img src="../../.gitbook/assets/google-kubernetes-engine.png" alt="" width="256"><figcaption></figcaption></figure>

Pneuma deploys and operates the Kubernetes runtime layer across multiple zones for high availability. It is the layer that brings the platform to life — running the workloads, enforcing policy, and providing the service mesh fabric that enables secure service-to-service communication.

## Platform Repositories 🏗️

<table data-card-size="large" data-view="cards" data-full-width="false"><thead><tr><th align="center"></th><th></th><th data-hidden data-card-cover data-type="files"></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td align="center">Pneuma</td><td>This repository manages GKE clusters, Istio service mesh, cert-manager, Datadog monitoring, OPA Gatekeeper, and namespace onboarding.</td><td><a href="../../.gitbook/assets/kubernetes-engine-card.png">kubernetes-engine-card.png</a></td><td><a href="https://github.com/osinfra-io/pt-pneuma">https://github.com/osinfra-io/pt-pneuma</a></td></tr></tbody></table>

## What Pneuma Manages

<table data-card-size="large" data-view="cards" data-full-width="false"><thead><tr><th align="center"></th><th></th><th data-hidden data-card-cover data-type="files"></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td align="center">Kubernetes Engine</td><td>Provisions GKE clusters across multiple zones with Workload Identity, KMS encryption, and CIS GKE Benchmark hardening. Currently active zones: us-east1-b and us-east4-b.</td><td><a href="../../.gitbook/assets/kubernetes-engine-card.png">kubernetes-engine-card.png</a></td><td><a href="kubernetes-engine.md">kubernetes-engine.md</a></td></tr><tr><td align="center">cert-manager</td><td>Deploys cert-manager on GKE for automated X.509 certificate management using Istio CSR integration.</td><td><a href="../../.gitbook/assets/cert-manager-card.png">cert-manager-card.png</a></td><td><a href="cert-manager.md">cert-manager.md</a></td></tr><tr><td align="center">Istio</td><td>Deploys Istio service mesh with ingress gateway, Cloud Armor WAF/DDoS protection, SSL policy, and optional mTLS via intermediate CA.</td><td><a href="../../.gitbook/assets/istio-card.png">istio-card.png</a></td><td><a href="istio.md">istio.md</a></td></tr><tr><td align="center">Datadog Operator</td><td>Deploys the Datadog Kubernetes Operator for cluster monitoring, APM, and observability configuration via Kubernetes CRDs.</td><td><a href="../../.gitbook/assets/datadog-card.png">datadog-card.png</a></td><td><a href="datadog-operator.md">datadog-operator.md</a></td></tr><tr><td align="center">OPA Gatekeeper</td><td>Deploys Open Policy Agent Gatekeeper for policy enforcement using constraint templates on Kubernetes resources during creation and update operations.</td><td><a href="../../.gitbook/assets/opa-card.png">opa-card.png</a></td><td><a href="gatekeeper.md">gatekeeper.md</a></td></tr></tbody></table>
