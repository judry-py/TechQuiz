// Fusionne les chunks temporaires _tmp_<slug>_nNN.json en <slug>.json final.
// Usage : node scripts/merge-question-chunks.mjs [slug1 slug2 ...]
// Sans argument, fusionne les 6 nouveaux domaines.
import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'src', 'data', 'questions');
const DEFAULT_SLUGS = [
  'genie_logiciel',
  'dev_mobile',
  'data_science',
  'systemes_embarques',
  'tests_qualite',
  'web3_blockchain',
];
const slugs = process.argv.slice(2).length > 0 ? process.argv.slice(2) : DEFAULT_SLUGS;

const REQUIRED_FIELDS = [
  'id',
  'domaine',
  'sous_theme',
  'niveau',
  'type',
  'question',
  'reponse_reference',
  'mots_cles_attendus',
];

let exitCode = 0;

for (const slug of slugs) {
  const chunks = readdirSync(dir)
    .filter((f) => f.startsWith(`_tmp_${slug}_n`) && f.endsWith('.json'))
    .sort();

  if (chunks.length === 0) {
    console.error(`[${slug}] Aucun chunk trouvé — ignoré.`);
    exitCode = 1;
    continue;
  }

  const byLevel = new Map();
  let broken = false;

  for (const file of chunks) {
    let data;
    try {
      data = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    } catch (err) {
      console.error(`[${slug}] ${file} : JSON invalide (${err.message})`);
      broken = true;
      continue;
    }
    if (!Array.isArray(data) || data.length !== 20) {
      console.error(`[${slug}] ${file} : doit contenir exactement 20 questions, reçu ${Array.isArray(data) ? data.length : 'non-tableau'}`);
      broken = true;
      continue;
    }
    const levels = [...new Set(data.map((q) => q.niveau))];
    if (levels.length !== 1) {
      console.error(`[${slug}] ${file} : plusieurs niveaux dans un chunk (${levels.join(',')})`);
      broken = true;
      continue;
    }
    const level = levels[0];
    for (const q of data) {
      for (const field of REQUIRED_FIELDS) {
        const v = q[field];
        if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0)) {
          console.error(`[${slug}] ${file} : champ "${field}" manquant/vide sur ${q.id ?? '?'}`);
          broken = true;
        }
      }
      const expectedStart = (level - 1) * 20 + 1;
      const expectedId = `${slug}-${String(expectedStart).padStart(3, '0')}`;
      if (!/^\d{3}$/.test(q.id.slice(slug.length + 1)) || !q.id.startsWith(`${slug}-`)) {
        console.error(`[${slug}] ${file} : id "${q.id}" ne suit pas le format <slug>-NNN`);
        broken = true;
      }
      void expectedId;
    }
    byLevel.set(level, data);
  }

  const missing = [];
  for (let l = 1; l <= 12; l++) {
    if (!byLevel.has(l)) missing.push(l);
  }
  if (missing.length > 0) {
    console.error(`[${slug}] Niveaux manquants : ${missing.join(', ')} — fusion annulée.`);
    exitCode = 1;
    continue;
  }
  if (broken) {
    console.error(`[${slug}] Chunks invalides — fusion annulée.`);
    exitCode = 1;
    continue;
  }

  const merged = [];
  for (let l = 1; l <= 12; l++) merged.push(...byLevel.get(l));
  const target = join(dir, `${slug}.json`);
  writeFileSync(target, JSON.stringify(merged, null, 2) + '\n', 'utf8');

  for (const file of chunks) unlinkSync(join(dir, file));

  console.log(`[${slug}] OK : ${merged.length} questions fusionnées dans ${slug}.json (chunks supprimés).`);
}

process.exit(exitCode);
