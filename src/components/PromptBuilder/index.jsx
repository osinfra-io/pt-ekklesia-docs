import { useMemo, useState, useContext } from 'react';
import teamSchema from '@site/src/components/SchemaViewer/team.schema.json';
import { useOnboardingFilter, FilterBar, OnboardingFilterContext, OnboardingFilterProvider } from '@site/src/components/OnboardingFilter';
import SchemaForm from './SchemaForm';
import { buildPrompt, createInitialConfig, getTopLevelFieldCounts, validateConfig } from './schemaSupport.mjs';
import styles from './styles.module.css';

const { required: REQUIRED_COUNT, optional: OPTIONAL_COUNT } = getTopLevelFieldCounts(teamSchema);

export default function PromptBuilder() {
  const context = useContext(OnboardingFilterContext);
  if (context) return <PromptBuilderInner />;
  return (
    <OnboardingFilterProvider>
      <PromptBuilderInner />
    </OnboardingFilterProvider>
  );
}

function PromptBuilderInner() {
  const [config, setConfig] = useState(() => createInitialConfig(teamSchema));
  const [copied, setCopied] = useState(false);
  const [copyAttempted, setCopyAttempted] = useState(false);
  const [copyError, setCopyError] = useState('');
  const { showOptional } = useOnboardingFilter();

  const validation = useMemo(() => validateConfig(config, teamSchema), [config]);
  const prompt = useMemo(() => buildPrompt(config), [config]);
  const shownErrors = copyAttempted ? validation.errors : [];
  const blocked = copyAttempted && !validation.valid;

  const handleConfigChange = nextConfig => {
    setConfig(nextConfig);
    setCopied(false);
    setCopyError('');
  };

  const handleCopy = async () => {
    setCopyAttempted(true);
    setCopyError('');
    if (!validation.valid) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(prompt);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = prompt;
        textarea.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
        document.body.appendChild(textarea);
        try {
          textarea.select();
          if (!document.execCommand('copy')) throw new Error('Clipboard copy command failed');
        } finally {
          textarea.remove();
        }
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError('Could not copy the prompt. Select and copy it manually.');
    }
  };

  return (
    <div className={styles.builder}>
      <div className={styles.form}>
        <FilterBar requiredCount={REQUIRED_COUNT} optionalCount={OPTIONAL_COUNT} />
        <SchemaForm
          schema={teamSchema}
          value={config}
          onChange={handleConfigChange}
          showOptional={showOptional}
          errors={shownErrors}
        />
      </div>

      <div className={styles.preview}>
        <div className={styles.previewHeader}>
          <span className={styles.previewTitle}>Generated prompt</span>
          <button
            className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : ''} ${blocked ? styles.copyBtnDisabled : ''}`}
            onClick={handleCopy}
            disabled={blocked}
            type="button"
            title={blocked ? 'Fix validation errors before copying' : undefined}
          >
            {copied ? '✓ Copied' : blocked ? '⚠ Fix errors' : 'Copy'}
          </button>
        </div>
        {copyError && <p className={styles.copyError} role="alert">{copyError}</p>}
        <pre className={styles.previewBody}>{prompt}</pre>
      </div>
    </div>
  );
}
