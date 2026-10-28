import { describe, it, expect } from 'vitest';
import { selectSeriesQuestions, QuestionHistoryItem } from '../features/questions/selector';
import { Question } from '../types/question';

// Mock helper pour fabriquer des questions simples de test
function createMockQuestion(id: string, niveau: number = 1): Question {
  return {
    id,
    domaine: 'reseau',
    sous_theme: 'protocoles',
    niveau,
    type: 'definition',
    question: `Question test ${id} ?`,
    reponse_reference: `Réponse de référence pour ${id}`,
    mots_cles_attendus: ['test', 'motcle'],
  };
}

describe("Sélection intelligente des questions d'une série", () => {
  it('doit renvoyer exactement 12 questions sans aucun doublon', () => {
    const pool: Question[] = Array.from({ length: 20 }, (_, i) =>
      createMockQuestion(`q-${i + 1}`, 1)
    );

    const selected = selectSeriesQuestions({
      pool,
      history: [],
      count: 12,
    });

    expect(selected.length).toBe(12);

    const uniqueIds = new Set(selected.map((q) => q.id));
    expect(uniqueIds.size).toBe(12);
  });

  it('doit donner la priorité absolue aux questions jamais vues', () => {
    // 20 questions au total : 10 déjà vues, 10 jamais vues
    const pool: Question[] = Array.from({ length: 20 }, (_, i) =>
      createMockQuestion(`q-${i + 1}`, 1)
    );

    const history: QuestionHistoryItem[] = pool.slice(0, 10).map((q) => ({
      question_id: q.id,
      note: 8,
      created_at: new Date(2026, 0, 1).toISOString(),
    }));

    // On sélectionne 10 questions
    const selected = selectSeriesQuestions({
      pool,
      history,
      count: 10,
    });

    expect(selected.length).toBe(10);

    // Les 10 questions sélectionnées doivent être exactement les 10 jamais vues (q-11 à q-20)
    selected.forEach((q) => {
      const num = parseInt(q.id.replace('q-', ''), 10);
      expect(num).toBeGreaterThanOrEqual(11);
    });
  });

  it('si toutes les questions ont été vues, doit prioriser les plus mauvaises notes puis les vues les moins récentes', () => {
    // Pool de 4 questions, on veut en sélectionner 2
    const q1 = createMockQuestion('q-1'); // note: 9, vue hier
    const q2 = createMockQuestion('q-2'); // note: 4 (mauvaise note), vue hier
    const q3 = createMockQuestion('q-3'); // note: 8, vue il y a 30 jours (ancienne)
    const q4 = createMockQuestion('q-4'); // note: 8, vue il y a 2 jours

    const pool = [q1, q2, q3, q4];

    const history: QuestionHistoryItem[] = [
      { question_id: 'q-1', note: 9, created_at: new Date(2026, 2, 10).toISOString() },
      { question_id: 'q-2', note: 4, created_at: new Date(2026, 2, 10).toISOString() },
      { question_id: 'q-3', note: 8, created_at: new Date(2026, 1, 1).toISOString() },
      { question_id: 'q-4', note: 8, created_at: new Date(2026, 2, 8).toISOString() },
    ];

    const selected = selectSeriesQuestions({
      pool,
      history,
      count: 2,
    });

    expect(selected.length).toBe(2);
    const selectedIds = selected.map((q) => q.id);

    // q-2 (note 4 = pire note) et q-3 (note 8 mais vue la plus ancienne) doivent être prioritaires
    expect(selectedIds).toContain('q-2');
    expect(selectedIds).toContain('q-3');
    expect(selectedIds).not.toContain('q-1');
  });

  it('doit gérer proprement un pool plus petit que le nombre demandé sans planter ni dupliquer', () => {
    const pool = [createMockQuestion('q-1'), createMockQuestion('q-2')];

    const selected = selectSeriesQuestions({
      pool,
      history: [],
      count: 12,
    });

    expect(selected.length).toBe(2);
    expect(new Set(selected.map((q) => q.id)).size).toBe(2);
  });

  it('doit retourner un tableau vide si le pool est vide', () => {
    const selected = selectSeriesQuestions({
      pool: [],
      history: [],
      count: 12,
    });
    expect(selected).toEqual([]);
  });
});
