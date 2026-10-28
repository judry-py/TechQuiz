import { describe, it, expect, beforeEach } from 'vitest';
import { orchestrateGrading } from '../features/grading/orchestrator';
import { GradingOutput, GradingProvider } from '../types/grading';
import { clearGradingCache } from '../features/grading/cache';

class MockSuccessProvider implements GradingProvider {
  constructor(
    readonly name: 'gemini' | 'openrouter',
    private score: number = 8
  ) {}

  async grade(): Promise<GradingOutput> {
    return {
      note: this.score,
      points_corrects: [`Explication claire (${this.name})`],
      points_manquants: [],
      commentaire: `Évaluation réussie par ${this.name}`,
    };
  }
}

class MockFailingProvider implements GradingProvider {
  constructor(
    readonly name: 'gemini' | 'openrouter',
    private errorMsg: string = 'Quota dépassé'
  ) {}

  async grade(): Promise<GradingOutput> {
    throw new Error(this.errorMsg);
  }
}

describe('Orchestration de correction & Bascule entre fournisseurs (Fallback)', () => {
  beforeEach(() => {
    clearGradingCache();
  });

  const baseParams = {
    questionId: 'reseau-001',
    userAnswer: 'Une adresse IP identifie chaque appareil sur un réseau de communication.',
    question: "Qu'est-ce qu'une adresse IP ?",
    reponseReference: "Identifiant numérique d'un équipement réseau.",
    motsClesAttendus: ['identifiant', 'appareil', 'réseau'],
    type: 'definition' as const,
  };

  it("doit utiliser le fournisseur principal (Gemini) lorsqu'il répond avec succès", async () => {
    const geminiMock = new MockSuccessProvider('gemini', 9);
    const openRouterMock = new MockSuccessProvider('openrouter', 7);

    const result = await orchestrateGrading({
      ...baseParams,
      providers: [geminiMock, openRouterMock],
    });

    expect(result.fournisseur).toBe('gemini');
    expect(result.note).toBe(9);
    expect(result.reponse_reference).toBe(baseParams.reponseReference);
  });

  it('doit basculer automatiquement sur OpenRouter si Gemini échoue', async () => {
    const geminiFailing = new MockFailingProvider('gemini', 'Gemini 429 Rate Limit Exceeded');
    const openRouterSuccess = new MockSuccessProvider('openrouter', 8);

    const result = await orchestrateGrading({
      ...baseParams,
      providers: [geminiFailing, openRouterSuccess],
    });

    expect(result.fournisseur).toBe('openrouter');
    expect(result.note).toBe(8);
    expect(result.commentaire).toContain('openrouter');
  });

  it('doit échouer proprement si les deux fournisseurs échouent', async () => {
    const geminiFailing = new MockFailingProvider('gemini', 'Gemini down');
    const openRouterFailing = new MockFailingProvider('openrouter', 'OpenRouter 503');

    await expect(
      orchestrateGrading({
        ...baseParams,
        providers: [geminiFailing, openRouterFailing],
      })
    ).rejects.toThrow("Tous les services d'évaluation IA sont temporairement indisponibles");
  });

  it("doit utiliser la mise en cache pour une même réponse normalisée sans réappeler l'IA", async () => {
    let callCount = 0;
    const trackingProvider: GradingProvider = {
      name: 'gemini',
      async grade(): Promise<GradingOutput> {
        callCount += 1;
        return {
          note: 9,
          points_corrects: ['Point valide'],
          points_manquants: [],
          commentaire: 'Parfait',
        };
      },
    };

    // Premier appel
    const res1 = await orchestrateGrading({
      ...baseParams,
      userAnswer: 'Une adresse IP identifie un appareil.',
      providers: [trackingProvider],
    });
    expect(res1.fournisseur).toBe('gemini');
    expect(callCount).toBe(1);

    // Deuxième appel avec casse et espaces différents
    const res2 = await orchestrateGrading({
      ...baseParams,
      userAnswer: '   UNE  ADRESSE  ip identifie un APPAREIL.  ',
      providers: [trackingProvider],
    });
    expect(res2.fournisseur).toBe('cache');
    expect(res2.note).toBe(9);
    expect(callCount).toBe(1); // Le provider n'a PAS été réappelé
  });

  it('doit intercepter le pré-tri sans appeler aucun fournisseur IA', async () => {
    const geminiMock = new MockSuccessProvider('gemini');

    const result = await orchestrateGrading({
      ...baseParams,
      userAnswer: '', // Réponse vide
      providers: [geminiMock],
    });

    expect(result.fournisseur).toBe('pre-check');
    expect(result.note).toBe(0);
  });
});
