// Converts a JSON Schema object (with $ref / $defs) into the flat shape
// expected by SchemaViewer: each property carries type, required (bool),
// description, enum, and properties (recursively resolved).

function resolveRef(ref, defs) {
  const name = ref.replace('#/$defs/', '');
  if (!defs[name]) throw new Error(`Unknown $ref: ${ref}`);
  return defs[name];
}

function mergeNodes(base, extra) {
  const merged = {...base, ...extra};
  if (base.required || extra.required) {
    merged.required = [...new Set([...(base.required ?? []), ...(extra.required ?? [])])];
  }
  if (base.properties || extra.properties) {
    merged.properties = {...base.properties};
    for (const [key, value] of Object.entries(extra.properties ?? {})) {
      merged.properties[key] = mergeNodes(merged.properties[key] ?? {}, value);
    }
  }
  return merged;
}

function expandNode(node, defs) {
  const {$ref, allOf, ...own} = node;
  for (const [key, value] of Object.entries(own.properties ?? {})) {
    own.properties = {...own.properties, [key]: expandNode(value, defs)};
  }
  if (own.additionalProperties && typeof own.additionalProperties === 'object') {
    own.additionalProperties = expandNode(own.additionalProperties, defs);
  }
  let expanded = $ref ? expandNode(resolveRef($ref, defs), defs) : {};
  for (const part of allOf ?? []) {
    expanded = mergeNodes(expanded, expandNode(part, defs));
  }
  return mergeNodes(expanded, own);
}

function resolveNode(node, defs) {
  node = expandNode(node, defs);

  const type = inferType(node);
  const result = { type };

  if (node.description) result.description = node.description;
  if (node.enum) result.enum = node.enum;
  if (node.minItems !== undefined) result.minItems = node.minItems;

  if (node.properties || node.required?.length) {
    const required = new Set(node.required ?? []);
    result.properties = {};
    const keys = new Set([...Object.keys(node.properties ?? {}), ...required]);
    for (const k of keys) {
      const v = node.properties?.[k] ?? node.additionalProperties;
      if (!v || typeof v !== 'object') continue;
      const child = resolveNode(v, defs);
      child.required = required.has(k);
      result.properties[k] = child;
    }
  }

  if (node.additionalProperties && typeof node.additionalProperties === 'object') {
    const valueNode = resolveNode(node.additionalProperties, defs);
    result.valueSchema = valueNode;
  }

  return result;
}

function inferType(node) {
  if (node.type === 'array') {
    const itemType = node.items?.type ?? 'string';
    return `${itemType}[]`;
  }
  if (node.type === 'object') {
    if (node.additionalProperties && typeof node.additionalProperties === 'object') {
      return 'map';
    }
    return 'object';
  }
  return node.type ?? 'any';
}

// Fields that are part of the MCP spec format but not user-configurable
// schema fields (the title already communicates the team key).
const EXCLUDED = new Set(['team_key']);

export default function resolveSchema(jsonSchema) {
  const defs = jsonSchema.$defs ?? {};
  const required = new Set(jsonSchema.required ?? []);
  const result = {};

  for (const [k, v] of Object.entries(jsonSchema.properties ?? {})) {
    if (EXCLUDED.has(k)) continue;
    const resolved = resolveNode(v, defs);
    resolved.required = required.has(k);
    result[k] = resolved;
  }

  return result;
}
