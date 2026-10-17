import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export default function Leader({person}) {
  return (
    <div className={styles.leader}>
      <img
        className={styles.avatar}
        src={person.avatar}
        alt={person.name}
        width="96"
        height="96"
      />
      <div>
        <h3 className={styles.name}>{person.name}</h3>
        <p className={styles.role}>{person.role}</p>
        <p className={styles.bio}>{person.bio}</p>
        <div className={styles.links}>
          {person.links.map((link) => (
            <Link key={link.href} to={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
