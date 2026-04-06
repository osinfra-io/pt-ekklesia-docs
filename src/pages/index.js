import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Card from '@site/src/components/Card';
import CardGrid from '@site/src/components/CardGrid';

import styles from './index.module.css';

const features = [
  {
    title: 'Infrastructure as Code',
    description:
      'OpenTofu modules and reusable patterns for GCP projects, networking, storage, and identity — all version-controlled and tested.',
    icon: '🏗️',
  },
  {
    title: 'Kubernetes Platform',
    description:
      'Production-grade GKE clusters with Istio service mesh, cert-manager, OPA Gatekeeper, and Datadog observability built in.',
    icon: '☸️',
  },
  {
    title: 'Developer Experience',
    description:
      'Shared GitHub Actions workflows, pre-commit hooks, Codespaces, and standardized CI/CD so teams ship faster with less friction.',
    icon: '🚀',
  },
];

const cards = [
  {
    icon: '📖',
    title: 'Documentation',
    note: 'Learn about the platform architecture, team structure, and how everything fits together.',
    link: '/home/intro',
    linkText: 'Read the docs →',
  },
  {
    icon: '💻',
    title: 'GitHub',
    note: 'Explore the source code, open issues, and contribute to the platform modules.',
    link: 'https://github.com/osinfra-io',
    linkText: 'View on GitHub →',
  },
  {
    icon: '⚡',
    title: 'Getting Started',
    note: 'Set up your development environment and start working with the platform.',
    link: '/home/intro',
    linkText: 'Get started →',
  },
];

function Hero() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroTagline}>{siteConfig.tagline}</p>
        <p className={styles.heroSubtitle}>
          A team-first, open source reference implementation for building and
          managing cloud infrastructure on Google Cloud Platform using OpenTofu,
          Kubernetes, and GitHub Actions.
        </p>
      </div>
    </header>
  );
}

function Features() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featureGrid}>
          {features.map((feature) => (
            <div key={feature.title} className={styles.featureItem}>
              <span className={styles.featureIcon}>{feature.icon}</span>
              <Heading as="h3" className={styles.featureTitle}>
                {feature.title}
              </Heading>
              <p className={styles.featureDescription}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className={styles.cta}>
      <div className="container">
        <CardGrid>
          {cards.map((card) => (
            <Card key={card.title} item={card} />
          ))}
        </CardGrid>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout description="Open Source Infrastructure as Code reference implementation">
      <Hero />
      <main>
        <Features />
        <CallToAction />
      </main>
    </Layout>
  );
}
