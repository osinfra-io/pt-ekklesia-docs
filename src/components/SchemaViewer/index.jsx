import { useState } from 'react';

import styles from './styles.module.css';

const TYPE_CLASS = {
  string: styles.typeString,
  boolean: styles.typeBoolean,
  number: styles.typeNumber,
  'string[]': styles.typeArray,
  'number[]': styles.typeArray,
  object: styles.typeObject,
  map: styles.typeMap,
};

function SchemaProperty({ name, prop, depth = 0 }) {
  const hasChildren = prop.properties && Object.keys(prop.properties).length > 0;
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
          <span className={prop.required ? styles.required : styles.optional}>
            {prop.required ? 'required' : 'optional'}
          </span>
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
          {Object.entries(prop.properties).map(([k, v]) => (
            <SchemaProperty key={k} name={k} prop={v} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SchemaViewer({ schema, title }) {
  return (
    <div className={styles.viewer}>
      {title && <div className={styles.title}>{title}</div>}
      {Object.entries(schema).map(([name, prop]) => (
        <SchemaProperty key={name} name={name} prop={prop} depth={0} />
      ))}
    </div>
  );
}
