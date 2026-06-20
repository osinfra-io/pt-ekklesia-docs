import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import teamSchema from '@site/src/components/SchemaViewer/team.schema.json';
import { useOnboardingFilter, FilterBar } from '@site/src/components/OnboardingFilter';
import styles from './styles.module.css';

const schema = teamSchema.properties;
const defs = teamSchema.$defs;

// Patterns pulled directly from the schema
const TEAM_KEY_RE    = new RegExp(schema.team_key.pattern);
const DISPLAY_RE     = new RegExp(schema.display_name.pattern);
const USERNAME_RE    = new RegExp(defs.usernameList.items.pattern);
const EMAIL_RE       = new RegExp(defs.emailList.items.pattern);
const API_RE         = new RegExp(schema.google_project_services.items.pattern);

const REQUIRED_COUNT = 4;
const OPTIONAL_COUNT = 10;

function parseList(raw) {
  return raw.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
}

function normalizeTeamKey(raw) {
  return raw.trim().toLowerCase();
}

function validate(fields) {
  const errors = {};

  if (fields.teamKey && !TEAM_KEY_RE.test(fields.teamKey)) {
    errors.teamKey = 'Must match pattern: (pt|st|ct|et)-<slug>, e.g. st-fides';
  }

  if (fields.displayName && !DISPLAY_RE.test(fields.displayName)) {
    errors.displayName = 'Title Case required, e.g. "Fides" or "Trust and Safety"';
  }

  if (fields.maintainers) {
    const bad = parseList(fields.maintainers).filter(u => !USERNAME_RE.test(u));
    if (bad.length) errors.maintainers = `Invalid username(s): ${bad.join(', ')}`;
  }

  if (fields.adminEmail && !EMAIL_RE.test(fields.adminEmail.trim())) {
    errors.adminEmail = 'Must be a valid email address';
  }

  if (fields.members) {
    const bad = parseList(fields.members).filter(u => !USERNAME_RE.test(u));
    if (bad.length) errors.members = `Invalid username(s): ${bad.join(', ')}`;
  }

  if (fields.googleProjectServices) {
    const bad = parseList(fields.googleProjectServices).filter(a => !API_RE.test(a));
    if (bad.length) errors.googleProjectServices = `Must end in .googleapis.com, e.g. run.googleapis.com`;
  }

  return errors;
}

function buildPrompt(f) {
  const lines = [];

  const heading = f.displayName || f.teamKey;
  lines.push(heading ? `Onboard a new team — ${heading}.` : 'Onboard a new team.');
  lines.push('');

  if (f.teamKey)     lines.push(`Team key: ${f.teamKey}`);
  if (f.displayName) lines.push(`Display name: ${f.displayName}`);
  if (f.description) lines.push(`Description: ${f.description}`);

  lines.push('');

  const maintainers = parseList(f.maintainers);
  const members     = parseList(f.members);

  lines.push(`Maintainers: ${maintainers.length ? maintainers.join(', ') : '(required)'}`);
  if (members.length) lines.push(`Members: ${members.join(', ')}`);

  if (f.adminEmail) lines.push(`Admin email: ${f.adminEmail.trim()}`);

  const flags = [
    f.enableGoogleProject      && 'enable_google_project',
    f.enableWorkflows          && 'enable_workflows',
    f.enableStateManagement    && 'enable_opentofu_state_management',
    f.enableProjectDatadog     && 'google_project_enable_datadog',
  ].filter(Boolean);
  if (flags.length) {
    lines.push('');
    lines.push(`Enable: ${flags.join(', ')}`);
  }

  const apis = parseList(f.googleProjectServices);
  if (apis.length) {
    lines.push(`Additional GCP APIs: ${apis.join(', ')}`);
  }

  const repos = parseList(f.githubRepositories);
  if (repos.length) {
    lines.push('');
    lines.push('GitHub repositories:');
    for (const r of repos) lines.push(`- ${r}`);
  }

  if (f.enableCloudSQL || f.enableKubernetes) {
    lines.push('');
    lines.push('Platform-managed project:');
    if (f.enableCloudSQL) {
      lines.push(`  Cloud SQL: database_version=${f.cloudSqlVersion || '(required)'}, machine_tier=${f.cloudSqlTier || '(required)'}, regions=${f.cloudSqlRegions || '(required)'}`);
    }
    if (f.enableKubernetes) {
      lines.push(`  Kubernetes Engine: locations=${f.gkeLocations || '(required)'}`);
      if (f.gkeDnsSubdomain) lines.push(`    dns_subdomain=${f.gkeDnsSubdomain}`);
      if (f.enableGkeDatadog) lines.push(`    enable_datadog_apm=true`);
    }
  }

  return lines.join('\n').trim();
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className={styles.fieldError}>⚠ {msg}</p>;
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
      // Strip consumer Google product APIs that are not GCP project services.
      const NON_GCP = /^(gmail|youtube|calendar|blogger|tasks|fitness|classroom|keep|streetviewpublish|people|contacts|chat|meet)\./;
      const names = [...new Set(
        (json.items ?? [])
          .filter(i => i.preferred && i.discoveryRestUrl)
          .map(i => i.discoveryRestUrl.split('/$discovery')[0].replace('https://', ''))
          .filter(n => n.endsWith('.googleapis.com') && !NON_GCP.test(n))
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
    const existing = parseList(value);
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
      <textarea
        ref={inputRef}
        id="pb-gcp-apis"
        className={styles.textarea}
        value={value}
        onFocus={fetchApis}
        onChange={handleInput}
        onBlur={() => setTimeout(() => setShowDrop(false), 150)}
        placeholder="run.googleapis.com, pubsub.googleapis.com"
        rows={2}
        autoComplete="off"
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
    <div className={styles.productGroup}>
      <div className={styles.productHeader}>
        <span className={styles.productDot} style={{ background: color }} />
        <span className={styles.productLabel}>{label}</span>
      </div>
      {children}
    </div>
  );
}

export default function PromptBuilder() {
  const [teamKey,                setTeamKey]                = useState('');
  const [displayName,            setDisplayName]            = useState('');
  const [description,            setDescription]            = useState('');
  const [maintainers,            setMaintainers]            = useState('');
  const [members,                setMembers]                = useState('');
  const [adminEmail,             setAdminEmail]             = useState('');
  const [enableGoogleProject,    setEnableGoogleProject]    = useState(false);
  const [enableWorkflows,        setEnableWorkflows]        = useState(false);
  const [enableStateManagement,  setEnableStateManagement]  = useState(false);
  const [enableProjectDatadog,   setEnableProjectDatadog]   = useState(false);
  const [googleProjectServices,  setGoogleProjectServices]  = useState('');
  const [githubRepositories,     setGithubRepositories]     = useState('');
  // platform_managed_project
  const [enableCloudSQL,         setEnableCloudSQL]         = useState(false);
  const [cloudSqlVersion,        setCloudSqlVersion]        = useState('');
  const [cloudSqlTier,           setCloudSqlTier]           = useState('');
  const [cloudSqlRegions,        setCloudSqlRegions]        = useState('');
  const [enableKubernetes,       setEnableKubernetes]       = useState(false);
  const [gkeLocations,           setGkeLocations]           = useState('');
  const [gkeDnsSubdomain,        setGkeDnsSubdomain]        = useState('');
  const [enableGkeDatadog,       setEnableGkeDatadog]       = useState(false);
  const [copied,                 setCopied]                 = useState(false);

  const { showOptional } = useOnboardingFilter();

  const normalizedKey = normalizeTeamKey(teamKey);

  const fields = {
    teamKey: normalizedKey,
    displayName, description, maintainers, members, adminEmail,
    enableGoogleProject, enableWorkflows, enableStateManagement,
    enableProjectDatadog, googleProjectServices, githubRepositories,
    enableCloudSQL, cloudSqlVersion, cloudSqlTier, cloudSqlRegions,
    enableKubernetes, gkeLocations, gkeDnsSubdomain, enableGkeDatadog,
  };

  const errors = useMemo(() => validate(fields), [
    normalizedKey, displayName, maintainers, adminEmail, members, googleProjectServices,
  ]);

  const hasErrors = Object.keys(errors).length > 0;

  const prompt = buildPrompt(fields);

  const handleCopy = () => {
    const onSuccess = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(prompt).then(onSuccess).catch(() => setCopied(false));
    } else {
      try {
        const ta = document.createElement('textarea');
        ta.value = prompt;
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        onSuccess();
      } catch {
        setCopied(false);
      }
    }
  };

  return (
    <div className={styles.builder}>
      <div className={styles.form}>

        <FilterBar requiredCount={REQUIRED_COUNT} optionalCount={OPTIONAL_COUNT} />

        {/* ── General ── */}
        <ProductGroup color="#ffb400" label="General">
          <div className={styles.section}>
            <label className={styles.label} htmlFor="pb-team-key">Team key</label>
            <p className={styles.hint}>{schema.team_key.description}</p>
            <input
              id="pb-team-key"
              className={`${styles.input} ${errors.teamKey ? styles.inputError : ''}`}
              value={teamKey}
              onChange={e => setTeamKey(e.target.value)}
              placeholder="st-fides"
            />
            <FieldError msg={errors.teamKey} />
          </div>

          <div className={styles.section}>
            <label className={styles.label} htmlFor="pb-display-name">Display name</label>
            <p className={styles.hint}>{schema.display_name.description}</p>
            <input
              id="pb-display-name"
              className={`${styles.input} ${errors.displayName ? styles.inputError : ''}`}
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Fides"
            />
            <FieldError msg={errors.displayName} />
          </div>

          {showOptional && (
            <div className={styles.section}>
              <label className={styles.label} htmlFor="pb-description">
                Description <span className={styles.optional}>optional</span>
              </label>
              <p className={styles.hint}>{schema.display_name_comment.description}</p>
              <textarea
                id="pb-description"
                className={styles.textarea}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Trust and reliability for the platform."
                rows={2}
              />
            </div>
          )}
        </ProductGroup>

        {/* ── GitHub ── */}
        <ProductGroup color="#8b949e" label="GitHub">
          <div className={styles.section}>
            <label className={styles.label} htmlFor="pb-maintainers">
              Maintainers <span className={styles.required}>required</span>
            </label>
            <p className={styles.hint}>{schema.github_parent_team_memberships.description}</p>
            <textarea
              id="pb-maintainers"
              className={`${styles.textarea} ${errors.maintainers ? styles.inputError : ''}`}
              value={maintainers}
              onChange={e => setMaintainers(e.target.value)}
              placeholder="brettcurtis"
              rows={2}
            />
            <FieldError msg={errors.maintainers} />
          </div>

          {showOptional && (
            <>
              <div className={styles.section}>
                <label className={styles.label} htmlFor="pb-members">
                  Members <span className={styles.optional}>optional</span>
                </label>
                <p className={styles.hint}>Optional additional GitHub usernames. Can be added or changed later via the Nomos Agent.</p>
                <textarea
                  id="pb-members"
                  className={`${styles.textarea} ${errors.members ? styles.inputError : ''}`}
                  value={members}
                  onChange={e => setMembers(e.target.value)}
                  placeholder="joesmith, janesmith"
                  rows={2}
                />
                <FieldError msg={errors.members} />
              </div>

              <div className={styles.section}>
                <label className={styles.label} htmlFor="pb-repos">
                  Repositories <span className={styles.optional}>optional</span>
                </label>
                <p className={styles.hint}>{schema.github_repositories.description} One repository name per line.</p>
                <textarea
                  id="pb-repos"
                  className={styles.textarea}
                  value={githubRepositories}
                  onChange={e => setGithubRepositories(e.target.value)}
                  placeholder="st-fides-api"
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
              <label className={styles.label}>
                Features <span className={styles.optional}>optional</span>
              </label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={enableGoogleProject} onChange={e => setEnableGoogleProject(e.target.checked)} />
                  <span><code>enable_google_project</code> — {schema.enable_google_project.description}</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={enableWorkflows} onChange={e => setEnableWorkflows(e.target.checked)} />
                  <span><code>enable_workflows</code> — {schema.enable_workflows.description}</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={enableStateManagement}
                    disabled={!enableWorkflows}
                    onChange={e => setEnableStateManagement(e.target.checked)}
                  />
                  <span style={{opacity: enableWorkflows ? 1 : 0.45}}>
                    <code>enable_opentofu_state_management</code> — {schema.enable_opentofu_state_management.description}
                  </span>
                </label>
              </div>
            </div>

            <div className={styles.section}>
              <label className={styles.label} htmlFor="pb-gcp-apis">
                Additional APIs <span className={styles.optional}>optional</span>
              </label>
              <p className={styles.hint}>{schema.google_project_services.description} Type to search, select to add.</p>
              <ApiAutocomplete
                value={googleProjectServices}
                onChange={setGoogleProjectServices}
              />
              <FieldError msg={errors.googleProjectServices} />
            </div>

            {/* platform_managed_project.cloud_sql */}
            <div className={styles.section}>
              <label className={styles.label}>
                Cloud SQL <span className={styles.optional}>optional</span>
              </label>
              <p className={styles.hint}>{defs.cloudSQL.description}</p>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={enableCloudSQL} onChange={e => setEnableCloudSQL(e.target.checked)} />
                <span>Enable <code>platform_managed_project.cloud_sql</code></span>
              </label>
              {enableCloudSQL && (
                <div className={styles.subFields}>
                  <div className={styles.subField}>
                    <label className={styles.subLabel} htmlFor="pb-sql-version">Database version <span className={styles.required}>required</span></label>
                    <input
                      id="pb-sql-version"
                      className={styles.input}
                      value={cloudSqlVersion}
                      onChange={e => setCloudSqlVersion(e.target.value)}
                      placeholder="POSTGRES_16"
                    />
                  </div>
                  <div className={styles.subField}>
                    <label className={styles.subLabel} htmlFor="pb-sql-tier">Machine tier <span className={styles.required}>required</span></label>
                    <input
                      id="pb-sql-tier"
                      className={styles.input}
                      value={cloudSqlTier}
                      onChange={e => setCloudSqlTier(e.target.value)}
                      placeholder="db-g1-small"
                    />
                  </div>
                  <div className={styles.subField}>
                    <label className={styles.subLabel} htmlFor="pb-sql-regions">Regions <span className={styles.required}>required</span></label>
                    <input
                      id="pb-sql-regions"
                      className={styles.input}
                      value={cloudSqlRegions}
                      onChange={e => setCloudSqlRegions(e.target.value)}
                      placeholder="us-east1, us-east4"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* platform_managed_project.kubernetes_engine */}
            <div className={styles.section}>
              <label className={styles.label}>
                Kubernetes Engine <span className={styles.optional}>optional</span>
              </label>
              <p className={styles.hint}>{defs.kubernetesEngine.description}</p>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={enableKubernetes} onChange={e => setEnableKubernetes(e.target.checked)} />
                <span>Enable <code>platform_managed_project.kubernetes_engine</code></span>
              </label>
              {enableKubernetes && (
                <div className={styles.subFields}>
                  <div className={styles.subField}>
                    <label className={styles.subLabel} htmlFor="pb-gke-locations">Locations (zones) <span className={styles.required}>required</span></label>
                    <input
                      id="pb-gke-locations"
                      className={styles.input}
                      value={gkeLocations}
                      onChange={e => setGkeLocations(e.target.value)}
                      placeholder="us-east1-b, us-east1-c"
                    />
                  </div>
                  <div className={styles.subField}>
                    <label className={styles.subLabel} htmlFor="pb-gke-dns">DNS subdomain <span className={styles.optional}>optional</span></label>
                    <input
                      id="pb-gke-dns"
                      className={styles.input}
                      value={gkeDnsSubdomain}
                      onChange={e => setGkeDnsSubdomain(e.target.value)}
                      placeholder="fides"
                    />
                  </div>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={enableGkeDatadog} onChange={e => setEnableGkeDatadog(e.target.checked)} />
                    <span><code>enable_datadog_apm</code> — {defs.kubernetesEngine.properties.enable_datadog_apm.description}</span>
                  </label>
                </div>
              )}
            </div>
          </ProductGroup>
        )}

        {/* ── Datadog ── */}
        <ProductGroup color="#632CA6" label="Datadog">
          <div className={styles.section}>
            <label className={styles.label} htmlFor="pb-admin-email">
              Admin email <span className={styles.required}>required</span>
            </label>
            <p className={styles.hint}>{schema.datadog_team_memberships.description} Also becomes the owner of the Google Cloud Identity admin group.</p>
            <input
              id="pb-admin-email"
              className={`${styles.input} ${errors.adminEmail ? styles.inputError : ''}`}
              type="email"
              value={adminEmail}
              onChange={e => setAdminEmail(e.target.value)}
              placeholder="joe@osinfra.io"
            />
            <FieldError msg={errors.adminEmail} />
          </div>

          {showOptional && (
            <div className={styles.section}>
              <label className={styles.label}>
                Features <span className={styles.optional}>optional</span>
              </label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={enableProjectDatadog} onChange={e => setEnableProjectDatadog(e.target.checked)} />
                  <span><code>google_project_enable_datadog</code> — {schema.google_project_enable_datadog.description}</span>
                </label>
              </div>
            </div>
          )}
        </ProductGroup>

      </div>

      <div className={styles.preview}>
        <div className={styles.previewHeader}>
          <span className={styles.previewTitle}>Generated prompt</span>
          <button
            className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : ''} ${hasErrors ? styles.copyBtnDisabled : ''}`}
            onClick={hasErrors ? undefined : handleCopy}
            disabled={hasErrors}
            type="button"
            title={hasErrors ? 'Fix validation errors before copying' : undefined}
          >
            {copied ? '✓ Copied' : hasErrors ? '⚠ Fix errors' : 'Copy'}
          </button>
        </div>
        <pre className={styles.previewBody}>{prompt}</pre>
      </div>
    </div>
  );
}
