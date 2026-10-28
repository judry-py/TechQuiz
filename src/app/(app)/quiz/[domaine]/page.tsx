import React from 'react';
import { notFound } from 'next/navigation';
import { DOMAINS } from '@/config/domains';
import { getQuizSeriesQuestionsAction } from '@/features/progression/actions';
import { QuizPlaySession } from '@/components/quiz/QuizPlaySession';
import { Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface QuizPageProps {
  params: Promise<{
    domaine: string;
  }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { domaine } = await params;

  if (!DOMAINS[domaine]) {
    notFound();
  }

  const seriesData = await getQuizSeriesQuestionsAction(domaine);

  if (seriesData.isComingSoon) {
    return (
      <div className="max-w-2xl mx-auto py-12 flex flex-col items-center text-center gap-6 bg-slate-900/60 border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
          <Lock className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {seriesData.maxAvailableLevel > 0
              ? `Niveaux ${seriesData.maxAvailableLevel + 1} à 12 en cours d'écriture`
              : 'Contenu en cours de rédaction'}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
            {seriesData.maxAvailableLevel > 0
              ? `Félicitations ! Vous avez validé tous les niveaux disponibles (1 à ${seriesData.maxAvailableLevel}) pour le domaine `
              : `Les questions du domaine `}
            <strong className="text-white">{seriesData.domainName}</strong>
            {seriesData.maxAvailableLevel > 0
              ? `. Notre équipe d'experts techniques rédige activement les paliers Intermédiaire supérieur et Avancé.`
              : ` sont en cours de rédaction par notre équipe d'experts techniques.`}
          </p>
        </div>
        <Link
          href="/domaines"
          className="mt-2 py-3 px-6 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explorer les autres domaines</span>
        </Link>
      </div>
    );
  }

  return <QuizPlaySession seriesData={seriesData} />;
}
