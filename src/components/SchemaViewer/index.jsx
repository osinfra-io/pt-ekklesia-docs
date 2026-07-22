import { useState } from 'react';

import { useOnboardingFilter, FilterBar, OnboardingFilterProvider } from '@site/src/components/OnboardingFilter';
import teamSchema from './team.schema.json';
import resolveSchema from './resolveSchema';
import styles from './styles.module.css';

const resolved = resolveSchema(teamSchema);

const REQUIRED_COUNT = Object.values(resolved).filter((p) => p.required).length;
const OPTIONAL_COUNT = Object.values(resolved).filter((p) => !p.required).length;

const TYPE_CLASS = {
  string: styles.typeString,
  boolean: styles.typeBoolean,
  number: styles.typeNumber,
  'string[]': styles.typeArray,
  'number[]': styles.typeArray,
  object: styles.typeObject,
  map: styles.typeMap,
};

function SchemaProperty({ name, prop, depth = 0, isMapKey = false }) {
  // Map types (additionalProperties) carry their entry structure on valueSchema
  // rather than properties, so surface it as a synthetic "«key»" child.
  const mapEntry = prop.type === 'map' ? prop.valueSchema : null;
  const childProps = prop.properties && Object.keys(prop.properties).length > 0 ? prop.properties : null;
  const hasChildren = Boolean(childProps) || Boolean(mapEntry);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.property}>
      <div
        className={`${styles.header} ${hasChildren ? styles.expandable : ''}`}
        style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}
        role={hasChildren ? 'button' : undefined}
        tabIndex={hasChildren ? 0 : undefined}
        aria-expanded={hasChildren ? expanded : undefined}
        onClick={hasChildren ? () => setExpanded((v) => !v) : undefined}
        onKeyDown={hasChildren ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        } : undefined}
      >
        <div className={styles.meta}>
          <span className={styles.chevron}>
            {hasChildren ? (expanded ? '▾' : '▸') : ' '}
          </span>
          <code className={styles.name}>{name}</code>
          <span className={`${styles.typeBadge} ${TYPE_CLASS[prop.type] ?? styles.typeObject}`}>
            {prop.type}
          </span>
          {!isMapKey && (
            <span className={prop.required ? styles.required : styles.optional}>
              {prop.required ? 'required' : 'optional'}
            </span>
          )}
        </div>

        {prop.description && (
          <p className={styles.description}>{prop.description}</p>
        )}

        {prop.enum && (
          <div className={styles.enums}>
            {prop.enum.map((v) => (
              <code key={v} className={styles.enumVal}>
                &quot;{v}&quot;
              </code>
            ))}
          </div>
        )}
      </div>

      {hasChildren && expanded && (
        <div className={styles.children}>
          {childProps
            ? Object.entries(childProps).map(([k, v]) => (
                <SchemaProperty key={k} name={k} prop={v} depth={depth + 1} />
              ))
            : (
                <SchemaProperty name="«key»" prop={mapEntry} depth={depth + 1} isMapKey />
              )}
        </div>
      )}
    </div>
  );
}

function SchemaViewerInner({ title }) {
  const { showOptional } = useOnboardingFilter();
  const entries = Object.entries(resolved).filter(([, prop]) => prop.required || showOptional);

  return (
    <>
      <FilterBar requiredCount={REQUIRED_COUNT} optionalCount={OPTIONAL_COUNT} />
      <div className={styles.viewer}>
        {title && <div className={styles.title}>{title}</div>}
        {entries.map(([name, prop]) => (
          <SchemaProperty key={name} name={name} prop={prop} depth={0} />
        ))}
      </div>
    </>
  );
}

export default function SchemaViewer({ title }) {
  return (
    <OnboardingFilterProvider>
      <SchemaViewerInner title={title} />
    </OnboardingFilterProvider>
  );
}
