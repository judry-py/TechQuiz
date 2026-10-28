import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'src', 'data', 'questions');
const TYPES = ['definition', 'scenario'];
let failed = false;

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))) {
  const slug = file.replace('.json', '');
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  } catch (e) {
    console.error(`${file}: JSON invalide (${e.message})`);
    failed = true;
    continue;
  }
  if (!Array.isArray(raw)) {
    console.error(`${file}: le contenu doit être un tableau`);
    failed = true;
    continue;
  }
  const ids = new Set();
  const perLevel = {};
  raw.forEach((q, i) => {
    const errs = [];
    if (typeof q.id !== 'string' || !q.id) errs.push('id manquant');
    if (ids.has(q.id)) errs.push('id dupliqué');
    ids.add(q.id);
    if (q.domaine !== slug) errs.push(`domaine "${q.domaine}" != "${slug}"`);
    if (typeof q.sous_theme !== 'string' || !q.sous_theme) errs.push('sous_theme');
    if (!Number.isInteger(q.niveau) || q.niveau < 1 || q.niveau > 12) errs.push('niveau hors 1-12');
    if (!TYPES.includes(q.type)) errs.push('type invalide');
    if (typeof q.question !== 'string' || q.question.length < 3) errs.push('question');
    if (typeof q.reponse_reference !== 'string' || q.reponse_reference.length < 3)
      errs.push('reponse_reference');
    if (
      !Array.isArray(q.mots_cles_attendus) ||
      q.mots_cles_attendus.length < 1 ||
      q.mots_cles_attendus.some((k) => typeof k !== 'string' || !k)
    )
      errs.push('mots_cles_attendus');
    if (errs.length) {
      console.error(`${file}[${i}] (${q.id}) : ${errs.join(', ')}`);
      failed = true;
    }
    perLevel[q.niveau] = (perLevel[q.niveau] || 0) + 1;
  });
  const levels = Object.keys(perLevel)
    .map(Number)
    .sort((a, b) => a - b);
  const missing = [];
  for (let l = 1; l <= 12; l++) if (!perLevel[l]) missing.push(l);
  console.log(
    `${file}: ${raw.length} questions | niveaux ${levels.map((l) => l + ':' + perLevel[l]).join(' ')}${missing.length ? ' | MANQUANTS: ' + missing.join(',') : ''}`
  );
  if (missing.length) failed = true;
}

process.exit(failed ? 1 : 0);
