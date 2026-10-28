'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  QuizSeriesData,
  submitSeriesResultAction,
  SubmitSeriesResultResponse,
} from '@/features/progression/actions';
import { GradingResult } from '@/types/grading';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { AnswerInput } from '@/components/quiz/AnswerInput';
import { FeedbackPanel } from '@/components/quiz/FeedbackPanel';
import { SeriesResultModal, AnswerSummaryItem } from '@/components/quiz/SeriesResultModal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getDomainConfig } from '@/config/domains';
import { useAppReducedMotion } from '@/components/animations/useAppReducedMotion';
import { slideInFromRight, feedbackSlide, reducedVariants } from '@/components/animations/variants';
import { AlertCircle, Flame, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface QuizPlaySessionProps {
  seriesData: QuizSeriesData;
}

export const QuizPlaySession: React.FC<QuizPlaySessionProps> = ({ seriesData }) => {
  const router = useRouter();
  const shouldReduce = useAppReducedMotion();
  const { domainSlug, domainName, currentLevel, seriesNumber, tierInfo, questions } = seriesData;

  const domainConfig = getDomainConfig(domainSlug);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentResult, setCurrentResult] = useState<GradingResult | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [answersSummary, setAnswersSummary] = useState<AnswerSummaryItem[]>([]);
  const [isSeriesCompleted, setIsSeriesCompleted] = useState(false);
  const [seriesFinalResult, setSeriesFinalResult] = useState<SubmitSeriesResultResponse | null>(
    null
  );
  const [isSavingSeries, setIsSavingSeries] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dailyRemaining, setDailyRemaining] = useState<number | null>(null);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const progressPercentage = Math.round(
    ((currentIndex + (currentResult ? 1 : 0)) / totalQuestions) * 100
  );

  const questionVariants = shouldReduce ? reducedVariants : slideInFromRight;
  const feedbackVariants = shouldReduce ? reducedVariants : feedbackSlide;

  const handleSubmitAnswer = async (answer: string) => {
    if (!currentQuestion) return;
    setIsEvaluating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: currentQuestion.id, userAnswer: answer }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error ?? "Erreur lors de l'évaluation de la réponse.");
        return;
      }

      const result: GradingResult = data.result;
      setCurrentResult(result);
      if (typeof data.remainingDailyCorrections === 'number') {
        setDailyRemaining(data.remainingDailyCorrections);
      }

      setScores((prev) => [...prev, result.note]);
      setAnswersSummary((prev) => [
        ...prev,
        {
          questionNumber: currentIndex + 1,
          questionText: currentQuestion.question,
          note: result.note,
          sous_theme: currentQuestion.sous_theme,
        },
      ]);
    } catch {
      setErrorMessage(
        'Impossible de contacter le service de correction. Vérifiez votre connexion.'
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
      setCurrentResult(null);
      setErrorMessage(null);
      window.scrollTo({ top: 0, behavior: shouldReduce ? 'auto' : 'smooth' });
      return;
    }

    setIsSavingSeries(true);
    try {
      const response = await submitSeriesResultAction({
        domainSlug,
        level: currentLevel,
        scores,
        answersSummary: answersSummary.map((item, idx) => ({
          question_id: questions[idx]?.id ?? '',
          sous_theme: item.sous_theme,
          note: item.note,
        })),
      });
      setSeriesFinalResult(response);
      setIsSeriesCompleted(true);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Erreur lors de la sauvegarde de la série.'
      );
    } finally {
      setIsSavingSeries(false);
    }
  };

  const handleRetrySeries = () => {
    router.refresh();
  };

  if (isSeriesCompleted && seriesFinalResult) {
    return (
      <SeriesResultModal
        domainName={domainName}
        domainSlug={domainSlug}
        currentLevel={currentLevel}
        averageScore={seriesFinalResult.averageScore}
        passed={seriesFinalResult.passed}
        tierInfo={seriesFinalResult.tierInfo}
        isComingSoon={seriesFinalResult.isComingSoon}
        isMaxLevelReached={seriesFinalResult.isMaxLevelReached}
        answersSummary={answersSummary}
        onRetry={handleRetrySeries}
      />
    );
  }

  if (isSavingSeries) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center"
      >
        <LoadingSpinner
          size="lg"
          text="Calcul de votre moyenne et mise à jour de votre progression..."
        />
      </div>
    );
  }

  if (!currentQuestion || !domainConfig) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <p className="text-slate-400">Aucune question disponible pour ce niveau.</p>
        <Link
          href="/domaines"
          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg px-2 py-1"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Retour aux domaines
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/domaines"
          className="text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg px-1 py-0.5"
          aria-label="Quitter la série et retourner aux domaines"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Quitter la série</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="cyan" size="sm">
            {domainName}
          </Badge>
          <Badge
            variant={
              tierInfo.tier === 'avance'
                ? 'pink'
                : tierInfo.tier === 'intermediaire'
                  ? 'violet'
                  : 'cyan'
            }
            size="sm"
          >
            Niveau {currentLevel} • {tierInfo.label}
          </Badge>
          <span className="text-xs text-slate-500" aria-label={`Série numéro ${seriesNumber}`}>
            Série #{seriesNumber}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-2.5"
        role="region"
        aria-label="Progression dans la série"
      >
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-300">
            Question{' '}
            <span className="text-cyan-400" aria-current="true">
              {currentIndex + 1}
            </span>{' '}
            sur {totalQuestions}
          </span>
          <span className="text-slate-400">{progressPercentage}% complété</span>
        </div>
        <ProgressBar progress={progressPercentage} colorScheme="cyan" size="sm" />
      </div>

      {/* Daily quota warning */}
      {dailyRemaining !== null && dailyRemaining <= 5 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-xl"
          role="alert"
        >
          <Flame className="w-4 h-4" aria-hidden="true" />
          <span>
            Plus que {dailyRemaining} correction{dailyRemaining !== 1 ? 's' : ''} gratuite
            {dailyRemaining !== 1 ? 's' : ''} disponible{dailyRemaining !== 1 ? 's' : ''}{' '}
            aujourd&apos;hui.
          </span>
        </motion.div>
      )}

      {/* Question card — animated on question change */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`question-${currentIndex}`}
          variants={questionVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <QuestionCard
            question={currentQuestion}
            domainConfig={domainConfig}
            currentIndex={currentIndex}
            totalQuestions={totalQuestions}
          />
        </motion.div>
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle
              className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold">Erreur</p>
              <p className="text-rose-200/90 text-xs mt-0.5">{errorMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer Input or Feedback — animated swap */}
      <AnimatePresence mode="wait">
        {!currentResult ? (
          <motion.div
            key="answer-input"
            variants={questionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <AnswerInput
              onSubmit={handleSubmitAnswer}
              isLoading={isEvaluating}
              disabled={isEvaluating}
            />
          </motion.div>
        ) : (
          <motion.div
            key="feedback-panel"
            variants={feedbackVariants}
            initial="hidden"
            animate="visible"
          >
            <FeedbackPanel
              result={currentResult}
              onNextQuestion={handleNextQuestion}
              isLastQuestion={isLastQuestion}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
