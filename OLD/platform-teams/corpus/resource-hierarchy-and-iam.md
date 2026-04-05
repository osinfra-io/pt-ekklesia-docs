---
description: >-
  Google Cloud resource hierarchy organizes and manages entities hierarchically.
  Identity and Access Management (IAM) lets administrators authorize who can
  take action on specific resources.
---

# Resource Hierarchy and IAM

Corpus creates Google Cloud projects with [CIS GCP Benchmark](https://www.cisecurity.org/benchmark/google_cloud_computing_platform) compliance controls baked in from day zero. Each project is provisioned via the [pt-arche-google-project](https://github.com/osinfra-io/pt-arche-google-project) module with the following controls applied automatically:

* **CIS 2.1** — Audit logging enabled for all services
* **CIS 2.2** — KMS-encrypted log sink bucket created
* **CIS 3.1** — Default network deleted on project creation
* **CIS 4.4** — OS Login enforced for compute instances

Projects are named and labeled using outputs from the [pt-arche-core-helpers](https://github.com/osinfra-io/pt-arche-core-helpers) module, which derives naming conventions from the [Logos](../logos.md) workspace state. This ensures project names, labels, and folder placements remain consistent across all three environments (sandbox, non-production, production).

{% hint style="info" %}
The [Google Cloud resource hierarchy](https://cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy) resembles the file system found in traditional operating systems — it organizes and manages entities hierarchically. [Identity and Access Management (IAM)](https://cloud.google.com/iam) lets administrators authorize who can take action on specific resources.
{% endhint %}
