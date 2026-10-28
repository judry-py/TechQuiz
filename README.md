# ⚡ TechQuiz — Plateforme d'Évaluation Technique Assistée par IA

> **Évaluez vos compétences informatiques avec vos propres mots.**  
> Fini les QCM artificiels : répondez librement à des questions techniques et cas pratiques concrets, corrigés instantanément par intelligence artificielle avec progression par paliers.

---

## 🚀 Fonctionnalités Clés

- **0 % Choix Multiples (Zero MCQ)** : Toutes les questions appellent des réponses libres en langage naturel.
- **Correction IA Multi-Niveaux** :
  1. _Pré-tri déterministe ultra-rapide_ (détection des réponses vides, hors-sujet ou sans mots-clés sans consommer d'IA).
  2. _Cache en mémoire_ des évaluations identiques pour une latence instantanée.
  3. _Fournisseur IA Principal_ : Google Gemini (Gemini 3.5 Flash Lite gratuit).
  4. _Fournisseur IA Fallback_ : OpenRouter (`nvidia/nemotron-3-ultra-550b-a55b:free`).
- **4 Domaines d'Expertise** :
  - 🌐 **Réseau & Télécoms** (Accent Cyan `#06b6d4`)
  - 🛡️ **Cybersécurité** (Accent Émeraude `#10b981`)
  - 💻 **Développement Web** (Accent Violet `#8b5cf6`)
  - 🤖 **Intelligence Artificielle** (Accent Rose `#ec4899`)
- **Progression sur 12 Niveaux & 3 Paliers** :
  - _Débutant_ : Niveaux 1 à 4
  - _Intermédiaire_ : Niveaux 5 à 8
  - _Avancé_ : Niveaux 9 à 12
  - Validation d'un niveau dès **7,0 / 10** de moyenne sur une série de 12 questions.
- **Algorithme de Sélection Intelligent** :
  - 12 questions uniques par série, sans aucun doublon.
  - Priorité absolue aux questions jamais tentées.
  - Si toutes ont été vues : priorité aux questions avec les notes les plus faibles et les moins récemment posées.
- **Sécurité des Réponses Modèles** :
  - Les réponses de référence et mots-clés attendus ne sont **jamais** envoyés au navigateur avant que la réponse ne soit validée et notée côté serveur.
- **Analyse des Axes d'Effort & Streak** :
  - Diagnostic automatique des sous-thèmes où l'utilisateur performe le moins.
  - Calcul de la série de réussites consécutives (_streak_).
- **100 % Gratuit & Quota Équitable** :
  - 20 corrections IA offertes par utilisateur chaque jour (réinitialisation à minuit).
- **Accessibilité & Confort Visuel** :
  - Respect strict de `prefers-reduced-motion` couplé à une préférence utilisateur en base de données.
  - Navigation complète au clavier, raccourci <kbd>Ctrl</kbd> + <kbd>Entrée</kbd>, liens d'évitement (_skip-to-content_), contrastes WCAG AA, rôles ARIA.

---

## 🛠️ Stack Technique

| Domaine                    | Technologie                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Framework Web**          | [Next.js](https://nextjs.org/) 16+ (App Router, React 19, Server Actions, Route Handlers)                          |
| **Langage**                | [TypeScript](https://www.typescriptlang.org/) en mode strict (`noUncheckedIndexedAccess`, 0 `any`)                 |
| **Styles**                 | [Tailwind CSS](https://tailwindcss.com/) (Thème Dark Tech & accents néon)                                          |
| **Animations**             | [Framer Motion](https://www.framer.com/motion/) & [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Base de Données & Auth** | [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Triggers SQL, Cookies SSR)                      |
| **IA & LLM**               | [Google Generative AI](https://ai.google.dev/) (Gemini) + [OpenRouter](https://openrouter.ai/)                     |
| **Validation**             | [Zod](https://zod.dev/) (Schémas de validation stricts client & serveur)                                           |
| **Tests & Qualité**        | [Vitest](https://vitest.dev/), ESLint 9, Prettier                                                                  |

---

## 📁 Architecture du Projet

```text
techquiz/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (app)/                # Routes authentifiées (layout avec Navbar & Session)
│   │   │   ├── domaines/         # Catalogue des 4 domaines & cartes de progression
│   │   │   ├── quiz/[domaine]/   # Session interactive de quiz (12 questions / série)
│   │   │   ├── tableau-de-bord/  # Dashboard consolidé (streak, axes d'effort, historique)
│   │   │   └── profil/           # Profil utilisateur, quota IA & préférences
│   │   ├── (public)/             # Routes publiques (connexion, inscription)
│   │   ├── api/
│   │   │   └── grade/            # Route Handler POST de correction IA & quota
│   │   ├── layout.tsx            # Root layout HTML
│   │   └── page.tsx              # Landing page promotionnelle
│   ├── components/
│   │   ├── animations/           # Variantes Framer Motion & gestion reduce-motion
│   │   ├── profile/              # Composants du profil
│   │   ├── quiz/                 # Cartes de questions, input, feedback, modal de résultat
│   │   └── ui/                   # Boutons, Cards, Badges, ProgressBars, Modals, Navbar
│   ├── config/
│   │   └── domains.ts            # Configuration des 4 domaines (couleurs, icônes, slugs)
│   ├── data/
│   │   └── questions/            # Banques de questions JSON (400 questions niveaux 1 à 5)
│   ├── features/
│   │   ├── auth/                 # Actions serveur & schémas Zod d'authentification
│   │   ├── grading/              # Pré-tri déterministe, cache, quota & orchestrateur
│   │   ├── progression/          # Calculs de notes, paliers, streak & axes d'effort
│   │   └── questions/            # Loader, assainisseur de sécurité & sélecteur sans doublon
│   ├── lib/
│   │   ├── ai/                   # Adaptateurs Gemini & OpenRouter, prompts anti-injection
│   │   ├── supabase/             # Clients Supabase (Browser, Server Component, Middleware)
│   │   └── env.ts                # Validation Zod des variables d'environnement
│   ├── tests/                    # 65 tests unitaires & d'intégration Vitest
│   └── types/                    # Définitions TypeScript (database, questions, grading, progression)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Schéma PostgreSQL, RLS, triggers & GRANTs
└── docs/
    ├── supabase-setup.md         # Guide détaillé de configuration Supabase
    └── vercel-deployment.md      # Guide de déploiement en production sur Vercel
```

---

## 🏁 Démarrage Rapide

### 1. Prérequis

- [Node.js](https://nodejs.org/) v20 ou supérieur.
- Un projet [Supabase](https://supabase.com/) gratuit.
- Une clé API gratuite [Google AI Studio](https://aistudio.google.com/) (recommandée) et/ou [OpenRouter](https://openrouter.ai/).

### 2. Installation

```bash
# Cloner le projet ou naviguer dans le dossier
cd Techquiz

# Installer les dépendances
npm install
```

### 3. Configuration des Variables d'Environnement

Copiez le fichier `.env.example` en `.env.local` :

```bash
cp .env.example .env.local
```

Renseignez vos clés dans `.env.local` :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...

# Google AI Studio (Gratuit)
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-3.5-flash-lite

# OpenRouter (Secours gratuit)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=nvidia/nemotron-3-ultra-550b-a55b:free

# Quota quotidien par utilisateur
DAILY_GRADING_LIMIT=20
```

### 4. Initialisation de la Base de Données

Dans votre tableau de bord Supabase, ouvrez le **SQL Editor** et exécutez le script contenu dans :

```text
supabase/migrations/001_initial_schema.sql
```

Ce script crée automatiquement :

- Les 5 tables : `profiles`, `domain_progress`, `answers`, `level_attempts`, `daily_usage`.
- Les politiques de sécurité **Row Level Security (RLS)** pour isoler chaque utilisateur.
- Les permissions explicites `GRANT` pour le rôle `authenticated`.
- Le trigger automatique `handle_new_user` créant le profil lors de l'inscription.

Consultez le guide complet : [Guide de Configuration Supabase](docs/supabase-setup.md).

### 5. Lancer le Serveur de Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 🧪 Tests & Qualité de Code

Le projet intègre une suite de tests complète validant les règles métier critiques (calcul de progression, quotas quotidiens, sélection sans doublon, pré-checker déterministe, bascule IA, schémas de questions).

```bash
# Lancer les 65 tests unitaires et d'intégration
npm test

# Vérification stricte TypeScript (0 erreur tolérée)
npx tsc --noEmit

# Analyse de conformité ESLint
npm run lint

# Vérification du formatage Prettier
npx prettier --check "src/**/*.{ts,tsx}"
```

---

## 🚢 Déploiement en Production

Le projet est optimisé pour un déploiement en 1 clic sur **Vercel** ou tout hébergeur Node.js moderne.

Consultez le guide pas-à-pas : [Guide de Déploiement Vercel](docs/vercel-deployment.md).

---

## 📜 Licence & Crédits

Projet open-source réalisé dans le cadre de la plateforme technique **TechQuiz**.  
Questions et contenus pédagogiques 100% libres de droit.
