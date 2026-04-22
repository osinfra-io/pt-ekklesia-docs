---
sidebar_label: Certificate Management
---

# Certificate Management

cert-manager runs as platform infrastructure — stream-aligned teams have no direct interface with it. Its sole role is acting as the Istio certificate authority via the cert-manager istio-csr integration, issuing short-lived mTLS workload certificates to Envoy sidecars across all mesh clusters.

- **Self-signed root CA**: An ECDSA P-256 self-signed root certificate (CN: `opentofu-self-signed-ca.osinfra.io`, 30-year validity) is generated in the main workspace by OpenTofu and stored in state. The cert and key are passed to each regional workspace via remote state.
- **istio-csr**: The cert-manager Istio Certificate Signing Request agent replaces istiod's built-in Citadel CA — the component responsible for signing certificate signing requests (CSRs) from Envoy sidecars. All workload mTLS certificates are signed by cert-manager through this integration; istiod continues to handle config distribution, service discovery, and sidecar injection as normal.
- **Automatic rotation**: cert-manager handles certificate issuance and rotation for all mesh workloads without manual intervention.

:::note

Platform teams may use cert-manager for other certificate needs beyond Istio mTLS. Stream-aligned teams have no direct interface with cert-manager.

:::

## Domain

### Ubiquitous Language

| Term | Meaning in this domain |
|---|---|
| `istio-ca` | 720h intermediate CA Certificate (CN: `istio-intermediate-ca.osinfra.io`) stored as a Kubernetes Secret named `istio-ca` in `istio-system` — the Secret name and CN differ; this is the signing authority used by cert-manager-istio-csr for all workload CSRs |
| `istio-ca-issuer` | cert-manager Issuer backed by the `istio-ca` Secret; cert-manager-istio-csr uses this issuer to sign Envoy sidecar certificates |
| `istio-intermediate-ca` | cert-manager Issuer in `istio-system` backed by the root CA Secret; issues the `istio-ca` intermediate Certificate |
| `root-ca` | ECDSA P-256 self-signed trust anchor (CN: `opentofu-self-signed-ca.osinfra.io`, 30-year validity) generated in the main workspace by OpenTofu and passed to regional workspaces via remote state |
| `workload-certificate` | Short-lived mTLS leaf certificate issued to an Envoy sidecar by cert-manager-istio-csr; automatically rotated by cert-manager |

### Downstream Interfaces

| Output | Consumed By | Via | Description |
|---|---|---|---|
| `istio-ca` Issuer | Service Mesh | cert-manager-istio-csr | Signs workload CSRs for all Envoy sidecar mTLS certificates |

### Core Invariant

All mesh workload certificates are issued and rotated by cert-manager — no manually managed certificates exist in the mesh.

### Cognitive Load

Certificate management is a 🔴 high-intrinsic domain — operating it requires holding a three-layer PKI chain (self-signed root CA → intermediate CA → workload certificates), the cert-manager CRD API (Certificate, Issuer resources), and the istio-csr delegation model simultaneously. The `pt-arche-kubernetes-cert-manager` Arche module encapsulates all Helm chart management, reducing extraneous load to configuration and integration.

| Domain | Intrinsic | Extraneous Reduced By | Germane Expertise |
|---|---|---|---|
| Certificate Management | 🔴 High | `pt-arche-kubernetes-cert-manager` | PKI chains, cert-manager issuers, istio-csr |

**Extraneous load is minimized by:**

- `pt-arche-kubernetes-cert-manager` wraps cert-manager and istio-csr Helm releases — no raw chart management
- Root CA generation is handled once in the main workspace and passed to regional workspaces via remote state

**Germane load is built through:**

- ECDSA root CA chain design and lifecycle management
- cert-manager Issuer and Certificate resource authoring
- istio-csr integration — understanding how Citadel CA responsibilities are delegated from istiod to cert-manager

### Team Capacity

| | |
|---|---|
| **Headcount** | 1–2 domain engineers |
| **Day-to-day work** | cert-manager and istio-csr version upgrades, issuer reconfiguration, root CA rotation |
| **Scale signal** | Driven by overall Pneuma team capacity — see [Pneuma Team Capacity](/platform-teams/pneuma#team-capacity) |
