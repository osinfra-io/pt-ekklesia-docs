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
  assert.equal(groups.properties['openbao-secret-readers'].required, true);
  assert.equal(groups.properties['openbao-secret-writers'].required, true);
  assert.equal(groups.valueSchema.properties.members.required, false);
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
