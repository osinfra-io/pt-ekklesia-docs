import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCloud,
  IconGauge,
  IconHeartHandshake,
  IconSchool,
  IconTrendingUp,
} from '@tabler/icons-react';
import styles from './styles.module.css';

const indicators = {
  approaching: {icon: IconTrendingUp, label: 'Approaching'},
  atLimit: {icon: IconGauge, label: 'At limit'},
  collaboration: {icon: IconHeartHandshake, label: 'Collaboration'},
  facilitating: {icon: IconSchool, label: 'Facilitating'},
  high: {icon: IconAlertTriangle, label: 'High'},
  low: {icon: IconCircleCheck, label: 'Low'},
  medium: {icon: IconGauge, label: 'Medium'},
  overLimit: {icon: IconAlertTriangle, label: 'Over limit'},
  withinLimit: {icon: IconCircleCheck, label: 'Within limit'},
  xAsAService: {icon: IconCloud, label: 'X-as-a-Service'},
};

export default function StatusIndicator({status, children}) {
  const indicator = indicators[status];
  if (!indicator) throw new Error(`Unknown status indicator: ${status}`);

  const Icon = indicator.icon;

  return (
    <span className={`${styles.indicator} status-indicator`}>
      <Icon aria-hidden="true" size={18} stroke={1.75} />
      <span>
        {indicator.label}
        {children && <> — {children}</>}
      </span>
    </span>
  );
}
