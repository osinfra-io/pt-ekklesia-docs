import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const validatorCache = new WeakMap();

function resolveNode(schema, node) {
  if (!node.$ref) return node;

  const name = node.$ref.replace('#/$defs/', '');
  const definition = schema.$defs?.[name];
  if (!definition) throw new Error(`Unknown schema reference: ${node.$ref}`);

  const { $ref, ...siblings } = node;
  return { ...definition, ...siblings };
}

export function resolveSchemaNode(schema, node) {
  return resolveNode(schema, node);
}

export function setValueAtPath(config, path, value) {
  if (path.length === 0) return value;

  const [key, ...remaining] = path;
  const result = Array.isArray(config) ? [...config] : { ...(config ?? {}) };
  result[key] = setValueAtPath(config?.[key], remaining, value);
  return result;
}

export function removeValueAtPath(config, path) {
  if (path.length === 0) return undefined;

  const [key, ...remaining] = path;
  const result = Array.isArray(config) ? [...config] : { ...(config ?? {}) };

  if (remaining.length === 0) {
    if (Array.isArray(result)) result.splice(Number(key), 1);
    else delete result[key];
    return result;
  }

  result[key] = removeValueAtPath(config?.[key], remaining);
  return result;
}

export function isEmptyDraft(value) {
  return value === undefined || value === '';
}

function getValueAtPath(config, path) {
  return path.reduce((value, key) => value?.[key], config);
}

export function setMapEntry(config, path, key, entry) {
  const map = getValueAtPath(config, path) ?? {};
  return setValueAtPath(config, path, { ...map, [key]: entry });
}

export function removeMapEntry(config, path, key) {
  const map = getValueAtPath(config, path) ?? {};
  const { [key]: removed, ...remaining } = map;
  return setValueAtPath(config, path, remaining);
}

function initializeNode(schema, node) {
  node = resolveNode(schema, node);

  if (node.type === 'object') {
    const result = {};
    const required = new Set(node.required ?? []);
    for (const [name, child] of Object.entries(node.properties ?? {})) {
      if (required.has(name)) result[name] = initializeNode(schema, child);
    }
    return result;
  }

  if (node.type === 'array') return [];
  if (node.type === 'string') return '';
  if (node.type === 'boolean' || node.type === 'number' || node.type === 'integer') return undefined;
  return undefined;
}

function isIpv4Cidr(value) {
  const [address, prefix, extra] = value.split('/');
  if (extra !== undefined || !/^(0|[1-9]\d?)$/.test(prefix ?? '')) return false;

  const octets = address.split('.');
  if (octets.length !== 4) return false;
  if (octets.some(octet => !/^(0|[1-9]\d{0,2})$/.test(octet) || Number(octet) > 255)) return false;

  return Number(prefix) <= 32;
}

function escapePointerSegment(value) {
  return String(value).replaceAll('~', '~0').replaceAll('/', '~1');
}

function getErrorPath(error) {
  let path = error.instancePath;
  if (error.keyword === 'required') {
    path += `/${escapePointerSegment(error.params.missingProperty)}`;
  }
  if (error.keyword === 'additionalProperties') {
    path += `/${escapePointerSegment(error.params.additionalProperty)}`;
  }
  return path;
}

function createValidator(schema) {
  const cached = validatorCache.get(schema);
  if (cached) return cached;

  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  ajv.addFormat('ipv4-cidr', { type: 'string', validate: isIpv4Cidr });
  const validate = ajv.compile(schema);
  validatorCache.set(schema, validate);
  return validate;
}

export function createInitialConfig(schema) {
  const result = {};
  const required = new Set(schema.required ?? []);

  for (const [name, node] of Object.entries(schema.properties ?? {})) {
    if (required.has(name)) result[name] = initializeNode(schema, node);
  }

  return result;
}

export function validateConfig(config, schema) {
  const validate = createValidator(schema);
  const valid = validate(config);

  return {
    valid,
    errors: (validate.errors ?? []).map(error => ({
      path: getErrorPath(error),
      message: error.message,
    })),
  };
}

export function buildPrompt(config) {
  return `Onboard this team using the configuration below:\n\n\`\`\`json\n${JSON.stringify(config, null, 2)}\n\`\`\``;
}

export function getTopLevelFieldCounts(schema) {
  const propertyNames = Object.keys(schema.properties ?? {});
  const required = new Set(schema.required ?? []);

  return {
    required: propertyNames.filter(name => required.has(name)).length,
    optional: propertyNames.filter(name => !required.has(name)).length,
  };
}
