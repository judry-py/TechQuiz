import { createBrowserClient } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { getClientEnv } from '@/lib/env';

export function createClient(): SupabaseClient<Database> {
  const env = getClientEnv();
  const client = createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return client as unknown as SupabaseClient<Database>;
}
