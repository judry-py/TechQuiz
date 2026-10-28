#!/usr/bin/env node
/**
 * Test de charge / stress / vitesse HTTP pour TechQuiz.
 *
 * Usage :
 *   node scripts/load-test.mjs [--base http://localhost:3000] [--stages 10,25,50] [--per-stage 100]
 *
 * - Monte en concurrence par paliers (stress : augmenter --stages).
 * - Mesure p50/p95/p99, débit (req/s) et taux d'erreur par palier.
 * - N'appelle JAMAIS /api/grade avec un compte réel (quota IA) :
 *   le POST non authentifié doit répondre 401 rapidement.
 */

const args = process.argv.slice(2);
function getArg(name, fallback) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}

const BASE = getArg('base', 'http://localhost:3000');
const STAGES = getArg('stages', '5,10,25,50').split(',').map(Number);
const PER_STAGE = Number(getArg('per-stage', '80'));

const ENDPOINTS = [
  { method: 'GET', path: '/', expect: [200] },
  { method: 'GET', path: '/connexion', expect: [200] },
  { method: 'GET', path: '/inscription', expect: [200] },
  {
    method: 'POST',
    path: '/api/grade',
    body: JSON.stringify({ questionId: 'reseau-001', userAnswer: 'test de charge' }),
    expect: [401], // non authentifié : doit être rejeté sans consommer d'IA
  },
];

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)];
}

async function oneRequest(ep) {
  const start = performance.now();
  try {
    const res = await fetch(BASE + ep.path, {
      method: ep.method,
      headers: ep.body ? { 'content-type': 'application/json' } : undefined,
      body: ep.body,
    });
    await res.body?.cancel().catch(() => {});
    return {
      ms: performance.now() - start,
      ok: ep.expect.includes(res.status),
      status: res.status,
    };
  } catch {
    return { ms: performance.now() - start, ok: false, status: 0 };
  }
}

async function runStage(stage) {
  const total = PER_STAGE * ENDPOINTS.length;
  const queue = [];
  for (let i = 0; i < PER_STAGE; i++) {
    for (const ep of ENDPOINTS) queue.push(ep);
  }
  // Mélange pour éviter les rafales sur un seul endpoint
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }

  const results = [];
  const wallStart = performance.now();
  let cursor = 0;
  const workers = Array.from({ length: stage }, async () => {
    while (cursor < queue.length) {
      const ep = queue[cursor++];
      results.push(await oneRequest(ep));
    }
  });
  await Promise.all(workers);
  const wallMs = performance.now() - wallStart;

  const times = results.map((r) => r.ms).sort((a, b) => a - b);
  const errors = results.filter((r) => !r.ok);
  const byStatus = {};
  for (const e of errors) byStatus[e.status] = (byStatus[e.status] || 0) + 1;

  return {
    stage,
    total,
    wallMs,
    throughput: (total / wallMs) * 1000,
    p50: percentile(times, 50),
    p95: percentile(times, 95),
    p99: percentile(times, 99),
    errorRate: (errors.length / total) * 100,
    errorStatuses: byStatus,
  };
}

console.log(`\n=== TechQuiz — Test de charge ===`);
console.log(`Cible : ${BASE}`);
console.log(`Paliers de concurrence : ${STAGES.join(' → ')} | ${PER_STAGE} requêtes/endpoint/palier`);
console.log(`Endpoints : ${ENDPOINTS.map((e) => `${e.method} ${e.path}`).join(', ')}\n`);

// Phase d'échauffement (non mesurée) : Next dev compile chaque route au 1er accès.
// Sans ça, la latence de compilation à froid fausserait les p95/p99 du 1er palier.
console.log('Échauffement (compilation des routes à froid)...');
for (const ep of ENDPOINTS) {
  for (let i = 0; i < 3; i++) {
    const r = await oneRequest(ep);
    if (i === 0) {
      console.log(`  ${ep.method} ${ep.path} → statut ${r.status} en ${r.ms.toFixed(0)} ms`);
    }
  }
}
console.log('');

let failed = false;
for (const stage of STAGES) {
  const r = await runStage(stage);
  const flag = r.errorRate > 5 ? ' ❌' : r.errorRate > 0 ? ' ⚠️' : ' ✅';
  console.log(
    `Palier ${String(r.stage).padStart(3)} : ${r.total} req en ${(r.wallMs / 1000).toFixed(1)}s | ` +
      `débit ${r.throughput.toFixed(1)} req/s | p50 ${r.p50.toFixed(0)}ms | p95 ${r.p95.toFixed(0)}ms | ` +
      `p99 ${r.p99.toFixed(0)}ms | erreurs ${r.errorRate.toFixed(1)}%${flag}`
  );
  if (Object.keys(r.errorStatuses).length > 0) {
    console.log(`          statuts inattendus : ${JSON.stringify(r.errorStatuses)}`);
  }
  if (r.errorRate > 5) failed = true;
}

console.log(
  failed
    ? '\nRÉSULTAT : ÉCHEC — taux d\'erreur > 5% sur au moins un palier.\n'
    : '\nRÉSULTAT : SUCCÈS — serveur stable sur tous les paliers.\n'
);
process.exit(failed ? 1 : 0);
