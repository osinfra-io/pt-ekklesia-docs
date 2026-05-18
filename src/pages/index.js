import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import AgentDemo from '@site/src/components/AgentDemo';
import Card from '@site/src/components/Card';
import CardGrid from '@site/src/components/CardGrid';

import styles from './index.module.css';

const features = [
  {
    title: 'Secure by default — not your problem to configure',
    description:
      'Your infrastructure is CIS-compliant before you write a line of application code. Hardened GCP projects, KMS-encrypted state, and audit logging are built in — your team inherits a secure foundation without having to build or maintain it.',
    icon: '🔐',
  },
  {
    title: 'Built on open standards',
    description:
      'Infrastructure automation and runtime tooling are built on CNCF and Linux Foundation open-source projects — Kubernetes, Istio, cert-manager, OPA Gatekeeper, OpenTofu, OpenBao. No proprietary abstractions, no lock-in, no black boxes.',
    icon: '📦',
  },
  {
    title: 'AI agents, not tickets',
    description:
      'The platform is built around GitHub Copilot agents — the Nomos Agent handles team onboarding end-to-end. No YAML to write, no support ticket to file. Just describe what you need.',
    icon: '🤖',
  },
  {
    title: 'Inner source, not a bottleneck',
    description:
      'Arche, Ekklesia, and Techne run as inner-source repositories — any engineer can open a pull request, and platform engineers from staffed teams review. Stream-aligned teams unblock themselves by contributing fixes and new capabilities directly to the platform.',
    icon: '🤝',
  },
];

const cards = [
  {
    icon: '🚀',
    title: 'Onboard your team',
    note: 'New to the platform? The Nomos Agent guides you through onboarding step by step. No prior platform knowledge needed.',
    link: '/stream-aligned-teams',
    linkText: 'Get started →',
  },
  {
    icon: '🗺️',
    title: 'Explore the Platform',
    note: 'Understand the team topology — how the platform is organized, what each team owns, and how the layers fit together.',
    link: '/platform-grouping',
    linkText: 'See the teams →',
  },
  {
    icon: '🌐',
    title: 'Explore the Ecosystem',
    note: 'The open-source tools and infrastructure that power the platform — GCP, OpenTofu, GKE, Istio, Datadog, OpenBao, GitHub Actions, and more.',
    link: '/ecosystem',
    linkText: 'See the stack →',
  },
];

const whatYouGet = [
  { icon: '🏗️', title: 'Cloud foundation', note: 'Team-scoped folder hierarchy across sandbox, non-production, and production, with admin, reader, and writer identity groups' },
  { icon: '🤝', title: 'Team management', note: 'GitHub parent team with branch protection policies and a Datadog team provisioned with your designated admin' },
  { icon: '☸️', title: 'GKE cluster', note: 'Dedicated cluster with Istio, cert-manager, OPA Gatekeeper, and Workload Identity pre-configured' },
  { icon: '🚀', title: 'Continuous delivery', note: 'Workload Identity bindings so pipelines and workloads authenticate to GCP without service account keys' },
  { icon: '🔒', title: 'Secrets management', note: 'Team-scoped KV2 paths, dynamic credentials, and a Kubernetes secrets operator via OpenBao' },
  { icon: '📄', title: 'Documentation', note: 'A dedicated page on the platform docs site, scaffolded from your team spec' },
  { icon: '🐶', title: 'Observability', note: 'Logs, metrics, and APM flowing to Datadog from day one — with your team registered in the service catalog and API catalog' },
];

function WhatYouGet() {
  return (
    <section className={styles.whatYouGet}>
      <div className="container">
        <Heading as="h2" className={styles.whatYouGetHeading}>
          Everything your team needs, out of the box.
        </Heading>
        <p className={styles.whatYouGetSubtitle}>
          From source code management to production support — everything your team needs, already in place.
        </p>
        <div className={styles.whatYouGetGrid}>
          {whatYouGet.map((item) => (
            <div key={item.title} className={styles.whatYouGetItem}>
              <span className={styles.whatYouGetIcon}>{item.icon}</span>
              <div>
                <div className={styles.whatYouGetTitle}>{item.title}</div>
                <div className={styles.whatYouGetNote}>{item.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


const techLogosOss = [
  { src: '/img/opentofu.png', alt: 'OpenTofu' },
  { src: '/img/helm-white.svg', alt: 'Helm' },
  { src: '/img/istio.png', alt: 'Istio' },
  { src: '/img/cert-manager-white.svg', alt: 'cert-manager' },
  { src: '/img/opa.png', alt: 'OPA Gatekeeper' },
  { src: '/img/openbao.svg', alt: 'OpenBao' },
  { src: '/img/docusaurus.svg', alt: 'Docusaurus' },
];

const techLogosVendor = [
  { src: '/img/google-cloud.svg', alt: 'Google Cloud' },
  { src: '/img/datadog.png', alt: 'Datadog' },
  { src: '/img/github-mark.svg', alt: 'GitHub' },
];

function HomeFooter() {
  return (
    <footer className={styles.homeFooter}>
      <div className={styles.homeFooterInner}>
        <div className={styles.homeFooterBrand}>
          <img src="/img/osinfra-logo-full.png" alt="osinfra.io" className={styles.homeFooterLogo} />
          <p className={styles.homeFooterTagline}>
            A team-first, vendor-light, open source reference implementation for cloud infrastructure.
          </p>
        </div>
        <div className={styles.homeFooterLinks}>
          <div className={styles.homeFooterCol}>
            <span className={styles.homeFooterColTitle}>Project</span>
            <a href="https://github.com/osinfra-io" className={styles.homeFooterLink} target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://github.com/sponsors/osinfra-io?frequency=one-time" className={styles.homeFooterLink} target="_blank" rel="noopener noreferrer">Sponsor</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function TechStrip() {
  return (
    <div className={styles.techStrip}>
      <Link to="/ecosystem" className={styles.techStripInner} aria-label="Explore the ecosystem">
        <span className={styles.techStripTitle}>Powered by</span>
        <div className={styles.techStripLogosRow}>
          <span className={styles.techStripLabel}>Open source</span>
          <div className={styles.techStripLogos}>
            {techLogosOss.map((logo) => (
              <img key={logo.alt} src={logo.src} alt={logo.alt} className={styles.techStripLogo} title={logo.alt} />
            ))}
          </div>
          <span className={styles.techStripDivider} aria-hidden="true" />
          <span className={styles.techStripLabel}>Vendor</span>
          <div className={styles.techStripLogos}>
            {techLogosVendor.map((logo) => (
              <img key={logo.alt} src={logo.src} alt={logo.alt} className={styles.techStripLogo} title={logo.alt} />
            ))}
          </div>
          <span className={styles.techStripCta}>Explore the full ecosystem →</span>
        </div>
      </Link>
    </div>
  );
}

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
          A team-first, vendor-light, open source reference implementation for cloud infrastructure.
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
            The <strong>Nomos Agent</strong> asks the right questions and takes care of the platform details. Your team is up and running in minutes.
          </p>
          <Link
            to="/stream-aligned-teams#onboarding"
            className={styles.gettingStartedCta}
          >
            See the full onboarding guide →
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
    <Layout noFooter description="A team-first, vendor-light, open source reference implementation for cloud infrastructure.">
      <Hero />
      <main>
        <Features />
        <GettingStarted />
        <WhatYouGet />
        <TechStrip />
        <CallToAction />
      </main>
      <HomeFooter />
    </Layout>
  );
}
