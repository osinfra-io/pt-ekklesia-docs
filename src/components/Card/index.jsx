import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export default function Card({item}) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        {item.icon && <span className={styles.icon}>{item.icon}</span>}
        <h3 className={styles.title}>{item.title}</h3>
      </div>
      {item.note && <p className={styles.note}>{item.note}</p>}
      {item.link && (
        <Link to={item.link} className={styles.link}>
          {item.linkText || 'Learn more →'}
        </Link>
      )}
    </div>
  );
}
