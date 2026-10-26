import {Paper, SimpleGrid} from '@mantine/core';
import Link from '@docusaurus/Link';
import {IconArrowDown} from '@tabler/icons-react';
import CardIcon from '@site/src/components/CardIcon';
import '@mantine/core/styles/Paper.css';
import '@mantine/core/styles/SimpleGrid.css';
import styles from './styles.module.css';

const shared = [
  {name: 'Arche', icon: 'cube', description: 'Reusable infrastructure modules'},
  {name: 'Ekklesia', icon: 'book', description: 'Platform documentation'},
  {name: 'Techne', icon: 'tools', description: 'Workflows and tooling'},
];
const supplyChain = [
  {name: 'Logos', icon: 'buildingBank', description: 'Team structure and identity'},
  {name: 'Corpus', icon: 'world', description: 'Projects and cloud foundations'},
  {name: 'Pneuma', icon: 'wheel', description: 'Runtime and platform services'},
];

function Team({name, icon, description}) {
  return (
    <div className={styles.team}>
      <div className={styles.teamHeading}>
        <CardIcon name={icon} size={20} />
        <Link to={`/platform-grouping/${name.toLowerCase()}`}>{name}</Link>
      </div>
      <span className={styles.description}>{description}</span>
    </div>
  );
}

function Connector({children}) {
  return (
    <div className={styles.connector}>
      <IconArrowDown aria-hidden="true" size={18} />
      <span>{children}</span>
    </div>
  );
}

export default function TeamDependencies() {
  return (
    <section aria-label="Team dependencies" className={styles.view}>
      <Paper withBorder p="lg" radius="md" className={styles.layer}>
        <h4 className={styles.label}>Shared capabilities</h4>
        <SimpleGrid cols={{base: 1, sm: 3}} spacing="lg">
          {shared.map(team => <Team key={team.name} {...team} />)}
        </SimpleGrid>
      </Paper>
      <Connector>Support the deployment chain</Connector>
      <Paper withBorder p="lg" radius="md" className={styles.layer}>
        <h4 className={styles.label}>Deployment supply chain</h4>
        <ol aria-label="Deployment order" className={styles.chain}>
          {supplyChain.map(team => <li key={team.name}><Team {...team} /></li>)}
        </ol>
      </Paper>
      <Connector>Runtime and platform services, including secrets — from Pneuma</Connector>
      <Paper withBorder p="lg" radius="md" className={styles.layer}>
        <h4 className={styles.consumer}>All teams</h4>
        <p className={styles.description}>Consume the runtime and platform services.</p>
        <p className={styles.description}>Documentation and tooling also reach all teams directly from Ekklesia and Techne.</p>
      </Paper>
    </section>
  );
}
