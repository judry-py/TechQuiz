import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { CONSTANTS } from '@/types/progression';

export interface DailyLimitCheckResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  remaining: number;
}

/**
 * Fonction pure de vérification du quota journalier.
 */
export function isDailyLimitExceeded(
  currentCount: number,
  limit: number = CONSTANTS.DEFAULT_DAILY_LIMIT
): boolean {
  return currentCount >= limit;
}

/**
 * Vérifie le quota quotidien d'un utilisateur en base de données.
 */
export async function checkUserDailyLimit(
  userId: string,
  supabase: SupabaseClient<Database>,
  limit: number = CONSTANTS.DEFAULT_DAILY_LIMIT
): Promise<DailyLimitCheckResult> {
  const today = new Date().toISOString().split('T')[0]!; // Format 'YYYY-MM-DD'

  const { data, error } = await supabase
    .from('daily_usage')
    .select('nombre_corrections')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (error) {
    console.error('Erreur lors de la lecture du quota journalier :', error);
    // En cas d'erreur de lecture du quota, on n'interrompt pas brutalement l'utilisateur
  }

  const currentCount = data?.nombre_corrections ?? 0;
  const allowed = !isDailyLimitExceeded(currentCount, limit);

  return {
    allowed,
    currentCount,
    limit,
    remaining: Math.max(0, limit - currentCount),
  };
}

/**
 * Incrémente le compteur quotidien de corrections de l'utilisateur.
 * Appelée UNIQUEMENT après une correction réussie.
 */
export async function incrementUserDailyUsage(
  userId: string,
  supabase: SupabaseClient<Database>
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]!;

  // 1. Lire la valeur actuelle
  const { data } = await supabase
    .from('daily_usage')
    .select('id, nombre_corrections')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (data) {
    // 2. Mettre à jour la ligne existante
    await supabase
      .from('daily_usage')
      .update({
        nombre_corrections: data.nombre_corrections + 1,
      })
      .eq('id', data.id);
  } else {
    // 3. Insérer une nouvelle ligne pour aujourd'hui
    await supabase.from('daily_usage').insert({
      user_id: userId,
      date: today,
      nombre_corrections: 1,
    });
  }
}
