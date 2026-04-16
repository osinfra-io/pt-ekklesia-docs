---
sidebar_label: Service Mesh
---

# Service Mesh

Istio is deployed on every GKE cluster, providing mTLS between services, fine-grained traffic management, and an ingress gateway backed by Cloud Armor WAF protection.

- **mTLS**: All service-to-service traffic within the mesh is encrypted and authenticated automatically
- **Traffic management**: Istio VirtualServices and DestinationRules control routing, retries, and timeouts
- **Ingress gateway**: External traffic enters the mesh through a managed gateway with Datadog AAP (Application and API Protection) deployed as an Envoy external processor for WAF and threat detection
- **cert-manager integration**: Istio's built-in CA is replaced by cert-manager via istio-csr, which issues and rotates all workload mTLS certificates in the mesh

## Domain-Driven Design

| Entity | Description |
|---|---|
| `istio-control-plane` | The Istio control plane deployed via Helm, managing traffic policy across the mesh |
| `ingress-gateway` | A managed ingress gateway exposed via a GCP load balancer |
| `waf-policy` | A Cloud Armor security policy attached to the ingress gateway (OWASP rules, rate limiting, adaptive DDoS) |
| `virtual-service` | An Istio routing rule defining traffic behaviour for a service (retries, timeouts, fault injection) |
| `destination-rule` | An Istio policy defining connection pool and circuit breaker settings for a destination |
| `peer-authentication` | A mesh-wide policy enforcing strict mTLS between all services |
