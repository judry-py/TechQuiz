import React from 'react';
import Link from 'next/link';
import { getDashboardDataAction } from '@/features/progression/actions';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageTransition } from '@/components/animations/PageTransition';
import {
  Flame,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Compass,
  ArrowRight,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';
import { DOMAINS } from '@/config/domains';

export default async function DashboardPage() {
  const data = await getDashboardDataAction();

  const {
    domains,
    streak,
    weakAreas,
    totalAnswersCount,
    recentAttempts,
    dailyRemainingCorrections,
  } = data;

  return (
    <PageTransition>
      <div className="flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Tableau de bord
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Suivez votre progression, analysez vos points d&apos;effort et mesurez votre régularité
            technique.
          </p>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Metric 1 : Streak */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Série de réussites (Streak)
              </p>
              <p className="text-2xl font-black text-white mt-0.5">
                {streak}{' '}
                <span className="text-xs font-normal text-slate-400">
                  série{streak > 1 ? 's' : ''} d&apos;affilée
                </span>
              </p>
            </div>
          </div>

          {/* Metric 2 : Total Answers */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Questions répondues
              </p>
              <p className="text-2xl font-black text-white mt-0.5">
                {totalAnswersCount}{' '}
                <span className="text-xs font-normal text-slate-400">réponses</span>
              </p>
            </div>
          </div>

          {/* Metric 3 : Daily Quota */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Corrections gratuites / jour
              </p>
              <p className="text-2xl font-black text-white mt-0.5">
                {dailyRemainingCorrections}{' '}
                <span className="text-xs font-normal text-slate-400">/ 20 restantes</span>
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid : Domaines & Axes d'amélioration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 spans) : Domains Progression */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                Progression par domaine
              </h2>
              <Link
                href="/domaines"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Voir tout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {domains.map((domain) => {
                const config = DOMAINS[domain.domainSlug];
                return (
                  <div
                    key={domain.domainSlug}
                    className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: config?.accentColor ?? '#06b6d4' }}
                        />
                        <h3 className="font-bold text-white text-base">{domain.domainName}</h3>
                        <Badge
                          variant={
                            domain.tierInfo.tier === 'avance'
                              ? 'pink'
                              : domain.tierInfo.tier === 'intermediaire'
                                ? 'violet'
                                : 'cyan'
                          }
                          size="sm"
                        >
                          {domain.tierInfo.label}
                        </Badge>
                      </div>

                      <span className="text-xs font-semibold text-slate-400">
                        Niveau <strong className="text-white">{domain.currentLevel}</strong> / 12
                      </span>
                    </div>

                    <ProgressBar
                      progress={domain.percentage}
                      colorScheme={config?.colorName ?? 'cyan'}
                      size="sm"
                    />

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs text-slate-400">Série #{domain.seriesNumber}</span>
                      <Link
                        href={`/quiz/${domain.domainSlug}`}
                        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        {domain.isComingSoon ? 'Bientôt disponible' : 'Poursuivre'}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (1 span) : Weak Areas */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-amber-400" />
              Axes d&apos;effort identifiés
            </h2>

            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
              {weakAreas.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    L&apos;IA a identifié vos sous-thèmes avec les scores les plus bas. Concentrez
                    vos révisions sur ces sujets lors de vos prochaines séries :
                  </p>
                  {weakAreas.map((area, index) => (
                    <div
                      key={area.subTheme}
                      className="p-3.5 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-slate-500">
                          0{index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-200">{area.subTheme}</p>
                          <p className="text-[11px] text-slate-400">
                            {area.totalAnswers} question{area.totalAnswers > 1 ? 's' : ''} tentée
                            {area.totalAnswers > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <Badge variant={area.averageScore < 5 ? 'danger' : 'warning'} size="sm">
                        {area.averageScore} / 10
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center flex flex-col items-center gap-2">
                  <Award className="w-8 h-8 text-slate-600" />
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    Pas encore assez de données. Répondez à vos premières questions pour révéler vos
                    axes de révision prioritaires.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Attempts History */}
        <div className="flex flex-col gap-6 mt-4">
          <h2 className="text-xl font-bold text-white tracking-tight">Historique des tentatives</h2>

          {recentAttempts.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Domaine</th>
                    <th className="px-6 py-4">Niveau</th>
                    <th className="px-6 py-4">Moyenne</th>
                    <th className="px-6 py-4">Résultat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentAttempts.map((attempt) => {
                    const domainConfig = DOMAINS[attempt.domaine];
                    const formattedDate = new Date(attempt.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={attempt.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                          {formattedDate}
                        </td>
                        <td className="px-6 py-4 font-medium text-white">
                          {domainConfig?.name ?? attempt.domaine}
                        </td>
                        <td className="px-6 py-4 text-xs">Niveau {attempt.niveau}</td>
                        <td className="px-6 py-4 font-mono font-bold">
                          <span className={attempt.valide ? 'text-emerald-400' : 'text-amber-400'}>
                            {attempt.note_moyenne.toFixed(1)} / 10
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {attempt.valide ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Validé (≥ 7)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              <XCircle className="w-3.5 h-3.5" />
                              Non validé (&lt; 7)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Aucune tentative enregistrée"
              description="Commencez une série de quiz dans l'un des domaines pour enregistrer vos premiers résultats."
              action={{
                label: 'Explorer les domaines',
                href: '/domaines',
              }}
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
