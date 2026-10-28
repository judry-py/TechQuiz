import { describe, it, expect } from 'vitest';
import { isDailyLimitExceeded } from '../features/grading/daily-limit';

describe('Vérification du quota journalier (Daily Limit)', () => {
  it("doit autoriser l'accès si le nombre de corrections est strictement inférieur à 20", () => {
    expect(isDailyLimitExceeded(0, 20)).toBe(false);
    expect(isDailyLimitExceeded(10, 20)).toBe(false);
    expect(isDailyLimitExceeded(19, 20)).toBe(false);
  });

  it("doit bloquer l'accès si le nombre de corrections atteint ou dépasse 20", () => {
    expect(isDailyLimitExceeded(20, 20)).toBe(true);
    expect(isDailyLimitExceeded(21, 20)).toBe(true);
    expect(isDailyLimitExceeded(100, 20)).toBe(true);
  });

  it('doit utiliser la limite par défaut de 20 si non spécifiée', () => {
    expect(isDailyLimitExceeded(19)).toBe(false);
    expect(isDailyLimitExceeded(20)).toBe(true);
  });
});
