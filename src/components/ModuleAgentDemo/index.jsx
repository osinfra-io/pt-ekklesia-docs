import React from 'react';
import AgentDemo from '@site/src/components/AgentDemo';
import styles from '@site/src/components/AgentDemo/styles.module.css';

const messages = [
  {
    role: 'user',
    text: 'Use the Arche Module Agent in osinfra-io/pt-arche-child-module-template to create a new module.',
  },
  {
    role: 'agent',
    content: (
      <>
        <p>👋 Hi! I'm the Arche Module Agent. I create new <code>pt-arche-*</code> modules — scaffolding files, registering the repo in pt-logos, and pinning the latest core-helpers SHA.</p>
        <p className={styles.meta}>✓ Identity validated · @platform-eng · platform-eng@osinfra.io</p>
        <p>What GCP or Kubernetes resource will this module manage?</p>
      </>
    ),
  },
  {
    role: 'user',
    text: 'A Google Cloud Run service.',
  },
  {
    role: 'agent',
    content: (
      <>
        <p>I'd suggest <strong>pt-arche-google-cloud-run</strong> for the repository name.</p>
        <p className={styles.meta}>✓ Pattern: pt-arche-google-{'{resource}'}</p>
        <p>Suggested description: <em>"Manages Cloud Run service deployments on Google Cloud Platform."</em> — does that work, or would you like to adjust it?</p>
        <p>Will this module need a <code>regional/</code> subdirectory structure?</p>
      </>
    ),
  },
  {
    role: 'user',
    text: 'Description looks good. No sub-modules needed.',
  },
  {
    role: 'agent',
    content: (
      <>
        <p>Here are the feature flags with recommended defaults:</p>
        <ul>
          <li><code>enable_datadog_webhook</code> — <strong>true</strong> (sends repo events to Datadog)</li>
          <li><code>enable_datadog_secrets</code> — <strong>false</strong></li>
          <li><code>enable_google_wif_service_account</code> — <strong>false</strong></li>
        </ul>
        <p>Here's what I'll do:</p>
        <ul>
          <li>📝 Open a PR on <code>pt-logos</code> to register <code>pt-arche-google-cloud-run</code></li>
          <li>📦 Once you confirm the repo exists, push the full scaffold in one commit — <code>helpers.tofu</code>, <code>main.tofu</code>, <code>variables.tofu</code>, <code>outputs.tofu</code>, <code>locals.tofu</code>, <code>providers.tofu</code>, <code>tests/</code>, <code>.github/</code>, and more</li>
        </ul>
        <p>Ready to open the pull request on <code>pt-logos</code>?</p>
      </>
    ),
  },
];

export default function ModuleAgentDemo() {
  return <AgentDemo messages={messages} title="GitHub Copilot — Arche Module Agent" />;
}
