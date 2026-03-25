---
description: >-
  OpenTofu uses persisted state data to keep track of the resources it manages.
  Most non-trivial OpenTofu configurations use a backend to store state
  remotely.
---

# State Backend

Corpus manages the [OpenTofu remote state backend](https://opentofu.org/docs/language/settings/backends/configuration) for all platform team repositories. State is stored in KMS-encrypted Cloud Storage buckets created and managed by [pt-corpus](https://github.com/osinfra-io/pt-corpus).

OpenTofu uses persisted state data to keep track of the resources it manages. Most non-trivial OpenTofu configurations use a backend to store state remotely. This lets multiple people access the state data and work together on that collection of infrastructure resources.

## State Encryption

All state buckets use Customer Managed Encryption Keys (CMEK) via [Cloud KMS](https://cloud.google.com/kms) in addition to OpenTofu's native [state encryption](https://opentofu.org/docs/language/state/encryption/). Both layers of encryption are required for all platform repositories.

{% hint style="warning" %}
OpenTofu state is managed **exclusively in GitHub Actions** via the reusable workflows in [pt-techne-opentofu-workflows](https://github.com/osinfra-io/pt-techne-opentofu-workflows). Local development environments do not have access to remote state or the KMS keys required to decrypt it.
{% endhint %}
