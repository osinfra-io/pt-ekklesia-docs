---
sidebar_label: Certificate Management
---

# Certificate Management

cert-manager manages all certificate issuance within the platform, acting as the certificate authority for the Istio service mesh via the cert-manager istio-csr integration.

- **Self-signed root CA**: A self-signed root certificate is generated in the main workspace and used as the trust anchor for the entire cluster. This root cert and key are passed to each regional workspace.
- **istio-csr**: The cert-manager Istio Certificate Signing Request agent replaces istiod's built-in Citadel CA — the component responsible for signing certificate signing requests (CSRs) from Envoy sidecars. All workload mTLS certificates are signed by cert-manager through this integration; istiod continues to handle config distribution, service discovery, and sidecar injection as normal.
- **Automatic rotation**: cert-manager handles certificate issuance and rotation for all mesh workloads without manual intervention

## Domain

| Entity | Description |
|---|---|
| `cluster-issuer` | A cluster-scoped ACME issuer configured for Let's Encrypt (staging and production) |
| `certificate` | A TLS certificate resource managed by cert-manager, backed by a Kubernetes Secret |
| `acme-challenge` | A DNS-01 or HTTP-01 challenge used to prove domain ownership during issuance |
| `certificate-secret` | The Kubernetes Secret storing the issued certificate, consumed by the Istio ingress gateway |
