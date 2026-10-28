import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  /** Text shown below the spinner */
  label?: string;
  /** Alias for label */
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
  text,
  className = '',
}) => {
  const displayText = label ?? text ?? 'Chargement en cours...';

  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  }[size];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div
        className={`${sizeClasses} border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_15px_rgba(6,182,212,0.4)]`}
      />
      {displayText && (
        <span className="text-sm text-slate-400 font-medium text-center max-w-xs">
          {displayText}
        </span>
      )}
      <span className="sr-only">{displayText}</span>
    </div>
  );
};
