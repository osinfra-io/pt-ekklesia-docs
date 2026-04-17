---
sidebar_label: Stream-Aligned Teams
description: Stream-aligned teams work directly on the flow of change to deliver value to end users, consuming capabilities provided by the platform teams.
---

import AgentDemo from '@site/src/components/AgentDemo';
import Card from '@site/src/components/Card';
import CardGrid from '@site/src/components/CardGrid';

# Stream-Aligned Teams

Stream-aligned teams work directly on the flow of change to deliver value to end users. They operate independently while consuming the infrastructure, tooling, and services provided by the platform teams.

## Onboarding

The fastest way to get your team onto the platform is the **Logos Agent** — a GitHub Copilot coding agent that handles the full onboarding conversation and opens a pull request with every change. No local setup, no YAML to write by hand.

<AgentDemo />

### The Logos Agent

The Logos Agent manages everything a stream-aligned team needs on the platform: GCP folder hierarchy, identity groups, GitHub teams, Datadog team, repositories, environments, and feature flags. It reads the current state from `pt-logos` and opens a reviewed pull request for every change — nothing is applied directly.

### How to invoke it

Clone the repo and run the Copilot CLI from within it — then type `/agent` and select **Logos Agent** from the menu:

```none
git clone https://github.com/osinfra-io/pt-logos
cd pt-logos
gh copilot
```

:::warning GitHub MCP — configuration required

The agent opens pull requests and reads repository state using the [GitHub MCP server](https://github.com/github/github-mcp-server). It must be enabled with **write** toolsets — read-only MCP will allow the agent to inspect state but it will not be able to create branches or open pull requests.

The GitHub MCP server must be configured with a **fine-grained Personal Access Token** scoped to the `osinfra-io` organization with the following permissions:

| Permission | Access |
|---|---|
| Contents | Read and write |
| Pull requests | Read and write |
| Workflows | Read and write |

Fine-grained PATs must be created through the GitHub web UI at [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new).

:::

### What happens after the PR merges

Logos runs OpenTofu on merge — the GCP folder hierarchy, identity groups, and GitHub structure are created automatically. Corpus and Pneuma pick up the new team data on their next deployment, provisioning GCP projects and Kubernetes namespaces.

## Teams

<CardGrid>
  <Card item={{ icon: '🧭', title: 'Ethos', note: 'The guiding philosophy that shapes platform principles.', link: '/stream-aligned-teams/ethos', linkText: 'Learn more →' }} />
</CardGrid>
