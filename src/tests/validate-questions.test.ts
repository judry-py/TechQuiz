import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { QuestionSchema, Question } from '../types/question';
import { DOMAINS } from '../config/domains';

describe('Validation des fichiers de questions (Zod & intégrité)', () => {
  const questionsDir = path.resolve(__dirname, '../data/questions');
  const allQuestionIds = new Set<string>();

  Object.entries(DOMAINS).forEach(([domainKey, domainConfig]) => {
    describe(`Domaine : ${domainConfig.name} (${domainKey})`, () => {
      const filePath = path.join(questionsDir, domainConfig.questionFile);

      it(`le fichier ${domainConfig.questionFile} doit exister et être un JSON valide`, () => {
        expect(fs.existsSync(filePath)).toBe(true);
        const rawContent = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(rawContent);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBeGreaterThan(0);
      });

      it(`chaque question doit respecter le schéma Zod et les règles métier`, () => {
        const rawContent = fs.readFileSync(filePath, 'utf-8');
        const questions: unknown[] = JSON.parse(rawContent);
        const domainIds = new Set<string>();

        questions.forEach((rawQ, index) => {
          // Validation Zod
          const result = QuestionSchema.safeParse(rawQ);
          if (!result.success) {
            throw new Error(
              `Erreur de validation dans ${domainConfig.questionFile} à l'index ${index} (ID: ${(rawQ as Question)?.id}) : ${JSON.stringify(result.error.format())}`
            );
          }

          const q = result.data;

          // Vérification du domaine
          expect(q.domaine).toBe(domainKey);

          // Niveau entre 1 et 12
          expect(q.niveau).toBeGreaterThanOrEqual(1);
          expect(q.niveau).toBeLessThanOrEqual(12);

          // Type valide
          expect(['definition', 'scenario']).toContain(q.type);

          // Unicité des ID au sein du domaine
          expect(domainIds.has(q.id)).toBe(false);
          domainIds.add(q.id);

          // Unicité des ID au sein de toute l'application
          expect(allQuestionIds.has(q.id)).toBe(false);
          allQuestionIds.add(q.id);

          // Mots-clés attendus non vides
          expect(q.mots_cles_attendus.length).toBeGreaterThanOrEqual(1);
          q.mots_cles_attendus.forEach((keyword) => {
            expect(keyword.trim().length).toBeGreaterThan(0);
          });

          // Textes non vides
          expect(q.question.trim().length).toBeGreaterThanOrEqual(5);
          expect(q.reponse_reference.trim().length).toBeGreaterThanOrEqual(10);
        });
      });
    });
  });
});
