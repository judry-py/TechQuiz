import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import { getServerEnv } from '@/lib/env';

export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();
  const env = getServerEnv();

  const client = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Dans un Server Component, l'écriture des cookies peut être ignorée si elle est gérée par le middleware
          }
        },
      },
    }
  );

  return client as unknown as SupabaseClient<Database>;
}
