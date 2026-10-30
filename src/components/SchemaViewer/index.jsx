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
      {prop.minItems !== undefined && (
        <p className={styles.description}>Minimum items: {prop.minItems}</p>
      )}
      {prop.enum && (
        <Group gap="xs" mt="xs">
          {prop.enum.map(value => <Code key={value}>&quot;{value}&quot;</Code>)}
        </Group>
      )}
    </div>
  );
}

function SchemaProperty({name, prop}) {
  const mapProps = prop.type === 'map' ? prop.valueSchema?.properties : null;
  const namedEntries = prop.type === 'map' && prop.properties;
  const children = namedEntries
    ? {...namedEntries, '‹other key›': {...prop.valueSchema, required: false}}
    : mapProps ?? prop.properties;
  const hasChildren = children && Object.keys(children).length > 0;
  const summary = (
    <span className={styles.meta}>
      <Code className={styles.name}>{name}</Code>
      <Badge className={styles.type} component="span" color={typeColors[prop.type] ?? 'gray'} variant="light" size="xs">{prop.type}</Badge>
      {mapProps && !namedEntries && <span className={styles.mapKey} title="Fields apply to each named entry">‹key›</span>}
      <span className={prop.required ? styles.required : styles.optional}>
        {prop.required ? 'required' : 'optional'}
      </span>
    </span>
  );

  if (!hasChildren) {
    return (
      <div className={`${styles.property} ${styles.leaf}`}>
        {summary}
        <PropertyDetails prop={prop} />
      </div>
    );
  }

  return (
    <Accordion
      className={styles.property}
      multiple
      variant="default"
      chevronPosition="left"
      chevronSize={14}
      classNames={{
        control: styles.control,
        chevron: styles.chevron,
        label: styles.controlLabel,
        content: styles.content,
      }}
    >
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
