import { useState } from 'react';
import {
  createInitialConfig,
  isEmptyDraft,
  removeMapEntry,
  removeValueAtPath,
  resolveSchemaNode,
  setMapEntry,
  setValueAtPath,
} from './schemaSupport.mjs';
import styles from './styles.module.css';

function toPointer(path) {
  return `/${path.map(part => String(part).replaceAll('~', '~0').replaceAll('/', '~1')).join('/')}`;
}

function toId(path) {
  return `schema-${path.map(part => String(part).replace(/[^a-zA-Z0-9_-]/g, '-')).join('-')}`;
}

function fieldLabel(name) {
  return name.replaceAll('_', ' ').replace(/^./, value => value.toUpperCase());
}

function ErrorMessage({ errors, path }) {
  const error = errors.find(item => item.path === toPointer(path));
  return error ? <p className={styles.fieldError}>{error.message}</p> : null;
}

function FieldTitle({ name, required }) {
  return (
    <span className={styles.schemaTitle}>
      {fieldLabel(name)}
      <span className={required ? styles.required : styles.optional}>
        {required ? 'required' : 'optional'}
      </span>
    </span>
  );
}

function Description({ node }) {
  return node.description
    ? <p className={styles.hint}>{node.description}</p>
    : null;
}

function UnsetButton({ required, value, onUnset }) {
  if (required || value === undefined) return null;
  return (
    <button type="button" className={styles.schemaUnset} onClick={onUnset}>
      Unset
    </button>
  );
}

function createInitialValue(schema, node) {
  return createInitialConfig({
    $defs: schema.$defs,
    properties: { value: node },
    required: ['value'],
  }).value;
}

function PrimitiveInput({ node, value, id, error, onChange }) {
  if (node.enum) {
    return (
      <select
        id={id}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        value={value ?? ''}
        onChange={event => onChange(event.target.value || undefined)}
      >
        <option value="">— select —</option>
        {node.enum.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    );
  }

  if (node.type === 'boolean') {
    return (
      <select
        id={id}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        value={value === undefined ? '' : String(value)}
        onChange={event => onChange(event.target.value === '' ? undefined : event.target.value === 'true')}
      >
        <option value="">Not set</option>
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    );
  }

  if (node.type === 'integer' || node.type === 'number') {
    return (
      <input
        id={id}
        type="number"
        step={node.type === 'integer' ? 1 : 'any'}
        min={node.minimum}
        max={node.maximum}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        value={value ?? ''}
        onChange={event => onChange(event.target.value === '' ? undefined : Number(event.target.value))}
      />
    );
  }

  return (
    <input
      id={id}
      type={node.format === 'email' ? 'email' : 'text'}
      className={`${styles.input} ${error ? styles.inputError : ''}`}
      value={value ?? ''}
      onChange={event => onChange(event.target.value)}
    />
  );
}

function SchemaField({
  schema,
  name,
  rawNode,
  value,
  config,
  path,
  required,
  showOptional,
  errors,
  onChange,
}) {
  const [mapKey, setMapKey] = useState('');
  const [arrayValue, setArrayValue] = useState('');
  const node = resolveSchemaNode(schema, rawNode);
  const id = toId(path);
  const pathError = errors.find(error => error.path === toPointer(path));
  const update = nextValue => onChange(setValueAtPath(config, path, nextValue));
  const unset = () => onChange(removeValueAtPath(config, path));

  if (!required && !showOptional) return null;

  if (node.type === 'object' && node.additionalProperties) {
    const entries = Object.entries(value ?? {});
    const entrySchema = typeof node.additionalProperties === 'object'
      ? node.additionalProperties
      : { type: 'string' };

    return (
      <fieldset className={styles.schemaFieldset}>
        <legend><FieldTitle name={name} required={required} /></legend>
        <Description node={node} />
        <ErrorMessage errors={errors} path={path} />
        {entries.map(([key, entry]) => (
          <div className={styles.schemaMapEntry} key={key}>
            <SchemaField
              schema={schema}
              name={key}
              rawNode={entrySchema}
              value={entry}
              config={config}
              path={[...path, key]}
              required={false}
              showOptional={showOptional}
              errors={errors}
              onChange={onChange}
            />
            <button
              type="button"
              className={styles.schemaUnset}
              onClick={() => onChange(removeMapEntry(config, path, key))}
            >
              Remove entry
            </button>
          </div>
        ))}
        <div className={styles.schemaAddRow}>
          <label className={styles.subLabel} htmlFor={`${id}-key`}>Key</label>
          <input
            id={`${id}-key`}
            className={styles.input}
            value={mapKey}
            onChange={event => setMapKey(event.target.value)}
          />
          <button
            type="button"
            className={styles.schemaAction}
            disabled={!mapKey.trim() || Object.hasOwn(value ?? {}, mapKey)}
            onClick={() => {
              onChange(setMapEntry(config, path, mapKey, createInitialValue(schema, entrySchema)));
              setMapKey('');
            }}
          >
            Add entry
          </button>
        </div>
        <UnsetButton required={required} value={value} onUnset={unset} />
      </fieldset>
    );
  }

  if (node.type === 'object') {
    if (!required && value === undefined) {
      return (
        <section className={styles.schemaField}>
          <FieldTitle name={name} required={required} />
          <Description node={node} />
          <button type="button" className={styles.schemaAction} onClick={() => update(createInitialValue(schema, rawNode))}>
            Configure
          </button>
        </section>
      );
    }

    return (
      <fieldset className={styles.schemaFieldset}>
        <legend><FieldTitle name={name} required={required} /></legend>
        <Description node={node} />
        <ErrorMessage errors={errors} path={path} />
        <div className={styles.schemaChildren}>
          {Object.entries(node.properties ?? {}).map(([childName, childNode]) => (
            <SchemaField
              key={childName}
              schema={schema}
              name={childName}
              rawNode={childNode}
              value={value?.[childName]}
              config={config}
              path={[...path, childName]}
              required={(node.required ?? []).includes(childName)}
              showOptional={showOptional}
              errors={errors}
              onChange={onChange}
            />
          ))}
        </div>
        <UnsetButton required={required} value={value} onUnset={unset} />
      </fieldset>
    );
  }

  if (node.type === 'array') {
    const items = value ?? [];
    const itemSchema = node.items ?? { type: 'string' };
    const draftNode = resolveSchemaNode(schema, itemSchema);

    return (
      <fieldset className={styles.schemaFieldset}>
        <legend><FieldTitle name={name} required={required} /></legend>
        <Description node={node} />
        <ErrorMessage errors={errors} path={path} />
        {items.map((item, index) => (
          <div className={styles.schemaArrayEntry} key={`${id}-${index}`}>
            <PrimitiveInput
              node={draftNode}
              value={item}
              id={`${id}-${index}`}
              error={errors.some(error => error.path === toPointer([...path, index]))}
              onChange={nextValue => onChange(setValueAtPath(config, [...path, index], nextValue))}
            />
            <button
              type="button"
              className={styles.schemaUnset}
              onClick={() => onChange(removeValueAtPath(config, [...path, index]))}
            >
              Remove
            </button>
          </div>
        ))}
        <div className={styles.schemaAddRow}>
          <PrimitiveInput
            node={draftNode}
            value={arrayValue}
            id={`${id}-new-item`}
            onChange={setArrayValue}
          />
          <button
            type="button"
            className={styles.schemaAction}
            disabled={isEmptyDraft(arrayValue)}
            onClick={() => {
              update([...items, draftNode.type === 'integer' || draftNode.type === 'number' ? Number(arrayValue) : arrayValue]);
              setArrayValue('');
            }}
          >
            Add item
          </button>
        </div>
        <UnsetButton required={required} value={value} onUnset={unset} />
      </fieldset>
    );
  }

  return (
    <section className={styles.schemaField}>
      <label className={styles.label} htmlFor={id}><FieldTitle name={name} required={required} /></label>
      <Description node={node} />
      <PrimitiveInput
        node={node}
        value={value}
        id={id}
        error={Boolean(pathError)}
        onChange={nextValue => {
          if (nextValue === undefined && !required) unset();
          else update(nextValue);
        }}
      />
      <ErrorMessage errors={errors} path={path} />
      <UnsetButton required={required} value={value} onUnset={unset} />
    </section>
  );
}

export default function SchemaForm({ schema, value, onChange, showOptional, errors }) {
  const required = new Set(schema.required ?? []);

  return (
    <div className={styles.schemaForm}>
      {Object.entries(schema.properties ?? {}).map(([name, node]) => (
        <SchemaField
          key={name}
          schema={schema}
          name={name}
          rawNode={node}
          value={value[name]}
          config={value}
          path={[name]}
          required={required.has(name)}
          showOptional={showOptional}
          errors={errors}
          onChange={onChange}
        />
      ))}
    </div>
  );
}
