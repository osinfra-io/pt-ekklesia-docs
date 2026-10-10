import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import AgentDemo from '@site/src/components/AgentDemo';
import Card from '@site/src/components/Card';
import CardGrid from '@site/src/components/CardGrid';

import styles from './index.module.css';

const features = [
  {
    title: 'Guardrails by default',
    description:
      'Platform-managed projects include established security controls, encrypted state, audit logging, and policy enforcement. Your team owns its workload while the platform owns the shared guardrails.',
    icon: '🔐',
  },
  {
    title: 'Built on open standards',
    description:
      'Infrastructure automation and runtime tooling are built on CNCF and Linux Foundation open-source projects — Kubernetes, Istio, cert-manager, OPA Gatekeeper, OpenTofu, OpenBao. No proprietary abstractions, no lock-in, no black boxes.',
    icon: '📦',
  },
  {
    title: 'Innersource, not a bottleneck',
    description:
      'Arche, Ekklesia, and Techne run as innersource repositories — any engineer can open a pull request, and platform engineers from staffed teams review. Stream-aligned teams unblock themselves by contributing fixes and new capabilities directly to the platform.',
    icon: '🤝',
  },
];

const cards = [
  {
    icon: '🚀',
    title: 'Building on the platform',
    note: 'You own a service and want to run it here. One interface, the Nomos Agent, onboards your team and requests everything the platform provides.',
    link: '/getting-started',
    linkText: 'Get started →',
  },
  {
    icon: '🛠️',
    title: 'Building the platform',
    note: 'You own a technical area. Find what each team owns, its interfaces, and the decisions behind them.',
    link: '/platform-grouping',
    linkText: 'See the teams →',
  },
  {
    icon: '🌐',
    title: 'Learning from the stack',
    note: 'These docs are the reference implementation: every page describes the live platform, open source end to end.',
    link: '/ecosystem',
    linkText: 'See the stack →',
  },
];

const whatYouGet = [
  {
    icon: '🏭',
    title: 'Continuous delivery enablement',
    note: 'GitHub teams and repositories, keyless GCP authentication, Artifact Registry, and reusable deployment workflows.',
  },
  {
    icon: '🏗️',
    title: 'Cloud foundation',
    note: 'CIS-compliant GCP projects across sandbox, non-production, and production, with KMS-encrypted state, shared networking, DNS, and Kubernetes namespaces.',
  },
  {
    icon: '🔒',
    title: 'Security',
    note: 'OpenBao secrets, Istio mTLS, OPA Gatekeeper admission control, Cloud Armor WAF, hardened GKE clusters, and Datadog security monitoring.',
  },
  {
    icon: '🐶',
    title: 'Observability and incident response',
    note: 'Platform-managed Datadog integrations provide cluster telemetry and can enable logs, APM, security features, and cloud-cost visibility where configured.',
  },
];

function WhatYouGet() {
  return (
    <section className={styles.whatYouGet}>
      <div className="container">
        <Heading as="h2" className={styles.whatYouGetHeading}>
          Everything your team needs, out of the box.
        </Heading>
        <p className={styles.whatYouGetSubtitle}>
          From source code management to production support — already in place.
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
  { src: '/img/agentgateway.svg', alt: 'agentgateway' },
  { src: '/img/authentik.svg', alt: 'Authentik' },
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
        <div className={styles.heroActions}>
          <Link to="/getting-started" className={styles.gettingStartedCta}>
            Get started →
          </Link>
          <Link to="/platform-grouping" className={styles.heroSecondaryCta}>
            Explore the teams
          </Link>
        </div>
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
            Start with one clear request
          </Heading>
          <p className={styles.gettingStartedBody}>
            The <strong>Nomos Agent</strong> turns team requirements into validated, reviewable pull requests. Use the prompt builder to provide the information needed by Logos and any downstream platform services.
          </p>
          <Link
            to="/onboarding"
            className={styles.gettingStartedCta}
          >
            Build your agent prompt →
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
        <Heading as="h2" className={styles.ctaHeading}>
          Platform docs, written for the people who use and build it.
        </Heading>
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
        <CallToAction />
        <GettingStarted />
        <Features />
        <WhatYouGet />
        <TechStrip />
      </main>
      <HomeFooter />
    </Layout>
  );
}
