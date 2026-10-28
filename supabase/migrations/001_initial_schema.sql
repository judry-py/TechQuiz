-- ==============================================================================
-- TechQuiz - Migration 001 : Schéma initial & Row Level Security
-- ==============================================================================

-- 1. Table Profiles (liée aux utilisateurs authentifiés Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    pseudo TEXT NOT NULL,
    reduce_motion BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Table Domain Progress (Niveau actuel et numéro de série par domaine)
CREATE TABLE IF NOT EXISTS public.domain_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    domaine TEXT NOT NULL,
    niveau_courant INTEGER NOT NULL DEFAULT 1 CHECK (niveau_courant >= 1 AND niveau_courant <= 12),
    numero_serie INTEGER NOT NULL DEFAULT 1 CHECK (numero_serie >= 1),
    derniere_activite TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_domain UNIQUE (user_id, domaine)
);

-- 3. Table Answers (Historique des réponses avec évaluation de l'IA)
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    domaine TEXT NOT NULL,
    question_id TEXT NOT NULL,
    niveau INTEGER NOT NULL CHECK (niveau >= 1 AND niveau <= 12),
    texte_reponse TEXT NOT NULL,
    note INTEGER NOT NULL CHECK (note >= 0 AND note <= 10),
    retour_ia JSONB NOT NULL,
    fournisseur TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Table Level Attempts (Tentatives de série de 12 questions par niveau)
CREATE TABLE IF NOT EXISTS public.level_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    domaine TEXT NOT NULL,
    niveau INTEGER NOT NULL CHECK (niveau >= 1 AND niveau <= 12),
    note_moyenne NUMERIC(4, 2) NOT NULL CHECK (note_moyenne >= 0 AND note_moyenne <= 10),
    valide BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Table Daily Usage (Limitation du quota gratuit de corrections par jour)
CREATE TABLE IF NOT EXISTS public.daily_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    nombre_corrections INTEGER NOT NULL DEFAULT 0 CHECK (nombre_corrections >= 0),
    CONSTRAINT unique_user_daily_usage UNIQUE (user_id, date)
);

-- Index pour optimiser les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_domain_progress_user ON public.domain_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_user_domain ON public.answers(user_id, domaine);
CREATE INDEX IF NOT EXISTS idx_answers_created_at ON public.answers(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_level_attempts_user_domain ON public.level_attempts(user_id, domaine);
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON public.daily_usage(user_id, date);

-- ==============================================================================
-- Row Level Security (RLS) - Sécurité stricte par utilisateur
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour PROFILES
CREATE POLICY "Les utilisateurs peuvent lire leur propre profil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent insérer leur propre profil"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Politiques RLS pour DOMAIN_PROGRESS
CREATE POLICY "Les utilisateurs peuvent lire leur progression"
    ON public.domain_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent insérer leur progression"
    ON public.domain_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur progression"
    ON public.domain_progress FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour ANSWERS
CREATE POLICY "Les utilisateurs peuvent lire leurs réponses"
    ON public.answers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent enregistrer leurs réponses"
    ON public.answers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour LEVEL_ATTEMPTS
CREATE POLICY "Les utilisateurs peuvent lire leurs tentatives de niveau"
    ON public.level_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent insérer leurs tentatives de niveau"
    ON public.level_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour DAILY_USAGE
CREATE POLICY "Les utilisateurs peuvent lire leur consommation quotidienne"
    ON public.daily_usage FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer leur compteur du jour"
    ON public.daily_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur compteur du jour"
    ON public.daily_usage FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- Permissions (GRANTs) pour les rôles authenticated et service_role
-- ==============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Rôle authenticated : permissions complètes sur les tables (encadrées par la Row Level Security)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.domain_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.answers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.level_attempts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.daily_usage TO authenticated;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- ==============================================================================
-- Trigger automatique pour créer un profil lors de l'inscription auth.users
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, pseudo)
    VALUES (
        new.id,
        COALESCE(
            new.raw_user_meta_data->>'pseudo',
            new.raw_user_meta_data->>'full_name',
            new.raw_user_meta_data->>'name',
            split_part(new.email, '@', 1)
        )
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
