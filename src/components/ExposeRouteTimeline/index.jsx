import {
  IconGitPullRequest,
  IconMessageCirclePlus,
  IconRoute,
  IconServer,
  IconShieldLock,
} from '@tabler/icons-react';
import GettingStartedTimeline from '../GettingStartedTimeline';

const steps = [
  {
    icon: <IconMessageCirclePlus aria-hidden="true" size={18} stroke={1.75} />,
    title: 'Ask Nomos',
    description: 'Describe your service, route, and who should be allowed to call it.',
  },
  {
    icon: <IconGitPullRequest aria-hidden="true" size={18} stroke={1.75} />,
    title: 'Review the Logos pull request',
    description: 'Nomos validates your request and opens a pull request for you to review and merge.',
  },
  {
    icon: <IconRoute aria-hidden="true" size={18} stroke={1.75} />,
    title: 'Pneuma renders routing and authentication',
    description: 'The next Pneuma pipeline run renders the route and authentication policy.',
  },
  {
    icon: <IconShieldLock aria-hidden="true" size={18} stroke={1.75} />,
    title: 'The shared gateway enforces access',
    description: 'The gateway applies your authentication mode and access rules.',
  },
  {
    icon: <IconServer aria-hidden="true" size={18} stroke={1.75} />,
    title: 'Requests reach your service',
    description: 'Allowed requests are forwarded to your workload Service.',
  },
];

export default function ExposeRouteTimeline() {
  return <GettingStartedTimeline steps={steps} label="Five steps to expose and protect a route" />;
}
