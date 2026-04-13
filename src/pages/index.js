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
      'Every GCP project is automatically CIS GCP Foundation Benchmark compliant. Audit logging, encrypted log sinks, KMS-encrypted state, zero default VPCs — making the right things the easiest things to do.',
    icon: '🔐',
  },
  {
    title: 'Built on open standards',
    description:
      'Every layer of the stack uses CNCF and open-source projects — Kubernetes, Istio, cert-manager, OPA Gatekeeper, OpenTofu. No proprietary abstractions, no lock-in, no black boxes.',
    icon: '📦',
  },
  {
    title: 'Team onboarding in minutes',
    description:
      'AI-assisted onboarding creates GCP projects, identity groups, GitHub repos, and Kubernetes namespaces from a single conversation — producing a reviewed pull request, not a support ticket.',
    icon: '🤖',
  },
];

const cards = [
  {
    icon: '🗺️',
    title: 'Explore the Platform',
    note: 'Understand the team topology — how the platform is organized, what each team owns, and how the layers fit together.',
    link: '/platform-teams',
    linkText: 'See the teams →',
  },
  {
    icon: '🧩',
    title: 'Browse the Modules',
    note: 'Eleven reusable OpenTofu modules covering GCP projects, networking, GKE, Istio, cert-manager, OPA Gatekeeper, and more.',
    link: '/platform-teams/arche',
    linkText: 'View the modules →',
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
          tooling.
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
            The <strong>Logos Agent</strong> handles the full onboarding conversation and opens a pull request with every change — GCP folder hierarchy, identity groups, GitHub teams, Datadog team, and repositories. No YAML to write by hand, no support ticket to file.
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
    <Layout description="A team-first, open source reference implementation for building and managing cloud infrastructure — built on vendor-light, open-source tooling.">
      <Hero />
      <main>
        <Features />
        <GettingStarted />
        <CallToAction />
      </main>
    </Layout>
  );
}
