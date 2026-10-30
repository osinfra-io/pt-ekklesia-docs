export function parseList(raw = '') {
  return raw.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
}

export function validate(fields, teamSchema, copyAttempted = false) {
  const schema = teamSchema.properties;
  const defs = teamSchema.$defs;
  const errors = {};

  if (copyAttempted) {
    if (!fields.description?.trim()) errors.description = 'Description is required';
    if (!parseList(fields.maintainers).length) errors.maintainers = 'At least one maintainer is required';
    if (!fields.adminEmail?.trim()) errors.adminEmail = 'At least one Datadog admin is required';
    if (!fields.shareChildMaintainers) errors.shareChildMaintainers = 'Confirm maintainers for all four child teams';
    if (!parseList(fields.googleOwners).length) errors.googleOwners = 'At least one Google group owner is required';
    if (!parseList(fields.openbaoAdmins).length) errors.openbaoAdmins = 'At least one OpenBao admin is required';
    if (fields.enableKubernetes && !fields.shareRegistryOwners) {
      errors.shareRegistryOwners = 'Confirm owners for both Artifact Registry groups';
    }
    if (fields.teamKey === 'pt-pneuma' && !parseList(fields.authentikAdmins).includes('brett@osinfra.io')) {
      errors.authentikAdmins = 'Include brett@osinfra.io in every environment';
    }
  }

  if (fields.teamKey && !new RegExp(schema.team_key.pattern).test(fields.teamKey)) {
    errors.teamKey = 'Must match pattern: (pt|st|ct|et)-<slug>, e.g. st-fides';
  }
  if (fields.displayName && !new RegExp(schema.display_name.pattern).test(fields.displayName)) {
    errors.displayName = 'Title Case required, e.g. "Fides" or "Trust and Safety"';
  }

  for (const field of ['maintainers', 'members']) {
    const bad = parseList(fields[field]).filter(u => !new RegExp(defs.usernameList.items.pattern).test(u));
    if (bad.length) errors[field] = `Invalid username(s): ${bad.join(', ')}`;
  }
  if (fields.adminEmail && !new RegExp(defs.emailList.items.pattern).test(fields.adminEmail.trim())) {
    errors.adminEmail = 'Must be a valid email address';
  }
  const emailPatterns = {
    googleOwners: defs.emailOrServiceAccountList.items.pattern,
    openbaoAdmins: defs.authentikMemberList.items.pattern,
    ...(fields.teamKey === 'pt-pneuma' ? {
      authentikAdmins: defs.authentikMemberList.items.pattern,
      agentgatewayAdmins: defs.authentikMemberList.items.pattern,
    } : {}),
  };
  for (const [field, pattern] of Object.entries(emailPatterns)) {
    const emails = parseList(fields[field]);
    if (emails.some(email => !new RegExp(pattern).test(email))) {
      errors[field] = 'Use valid email addresses matching the schema';
    } else if (new Set(emails).size !== emails.length) {
      errors[field] = 'Email addresses must be unique';
    }
  }

  if (fields.githubRepositories) {
    const bad = parseList(fields.githubRepositories).filter(r => {
      if (!/^[a-z][a-z0-9-]*$/.test(r)) return true;
      return fields.teamKey && r !== fields.teamKey && !r.startsWith(`${fields.teamKey}-`);
    });
    if (bad.length) errors.githubRepositories = fields.teamKey
      ? `Must start with "${fields.teamKey}-" or equal "${fields.teamKey}": ${bad.join(', ')}`
      : `Invalid name(s): ${bad.join(', ')} — use lowercase letters, digits, and hyphens`;
  }
  if (fields.googleProjectServices) {
    const bad = parseList(fields.googleProjectServices).filter(a => !new RegExp(schema.google_project_services.items.pattern).test(a));
    if (bad.length) errors.googleProjectServices = 'Must end in .googleapis.com, e.g. run.googleapis.com';
  }
  return errors;
}

export function buildPrompt(f, teamSchema) {
  const lines = [];
  const heading = f.displayName || f.teamKey;
  lines.push(heading ? `Onboard a new team — ${heading}.` : 'Onboard a new team.', '');
  if (f.teamKey) lines.push(`Team key: ${f.teamKey}`);
  if (f.displayName) lines.push(`Display name: ${f.displayName}`);
  if (f.description) lines.push(`Description: ${f.description}`);
  lines.push('');

  const maintainers = parseList(f.maintainers);
  const members = parseList(f.members);
  if (maintainers.length) lines.push(`Maintainers: ${maintainers.join(', ')}`);
  if (members.length) lines.push(`Members: ${members.join(', ')}`);
  if (f.adminEmail?.trim()) lines.push(`Datadog admins: ${f.adminEmail.trim()}; members: []`);
  if (f.shareChildMaintainers && maintainers.length) {
    for (const child of teamSchema.properties.github_child_teams_memberships.required) {
      lines.push(`GitHub child team ${child}: maintainers=${maintainers.join(', ')}; members=[]`);
    }
  }
  const owners = parseList(f.googleOwners);
  if (owners.length) {
    lines.push(`Google basic groups: owners=${owners.join(', ')}; managers=[]; members=[] for every admin, reader, and writer group in sandbox, non-production, and production.`);
  }
  const admins = parseList(f.openbaoAdmins);
  if (admins.length) {
    lines.push(`Declare openbao-secret-admins (label: OpenBao Secret Admins) with members=${admins.join(', ')} in sandbox, non-production, and production.`);
  }
  lines.push('Declare openbao-secret-readers (label: OpenBao Secret Readers) and openbao-secret-writers (label: OpenBao Secret Writers) with empty memberships in every environment.');
  if (f.teamKey === 'pt-pneuma') {
    lines.push(`Declare authentik-admins (label: authentik Admins) with members=${parseList(f.authentikAdmins).join(', ')} in sandbox, non-production, and production.`);
    lines.push(`Declare agentgateway-admins (label: agentgateway Admins) with members=${JSON.stringify(parseList(f.agentgatewayAdmins))} in sandbox, non-production, and production.`);
  }

  const flags = [
    f.enableGoogleProject && 'enable_google_project',
    f.enableWorkflows && 'enable_workflows',
    f.enableStateManagement && 'enable_opentofu_state_management',
    f.enableProjectDatadog && 'google_project_enable_datadog',
  ].filter(Boolean);
  if (flags.length) lines.push('', `Enable: ${flags.join(', ')}`);
  const apis = parseList(f.googleProjectServices);
  if (apis.length) lines.push(`Additional GCP APIs: ${apis.join(', ')}`);
  const repos = parseList(f.githubRepositories);
  if (repos.length) {
    lines.push('', 'GitHub repositories:');
    for (const r of repos) lines.push(`- ${r}`);
  }
  if (f.enableCloudSQL || f.enableKubernetes) {
    lines.push('', 'Platform-managed project:');
    if (f.enableCloudSQL) {
      const regionsStr = f.cloudSqlRegions.length ? f.cloudSqlRegions.join(', ') : '(required)';
      lines.push(`  Cloud SQL: database_version=${f.cloudSqlVersion || '(required)'}, machine_tier=${f.cloudSqlTier || '(required)'}, regions=${regionsStr}`);
    }
    if (f.enableKubernetes) {
      const zonesStr = f.gkeLocations.length ? f.gkeLocations.join(', ') : '(required)';
      lines.push(`  Kubernetes Engine: locations=${zonesStr}`);
      if (f.shareRegistryOwners && owners.length) {
        lines.push(`    Artifact Registry readers and writers: owners=${owners.join(', ')}; managers=[]; members=[] for both groups.`);
      }
      if (f.gkeDnsSubdomain) lines.push(`    dns_subdomain=${f.gkeDnsSubdomain}`);
      if (f.enableGkeDatadog) lines.push('    enable_datadog_apm=true');
    }
  }
  return lines.join('\n').trim();
}
