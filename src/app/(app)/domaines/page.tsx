import React from 'react';
import Link from 'next/link';
import {
  Network,
  Shield,
  Code,
  Brain,
  Database,
  Cloud,
  GitBranch,
  Smartphone,
  FlaskConical,
  Cpu,
  ClipboardCheck,
  Blocks,
  ArrowRight,
  Lock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { getAllDomainsProgressAction } from '@/features/progression/actions';
import { DOMAINS, type DomainConfig } from '@/config/domains';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar, type ProgressBarProps } from '@/components/ui/ProgressBar';
import {
  AnimatedDomainsGrid,
  AnimatedDomainCard,
} from '@/components/animations/AnimatedDomainsGrid';
import { PageTransition } from '@/components/animations/PageTransition';

const domainIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  reseau: Network,
  cybersecurite: Shield,
  dev_web: Code,
  ia: Brain,
  bases_donnees: Database,
  devops: Cloud,
  genie_logiciel: GitBranch,
  dev_mobile: Smartphone,
  data_science: FlaskConical,
  systemes_embarques: Cpu,
  tests_qualite: ClipboardCheck,
  web3_blockchain: Blocks,
};

interface DomainTheme {
  border: string;
  glow: string;
  iconBg: string;
  ctaBg: string;
  progressColor: NonNullable<ProgressBarProps['colorScheme']>;
}

const DOMAIN_THEMES: Record<DomainConfig['colorName'], DomainTheme> = {
  cyan: {
    border: 'border-cyan-500/30 hover:border-cyan-400',
    glow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]',
    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    ctaBg: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
    progressColor: 'cyan',
  },
  emerald: {
    border: 'border-emerald-500/30 hover:border-emerald-400',
    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    ctaBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
    progressColor: 'emerald',
  },
  violet: {
    border: 'border-violet-500/30 hover:border-violet-400',
    glow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]',
    iconBg: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    ctaBg: 'bg-violet-500 hover:bg-violet-400 text-white',
    progressColor: 'violet',
  },
  pink: {
    border: 'border-pink-500/30 hover:border-pink-400',
    glow: 'hover:shadow-[0_0_30px_rgba(236,72,153,0.25)]',
    iconBg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    ctaBg: 'bg-pink-500 hover:bg-pink-400 text-white',
    progressColor: 'pink',
  },
  amber: {
    border: 'border-amber-500/30 hover:border-amber-400',
    glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    ctaBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
    progressColor: 'amber',
  },
  sky: {
    border: 'border-sky-500/30 hover:border-sky-400',
    glow: 'hover:shadow-[0_0_30px_rgba(14,165,233,0.25)]',
    iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    ctaBg: 'bg-sky-500 hover:bg-sky-400 text-slate-950',
    progressColor: 'sky',
  },
  lime: {
    border: 'border-lime-500/30 hover:border-lime-400',
    glow: 'hover:shadow-[0_0_30px_rgba(132,204,22,0.25)]',
    iconBg: 'bg-lime-500/10 text-lime-400 border-lime-500/30',
    ctaBg: 'bg-lime-500 hover:bg-lime-400 text-slate-950',
    progressColor: 'lime',
  },
  indigo: {
    border: 'border-indigo-500/30 hover:border-indigo-400',
    glow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]',
    iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    ctaBg: 'bg-indigo-500 hover:bg-indigo-400 text-white',
    progressColor: 'indigo',
  },
  orange: {
    border: 'border-orange-500/30 hover:border-orange-400',
    glow: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.25)]',
    iconBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    ctaBg: 'bg-orange-500 hover:bg-orange-400 text-slate-950',
    progressColor: 'orange',
  },
  teal: {
    border: 'border-teal-500/30 hover:border-teal-400',
    glow: 'hover:shadow-[0_0_30px_rgba(20,184,166,0.25)]',
    iconBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    ctaBg: 'bg-teal-500 hover:bg-teal-400 text-slate-950',
    progressColor: 'teal',
  },
  rose: {
    border: 'border-rose-500/30 hover:border-rose-400',
    glow: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.25)]',
    iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    ctaBg: 'bg-rose-500 hover:bg-rose-400 text-white',
    progressColor: 'rose',
  },
  fuchsia: {
    border: 'border-fuchsia-500/30 hover:border-fuchsia-400',
    glow: 'hover:shadow-[0_0_30px_rgba(217,70,239,0.25)]',
    iconBg: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30',
    ctaBg: 'bg-fuchsia-500 hover:bg-fuchsia-400 text-white',
    progressColor: 'fuchsia',
  },
};

export default async function DomainesPage() {
  const domainsProgress = await getAllDomainsProgressAction();

  return (
    <PageTransition>
      <div className="flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 w-fit">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Progression par paliers &amp; questions libres</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Domaines d&apos;expertise
          </h1>
          <p className="text-slate-400 max-w-2xl text-base sm:text-lg">
            Choisissez un domaine pour relever les défis. Chaque niveau est constitué de 12
            questions ouvertes corrigées en temps réel par intelligence artificielle.
          </p>
        </div>

        {/* Grid of Domain Cards */}
        <AnimatedDomainsGrid>
          {domainsProgress.map((domain) => {
            const config = DOMAINS[domain.domainSlug];
            const Icon = domainIcons[domain.domainSlug] ?? Code;
            const isCompleted = domain.isMaxReached;

            const theme = DOMAIN_THEMES[config?.colorName ?? 'cyan'];

            return (
              <AnimatedDomainCard
                key={domain.domainSlug}
                className={`relative bg-slate-900/60 backdrop-blur-sm border ${theme.border} rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-colors duration-300 ${theme.glow}`}
              >
                <div className="flex flex-col gap-6">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${theme.iconBg}`}
                      >
                        <Icon className="w-7 h-7" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">
                          {domain.domainName}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
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
                            Palier {domain.tierInfo.label}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            Série #{domain.seriesNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isCompleted && (
                      <div
                        className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        title="Tous les niveaux disponibles sont validés"
                      >
                        <CheckCircle2 className="w-5 h-5" aria-label="Domaine complété" />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {config?.description ?? 'Questions ouvertes et scénarios techniques.'}
                  </p>

                  {/* Level progress bar */}
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-400">Niveau actuel</span>
                      <span className="text-white">
                        Niveau {domain.currentLevel} <span className="text-slate-500">/ 12</span>
                      </span>
                    </div>
                    <ProgressBar
                      progress={domain.percentage}
                      colorScheme={theme.progressColor}
                      size="md"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Niveau 1</span>
                      <span>Niveau 12</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-6 mt-6 border-t border-white/5">
                  {domain.isComingSoon ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-white/5 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-400" aria-hidden="true" />
                        <span>
                          Niveaux {domain.maxAvailableLevel + 1} à 12 en cours
                          d&apos;écriture
                        </span>
                      </div>
                      <Badge variant="warning" size="sm">
                        Bientôt
                      </Badge>
                    </div>
                  ) : (
                    <Link
                      href={`/quiz/${domain.domainSlug}`}
                      aria-label={`Lancer le quiz ${domain.domainName} — Niveau ${domain.currentLevel}`}
                      className={`w-full py-3.5 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${theme.ctaBg}`}
                    >
                      <span>
                        {domain.currentLevel === 1 && domain.seriesNumber === 1
                          ? 'Commencer le quiz'
                          : `Lancer le Niveau ${domain.currentLevel}`}
                      </span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </AnimatedDomainCard>
            );
          })}
        </AnimatedDomainsGrid>
      </div>
    </PageTransition>
  );
}
