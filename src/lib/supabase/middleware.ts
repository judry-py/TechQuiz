import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Database } from '@/types/database';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Rafraîchir la session auth si nécessaire
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Routes protégées nécessitant d'être connecté
  const protectedRoutes = ['/domaines', '/quiz', '/resultat', '/tableau-de-bord', '/profil'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Routes d'authentification réservées aux anonymes
  const authRoutes = ['/connexion', '/inscription'];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/connexion';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Ne rediriger que les navigations (GET) : un POST vers /connexion ou /inscription
  // est la soumission d'un formulaire (server action) et doit atteindre l'action.
  if (user && isAuthRoute && request.method === 'GET') {
    const url = request.nextUrl.clone();
    url.pathname = '/domaines';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
