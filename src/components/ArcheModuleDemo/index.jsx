import React from 'react';
import AgentDemo from '@site/src/components/AgentDemo';
import styles from '@site/src/components/AgentDemo/styles.module.css';

const messages = [
  {
    role: 'user',
    text: '/agent → Arche Module Agent',
  },
  {
    role: 'agent',
    content: (
      <>
        <p>👋 Hi! I'm the Arche Module Agent. I help create new <code>pt-arche-*</code> OpenTofu child module repositories — I'll scaffold all the files, wire up the GitHub Actions workflows, and open a PR on <code>pt-logos</code> to register the new repo.</p>
        <p>Give me just a moment while I look you up…</p>
        <p className={styles.meta}>✓ Identity validated · @arche-dev · arche-dev@osinfra.io</p>
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
        <p className={styles.meta}>✓ No naming conflicts found in pt-logos or GitHub</p>
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
        <p className={styles.meta}>helpers.tofu pre-pinned to current pt-arche-core-helpers SHA</p>
        <p>Shall I open the PR?</p>
      </>
    ),
  },
];

export default function ArcheModuleDemo() {
  return <AgentDemo messages={messages} title="GitHub Copilot — Arche Module Agent" />;
}
