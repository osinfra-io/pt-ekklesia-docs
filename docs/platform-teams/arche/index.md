---
sidebar_label: Arche
description: The origin and first cause — the primordial source from which all platform foundations draw their initial form and essential nature.
---

import ModuleCard from '@site/src/components/ModuleCard';

# Arche

Arche is the origin and first cause — the primordial source from which all platform foundations draw their initial form and essential nature. Nothing above it exists without it.

Arche operates as an inner-source shared kernel: versioned OpenTofu modules published on GitHub, consumed by Logos, Corpus, and Pneuma as pinned dependencies. All modules build on `pt-arche-core-helpers` for environment detection, standard labels, and team data.

- **[Google Cloud](./google-cloud)**: GCP infrastructure modules — projects, networking, GKE, storage, Cloud SQL, and Datadog integration
- **[Kubernetes](./kubernetes)**: Kubernetes add-on modules — Istio, cert-manager, Datadog Operator, and OPA Gatekeeper

<div className="row">
  <div className="col col--4 margin-bottom--lg">
    <ModuleCard
      image="/img/administration.svg"
      title="pt-arche-core-helpers"
      description="OpenTofu module for helpers providing core platform functionality including workspace parsing, resource labeling, and logos integration for team and project management"
      href="https://github.com/osinfra-io/pt-arche-core-helpers"
    />
  </div>
  <div className="col col--4 margin-bottom--lg">
    <ModuleCard
      image="/img/mirko-transparent.png"
      title="pt-arche-child-module-template"
      description="Cookiecutter skeleton and Copilot agent for creating new pt-arche-* OpenTofu child module repositories — collects module details, creates the GitHub repo, pushes skeleton files, and opens a PR on pt-logos to register the repo"
      href="https://github.com/osinfra-io/pt-arche-child-module-template"
    />
  </div>
</div>

## Repositories

### AI Context

- **[pt-arche-ai-context](https://github.com/osinfra-io/pt-arche-ai-context)**: Team-level Copilot instructions for `pt-arche-*` repositories
