import React from 'react';
import Link from 'next/link';
import {
  Terminal,
  Shield,
  Code,
  Brain,
  Network,
  Database,
  Cloud,
  GitBranch,
  Smartphone,
  FlaskConical,
  Cpu,
  ClipboardCheck,
  Blocks,
  Sparkles,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DOMAINS } from '@/config/domains';

export default function HomePage() {
  const domainList = Object.values(DOMAINS);

  return (
    <div className="flex flex-col min-h-screen bg-[#090d16] text-slate-100 bg-tech-grid">
      {/* Navigation Landing */}
      <header className="w-full border-b border-white/10 bg-[#090d16]/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-lg text-slate-100">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Terminal className="w-5 h-5" />
            </div>
            <span>
              Tech<span className="text-cyan-400">Quiz</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/connexion">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
            <Link href="/inscription">
              <Button variant="primary" size="sm">
                S&apos;inscrire
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Évaluation IA en langage naturel • 0 % QCM</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Maîtrisez l&apos;informatique avec vos{' '}
          <span className="text-cyan-400 underline decoration-cyan-500/40 decoration-wavy">
            propres mots
          </span>
          .
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mb-10 leading-relaxed font-normal">
          Fini les choix multiples artificiels. Répondez librement à des questions techniques et cas
          pratiques concrets, corrigés instantanément par une intelligence artificielle pédagogique.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <Link href="/inscription" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto text-base px-8 py-4"
            >
              Commencer l&apos;évaluation gratuite
            </Button>
          </Link>
          <Link href="/domaines" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base px-6 py-4">
              Explorer les {domainList.length} domaines
            </Button>
          </Link>
        </div>

        {/* Aperçu des domaines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full text-left">
          {domainList.map((d) => (
            <div
              key={d.slug}
              className={`p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border ${d.accentBorder} transition-all hover:-translate-y-1`}
            >
              <div
                className={`w-10 h-10 rounded-xl ${d.accentBg} ${d.accentText} flex items-center justify-center mb-3`}
              >
                {d.iconName === 'Network' && <Network className="w-5 h-5" />}
                {d.iconName === 'Shield' && <Shield className="w-5 h-5" />}
                {d.iconName === 'Code' && <Code className="w-5 h-5" />}
                {d.iconName === 'Brain' && <Brain className="w-5 h-5" />}
                {d.iconName === 'Database' && <Database className="w-5 h-5" />}
                {d.iconName === 'Cloud' && <Cloud className="w-5 h-5" />}
                {d.iconName === 'GitBranch' && <GitBranch className="w-5 h-5" />}
                {d.iconName === 'Smartphone' && <Smartphone className="w-5 h-5" />}
                {d.iconName === 'FlaskConical' && <FlaskConical className="w-5 h-5" />}
                {d.iconName === 'Cpu' && <Cpu className="w-5 h-5" />}
                {d.iconName === 'ClipboardCheck' && <ClipboardCheck className="w-5 h-5" />}
                {d.iconName === 'Blocks' && <Blocks className="w-5 h-5" />}
              </div>
              <h3 className="font-bold text-slate-100 text-base mb-1">{d.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{d.description}</p>
            </div>
          ))}
        </div>

        {/* Points clés */}
        <div className="mt-20 pt-12 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 text-sm">12 Niveaux par domaine</h4>
              <p className="text-xs text-slate-400 mt-1">
                Paliers Débutant, Intermédiaire et Avancé avec séries de 12 questions calibrées.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 text-sm">Correction IA détaillée</h4>
              <p className="text-xs text-slate-400 mt-1">
                Note sur 10, points acquis, axes d&apos;amélioration et réponse modèle pour
                progresser vite.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 text-sm">100 % Gratuit</h4>
              <p className="text-xs text-slate-400 mt-1">
                20 corrections gratuites par jour pour vous entraîner régulièrement et sans frais.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-500">
        <p>© 2026 TechQuiz • Plateforme d&apos;évaluation tech propulsée par IA.</p>
      </footer>
    </div>
  );
}
