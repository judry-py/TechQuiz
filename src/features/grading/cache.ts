import { GradingOutput } from '@/types/grading';
import { normalizeText } from './pre-checker';

interface CacheEntry {
  result: GradingOutput;
  timestamp: number;
}

// Cache en mémoire pour la route serveur
const memoryCache = new Map<string, CacheEntry>();

/**
 * Génère une clé de cache canonique à partir de l'identifiant de la question
 * et de la réponse normalisée (casse, espaces, accents ignorés).
 */
export function generateCacheKey(questionId: string, userAnswer: string): string {
  const normalized = normalizeText(userAnswer);
  return `${questionId}:${normalized}`;
}

export function getCachedGrading(
  questionId: string,
  userAnswer: string
): GradingOutput | undefined {
  const key = generateCacheKey(questionId, userAnswer);
  const entry = memoryCache.get(key);
  if (entry) {
    return entry.result;
  }
  return undefined;
}

export function setCachedGrading(
  questionId: string,
  userAnswer: string,
  result: GradingOutput
): void {
  const key = generateCacheKey(questionId, userAnswer);
  memoryCache.set(key, {
    result,
    timestamp: Date.now(),
  });
}

export function clearGradingCache(): void {
  memoryCache.clear();
}
