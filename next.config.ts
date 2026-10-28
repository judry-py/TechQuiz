import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // La racine git étant le répertoire home, Turbopack détectait C:\Users\USER
  // comme racine du projet ; on force la racine sur le dossier Techquiz.
  // Tailwind v4 est appliqué via postcss.config.mjs (@tailwindcss/postcss).
  // Autorise le tunnel ngrok utilisé pour tester le site depuis un autre appareil.
  allowedDevOrigins: ['unhammered-gratefully-journee.ngrok-free.dev'],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
