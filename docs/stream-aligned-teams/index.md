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

The fastest way to get your team onto the platform is the **Nomos Agent** — your self-serve interface to the osinfra.io platform. Tell it what you need and it handles the rest, opening a pull request with every change. No local setup, no YAML to write by hand.

:::info Before you start

Have the following ready before invoking the Nomos Agent — it will ask for all of these:

- **Team key** — a short, lowercase `st-` prefixed identifier (e.g., `st-ethos`)
- **Display name** — Title Case team name (e.g., `Ethos`)
- **Description** — a one-line summary of what your team does; this appears in documentation and the Datadog team profile
- **GitHub usernames** — handles for your team's maintainers and members (used for the GitHub parent team)
- **Email addresses** — work emails for each member; used for Google Cloud Identity groups (admin, reader, writer) and Datadog team membership

GitHub usernames and email addresses are collected separately — have both on hand.

:::


<AgentDemo />

### The Nomos Agent

The Nomos Agent is the platform's self-serve interface for all teams. Describe what your team needs — identity structure, repositories, infrastructure, or configuration — and Nomos handles the platform internals, opening a reviewed pull request for every change. Nothing is applied directly.

### How to invoke it

Clone the repo and run the Copilot CLI from within it — then type `/agent` and select **Nomos Agent** from the menu:

```none
git clone https://github.com/osinfra-io/pt-techne-agents
cd pt-techne-agents
gh copilot
```

:::warning GitHub MCP — configuration required

The agent opens pull requests and reads repository state using the [GitHub MCP server](https://github.com/github/github-mcp-server). It must be enabled with **write** toolsets — read-only MCP will allow the agent to inspect state but it will not be able to create branches or open pull requests.

The GitHub MCP server must be configured with a **fine-grained Personal Access Token** scoped to the `osinfra-io` organization with the following permissions:

| Permission | Access |
|---|---|
| Contents | Read and write |
| Issues | Read and write |
| Pull requests | Read and write |
| Workflows | Read and write |

Fine-grained PATs must be created through the GitHub web UI at [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new). Set the resource owner to the **`osinfra-io` organization** (not individual repositories) so the token can operate across all repos the agent needs to reach.

:::

### What happens after the PR merges

Logos runs OpenTofu on merge — the GCP folder hierarchy, identity groups, and GitHub structure are created automatically. Corpus and Pneuma are not triggered by a Logos merge; each deploys when its own PR merges to main or a platform engineer triggers `workflow_dispatch`. When Pneuma runs, namespace creation and Workload Identity bindings are applied automatically within the same pipeline — no additional trigger is needed. See [Namespace Provisioning](/platform-grouping/pneuma/cluster-management#namespace-provisioning) for the full pipeline flow.

## Teams

<CardGrid>
  <Card item={{ icon: '🧭', title: 'Ethos', note: 'The lived moral character that customers experience — the trustworthiness, transparency, and integrity through which the business earns and keeps their confidence.', link: '/stream-aligned-teams/ethos', linkText: 'Learn more →' }} />
</CardGrid>
