import React, { useState } from 'react';
import Layout from '@theme/Layout';
import styles from './ecosystem.module.css';

const categories = [
  {
    id: 'cloud',
    label: 'Cloud',
    tools: [
      {
        name: 'Google Cloud Platform',
        logo: '/img/google-cloud.svg',
        description: 'The cloud provider powering all platform infrastructure — GCP projects, networking, IAM, KMS, and billing.',
        href: 'https://cloud.google.com',
      },
    ],
  },
  {
    id: 'iac',
    label: 'Infrastructure as Code',
    tools: [
      {
        name: 'OpenTofu',
        logo: '/img/opentofu.png',
        description: 'The open-source IaC engine used across every layer of the platform — from GCP projects to Kubernetes manifests.',
        href: 'https://opentofu.org',
      },
    ],
  },
  {
    id: 'kubernetes',
    label: 'Kubernetes',
    tools: [
      {
        name: 'Google Kubernetes Engine',
        logo: '/img/gke.svg',
        description: 'Managed Kubernetes clusters across multiple zones and regions with Workload Identity, KMS encryption, and GKE Fleet.',
        href: 'https://cloud.google.com/kubernetes-engine',
      },
      {
        name: 'Helm',
        logo: '/img/helm.svg',
        description: 'Package manager for Kubernetes used to deploy Istio, cert-manager, and other cluster add-ons.',
        href: 'https://helm.sh',
        cncf: true,
      },
      {
        name: 'Istio',
        logo: '/img/istio.png',
        description: 'Service mesh providing mTLS, traffic management, locality-based load balancing, and Cloud Armor WAF integration.',
        href: 'https://istio.io',
        cncf: true,
      },
      {
        name: 'cert-manager',
        logo: '/img/cert-manager.png',
        description: 'Automates TLS certificate lifecycle management on GKE — no manual renewal, no expiry surprises.',
        href: 'https://cert-manager.io',
        cncf: true,
      },
      {
        name: 'OPA Gatekeeper',
        logo: '/img/opa.png',
        description: 'Enforces admission policies cluster-wide using Open Policy Agent — preventing non-compliant resources from being deployed.',
        href: 'https://open-policy-agent.github.io/gatekeeper',
        cncf: true,
      },
    ],
  },
  {
    id: 'observability',
    label: 'Observability & Security',
    tools: [
      {
        name: 'Datadog',
        logo: '/img/datadog.png',
        description: 'Unified observability — logs, metrics, APM, synthetic monitoring, CSPM, application security, and cloud cost management.',
        href: 'https://datadoghq.com',
      },
      {
        name: 'Nuclei',
        logo: '/img/nuclei.svg',
        description: 'Fast, template-based vulnerability scanner used for scheduled security scanning of platform endpoints and APIs.',
        href: 'https://projectdiscovery.io/nuclei',
      },
    ],
  },
  {
    id: 'cicd',
    label: 'CI/CD',
    tools: [
      {
        name: 'GitHub Actions',
        logo: '/img/githubactions.png',
        description: 'All 151 deployment pipelines run on a single reusable called workflow — consistent, auditable, and secure via OIDC.',
        href: 'https://github.com/features/actions',
      },
      {
        name: 'Dependabot',
        logo: '/img/dependabot.png',
        description: 'Automated dependency updates across all repositories — keeping modules, providers, and Actions pinned to current versions.',
        href: 'https://docs.github.com/en/code-security/dependabot',
      },
    ],
  },
  {
    id: 'tooling',
    label: 'Developer Tooling',
    tools: [
      {
        name: 'pre-commit',
        logo: '/img/pre-commit.svg',
        description: 'Enforces formatting, validation, documentation generation, and security checks before every commit.',
        href: 'https://pre-commit.com',
      },
      {
        name: 'Docker',
        logo: '/img/docker.png',
        description: 'Used to containerize platform applications and build standardized development environments. Container images are pushed to Google Artifact Registry.',
        href: 'https://www.docker.com',
      },
      {
        name: 'GitHub Copilot',
        logo: '/img/githubcopilot-white.svg',
        description: 'AI-assisted development across the platform — team-level agents automate module scaffolding, repo creation, and PR workflows.',
        href: 'https://github.com/features/copilot',
      },
      {
        name: 'Docusaurus',
        logo: '/img/docusaurus.svg',
        description: 'Powers the platform documentation site — open-source, React-based, and deployed via GitHub Pages.',
        href: 'https://docusaurus.io',
      },
    ],
  },
];

function ToolCard({ name, logo, description, href, cncf }) {
  return (
    <a href={href} className={styles.card} target="_blank" rel="noopener noreferrer">
      <div className={styles.logoWrapper}>
        <img src={logo} alt={name} className={styles.logo} />
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{name}</h3>
        <p className={styles.cardDescription}>{description}</p>
        {cncf && (
          <img src="/img/cncf.png" alt="CNCF" className={styles.cncfBadge} title="CNCF Project" />
        )}
      </div>
    </a>
  );
}

export default function Ecosystem() {
  const [active, setActive] = useState('all');

  const filtered = active === 'all'
    ? categories
    : categories.filter((c) => c.id === active);

  return (
    <Layout title="Ecosystem" description="The tools and infrastructure that power the osinfra.io platform.">
      <main className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Ecosystem</h1>
          <p className={styles.subtitle}>
            The open-source tools and infrastructure that power the platform.
          </p>
        </div>

        <div className={styles.filters}>
          <button
            className={`${styles.filter} ${active === 'all' ? styles.filterActive : ''}`}
            onClick={() => setActive('all')}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`${styles.filter} ${active === c.id ? styles.filterActive : ''}`}
              onClick={() => setActive(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {filtered.map((category) => (
            <section key={category.id} className={styles.section}>
              <h2 className={styles.categoryLabel}>{category.label}</h2>
              <div className={styles.grid}>
                {category.tools.map((tool) => (
                  <ToolCard key={tool.name} {...tool} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </Layout>
  );
}
