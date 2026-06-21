---
sidebar_label: AI Tooling
---

# AI Tooling

MCP server and Copilot agents that expose platform capabilities as AI-native interfaces — typed, tested tools for agents and a self-serve conversational interface for teams.

- **[pt-techne-mcp-server](https://github.com/osinfra-io/pt-techne-mcp-server)**: Model Context Protocol server providing deterministic, typed tools so platform agents call a tested renderer instead of writing HCL by hand — covers team spec validation, tfvars rendering, PR operations, and docs generation
- **[pt-techne-agents](https://github.com/osinfra-io/pt-techne-agents)**: GitHub Copilot agent catalog — each agent is a self-serve interface to a platform capability that handles the platform internals and opens a pull request with every change
- **[pt-ai-plugins](https://github.com/osinfra-io/pt-ai-plugins)**: the osinfra-io GitHub Copilot CLI plugin marketplace — packages cross-cutting skills and federates team-owned agents and MCP servers (such as the Nomos onboarding plugin) as installable, versioned plugins

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Components

### MCP Server Tools

| Tool | Description |
|---|---|
| `validate_team_spec` | Validates a team spec object against the JSON schema — returns structured errors with path and message |
| `render_team_tfvars` | Renders a canonical `pt-logos` `.tfvars` file from a validated spec — enforces alphabetical ordering, indentation, and field placement |
| `open_team_pr` | Validates, renders, and opens or updates a PR on `pt-logos` in one idempotent call |
| `list_teams` | Lists all teams from `pt-logos@main` — team key, display name, type, member count, repo count, and env count |
| `get_team` | Returns a team's spec and existing docs pages from `pt-ekklesia-docs@main` |
| `lookup_user` | Resolves a GitHub username or email to every team membership across all team files |
| `find_repo` | Finds which team owns a repository by name |
| `render_corpus_helpers` | Returns updated `pt-corpus/helpers.tofu` bytes with the team's workspace inserted |
| `render_pneuma_helpers` | Returns updated `pt-pneuma/helpers.tofu` bytes with the team's workspace inserted |
| `render_team_docs_index` | Renders a `docs/<section>/<team>/index.md` stub for `pt-ekklesia-docs` |
| `render_sidebar_patch` | Patches `pt-ekklesia-docs/sidebars.js` to register the new team page |
| `open_team_docs_pr` | Lands the docs index page and sidebars patch as a PR on `pt-ekklesia-docs` in one idempotent call |

### Copilot Agents

| Agent | Description |
|---|---|
| `techne-nomos` | The self-serve interface to the osinfra.io platform — onboard teams, manage members and repositories, request infrastructure, and configure platform resources through a single conversation |

## Core Invariant

Agents must never hand-write HCL: all `teams/*.tfvars` writes must go through the `render_team_tfvars` path in the MCP server, all write tools must be idempotent, with `schema/team.schema.json` as the single source of truth for validation and rendering.

## Plugins and marketplace

The [`pt-ai-plugins`](https://github.com/osinfra-io/pt-ai-plugins) repository is the osinfra-io GitHub Copilot CLI plugin **marketplace** (registry `osinfra-io`). It distributes installable **capabilities** — skills, agents, and MCP servers — that work from any directory, unlike repo-scoped customizations that only load when Copilot runs inside their home repo.

| Plugin | Bundles | Source |
|---|---|---|
| `platform-conventions` | Cross-cutting platform skills (for example `create-pull-request`) | `pt-ai-plugins` |
| `techne-onboarding` | The `techne-nomos` agent and the `pt-techne-mcp-server` MCP tools | federated from `pt-techne-agents` |

The `techne-onboarding` plugin is **federated**: its manifest lives in `pt-techne-agents` and the marketplace references the repository directly, so the agent stays canonical there and its Promptfoo evaluations keep testing the real file. Its `.mcp.json` pins the server image to a release tag rather than `:latest`. Install both halves at once:

```bash
copilot plugin marketplace add osinfra-io/pt-ai-plugins
copilot plugin install techne-onboarding@osinfra-io
```

Plugins **complement**, and do not replace, custom instructions: `plugin.json` has no field for `copilot-instructions.md` or `*.instructions.md`, which continue to load via `COPILOT_CUSTOM_INSTRUCTIONS_DIRS` and per-repo files.

## Architecture Decision Records

### MCP Server as the Agent-Platform Interface

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>May 2026</td><td>Techne</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Platform agents need to produce valid, canonically formatted HCL to manage team resources. Without a shared interface, each agent would need to understand tfvars structure, field ordering, and validation rules independently — producing subtle differences in output that cause noisy diffs and validation failures. The JSON schema for a team spec is the natural source of truth, but it is not useful to agents directly unless there is a server that validates and renders against it.

#### Decision

Expose platform operations as a typed MCP server (`pt-techne-mcp-server`). Agents call tested renderers and validators; they never hand-write HCL. The schema (`schema/team.schema.json`) is the single source of truth for all team spec fields and validation rules.

Copilot agents in `pt-techne-agents` call the MCP server for all write operations. The agents own the conversational interface; the MCP server owns correctness and formatting.

#### Alternatives Considered

- **Agents write HCL directly** — Rejected. Every agent must independently understand formatting, field ordering, and schema validation. Any model drift in output format causes failures across multiple callers.
- **Shared prompt library** — Rejected. Prompts are not typed, not testable, and not versioned independently of the agents that consume them. Schema changes require updating every prompt.

#### Consequences

- All write paths go through one tested renderer — formatting and validation is consistent across all agents and callers
- The Go binary embeds the schema at build time (`internal/spec/schema_embed.json`); new optional fields are picked up on the next server release
- The Logos docs `logosTeamSchema.js` is a separate display representation and must be kept in sync with `schema/team.schema.json` manually or via a generator — it is the known maintenance surface
- Adding a new agent capability requires only new MCP tools, not changes to existing agents

### Plugins for Cross-Cutting Capabilities; Instructions Stay as Instructions

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>June 2026</td><td>Platform</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Copilot customizations were distributed by mechanism-specific means: custom instructions via the shell-scoped `COPILOT_CUSTOM_INSTRUCTIONS_DIRS` env var, skills and agents auto-loaded only when Copilot ran inside their home repo, and the MCP server registered by hand from a README with an unpinned image. There was no versioned, discoverable distribution path for cross-cutting capabilities, and the env var fails silently when Copilot is launched from a shell, GUI, or CI step that never sourced the profile.

#### Decision

Adopt GitHub Copilot CLI plugins and a group-owned marketplace (`pt-ai-plugins`, registry `osinfra-io`) for distributable **capabilities** — skills, agents, and MCP servers. Keep **custom instructions exactly as they are**: the `plugin.json` manifest has no field for `copilot-instructions.md` or `*.instructions.md`, so instructions remain on `COPILOT_CUSTOM_INSTRUCTIONS_DIRS`, per-repo files, and the VS Code setting. Team-owned plugins are **federated** — their manifest lives in the team repo and the marketplace references it, never copying files.

#### Alternatives Considered

- **Full adoption (migrate everything, including instructions)** — Rejected. Plugins cannot package custom instructions, which are the bulk of the current setup.
- **Do nothing** — Rejected. Misses a clean, versioned, discoverable distribution path for cross-cutting skills and the onboarding agent plus MCP bundle.
- **Centralized vendoring (copy team agents and MCP config into the marketplace repo)** — Rejected. Duplicates files and drifts; a vendored copy of the Nomos agent would also be invisible to its Promptfoo evaluations.

#### Consequences

- Capabilities install once and work from any directory, fixing the env var's silent-failure mode for the things that become plugins
- Plugins carry a semantic `version` and update via `copilot plugin update`; federated sources pin to the team repo
- Instructions remain unversioned and shell-scoped — unchanged, because they cannot be packaged
- The MCP image must be pinned to a release tag (not `:latest`) for a federated plugin to be trustworthy
