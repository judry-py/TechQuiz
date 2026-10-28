export type TierName = 'debutant' | 'intermediaire' | 'avance';

export interface LevelTierInfo {
  tier: TierName;
  label: string;
  minLevel: number;
  maxLevel: number;
}

export const CONSTANTS = {
  QUESTIONS_PER_SERIES: 12,
  PASSING_SCORE: 7, // note >= 7/10 pour valider un niveau
  MAX_LEVEL: 12,
  MIN_LEVEL: 1,
  DEFAULT_DAILY_LIMIT: 20,
} as const;

export interface DomainProgressState {
  domain: string;
  currentLevel: number;
  currentSeriesNumber: number;
  lastActivity: string;
}

export interface LevelAttemptResult {
  domain: string;
  level: number;
  averageScore: number;
  passed: boolean;
  totalQuestions: number;
}

export interface WeakArea {
  subTheme: string;
  averageScore: number;
  totalAnswers: number;
}
