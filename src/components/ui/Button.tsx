import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'cyan'
    | 'emerald'
    | 'violet'
    | 'pink';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090d16] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

    const sizeClasses = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5',
    }[size];

    const variantClasses = {
      primary:
        'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] focus-visible:ring-cyan-400',
      secondary:
        'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60 focus-visible:ring-slate-400',
      outline:
        'border border-slate-700 hover:border-slate-500 bg-transparent text-slate-200 hover:bg-slate-800/40 focus-visible:ring-slate-400',
      ghost:
        'bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-slate-100 focus-visible:ring-slate-400',
      danger:
        'bg-rose-500 hover:bg-rose-400 text-white font-semibold shadow-[0_0_20px_rgba(244,63,94,0.3)] focus-visible:ring-rose-400',
      cyan: 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] focus-visible:ring-cyan-400',
      emerald:
        'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] focus-visible:ring-emerald-400',
      violet:
        'bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/40 hover:border-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.2)] focus-visible:ring-violet-400',
      pink: 'bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 border border-pink-500/40 hover:border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.2)] focus-visible:ring-pink-400',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading && (
          <div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"
            aria-hidden="true"
          />
        )}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
