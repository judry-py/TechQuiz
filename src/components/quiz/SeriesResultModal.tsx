'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Trophy, RefreshCw, ArrowRight, Award, AlertTriangle } from 'lucide-react';
import { LevelTierInfo } from '@/types/progression';
import { useAppReducedMotion } from '@/components/animations/useAppReducedMotion';
import { scaleIn, reducedVariants } from '@/components/animations/variants';
import Link from 'next/link';

export interface AnswerSummaryItem {
  questionNumber: number;
  questionText: string;
  note: number;
  sous_theme: string;
}

export interface SeriesResultProps {
  domainName: string;
  domainSlug: string;
  currentLevel: number;
  averageScore: number;
  passed: boolean;
  tierInfo: LevelTierInfo;
  isComingSoon: boolean;
  isMaxLevelReached: boolean;
  answersSummary: AnswerSummaryItem[];
  onRetry: () => void;
}

export const SeriesResultModal: React.FC<SeriesResultProps> = ({
  domainName,
  domainSlug,
  currentLevel,
  averageScore,
  passed,
  tierInfo,
  isComingSoon,
  isMaxLevelReached: _isMaxLevelReached,
  answersSummary,
  onRetry,
}) => {
  const shouldReduce = useAppReducedMotion();
  const variants = shouldReduce ? reducedVariants : scaleIn;

  // Confettis uniquement si les animations ne sont pas réduites
  useEffect(() => {
    if (passed && !shouldReduce) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#10b981', '#8b5cf6', '#ec4899'],
        });
      } catch {
        // canvas-confetti indisponible (SSR ou env. restreint)
      }
    }
  }, [passed, shouldReduce]);

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      role="dialog"
      aria-modal="true"
      aria-labelledby="series-result-title"
      className="w-full max-w-3xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col gap-8"
    >
      {/* Header : Statut & Moyenne */}
      <div className="text-center flex flex-col items-center">
        {passed ? (
          <motion.div
            initial={shouldReduce ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-400/50 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_35px_rgba(16,185,129,0.35)]"
            aria-hidden="true"
          >
            <Trophy className="w-10 h-10" />
          </motion.div>
        ) : (
          <div
            className="w-20 h-20 rounded-3xl bg-amber-500/15 border border-amber-400/50 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_35px_rgba(245,158,11,0.25)]"
            aria-hidden="true"
          >
            <AlertTriangle className="w-10 h-10" />
          </div>
        )}

        <Badge variant={tierInfo.tier} className="mb-2">
          Palier {tierInfo.label} • Niveau {currentLevel}
        </Badge>

        <h2
          id="series-result-title"
          className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2"
        >
          {passed ? 'Niveau Validé avec Succès !' : 'Continuez vos efforts !'}
        </h2>

        <p className="text-slate-400 max-w-md text-sm sm:text-base">
          {passed
            ? `Félicitations, vous avez obtenu la moyenne requise pour valider le niveau ${currentLevel} en ${domainName}.`
            : `Il vous faut une moyenne minimale de 7.0/10 pour valider le niveau ${currentLevel}. Révisez les points faibles et retentez votre chance.`}
        </p>

        {/* Note moyenne */}
        <div
          className="mt-6 flex items-baseline gap-2 bg-slate-800/50 px-6 py-3 rounded-2xl border border-white/5"
          aria-label={`Note moyenne : ${averageScore} sur 10`}
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Note moyenne :
          </span>
          <span
            className={`text-4xl font-black font-mono ${passed ? 'text-emerald-400' : 'text-amber-400'}`}
          >
            {averageScore}
          </span>
          <span className="text-sm font-mono text-slate-500">/ 10</span>
        </div>
      </div>

      {/* Niveau suivant Coming Soon */}
      {passed && isComingSoon && (
        <div
          className="bg-cyan-950/30 border border-cyan-500/40 rounded-2xl p-5 flex items-start gap-4"
          role="note"
        >
          <Award className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h4 className="text-base font-semibold text-cyan-200">
              Niveau suivant en cours de rédaction
            </h4>
            <p className="text-sm text-slate-300 mt-1">
              Vous avez validé tous les niveaux actuellement disponibles pour ce domaine ! Les
              niveaux 6 à 12 arriveront prochainement. Vous pouvez consolider votre score ou
              explorer un autre domaine.
            </p>
          </div>
        </div>
      )}

      {/* Tableau récapitulatif des 12 questions */}
      <section aria-label="Bilan des 12 questions" className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span>Bilan des 12 questions</span>
          <span className="text-xs text-slate-500 font-normal">Détail des notes</span>
        </h3>

        <div className="divide-y divide-white/5 border border-white/5 rounded-2xl bg-slate-950/40 overflow-hidden max-h-64 overflow-y-auto">
          {answersSummary.map((item) => (
            <div
              key={item.questionNumber}
              className="p-3 sm:p-4 flex items-center justify-between gap-4 hover:bg-slate-900/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-mono flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  {item.questionNumber}
                </span>
                <div className="truncate">
                  <p className="text-sm text-slate-200 truncate">{item.questionText}</p>
                  <span className="text-xs text-slate-500">
                    {item.sous_theme.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <span
                  className={`text-sm font-mono font-bold px-2 py-0.5 rounded ${
                    item.note >= 7
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : item.note >= 5
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-rose-500/15 text-rose-300'
                  }`}
                  aria-label={`Note : ${item.note} sur 10`}
                >
                  {item.note}/10
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-white/10">
        <Button
          variant="secondary"
          size="lg"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-4 h-4" aria-hidden="true" />}
          className="w-full sm:w-auto"
          aria-label={passed ? 'Rejouer ce niveau depuis le début' : 'Réessayer cette série'}
        >
          {passed ? 'Rejouer ce niveau' : 'Réessayer la série'}
        </Button>

        <Link href="/domaines" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full">
            Changer de domaine
          </Button>
        </Link>

        {passed && !isComingSoon && (
          <Link href={`/quiz/${domainSlug}`} className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}
              className="w-full"
              aria-label={`Passer au niveau ${currentLevel + 1}`}
            >
              Passer au niveau {currentLevel + 1}
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
};
