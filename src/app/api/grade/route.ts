import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GradeRequestSchema } from '@/types/grading';
import { getQuestionById } from '@/features/questions/loader';
import { checkUserDailyLimit, incrementUserDailyUsage } from '@/features/grading/daily-limit';
import { orchestrateGrading } from '@/features/grading/orchestrator';

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification de l'utilisateur
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentification requise pour soumettre une réponse.' },
        { status: 401 }
      );
    }

    // 2. Valider le corps de la requête avec Zod
    const body = await request.json().catch(() => null);
    const validation = GradeRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Données de requête invalides.',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { questionId, userAnswer } = validation.data;

    // 3. Charger la question complète côté serveur (avec réponse de référence et mots-clés)
    const question = getQuestionById(questionId);
    if (!question) {
      return NextResponse.json({ error: `Question introuvable : ${questionId}` }, { status: 404 });
    }

    // 4. Vérifier le quota quotidien (20 corrections gratuites / jour)
    const quota = await checkUserDailyLimit(user.id, supabase);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error:
            "Vous avez atteint votre quota gratuit de 20 corrections pour aujourd'hui. Revenez demain pour poursuivre votre entraînement !",
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // 5. Exécuter le pipeline de correction (Cache -> Pré-tri sans IA -> Gemini -> Fallback OpenRouter)
    const gradingResult = await orchestrateGrading({
      questionId: question.id,
      userAnswer,
      question: question.question,
      reponseReference: question.reponse_reference,
      motsClesAttendus: question.mots_cles_attendus,
      type: question.type,
    });

    // 6. Enregistrer la réponse en base de données
    await supabase.from('answers').insert({
      user_id: user.id,
      domaine: question.domaine,
      question_id: question.id,
      niveau: question.niveau,
      texte_reponse: userAnswer,
      note: gradingResult.note,
      retour_ia: {
        points_corrects: gradingResult.points_corrects,
        points_manquants: gradingResult.points_manquants,
        commentaire: gradingResult.commentaire,
      },
      fournisseur: gradingResult.fournisseur,
    });

    // 7. Incrémenter le quota journalier (uniquement si la correction a réussi)
    // Note : si c'était un pré-tri ou un cache, on peut aussi l'enregistrer selon les règles du produit
    await incrementUserDailyUsage(user.id, supabase);

    // 8. Renvoyer le résultat complet (y compris la réponse de référence pour la révélation)
    return NextResponse.json({
      success: true,
      result: gradingResult,
      remainingDailyCorrections: Math.max(0, quota.remaining - 1),
    });
  } catch (error) {
    console.error('Erreur inattendue dans /api/grade :', error);
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de l'évaluation de votre réponse. Votre quota n'a pas été débité. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}
