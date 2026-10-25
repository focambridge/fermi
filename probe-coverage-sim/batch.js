#!/usr/bin/env node
/* Batch runs and parameter sweeps for the probe-coverage simulator.
   Usage: node batch.js --help */
'use strict';
const core = require('./core.js');

const DEFAULTS = {
  civs: 100, period: 1000, life: 1e4, probes: 1e9, speed: 1, near: 100, range: 2000,
  lifeShare: 1e-3, repShare: 0, reliab: 0.6, pause: 1000, strategy: 'random', prefer: false
};

const PRESETS = {
  scatter:   { civs: 100, period: 1000, life: 1e4, probes: 1e9, speed: 1, near: 100, repShare: 0, strategy: 'random' },
  survey:    { civs: 100, period: 1000, life: 1e5, probes: 1e6, speed: 1, range: 2000, lifeShare: 1e-3, repShare: 0, strategy: 'aimed', prefer: true },
  one:       { civs: 100, period: 1000, life: 1e4, probes: 1e6, speed: 1, range: 2000, repShare: 1, reliab: 0.9, pause: 1000, strategy: 'aimed', prefer: false },
  edge:      { civs: 100, period: 1000, life: 1e4, probes: 1e6, speed: 1, range: 2000, repShare: 2, reliab: 0.26, pause: 1000, strategy: 'aimed', prefer: false },
  fireflies: { civs: 300, period: 10000, life: 1000, probes: 1e6, speed: 1, near: 100, repShare: 0, strategy: 'random' }
};

const HELP = `
Probe-coverage simulator: batch runs

  node batch.js [options]

Settings (same meaning as the sliders on the page):
  --civs=N          civilisations that arise over the period        (default 100)
  --period=MYR      length of the period, in millions of years      (default 1000)
  --life=YEARS      how long each civilisation stays active         (default 10000)
  --strategy=S      random | aimed                                  (default random)
  --probes=N        ordinary probes per civilisation                (default 1e9)
  --speed=PCT       probe speed, as a percentage of light speed     (default 1)
  --near=AU         random probes: closest pass that counts, in AU  (default 100)
  --range=LY        aimed probes: survey range, in light-years      (default 2000)
  --prefer          aimed probes: visit life-bearing worlds first
  --lifeShare=F     share of stars with detectable life             (default 0.001)
  --repShare=PCT    percentage of civilisations releasing replicators (default 0)
  --reliab=P        replication reliability, 0 to 1                 (default 0.6)
  --pause=YEARS     pause to build each replicator generation       (default 1000)

Run control:
  --preset=NAME     start from a scenario: ${Object.keys(PRESETS).join(', ')}
  --runs=N          random galaxies per setting                     (default 200)
  --seed=N          base random seed                                (default 1)
  --full            also compute galaxy-wide coverage (slower)
  --sweep=KEY=V1,V2,...   repeat for several values of one setting
  --json            print one JSON object per setting instead of a table

Examples:
  node batch.js --preset=survey --runs=500
  node batch.js --preset=edge --sweep=reliab=0.22,0.24,0.26,0.28,0.3,0.35
  node batch.js --strategy=aimed --probes=1e6 --sweep=range=500,1000,2000,5000,10000 --full
`;

function parseArgs(argv) {
  const out = {};
  for (const a of argv) {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    if (!m) { console.error(`Unrecognised argument: ${a}. Run with --help for options.`); process.exit(1); }
    out[m[1]] = m[2] === undefined ? true : m[2];
  }
  return out;
}

function buildParams(args) {
  const p = { ...DEFAULTS };
  if (args.preset !== undefined) {
    const pr = PRESETS[args.preset];
    if (!pr) { console.error(`Unknown preset "${args.preset}". Choose one of: ${Object.keys(PRESETS).join(', ')}.`); process.exit(1); }
    Object.assign(p, pr);
  }
  for (const k of Object.keys(DEFAULTS)) {
    if (args[k] === undefined || k === 'strategy' || k === 'prefer') continue;
    const v = Number(args[k]);
    if (!Number.isFinite(v)) { console.error(`--${k} needs a number, got "${args[k]}".`); process.exit(1); }
    p[k] = v;
  }
  if (args.strategy !== undefined) {
    if (args.strategy !== 'random' && args.strategy !== 'aimed') { console.error('--strategy must be "random" or "aimed".'); process.exit(1); }
    p.strategy = args.strategy;
  }
  if (args.prefer !== undefined) p.prefer = args.prefer === true || args.prefer === 'true';
  p.civs = Math.max(1, Math.round(p.civs));
  return p;
}

function runSetting(p, runs, seed0, full) {
  const cfg = core.makeCfg(p);
  const ps = [], gals = [];
  let repHits = 0;
  for (let i = 0; i < runs; i++) {
    const s = (Math.imul(seed0, 1000003) + i * 7919 + 3) >>> 0;
    if (full) {
      const st = core.simulate(p, s);
      const F = core.field(st, st.T, core.makeField());
      const ss = core.sunStats(st, st.T);
      ps.push(ss.pSun); gals.push(F.gal);
      if (st.settle[core.sunCell] <= st.T) repHits++;
    } else {
      const r = core.sunOnce(p, cfg, s);
      ps.push(r.p); if (r.rep) repHits++;
    }
  }
  const sorted = [...ps].sort((a, b) => a - b);
  const q = f => sorted[Math.min(sorted.length - 1, Math.floor(f * sorted.length))];
  const mean = ps.reduce((a, b) => a + b, 0) / ps.length;
  const out = {
    runs, meanSunVisited: mean, median: q(0.5), p10: q(0.1), p90: q(0.9),
    shareOfGalaxiesAbove50pct: ps.filter(x => x > 0.5).length / ps.length,
    replicatorsReachedSun: repHits
  };
  if (full) out.meanStarsVisited = gals.reduce((a, b) => a + b, 0) / gals.length;
  return out;
}

function fmt(x) {
  if (!(x > 0)) return '0';
  if (x >= 0.01) return (x * 100).toFixed(x >= 0.1 ? 0 : 1) + '%';
  return x.toExponential(1);
}

const args = parseArgs(process.argv.slice(2));
if (args.help) { console.log(HELP); process.exit(0); }
const ALLOWED = new Set([...Object.keys(DEFAULTS), 'preset', 'runs', 'seed', 'full', 'sweep', 'json', 'help']);
for (const k of Object.keys(args)) {
  if (!ALLOWED.has(k)) { console.error(`Unknown option --${k}. Run with --help for options.`); process.exit(1); }
}
const base = buildParams(args);
const runs = Math.max(1, Math.round(Number(args.runs || 200)));
const seed0 = Math.round(Number(args.seed || 1));
const full = !!args.full;

let sweepKey = null, sweepVals = [null];
if (args.sweep !== undefined) {
  const m = String(args.sweep).match(/^([A-Za-z]+)=(.+)$/);
  if (!m || !(m[1] in DEFAULTS) || m[1] === 'strategy' || m[1] === 'prefer') {
    console.error('--sweep needs the form KEY=V1,V2,... using a numeric setting, e.g. --sweep=reliab=0.2,0.3'); process.exit(1);
  }
  sweepKey = m[1];
  sweepVals = m[2].split(',').map(Number);
  if (sweepVals.some(v => !Number.isFinite(v))) { console.error('Every sweep value must be a number.'); process.exit(1); }
}

if (!args.json) {
  console.log(`\nSettings: ${JSON.stringify(base)}`);
  console.log(`Runs per setting: ${runs}${full ? ' (full galaxy coverage)' : ''}\n`);
  const head = [sweepKey || 'setting', 'mean P(Sun)', 'median', '10th pct', '90th pct', '>50%', 'replicators hit'];
  if (full) head.push('stars visited');
  console.log(head.map(h => h.padEnd(16)).join(''));
}
for (const v of sweepVals) {
  const p = { ...base };
  if (sweepKey) p[sweepKey] = v;
  if (sweepKey === 'civs') p.civs = Math.max(1, Math.round(v));
  const t0 = Date.now();
  const r = runSetting(p, runs, seed0, full);
  if (args.json) {
    console.log(JSON.stringify({ params: p, ...r, ms: Date.now() - t0 }));
  } else {
    const row = [sweepKey ? String(v) : 'base', fmt(r.meanSunVisited), fmt(r.median), fmt(r.p10), fmt(r.p90),
      fmt(r.shareOfGalaxiesAbove50pct), `${r.replicatorsReachedSun}/${runs}`];
    if (full) row.push(fmt(r.meanStarsVisited));
    console.log(row.map(c => c.padEnd(16)).join(''));
  }
}
if (!args.json) console.log('');
