'use server';

import { createClient } from '@/lib/supabase/server';
import { LoginSchema, RegisterSchema, ProfileUpdateSchema } from './schemas';
import { redirect } from 'next/navigation';

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

export async function signInAction(formData: {
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  const parsed = LoginSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Données de connexion invalides',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      error:
        error.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect'
          : error.message,
    };
  }

  return { success: true };
}

export async function signUpAction(formData: {
  email: string;
  password: string;
  pseudo: string;
}): Promise<AuthActionResult> {
  const parsed = RegisterSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données d'inscription invalides",
    };
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        pseudo: parsed.data.pseudo,
      },
    },
  });

  if (authError) {
    return {
      success: false,
      error: authError.message,
    };
  }

  if (authData.user) {
    // S'assurer que le profil existe en base (si le trigger n'a pas encore tourné)
    await supabase.from('profiles').upsert(
      {
        id: authData.user.id,
        pseudo: parsed.data.pseudo,
      },
      { onConflict: 'id' }
    );
  }

  return { success: true };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/connexion');
}

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return {
    user,
    profile: profile ?? {
      id: user.id,
      pseudo: user.email?.split('@')[0] ?? 'Utilisateur',
      reduce_motion: false,
      created_at: new Date().toISOString(),
    },
  };
}

export async function updateProfileAction(data: {
  pseudo?: string;
  reduce_motion?: boolean;
}): Promise<AuthActionResult> {
  const parsed = ProfileUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Données de profil invalides',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: 'Utilisateur non authentifié',
    };
  }

  const { error } = await supabase.from('profiles').update(parsed.data).eq('id', user.id);

  if (error) {
    return {
      success: false,
      error: 'Impossible de mettre à jour le profil',
    };
  }

  return { success: true };
}
