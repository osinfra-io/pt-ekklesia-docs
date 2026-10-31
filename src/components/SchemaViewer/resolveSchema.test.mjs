import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import resolveSchema from './resolveSchema.js';

const schema = JSON.parse(readFileSync(new URL('./team.schema.json', import.meta.url)));

test('named OpenBao admin entries retain stricter membership requirements', () => {
  const groups = resolveSchema(schema).authentik_groups;
  const admins = groups.properties['openbao-secret-admins'];
  assert.equal(admins.required, true);
  assert.equal(admins.properties.members.required, true);
  for (const environment of ['sandbox', 'non-production', 'production']) {
    const members = admins.properties.members.properties[environment];
    assert.equal(members.required, true);
    assert.equal(members.minItems, 1);
  }
  assert.equal(admins.properties.description, undefined);
  assert.equal(admins.properties.label, undefined);
  assert.equal(groups.properties['openbao-secret-readers'].required, true);
  assert.equal(groups.properties['openbao-secret-writers'].required, true);
  assert.equal(groups.properties['openbao-secret-readers'].properties.label, undefined);
  assert.equal(groups.valueSchema.properties.members.required, false);
});

test('Authentik group entries explain access and membership fields', () => {
  const groups = resolveSchema(schema).authentik_groups;
  const admins = groups.properties['openbao-secret-admins'];
  const readers = groups.properties['openbao-secret-readers'];
  const writers = groups.properties['openbao-secret-writers'];
  const otherGroup = groups.valueSchema;

  assert.match(admins.description, /administrator group/);
  assert.match(admins.description, /fixed by Logos/);
  assert.match(admins.properties.members.description, /at least one member/);
  for (const environment of ['non-production', 'production', 'sandbox']) {
    assert.ok(admins.properties.members.properties[environment].description);
  }
  assert.match(readers.description, /read access.*no write access/);
  assert.match(writers.description, /create and update access.*not delete/);
  assert.match(readers.description, /fixed by Logos/);
  assert.match(writers.description, /fixed by Logos/);
  assert.match(otherGroup.description, /Additional team-owned application-access group/);
  for (const group of [readers, writers]) {
    assert.match(group.properties.members.description, /Explicit member emails/);
  }

  for (const group of [otherGroup]) {
    assert.match(group.properties.description.description, /access it grants/);
    assert.match(group.properties.label.description, /Human-readable/);
    assert.match(group.properties.members.description, /Explicit member emails/);
    for (const environment of ['non-production', 'production', 'sandbox']) {
      assert.ok(group.properties.members.properties[environment].description);
    }
  }
});

test('required map keys use the generic entry schema when no named schema exists', () => {
  const teams = resolveSchema(schema).github_child_teams_memberships;
  assert.deepEqual(Object.keys(teams.properties), [
    'non-production-approvers',
    'production-approvers',
    'repository-administrators',
    'sandbox-approvers',
  ]);
  for (const team of Object.values(teams.properties)) {
    assert.equal(team.required, true);
    assert.equal(team.properties.maintainers.required, true);
    assert.equal(team.properties.maintainers.minItems, 1);
  }
});

test('allOf merges referenced Google groups and retains the stricter owner schema', () => {
  const resolved = resolveSchema(schema);
  const basic = resolved.google_basic_groups_env_memberships.properties;
  const registry = resolved.platform_managed_project.properties.kubernetes_engine
    .properties.artifact_registry_groups_memberships.properties;
  const groups = [
    ...Object.values(basic).flatMap(role => Object.values(role.properties)),
    ...Object.values(registry),
  ];
  for (const group of groups) {
    assert.equal(group.type, 'object');
    for (const field of ['owners', 'managers', 'members']) {
      assert.equal(group.properties[field].required, true);
      assert.equal(group.properties[field].type, 'string[]');
    }
    assert.equal(group.properties.owners.minItems, 1);
  }
});

test('$ref siblings and allOf required fields are preserved without mutating the source', () => {
  const input = {
    $defs: {
      base: {type: 'object', required: ['first'], properties: {first: {type: 'string'}}},
    },
    properties: {
      composed: {
        description: 'Composed entry',
        allOf: [
          {$ref: '#/$defs/base'},
          {required: ['second'], properties: {second: {type: 'string'}}},
        ],
      },
      referenced: {$ref: '#/$defs/base', description: 'Reference override'},
    },
  };
  const original = structuredClone(input);
  const resolved = resolveSchema(input);
  assert.equal(resolved.composed.properties.first.required, true);
  assert.equal(resolved.composed.properties.second.required, true);
  assert.equal(resolved.composed.description, 'Composed entry');
  assert.equal(resolved.referenced.description, 'Reference override');
  assert.deepEqual(input, original);
});

test('conditional requirements are displayed without making them unconditional', () => {
  const original = structuredClone(schema);
  const resolved = resolveSchema(schema);
  assert.deepEqual(resolved.authentik_groups.conditionalRequirements, [{
    condition: 'team_key is "pt-pneuma"',
    keys: ['agentgateway-admins', 'authentik-admins'],
  }]);
  const registry = resolved.platform_managed_project.properties.kubernetes_engine
    .properties.artifact_registry_groups_memberships;
  assert.equal(registry.required, false);
  assert.deepEqual(registry.requiredWhen, [
    'platform_managed_project.kubernetes_engine.locations has at least 1 entry',
  ]);
  assert.deepEqual(schema, original);
});

test('defaults and validation constraints are retained for the viewer', () => {
  const resolved = resolveSchema({
    properties: {
      count: {type: 'integer', default: 3, minimum: 1, maximum: 5},
      names: {
        type: 'array',
        minItems: 1,
        maxItems: 4,
        uniqueItems: true,
        items: {type: 'string', minLength: 2, maxLength: 12, pattern: '^[a-z]+$'},
      },
    },
  });

  assert.equal(resolved.count.default, 3);
  assert.equal(resolved.count.minimum, 1);
  assert.equal(resolved.count.maximum, 5);
  assert.equal(resolved.names.minItems, 1);
  assert.equal(resolved.names.maxItems, 4);
  assert.equal(resolved.names.uniqueItems, true);
  assert.deepEqual(resolved.names.itemConstraints, {
    minLength: 2,
    maxLength: 12,
    pattern: '^[a-z]+$',
  });
});
