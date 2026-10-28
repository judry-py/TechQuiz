import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadDomainQuestions,
  getDomainQuestionsByLevel,
  getMaxAvailableLevel,
  getQuestionById,
  toSafeQuestion,
} from '../features/questions/loader';
import { selectSeriesQuestions } from '../features/questions/selector';
import { orchestrateGrading } from '../features/grading/orchestrator';
import { clearGradingCache } from '../features/grading/cache';
import { getAllDomains, DOMAIN_SLUGS } from '../config/domains';
import type { GradingOutput, GradingProvider } from '../types/grading';

/**
 * Tests d'intégration : vérifient le flux complet à travers plusieurs modules
 * et sur les VRAIS fichiers de données (loader → selector → safe question → orchestrateur).
 * Aucun appel réseau/IA/Supabase réel : le fournisseur IA est bouchonné.
 */

const mockProvider: GradingProvider = {
  name: 'gemini',
  async grade(): Promise<GradingOutput> {
    return {
      note: 8,
      points_corrects: ['Concept clé présent'],
      points_manquants: ['Précision manquante'],
      commentaire: 'Bonne compréhension globale.',
    };
  },
};

describe('Intégration : pipeline de sélection et de correction sur données réelles', () => {
  beforeEach(() => {
    clearGradingCache();
  });

  it('chaque domaine configuré possède un fichier de questions chargeable et valide', () => {
    for (const domain of getAllDomains()) {
      const questions = loadDomainQuestions(domain.slug);
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
      for (const q of questions) {
        expect(q.domaine).toBe(domain.slug);
        expect(q.niveau).toBeGreaterThanOrEqual(1);
        expect(q.niveau).toBeLessThanOrEqual(12);
      }
    }
  });

  it('le niveau 1 de chaque domaine fournit assez de questions pour une série de 12', () => {
    for (const slug of DOMAIN_SLUGS) {
      const level1 = getDomainQuestionsByLevel(slug, 1);
      const series = selectSeriesQuestions({ pool: level1, history: [] });
      expect(series.length).toBe(Math.min(12, level1.length));
      const ids = series.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length); // aucun doublon
    }
  });

  it('flux complet : sélection niveau 1 → safe questions (zéro fuite) → correction', async () => {
    const slug = 'reseau';
    const pool = getDomainQuestionsByLevel(slug, 1);
    const series = selectSeriesQuestions({ pool, history: [] });
    expect(series.length).toBeGreaterThan(0);

    const first = series[0]!;

    // La version client ne doit JAMAIS exposer la réponse de référence
    const safe = toSafeQuestion(first);
    expect(safe).not.toHaveProperty('reponse_reference');
    expect(safe).not.toHaveProperty('mots_cles_attendus');

    // Le serveur, lui, retrouve la question complète pour la correction
    const full = getQuestionById(first.id, slug);
    expect(full).toBeDefined();
    expect(full!.reponse_reference.length).toBeGreaterThan(0);

    const result = await orchestrateGrading({
      questionId: full!.id,
      userAnswer: "Une adresse IP identifie de manière unique un hôte sur un réseau IP.",
      question: full!.question,
      reponseReference: full!.reponse_reference,
      motsClesAttendus: full!.mots_cles_attendus,
      type: full!.type,
      providers: [mockProvider],
    });

    expect(result.note).toBe(8);
    expect(result.fournisseur).toBe('gemini');
    // Après correction, la référence est révélée à l'utilisateur
    expect(result.reponse_reference).toBe(full!.reponse_reference);
  });

  it('getMaxAvailableLevel reflète le contenu réel et reste dans 1..12', () => {
    for (const slug of DOMAIN_SLUGS) {
      const max = getMaxAvailableLevel(slug);
      expect(max).toBeGreaterThanOrEqual(1);
      expect(max).toBeLessThanOrEqual(12);
      // Il existe bien des questions à ce niveau max
      expect(getDomainQuestionsByLevel(slug, max).length).toBeGreaterThan(0);
    }
  });

  it("getQuestionById retrouve une question sans domaine (recherche globale)", () => {
    const slug = DOMAIN_SLUGS[0]!;
    const anyQuestion = loadDomainQuestions(slug)[0]!;
    const found = getQuestionById(anyQuestion.id); // sans 2e argument
    expect(found).toBeDefined();
    expect(found!.id).toBe(anyQuestion.id);
  });

  it("getQuestionById renvoie undefined pour un identifiant inexistant", () => {
    expect(getQuestionById('slug-inexistant-999999')).toBeUndefined();
  });
});
