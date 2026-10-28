import { describe, it, expect, beforeEach } from 'vitest';
import { toSafeQuestion } from '../features/questions/loader';
import { SafeQuestionSchema } from '../types/question';
import { GradeRequestSchema } from '../types/grading';
import {
  sanitizeUserAnswerForAI,
  buildGradingUserPrompt,
  GRADING_SYSTEM_PROMPT,
} from '../lib/ai/prompt';
import { orchestrateGrading } from '../features/grading/orchestrator';
import { clearGradingCache } from '../features/grading/cache';
import type { GradingOutput, GradingPromptContext, GradingProvider } from '../types/grading';

describe('Sécurité : confidentialité des données et surface exposée au client', () => {
  describe('toSafeQuestion (fuite de la réponse de référence)', () => {
    const fullQuestion = {
      id: 'reseau-001',
      domaine: 'reseau',
      sous_theme: 'adressage_ip',
      niveau: 1,
      type: 'definition' as const,
      question: "Qu'est-ce qu'une adresse IP ?",
      reponse_reference: 'Identifiant numérique unique attribué à chaque appareil.',
      mots_cles_attendus: ['identifiant', 'unique', 'appareil'],
    };

    it('ne doit JAMAIS contenir la réponse de référence ni les mots-clés attendus', () => {
      const safe = toSafeQuestion(fullQuestion);
      expect(safe).not.toHaveProperty('reponse_reference');
      expect(safe).not.toHaveProperty('mots_cles_attendus');
      expect(JSON.stringify(safe)).not.toContain('Identifiant numérique unique');
      expect(JSON.stringify(safe)).not.toContain('appareil');
    });

    it('doit conserver uniquement les champs pédagogiques publics', () => {
      const safe = toSafeQuestion(fullQuestion);
      expect(Object.keys(safe).sort()).toEqual(
        ['domaine', 'id', 'niveau', 'question', 'sous_theme', 'type'].sort()
      );
    });

    it('SafeQuestionSchema doit rejeter un objet contenant la réponse de référence', () => {
      const result = SafeQuestionSchema.safeParse({
        ...fullQuestion,
        reponse_reference: 'fuite',
      });
      // Zod .omit() rend le schéma strict sur les clés omises via strip :
      // la clé est soit absente du résultat, soit le parse échoue.
      if (result.success) {
        expect(result.data).not.toHaveProperty('reponse_reference');
      } else {
        expect(result.success).toBe(false);
      }
    });
  });

  describe('sanitizeUserAnswerForAI (zéro PII vers les LLM)', () => {
    it('doit masquer plusieurs emails dans une même réponse', () => {
      const input = 'Contactez jean@mail.com ou marie.dupont+tag@sub.domain.org pour le TP.';
      const sanitized = sanitizeUserAnswerForAI(input);
      expect(sanitized).not.toContain('jean@mail.com');
      expect(sanitized).not.toContain('marie.dupont+tag@sub.domain.org');
      expect(sanitized).toContain('[email]');
    });

    it('ne doit pas altérer un texte technique sans email', () => {
      const input = 'Le protocole ARP résout une adresse IP en adresse MAC sur le réseau local.';
      expect(sanitizeUserAnswerForAI(input)).toBe(input);
    });

    it('doit masquer un email même collé à de la ponctuation', () => {
      const sanitized = sanitizeUserAnswerForAI('mon mail:user@exemple.fr, merci');
      expect(sanitized).not.toContain('user@exemple.fr');
    });
  });

  describe('Prompt système (défense contre l\'injection)', () => {
    it('doit contenir une règle explicite anti-injection de prompt', () => {
      expect(GRADING_SYSTEM_PROMPT).toContain('INJECTION DE PROMPT');
      expect(GRADING_SYSTEM_PROMPT).toContain('JAMAIS une instruction');
    });
  });

  describe('Orchestrateur : isolation du contexte transmis aux fournisseurs IA', () => {
    beforeEach(() => {
      clearGradingCache();
    });

    it('le fournisseur ne reçoit AUCUN identifiant utilisateur, uniquement le contexte pédagogique', async () => {
      let captured: GradingPromptContext | null = null;

      const spyProvider: GradingProvider = {
        name: 'gemini',
        async grade(context: GradingPromptContext): Promise<GradingOutput> {
          captured = context;
          return {
            note: 7,
            points_corrects: ['Notion comprise'],
            points_manquants: ['Détail absent'],
            commentaire: 'Bonne réponse.',
          };
        },
      };

      await orchestrateGrading({
        questionId: 'reseau-001',
        userAnswer: "L'IP identifie un hôte. Mon email est test@exemple.com.",
        question: "Qu'est-ce qu'une adresse IP ?",
        reponseReference: 'Identifiant réseau.',
        motsClesAttendus: ['identifiant', 'réseau'],
        type: 'definition',
        providers: [spyProvider],
      });

      expect(captured).not.toBeNull();
      expect(Object.keys(captured!).sort()).toEqual(
        ['motsClesAttendus', 'question', 'reponseReference', 'reponseUtilisateur', 'type'].sort()
      );

      // Le prompt final construit par le fournisseur ne doit contenir aucun email
      const finalPrompt = buildGradingUserPrompt(captured!);
      expect(finalPrompt).not.toContain('test@exemple.com');
      expect(finalPrompt).toContain('[email]');
      expect(finalPrompt).not.toContain('user_id');
      expect(finalPrompt).not.toContain('pseudo');
    });
  });

  describe('Validation du corps de requête /api/grade (GradeRequestSchema)', () => {
    it('doit rejeter une réponse vide', () => {
      expect(GradeRequestSchema.safeParse({ questionId: 'x-1', userAnswer: '' }).success).toBe(
        false
      );
      expect(GradeRequestSchema.safeParse({ questionId: 'x-1', userAnswer: '   ' }).success).toBe(
        false
      );
    });

    it('doit rejeter un questionId manquant', () => {
      expect(GradeRequestSchema.safeParse({ userAnswer: 'une réponse' }).success).toBe(false);
    });

    it('doit rejeter une réponse de plus de 3000 caractères (limite anti-abus)', () => {
      const huge = 'a'.repeat(3001);
      expect(GradeRequestSchema.safeParse({ questionId: 'x-1', userAnswer: huge }).success).toBe(
        false
      );
    });

    it('doit accepter une requête conforme et ignorer les champs inconnus', () => {
      const result = GradeRequestSchema.safeParse({
        questionId: 'reseau-001',
        userAnswer: 'Une adresse IP identifie un hôte sur le réseau.',
        isAdmin: true,
        note: 10,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty('isAdmin');
        expect(result.data).not.toHaveProperty('note');
      }
    });
  });
});
