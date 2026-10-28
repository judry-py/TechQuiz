import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  GradingOutput,
  GradingOutputSchema,
  GradingPromptContext,
  GradingProvider,
} from '@/types/grading';
import { GRADING_SYSTEM_PROMPT, buildGradingUserPrompt, extractJsonFromResponse } from './prompt';
import { getServerEnv } from '@/lib/env';

export class GeminiGradingProvider implements GradingProvider {
  readonly name = 'gemini' as const;

  async grade(context: GradingPromptContext): Promise<GradingOutput> {
    const env = getServerEnv();
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY non configurée');
    }

    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: env.GEMINI_MODEL,
      systemInstruction: GRADING_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const userPrompt = buildGradingUserPrompt(context);

    // Tentative 1
    try {
      const result = await this.callModel(model, userPrompt);
      return result;
    } catch (firstError) {
      // Réessai unique en cas d'erreur de parsing ou de validation
      console.warn('⚠️ Gemini : Échec de la tentative 1, réessai unique...', firstError);
      try {
        const result = await this.callModel(
          model,
          userPrompt + '\n\nIMPORTANT: Fournis UNIQUEMENT un JSON valide.'
        );
        return result;
      } catch (secondError) {
        throw new Error(
          `Gemini a échoué après 2 tentatives : ${secondError instanceof Error ? secondError.message : 'Erreur inconnue'}`
        );
      }
    }
  }

  private async callModel(
    model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>,
    prompt: string
  ): Promise<GradingOutput> {
    const response = await model.generateContent(prompt);
    const rawText = response.response.text();
    const jsonStr = extractJsonFromResponse(rawText);

    const parsedJson = JSON.parse(jsonStr);
    const validated = GradingOutputSchema.parse(parsedJson);
    return validated;
  }
}
