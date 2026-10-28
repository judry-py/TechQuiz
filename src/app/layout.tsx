import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TechQuiz - Plateforme de Quiz Tech corrigés par IA',
  description:
    'Évaluez vos compétences tech par réponses libres corrigées par IA avec progression par paliers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
