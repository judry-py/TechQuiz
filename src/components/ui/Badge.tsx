import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'scenario'
    | 'definition'
    | 'debutant'
    | 'intermediaire'
    | 'avance'
    | 'success'
    | 'danger'
    | 'warning'
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
    | 'fuchsia';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const variantClasses = {
    default: 'bg-slate-800 text-slate-300 border-slate-700/60',
    scenario:
      'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    definition: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    debutant: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    intermediaire: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    avance:
      'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40 shadow-[0_0_12px_rgba(217,70,239,0.25)]',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    danger: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    violet: 'bg-violet-500/15 text-violet-300 border-violet-500/40',
    pink: 'bg-pink-500/15 text-pink-300 border-pink-500/40',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    sky: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
    lime: 'bg-lime-500/15 text-lime-300 border-lime-500/40',
    indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40',
    orange: 'bg-orange-500/15 text-orange-300 border-orange-500/40',
    teal: 'bg-teal-500/15 text-teal-300 border-teal-500/40',
    fuchsia: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40',
  }[variant];

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border uppercase tracking-wider ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
