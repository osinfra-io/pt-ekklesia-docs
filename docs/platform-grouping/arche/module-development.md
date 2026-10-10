---
sidebar_label: Module Development
---

import AgentDemo from '@site/src/components/AgentDemo';
import demoStyles from '@site/src/components/AgentDemo/styles.module.css';

export const archeMessages = [
  {
    role: 'user',
    text: 'Use the Arche Module Agent in osinfra-io/pt-arche-child-module-template to create a new module.',
  },
  {
    role: 'agent',
    content: (
      <>
        <p>👋 Hi! I'm the Arche Module Agent. I help create new <code>pt-arche-*</code> OpenTofu child module repositories — I'll scaffold all the files, wire up the GitHub Actions workflows, and open a PR on <code>pt-logos</code> to register the new repo.</p>
        <p>Give me just a moment while I look you up…</p>
        <p className={demoStyles.meta}>✓ Identity validated · @arche-dev · arche-dev@osinfra.io</p>
        <p>What GCP or Kubernetes resource will this module manage?</p>
      </>
    ),
  },
  {
    role: 'user',
    text: 'Cloud Spanner databases',
  },
  {
    role: 'agent',
    content: (
      <>
        <p>Based on that, I'd suggest naming the repository <code>pt-arche-google-cloud-spanner</code>. Does that work?</p>
        <p className={demoStyles.meta}>✓ No naming conflicts found in pt-logos or GitHub</p>
        <p>How about this description? Feel free to revise it:</p>
        <p><em>OpenTofu module that manages Google Cloud Spanner instances and databases.</em></p>
      </>
    ),
  },
  {
    role: 'user',
    text: 'Looks good. No sub-modules needed. Default feature flags are fine.',
  },
  {
    role: 'agent',
    content: (
      <>
        <p>Here's what I'll do:</p>
        <ul>
          <li>📋 <strong>Open a PR on pt-logos</strong> to register <code>pt-arche-google-cloud-spanner</code> under the <code>pt-arche</code> team</li>
          <li>📁 <strong>Once you confirm the repo exists</strong>, push all scaffolded files — <code>helpers.tofu</code>, <code>main.tofu</code>, <code>variables.tofu</code>, <code>outputs.tofu</code>, tests, workflows, and more</li>
        </ul>
        <p className={demoStyles.meta}>helpers.tofu pre-pinned to current pt-arche-core-helpers SHA</p>
        <p>Shall I open the PR?</p>
      </>
    ),
  },
];

# Module Development

New `pt-arche-*` modules are created using [`pt-arche-child-module-template`](https://github.com/osinfra-io/pt-arche-child-module-template) — a skeleton repository paired with a Copilot coding agent that handles the entire creation workflow end-to-end.

## The Arche Module Agent

The **Arche Module Agent** is a GitHub Copilot coding agent that creates new `pt-arche-*` repositories without requiring any local setup. It validates your identity, collects the module details, opens a PR on `pt-logos` to register the repo, and scaffolds all files once the repo exists.

<AgentDemo messages={archeMessages} title="GitHub Copilot — Arche Module Agent" />

### How to invoke it

Clone the template repo and run the Copilot CLI from within it — then type `/agent` and select **Arche Module Agent** from the menu:

```none
git clone https://github.com/osinfra-io/pt-arche-child-module-template
cd pt-arche-child-module-template
gh copilot
```

:::tip GitHub access

The agent opens pull requests through the GitHub MCP server. Start Copilot CLI with `copilot --enable-all-github-mcp-tools` so write tools are available.

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

## Optional local integration tests

For complex application configuration changes, developers can choose to exercise Authentik, Istio, and agentgateway together before pushing to sandbox:

```none
/platform-grouping:test-local-gateway-stack
```

The [platform-grouping plugin](https://github.com/osinfra-io/pt-ai-plugins/tree/main/plugins/platform-grouping) owns the setup and verification runbook. Participating repositories keep component fixtures under `tests/kubernetes/`, with directly runnable `setup.sh`, `verify.sh`, and `teardown.sh` entry points. Fixtures use checked-out modules so local edits are exercised; generated state and credentials stay in ignored `.work/` directories. Do not maintain parallel Docker Compose fixtures. This workflow is opt-in, not a mandatory pre-push or CI gate, and remains separate from mocked OpenTofu tests.

The target runtime is a dedicated Docker Desktop Kubernetes cluster using the Kind provisioner. All stack components, including Authentik and PostgreSQL, run in Kubernetes. Setup must reject existing unowned installations rather than overwrite them, and cleanup must not purge shared CRDs. Local PostgreSQL, upstream images, and local TLS replace cloud database, registry, and certificate infrastructure; successful local checks do not validate GCP load balancers, Cloud Armor, Workload Identity, or multi-region behavior.

The Authentik fixture and cloud root both call Pneuma's checked-out `regional/authentik-config/authentication` child module. The brand CSS/assets, custom authentication flow, identification settings, stage order, and conditional password/MFA policies are shared; only the resolved local domain and Development titles differ. The fixture supplies local OAuth, application, and group inputs and discovers built-in Authentik objects locally. Cloud discovery and environment enablement stay in the cloud root. Rerun Authentik setup and verification after editing this shared module; no database reset is needed.

Agentgateway modules require an explicit namespace and do not create it. Local fixtures own the `agentgateway` namespace; platform namespaces are declared in the Logos team configuration and created by Pneuma onboarding. Pneuma's `agentgateway` namespace is mesh-enabled, enrolling its workloads in ambient Istio.

Explicit local teardown deletes all fixture-owned namespaces and PostgreSQL data. The next setup starts with fresh users and application configuration. Shared CRDs, cluster system namespaces, and the fixture ownership marker are retained.

Real Google browser sign-in is necessary for a full end-to-end result. Configure the Google web client's `https://localhost/source/oauth/callback/google/` redirect and supply its credentials through the developer environment. Redirect checks alone must be reported as browser verification pending.

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

## Components

Arche modules follow a two-sided contract between module authors and consumers.

**Authors** tag releases with semver after merging to `main`. The release workflow generates notes and publishes automatically:

```none
git tag v1.2.3 && git push origin v1.2.3
```

**Consumers** never reference semver tags or branch names as `ref` values — they always pin to the post-merge commit SHA on `main` with an inline version comment:

```hcl
module "google_project" {
  source = "github.com/osinfra-io/pt-arche-google-project?ref=<40-char-sha>"  # v1.2.3
}
```

The SHA must come from after the squash merge lands on `main`, not from the PR branch tip. Branch SHAs are unstable and can be rewritten; `main` SHAs are permanent.

### Releasing the dependency chain

Use the [platform-grouping plugin](https://github.com/osinfra-io/pt-ai-plugins/tree/main/plugins/platform-grouping)'s release skill:

```none
/platform-grouping:release-arche-modules
```

The skill discovers active Arche module repositories, including AgentGateway and Authentik, rather than relying on a fixed inventory. It compares released tag commits with `main`, handles initial `v0.1.0` releases, releases Core Helpers before its dependents, and updates the untagged scaffold. Modules without a Core Helpers dependency still participate in release detection.

Consumer updates require confirmation and cover every deployment workspace in Corpus and Pneuma, including regional workspaces and nested add-ons. Canonical helper files are edited once so symlinks remain intact. Release PRs use existing `dependencies` and `opentofu` labels; signing failures are surfaced without rewriting commits or opening duplicate PRs. Admin merges require explicit authorization, and validation failures require separate approval before bypassing them.

## Core Invariant

Every module `ref` must point to a post-merge commit SHA on `main` — never a branch name or semver tag. This makes every deployment reproducible and auditable.
