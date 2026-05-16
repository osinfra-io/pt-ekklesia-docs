// Converts a JSON Schema object (with $ref / $defs) into the flat shape
// expected by SchemaViewer: each property carries type, required (bool),
// description, enum, and properties (recursively resolved).

function resolveRef(ref, defs) {
  const name = ref.replace('#/$defs/', '');
  if (!defs[name]) throw new Error(`Unknown $ref: ${ref}`);
  return defs[name];
}

function resolveNode(node, defs) {
  if (node.$ref) {
    node = resolveRef(node.$ref, defs);
  }

  const type = inferType(node);
  const result = { type };

  if (node.description) result.description = node.description;
  if (node.enum) result.enum = node.enum;

  if (node.properties) {
    const required = new Set(node.required ?? []);
    result.properties = {};
    for (const [k, v] of Object.entries(node.properties)) {
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
