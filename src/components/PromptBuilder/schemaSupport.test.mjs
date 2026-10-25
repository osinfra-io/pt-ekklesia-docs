import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const schema = JSON.parse(readFileSync(
  new URL('../SchemaViewer/team.schema.json', import.meta.url),
  'utf8',
));

const helpers = await import('./schemaSupport.mjs').catch((error) => {
  if (error.code === 'ERR_MODULE_NOT_FOUND' && error.message.includes('schemaSupport.mjs')) {
    return {};
  }
  throw error;
});

function getHelper(name) {
  assert.equal(typeof helpers[name], 'function', `schemaSupport.mjs must export ${name}`);
  return helpers[name];
}

function validTeamConfig() {
  return {
    team_key: 'pt-pneuma',
    datadog_team_memberships: {
      admins: [],
      members: [],
    },
    display_name: 'Pneuma',
    display_name_comment: 'Breath and movement for the platform.',
    github_parent_team_memberships: {
      maintainers: ['brettcurtis'],
      members: [],
    },
    google_basic_groups_env_memberships: {
      admin: {},
      reader: {},
      writer: {},
    },
    team_type: 'platform-team',
  };
}

function configWithGkeSubnet(subnet) {
  return {
    ...validTeamConfig(),
    platform_managed_project: {
      kubernetes_engine: {
        locations: {
          'us-east1-b': {
            node_pools: {
              default: {
                machine_type: 'e2-standard-4',
                min_node_count: 1,
                max_node_count: 3,
              },
            },
            subnet,
          },
        },
      },
    },
  };
}

test('initializes the required schema structure without inventing optional fields', () => {
  const createInitialConfig = getHelper('createInitialConfig');
  const config = createInitialConfig(schema);

  assert.deepEqual(config, {
    team_key: '',
    datadog_team_memberships: {
      admins: [],
      members: [],
    },
    display_name: '',
    display_name_comment: '',
    github_parent_team_memberships: {
      maintainers: [],
      members: [],
    },
    google_basic_groups_env_memberships: {
      admin: {},
      reader: {},
      writer: {},
    },
    team_type: '',
  });
  assert.equal(Object.hasOwn(config, 'enable_workflows'), false);
});

test('validates a complete minimal team configuration', () => {
  const validateConfig = getHelper('validateConfig');

  assert.deepEqual(validateConfig(validTeamConfig(), schema), {
    valid: true,
    errors: [],
  });
});

test('reports a missing required nested property at its JSON Pointer path', () => {
  const validateConfig = getHelper('validateConfig');
  const config = validTeamConfig();
  delete config.github_parent_team_memberships.maintainers;

  const result = validateConfig(config, schema);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some(
    ({ path }) => path === '/github_parent_team_memberships/maintainers',
  ));
});

test('enforces the team type prefix constraint', () => {
  const validateConfig = getHelper('validateConfig');
  const config = validTeamConfig();
  config.team_key = 'st-pneuma';

  assert.equal(validateConfig(config, schema).valid, false);
});

test('accepts a valid IPv4 CIDR in a GKE subnet', () => {
  const validateConfig = getHelper('validateConfig');

  const result = validateConfig(configWithGkeSubnet({
    ip_cidr_range: '10.0.0.0/24',
    master_ipv4_cidr_block: '172.16.0.0/28',
    pod_ip_cidr_range: '10.1.0.0/16',
    services_ip_cidr_range: '10.2.0.0/20',
  }), schema);

  assert.equal(result.valid, true);
});

test('rejects an out-of-range IPv4 octet in a GKE subnet', () => {
  const validateConfig = getHelper('validateConfig');

  const result = validateConfig(configWithGkeSubnet({
    ip_cidr_range: '300.0.0.0/24',
    master_ipv4_cidr_block: '172.16.0.0/28',
    pod_ip_cidr_range: '10.1.0.0/16',
    services_ip_cidr_range: '10.2.0.0/20',
  }), schema);

  assert.equal(result.valid, false);
});

test('rejects an IPv4 CIDR prefix longer than 32', () => {
  const validateConfig = getHelper('validateConfig');

  const result = validateConfig(configWithGkeSubnet({
    ip_cidr_range: '10.0.0.0/33',
    master_ipv4_cidr_block: '172.16.0.0/28',
    pod_ip_cidr_range: '10.1.0.0/16',
    services_ip_cidr_range: '10.2.0.0/20',
  }), schema);

  assert.equal(result.valid, false);
});

test('omits an unset optional boolean and preserves explicit false', () => {
  const createInitialConfig = getHelper('createInitialConfig');
  const validateConfig = getHelper('validateConfig');
  const buildPrompt = getHelper('buildPrompt');
  const config = {
    ...createInitialConfig(schema),
    ...validTeamConfig(),
    enable_workflows: false,
  };

  assert.equal(Object.hasOwn(createInitialConfig(schema), 'enable_workflows'), false);
  assert.equal(validateConfig(config, schema).valid, true);

  const json = JSON.parse(buildPrompt(config).match(/```json\n([\s\S]*?)\n```/)[1]);
  assert.equal(json.enable_workflows, false);
});

test('rejects properties not present in the schema', () => {
  const validateConfig = getHelper('validateConfig');

  assert.equal(validateConfig({
    ...validTeamConfig(),
    unexpected: true,
  }, schema).valid, false);
});

test('builds a prompt with schema-shaped JSON instead of legacy prose fields', () => {
  const buildPrompt = getHelper('buildPrompt');
  const prompt = buildPrompt(validTeamConfig());
  const jsonBlock = prompt.match(/```json\n([\s\S]*?)\n```/);

  assert.ok(jsonBlock);
  assert.deepEqual(JSON.parse(jsonBlock[1]), validTeamConfig());
  assert.doesNotMatch(prompt, /^(Description|Maintainers|Members|Admin email):/m);
});

test('counts every top-level schema property as required or optional', () => {
  const getTopLevelFieldCounts = getHelper('getTopLevelFieldCounts');

  assert.deepEqual(getTopLevelFieldCounts(schema), {
    required: 7,
    optional: 13,
  });
});

test('resolves repository and membership references with nested required fields', () => {
  const resolveSchemaNode = getHelper('resolveSchemaNode');
  const repository = resolveSchemaNode(schema, {
    $ref: '#/$defs/githubRepository',
  });
  const membership = resolveSchemaNode(schema, {
    $ref: '#/$defs/githubMembership',
  });

  assert.deepEqual(repository.required, ['description', 'topics']);
  assert.ok(repository.properties.environments);
  assert.deepEqual(membership.required, ['maintainers', 'members']);
});

test('adds and updates map entries without mutating or dropping siblings', () => {
  const setMapEntry = getHelper('setMapEntry');
  const original = {
    authentik_groups: {
      existing: { label: 'Existing Admins' },
    },
  };

  const added = setMapEntry(original, ['authentik_groups'], 'new', { label: 'New Admins' });
  const updated = setMapEntry(added, ['authentik_groups'], 'new', { label: 'New Readers' });

  assert.deepEqual(added.authentik_groups, {
    existing: { label: 'Existing Admins' },
    new: { label: 'New Admins' },
  });
  assert.deepEqual(updated.authentik_groups, {
    existing: { label: 'Existing Admins' },
    new: { label: 'New Readers' },
  });
  assert.deepEqual(original.authentik_groups, {
    existing: { label: 'Existing Admins' },
  });
});

test('removes a repository map entry without dropping other repositories', () => {
  const removeMapEntry = getHelper('removeMapEntry');
  const original = {
    github_repositories: {
      'pt-pneuma': { description: 'Pneuma', topics: ['pt-pneuma', 'platform-team'] },
      'pt-pneuma-docs': { description: 'Docs', topics: ['pt-pneuma', 'platform-team'] },
    },
  };

  const updated = removeMapEntry(original, ['github_repositories'], 'pt-pneuma');

  assert.deepEqual(updated.github_repositories, {
    'pt-pneuma-docs': { description: 'Docs', topics: ['pt-pneuma', 'platform-team'] },
  });
  assert.equal(Object.hasOwn(original.github_repositories, 'pt-pneuma'), true);
});

test('updates a nested field without mutating the original configuration', () => {
  const setValueAtPath = getHelper('setValueAtPath');
  const original = {
    authentik_groups: {
      router: { label: 'Router Admins' },
    },
  };

  const updated = setValueAtPath(original, ['authentik_groups', 'router', 'label'], 'Router Readers');

  assert.equal(updated.authentik_groups.router.label, 'Router Readers');
  assert.equal(original.authentik_groups.router.label, 'Router Admins');
});

test('unsets an optional boolean without mutating the original configuration', () => {
  const removeValueAtPath = getHelper('removeValueAtPath');
  const original = {
    enable_workflows: false,
    enable_google_project: true,
  };

  const updated = removeValueAtPath(original, ['enable_workflows']);

  assert.deepEqual(updated, { enable_google_project: true });
  assert.deepEqual(original, {
    enable_workflows: false,
    enable_google_project: true,
  });
});

test('treats an unselected array enum as an empty draft', () => {
  const isEmptyDraft = getHelper('isEmptyDraft');

  assert.equal(isEmptyDraft(undefined), true);
  assert.equal(isEmptyDraft(''), true);
  assert.equal(isEmptyDraft('us-east1'), false);
  assert.equal(isEmptyDraft(0), false);
});
