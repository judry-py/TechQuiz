import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isInteractive?: boolean;
  glowColor?: 'cyan' | 'emerald' | 'violet' | 'pink' | 'none';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', isInteractive = false, glowColor = 'none', ...props }, ref) => {
    const glowClasses = {
      none: 'border-white/10 hover:border-white/20',
      cyan: 'border-cyan-500/30 hover:border-cyan-400/80 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]',
      emerald:
        'border-emerald-500/30 hover:border-emerald-400/80 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]',
      violet:
        'border-violet-500/30 hover:border-violet-400/80 hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]',
      pink: 'border-pink-500/30 hover:border-pink-400/80 hover:shadow-[0_0_30px_rgba(236,72,153,0.25)]',
    }[glowColor];

    const interactiveClasses = isInteractive
      ? 'cursor-pointer transition-all duration-300 hover:-translate-y-1 active:translate-y-0'
      : '';

    return (
      <div
        ref={ref}
        className={`bg-slate-900/60 backdrop-blur-md rounded-2xl border p-6 transition-all duration-300 ${glowClasses} ${interactiveClasses} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
