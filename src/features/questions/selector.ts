import { Question } from '@/types/question';
import { CONSTANTS } from '@/types/progression';

export interface QuestionHistoryItem {
  question_id: string;
  note: number;
  created_at: string;
}

export interface SelectQuestionsOptions {
  pool: Question[];
  history: QuestionHistoryItem[];
  count?: number;
  randomFn?: () => number; // Injection optionnelle pour les tests déterministes
}

/**
 * Mélange un tableau avec l'algorithme Fisher-Yates (non destructif).
 */
export function shuffleArray<T>(array: readonly T[], randomFn: () => number = Math.random): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}

/**
 * Sélectionne les questions d'une série selon les règles métier :
 * 1. Exactement 12 questions (ou la taille disponible du pool si inférieure).
 * 2. Sans aucun doublon.
 * 3. Priorité absolue aux questions jamais vues.
 * 4. Si toutes ont déjà été vues, priorité à celles avec la plus mauvaise note et les moins récemment vues.
 */
export function selectSeriesQuestions({
  pool,
  history,
  count = CONSTANTS.QUESTIONS_PER_SERIES,
  randomFn = Math.random,
}: SelectQuestionsOptions): Question[] {
  if (pool.length === 0) return [];

  // Si le pool a moins ou exactement le nombre requis, on le mélange et le renvoie sans doublon
  if (pool.length <= count) {
    return shuffleArray(pool, randomFn);
  }

  // Agréger l'historique par question_id (dernière date de passage et pire note obtenue)
  const historyMap = new Map<string, { lastSeen: number; minScore: number }>();
  for (const item of history) {
    const existing = historyMap.get(item.question_id);
    const itemDate = new Date(item.created_at).getTime();

    if (!existing) {
      historyMap.set(item.question_id, {
        lastSeen: itemDate,
        minScore: item.note,
      });
    } else {
      historyMap.set(item.question_id, {
        lastSeen: Math.max(existing.lastSeen, itemDate),
        minScore: Math.min(existing.minScore, item.note),
      });
    }
  }

  const neverSeen: Question[] = [];
  const alreadySeen: Array<{ question: Question; lastSeen: number; minScore: number }> = [];

  for (const question of pool) {
    const stats = historyMap.get(question.id);
    if (!stats) {
      neverSeen.push(question);
    } else {
      alreadySeen.push({
        question,
        lastSeen: stats.lastSeen,
        minScore: stats.minScore,
      });
    }
  }

  // Cas 1 : Assez de questions jamais vues pour remplir toute la série
  if (neverSeen.length >= count) {
    const shuffledNeverSeen = shuffleArray(neverSeen, randomFn);
    return shuffledNeverSeen.slice(0, count);
  }

  // Cas 2 : Pas assez de questions jamais vues -> on prend toutes les jamais vues, et on complète avec les déjà vues
  const selected: Question[] = shuffleArray(neverSeen, randomFn);
  const needed = count - selected.length;

  // Tri des questions déjà vues :
  // Priorité 1 : La note la plus basse (question la moins bien comprise)
  // Priorité 2 : La date la plus ancienne (vue le moins récemment)
  alreadySeen.sort((a, b) => {
    if (a.minScore !== b.minScore) {
      return a.minScore - b.minScore; // Score le plus bas en premier
    }
    return a.lastSeen - b.lastSeen; // Vue la plus ancienne en premier
  });

  const pickedFromSeen = alreadySeen.slice(0, needed).map((item) => item.question);
  selected.push(...pickedFromSeen);

  // Mélange final pour que les questions vues/non-vues soient réparties harmonieusement
  return shuffleArray(selected, randomFn);
}
