---
sidebar_label: Module Development
---

import ArcheModuleDemo from '@site/src/components/ArcheModuleDemo';

# Module Development

New `pt-arche-*` modules are created using [`pt-arche-child-module-template`](https://github.com/osinfra-io/pt-arche-child-module-template) — a skeleton repository paired with a Copilot coding agent that handles the entire creation workflow end-to-end.

## The Arche Module Agent

The **Arche Module Agent** is a GitHub Copilot coding agent that creates new `pt-arche-*` repositories without requiring any local setup. It validates your identity, collects the module details, opens a PR on `pt-logos` to register the repo, and scaffolds all files once the repo exists.

<ArcheModuleDemo />

### How to invoke it

Open [GitHub Copilot](https://github.com/copilot) and ask it to use the Arche Module Agent from the `pt-arche-child-module-template` repository:

```none
Use the Arche Module Agent in osinfra-io/pt-arche-child-module-template to create a new module.
```

The agent takes it from there.

### Running from the CLI

You can also run the agent locally using the [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli):

```none
git clone https://github.com/osinfra-io/pt-arche-child-module-template
cd pt-arche-child-module-template
gh copilot
```

The agent file at `.github/agents/arche-module.agent.md` is picked up automatically when Copilot runs in the repo context.

:::warning GitHub MCP — write permissions required

The agent opens pull requests and pushes files using the [GitHub MCP server](https://github.com/github/github-mcp-server). It must be enabled with **write** toolsets — read-only MCP will allow the agent to inspect state but it will not be able to create branches, push commits, or open pull requests.

:::

### What it does

1. **Validates your identity** — confirms your GitHub username maps to an `@osinfra.io` email and that you are a member of the `osinfra-io` organization
2. **Collects module details** — asks for the GCP or Kubernetes resource the module will manage, suggests a repository name following the `pt-arche-{provider}-{resource}` convention, and confirms a description
3. **Asks about sub-modules** — if the module needs a `regional/` or `zonal/` subdirectory structure, it notes this and points to `pt-arche-google-kubernetes-engine` as a reference (sub-module scaffolding is manual)
4. **Configures feature flags** — presents the three Logos configuration flags with sensible defaults

   | Flag | Default | Purpose |
   |---|---|---|
   | `enable_datadog_webhook` | `true` | Sends repo events to Datadog |
   | `enable_datadog_secrets` | `false` | Adds `DD_API_KEY`/`DD_APP_KEY` as repo secrets |
   | `enable_google_wif_service_account` | `false` | OIDC Workload Identity Federation for GCP deploys |

5. **Shows a preview** — lists exactly what will be created before doing anything; loops back on request
6. **Opens a PR on `pt-logos`** — repositories are created by Logos via OpenTofu, never directly via the GitHub API; the agent opens the registration PR and waits for you to confirm the repo exists
7. **Scaffolds the module files** — once you confirm the repo was created, pushes all skeleton files in a single commit with `MODULE_*` placeholders substituted

## What gets scaffolded

Every new module starts with this complete file structure:

```none
helpers.tofu                          # pt-arche-core-helpers pinned to current SHA
locals.tofu
main.tofu
outputs.tofu
providers.tofu
variables.tofu
README.md
SECURITY.md
.gitignore
.pre-commit-config.yaml
static-analysis.datadog.yml
tests/
  default.tftest.hcl
  fixtures/default/
    main.tofu
    variables.tofu
.github/
  copilot-instructions.md
  dependabot.yml
  release.yml
  workflows/
    add-to-projects.yml
    dependabot.yml
    release.yml
    test.yml
```

The `helpers.tofu` in the skeleton is pre-pinned to the current `pt-arche-core-helpers` SHA so the new module starts with an up-to-date foundational dependency.

## Repository naming convention

| Infrastructure type | Pattern | Example |
|---|---|---|
| GCP resource | `pt-arche-google-{resource}` | `pt-arche-google-cloud-run` |
| Kubernetes add-on | `pt-arche-kubernetes-{addon}` | `pt-arche-kubernetes-cert-manager` |
| Datadog integration | `pt-arche-datadog-{service}` | `pt-arche-datadog-google-integration` |

## After creation

Once the scaffold is pushed:

1. Add your resource code to `main.tofu`, `locals.tofu`, `variables.tofu`, and `outputs.tofu`
2. Update `tests/default.tftest.hcl` with any `mock_resource` overrides for computed attributes
3. Tag a `v0.1.0` release once the initial code is merged — the release workflow generates notes and publishes automatically
