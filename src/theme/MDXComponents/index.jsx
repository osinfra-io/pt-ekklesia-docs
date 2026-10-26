import MDXComponents from '@theme-original/MDXComponents';
import {Table} from '@mantine/core';
import '@mantine/core/styles/Table.css';
import styles from './styles.module.css';

function DocumentationTable(props) {
  return (
    <Table.ScrollContainer type="native">
      <Table
        horizontalSpacing="1rem"
        verticalSpacing="0.75rem"
        className={styles.table}
        {...props}
      />
    </Table.ScrollContainer>
  );
}

export default {
  ...MDXComponents,
  table: DocumentationTable,
  thead: Table.Thead,
  tbody: Table.Tbody,
  tfoot: Table.Tfoot,
  tr: Table.Tr,
  th: Table.Th,
  td: Table.Td,
  caption: Table.Caption,
};
