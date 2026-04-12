import React from 'react';
import styles from './styles.module.css';

export default function NetworkCard({ cluster, logo, primary, pods, services, master }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        {logo && <img src={logo} alt="" className={styles.logo} />}
        <h3 className={styles.title}>{cluster}</h3>
      </div>
      <dl className={styles.fields}>
        <div className={styles.field}>
          <dt className={styles.label}>Primary</dt>
          <dd className={styles.value}><code>{primary}</code></dd>
        </div>
        <div className={styles.field}>
          <dt className={styles.label}>Pods</dt>
          <dd className={styles.value}><code>{pods}</code></dd>
        </div>
        <div className={styles.field}>
          <dt className={styles.label}>Services</dt>
          <dd className={styles.value}><code>{services}</code></dd>
        </div>
        <div className={styles.field}>
          <dt className={styles.label}>Master</dt>
          <dd className={styles.value}><code>{master}</code></dd>
        </div>
      </dl>
    </div>
  );
}
