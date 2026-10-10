import React from 'react';
import styles from './styles.module.css';

const defaultTitle = 'GitHub Copilot — Nomos Agent';

const defaultMessages = [
  {
    role: 'user',
    text: 'Onboard a new team — Fides. Team key: st-fides. Maintainers: joesmith. Admin email: joe@osinfra.io.',
  },
  {
    role: 'agent',
    content: (
      <>
        <p>👋 Hi! I'm the Nomos Agent — your self-serve interface to the osinfra.io platform. Give me just a moment while I look you up…</p>
        <p className={styles.meta}>✓ get_me → joesmith · joe@osinfra.io · osinfra-io member</p>
        <p className={styles.meta}>✓ lookup_user → no existing team memberships</p>
        <p>Team key <code>st-fides</code> is a stream-aligned team. Suggested display name: <strong>Fides</strong>. Confirm, and share a one or two sentence team description — or I can suggest one.</p>
      </>
    ),
  },
  {
    role: 'user',
    text: 'Fides is right. Suggest a description.',
  },
  {
    role: 'agent',
    content: (
      <>
        <p>Suggested description: <em>"Fides — the platform's trust and verification service."</em> Keep it or rewrite it?</p>
      </>
    ),
  },
  {
    role: 'user',
    text: 'Keep it.',
  },
  {
    role: 'agent',
    content: (
      <>
        <p>Next, Datadog: should I use <code>joe@osinfra.io</code> as the admin? Then I'll collect GitHub maintainers and Google Cloud groups, one group at a time.</p>
        <p className={styles.meta}>… required fields, then an optional menu: GitHub Actions + GCP OIDC, repositories, GKE, Cloud SQL, projects</p>
      </>
    ),
  },
  {
    role: 'user',
    text: 'Yes. Enable workflows and add repo st-fides-api.',
  },
  {
    role: 'agent',
    content: (
      <>
        <p className={styles.meta}>✓ open_team_pr → PR opened on pt-logos</p>
        <p className={styles.meta}>✓ open_team_docs_pr → PR opened on pt-ekklesia-docs</p>
        <p>Done. Once the <code>pt-logos</code> PR merges, your team structure and access foundations are created. Cloud and Kubernetes capabilities follow through Corpus and Pneuma.</p>
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
