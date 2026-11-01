import { useState, useMemo, useRef, useEffect, useCallback, useContext } from 'react';
import {
  Alert,
  Autocomplete,
  ActionIcon,
  Collapse,
  MultiSelect,
  Paper,
  Select,
  Switch,
  Textarea,
  TextInput,
} from '@mantine/core';
import '@mantine/core/styles/Alert.css';
import {IconCheck, IconCopy} from '@tabler/icons-react';
import '@mantine/core/styles/ActionIcon.css';
import '@mantine/core/styles/CloseButton.css';
import '@mantine/core/styles/Combobox.css';
import '@mantine/core/styles/Input.css';
import '@mantine/core/styles/Paper.css';
import '@mantine/core/styles/Pill.css';
import '@mantine/core/styles/PillsInput.css';
import '@mantine/core/styles/Popover.css';
import '@mantine/core/styles/ScrollArea.css';
import '@mantine/core/styles/Switch.css';
import '@mantine/core/styles/UnstyledButton.css';
import teamSchema from '@site/src/components/SchemaViewer/team.schema.json';
import { useOnboardingFilter, FilterBar, OnboardingFilterContext, OnboardingFilterProvider } from '@site/src/components/OnboardingFilter';
import {parseList, validate, buildPrompt} from './prompt';
import styles from './styles.module.css';

const schema = teamSchema.properties;
const defs = teamSchema.$defs;

const SQL_VERSIONS = [
  'POSTGRES_18', 'POSTGRES_17', 'POSTGRES_16', 'POSTGRES_15', 'POSTGRES_14',
  'POSTGRES_13', 'POSTGRES_12', 'POSTGRES_11', 'POSTGRES_10', 'POSTGRES_9_6',
];

const SQL_TIERS = [
  // Shared core
  'db-f1-micro', 'db-g1-small',
  // Enterprise Plus — N2
  'db-perf-optimized-N-2', 'db-perf-optimized-N-4', 'db-perf-optimized-N-8',
  'db-perf-optimized-N-16', 'db-perf-optimized-N-32', 'db-perf-optimized-N-48',
  'db-perf-optimized-N-64', 'db-perf-optimized-N-80', 'db-perf-optimized-N-96',
  'db-perf-optimized-N-128',
  // Enterprise Plus — C4A
  'db-c4a-highmem-2', 'db-c4a-highmem-4', 'db-c4a-highmem-8', 'db-c4a-highmem-16',
  'db-c4a-highmem-32', 'db-c4a-highmem-48', 'db-c4a-highmem-64', 'db-c4a-highmem-72',
];

const SQL_REGIONS = ['us-east1', 'us-east4'];

const GKE_ZONES = ['us-east1-b', 'us-east1-c', 'us-east1-d', 'us-east4-a', 'us-east4-b', 'us-east4-c'];

const REQUIRED_COUNT = 8;
const OPTIONAL_COUNT = 8;

function normalizeTeamKey(raw) {
  return raw.trim().toLowerCase();
}

function ApiAutocomplete({ value, onChange }) {
  const [allApis, setAllApis]       = useState([]);
  const [query, setQuery]           = useState('');
  const [suggestions, setSugs]      = useState([]);
  const [showDrop, setShowDrop]     = useState(false);
  const [activeIdx, setActiveIdx]   = useState(-1);
  const [fetchState, setFetchState] = useState('idle'); // idle | loading | done | error
  const inputRef = useRef(null);
  const dropRef  = useRef(null);

  const fetchedRef = useRef(false);

  const fetchApis = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setFetchState('loading');
    try {
      const res = await fetch('https://discovery.googleapis.com/discovery/v1/apis');
      const json = await res.json();
      const names = [...new Set(
        (json.items ?? [])
          .filter(i => i.preferred && i.discoveryRestUrl && i.documentationLink?.includes('cloud.google.com'))
          .map(i => i.discoveryRestUrl.split('/$discovery')[0].replace('https://', ''))
          .filter(n => n.endsWith('.googleapis.com'))
      )].sort();
      setAllApis(names);
      setFetchState('done');
    } catch {
      fetchedRef.current = false;
      setFetchState('error');
    }
  }, []);

  const added = useMemo(() => new Set(parseList(value)), [value]);

  useEffect(() => {
    if (!query || fetchState !== 'done') { setSugs([]); return; }
    const q = query.toLowerCase();
    setSugs(
      allApis.filter(a => a.includes(q) && !added.has(a)).slice(0, 8)
    );
    setActiveIdx(-1);
  }, [query, allApis, fetchState, added]);

  useEffect(() => {
    function onDown(e) {
      if (!showDrop) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
      if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); pick(suggestions[activeIdx]); }
      if (e.key === 'Escape') setShowDrop(false);
    }
    document.addEventListener('keydown', onDown);
    return () => document.removeEventListener('keydown', onDown);
  }, [showDrop, suggestions, activeIdx]);

  function pick(api) {
    const existing = parseList(value).filter(v => v !== query);
    onChange([...existing, api].join(', '));
    setQuery('');
    setSugs([]);
    setShowDrop(false);
    inputRef.current?.focus();
  }

  function handleInput(e) {
    const raw = e.target.value;
    // Extract the fragment the user is currently typing (after last comma)
    const parts = raw.split(',');
    const current = parts[parts.length - 1].trim();
    setQuery(current);
    setShowDrop(true);
    // If user edited existing entries directly, propagate to parent
    onChange(raw);
  }

  return (
    <div className={styles.apiWrap}>
      <Textarea
        ref={inputRef}
        id="pb-gcp-apis"
        classNames={{ input: styles.fieldInput }}
        value={value}
        onFocus={fetchApis}
        onChange={handleInput}
        onBlur={() => setTimeout(() => setShowDrop(false), 150)}
        placeholder="run.googleapis.com, pubsub.googleapis.com"
        rows={2}
        autoComplete="off"
        aria-describedby="pb-gcp-apis-description"
      />
      {fetchState === 'loading' && <p className={styles.apiHint}>Loading Google APIs…</p>}
      {fetchState === 'error'   && <p className={styles.apiHint}>Could not load API list — type manually.</p>}
      {showDrop && suggestions.length > 0 && (
        <ul ref={dropRef} className={styles.apiDrop} role="listbox">
          {suggestions.map((s, i) => (
            <li
              key={s}
              role="option"
              aria-selected={i === activeIdx}
              className={`${styles.apiOpt} ${i === activeIdx ? styles.apiOptActive : ''}`}
              onMouseDown={() => pick(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProductGroup({ color, label, children }) {
  return (
    <Paper className={styles.productGroup} withBorder>
      <div className={styles.productHeader}>
        <span className={styles.productDot} style={{ background: color }} />
        <span className={styles.productLabel}>{label}</span>
      </div>
      {children}
    </Paper>
  );
}

export default function PromptBuilder() {
  const ctx = useContext(OnboardingFilterContext);
  if (ctx) return <PromptBuilderInner />;
  return (
    <OnboardingFilterProvider>
      <PromptBuilderInner />
    </OnboardingFilterProvider>
  );
}

function PromptBuilderInner() {
  const [teamKey,                setTeamKey]                = useState('');
  const [displayName,            setDisplayName]            = useState('');
  const [description,            setDescription]            = useState('');
  const [maintainers,            setMaintainers]            = useState('');
  const [members,                setMembers]                = useState('');
  const [adminEmail,             setAdminEmail]             = useState('');
  const [shareChildMaintainers,  setShareChildMaintainers]  = useState(false);
  const [googleOwners,           setGoogleOwners]           = useState('');
  const [openbaoAdmins,          setOpenbaoAdmins]          = useState('');
  const [shareRegistryOwners,    setShareRegistryOwners]    = useState(false);
  const [authentikAdmins,        setAuthentikAdmins]        = useState('');
  const [agentgatewayAdmins,     setAgentgatewayAdmins]     = useState('');
  const [enableGoogleProject,    setEnableGoogleProject]    = useState(false);
  const [enableWorkflows,        setEnableWorkflows]        = useState(false);
  const [enableStateManagement,  setEnableStateManagement]  = useState(false);
  const [googleProjectServices,  setGoogleProjectServices]  = useState('');
  const [githubRepositories,     setGithubRepositories]     = useState('');
  // platform_managed_project
  const [enableCloudSQL,         setEnableCloudSQL]         = useState(false);
  const [cloudSqlVersion,        setCloudSqlVersion]        = useState('');
  const [cloudSqlTier,           setCloudSqlTier]           = useState('');
  const [cloudSqlRegions,        setCloudSqlRegions]        = useState([]);
  const [enableKubernetes,       setEnableKubernetes]       = useState(false);
  const [gkeLocations,           setGkeLocations]           = useState([]);
  const [gkeDnsSubdomain,        setGkeDnsSubdomain]        = useState('');
  const [copyStatus,             setCopyStatus]             = useState('idle');
  const [copyAttempted,          setCopyAttempted]          = useState(false);

  const { showOptional } = useOnboardingFilter();

  const normalizedKey = normalizeTeamKey(teamKey);

  const fields = {
    teamKey: normalizedKey,
    displayName, description, maintainers, members, adminEmail,
    shareChildMaintainers, googleOwners, openbaoAdmins, shareRegistryOwners,
    authentikAdmins, agentgatewayAdmins,
    enableGoogleProject, enableWorkflows, enableStateManagement,
    googleProjectServices, githubRepositories,
    enableCloudSQL, cloudSqlVersion, cloudSqlTier, cloudSqlRegions,
    enableKubernetes, gkeLocations, gkeDnsSubdomain,
  };

  const errors = validate(fields, teamSchema, copyAttempted);

  const hasErrors = Object.keys(errors).length > 0;

  const prompt = buildPrompt(fields, teamSchema);
  const promptRef = useRef(prompt);
  promptRef.current = prompt;

  useEffect(() => {
    setCopyStatus('idle');
  }, [prompt]);

  const handleCopy = async () => {
    setCopyAttempted(true);
    const currentErrors = validate(fields, teamSchema, true);
    if (Object.keys(currentErrors).length > 0) return;
    if (!navigator.clipboard?.writeText) {
      setCopyStatus('unavailable');
      return;
    }
    const promptToCopy = prompt;
    try {
      await navigator.clipboard.writeText(promptToCopy);
      if (promptRef.current === promptToCopy) setCopyStatus('success');
    } catch {
      if (promptRef.current === promptToCopy) setCopyStatus('error');
    }
  };

  return (
    <div className={styles.builder}>
      <div className={styles.form}>

        <FilterBar requiredCount={REQUIRED_COUNT} optionalCount={OPTIONAL_COUNT} />

        {/* ── General ── */}
        <ProductGroup color="#ffb400" label="General">
          <div className={styles.section}>
            <TextInput
              id="pb-team-key"
              classNames={{ input: styles.fieldInput, label: styles.label, description: styles.hint, error: styles.fieldError }}
              label="Team key"
              description={schema.team_key.description}
              error={errors.teamKey}
              value={teamKey}
              onChange={e => setTeamKey(e.target.value)}
              placeholder="st-fides"
            />
          </div>

          <div className={styles.section}>
            <TextInput
              id="pb-display-name"
              classNames={{ input: styles.fieldInput, label: styles.label, description: styles.hint, error: styles.fieldError }}
              label="Display name"
              description={schema.display_name.description}
              error={errors.displayName}
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Fides"
            />
          </div>

          <div className={styles.section}>
            <Textarea
              id="pb-description"
              classNames={{ input: styles.fieldInput, label: styles.label, description: styles.hint, error: styles.fieldError }}
              label={<>Description <span className={styles.required}>required</span></>}
              description={schema.display_name_comment.description}
              error={errors.description}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Trust and reliability for the platform."
              rows={2}
            />
          </div>

        </ProductGroup>

        {/* ── GitHub ── */}
        <ProductGroup color="#8b949e" label="GitHub">
          <div className={styles.section}>
            <Textarea
              id="pb-maintainers"
              classNames={{ input: styles.fieldInput, label: styles.label, description: styles.hint, error: styles.fieldError }}
              label={<>Maintainers <span className={styles.required}>required</span></>}
              description={schema.github_parent_team_memberships.description}
              error={errors.maintainers}
              value={maintainers}
              onChange={e => setMaintainers(e.target.value)}
              placeholder="brettcurtis"
              rows={2}
            />
          </div>

          <div className={styles.section}>
            <Switch
              label="Use these maintainers for all four required child teams"
              description={schema.github_child_teams_memberships.description}
              checked={shareChildMaintainers}
              onChange={e => setShareChildMaintainers(e.target.checked)}
            />
            {errors.shareChildMaintainers && <p className={styles.fieldError} role="alert">{errors.shareChildMaintainers}</p>}
          </div>

          {showOptional && (
            <>
              <div className={styles.section}>
                <Textarea
                  id="pb-members"
                  classNames={{ input: styles.fieldInput, label: styles.label, description: styles.hint, error: styles.fieldError }}
                  label={<>Members <span className={styles.optional}>optional</span></>}
                  description={defs.usernameList.description}
                  error={errors.members}
                  value={members}
                  onChange={e => setMembers(e.target.value)}
                  placeholder="joesmith, janesmith"
                  rows={2}
                />
              </div>

              <div className={styles.section}>
                <Textarea
                  id="pb-repos"
                  classNames={{ input: styles.fieldInput, label: styles.label, description: styles.hint, error: styles.fieldError }}
                  label={<>Repositories <span className={styles.optional}>optional</span></>}
                  description={schema.github_repositories.description}
                  error={errors.githubRepositories}
                  value={githubRepositories}
                  onChange={e => setGithubRepositories(e.target.value)}
                  placeholder={normalizedKey ? `${normalizedKey}, ${normalizedKey}-api` : 'st-fides, st-fides-api'}
                  rows={2}
                />
              </div>
            </>
          )}
        </ProductGroup>

        <ProductGroup color="#4285F4" label="Google group ownership">
          <div className={styles.section}>
            <Textarea
              id="pb-google-owners"
              classNames={{ input: styles.fieldInput, label: styles.label, description: styles.hint, error: styles.fieldError }}
              label={<>Owners for every basic group in all environments <span className={styles.required}>required</span></>}
              description={schema.google_basic_groups_env_memberships.description}
              error={errors.googleOwners}
              value={googleOwners}
              onChange={e => setGoogleOwners(e.target.value)}
              placeholder="owner@osinfra.io"
              rows={2}
            />
          </div>
          {enableKubernetes && (
            <div className={styles.section}>
              <Switch
                label="Use the Google group owners above for both Artifact Registry groups"
                description={defs.kubernetesEngine.properties.artifact_registry_groups_memberships.description}
                checked={shareRegistryOwners}
                onChange={e => setShareRegistryOwners(e.target.checked)}
              />
              {errors.shareRegistryOwners && <p className={styles.fieldError} role="alert">{errors.shareRegistryOwners}</p>}
            </div>
          )}
        </ProductGroup>

        <ProductGroup color="#f0c85a" label="authentik and OpenBao">
          <div className={styles.section}>
            <Textarea
              id="pb-openbao-admins"
              classNames={{ input: styles.fieldInput, label: styles.label, description: styles.hint, error: styles.fieldError }}
              label={<>OpenBao administrators in every environment <span className={styles.required}>required</span></>}
              description={defs.openbaoAdminGroup.description}
              error={errors.openbaoAdmins}
              value={openbaoAdmins}
              onChange={e => setOpenbaoAdmins(e.target.value)}
              placeholder="admin@osinfra.io"
              rows={2}
            />
          </div>
          {normalizedKey === 'pt-pneuma' && (
            <>
              <div className={styles.section}>
                <Textarea
                  id="pb-authentik-admins"
                  classNames={{ input: styles.fieldInput, label: styles.label, description: styles.hint, error: styles.fieldError }}
                  label={<>authentik administrators in every environment <span className={styles.required}>required</span></>}
                  description={defs.requiredAuthentikAdminGroup.description}
                  error={errors.authentikAdmins}
                  value={authentikAdmins}
                  onChange={e => setAuthentikAdmins(e.target.value)}
                  rows={2}
                />
              </div>
              <div className={styles.section}>
                <Textarea
                  id="pb-agentgateway-admins"
                  classNames={{ input: styles.fieldInput, label: styles.label, description: styles.hint, error: styles.fieldError }}
                  label="agentgateway administrators in every environment (empty membership allowed)"
                  description={schema.authentik_groups.description}
                  error={errors.agentgatewayAdmins}
                  value={agentgatewayAdmins}
                  onChange={e => setAgentgatewayAdmins(e.target.value)}
                  rows={2}
                />
              </div>
            </>
          )}
        </ProductGroup>

        {/* ── Google Cloud ── */}
        {showOptional && (
          <ProductGroup color="#4285F4" label="Google Cloud">
            <div className={styles.section}>
              <p className={styles.label}>Features <span className={styles.optional}>optional</span></p>
              <div className={styles.checkboxGroup}>
                <Switch
                  label={<code>enable_google_project</code>}
                  description={schema.enable_google_project.description}
                  checked={enableGoogleProject}
                  onChange={e => setEnableGoogleProject(e.target.checked)}
                />
                <Switch
                  label={<code>enable_workflows</code>}
                  description={schema.enable_workflows.description}
                  checked={enableWorkflows}
                  onChange={e => setEnableWorkflows(e.target.checked)}
                />
                <Switch
                  label={<code>enable_opentofu_state_management</code>}
                  description={schema.enable_opentofu_state_management.description}
                  checked={enableStateManagement}
                  disabled={!enableWorkflows}
                  onChange={e => setEnableStateManagement(e.target.checked)}
                />
              </div>
            </div>

            <div className={styles.section}>
              <label className={styles.label} htmlFor="pb-gcp-apis">Additional APIs <span className={styles.optional}>optional</span></label>
              <p className={styles.hint} id="pb-gcp-apis-description">{schema.google_project_services.description}</p>
              <ApiAutocomplete
                value={googleProjectServices}
                onChange={setGoogleProjectServices}
              />
              {errors.googleProjectServices && <p className={styles.fieldError}>{errors.googleProjectServices}</p>}
            </div>

            {/* platform_managed_project.cloud_sql */}
            <div className={styles.section}>
              <p className={styles.label}>Cloud SQL <span className={styles.optional}>optional</span></p>
              <Switch
                label={<>Enable <code>platform_managed_project.cloud_sql</code></>}
                description={defs.cloudSQL.description}
                checked={enableCloudSQL}
                aria-controls="pb-cloud-sql-fields"
                aria-expanded={enableCloudSQL}
                onChange={e => setEnableCloudSQL(e.target.checked)}
              />
              <Collapse expanded={enableCloudSQL}>
                {enableCloudSQL && (
                  <div className={styles.subFields} id="pb-cloud-sql-fields">
                    <Select
                      classNames={{ input: styles.fieldInput, label: styles.label, description: styles.hint }}
                      label={<>Database version <span className={styles.required}>required</span></>}
                      description={defs.cloudSQL.properties.database_version.description}
                      data={SQL_VERSIONS}
                      value={cloudSqlVersion || null}
                      onChange={value => setCloudSqlVersion(value || '')}
                      placeholder="— select —"
                      allowDeselect={false}
                    />
                    <Autocomplete
                      classNames={{ input: styles.fieldInput, label: styles.label, description: styles.hint }}
                      label={<>Machine tier <span className={styles.required}>required</span></>}
                      description={defs.cloudSQL.properties.machine_tier.description}
                      data={SQL_TIERS}
                      value={cloudSqlTier}
                      onChange={setCloudSqlTier}
                      placeholder="db-g1-small"
                    />
                    <MultiSelect
                      classNames={{ input: styles.fieldInput, label: styles.label, description: styles.hint }}
                      label={<>Regions <span className={styles.required}>required</span></>}
                      description={defs.cloudSQL.properties.regions.description}
                      data={SQL_REGIONS}
                      value={cloudSqlRegions}
                      onChange={setCloudSqlRegions}
                      searchable
                      clearable={false}
                    />
                  </div>
                )}
              </Collapse>
            </div>

            {/* platform_managed_project.kubernetes_engine */}
            <div className={styles.section}>
              <p className={styles.label}>Kubernetes Engine <span className={styles.optional}>optional</span></p>
              <Switch
                label={<>Enable <code>platform_managed_project.kubernetes_engine</code></>}
                description={defs.kubernetesEngine.description}
                checked={enableKubernetes}
                aria-controls="pb-kubernetes-fields"
                aria-expanded={enableKubernetes}
                onChange={e => setEnableKubernetes(e.target.checked)}
              />
              <Collapse expanded={enableKubernetes}>
                {enableKubernetes && (
                  <div className={styles.subFields} id="pb-kubernetes-fields">
                    <MultiSelect
                      classNames={{ input: styles.fieldInput, label: styles.label, description: styles.hint }}
                      label={<>Locations (zones) <span className={styles.required}>required</span></>}
                      description={defs.kubernetesEngine.properties.locations.description}
                      data={GKE_ZONES}
                      value={gkeLocations}
                      onChange={setGkeLocations}
                      searchable
                      clearable={false}
                    />
                    <TextInput
                      id="pb-gke-dns"
                      classNames={{ input: styles.fieldInput, label: styles.label, description: styles.hint }}
                      label={<>DNS subdomain <span className={styles.optional}>optional</span></>}
                      description={defs.kubernetesEngine.properties.dns_subdomain.description}
                      value={gkeDnsSubdomain}
                      onChange={e => setGkeDnsSubdomain(e.target.value)}
                      placeholder="fides"
                    />
                  </div>
                )}
              </Collapse>
            </div>
          </ProductGroup>
        )}

        {/* ── Datadog ── */}
        <ProductGroup color="#632CA6" label="Datadog">
          <div className={styles.section}>
            <TextInput
              id="pb-admin-email"
              classNames={{ input: styles.fieldInput, label: styles.label, description: styles.hint, error: styles.fieldError }}
              label={<>Admin email <span className={styles.required}>required</span></>}
              description={schema.datadog_team_memberships.description}
              error={errors.adminEmail}
              type="email"
              value={adminEmail}
              onChange={e => setAdminEmail(e.target.value)}
              placeholder="joe@osinfra.io"
            />
          </div>

        </ProductGroup>

      </div>

      <div className={styles.preview}>
        <div className={styles.previewHeader}>
          <span className={styles.previewTitle}>Generated prompt</span>
          <ActionIcon
            className={styles.copyBtn}
            variant="transparent"
            color={copyStatus === 'success' ? 'green' : 'gray'}
            size="md"
            onClick={handleCopy}
            disabled={hasErrors}
            aria-label="Copy prompt"
            type="button"
            title={hasErrors ? 'Fix validation errors before copying' : copyStatus === 'success' ? 'Copied' : 'Copy prompt'}
          >
            {copyStatus === 'success' ? <IconCheck size={18} aria-hidden="true" /> : <IconCopy size={18} aria-hidden="true" />}
          </ActionIcon>
        </div>
        <pre className={styles.previewBody}>{prompt}</pre>
        {copyStatus === 'success' && (
          <Alert className={styles.copyAlert} color="green" role="status">
            Prompt copied to clipboard.
          </Alert>
        )}
        {copyStatus === 'error' && (
          <Alert className={styles.copyAlert} color="red" role="alert">
            Could not copy to clipboard. Check browser permissions and copy the prompt below manually.
          </Alert>
        )}
        {copyStatus === 'unavailable' && (
          <Alert className={styles.copyAlert} color="yellow" role="alert">
            Clipboard access is unavailable. Copy the prompt below manually.
          </Alert>
        )}
      </div>
    </div>
  );
}
