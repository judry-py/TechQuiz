import { GradingOutput } from '@/types/grading';

export interface PreCheckParams {
  userAnswer: string;
  expectedKeywords: string[];
  questionType: 'definition' | 'scenario';
}

export interface PreCheckResult {
  shouldCallAI: boolean;
  result?: GradingOutput;
}

/**
 * Normalise un texte : minuscules, suppression des accents, des espaces superflus et de la ponctuation.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques (accents)
    .replace(/[^\w\s]/gi, ' ') // Remplace la ponctuation par des espaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calcule la distance de Levenshtein entre deux chaînes courtes.
 * Utilisé pour la tolérance aux fautes de frappe sur les mots-clés.
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]!;
      } else {
        dp[i]![j] = 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);
      }
    }
  }

  return dp[m]![n]!;
}

/**
 * Vérifie si un mot-clé attendu est présent ou approché dans le texte normalisé.
 */
export function isKeywordPresent(keyword: string, normalizedText: string): boolean {
  const normKeyword = normalizeText(keyword);
  if (!normKeyword) return false;

  // 1. Présence exacte du mot ou de l'expression
  if (normalizedText.includes(normKeyword)) {
    return true;
  }

  // 2. Si le mot-clé est un mot simple (au moins 4 lettres), recherche de terme approché (faute de frappe)
  const words = normalizedText.split(' ').filter((w) => w.length >= 3);
  const keywordWords = normKeyword.split(' ');

  if (keywordWords.length === 1 && normKeyword.length >= 4) {
    for (const word of words) {
      const maxDistance = normKeyword.length >= 7 ? 2 : 1;
      if (Math.abs(word.length - normKeyword.length) <= maxDistance) {
        if (levenshteinDistance(word, normKeyword) <= maxDistance) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Pré-tri sans IA :
 * Si la réponse est vide, trop courte ou ne contient aucun mot-clé attendu ni terme proche,
 * on renvoie directement une note basse avec un retour pédagogique sans appeler l'API.
 */
export function preCheckAnswer({
  userAnswer,
  expectedKeywords,
  questionType,
}: PreCheckParams): PreCheckResult {
  const cleanAnswer = userAnswer.trim();

  // 1. Réponse vide ou quasi-vide
  if (cleanAnswer.length === 0) {
    return {
      shouldCallAI: false,
      result: {
        note: 0,
        points_corrects: [],
        points_manquants: ['Aucune réponse fournie.'],
        commentaire: 'Vous devez saisir une réponse pour être évalué.',
      },
    };
  }

  // 2. Réponse trop courte pour formuler un concept
  if (cleanAnswer.length < 5) {
    return {
      shouldCallAI: false,
      result: {
        note: 0,
        points_corrects: [],
        points_manquants: ['Réponse trop succincte pour être évaluée.'],
        commentaire:
          'Votre réponse est trop courte. Développez davantage votre pensée avec vos propres mots.',
      },
    };
  }

  const normalized = normalizeText(cleanAnswer);

  // 3. Décompte des mots-clés attendus ou termes approchés présents
  const matchedKeywords = expectedKeywords.filter((kw) => isKeywordPresent(kw, normalized));

  // 4. Si AUCUN mot-clé n'est présent ET que la réponse fait moins de 40 caractères,
  // il s'agit d'un hors-sujet flagrant ou d'un texte aléatoire (ex: "je sais pas", "asdfgh")
  if (matchedKeywords.length === 0 && cleanAnswer.length < 40) {
    return {
      shouldCallAI: false,
      result: {
        note: 1,
        points_corrects: [],
        points_manquants: [
          "Aucun des concepts attendus n'est abordé dans votre réponse.",
          ...expectedKeywords.slice(0, 2).map((k) => `Notion attendue : "${k}"`),
        ],
        commentaire:
          questionType === 'scenario'
            ? "Votre analyse ne traite pas les éléments techniques de la mise en situation. Consultez la solution de référence pour voir l'approche attendue."
            : 'La réponse ne semble pas aborder les éléments clés de la question. Consultez la réponse de référence pour consolider vos connaissances.',
      },
    };
  }

  // La réponse contient au moins un élément pertinent ou est suffisamment rédigée pour mériter l'évaluation de l'IA
  return {
    shouldCallAI: true,
  };
}
