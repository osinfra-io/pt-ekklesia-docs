---
description: >-
  With workload identity federation, you can use Identity and Access Management
  (IAM) to grant external identities IAM roles, including the ability to
  impersonate service accounts.
---

# Workload Identity

Corpus configures [workload identity federation](https://cloud.google.com/iam/docs/workload-identity-federation) for GitHub Actions using OIDC. This allows GitHub Actions workflows to authenticate to Google Cloud and impersonate service accounts without storing long-lived service account keys.

With workload identity federation, you can use IAM to grant external identities IAM roles, including the ability to impersonate service accounts. This lets you access resources directly using a [short-lived access token](https://cloud.google.com/iam/docs/create-short-lived-credentials-direct) and eliminates the maintenance and security burden associated with service account keys.

{% hint style="info" %}
All OpenTofu deployments across the platform use workload identity federation via the reusable workflows in [pt-techne-opentofu-workflows](https://github.com/osinfra-io/pt-techne-opentofu-workflows). Local development does not have access to remote state — all state operations happen exclusively in GitHub Actions.
{% endhint %}
