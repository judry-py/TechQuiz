import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { getServerEnv } from '@/lib/env';

/**
 * Client Supabase doté des privilèges Service Role (Bypass RLS).
 * À utiliser STRICTEMENT côté serveur dans les routes d'API sécurisées
 * (ex: mise à jour du quota quotidien ou opérations d'administration).
 */
export function createServiceRoleClient() {
  const env = getServerEnv();

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY est requis pour utiliser le client service role');
  }

  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
