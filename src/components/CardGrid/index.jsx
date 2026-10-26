import React from 'react';
import {SimpleGrid} from '@mantine/core';
import '@mantine/core/styles/SimpleGrid.css';
import styles from './styles.module.css';

export default function CardGrid({children}) {
  return (
    <SimpleGrid
      className={styles.grid}
      cols={{base: 1, sm: 2, md: 3}}
      spacing="1.5rem"
      my="2rem"
    >
      {children}
    </SimpleGrid>
  );
}
