import { describe, it, expect } from 'vitest';
import {
  preCheckAnswer,
  normalizeText,
  isKeywordPresent,
  levenshteinDistance,
} from '../features/grading/pre-checker';

describe('Pré-tri des réponses sans IA', () => {
  describe('normalizeText', () => {
    it('doit supprimer les accents, minusculiser et nettoyer la ponctuation', () => {
      expect(normalizeText('Réseau & Sécurité !')).toBe('reseau securite');
      expect(normalizeText("  L'ADRESSE   IP.  ")).toBe('l adresse ip');
    });
  });

  describe('levenshteinDistance', () => {
    it("doit calculer la distance d'édition", () => {
      expect(levenshteinDistance('switch', 'switch')).toBe(0);
      expect(levenshteinDistance('switch', 'switchs')).toBe(1);
      expect(levenshteinDistance('routeur', 'routuer')).toBe(2);
    });
  });

  describe('isKeywordPresent', () => {
    it('doit détecter la présence exacte ou insensible aux accents', () => {
      expect(isKeywordPresent('réseau', 'connexion au reseau local')).toBe(true);
      expect(isKeywordPresent('adresse MAC', 'la carte a une adresse mac unique')).toBe(true);
    });

    it('doit tolérer les fautes de frappe légères sur les mots techniques', () => {
      expect(isKeywordPresent('routeur', 'le routuer achemine les paquets')).toBe(true);
      expect(isKeywordPresent('serveur', 'le serveure repond')).toBe(true);
    });

    it('ne doit pas matcher des termes totalement différents', () => {
      expect(isKeywordPresent('cryptographie', 'simple switch ethernet')).toBe(false);
    });
  });

  describe('preCheckAnswer (Règles de décision)', () => {
    const expectedKeywords = ['switch', 'routeur', 'adresse MAC', 'adresse IP'];

    it('doit rejeter immédiatement une réponse vide avec une note de 0', () => {
      const result = preCheckAnswer({
        userAnswer: '   ',
        expectedKeywords,
        questionType: 'definition',
      });

      expect(result.shouldCallAI).toBe(false);
      expect(result.result?.note).toBe(0);
      expect(result.result?.points_corrects).toEqual([]);
    });

    it('doit rejeter immédiatement une réponse trop courte (< 5 caractères)', () => {
      const result = preCheckAnswer({
        userAnswer: 'oui',
        expectedKeywords,
        questionType: 'definition',
      });

      expect(result.shouldCallAI).toBe(false);
      expect(result.result?.note).toBe(0);
      expect(result.result?.commentaire).toContain('trop courte');
    });

    it('doit rejeter sans IA un hors-sujet sans aucun mot-clé attendu (< 40 car.)', () => {
      const result = preCheckAnswer({
        userAnswer: 'je ne sais absolument pas désolé',
        expectedKeywords,
        questionType: 'definition',
      });

      expect(result.shouldCallAI).toBe(false);
      expect(result.result?.note).toBe(1);
      expect(result.result?.points_manquants[0]).toContain('Aucun des concepts attendus');
    });

    it("doit autoriser l'appel IA si au moins un mot-clé ou terme proche est présent", () => {
      const result = preCheckAnswer({
        userAnswer: 'Un switch permet de relier les ordinateurs sur le réseau',
        expectedKeywords,
        questionType: 'definition',
      });

      expect(result.shouldCallAI).toBe(true);
      expect(result.result).toBeUndefined();
    });

    it("doit autoriser l'appel IA si la réponse est longue et développée même avec vocabulaire alternatif", () => {
      const result = preCheckAnswer({
        userAnswer:
          "Il s'agit d'un boîtier matériel d'interconnexion qui analyse les trames pour aiguiller les flux vers le bon destinataire au sein du réseau local.",
        expectedKeywords,
        questionType: 'definition',
      });

      expect(result.shouldCallAI).toBe(true);
    });
  });
});
