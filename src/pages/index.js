import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import AgentDemo from '@site/src/components/AgentDemo';
import Card from '@site/src/components/Card';
import CardGrid from '@site/src/components/CardGrid';

import styles from './index.module.css';

const features = [
  {
    title: 'Security by default, not bolt-on',
    description:
      'CIS benchmarks enforced at every layer — commit-time scanning catches violations before they land, GCP projects and GKE clusters are automatically hardened at deployment. Audit logging, KMS-encrypted state, zero default VPCs — making the right thing the easiest thing to do.',
    icon: '🔐',
  },
  {
    title: 'Built on open standards',
    description:
      'Infrastructure automation and runtime tooling are built on CNCF and Linux Foundation open-source projects — Kubernetes, Istio, cert-manager, OPA Gatekeeper, OpenTofu, OpenBao. No proprietary abstractions, no lock-in, no black boxes.',
    icon: '📦',
  },
  {
    title: 'Team onboarding in minutes',
    description:
      'The Nomos Agent is the self-serve interface to the platform — onboard teams, manage members and repositories, and request infrastructure through a single conversation. Typed MCP tools validate and render canonical HCL across repos, opening pull requests instead of filing tickets.',
    icon: '🤖',
  },
];

const cards = [
  {
    icon: '🗺️',
    title: 'Explore the Platform',
    note: 'Understand the team topology — how the platform is organized, what each team owns, and how the layers fit together.',
    link: '/platform-grouping',
    linkText: 'See the teams →',
  },
  {
    icon: '🧩',
    title: 'Browse the Modules',
    note: 'Reusable OpenTofu modules organized by infrastructure layer — Google Cloud modules for projects, networking, GKE, and storage; Kubernetes modules for Istio, cert-manager, OPA Gatekeeper, and Datadog.',
    link: '/platform-grouping/arche',
    linkText: 'Explore the library →',
  },
  {
    icon: '💻',
    title: 'View the Source',
    note: 'Everything is open source. Explore the repositories, open issues, and contribute to the platform.',
    link: 'https://github.com/osinfra-io',
    linkText: 'Browse on GitHub →',
  },
];

function Hero() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <img
          src="/img/osinfra-logo-full.png"
          alt="osinfra.io"
          className={styles.heroLogo}
        />
        <p className={styles.heroSubtitle}>
          A team-first, open source reference implementation for building and
          managing cloud infrastructure — built on vendor-light, open-source
          tooling. This is what it looks like when documentation is a
          first-class platform concern.
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

function GettingStarted() {
  return (
    <section className={styles.gettingStarted}>
      <div className={styles.gettingStartedInner}>
        <div className={styles.gettingStartedLeft}>
          <Heading as="h2" className={styles.gettingStartedHeading}>
            Your team, on the platform in minutes
          </Heading>
          <p className={styles.gettingStartedBody}>
            The <strong>Nomos Agent</strong> handles the full onboarding conversation and opens a pull request with every change — GCP folder hierarchy, identity groups, GitHub teams, Datadog team, and repositories. No YAML to write by hand, no support ticket to file.
          </p>
          <Link
            to="/stream-aligned-teams#onboarding"
            className={styles.gettingStartedCta}
          >
            Onboard your team →
          </Link>
        </div>
        <div className={styles.gettingStartedRight}>
          <AgentDemo />
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
    <Layout description="A team-first, open source reference implementation for building and managing cloud infrastructure — built on vendor-light, open-source tooling. This is what it looks like when documentation is a first-class platform concern.">
      <Hero />
      <main>
        <Features />
        <GettingStarted />
        <CallToAction />
      </main>
    </Layout>
  );
}
