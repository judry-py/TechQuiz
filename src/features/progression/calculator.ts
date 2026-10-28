import { CONSTANTS, LevelTierInfo, TierName, WeakArea } from '@/types/progression';

/**
 * Paliers de progression calculés depuis le niveau (1 à 12).
 */
export const TIERS: Record<TierName, LevelTierInfo> = {
  debutant: {
    tier: 'debutant',
    label: 'Débutant',
    minLevel: 1,
    maxLevel: 4,
  },
  intermediaire: {
    tier: 'intermediaire',
    label: 'Intermédiaire',
    minLevel: 5,
    maxLevel: 8,
  },
  avance: {
    tier: 'avance',
    label: 'Avancé',
    minLevel: 9,
    maxLevel: 12,
  },
};

/**
 * Calcule le palier correspondant à un niveau donné (1 à 12).
 */
export function getTierFromLevel(level: number): LevelTierInfo {
  const boundedLevel = Math.max(CONSTANTS.MIN_LEVEL, Math.min(CONSTANTS.MAX_LEVEL, level));

  if (boundedLevel <= 4) {
    return TIERS.debutant;
  }
  if (boundedLevel <= 8) {
    return TIERS.intermediaire;
  }
  return TIERS.avance;
}

/**
 * Calcule la note moyenne sur 10 d'une liste de notes.
 * Arrondie à deux décimales.
 */
export function calculateAverageScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, curr) => acc + curr, 0);
  const average = sum / scores.length;
  return Math.round(average * 100) / 100;
}

/**
 * Détermine si une série est validée (note moyenne >= 7/10).
 */
export function isLevelPassed(averageScore: number): boolean {
  return averageScore >= CONSTANTS.PASSING_SCORE;
}

export interface NextLevelProgression {
  nextLevel: number;
  passed: boolean;
  isMaxLevelReached: boolean;
  isComingSoon: boolean;
}

/**
 * Calcule la transition de niveau suite à une tentative de série.
 *
 * @param currentLevel Niveau actuel (1 à 12)
 * @param averageScore Note moyenne obtenue sur la série
 * @param maxAvailableLevel Niveau maximal actuellement disponible dans le catalogue de questions
 */
export function calculateProgression(
  currentLevel: number,
  averageScore: number,
  maxAvailableLevel: number
): NextLevelProgression {
  const passed = isLevelPassed(averageScore);

  if (!passed) {
    return {
      nextLevel: currentLevel,
      passed: false,
      isMaxLevelReached: false,
      isComingSoon: false,
    };
  }

  // Si validé et au niveau maximum absolu (12)
  if (currentLevel >= CONSTANTS.MAX_LEVEL) {
    return {
      nextLevel: CONSTANTS.MAX_LEVEL,
      passed: true,
      isMaxLevelReached: true,
      isComingSoon: false,
    };
  }

  const nextLevel = currentLevel + 1;
  const isComingSoon = nextLevel > maxAvailableLevel;

  return {
    nextLevel: isComingSoon ? currentLevel : nextLevel,
    passed: true,
    isMaxLevelReached: false,
    isComingSoon,
  };
}

/**
 * Analyse l'historique des réponses pour extraire les sous-thèmes où les notes sont les plus faibles.
 * Triés du plus faible au plus élevé.
 */
export function identifyWeakAreas(
  answers: Array<{ sous_theme: string; note: number }>,
  limit: number = 3
): WeakArea[] {
  if (answers.length === 0) return [];

  const subThemeStats = new Map<string, { totalScore: number; count: number }>();

  for (const answer of answers) {
    const theme = answer.sous_theme;
    const current = subThemeStats.get(theme) ?? { totalScore: 0, count: 0 };
    subThemeStats.set(theme, {
      totalScore: current.totalScore + answer.note,
      count: current.count + 1,
    });
  }

  const weakAreas: WeakArea[] = Array.from(subThemeStats.entries()).map(([subTheme, stat]) => ({
    subTheme,
    averageScore: Math.round((stat.totalScore / stat.count) * 10) / 10,
    totalAnswers: stat.count,
  }));

  // Tri par note moyenne croissante (les plus faibles d'abord)
  weakAreas.sort((a, b) => a.averageScore - b.averageScore);

  return weakAreas.slice(0, limit);
}

/**
 * Calcule la série de réussites consécutives (streak) à partir de l'historique récent des tentatives.
 */
export function calculateStreak(attempts: Array<{ valide: boolean }>): number {
  let streak = 0;
  for (const attempt of attempts) {
    if (attempt.valide) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}
