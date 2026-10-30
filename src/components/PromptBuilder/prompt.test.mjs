import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {validate, buildPrompt} from './prompt.js';

const schema = JSON.parse(readFileSync(new URL('../SchemaViewer/team.schema.json', import.meta.url)));
const fields = {
  teamKey: 'st-example',
  description: 'Example team',
  maintainers: 'example-owner',
  adminEmail: 'admin@osinfra.io',
  shareChildMaintainers: true,
  googleOwners: 'owner@osinfra.io',
  openbaoAdmins: 'secret-admin@osinfra.io',
  enableKubernetes: false,
};

test('copy validation rejects empty required memberships and unconfirmed shared assignments', () => {
  assert.deepEqual(validate(fields, schema, true), {});
  const errors = validate({
    ...fields,
    adminEmail: ' ',
    googleOwners: '',
    openbaoAdmins: '',
    shareChildMaintainers: false,
  }, schema, true);
  for (const field of ['adminEmail', 'googleOwners', 'openbaoAdmins', 'shareChildMaintainers']) {
    assert.ok(errors[field], `Missing required validation for ${field}`);
  }
});

test('generated prompts assign every required group without inheriting parent members', () => {
  const prompt = buildPrompt({...fields, members: 'ordinary-member'}, schema);
  for (const team of schema.properties.github_child_teams_memberships.required) {
    assert.ok(prompt.includes(`GitHub child team ${team}: maintainers=example-owner; members=[]`));
  }
  assert.ok(prompt.includes('Google basic groups: owners=owner@osinfra.io; managers=[]; members=[]'));
  assert.ok(prompt.includes('openbao-secret-admins (label: OpenBao Secret Admins) with members=secret-admin@osinfra.io in sandbox, non-production, and production'));
  assert.ok(prompt.includes('openbao-secret-readers'));
  assert.ok(prompt.includes('openbao-secret-writers'));
  assert.ok(prompt.includes('Datadog admins: admin@osinfra.io; members: []'));
  assert.ok(!prompt.includes('authentik-admins'));
});

test('Kubernetes requires explicit shared registry ownership and includes it in the prompt', () => {
  const kube = {...fields, enableKubernetes: true, gkeLocations: ['us-east1-b']};
  assert.ok(validate(kube, schema, true).shareRegistryOwners);
  const confirmed = {...kube, shareRegistryOwners: true};
  assert.deepEqual(validate(confirmed, schema, true), {});
  assert.ok(buildPrompt(confirmed, schema).includes(
    'Artifact Registry readers and writers: owners=owner@osinfra.io; managers=[]; members=[] for both groups.',
  ));
});

test('Pneuma requires its global administrator and includes both reserved groups', () => {
  const pneuma = {...fields, teamKey: 'pt-pneuma'};
  assert.ok(validate(pneuma, schema, true).authentikAdmins);
  const confirmed = {...pneuma, authentikAdmins: 'brett@osinfra.io'};
  assert.deepEqual(validate(confirmed, schema, true), {});
  const prompt = buildPrompt(confirmed, schema);
  assert.ok(prompt.includes('authentik-admins (label: authentik Admins) with members=brett@osinfra.io'));
  assert.ok(prompt.includes('agentgateway-admins (label: agentgateway Admins) with members=[]'));
});

test('new membership inputs reject malformed, duplicate, or nonlowercase identities', () => {
  const errors = validate({
    ...fields,
    googleOwners: 'not-an-email',
    openbaoAdmins: 'Admin@example.com',
  }, schema, true);
  assert.ok(errors.googleOwners);
  assert.ok(errors.openbaoAdmins);
  assert.ok(validate({...fields, openbaoAdmins: 'a@example.com,a@example.com'}, schema, true).openbaoAdmins);
});

test('Nomos onboarding rejects external domains for every collected email membership', () => {
  for (const field of ['adminEmail', 'googleOwners', 'openbaoAdmins', 'authentikAdmins', 'agentgatewayAdmins']) {
    const errors = validate({
      ...fields,
      teamKey: 'pt-pneuma',
      authentikAdmins: 'brett@osinfra.io',
      [field]: 'person@example.com',
    }, schema, true);
    assert.match(errors[field], /@osinfra\.io/);
  }
  assert.ok(validate({...fields, googleOwners: 'person@osinfra.io.example.com'}, schema, true).googleOwners);
});
