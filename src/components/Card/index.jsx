import React from 'react';
import {Card as MantineCard, Group, ThemeIcon} from '@mantine/core';
import Link from '@docusaurus/Link';
import '@mantine/core/styles/Paper.css';
import '@mantine/core/styles/Card.css';
import '@mantine/core/styles/Group.css';
import '@mantine/core/styles/ThemeIcon.css';
import styles from './styles.module.css';

export default function Card({item}) {
  return (
    <MantineCard className={styles.card}>
      <Group gap="0.75rem" mb="0.75rem" wrap="nowrap">
        {item.icon && (
          <ThemeIcon
            aria-hidden="true"
            className={styles.icon}
            radius="md"
            size={40}
            variant="transparent"
          >
            {item.icon}
          </ThemeIcon>
        )}
        <h3 className={styles.title}>{item.title}</h3>
      </Group>
      {item.note && <p className={styles.note}>{item.note}</p>}
      {item.link && (
        <Link to={item.link} className={styles.link}>
          {item.linkText || 'Learn more →'}
        </Link>
      )}
    </MantineCard>
  );
}
