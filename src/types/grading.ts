import { z } from 'zod';

export const GradingOutputSchema = z.object({
  note: z.number().int().min(0).max(10),
  points_corrects: z.array(z.string().min(1)),
  points_manquants: z.array(z.string().min(1)),
  commentaire: z.string().min(1),
});

export type GradingOutput = z.infer<typeof GradingOutputSchema>;

export interface GradingResult extends GradingOutput {
  reponse_reference: string;
  fournisseur: 'gemini' | 'openrouter' | 'cache' | 'pre-check';
}

export const GradeRequestSchema = z.object({
  questionId: z.string().min(1, 'ID de question requis'),
  userAnswer: z
    .string()
    .trim()
    .min(1, 'La réponse ne peut pas être vide')
    .max(3000, 'La réponse ne doit pas dépasser 3000 caractères'),
});

export type GradeRequest = z.infer<typeof GradeRequestSchema>;

export interface GradingPromptContext {
  question: string;
  reponseReference: string;
  motsClesAttendus: string[];
  reponseUtilisateur: string;
  type: 'definition' | 'scenario';
}

export interface GradingProvider {
  readonly name: 'gemini' | 'openrouter';
  grade(context: GradingPromptContext): Promise<GradingOutput>;
}
