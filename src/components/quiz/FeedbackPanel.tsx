'use client';

import React from 'react';
import { GradingResult } from '@/types/grading';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, Sparkles } from 'lucide-react';

interface FeedbackPanelProps {
  result: GradingResult;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  result,
  onNextQuestion,
  isLastQuestion,
}) => {
  const { note, points_corrects, points_manquants, commentaire, reponse_reference } = result;

  const scoreTheme =
    note >= 8
      ? {
          text: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/40',
          glow: 'shadow-[0_0_25px_rgba(6,182,212,0.3)]',
          verdict: 'Excellent !',
        }
      : note >= 7
        ? {
            text: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/40',
            glow: 'shadow-[0_0_25px_rgba(16,185,129,0.3)]',
            verdict: 'Niveau validé !',
          }
        : note >= 5
          ? {
              text: 'text-amber-400',
              bg: 'bg-amber-500/10',
              border: 'border-amber-500/40',
              glow: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]',
              verdict: 'Partiellement acquis',
            }
          : {
              text: 'text-rose-400',
              bg: 'bg-rose-500/10',
              border: 'border-rose-500/40',
              glow: 'shadow-[0_0_25px_rgba(244,63,94,0.25)]',
              verdict: 'À approfondir',
            };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header : Note sur 10 et Verdict */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl ${scoreTheme.bg} border ${scoreTheme.border} ${scoreTheme.glow} flex flex-col items-center justify-center`}
          >
            <span className={`text-2xl font-black font-mono ${scoreTheme.text}`}>{note}</span>
            <span className="text-[10px] uppercase font-mono text-slate-400">/ 10</span>
          </div>
          <div>
            <span className={`text-sm font-semibold uppercase tracking-wider ${scoreTheme.text}`}>
              {scoreTheme.verdict}
            </span>
            <h3 className="text-xl font-bold text-slate-100">Correction détaillée</h3>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={onNextQuestion}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          {isLastQuestion ? 'Voir le bilan de la série' : 'Question suivante'}
        </Button>
      </div>

      {/* Commentaire de l'IA */}
      <div className="bg-slate-800/40 rounded-xl p-4 border border-white/5 flex gap-3 items-start">
        <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-200 leading-relaxed italic">{commentaire}</p>
      </div>

      {/* Points corrects & manquants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Points corrects */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4" />
            Ce qui est bien compris
          </h4>
          {points_corrects.length > 0 ? (
            <ul className="space-y-2">
              {points_corrects.map((pt, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 italic">Aucun point spécifique validé.</p>
          )}
        </div>

        {/* Points manquants */}
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-2 mb-3">
            <XCircle className="w-4 h-4" />
            Points à consolider
          </h4>
          {points_manquants.length > 0 ? (
            <ul className="space-y-2">
              {points_manquants.map((pt, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-emerald-400 italic">Excellente réponse, rien à redire !</p>
          )}
        </div>
      </div>

      {/* Réponse de référence */}
      <div className="p-5 rounded-xl bg-slate-950/60 border border-cyan-500/20 flex flex-col gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Réponse de référence
        </h4>
        <p className="text-sm text-slate-200 leading-relaxed font-sans">{reponse_reference}</p>
      </div>
    </div>
  );
};
