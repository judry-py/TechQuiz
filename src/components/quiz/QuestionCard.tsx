import React from 'react';
import { SafeQuestion } from '@/types/question';
import { DomainConfig } from '@/config/domains';
import { Badge } from '@/components/ui/Badge';
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
} from 'lucide-react';

interface QuestionCardProps {
  question: SafeQuestion;
  domainConfig: DomainConfig;
  currentIndex: number;
  totalQuestions: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  domainConfig,
  currentIndex,
  totalQuestions,
}) => {
  const IconComponent = {
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
  }[domainConfig.iconName];

  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl">
      {/* Header : Domaine, Type, Niveau */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${domainConfig.accentBg} ${domainConfig.accentText} border ${domainConfig.accentBorder}`}
          >
            <IconComponent className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-slate-200">{domainConfig.name}</span>
          <span className="text-slate-600">•</span>
          <span className="text-xs font-mono uppercase text-slate-400">
            Niveau {question.niveau}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {question.type === 'scenario' ? (
            <Badge variant="scenario">Cas pratique</Badge>
          ) : (
            <Badge variant="definition">Définition</Badge>
          )}
          <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/50">
            {question.sous_theme.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Intitulé de la question */}
      <div className="mb-2">
        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-1 block">
          Question {currentIndex + 1} / {totalQuestions}
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 leading-relaxed">
          {question.question}
        </h2>
      </div>
    </div>
  );
};
