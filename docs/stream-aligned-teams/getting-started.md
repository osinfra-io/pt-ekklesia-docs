---
sidebar_label: Getting Started
description: Onboard your stream-aligned team onto the platform using the Logos Agent.
---

import AgentDemo from '@site/src/components/AgentDemo';

# Getting Started

The fastest way to get your team onto the platform is the **Logos Agent** — a GitHub Copilot coding agent that handles the full onboarding conversation and opens a pull request with every change. No local setup, no YAML to write by hand.

<AgentDemo />

## The Logos Agent

The Logos Agent manages everything a stream-aligned team needs on the platform: GCP folder hierarchy, identity groups, GitHub teams, Datadog team, repositories, environments, and feature flags. It reads the current state from `pt-logos` and opens a reviewed pull request for every change — nothing is applied directly.

### How to invoke it

Open [GitHub Copilot](https://github.com/copilot) and use the `/agent` command to invoke the Logos Agent from the `pt-logos` repository:

```none
/agent osinfra-io/pt-logos
```

The agent will look up your identity, check whether you already exist on the platform, and walk you through the rest.

:::warning GitHub MCP — write permissions required

The agent opens pull requests and reads repository state using the [GitHub MCP server](https://github.com/github/github-mcp-server). It must be enabled with **write** toolsets — read-only MCP will allow the agent to inspect state but it will not be able to create branches or open pull requests.

:::

### What it can do

| Task | What gets created |
|---|---|
| **Onboard a new team** | GCP folder hierarchy (sb/nonprod/prod), Google Identity groups, GitHub parent + child teams, Datadog team |
| **Add or remove a member** | GitHub team membership, Google Identity group membership, Datadog team membership |
| **Add a repository** | GitHub repo registered in Logos with description, topics, branch protection, and optional feature flags |
| **Add a GitHub environment** | Deployment environment on a repo with reviewer teams and branch policies |
| **Enable a feature flag** | Workflows service account, OpenTofu state bucket, Datadog webhook, WIF binding |
| **Add a GCP project** | Additional Google Cloud project for the team |
| **Add a GKE cluster location** | Zone-pinned or regional cluster location registered in the team's Kubernetes configuration |

### What happens after the PR merges

Logos runs OpenTofu on merge — the GCP folder hierarchy, identity groups, and GitHub structure are created automatically. Corpus and Pneuma pick up the new team data on their next deployment, provisioning GCP projects and Kubernetes namespaces.
