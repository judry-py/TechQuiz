'use client';

import React, { useState, useTransition } from 'react';
import { ProfileData } from '@/features/progression/actions';
import { updateProfileAction } from '@/features/auth/actions';
import { signOutAction } from '@/features/auth/actions';
import {
  User,
  Mail,
  Sparkles,
  Activity,
  Trophy,
  Layers,
  Flame,
  LogOut,
  Zap,
  ZapOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { CONSTANTS } from '@/types/progression';

interface ProfileClientProps {
  data: ProfileData;
}

export const ProfileClient: React.FC<ProfileClientProps> = ({ data }) => {
  const { user, profile, dailyUsage, stats } = data;
  const [reduceMotion, setReduceMotion] = useState(profile.reduce_motion);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const handleToggleReduceMotion = () => {
    const newValue = !reduceMotion;
    setReduceMotion(newValue);
    setFeedback(null);

    startTransition(async () => {
      const result = await updateProfileAction({ reduce_motion: newValue });
      if (result.success) {
        setFeedback({ ok: true, message: 'Préférence enregistrée.' });
      } else {
        setReduceMotion(!newValue); // rollback
        setFeedback({ ok: false, message: result.error ?? 'Erreur lors de la mise à jour.' });
      }
    });
  };

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  const joinedDate = new Date(profile.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const dailyQuotaPercentage = Math.round(
    ((CONSTANTS.DEFAULT_DAILY_LIMIT - dailyUsage.remaining) / CONSTANTS.DEFAULT_DAILY_LIMIT) * 100
  );

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Mon profil</h1>
        <p className="text-slate-400 text-sm">
          Gérez vos informations et préférences personnelles.
        </p>
      </div>

      {/* Identity Card */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-400" />
          Informations du compte
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-slate-800/40 border border-white/5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pseudo
            </span>
            <span className="font-semibold text-white text-base">{profile.pseudo}</span>
          </div>

          <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-slate-800/40 border border-white/5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3 h-3" />
              Email
            </span>
            <span className="font-medium text-slate-300 text-sm truncate">{user.email ?? '—'}</span>
          </div>

          <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-slate-800/40 border border-white/5 sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Membre depuis
            </span>
            <span className="font-medium text-slate-300 text-sm">{joinedDate}</span>
          </div>
        </div>
      </div>

      {/* Daily AI Quota */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-400" />
          Quota de corrections IA du jour
        </h2>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-black text-white">
              {dailyUsage.remaining}
              <span className="text-slate-500 text-base font-medium"> / {dailyUsage.limit}</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {dailyUsage.count} correction{dailyUsage.count !== 1 ? 's' : ''} utilisée
              {dailyUsage.count !== 1 ? 's' : ''} aujourd&apos;hui — quota réinitialisé à minuit.
            </p>
          </div>
          <div
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              dailyUsage.remaining > 10
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : dailyUsage.remaining > 5
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {dailyUsage.remaining > 10
              ? 'Bon stock'
              : dailyUsage.remaining > 5
                ? 'Stock modéré'
                : dailyUsage.remaining === 0
                  ? 'Épuisé'
                  : 'Stock faible'}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              dailyQuotaPercentage < 50
                ? 'bg-emerald-400'
                : dailyQuotaPercentage < 80
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
            }`}
            style={{ width: `${dailyQuotaPercentage}%` }}
            role="progressbar"
            aria-valuenow={dailyUsage.count}
            aria-valuemax={dailyUsage.limit}
            aria-label="Quota d'IA quotidien utilisé"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Statistiques globales
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-slate-800/40 border border-white/5">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span className="text-2xl font-black text-white">{stats.totalAnswers}</span>
            <span className="text-[11px] text-slate-400 text-center leading-tight">
              Réponses soumises
            </span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-slate-800/40 border border-white/5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-2xl font-black text-white">{stats.totalAttempts}</span>
            <span className="text-[11px] text-slate-400 text-center leading-tight">
              Séries tentées
            </span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-slate-800/40 border border-white/5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-2xl font-black text-white">{stats.passedAttempts}</span>
            <span className="text-[11px] text-slate-400 text-center leading-tight">
              Niveaux validés
            </span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-slate-800/40 border border-white/5">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-2xl font-black text-white">{stats.bestStreak}</span>
            <span className="text-[11px] text-slate-400 text-center leading-tight">
              Meilleure série
            </span>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Préférences
        </h2>

        {/* Reduce Motion Toggle */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/40 border border-white/5">
          <div className="flex items-start gap-3">
            {reduceMotion ? (
              <ZapOff className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
            ) : (
              <Zap className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold text-slate-200">Réduire les animations</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Désactive les effets visuels de défilement et les transitions complexes. Recommandé
                si vous souffrez d&apos;inconfort lié au mouvement.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={reduceMotion}
            aria-label="Réduire les animations"
            onClick={handleToggleReduceMotion}
            disabled={isPending}
            className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${
              reduceMotion ? 'bg-cyan-500 border-cyan-400' : 'bg-slate-700 border-slate-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                reduceMotion ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
              feedback.ok
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {feedback.ok ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {feedback.message}
          </div>
        )}
      </div>

      {/* Danger Zone / Sign Out */}
      <div className="bg-slate-900/60 border border-rose-500/20 rounded-2xl p-6 sm:p-8 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <LogOut className="w-5 h-5 text-rose-400" />
          Déconnexion
        </h2>
        <p className="text-slate-400 text-sm">
          Vous serez redirigé vers la page de connexion. Votre progression est sauvegardée.
        </p>
        <form action={handleSignOut}>
          <button
            type="submit"
            disabled={isPending}
            className="py-2.5 px-6 rounded-xl font-bold text-sm bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 hover:border-rose-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? 'Déconnexion en cours…' : 'Se déconnecter'}
          </button>
        </form>
      </div>
    </div>
  );
};
