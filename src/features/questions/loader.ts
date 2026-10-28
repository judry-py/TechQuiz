import fs from 'fs';
import path from 'path';
import { Question, QuestionSchema, SafeQuestion, SafeQuestionSchema } from '@/types/question';
import { getDomainConfig, DOMAIN_SLUGS } from '@/config/domains';

// Cache en mémoire pour éviter de relire les disques à chaque requête sur le serveur
const questionsCache: Map<string, Question[]> = new Map();

/**
 * Charge et valide toutes les questions d'un domaine depuis son fichier JSON.
 * Fonction pure de validation et lecture.
 */
export function loadDomainQuestions(domainSlug: string): Question[] {
  if (questionsCache.has(domainSlug)) {
    const cached = questionsCache.get(domainSlug);
    if (cached) return cached;
  }

  const domainConfig = getDomainConfig(domainSlug);
  if (!domainConfig) {
    throw new Error(`Domaine inconnu : ${domainSlug}`);
  }

  const filePath = path.join(process.cwd(), 'src', 'data', 'questions', domainConfig.questionFile);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier de questions introuvable : ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsedJson = JSON.parse(raw);

  if (!Array.isArray(parsedJson)) {
    throw new Error(
      `Le fichier ${domainConfig.questionFile} doit contenir un tableau de questions.`
    );
  }

  const questions: Question[] = [];
  for (let i = 0; i < parsedJson.length; i++) {
    const item = parsedJson[i];
    const validation = QuestionSchema.safeParse(item);
    if (!validation.success) {
      throw new Error(
        `Question invalide dans ${domainConfig.questionFile} à l'index ${i} : ${JSON.stringify(validation.error.format())}`
      );
    }
    questions.push(validation.data);
  }

  questionsCache.set(domainSlug, questions);
  return questions;
}

/**
 * Retourne les questions d'un domaine pour un niveau spécifique.
 */
export function getDomainQuestionsByLevel(domainSlug: string, level: number): Question[] {
  const allQuestions = loadDomainQuestions(domainSlug);
  return allQuestions.filter((q) => q.niveau === level);
}

/**
 * Vérifie si un niveau spécifique dispose de questions pour un domaine donné.
 */
export function isLevelAvailable(domainSlug: string, level: number): boolean {
  try {
    const questions = getDomainQuestionsByLevel(domainSlug, level);
    return questions.length > 0;
  } catch {
    return false;
  }
}

/**
 * Retourne le niveau maximal actuellement disponible pour un domaine.
 */
export function getMaxAvailableLevel(domainSlug: string): number {
  try {
    const allQuestions = loadDomainQuestions(domainSlug);
    if (allQuestions.length === 0) return 0;
    return Math.max(...allQuestions.map((q) => q.niveau));
  } catch {
    return 0;
  }
}

/**
 * Recherche une question spécifique par son ID à travers tous les domaines.
 */
export function getQuestionById(questionId: string, domainSlug?: string): Question | undefined {
  if (domainSlug) {
    const domainQuestions = loadDomainQuestions(domainSlug);
    return domainQuestions.find((q) => q.id === questionId);
  }

  // Recherche dans tous les domaines connus
  for (const slug of DOMAIN_SLUGS) {
    try {
      const questions = loadDomainQuestions(slug);
      const found = questions.find((q) => q.id === questionId);
      if (found) return found;
    } catch {
      continue;
    }
  }

  return undefined;
}

/**
 * Transforme une question complète en question sécurisée pour le navigateur :
 * La réponse de référence et les mots-clés attendus ne sont JAMAIS exposés au client.
 */
export function toSafeQuestion(question: Question): SafeQuestion {
  return SafeQuestionSchema.parse({
    id: question.id,
    domaine: question.domaine,
    sous_theme: question.sous_theme,
    niveau: question.niveau,
    type: question.type,
    question: question.question,
  });
}
