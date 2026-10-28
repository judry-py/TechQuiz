'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Send } from 'lucide-react';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const AnswerInput: React.FC<AnswerInputProps> = ({
  onSubmit,
  isLoading,
  disabled = false,
}) => {
  const [answer, setAnswer] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus lorsque l'entrée devient active
  useEffect(() => {
    if (!disabled && !isLoading) {
      textareaRef.current?.focus();
    }
  }, [disabled, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = answer.trim();
    if (!trimmed || isLoading || disabled) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Raccourci clavier Ctrl+Enter ou Cmd+Enter pour valider
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
      <div className="relative">
        <label htmlFor="answer-input" className="sr-only">
          Votre réponse technique
        </label>
        <textarea
          ref={textareaRef}
          id="answer-input"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder="Rédigez votre réponse avec vos propres mots... Expliquez les mécanismes et concepts techniques."
          rows={5}
          maxLength={3000}
          className="w-full p-4 rounded-2xl bg-slate-900/90 border border-white/10 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 shadow-inner resize-y transition-all disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed text-base"
        />

        {/* Compteur de caractères */}
        <div className="absolute bottom-3 right-4 text-xs font-mono text-slate-500 pointer-events-none">
          {answer.length} / 3000
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-500 flex items-center gap-1.5 hidden sm:inline-flex">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[10px]">
            Ctrl
          </kbd>
          +
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[10px]">
            Entrée
          </kbd>
          <span>pour valider rapidement</span>
        </span>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={!answer.trim() || disabled}
          rightIcon={!isLoading ? <Send className="w-4 h-4" /> : undefined}
          className="w-full sm:w-auto ml-auto"
        >
          {isLoading ? "Évaluation par l'IA..." : 'Valider ma réponse'}
        </Button>
      </div>
    </form>
  );
};
