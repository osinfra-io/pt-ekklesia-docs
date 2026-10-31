import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import resolveSchema from './resolveSchema.js';
import {collectExpandablePaths, getChildren, matchesOwnFields, matchesSearch} from './search.js';

const schema = resolveSchema(JSON.parse(readFileSync(new URL('./team.schema.json', import.meta.url))));

test('a matching group preserves its entire subtree for filtering and expand all', () => {
  const query = 'openbao-secret-admins';
  const groups = schema.authentik_groups;
  const admins = getChildren(groups)[query];
  assert.equal(matchesOwnFields(query, admins, query), true);
  const childQuery = matchesOwnFields(query, admins, query) ? '' : query;
  assert.equal(matchesSearch('members', admins.properties.members, childQuery), true);
  assert.deepEqual(collectExpandablePaths({authentik_groups: groups}, query), [
    'authentik_groups',
    'authentik_groups.openbao-secret-admins',
    'authentik_groups.openbao-secret-admins.members',
  ]);
});

test('descendant-only matches filter unrelated siblings and expand matching ancestors', () => {
  const properties = {
    root: {
      type: 'object',
      properties: {
        access: {type: 'object', properties: {members: {type: 'string[]'}}},
        unrelated: {type: 'object', properties: {label: {type: 'string'}}},
      },
    },
  };
  assert.equal(matchesOwnFields('root', properties.root, 'members'), false);
  assert.equal(matchesSearch('root', properties.root, 'members'), true);
  assert.equal(matchesSearch('unrelated', properties.root.properties.unrelated, 'members'), false);
  assert.deepEqual(collectExpandablePaths(properties, 'members'), ['root', 'root.access']);
});
