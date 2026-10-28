# 🗄️ Guide de Configuration Supabase pour TechQuiz

Ce guide détaille pas-à-pas la configuration de votre instance **Supabase** (tier gratuit) pour héberger la base de données et l'authentification de TechQuiz.

---

## 1. Création du Projet Supabase

1. Rendez-vous sur [supabase.com](https://supabase.com/) et connectez-vous.
2. Cliquez sur **New Project**.
3. Choisissez une organisation, donnez un nom à votre projet (ex. `techquiz`).
4. Définissez un mot de passe fort pour la base de données (gardez-le en lieu sûr).
5. Choisissez une région géographique proche de vos utilisateurs (ex. `Frankfurt (eu-central-1)` ou `Paris (eu-west-3)`).
6. Cliquez sur **Create new project** et attendez 1 à 2 minutes le provisionnement.

---

## 2. Exécution de la Migration SQL

1. Dans le menu latéral de votre tableau de bord Supabase, cliquez sur **SQL Editor** (icône `>_`).
2. Cliquez sur **+ New query**.
3. Copiez l'intégralité du contenu du fichier local :
   ```text
   supabase/migrations/001_initial_schema.sql
   ```
4. Collez-le dans l'éditeur SQL Supabase et cliquez sur le bouton vert **Run** (ou faites `Ctrl` + `Enter`).
5. Vous devez voir le message `Success. No rows returned`.

### Ce que configure cette migration :

- **5 Tables relationnelles** :
  - `profiles` : Profil public de l'utilisateur (pseudo, préférence `reduce_motion`).
  - `domain_progress` : Niveau courant (1 à 12) et numéro de série pour chaque domaine.
  - `answers` : Historique des réponses fournies, notes attribuées, retours IA et fournisseur ayant évalué.
  - `level_attempts` : Tentatives de séries terminées avec note moyenne et statut de validation (`valide = true` si note >= 7/10).
  - `daily_usage` : Compteur de corrections quotidiennes pour l'application du quota de 20 corrections/jour.
- **Row Level Security (RLS)** activé sur toutes les tables : chaque utilisateur authentifié ne peut lire et modifier que ses propres données (`auth.uid() = user_id`).
- **Droits GRANT explicites** attribués au rôle `authenticated` sur les tables, séquences et fonctions.
- **Trigger SQL `handle_new_user`** : lorsqu'un utilisateur s'inscrit via Supabase Auth, une ligne correspondante est automatiquement créée dans la table `profiles`.

---

## 3. Récupération des Clés d'Accès

Dans le tableau de bord Supabase :

1. Allez dans **Project Settings** (icône engrenage en bas à gauche) > **API**.
2. Récupérez les valeurs suivantes :
   - **Project URL** : ex. `https://zjcnnrltpuomlvzcutsf.supabase.co`
     → À renseigner dans `NEXT_PUBLIC_SUPABASE_URL`.
   - **Project API keys** :
     - La clé publique **anon** ou **publishable** (ex. `sb_publishable_...` ou `eyJhbGciOi...`)
       → À renseigner dans `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
     - _(Optionnel pour les fonctions administratives avancées)_ La clé secrète **service_role**
       → À renseigner dans `SUPABASE_SERVICE_ROLE_KEY`.

---

## 4. Configuration de l'Authentification

1. Dans le menu latéral, cliquez sur **Authentication** > **Providers**.
2. Vérifiez que le provider **Email** est activé.
3. Allez dans **Authentication** > **URL Configuration** :
   - **Site URL** :
     - En local : `http://localhost:3000`
     - En production : `https://votre-domaine.vercel.app`
   - **Redirect URLs** : Ajoutez `http://localhost:3000/**` et `https://votre-domaine.vercel.app/**`.
4. _(Recommandé pour les tests locaux fluides)_ : Dans **Authentication** > **Email Templates** / **Sign In / Up**, vous pouvez désactiver l'option _Confirm email_ si vous souhaitez que les nouveaux inscrits puissent se connecter immédiatement sans valider d'email.

---

## 5. Vérification du Fonctionnement

Pour tester la bonne connexion depuis votre environnement local :

```bash
# Vérifier l'accès aux tables avec vos identifiants
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
client.from('profiles').select('id', { count: 'exact', head: true }).then(r => {
  if (r.error) console.error('Erreur:', r.error.message);
  else console.log('Connexion Supabase réussie !');
});
"
```
