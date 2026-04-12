---
sidebar_label: Certificate Management
---

# Certificate Management

cert-manager automates TLS certificate provisioning on every GKE cluster, integrating with Let's Encrypt to issue and renew certificates without manual intervention.

- **Automated issuance**: Certificates are issued via ACME (Let's Encrypt) using DNS-01 or HTTP-01 challenges
- **Automatic renewal**: cert-manager monitors expiry and renews certificates before they expire
- **Istio integration**: Certificates are made available to the Istio ingress gateway for TLS termination
