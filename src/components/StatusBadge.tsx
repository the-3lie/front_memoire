import { classNames, getStatusBgColor, getStatusLabel } from '../utils/helpers';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={classNames('badge', getStatusBgColor(status), sizeClass)}>
      {getStatusLabel(status)}
    </span>
  );
}
