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
        <p>👋 Hi! I'm the Nomos Agent — onboarding a new team for you now.</p>
        <p>Give me just a moment while I look you up…</p>
        <p className={styles.meta}>✓ get_me → joesmith · joe@osinfra.io · osinfra-io member</p>
        <p className={styles.meta}>✓ lookup_user → no existing team memberships found</p>
        <p>Welcome! I have everything I need from your prompt. Here's what I'll create for <strong>st-fides</strong>:</p>
        <ul>
          <li>📁 GCP folder — <code>Fides</code> with Sandbox / Non-Production / Production sub-folders</li>
          <li>👥 Google Identity groups — admin, reader, writer per environment</li>
          <li>🐙 GitHub parent team <code>st-fides</code> + 4 standard child teams</li>
          <li>🐶 Datadog team — <strong>Fides</strong>, admin: joe@osinfra.io</li>
        </ul>
        <p>Any optional features to enable — Google Cloud project, OpenTofu state management, or additional GitHub repositories?</p>
      </>
    ),
  },
  {
    role: 'user',
    text: 'Enable google project and workflows. Add repo st-fides-api.',
  },
  {
    role: 'agent',
    content: (
      <>
        <p className={styles.meta}>✓ open_team_pr → PR #142 opened on pt-logos</p>
        <p>Done — <a href="#">PR #142</a> is open on <code>pt-logos</code>. Once it merges, your GCP folder, identity groups, GitHub teams, and Datadog team will be created automatically.</p>
        <p>Corpus and Pneuma deploy on their own schedules — your Google Cloud project and CI/CD service accounts will provision after the Corpus PR merges.</p>
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
