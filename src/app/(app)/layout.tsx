import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/features/auth/actions';
import { Navbar } from '@/components/ui/Navbar';
import { ReduceMotionProvider } from '@/components/animations/ReduceMotionContext';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const authData = await getCurrentUserProfile();

  if (!authData?.user) {
    redirect('/connexion');
  }

  const reduceMotion = authData.profile.reduce_motion ?? false;

  return (
    <ReduceMotionProvider value={reduceMotion}>
      <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
        <Navbar user={authData.user} pseudo={authData.profile.pseudo} />
        <main
          id="main-content"
          className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10"
        >
          {children}
        </main>
        <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
            TechQuiz © 2026 — Plateforme d&apos;évaluation technique 100% libre et gratuite.
          </div>
        </footer>
      </div>
    </ReduceMotionProvider>
  );
}
