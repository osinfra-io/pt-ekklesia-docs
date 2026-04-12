---
sidebar_label: Service Mesh
---

# Service Mesh

Istio is deployed on every GKE cluster, providing mTLS between services, fine-grained traffic management, and an ingress gateway backed by Cloud Armor WAF protection.

- **mTLS**: All service-to-service traffic within the mesh is encrypted and authenticated automatically
- **Traffic management**: Istio VirtualServices and DestinationRules control routing, retries, and timeouts
- **Ingress gateway**: External traffic enters the mesh through a managed gateway with optional Cloud Armor WAF
- **cert-manager integration**: TLS certificates for ingress are provisioned automatically via cert-manager
