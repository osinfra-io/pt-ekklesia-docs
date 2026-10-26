import { Timeline } from '@mantine/core';
import {
  IconCircleCheck,
  IconGitMerge,
  IconMessageCirclePlus,
  IconUserPlus,
} from '@tabler/icons-react';
import '@mantine/core/styles/Timeline.css';

import styles from './styles.module.css';

const defaultSteps = [
  {
    icon: <IconUserPlus aria-hidden="true" size={18} stroke={1.75} />,
    title: 'Onboard with Nomos',
    description: 'Share your team details and tell Nomos which capabilities you need.',
  },
  {
    icon: <IconMessageCirclePlus aria-hidden="true" size={18} stroke={1.75} />,
    title: 'Request capabilities',
    description: 'Nomos opens pull requests for the platform capabilities your team requests.',
  },
  {
    icon: <IconGitMerge aria-hidden="true" size={18} stroke={1.75} />,
    title: 'Review and merge the pull requests',
    description: 'Review each proposed change and merge the pull requests.',
  },
  {
    icon: <IconCircleCheck aria-hidden="true" size={18} stroke={1.75} />,
    title: 'Verify the capability',
    description: 'Confirm the requested capability is ready for your team.',
  },
];

export default function GettingStartedTimeline({
  steps = defaultSteps,
  label = 'Four steps to use the platform',
}) {
  return (
    <Timeline
      active={-1}
      aria-label={label}
      className={styles.timeline}
      bulletSize={30}
      lineWidth={2}
      role="list"
      styles={{
        itemBullet: {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          color: 'var(--ifm-color-primary)',
          fontWeight: 700,
        },
      }}
    >
      {steps.map((step) => (
        <Timeline.Item
          key={step.title}
          bullet={step.icon}
          role="listitem"
          title={step.title}
        >
          <p className={styles.description}>{step.description}</p>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}
