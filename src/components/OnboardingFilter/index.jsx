import { createContext, useContext, useState } from 'react';
import styles from './styles.module.css';

export const OnboardingFilterContext = createContext(null);

export function OnboardingFilterProvider({ children }) {
  const [showOptional, setShowOptional] = useState(false);
  return (
    <OnboardingFilterContext.Provider value={{ showOptional, setShowOptional }}>
      {children}
    </OnboardingFilterContext.Provider>
  );
}

export function useOnboardingFilter() {
  const ctx = useContext(OnboardingFilterContext);
  // Always call useState so hooks are unconditional (Rules of Hooks compliant).
  // If a provider is present ctx wins; otherwise local state is used so
  // the component still works standalone.
  const [localShowOptional, setLocalShowOptional] = useState(false);
  return ctx ?? { showOptional: localShowOptional, setShowOptional: setLocalShowOptional };
}

export function FilterBar({ requiredCount, optionalCount }) {
  const { showOptional, setShowOptional } = useOnboardingFilter();
  return (
    <div className={styles.filterBar}>
      <span className={styles.filterLabel}>Filter:</span>
      <span className={`${styles.pill} ${styles.pillRequired}`} aria-label={`Required fields (${requiredCount})`}>
        ✓ Required ({requiredCount})
      </span>
      <button
        type="button"
        aria-pressed={showOptional}
        onClick={() => setShowOptional(v => !v)}
        className={`${styles.pill} ${styles.pillOptional} ${showOptional ? styles.pillActive : ''}`}
      >
        {showOptional ? '✓' : '○'} Optional ({optionalCount})
      </button>
      {showOptional && (
        <button
          type="button"
          onClick={() => setShowOptional(false)}
          className={styles.reset}
        >
          Reset
        </button>
      )}
    </div>
  );
}
