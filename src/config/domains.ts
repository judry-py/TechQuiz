export interface DomainConfig {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  iconName:
    | 'Network'
    | 'Shield'
    | 'Code'
    | 'Brain'
    | 'Database'
    | 'Cloud'
    | 'GitBranch'
    | 'Smartphone'
    | 'FlaskConical'
    | 'Cpu'
    | 'ClipboardCheck'
    | 'Blocks';
  colorName:
    | 'cyan'
    | 'emerald'
    | 'violet'
    | 'pink'
    | 'amber'
    | 'sky'
    | 'lime'
    | 'indigo'
    | 'orange'
    | 'teal'
    | 'rose'
    | 'fuchsia';
  accentColor: string; // Hex for neon glow
  accentBorder: string;
  accentBg: string;
  accentText: string;
  accentGlow: string;
  questionFile: string;
}

export const DOMAINS: Record<string, DomainConfig> = {
  reseau: {
    slug: 'reseau',
    name: 'Réseau & Télécoms',
    shortName: 'Réseau',
    description: 'Protocoles, routage, adressage IP, architectures réseau et modèles OSI.',
    iconName: 'Network',
    colorName: 'cyan',
    accentColor: '#06b6d4',
    accentBorder: 'border-cyan-500/40 hover:border-cyan-400',
    accentBg: 'bg-cyan-500/10 hover:bg-cyan-500/20',
    accentText: 'text-cyan-400',
    accentGlow: 'shadow-[0_0_25px_rgba(6,182,212,0.3)]',
    questionFile: 'reseau.json',
  },
  cybersecurite: {
    slug: 'cybersecurite',
    name: 'Cybersécurité',
    shortName: 'Cyber',
    description: 'Cryptographie, menaces, durcissement, audits et gestion des vulnérabilités.',
    iconName: 'Shield',
    colorName: 'emerald',
    accentColor: '#10b981',
    accentBorder: 'border-emerald-500/40 hover:border-emerald-400',
    accentBg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    accentText: 'text-emerald-400',
    accentGlow: 'shadow-[0_0_25px_rgba(16,185,129,0.3)]',
    questionFile: 'cybersecurite.json',
  },
  dev_web: {
    slug: 'dev_web',
    name: 'Développement Web',
    shortName: 'Dév Web',
    description:
      'Frontend, backend, API REST, performances, sécurité web et architectures modernes.',
    iconName: 'Code',
    colorName: 'violet',
    accentColor: '#8b5cf6',
    accentBorder: 'border-violet-500/40 hover:border-violet-400',
    accentBg: 'bg-violet-500/10 hover:bg-violet-500/20',
    accentText: 'text-violet-400',
    accentGlow: 'shadow-[0_0_25px_rgba(139,92,246,0.3)]',
    questionFile: 'dev_web.json',
  },
  ia: {
    slug: 'ia',
    name: 'Intelligence Artificielle',
    shortName: 'IA',
    description: 'Machine Learning, Deep Learning, NLP, LLM, Computer Vision et éthique.',
    iconName: 'Brain',
    colorName: 'pink',
    accentColor: '#ec4899',
    accentBorder: 'border-pink-500/40 hover:border-pink-400',
    accentBg: 'bg-pink-500/10 hover:bg-pink-500/20',
    accentText: 'text-pink-400',
    accentGlow: 'shadow-[0_0_25px_rgba(236,72,153,0.3)]',
    questionFile: 'ia.json',
  },
  bases_donnees: {
    slug: 'bases_donnees',
    name: 'Bases de Données',
    shortName: 'BDD',
    description:
      'Modélisation, SQL, index, transactions ACID, NoSQL, réplication et optimisation des requêtes.',
    iconName: 'Database',
    colorName: 'amber',
    accentColor: '#f59e0b',
    accentBorder: 'border-amber-500/40 hover:border-amber-400',
    accentBg: 'bg-amber-500/10 hover:bg-amber-500/20',
    accentText: 'text-amber-400',
    accentGlow: 'shadow-[0_0_25px_rgba(245,158,11,0.3)]',
    questionFile: 'bases_donnees.json',
  },
  devops: {
    slug: 'devops',
    name: 'DevOps & Cloud',
    shortName: 'DevOps',
    description:
      'CI/CD, conteneurs, Kubernetes, IaC, monitoring, SRE et déploiements continus.',
    iconName: 'Cloud',
    colorName: 'sky',
    accentColor: '#0ea5e9',
    accentBorder: 'border-sky-500/40 hover:border-sky-400',
    accentBg: 'bg-sky-500/10 hover:bg-sky-500/20',
    accentText: 'text-sky-400',
    accentGlow: 'shadow-[0_0_25px_rgba(14,165,233,0.3)]',
    questionFile: 'devops.json',
  },
  genie_logiciel: {
    slug: 'genie_logiciel',
    name: 'Génie Logiciel',
    shortName: 'Genie Log.',
    description:
      'Cycle de vie, architectures logicielles, design patterns, méthodes agiles, tests et dette technique.',
    iconName: 'GitBranch',
    colorName: 'lime',
    accentColor: '#84cc16',
    accentBorder: 'border-lime-500/40 hover:border-lime-400',
    accentBg: 'bg-lime-500/10 hover:bg-lime-500/20',
    accentText: 'text-lime-400',
    accentGlow: 'shadow-[0_0_25px_rgba(132,204,22,0.3)]',
    questionFile: 'genie_logiciel.json',
  },
  dev_mobile: {
    slug: 'dev_mobile',
    name: 'Développement Mobile',
    shortName: 'Mobile',
    description:
      'iOS et Android, Swift et Kotlin, architectures mobiles, offline-first, stores et industrialisation.',
    iconName: 'Smartphone',
    colorName: 'indigo',
    accentColor: '#6366f1',
    accentBorder: 'border-indigo-500/40 hover:border-indigo-400',
    accentBg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
    accentText: 'text-indigo-400',
    accentGlow: 'shadow-[0_0_25px_rgba(99,102,241,0.3)]',
    questionFile: 'dev_mobile.json',
  },
  data_science: {
    slug: 'data_science',
    name: 'Data Science',
    shortName: 'Data',
    description:
      'Statistiques, Python data, feature engineering, modèles prédictifs, MLOps et IA responsable.',
    iconName: 'FlaskConical',
    colorName: 'orange',
    accentColor: '#f97316',
    accentBorder: 'border-orange-500/40 hover:border-orange-400',
    accentBg: 'bg-orange-500/10 hover:bg-orange-500/20',
    accentText: 'text-orange-400',
    accentGlow: 'shadow-[0_0_25px_rgba(249,115,22,0.3)]',
    questionFile: 'data_science.json',
  },
  systemes_embarques: {
    slug: 'systemes_embarques',
    name: 'Systèmes Embarqués & IoT',
    shortName: 'Embarqué',
    description:
      'Microcontrôleurs, C embarqué, temps réel, capteurs, sans-fil, sécurité embarquée et edge AI.',
    iconName: 'Cpu',
    colorName: 'teal',
    accentColor: '#14b8a6',
    accentBorder: 'border-teal-500/40 hover:border-teal-400',
    accentBg: 'bg-teal-500/10 hover:bg-teal-500/20',
    accentText: 'text-teal-400',
    accentGlow: 'shadow-[0_0_25px_rgba(20,184,166,0.3)]',
    questionFile: 'systemes_embarques.json',
  },
  tests_qualite: {
    slug: 'tests_qualite',
    name: 'Qualité & Tests',
    shortName: 'QA',
    description:
      'Tests unitaires à bout en bout, TDD, couverture, CI, tests de charge, fuzzing et métriques DORA.',
    iconName: 'ClipboardCheck',
    colorName: 'rose',
    accentColor: '#f43f5e',
    accentBorder: 'border-rose-500/40 hover:border-rose-400',
    accentBg: 'bg-rose-500/10 hover:bg-rose-500/20',
    accentText: 'text-rose-400',
    accentGlow: 'shadow-[0_0_25px_rgba(244,63,94,0.3)]',
    questionFile: 'tests_qualite.json',
  },
  web3_blockchain: {
    slug: 'web3_blockchain',
    name: 'Web3 & Blockchain',
    shortName: 'Web3',
    description:
      'Registre distribué, consensus, smart contracts, DeFi, zéro-connaissance, tokenomics et régulation.',
    iconName: 'Blocks',
    colorName: 'fuchsia',
    accentColor: '#d946ef',
    accentBorder: 'border-fuchsia-500/40 hover:border-fuchsia-400',
    accentBg: 'bg-fuchsia-500/10 hover:bg-fuchsia-500/20',
    accentText: 'text-fuchsia-400',
    accentGlow: 'shadow-[0_0_25px_rgba(217,70,239,0.3)]',
    questionFile: 'web3_blockchain.json',
  },
};

export const DOMAIN_SLUGS = Object.keys(DOMAINS) as Array<keyof typeof DOMAINS>;

export function getDomainConfig(slug: string): DomainConfig | undefined {
  return DOMAINS[slug];
}

export function getAllDomains(): DomainConfig[] {
  return Object.values(DOMAINS);
}
