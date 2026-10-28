import { z } from 'zod';

export const QuestionTypeSchema = z.enum(['definition', 'scenario']);
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

export const QuestionSchema = z.object({
  id: z.string().min(1, 'ID obligatoire'),
  domaine: z.string().min(1, 'Domaine obligatoire'),
  sous_theme: z.string().min(1, 'Sous-thème obligatoire'),
  niveau: z.number().int().min(1).max(12),
  type: QuestionTypeSchema,
  question: z.string().min(3, 'Question trop courte'),
  reponse_reference: z.string().min(3, 'Réponse de référence trop courte'),
  mots_cles_attendus: z.array(z.string().min(1)).min(1, 'Au moins un mot-clé requis'),
});

export type Question = z.infer<typeof QuestionSchema>;

/**
 * Version sécurisée envoyée au client :
 * La réponse de référence et les mots-clés ne doivent JAMAIS être envoyés
 * avant que l'utilisateur n'ait répondu et reçu sa correction.
 */
export const SafeQuestionSchema = QuestionSchema.omit({
  reponse_reference: true,
  mots_cles_attendus: true,
});

export type SafeQuestion = z.infer<typeof SafeQuestionSchema>;
