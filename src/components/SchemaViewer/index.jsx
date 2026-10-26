import {Accordion, Badge, Code, Group} from '@mantine/core';
import '@mantine/core/styles/UnstyledButton.css';
import '@mantine/core/styles/Accordion.css';
import '@mantine/core/styles/Badge.css';
import '@mantine/core/styles/Code.css';
import '@mantine/core/styles/Group.css';
import {useOnboardingFilter, FilterBar, OnboardingFilterProvider} from '@site/src/components/OnboardingFilter';
import teamSchema from './team.schema.json';
import resolveSchema from './resolveSchema';
import styles from './styles.module.css';

const resolved = resolveSchema(teamSchema);
const REQUIRED_COUNT = Object.values(resolved).filter(prop => prop.required).length;
const OPTIONAL_COUNT = Object.values(resolved).filter(prop => !prop.required).length;
const typeColors = {
  string: 'blue', boolean: 'violet', number: 'orange',
  'string[]': 'teal', 'number[]': 'teal', object: 'gold', map: 'cyan',
};

function PropertyDetails({prop}) {
  return (
    <div className={styles.details}>
      {prop.description && <p className={styles.description}>{prop.description}</p>}
      {prop.enum && (
        <Group gap="xs" mt="xs">
          {prop.enum.map(value => <Code key={value}>&quot;{value}&quot;</Code>)}
        </Group>
      )}
    </div>
  );
}

function SchemaProperty({name, prop}) {
  // A map expands straight to its entry fields, not a second object wrapper.
  const mapProps = prop.type === 'map' ? prop.valueSchema?.properties : null;
  const children = mapProps ?? prop.properties;
  const hasChildren = children && Object.keys(children).length > 0;
  const summary = (
    <span className={styles.meta}>
      <Code className={styles.name}>{name}</Code>
      <Badge component="span" color={typeColors[prop.type] ?? 'gray'} variant="light" size="sm">{prop.type}</Badge>
      {mapProps && <Badge component="span" color="cyan" variant="outline" size="sm">‹key›</Badge>}
      <Badge component="span" color={prop.required ? 'green' : 'gray'} variant="outline" size="sm">
        {prop.required ? 'required' : 'optional'}
      </Badge>
    </span>
  );

  if (!hasChildren) {
    return (
      <div className={styles.leaf}>
        {summary}
        <PropertyDetails prop={prop} />
      </div>
    );
  }

  return (
    <Accordion multiple variant="default" classNames={{label: styles.controlLabel, content: styles.content}}>
      <Accordion.Item value={name}>
        <Accordion.Control>{summary}</Accordion.Control>
        <PropertyDetails prop={prop} />
        <Accordion.Panel>
          <div className={styles.children}>
            {Object.entries(children).map(([key, child]) => (
              <SchemaProperty key={key} name={key} prop={child} />
            ))}
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

function SchemaViewerInner({title}) {
  const {showOptional} = useOnboardingFilter();
  return (
    <>
      <FilterBar requiredCount={REQUIRED_COUNT} optionalCount={OPTIONAL_COUNT} />
      <div className={styles.viewer}>
        {title && <div className={styles.title}>{title}</div>}
        {Object.entries(resolved)
          .filter(([, prop]) => prop.required || showOptional)
          .map(([name, prop]) => <SchemaProperty key={name} name={name} prop={prop} />)}
      </div>
    </>
  );
}

export default function SchemaViewer({title}) {
  return <OnboardingFilterProvider><SchemaViewerInner title={title} /></OnboardingFilterProvider>;
}
