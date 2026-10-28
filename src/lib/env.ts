import { z } from 'zod';

const ServerEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('URL Supabase invalide'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Clé anonyme Supabase obligatoire'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Clé service role Supabase obligatoire').optional(),
  GEMINI_API_KEY: z.string().min(1, 'Clé Gemini API obligatoire').optional(),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash-lite'),
  OPENROUTER_API_KEY: z.string().min(1, 'Clé OpenRouter obligatoire').optional(),
  OPENROUTER_MODEL: z.string().default('nvidia/nemotron-3-ultra-550b-a55b:free'),
  DAILY_GRADING_LIMIT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive())
    .default('20'),
});

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('URL Supabase invalide'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Clé anonyme Supabase obligatoire'),
});

/**
 * Fonction d'accès sécurisé aux variables d'environnement.
 * Évite les crashs à la compilation tout en garantissant une validation stricte à l'exécution.
 */
export function getServerEnv() {
  const parsed = ServerEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free',
    DAILY_GRADING_LIMIT: process.env.DAILY_GRADING_LIMIT || '20',
  });

  if (!parsed.success) {
    // Si nous sommes en mode build/test et que les clés ne sont pas définies, on loggue sans bloquer les tests unitaires purs
    if (process.env.NODE_ENV === 'test') {
      return {
        NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
        GEMINI_API_KEY: 'test-gemini-key',
        GEMINI_MODEL: 'gemini-3.5-flash-lite',
        OPENROUTER_API_KEY: 'test-openrouter-key',
        OPENROUTER_MODEL: 'nvidia/nemotron-3-ultra-550b-a55b:free',
        DAILY_GRADING_LIMIT: 20,
      };
    }
    console.error(
      "❌ Configuration des variables d'environnement invalide :",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Variables d'environnement serveur invalides");
  }

  return parsed.data;
}

export function getClientEnv() {
  const parsed = ClientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    if (process.env.NODE_ENV === 'test') {
      return {
        NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      };
    }
    console.error(
      '❌ Configuration des variables client invalide :',
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Variables d'environnement client invalides");
  }

  return parsed.data;
}
