'use server';

import { createClient } from '@/lib/supabase/server';
import { DOMAINS, getDomainConfig } from '@/config/domains';
import { getDomainQuestionsByLevel, getMaxAvailableLevel } from '@/features/questions/loader';
import { selectSeriesQuestions } from '@/features/questions/selector';
import { SafeQuestionSchema, SafeQuestion } from '@/types/question';
import { CONSTANTS, LevelTierInfo, WeakArea } from '@/types/progression';
import {
  calculateAverageScore,
  calculateProgression,
  getTierFromLevel,
  identifyWeakAreas,
  calculateStreak,
} from '@/features/progression/calculator';
import { checkUserDailyLimit } from '@/features/grading/daily-limit';

export interface DomainProgressSummary {
  domainSlug: string;
  domainName: string;
  currentLevel: number;
  seriesNumber: number;
  maxAvailableLevel: number;
  tierInfo: LevelTierInfo;
  isComingSoon: boolean;
  isMaxReached: boolean;
  percentage: number;
}

export interface QuizSeriesData {
  domainSlug: string;
  domainName: string;
  currentLevel: number;
  seriesNumber: number;
  tierInfo: LevelTierInfo;
  maxAvailableLevel: number;
  isComingSoon: boolean;
  questions: SafeQuestion[];
}

export interface SubmitSeriesResultPayload {
  domainSlug: string;
  level: number;
  scores: number[];
  answersSummary: Array<{
    question_id: string;
    sous_theme: string;
    note: number;
  }>;
}

export interface SubmitSeriesResultResponse {
  success: boolean;
  domainSlug: string;
  currentLevel: number;
  averageScore: number;
  passed: boolean;
  nextLevel: number;
  isComingSoon: boolean;
  isMaxLevelReached: boolean;
  tierInfo: LevelTierInfo;
}

export interface DashboardData {
  domains: DomainProgressSummary[];
  streak: number;
  weakAreas: WeakArea[];
  totalAnswersCount: number;
  recentAttempts: Array<{
    id: string;
    domaine: string;
    niveau: number;
    note_moyenne: number;
    valide: boolean;
    created_at: string;
  }>;
  dailyRemainingCorrections: number;
}

export interface ProfileData {
  user: {
    id: string;
    email?: string;
  };
  profile: {
    pseudo: string;
    reduce_motion: boolean;
    created_at: string;
  };
  dailyUsage: {
    count: number;
    limit: number;
    remaining: number;
  };
  stats: {
    totalAttempts: number;
    passedAttempts: number;
    totalAnswers: number;
    bestStreak: number;
  };
}

/**
 * Récupère la progression de l'utilisateur pour l'ensemble des 4 domaines.
 */
export async function getAllDomainsProgressAction(): Promise<DomainProgressSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Utilisateur non authentifié');
  }

  const { data: records } = await supabase
    .from('domain_progress')
    .select('domaine, niveau_courant, numero_serie')
    .eq('user_id', user.id);

  const progressMap = new Map<string, { niveau: number; serie: number }>();
  if (records) {
    for (const record of records) {
      progressMap.set(record.domaine, {
        niveau: record.niveau_courant,
        serie: record.numero_serie,
      });
    }
  }

  const domainSlugs = Object.keys(DOMAINS);
  const result: DomainProgressSummary[] = domainSlugs.map((slug) => {
    const config = DOMAINS[slug];
    const userProgress = progressMap.get(slug);
    const currentLevel = userProgress?.niveau ?? 1;
    const seriesNumber = userProgress?.serie ?? 1;
    const maxAvailable = getMaxAvailableLevel(slug);
    const tier = getTierFromLevel(currentLevel);
    const isComingSoon = currentLevel > maxAvailable;
    const isMaxReached = currentLevel >= CONSTANTS.MAX_LEVEL;
    const percentage = Math.min(100, Math.round((currentLevel / CONSTANTS.MAX_LEVEL) * 100));

    return {
      domainSlug: slug,
      domainName: config?.name ?? slug,
      currentLevel,
      seriesNumber,
      maxAvailableLevel: maxAvailable,
      tierInfo: tier,
      isComingSoon,
      isMaxReached,
      percentage,
    };
  });

  return result;
}

/**
 * Prépare et sélectionne les 12 questions pour une série de quiz sur un domaine.
 * Les réponses de référence sont strictement filtrées avant l'envoi au client.
 */
export async function getQuizSeriesQuestionsAction(domainSlug: string): Promise<QuizSeriesData> {
  const domainConfig = getDomainConfig(domainSlug);
  if (!domainConfig) {
    throw new Error(`Domaine invalide : ${domainSlug}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Utilisateur non authentifié');
  }

  // Obtenir le niveau actuel du joueur dans ce domaine
  const { data: progress } = await supabase
    .from('domain_progress')
    .select('niveau_courant, numero_serie')
    .eq('user_id', user.id)
    .eq('domaine', domainSlug)
    .maybeSingle();

  const currentLevel = progress?.niveau_courant ?? 1;
  const seriesNumber = progress?.numero_serie ?? 1;
  const maxAvailable = getMaxAvailableLevel(domainSlug);
  const tierInfo = getTierFromLevel(currentLevel);

  if (currentLevel > maxAvailable) {
    return {
      domainSlug,
      domainName: domainConfig.name,
      currentLevel,
      seriesNumber,
      tierInfo,
      maxAvailableLevel: maxAvailable,
      isComingSoon: true,
      questions: [],
    };
  }

  // Charger le pool complet de questions pour ce niveau
  const pool = getDomainQuestionsByLevel(domainSlug, currentLevel);

  // Charger l'historique des réponses de l'utilisateur pour ce niveau
  const { data: answersHistory } = await supabase
    .from('answers')
    .select('question_id, note, created_at')
    .eq('user_id', user.id)
    .eq('domaine', domainSlug)
    .eq('niveau', currentLevel);

  // Sélectionner exactement 12 questions selon l'algorithme métier
  const selectedQuestions = selectSeriesQuestions({
    pool,
    history: answersHistory ?? [],
    count: CONSTANTS.QUESTIONS_PER_SERIES,
  });

  // Assainir les questions : retirer reponse_reference et mots_cles_attendus
  const safeQuestions: SafeQuestion[] = selectedQuestions.map((q) =>
    SafeQuestionSchema.parse({
      id: q.id,
      domaine: q.domaine,
      sous_theme: q.sous_theme,
      niveau: q.niveau,
      type: q.type,
      question: q.question,
    })
  );

  return {
    domainSlug,
    domainName: domainConfig.name,
    currentLevel,
    seriesNumber,
    tierInfo,
    maxAvailableLevel: maxAvailable,
    isComingSoon: false,
    questions: safeQuestions,
  };
}

/**
 * Valide et enregistre le résultat d'une série de quiz terminée.
 */
export async function submitSeriesResultAction(
  payload: SubmitSeriesResultPayload
): Promise<SubmitSeriesResultResponse> {
  const { domainSlug, level, scores } = payload;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Utilisateur non authentifié');
  }

  const averageScore = calculateAverageScore(scores);
  const maxAvailable = getMaxAvailableLevel(domainSlug);
  const progression = calculateProgression(level, averageScore, maxAvailable);
  const tierInfo = getTierFromLevel(progression.nextLevel);

  // 1. Enregistrer la tentative dans level_attempts
  await supabase.from('level_attempts').insert({
    user_id: user.id,
    domaine: domainSlug,
    niveau: level,
    note_moyenne: averageScore,
    valide: progression.passed,
  });

  // 2. Mettre à jour la progression du domaine
  const { data: existingProgress } = await supabase
    .from('domain_progress')
    .select('id, numero_serie')
    .eq('user_id', user.id)
    .eq('domaine', domainSlug)
    .maybeSingle();

  const nextSeriesNum = (existingProgress?.numero_serie ?? 0) + 1;

  if (existingProgress) {
    await supabase
      .from('domain_progress')
      .update({
        niveau_courant: progression.nextLevel,
        numero_serie: nextSeriesNum,
        derniere_activite: new Date().toISOString(),
      })
      .eq('id', existingProgress.id);
  } else {
    await supabase.from('domain_progress').insert({
      user_id: user.id,
      domaine: domainSlug,
      niveau_courant: progression.nextLevel,
      numero_serie: nextSeriesNum,
      derniere_activite: new Date().toISOString(),
    });
  }

  return {
    success: true,
    domainSlug,
    currentLevel: level,
    averageScore,
    passed: progression.passed,
    nextLevel: progression.nextLevel,
    isComingSoon: progression.isComingSoon,
    isMaxLevelReached: progression.isMaxLevelReached,
    tierInfo,
  };
}

/**
 * Récupère les données consolidées pour le tableau de bord utilisateur.
 */
export async function getDashboardDataAction(): Promise<DashboardData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Utilisateur non authentifié');
  }

  // 1. Domaines
  const domains = await getAllDomainsProgressAction();

  // 2. Tentatives récentes pour le streak et l'historique
  const { data: recentAttempts } = await supabase
    .from('level_attempts')
    .select('id, domaine, niveau, note_moyenne, valide, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const streak = calculateStreak(recentAttempts ?? []);

  // 3. Réponses récentes pour identifier les points faibles
  const { data: recentAnswers, count: totalAnswersCount } = await supabase
    .from('answers')
    .select('question_id, note', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  // Pour extraire le sous-thème de chaque réponse
  const answersWithSubTheme: Array<{ sous_theme: string; note: number }> = [];
  if (recentAnswers) {
    const domainQuestionsMap = new Map<string, string>();
    for (const ans of recentAnswers) {
      let subTheme = domainQuestionsMap.get(ans.question_id);
      if (!subTheme) {
        // Charger via question_id si possible
        const { getQuestionById } = await import('@/features/questions/loader');
        const q = getQuestionById(ans.question_id);
        if (q) {
          subTheme = q.sous_theme;
          domainQuestionsMap.set(ans.question_id, subTheme);
        }
      }
      if (subTheme) {
        answersWithSubTheme.push({
          sous_theme: subTheme,
          note: ans.note,
        });
      }
    }
  }

  const weakAreas = identifyWeakAreas(answersWithSubTheme, 3);

  // 4. Quota quotidien restant
  const quota = await checkUserDailyLimit(user.id, supabase);

  return {
    domains,
    streak,
    weakAreas,
    totalAnswersCount: totalAnswersCount ?? 0,
    recentAttempts: recentAttempts ?? [],
    dailyRemainingCorrections: quota.remaining,
  };
}

/**
 * Récupère les données complètes du profil utilisateur.
 */
export async function getProfileDataAction(): Promise<ProfileData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Utilisateur non authentifié');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('pseudo, reduce_motion, created_at')
    .eq('id', user.id)
    .single();

  const quota = await checkUserDailyLimit(user.id, supabase);

  const { data: allAttempts, count: totalAttempts } = await supabase
    .from('level_attempts')
    .select('valide, created_at', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const passedAttempts = allAttempts ? allAttempts.filter((a) => a.valide).length : 0;
  const streak = calculateStreak(allAttempts ?? []);

  const { count: totalAnswers } = await supabase
    .from('answers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile: {
      pseudo: profile?.pseudo ?? user.email?.split('@')[0] ?? 'Utilisateur',
      reduce_motion: profile?.reduce_motion ?? false,
      created_at: profile?.created_at ?? new Date().toISOString(),
    },
    dailyUsage: {
      count: CONSTANTS.DEFAULT_DAILY_LIMIT - quota.remaining,
      limit: CONSTANTS.DEFAULT_DAILY_LIMIT,
      remaining: quota.remaining,
    },
    stats: {
      totalAttempts: totalAttempts ?? 0,
      passedAttempts,
      totalAnswers: totalAnswers ?? 0,
      bestStreak: streak,
    },
  };
}
