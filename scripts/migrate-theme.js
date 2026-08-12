#!/usr/bin/env node
/**
 * Cliniq — theme codemod v2 (monochrome)
 *
 *   node scripts/migrate-theme.js --dry     # report only, writes nothing
 *   node scripts/migrate-theme.js           # apply
 *
 * Does three things:
 *   1. Replaces legacy hard-coded hex values with var(--c-*) tokens
 *   2. Deletes the competing :root blocks in component stylesheets
 *   3. Normalises stray font-family and border-radius declarations
 *
 * Run on a clean branch. It edits files in place.
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const DRY = process.argv.includes('--dry');

/* Files the codemod must never touch. */
const SKIP = new Set(['tokens.css', 'base.css', 'theme.js']);

/* ---- Colour map -----------------------------------------------------
   Left side is every legacy value that appears 8+ times in the codebase,
   grouped by the role it was actually serving.
   -------------------------------------------------------------------- */
const COLORS = {
  /* template blue + landing indigo + gradient purple -> ink */
  '#1977cc': 'var(--c-action)',
  '#1565a0': 'var(--c-action-hover)',
  '#3291e6': 'var(--n-600)',
  '#094b85': 'var(--n-950)',
  '#05335c': 'var(--n-950)',
  '#4f5fff': 'var(--c-action)',
  '#3a4be0': 'var(--c-action-hover)',
  '#667eea': 'var(--n-700)',
  '#764ba2': 'var(--n-800)',
  '#09dca4': 'var(--c-positive)',
  '#3ecf8e': 'var(--c-positive)',

  /* tinted washes -> neutral surfaces */
  '#e3f2fd': 'var(--n-100)',
  '#bbdefb': 'var(--n-200)',
  '#f0f7ff': 'var(--n-050)',
  '#eef0ff': 'var(--n-050)',
  '#e8eaff': 'var(--n-200)',
  '#e8faf3': 'var(--c-positive-wash)',

  /* ink */
  '#2c4964': 'var(--c-ink)',
  '#272b41': 'var(--c-ink)',
  '#1a1a2e': 'var(--c-ink)',
  '#0f172a': 'var(--c-ink)',
  '#1a1d3b': 'var(--c-ink)',
  '#2e3842': 'var(--c-text)',
  '#333':    'var(--c-text)',
  '#374151': 'var(--c-text)',
  '#4a4d6a': 'var(--c-text)',
  '#6c757d': 'var(--c-text-muted)',
  '#5a6c7d': 'var(--c-text-muted)',
  '#64748b': 'var(--c-text-muted)',
  '#495057': 'var(--c-text-muted)',
  '#8b8fa8': 'var(--c-text-faint)',
  '#959595': 'var(--c-text-faint)',

  /* ground */
  '#f8f9fa': 'var(--c-bg)',
  '#f8fafc': 'var(--c-bg)',
  '#f1f5f9': 'var(--c-bg-alt)',
  '#f5f5f5': 'var(--c-bg-alt)',
  '#e9ecef': 'var(--c-border-subtle)',
  '#f0f0f0': 'var(--c-border-subtle)',
  '#e2e8f0': 'var(--c-border)',
  '#e0e0e0': 'var(--c-border)',
  '#dbdbdb': 'var(--c-border)',
  '#ddd':    'var(--c-border)',

  /* status */
  '#22c55e': 'var(--c-positive)',
  '#52c41a': 'var(--c-positive)',
  '#dc2626': 'var(--c-danger)',
  '#ff4d4f': 'var(--c-danger)',
  '#faad14': 'var(--c-signal)',
};

/* ---- Radius normalisation: 15 values -> 4 --------------------------- */
const RADII = {
  '2px': 'var(--r-sm)',  '3px': 'var(--r-sm)',  '4px': 'var(--r-sm)',
  '6px': 'var(--r-md)',  '8px': 'var(--r-md)',  '10px': 'var(--r-md)',
  '12px': 'var(--r-lg)', '14px': 'var(--r-lg)', '16px': 'var(--r-lg)',
  '20px': 'var(--r-lg)', '24px': 'var(--r-lg)', '32px': 'var(--r-lg)',
  '50px': 'var(--r-full)', '999px': 'var(--r-full)', '9999px': 'var(--r-full)',
};

const stats = { files: 0, colors: 0, radii: 0, fonts: 0, roots: 0 };
const touched = [];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(css|jsx?)$/.test(e.name) && !SKIP.has(e.name)) out.push(p);
  }
  return out;
}

function migrate(file) {
  const before = fs.readFileSync(file, 'utf8');
  let s = before;
  let n = { colors: 0, radii: 0, fonts: 0, roots: 0 };

  // 1. strip competing :root blocks (tokens.css owns :root now)
  s = s.replace(/:root\s*\{[^}]*\}\s*/g, () => { n.roots++; return ''; });

  // 2. colours — longest key first so #1977cc never partial-matches
  for (const hex of Object.keys(COLORS).sort((a, b) => b.length - a.length)) {
    const re = new RegExp(hex.replace('#', '#') + '\\b', 'gi');
    s = s.replace(re, () => { n.colors++; return COLORS[hex]; });
  }

  // 3. border-radius (skip 50% — that is a circle, deliberate)
  s = s.replace(/border-radius:\s*([0-9]+px)\s*;/g, (m, v) =>
    RADII[v] ? (n.radii++, `border-radius: ${RADII[v]};`) : m);

  // 4. font-family -> token (leave monospace stacks alone)
  s = s.replace(/font-family:\s*["']?(Poppins|Raleway|Segoe UI)["']?[^;]*;/gi,
    () => { n.fonts++; return 'font-family: var(--font-ui);'; });

  if (s === before) return;

  stats.files++;
  stats.colors += n.colors; stats.radii += n.radii;
  stats.fonts += n.fonts;   stats.roots += n.roots;
  touched.push({ file: path.relative(SRC, file), ...n });

  if (!DRY) fs.writeFileSync(file, s, 'utf8');
}

walk(SRC).forEach(migrate);

touched
  .sort((a, b) => (b.colors + b.radii) - (a.colors + a.radii))
  .slice(0, 15)
  .forEach(t => console.log(
    `  ${t.file.padEnd(52)} ${String(t.colors).padStart(4)} colors  ` +
    `${String(t.radii).padStart(3)} radii  ${String(t.roots).padStart(2)} :root`));

console.log(`\n${DRY ? 'DRY RUN — nothing written' : 'APPLIED'}`);
console.log(`  files changed : ${stats.files}`);
console.log(`  colors mapped : ${stats.colors}`);
console.log(`  radii mapped  : ${stats.radii}`);
console.log(`  fonts mapped  : ${stats.fonts}`);
console.log(`  :root removed : ${stats.roots}`);
