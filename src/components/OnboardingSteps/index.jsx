import {Timeline} from '@mantine/core';
import {IconClipboardList, IconMessageCircle, IconRocket} from '@tabler/icons-react';
import '@mantine/core/styles/Timeline.css';

const steps = [
  [IconClipboardList, 'Collect your details', 'Gather the team key, display name, purpose, GitHub usernames, and administrator email.'],
  [IconMessageCircle, 'Build your prompt', 'Use the prompt builder below, then paste the generated text straight into the Nomos Agent.'],
  [IconRocket, 'Review and promote', 'Review the proposed pull request. Logos creates the team foundation; optional Corpus or Pneuma changes follow their own promotion workflows.'],
];

export default function OnboardingSteps() {
  return (
    <Timeline
      active={-1}
      bulletSize={30}
      role="list"
      aria-label="Onboarding workflow"
      my="xl"
      styles={{itemBullet: {background: 'transparent', borderColor: 'transparent', color: 'var(--ifm-color-primary)'}}}
    >
      {steps.map(([Icon, title, description]) => (
        <Timeline.Item key={title} title={title} role="listitem" bullet={<Icon size={18} aria-hidden="true" />}>
          <p style={{margin: 0}}>{description}</p>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}
