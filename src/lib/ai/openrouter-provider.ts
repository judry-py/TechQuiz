import {
  GradingOutput,
  GradingOutputSchema,
  GradingPromptContext,
  GradingProvider,
} from '@/types/grading';
import { GRADING_SYSTEM_PROMPT, buildGradingUserPrompt, extractJsonFromResponse } from './prompt';
import { getServerEnv } from '@/lib/env';

export class OpenRouterGradingProvider implements GradingProvider {
  readonly name = 'openrouter' as const;

  async grade(context: GradingPromptContext): Promise<GradingOutput> {
    const env = getServerEnv();
    if (!env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY non configurée');
    }

    const userPrompt = buildGradingUserPrompt(context);

    // Tentative 1
    try {
      return await this.callApi(env.OPENROUTER_API_KEY, env.OPENROUTER_MODEL, userPrompt);
    } catch (firstError) {
      console.warn('⚠️ OpenRouter : Échec de la tentative 1, réessai unique...', firstError);
      try {
        return await this.callApi(
          env.OPENROUTER_API_KEY,
          env.OPENROUTER_MODEL,
          userPrompt + '\n\nIMPORTANT: Fournis UNIQUEMENT un JSON valide.'
        );
      } catch (secondError) {
        throw new Error(
          `OpenRouter a échoué après 2 tentatives : ${secondError instanceof Error ? secondError.message : 'Erreur inconnue'}`
        );
      }
    }
  }

  private async callApi(apiKey: string, model: string, userPrompt: string): Promise<GradingOutput> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // Timeout 20s

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://techquiz.app',
          'X-Title': 'TechQuiz Platform',
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            { role: 'system', content: GRADING_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content || typeof content !== 'string') {
        throw new Error('Réponse OpenRouter vide ou format inattendu');
      }

      const jsonStr = extractJsonFromResponse(content);
      const parsed = JSON.parse(jsonStr);
      return GradingOutputSchema.parse(parsed);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
