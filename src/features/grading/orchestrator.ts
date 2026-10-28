import {
  GradingOutput,
  GradingPromptContext,
  GradingProvider,
  GradingResult,
} from '@/types/grading';
import { preCheckAnswer } from './pre-checker';
import { getCachedGrading, setCachedGrading } from './cache';
import { GeminiGradingProvider } from '@/lib/ai/gemini-provider';
import { OpenRouterGradingProvider } from '@/lib/ai/openrouter-provider';

export interface OrchestratorParams {
  questionId: string;
  userAnswer: string;
  question: string;
  reponseReference: string;
  motsClesAttendus: string[];
  type: 'definition' | 'scenario';
  providers?: GradingProvider[]; // Injectable pour les tests unitaires
}

/**
 * Orchestrateur de correction :
 * 1. Vérification du cache de réponses normalisées.
 * 2. Pré-tri sans IA (réponse vide, trop courte ou hors-sujet sans mots-clés).
 * 3. Appel de l'IA principale (Gemini).
 * 4. Bascule automatique sur OpenRouter en cas d'erreur/dépassement de quota/timeout.
 * 5. Mise en cache du résultat et retour.
 */
export async function orchestrateGrading({
  questionId,
  userAnswer,
  question,
  reponseReference,
  motsClesAttendus,
  type,
  providers,
}: OrchestratorParams): Promise<GradingResult> {
  // 1. Vérification du cache
  const cached = getCachedGrading(questionId, userAnswer);
  if (cached) {
    return {
      ...cached,
      reponse_reference: reponseReference,
      fournisseur: 'cache',
    };
  }

  // 2. Pré-tri sans IA
  const preCheck = preCheckAnswer({
    userAnswer,
    expectedKeywords: motsClesAttendus,
    questionType: type,
  });

  if (!preCheck.shouldCallAI && preCheck.result) {
    // Mettre en cache pour éviter les réévaluations inutiles
    setCachedGrading(questionId, userAnswer, preCheck.result);
    return {
      ...preCheck.result,
      reponse_reference: reponseReference,
      fournisseur: 'pre-check',
    };
  }

  // 3. Fournisseurs IA (par défaut : Gemini puis OpenRouter)
  const activeProviders = providers ?? [
    new GeminiGradingProvider(),
    new OpenRouterGradingProvider(),
  ];

  const context: GradingPromptContext = {
    question,
    reponseReference,
    motsClesAttendus,
    reponseUtilisateur: userAnswer,
    type,
  };

  let lastError: Error | null = null;

  for (const provider of activeProviders) {
    try {
      const output: GradingOutput = await provider.grade(context);

      // Succès : mise en cache
      setCachedGrading(questionId, userAnswer, output);

      return {
        ...output,
        reponse_reference: reponseReference,
        fournisseur: provider.name,
      };
    } catch (err) {
      console.warn(
        `⚠️ Échec du fournisseur IA [${provider.name}]. Bascule sur le suivant...`,
        err instanceof Error ? err.message : err
      );
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  // Si tous les fournisseurs ont échoué
  throw new Error(
    `Tous les services d'évaluation IA sont temporairement indisponibles : ${lastError?.message ?? 'Erreur réseau'}`
  );
}
