---
description: >-
  Gatekeeper is a validating and mutating webhook that enforces CRD-based
  policies executed by Open Policy Agent, a policy engine for Cloud Native
  environments.
---

# Gatekeeper

<figure><img src="../../../.gitbook/assets/opa.png" alt="" width="188"><figcaption></figcaption></figure>

[Gatekeeper](https://open-policy-agent.github.io/gatekeeper/website/docs) is a Kubernetes-native [_admission controller_](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/?ref=blog.sighup.io) that extends the capabilities of OPA to Kubernetes clusters. By combining OPA’s policy engine with Kubernetes’ admission control mechanism, Gatekeeper enforces policies on Kubernetes resources during creation and update operations.

<figure><img src="../../../.gitbook/assets/cncf.png" alt=""><figcaption></figcaption></figure>

Open Policy Agent (OPA) was accepted to [CNCF](https://www.cncf.io/projects/open-policy-agent-opa) on March 29, 2018, moved to the **Incubating** maturity level on April 2, 2019, and then moved to the **Graduated** maturity level on January 29, 2021.

Gatekeeper was moved to the trial ring in the [Thoughtworks Technology Radar](https://www.thoughtworks.com/en-us/radar/platforms/opa-gatekeeper-for-kubernetes) October 2021.&#x20;
