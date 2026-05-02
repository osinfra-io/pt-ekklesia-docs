---
sidebar_label: Developer Experience
---

# Developer Experience

Standardized tooling and environments that make developing and iterating on platform infrastructure consistent and reproducible.

- **[pt-techne-opentofu-codespace](https://github.com/osinfra-io/pt-techne-opentofu-codespace)**: A GitHub Codespace pre-configured with OpenTofu, pre-commit, and all platform tooling — ready to use without local setup
- **[pt-techne-pre-commit-hooks](https://github.com/osinfra-io/pt-techne-pre-commit-hooks)**: Custom pre-commit hooks written in Go that enforce IaC formatting (`tofu fmt`), configuration validation (`tofu validate`), and automated testing (`tofu test`) before every commit
- **[pt-techne-development-setup](https://github.com/osinfra-io/pt-techne-development-setup)**: Local development environment setup for engineers who prefer working outside of Codespaces

:::tip Architecture Decision Records

This page includes [Architecture Decision Records](#architecture-decision-records) documenting the key design decisions.

:::

## Components

### GitHub Codespace

A GitHub Codespace pre-configured with OpenTofu, pre-commit, gcloud, kubectl, and all platform tooling. Defined as code in `pt-techne-opentofu-codespace`, version-controlled, and updated alongside the platform.

### Pre-commit Toolchain

The primary resource is `pre-commit-config` — a `.pre-commit-config.yaml` file pinned to specific hook versions, enforcing `tofu fmt`, `tofu validate`, `tofu test`, YAML lint, and trailing whitespace. Identical in local and CI environments.

| Component | Description |
|---|---|
| `pre-commit-hook` | A custom hook (written in Go) in `pt-techne-pre-commit-hooks` implementing platform-specific IaC checks beyond what stock hooks provide |

### Local Development Setup

A local setup guide and script in `pt-techne-development-setup` for engineers who prefer native tooling over Codespaces.

## Onboarding

Three supported developer environments — all run the same toolchain and enforce the same pre-commit checks.

### Ubuntu (Native/WSL)

Applies to both a native Ubuntu install and Windows WSL2 Ubuntu. WSL2 users need to install the Linux subsystem first.

**WSL2 only — install Ubuntu on Windows:**

```powershell
wsl --install
```

Restart your computer, then open a WSL2 Ubuntu terminal and continue with the steps below.

**Ubuntu setup (native and WSL2):**

This step is optional but allows `sudo` access without entering a password.

```bash
echo "$USER ALL=(ALL) NOPASSWD:ALL" | sudo EDITOR='tee -a' visudo
```

Run the setup script from [pt-techne-development-setup](https://github.com/osinfra-io/pt-techne-development-setup):

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/osinfra-io/pt-techne-development-setup/main/ubuntu/setup.sh)"
```

Change your default shell to Zsh and exit.

```bash
chsh -s /home/linuxbrew/.linuxbrew/bin/zsh; exit
```

Once complete, stay current by running the generated update script.

```bash
~/bin/update.zsh
```

### Ubuntu Docker Image

The [pt-techne-development-setup](https://github.com/osinfra-io/pt-techne-development-setup) repository publishes a pre-built Ubuntu Docker image — the same base image used by the Codespace.

Pull the image from the GitHub container registry.

```bash
docker pull ghcr.io/osinfra-io/ubuntu:latest
```

Run the image in interactive mode.

```bash
docker run -it ghcr.io/osinfra-io/ubuntu:latest
```

To attach VS Code to the running container, install the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension, click the open a remote window icon in the status bar, and select **Attach to Running Container**.

This same image can be used as a devcontainer — open the repo containing a `.devcontainer/devcontainer.json` that references `ghcr.io/osinfra-io/ubuntu` in a Codespace and GitHub will use it automatically.

### GitHub Codespace

The [pt-techne-opentofu-codespace](https://github.com/osinfra-io/pt-techne-opentofu-codespace) repository provides a fully configured GitHub Codespace. Go to the repository, click **Code → Codespaces → Create a new Codespace on main**.

When the Codespace starts, all `pt-*` repositories in the `osinfra-io` organization are automatically cloned into `/workspaces/`. VS Code opens `/workspaces` directly so all repositories are immediately visible and navigable in the file explorer — no local setup required.

## Core Invariant

`pre-commit run -a` must pass before any commit.

CI enforces the core OpenTofu checks (`tofu fmt`, `tofu validate`, `tofu test`) directly — it does not run the full pre-commit suite. YAML lint, trailing whitespace, and custom hooks are local-only gates.

## Architecture Decision Records

### GitHub Codespace as the Standard Development Environment

<table>
  <thead>
    <tr><th>Status</th><th>Date</th><th>Deciders</th></tr>
  </thead>
  <tbody>
    <tr><td>Accepted ✅</td><td>April 2026</td><td>Techne</td></tr>
  </tbody>
</table>

#### Context and Problem Statement

Platform engineers need OpenTofu, gcloud, kubectl, pre-commit, and a set of custom hooks available in a consistent, reproducible environment. Without a standardized environment, engineers spend time debugging toolchain differences rather than building infrastructure. Version mismatches between local tools and CI are a common source of failures that are hard to diagnose.

The platform has a small team (1-2 engineers). Onboarding time is a meaningful cost. Any new engineer should be productive within hours, not days.

#### Decision

Provide a GitHub Codespace (`pt-techne-opentofu-codespace`) as the primary development environment, pre-configured with the full platform toolchain. The Codespace is defined as code, version-controlled, and updated alongside the platform.

A local setup guide (`pt-techne-development-setup`) is maintained for engineers who prefer native tooling, but the Codespace is the supported default. Pre-commit hooks (`pt-techne-pre-commit-hooks`) enforce local checks before every commit; CI enforces the core OpenTofu checks (`tofu fmt`, `tofu validate`, `tofu test`).

#### Alternatives Considered

- **Document required tools and let engineers install them manually** — Rejected. Leads to version drift across machines and between local and CI. Debugging environment-specific failures is expensive and opaque.
- **Self-hosted runner with a fixed Docker image** — Rejected. Adds infrastructure to manage and does not improve the local development experience. The Codespace serves both purposes.
- **Devcontainer without Codespace (local Docker only)** — Rejected. Requires Docker to be running locally and adds setup steps. The Codespace works immediately from any browser or VS Code instance without local Docker.

#### Consequences

- New engineers are productive within hours of repository access
- Local pre-commit hooks catch formatting, validation, and custom checks before code is pushed; CI enforces the core OpenTofu checks as a second gate
- Toolchain updates are applied once in the Codespace definition and inherited by all engineers on next rebuild
- Engineers on restricted machines (no local Docker, managed endpoints) can still contribute via browser-based Codespace
