import React from 'react';
import styles from './styles.module.css';

const defaultTitle = 'GitHub Copilot — Logos Agent';

const defaultMessages = [
  {
    role: 'user',
    text: '/agent → Logos Agent',
  },
  {
    role: 'agent',
    content: (
      <>
        <p>👋 Hi! I'm the Logos Agent. I help manage everything on the osinfra.io platform — teams, members, repositories, environments, and more.</p>
        <p>Give me just a moment while I look you up…</p>
        <p className={styles.meta}>✓ Identity validated · joe@osinfra.io</p>
        <p>It looks like you're not part of any team yet — welcome! Would you like to <strong>join an existing team</strong> or <strong>onboard a new team</strong> from scratch?</p>
      </>
    ),
  },
  {
    role: 'user',
    text: 'Onboard a new team — st-fides',
  },
  {
    role: 'agent',
    content: (
      <>
        <p>Based on your team key I'd suggest <strong>Fides</strong> as the display name — it appears in Google Cloud Platform, GitHub, and Datadog. Does that work?</p>
        <p className={styles.meta}>✓ Stream-aligned team detected (st- prefix)</p>
        <p>What email address should be the Datadog team admin?</p>
      </>
    ),
  },
  {
    role: 'user',
    text: 'joe@osinfra.io — and use my GitHub username as the team maintainer.',
  },
  {
    role: 'agent',
    content: (
      <>
        <p>Here's what I'll create:</p>
        <ul>
          <li>📁 GCP folder hierarchy — <code>Fides</code> (Sandbox / Non-Production / Production)</li>
          <li>👥 Google Identity groups — admin, reader, writer</li>
          <li>🐙 GitHub parent team + 4 child teams (sandbox-approvers, non-production-approvers, production-approvers, repository-administrators)</li>
          <li>🐶 Datadog team — <strong>Fides</strong></li>
        </ul>
        <p>Ready to open the pull request on <code>pt-logos</code>?</p>
      </>
    ),
  },
];

export default function AgentDemo({ messages = defaultMessages, title = defaultTitle }) {
  return (
    <div className={styles.window}>
      <div className={styles.titleBar}>
        <div className={styles.windowButtons}>
          <span className={styles.btn} aria-hidden="true">✕</span>
        </div>
      </div>
      <div className={styles.messages}>
        {messages.map((msg, i) => (
          msg.role === 'user' ? (
            <div key={i} className={styles.userRow}>
              <span className={styles.prompt} aria-hidden="true">❯</span>
              <span className={styles.userText}>{msg.text}</span>
            </div>
          ) : (
            <div key={i} className={styles.agentRow}>
              <span className={styles.avatar} aria-hidden="true">🤖</span>
              <div className={styles.agentOutput}>{msg.content}</div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
