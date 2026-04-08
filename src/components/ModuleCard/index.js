import React from 'react';
import styles from './styles.module.css';

export default function ModuleCard({ image, title, description, href }) {
  return (
    <a href={href} className={styles.card} target="_blank" rel="noopener noreferrer">
      <div className={styles.imageWrapper}>
        <img src={image} alt={title} className={styles.image} />
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </a>
  );
}
