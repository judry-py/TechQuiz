import { describe, it, expect } from 'vitest';
import {
  loadDomainQuestions,
  getDomainQuestionsByLevel,
  getMaxAvailableLevel,
  getQuestionById,
} from '../features/questions/loader';
import { selectSeriesQuestions, shuffleArray } from '../features/questions/selector';
import type { Question } from '../types/question';

/**
 * Tests de vitesse (micro-benchmarks) : vérifient que les opérations critiques
 * du serveur restent dans des bornes acceptables, même sur disque lent.
 * Les seuils sont volontairement larges pour éviter les faux positifs en CI/dev.
 */

function makePool(n: number): Question[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `perf-${i}`,
    domaine: 'reseau',
    sous_theme: 'bench',
    niveau: (i % 12) + 1,
    type: i % 2 === 0 ? ('definition' as const) : ('scenario' as const),
    question: `Question de benchmark numéro ${i} sur les protocoles réseau ?`,
    reponse_reference: `Réponse de référence numéro ${i} décrivant le mécanisme attendu.`,
    mots_cles_attendus: ['protocole', 'réseau'],
  }));
}

describe('Performance : vitesse des opérations critiques', () => {
  describe('Loader de questions (cache mémoire)', () => {
    it('le chargement à froid dun domaine doit rester sous 5s (disque lent toléré)', () => {
      const start = performance.now();
      const questions = loadDomainQuestions('reseau');
      const coldMs = performance.now() - start;
      expect(questions.length).toBeGreaterThan(0);
      expect(coldMs).toBeLessThan(5000);
      console.log(`[perf] Chargement à froid reseau : ${coldMs.toFixed(1)} ms`);
    });

    it('le chargement à chaud (cache) doit être quasi instantané (< 50 ms)', () => {
      loadDomainQuestions('reseau'); // pré-chauffe le cache
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        loadDomainQuestions('reseau');
      }
      const warmMs = (performance.now() - start) / 100;
      expect(warmMs).toBeLessThan(50);
      console.log(`[perf] Chargement à chaud (moyenne/100) : ${warmMs.toFixed(3)} ms`);
    });

    it('le filtrage par niveau et la recherche par ID doivent être rapides (< 100 ms)', () => {
      loadDomainQuestions('reseau');
      const start = performance.now();
      for (let lvl = 1; lvl <= 12; lvl++) {
        getDomainQuestionsByLevel('reseau', lvl);
      }
      getMaxAvailableLevel('reseau');
      getQuestionById('reseau-001');
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100);
      console.log(`[perf] Filtres niveaux + max + byId : ${elapsed.toFixed(1)} ms`);
    });
  });

  describe('Sélecteur de séries (Fisher-Yates + historique)', () => {
    it('doit sélectionner 12 questions dans un pool de 240 en < 100 ms', () => {
      const pool = makePool(240);
      const start = performance.now();
      const selected = selectSeriesQuestions({ pool, history: [] });
      const elapsed = performance.now() - start;
      expect(selected).toHaveLength(12);
      expect(elapsed).toBeLessThan(100);
      console.log(`[perf] Sélection 12/240 sans historique : ${elapsed.toFixed(2)} ms`);
    });

    it('doit rester rapide avec un historique massif (10 000 entrées) : < 500 ms', () => {
      const pool = makePool(240);
      const history = Array.from({ length: 10000 }, (_, i) => ({
        question_id: `perf-${i % 240}`,
        note: i % 11,
        created_at: new Date(Date.now() - i * 60000).toISOString(),
      }));
      const start = performance.now();
      const selected = selectSeriesQuestions({ pool, history });
      const elapsed = performance.now() - start;
      expect(selected).toHaveLength(12);
      expect(new Set(selected.map((q) => q.id)).size).toBe(12);
      expect(elapsed).toBeLessThan(500);
      console.log(`[perf] Sélection 12/240 avec historique 10k : ${elapsed.toFixed(2)} ms`);
    });

    it('shuffleArray sur 100 000 éléments doit terminer en < 1000 ms', () => {
      const big = Array.from({ length: 100000 }, (_, i) => i);
      const start = performance.now();
      const shuffled = shuffleArray(big);
      const elapsed = performance.now() - start;
      expect(shuffled).toHaveLength(big.length);
      expect(elapsed).toBeLessThan(1000);
      console.log(`[perf] Shuffle 100k éléments : ${elapsed.toFixed(1)} ms`);
    });
  });
});
