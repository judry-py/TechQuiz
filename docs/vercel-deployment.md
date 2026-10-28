# 🚀 Guide de Déploiement Vercel pour TechQuiz

Ce guide détaille pas-à-pas la procédure pour déployer **TechQuiz** en production sur la plateforme [Vercel](https://vercel.com/) (tier gratuit).

---

## 1. Prérequis avant Déploiement

1. Votre code source doit être poussé sur un dépôt Git distant ([GitHub](https://github.com/), [GitLab](https://gitlab.com/) ou [Bitbucket](https://bitbucket.org/)).
2. Votre projet **Supabase** doit être configuré avec les tables créées via `supabase/migrations/001_initial_schema.sql` (voir [Guide Supabase](supabase-setup.md)).
3. Vous devez disposer d'une clé d'API valide pour au moins un fournisseur d'IA :
   - [Google AI Studio (Gemini)](https://aistudio.google.com/) — 100% gratuit
   - Et/ou [OpenRouter](https://openrouter.ai/) — avec modèles gratuits (`:free`)

---

## 2. Importation du Projet dans Vercel

1. Rendez-vous sur [vercel.com](https://vercel.com/) et connectez-vous avec votre compte Git.
2. Sur votre tableau de bord Vercel, cliquez sur **Add New...** > **Project**.
3. Recherchez le dépôt contenant **TechQuiz** et cliquez sur **Import**.
4. Configurez le projet :
   - **Framework Preset** : Sélectionner `Next.js` (détecté automatiquement).
   - **Root Directory** : `./` (laisser par défaut si le `package.json` est à la racine).
   - **Build Command** : `npm run build` (par défaut).
   - **Output Directory** : `.next` (par défaut).
   - **Install Command** : `npm install` (par défaut).

---

## 3. Configuration des Variables d'Environnement

Dans la section **Environment Variables** de la page d'importation Vercel (ou ultérieurement dans **Project Settings** > **Environment Variables**), ajoutez les variables suivantes :

| Nom de la variable              | Valeur                                   | Environnements cibles            |
| ------------------------------- | ---------------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://<votre-id-projet>.supabase.co`  | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` ou clé `anon` JWT   | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY`     | _(Optionnel)_ Votre clé service_role     | Production, Preview, Development |
| `GEMINI_API_KEY`                | Votre clé API Google AI Studio           | Production, Preview, Development |
| `GEMINI_MODEL`                  | `gemini-3.5-flash-lite`                  | Production, Preview, Development |
| `OPENROUTER_API_KEY`            | _(Optionnel)_ Votre clé API OpenRouter   | Production, Preview, Development |
| `OPENROUTER_MODEL`              | `nvidia/nemotron-3-ultra-550b-a55b:free` | Production, Preview, Development |
| `DAILY_GRADING_LIMIT`           | `20`                                     | Production, Preview, Development |

> ⚠️ **Sécurité** :
> Les variables préfixées par `NEXT_PUBLIC_` sont exposées publiquement dans le navigateur client (requis pour le SDK Supabase).  
> Les clés `GEMINI_API_KEY`, `OPENROUTER_API_KEY` et `SUPABASE_SERVICE_ROLE_KEY` ne doivent **JAMAIS** être préfixées par `NEXT_PUBLIC_` afin de rester strictement confinées sur le serveur.

---

## 4. Lancement du Déploiement

1. Cliquez sur le bouton bleu **Deploy**.
2. Vercel exécute le build Next.js (compilation TypeScript, bundling Tailwind, génération statique et routes Edge/Serverless).
3. Une fois le déploiement terminé, vous obtiendrez votre URL publique (ex. `https://techquiz-xxx.vercel.app`).

---

## 5. Configuration Post-Déploiement sur Supabase

Dès que votre URL Vercel est générée, vous devez autoriser les redirections d'authentification :

1. Ouvrez votre projet [Supabase](https://supabase.com/).
2. Rendez-vous dans **Authentication** > **URL Configuration**.
3. Mettez à jour le champ **Site URL** avec votre URL de production Vercel :
   ```text
   https://techquiz-xxx.vercel.app
   ```
4. Dans **Redirect URLs**, ajoutez :
   ```text
   https://techquiz-xxx.vercel.app/**
   ```
5. Cliquez sur **Save**.

---

## 6. Liste de Contrôle de Production

Après le déploiement, vérifiez le bon fonctionnement de la plateforme :

- [ ] Créer un compte de test depuis `/inscription`
- [ ] Se connecter avec succès depuis `/connexion`
- [ ] Consulter les 4 cartes sur `/domaines`
- [ ] Répondre à une question sur `/quiz/reseau` et vérifier l'affichage de la note IA sur 10
- [ ] Vérifier que le quota restant passe de 20 à 19 sur `/profil`
- [ ] Tester le toggle "Réduire les animations" dans `/profil`
- [ ] Vérifier que le tableau de bord affiche bien l'historique et les statistiques
