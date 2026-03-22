---
description: >-
  Logos is the foundational layer of the platform. It encodes organizational
  logic: the clear lines of access, the governance boundaries, and the stable
  standards that all higher layers build upon.
icon: sitemap
---

# Logos

Logos establishes the primordial order from which all other platform structure emerges. Using OpenTofu, it creates the three-level Google Cloud Platform folder hierarchy, GitHub teams and repositories, Google Identity groups, and Datadog teams that the rest of the platform depends on.

Through the lens of [Team Topologies](https://teamtopologies.com/key-concepts), this layer defines the hierarchy of responsibility and relationship, ensuring that each team inhabits a space conducive to productive action.

## Service Interfaces 🔩

* [Add or update a team](https://github.com/osinfra-io/pt-logos/issues/new/choose)
* [Add or update a repository](https://github.com/osinfra-io/pt-logos/issues/new/choose)
* [Add or update an identity group](https://github.com/osinfra-io/pt-logos/issues/new/choose)

## Response Times 🕙

* Responsible team: [Platform - Logos](https://github.com/orgs/osinfra-io/teams/pt-logos)
* Response time for incidents: `60 minutes`
* Response time for other incidents: `120 minutes`
* Response time for support: `60 minutes`
* Response time for feedback: `30 minutes`

## Roadmap 🗺️

* Link to the roadmap: [GitHub Project](https://github.com/orgs/osinfra-io/projects/1/views/7)

## Communication Channels 🗨️

{% tabs %}
{% tab title="Possible incident" %}
Contact exclusively via:

* Discord: [Platform - Logos](https://discord.gg/YPg4AmMDvF)
* Phone number:
{% endtab %}

{% tab title="Support or provide feedback" %}
Contact via any of these:

* Discord: [Platform - Logos](https://discord.gg/YPg4AmMDvF)
* Email address: [platform-logos@osinfra.io](mailto:platform-logos@osinfra.io)
* Phone number:
* Office hours (EST): `Weekdays 5:00PM - 10:00PM` `Weekends 8:00AM - 5:00PM`
{% endtab %}
{% endtabs %}

## Platform Repositories 🏗️

<table data-card-size="large" data-view="cards" data-full-width="false"><thead><tr><th align="center"></th><th></th><th data-hidden data-card-cover data-type="files"></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td align="center">Logos</td><td>This repository manages the foundational platform layer: GCP folder hierarchy, GitHub teams and repositories, Google Identity groups, and Datadog teams.</td><td><a href="../../.gitbook/assets/administration-card.png">administration-card.png</a></td><td><a href="https://github.com/osinfra-io/pt-logos">https://github.com/osinfra-io/pt-logos</a></td></tr></tbody></table>

## What Logos Manages

### Google Cloud Platform

Logos creates a three-level folder hierarchy following Team Topologies principles using pre-created team type folders:

```text
Platform Teams/ (pre-created)
├── Arche/
│   ├── Sandbox/
│   ├── Non-Production/
│   └── Production/
├── Corpus/
├── Ekklesia/
├── Logos/
├── Pneuma/
└── Techne/

Stream-aligned Teams/ (pre-created)
└── Ethos/
    ├── Sandbox/
    ├── Non-Production/
    └── Production/
```

### GitHub

Logos manages GitHub teams, repositories, and organization-level settings as code. This provides consistent naming conventions, team membership, branch protection, and security settings across the organization — reducing technical debt and providing an X-as-a-Service interaction mode for repository and team management.

### Google Identity

Logos creates and manages [Cloud Identity groups](https://cloud.google.com/identity/docs/groups) for each team across environments. These groups are used for IAM bindings throughout Corpus and Pneuma.

### Datadog

Logos manages [Datadog teams](https://docs.datadoghq.com/account_management/teams/), users, API keys, and SAML configuration for the organization.
