import { createContext, useContext, useState } from 'react';
import {Badge, Button, Group, Switch} from '@mantine/core';
import '@mantine/core/styles/Badge.css';
import '@mantine/core/styles/UnstyledButton.css';
import '@mantine/core/styles/Button.css';
import '@mantine/core/styles/Group.css';
import '@mantine/core/styles/InlineInput.css';
import '@mantine/core/styles/Switch.css';

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
    <Group gap="md" my="md">
      <Badge variant="outline" color="gold" size="lg">Required ({requiredCount})</Badge>
      <Switch
        checked={showOptional}
        onChange={event => setShowOptional(event.currentTarget.checked)}
        label={`Optional (${optionalCount})`}
      />
      {showOptional && (
        <Button
          variant="subtle"
          size="compact-xs"
          onClick={() => setShowOptional(false)}
        >
          Reset
        </Button>
      )}
    </Group>
  );
}
