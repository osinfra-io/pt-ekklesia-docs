import {useState} from 'react';
import {Accordion, Badge, Button, Code, Group, TextInput} from '@mantine/core';
import '@mantine/core/styles/UnstyledButton.css';
import '@mantine/core/styles/Accordion.css';
import '@mantine/core/styles/Badge.css';
import '@mantine/core/styles/Button.css';
import '@mantine/core/styles/Code.css';
import '@mantine/core/styles/Group.css';
import '@mantine/core/styles/Input.css';
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

function getChildren(prop) {
  const mapProps = prop.type === 'map' ? prop.valueSchema?.properties : null;
  const namedEntries = prop.type === 'map' && prop.properties;
  const children = namedEntries
    ? {...namedEntries, '‹other key›': {...prop.valueSchema, required: false}}
    : mapProps ?? prop.properties;
  return children && Object.keys(children).length > 0 ? children : null;
}

function matchesSearch(name, prop, query) {
  if (!query) return true;
  const fields = [
    name,
    prop.type,
    prop.description,
    prop.default === undefined ? '' : JSON.stringify(prop.default),
    prop.pattern,
    prop.enum?.join(' '),
    prop.itemConstraints?.description,
    prop.itemConstraints?.pattern,
  ];
  if (fields.some(value => value?.toLowerCase().includes(query))) return true;
  return Object.entries(getChildren(prop) ?? {})
    .some(([childName, child]) => matchesSearch(childName, child, query));
}

function PropertyDetails({prop}) {
  const constraints = [];
  if (prop.minItems !== undefined) constraints.push(['Minimum items', prop.minItems]);
  if (prop.maxItems !== undefined) constraints.push(['Maximum items', prop.maxItems]);
  if (prop.minLength !== undefined) constraints.push(['Minimum length', prop.minLength]);
  if (prop.maxLength !== undefined) constraints.push(['Maximum length', prop.maxLength]);
  if (prop.minimum !== undefined) constraints.push(['Minimum value', prop.minimum]);
  if (prop.maximum !== undefined) constraints.push(['Maximum value', prop.maximum]);
  if (prop.uniqueItems) constraints.push(['Items must be unique', 'Yes']);
  if (prop.pattern) constraints.push(['Pattern', prop.pattern]);

  return (
    <div className={styles.details}>
      {prop.description && <p className={styles.description}>{prop.description}</p>}
      {prop.default !== undefined && (
        <p className={styles.description}>
          Default: <Code>{JSON.stringify(prop.default)}</Code>
        </p>
      )}
      {constraints.map(([label, value]) => (
        <p key={label} className={styles.description}>
          {label}: {label === 'Pattern' ? <Code>{value}</Code> : value}
        </p>
      ))}
      {prop.itemConstraints && Object.keys(prop.itemConstraints).length > 0 && (
        <p className={styles.description}>
          Each item
          {prop.itemConstraints.description && `: ${prop.itemConstraints.description}`}
          {prop.itemConstraints.pattern && <>; pattern: <Code>{prop.itemConstraints.pattern}</Code></>}
          {prop.itemConstraints.minLength !== undefined && `; minimum length: ${prop.itemConstraints.minLength}`}
          {prop.itemConstraints.maxLength !== undefined && `; maximum length: ${prop.itemConstraints.maxLength}`}
        </p>
      )}
      {prop.requiredWhen?.map(condition => (
        <p key={condition} className={styles.description}>Required when {condition}.</p>
      ))}
      {prop.conditionalRequirements?.map(({condition, keys}) => (
        <p key={condition} className={styles.description}>When {condition}, required keys: {keys.join(', ')}.</p>
      ))}
      {prop.enum && (
        <Group gap="xs" mt="xs">
          {prop.enum.map(value => <Code key={value}>&quot;{value}&quot;</Code>)}
        </Group>
      )}
    </div>
  );
}

function SchemaProperty({name, prop, path, query, expandedPaths, setExpandedPaths}) {
  const children = getChildren(prop);
  const hasChildren = children !== null;
  const expandedForSearch = Boolean(query && Object.entries(children ?? {})
    .some(([childName, child]) => matchesSearch(childName, child, query)));
  const isExpanded = expandedPaths.has(path) || expandedForSearch;
  const summary = (
    <span className={styles.meta}>
      <Code className={styles.name}>{name}</Code>
      <Badge className={styles.type} component="span" color={typeColors[prop.type] ?? 'gray'} variant="light" size="xs">{prop.type}</Badge>
      {prop.type === 'map' && !prop.properties && (
        <span className={styles.mapKey} title="Fields apply to each named entry">‹key›</span>
      )}
      <span className={prop.required || prop.requiredWhen ? styles.required : styles.optional}>
        {prop.required ? 'required' : prop.requiredWhen ? 'conditionally required' : 'optional'}
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
      value={isExpanded ? [path] : []}
      onChange={value => {
        setExpandedPaths(current => {
          const next = new Set(current);
          if (value.includes(path)) next.add(path);
          else next.delete(path);
          return next;
        });
      }}
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
      <Accordion.Item value={path}>
        <Accordion.Control>{summary}</Accordion.Control>
        <PropertyDetails prop={prop} />
        <Accordion.Panel>
          <div className={styles.children}>
            {Object.entries(children)
              .filter(([childName, child]) => matchesSearch(childName, child, query))
              .map(([childName, child]) => (
                <SchemaProperty
                  key={`${path}.${childName}`}
                  name={childName}
                  prop={child}
                  path={`${path}.${childName}`}
                  query={query}
                  expandedPaths={expandedPaths}
                  setExpandedPaths={setExpandedPaths}
                />
              ))}
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

function collectExpandablePaths(properties, query, parentPath = '') {
  return Object.entries(properties).flatMap(([name, prop]) => {
    if (!matchesSearch(name, prop, query)) return [];
    const path = parentPath ? `${parentPath}.${name}` : name;
    const children = getChildren(prop);
    if (!children) return [];
    return [path, ...collectExpandablePaths(children, query, path)];
  });
}

function SchemaViewerInner({title}) {
  const {showOptional} = useOnboardingFilter();
  const [search, setSearch] = useState('');
  const [expandedPaths, setExpandedPaths] = useState(new Set());
  const query = search.trim().toLowerCase();
  const properties = Object.fromEntries(
    Object.entries(resolved)
      .filter(([, prop]) => prop.required || showOptional)
      .filter(([name, prop]) => matchesSearch(name, prop, query)),
  );
  const expandablePaths = collectExpandablePaths(properties, query);

  return (
    <>
      <FilterBar requiredCount={REQUIRED_COUNT} optionalCount={OPTIONAL_COUNT} />
      <div className={styles.viewer}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.toolbar}>
          <TextInput
            aria-label="Search schema fields"
            className={styles.search}
            onChange={event => setSearch(event.currentTarget.value)}
            placeholder="Search fields and descriptions"
            value={search}
          />
          <Group gap="xs">
            <Button
              variant="subtle"
              size="compact-xs"
              onClick={() => setExpandedPaths(new Set(expandablePaths))}
            >
              Expand all
            </Button>
            <Button
              variant="subtle"
              size="compact-xs"
              onClick={() => setExpandedPaths(new Set())}
            >
              Collapse all
            </Button>
          </Group>
        </div>
        {Object.keys(properties).length > 0 ? Object.entries(properties).map(([name, prop]) => (
          <SchemaProperty
            key={name}
            name={name}
            prop={prop}
            path={name}
            query={query}
            expandedPaths={expandedPaths}
            setExpandedPaths={setExpandedPaths}
          />
        )) : <p className={styles.empty}>No schema fields match “{search}”.</p>}
      </div>
    </>
  );
}

export default function SchemaViewer({title}) {
  return <OnboardingFilterProvider><SchemaViewerInner title={title} /></OnboardingFilterProvider>;
}
