import React from 'react';

export interface ProgressBarProps {
  /** Direct percentage value (0-100). Use instead of current/total. */
  progress?: number;
  /** Current value (used with total to compute percentage) */
  current?: number;
  /** Total value */
  total?: number;
  colorScheme?:
    | 'cyan'
    | 'emerald'
    | 'violet'
    | 'pink'
    | 'amber'
    | 'sky'
    | 'lime'
    | 'indigo'
    | 'orange'
    | 'teal'
    | 'rose'
    | 'fuchsia';
  /** @deprecated use colorScheme */
  colorName?:
    | 'cyan'
    | 'emerald'
    | 'violet'
    | 'pink'
    | 'amber'
    | 'sky'
    | 'lime'
    | 'indigo'
    | 'orange'
    | 'teal'
    | 'rose'
    | 'fuchsia';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  current,
  total,
  colorScheme,
  colorName,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  // Resolve color
  const resolvedColor = colorScheme ?? colorName ?? 'cyan';

  // Resolve percentage
  let percentage = 0;
  if (typeof progress === 'number') {
    percentage = Math.min(100, Math.max(0, Math.round(progress)));
  } else if (typeof current === 'number' && typeof total === 'number' && total > 0) {
    percentage = Math.min(100, Math.max(0, Math.round((current / total) * 100)));
  }

  const barColor = {
    cyan: 'bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]',
    emerald: 'bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]',
    violet: 'bg-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.6)]',
    pink: 'bg-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.6)]',
    amber: 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]',
    sky: 'bg-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.6)]',
    lime: 'bg-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.6)]',
    indigo: 'bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.6)]',
    orange: 'bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.6)]',
    teal: 'bg-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.6)]',
    rose: 'bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.6)]',
    fuchsia: 'bg-fuchsia-400 shadow-[0_0_12px_rgba(232,121,249,0.6)]',
  }[resolvedColor];

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && typeof current === 'number' && typeof total === 'number' && (
        <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          <span>
            Question <span className="text-slate-100">{current}</span> sur {total}
          </span>
          <span>{percentage}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={current ?? percentage}
        aria-valuemin={0}
        aria-valuemax={total ?? 100}
        aria-label={`Progression : ${percentage}%`}
        className={`${heightClass} w-full bg-slate-800 rounded-full overflow-hidden`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
