'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal, LayoutDashboard, Compass, User, LogOut } from 'lucide-react';
import { signOutAction } from '@/features/auth/actions';

interface NavbarProps {
  user?: {
    email?: string;
  } | null;
  pseudo?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({ user, pseudo }) => {
  const pathname = usePathname();
  const displayName = pseudo ?? user?.email?.split('@')[0] ?? 'Utilisateur';

  const navLinks = [
    { href: '/domaines', label: 'Domaines', icon: Compass },
    { href: '/tableau-de-bord', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/profil', label: 'Profil', icon: User },
  ];

  return (
    <>
      {/* Skip-to-content link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-slate-950 focus:rounded-xl focus:font-semibold focus:text-sm focus:shadow-lg"
      >
        Passer au contenu principal
      </a>

      <header
        className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090d16]/80 backdrop-blur-md"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href={user ? '/domaines' : '/'}
            className="flex items-center gap-2.5 font-bold text-lg text-slate-100 hover:text-cyan-400 transition-colors group focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-xl"
            aria-label="TechQuiz — Accueil"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all">
              <Terminal className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="tracking-tight">
              Tech<span className="text-cyan-400">Quiz</span>
            </span>
          </Link>

          {/* Navigation Links */}
          {user ? (
            <nav aria-label="Navigation principale" className="flex items-center gap-1 sm:gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">{link.label}</span>
                  </Link>
                );
              })}

              {/* User pseudo indicator */}
              <span
                className="hidden lg:flex items-center text-xs text-slate-500 px-2 border-l border-white/10 ml-1 pl-3"
                aria-label={`Connecté en tant que ${displayName}`}
              >
                {displayName}
              </span>

              {/* Logout button */}
              <form action={signOutAction} className="ml-1">
                <button
                  type="submit"
                  aria-label="Se déconnecter"
                  title="Se déconnecter"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>
            </nav>
          ) : (
            <nav aria-label="Navigation publique" className="flex items-center gap-3">
              <Link
                href="/connexion"
                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 px-4 py-1.5 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] focus:outline-none focus:ring-2 focus:ring-cyan-300"
              >
                Commencer
              </Link>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};
