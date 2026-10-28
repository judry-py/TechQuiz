import { describe, it, expect } from 'vitest';
import {
  calculateAverageScore,
  isLevelPassed,
  calculateProgression,
  getTierFromLevel,
  identifyWeakAreas,
  calculateStreak,
} from '../features/progression/calculator';

describe('Logique pure de progression', () => {
  describe('calculateAverageScore & isLevelPassed', () => {
    it('doit calculer correctement la moyenne', () => {
      expect(calculateAverageScore([8, 7, 9, 6])).toBe(7.5);
      expect(calculateAverageScore([10, 10, 10])).toBe(10);
      expect(calculateAverageScore([0, 0, 0])).toBe(0);
      expect(calculateAverageScore([])).toBe(0);
    });

    it('doit arrondir à 2 décimales', () => {
      expect(calculateAverageScore([7, 8, 7])).toBe(7.33);
    });

    it('doit valider le niveau si note >= 7.0/10', () => {
      expect(isLevelPassed(7.0)).toBe(true);
      expect(isLevelPassed(7.5)).toBe(true);
      expect(isLevelPassed(10.0)).toBe(true);
    });

    it('doit échouer le niveau si note < 7.0/10', () => {
      expect(isLevelPassed(6.99)).toBe(false);
      expect(isLevelPassed(6.5)).toBe(false);
      expect(isLevelPassed(0)).toBe(false);
    });
  });

  describe('calculateProgression (transitions de niveau)', () => {
    it('doit maintenir au même niveau si la note est insuffisante (< 7/10)', () => {
      const result = calculateProgression(1, 6.5, 5);
      expect(result.passed).toBe(false);
      expect(result.nextLevel).toBe(1);
      expect(result.isComingSoon).toBe(false);
      expect(result.isMaxLevelReached).toBe(false);
    });

    it('doit passer au niveau suivant si la note est suffisante et le niveau disponible', () => {
      const result = calculateProgression(1, 8.2, 5);
      expect(result.passed).toBe(true);
      expect(result.nextLevel).toBe(2);
      expect(result.isComingSoon).toBe(false);
      expect(result.isMaxLevelReached).toBe(false);
    });

    it('doit afficher "Prochainement" si le niveau suivant dépasse le niveau disponible dans les fichiers', () => {
      // Actuellement les fichiers couvrent les niveaux 1 à 5
      const result = calculateProgression(5, 7.5, 5);
      expect(result.passed).toBe(true);
      expect(result.nextLevel).toBe(5); // Reste au niveau 5 sans bloquer
      expect(result.isComingSoon).toBe(true);
      expect(result.isMaxLevelReached).toBe(false);
    });

    it('doit indiquer que le niveau maximum est atteint au niveau 12', () => {
      const result = calculateProgression(12, 9.0, 12);
      expect(result.passed).toBe(true);
      expect(result.nextLevel).toBe(12);
      expect(result.isMaxLevelReached).toBe(true);
      expect(result.isComingSoon).toBe(false);
    });
  });

  describe('getTierFromLevel (Paliers de niveau)', () => {
    it('doit associer les niveaux 1 à 4 au palier Débutant', () => {
      expect(getTierFromLevel(1).tier).toBe('debutant');
      expect(getTierFromLevel(2).tier).toBe('debutant');
      expect(getTierFromLevel(3).tier).toBe('debutant');
      expect(getTierFromLevel(4).tier).toBe('debutant');
      expect(getTierFromLevel(1).label).toBe('Débutant');
    });

    it('doit associer les niveaux 5 à 8 au palier Intermédiaire', () => {
      expect(getTierFromLevel(5).tier).toBe('intermediaire');
      expect(getTierFromLevel(6).tier).toBe('intermediaire');
      expect(getTierFromLevel(7).tier).toBe('intermediaire');
      expect(getTierFromLevel(8).tier).toBe('intermediaire');
      expect(getTierFromLevel(5).label).toBe('Intermédiaire');
    });

    it('doit associer les niveaux 9 à 12 au palier Avancé', () => {
      expect(getTierFromLevel(9).tier).toBe('avance');
      expect(getTierFromLevel(10).tier).toBe('avance');
      expect(getTierFromLevel(11).tier).toBe('avance');
      expect(getTierFromLevel(12).tier).toBe('avance');
      expect(getTierFromLevel(9).label).toBe('Avancé');
    });

    it('doit borner les niveaux hors limites', () => {
      expect(getTierFromLevel(0).tier).toBe('debutant');
      expect(getTierFromLevel(99).tier).toBe('avance');
    });
  });

  describe('identifyWeakAreas (Points faibles par sous-thème)', () => {
    it('doit identifier et trier les sous-thèmes aux moyennes les plus basses', () => {
      const answers = [
        { sous_theme: 'cryptographie', note: 4 },
        { sous_theme: 'cryptographie', note: 6 }, // moy = 5.0
        { sous_theme: 'reseau', note: 9 },
        { sous_theme: 'reseau', note: 8 }, // moy = 8.5
        { sous_theme: 'dns', note: 3 },
        { sous_theme: 'dns', note: 3 }, // moy = 3.0
      ];

      const weak = identifyWeakAreas(answers, 2);
      expect(weak.length).toBe(2);
      expect(weak[0]?.subTheme).toBe('dns');
      expect(weak[0]?.averageScore).toBe(3.0);
      expect(weak[1]?.subTheme).toBe('cryptographie');
      expect(weak[1]?.averageScore).toBe(5.0);
    });

    it('doit retourner une liste vide si aucune réponse', () => {
      expect(identifyWeakAreas([])).toEqual([]);
    });
  });

  describe('calculateStreak (Série de réussites)', () => {
    it('doit calculer le nombre de réussites consécutives récentes', () => {
      const attempts = [
        { valide: true },
        { valide: true },
        { valide: true },
        { valide: false },
        { valide: true },
      ];
      expect(calculateStreak(attempts)).toBe(3);
    });

    it('doit retourner 0 si la tentative la plus récente a échoué', () => {
      const attempts = [{ valide: false }, { valide: true }, { valide: true }];
      expect(calculateStreak(attempts)).toBe(0);
    });

    it('doit retourner 0 pour un historique vide', () => {
      expect(calculateStreak([])).toBe(0);
    });
  });
});
