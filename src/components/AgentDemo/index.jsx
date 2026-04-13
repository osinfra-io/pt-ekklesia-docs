import React from 'react';
import styles from './styles.module.css';

const defaultTitle = 'GitHub Copilot — Logos Agent';

const defaultMessages = [
  {
    role: 'user',
    text: '/agent osinfra-io/pt-logos',
  },
  {
    role: 'agent',
    content: (
      <>
        <p>👋 Hi! I'm the Logos Agent. I help manage everything on the osinfra.io platform — teams, members, repositories, environments, and more.</p>
        <p>Give me just a moment while I look you up…</p>
        <p className={styles.meta}>✓ Identity validated · @velocity-lead · velocity-lead@osinfra.io</p>
        <p>It looks like you're not part of any team yet — welcome! Would you like to <strong>join an existing team</strong> or <strong>onboard a new team</strong> from scratch?</p>
      </>
    ),
  },
  {
    role: 'user',
    text: 'Onboard a new team — st-velocity',
  },
  {
    role: 'agent',
    content: (
      <>
        <p>Based on your team key I'd suggest <strong>Velocity</strong> as the display name — it appears in Google Cloud Platform, GitHub, and Datadog. Does that work?</p>
        <p className={styles.meta}>✓ Stream-aligned team detected (st- prefix)</p>
        <p>What email address should be the Datadog team admin?</p>
      </>
    ),
  },
  {
    role: 'user',
    text: 'velocity-admin@osinfra.io — and use my GitHub username as the team maintainer.',
  },
  {
    role: 'agent',
    content: (
      <>
        <p>Here's what I'll create:</p>
        <ul>
          <li>📁 GCP folder hierarchy — <code>st-velocity</code> (sandbox / non-production / production)</li>
          <li>👥 Google Identity groups — admin, reader, writer</li>
          <li>🐙 GitHub parent team + 4 child teams (sandbox-approvers, non-production-approvers, production-approvers, repository-administrators)</li>
          <li>🐶 Datadog team — <strong>Velocity</strong></li>
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
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.titleLabel}>{title}</span>
      </div>
      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? styles.userRow : styles.agentRow}>
            {msg.role === 'agent' && <span className={styles.avatar}>🤖</span>}
            <div className={msg.role === 'user' ? styles.userBubble : styles.agentBubble}>
              {msg.role === 'user' ? msg.text : msg.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
