import { getNiveauBgColor } from '../utils/helpers';

interface NiveauBarProps {
  niveau: number;
  showLabel?: boolean;
}

export default function NiveauBar({ niveau, showLabel = true }: NiveauBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getNiveauBgColor(niveau)}`}
          style={{ width: `${Math.min(niveau, 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-semibold text-dark-700 dark:text-dark-300 min-w-[3ch]">
          {niveau}%
        </span>
      )}
    </div>
  );
}
