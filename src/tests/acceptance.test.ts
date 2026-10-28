import { describe, it, expect } from 'vitest';
import { getAllDomains, DOMAIN_SLUGS, getDomainConfig } from '../config/domains';
import {
  loadDomainQuestions,
  getDomainQuestionsByLevel,
  getMaxAvailableLevel,
} from '../features/questions/loader';
import { selectSeriesQuestions } from '../features/questions/selector';
import { CONSTANTS } from '../types/progression';

/**
 * Tests d'acceptation : valident les critères métier du point de vue utilisateur,
 * tels que définis dans le cahier des charges TechQuiz.
 */

const VALID_ICONS = [
  'Network',
  'Shield',
  'Code',
  'Brain',
  'Database',
  'Cloud',
  'GitBranch',
  'Smartphone',
  'FlaskConical',
  'Cpu',
  'ClipboardCheck',
  'Blocks',
];
const VALID_COLORS = [
  'cyan',
  'emerald',
  'violet',
  'pink',
  'amber',
  'sky',
  'lime',
  'indigo',
  'orange',
  'teal',
  'rose',
  'fuchsia',
];

describe('Acceptation : critères produit sur les domaines et les séries', () => {
  it('CA-1 : La plateforme expose 12 domaines (génie logiciel, mobile, data science…)', () => {
    expect(getAllDomains().length).toBeGreaterThanOrEqual(12);
  });

  it("CA-2 : Chaque domaine a une fiche d'affichage complète et cohérente", () => {
    for (const d of getAllDomains()) {
      expect(d.name.trim().length).toBeGreaterThan(0);
      expect(d.shortName.trim().length).toBeGreaterThan(0);
      expect(d.description.trim().length).toBeGreaterThan(10);
      expect(VALID_ICONS).toContain(d.iconName);
      expect(VALID_COLORS).toContain(d.colorName);
      expect(d.questionFile).toMatch(/\.json$/);
      expect(d.slug).toBe(getDomainConfig(d.slug)?.slug);
    }
  });

  it("CA-3 : Chaque domaine propose un contenu de questions réel et chargeable", () => {
    for (const slug of DOMAIN_SLUGS) {
      const questions = loadDomainQuestions(slug);
      expect(questions.length).toBeGreaterThan(0);
      expect(getMaxAvailableLevel(slug)).toBeGreaterThanOrEqual(1);
    }
  });

  it("CA-4 : Un nouvel utilisateur reçoit une série de 12 questions distinctes de niveau 1", () => {
    for (const slug of DOMAIN_SLUGS) {
      const pool = getDomainQuestionsByLevel(slug, 1);
      const series = selectSeriesQuestions({ pool, history: [] });

      expect(series.length).toBe(CONSTANTS.QUESTIONS_PER_SERIES);
      expect(new Set(series.map((q) => q.id)).size).toBe(CONSTANTS.QUESTIONS_PER_SERIES);
      for (const q of series) {
        expect(q.niveau).toBe(1);
        expect(q.domaine).toBe(slug);
      }
    }
  });

  it("CA-5 : La série privilégie les questions jamais vues (apprentissage adaptatif)", () => {
    const slug = DOMAIN_SLUGS[0]!;
    const pool = getDomainQuestionsByLevel(slug, 1);
    // Historique : la moitié du pool a déjà été vue avec de bonnes notes
    const seenIds = pool.slice(0, Math.floor(pool.length / 2)).map((q) => q.id);
    const history = seenIds.map((id) => ({
      question_id: id,
      note: 9,
      created_at: new Date().toISOString(),
    }));

    const series = selectSeriesQuestions({ pool, history });
    const neverSeenIds = new Set(pool.filter((q) => !seenIds.includes(q.id)).map((q) => q.id));

    // Tant qu'il reste assez de questions jamais vues, la série n'en contient aucune déjà vue
    if (neverSeenIds.size >= CONSTANTS.QUESTIONS_PER_SERIES) {
      for (const q of series) {
        expect(neverSeenIds.has(q.id)).toBe(true);
      }
    }
  });

  it("CA-6 : Quand tout a été vu, la série recycle d'abord les questions les moins bien notées", () => {
    const slug = DOMAIN_SLUGS[0]!;
    const pool = getDomainQuestionsByLevel(slug, 1);
    // Toutes les questions vues ; la première a la pire note
    const history = pool.map((q, i) => ({
      question_id: q.id,
      note: i === 0 ? 1 : 9, // q[0] très mal notée
      created_at: new Date(Date.now() - i * 1000).toISOString(),
    }));

    const series = selectSeriesQuestions({ pool, history });
    // La question la moins bien notée doit être repriorisée dans la série
    expect(series.map((q) => q.id)).toContain(pool[0]!.id);
  });

  it("CA-7 : Les niveaux sont bornés de 1 à 12 dans tout le contenu", () => {
    for (const slug of DOMAIN_SLUGS) {
      for (const q of loadDomainQuestions(slug)) {
        expect(q.niveau).toBeGreaterThanOrEqual(1);
        expect(q.niveau).toBeLessThanOrEqual(12);
      }
    }
  });
});
