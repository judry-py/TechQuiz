import { describe, it, expect } from 'vitest';
import { LoginSchema, RegisterSchema, ProfileUpdateSchema } from '../features/auth/schemas';

describe("Validation des schémas d'authentification (Zod)", () => {
  describe('LoginSchema', () => {
    it('doit valider des identifiants valides', () => {
      const valid = {
        email: 'dev@techquiz.io',
        password: 'password123',
      };
      const result = LoginSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('dev@techquiz.io');
      }
    });

    it('doit rejeter une adresse email invalide', () => {
      const invalid = {
        email: 'pas-un-email',
        password: 'password123',
      };
      const result = LoginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('email');
      }
    });

    it('doit rejeter un mot de passe trop court (< 6 caractères)', () => {
      const invalid = {
        email: 'dev@techquiz.io',
        password: '123',
      };
      const result = LoginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('6 caractères');
      }
    });
  });

  describe('RegisterSchema', () => {
    it('doit valider une inscription complète valide', () => {
      const valid = {
        pseudo: 'dev_ninja99',
        email: 'ninja@techquiz.io',
        password: 'SuperSecretPassword!',
      };
      const result = RegisterSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pseudo).toBe('dev_ninja99');
      }
    });

    it('doit rejeter un pseudo avec des caractères non autorisés (ex: espaces ou balises)', () => {
      const invalid = {
        pseudo: '<script>alert(1)</script>',
        email: 'hacker@techquiz.io',
        password: 'password123',
      };
      const result = RegisterSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('lettres, chiffres, tirets');
      }
    });

    it('doit rejeter un pseudo trop court (< 2 caractères)', () => {
      const invalid = {
        pseudo: 'a',
        email: 'test@techquiz.io',
        password: 'password123',
      };
      const result = RegisterSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('doit rejeter un pseudo trop long (> 30 caractères)', () => {
      const invalid = {
        pseudo: 'a'.repeat(31),
        email: 'test@techquiz.io',
        password: 'password123',
      };
      const result = RegisterSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('ProfileUpdateSchema', () => {
    it("doit accepter la mise à jour de l'option reduce_motion", () => {
      const update = {
        reduce_motion: true,
      };
      const result = ProfileUpdateSchema.safeParse(update);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reduce_motion).toBe(true);
      }
    });

    it('doit accepter la mise à jour du pseudo seul', () => {
      const update = {
        pseudo: 'NouveauPseudo',
      };
      const result = ProfileUpdateSchema.safeParse(update);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pseudo).toBe('NouveauPseudo');
      }
    });
  });
});
