// Local proposal renderer only. Never writes to runtime assets or the release package.
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { packageFiles } from '../../tools/static-package.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const font = readFileSync(path.join(root, 'assets/fonts/fraunces-latin-600.woff2')).toString('base64');
const artworks = {
  'a-horn-camera': `<g stroke="#7c49c6" stroke-width="22" stroke-linejoin="round">
    <path d="M208 174h67l24-38h92l24 38h67q26 0 26 26v142q0 26-26 26H208q-26 0-26-26V200q0-26 26-26Z" fill="#eee4fc"/>
    <circle cx="345" cy="270" r="66" fill="#fffaf2"/>
    <path d="M345 221q-5 42-43 49 38 7 43 49 5-42 43-49-38-7-43-49Z" fill="#7c49c6" stroke="none"/>
    <path d="m310 135 35-83 35 83Z" fill="#fffaf2"/>
    <path d="m332 93 27 16" fill="none" stroke-width="12"/>
    <circle cx="454" cy="216" r="12" fill="#7c49c6" stroke="none"/>
  </g><g fill="#7c49c6"><path d="m150 87 9 25 25 9-25 9-9 25-9-25-25-9 25-9Z"/><path d="m542 308 8 22 22 8-22 8-8 22-8-22-22-8 22-8Z"/></g>`,
  'b-orbit-camera': `<g fill="none" stroke="#7c49c6" stroke-width="19" stroke-linecap="round" stroke-linejoin="round">
    <path d="M227 176h54l22-31h84l22 31h54q24 0 24 24v128q0 24-24 24H227q-24 0-24-24V200q0-24 24-24Z" fill="#fffaf2"/>
    <circle cx="345" cy="264" r="59" fill="#eee4fc"/>
    <path d="M361 223a44 44 0 1 0 25 65 35 35 0 0 1-25-65Z" fill="#7c49c6" stroke="none"/>
    <path d="M166 260c-62 106 291 182 365 65M220 112c90-28 228 7 290 82" stroke-width="12"/>
  </g><g fill="#7c49c6"><path d="m506 183 12 33 33 12-33 12-12 33-12-33-33-12 33-12Z"/><circle cx="196" cy="128" r="12"/><circle cx="192" cy="354" r="10"/></g>`,
};
for (const [name, shapes] of Object.entries(artworks)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="690" height="624" viewBox="0 0 690 624"><title>Snapicorn proposal ${name} — not approved</title><defs><style>@font-face{font-family:Fraunces;src:url(data:font/woff2;base64,${font})}text{font-family:Fraunces;font-weight:600}</style></defs>${shapes}<text x="345" y="515" text-anchor="middle" font-size="108" fill="#7c49c6">Snapicorn</text></svg>`;
  writeFileSync(path.join(here, `${name}.svg`), svg);
}
const compositor = readFileSync(path.join(root, 'scripts/composition.js'), 'utf8');
const imageData = filename => `data:image/png;base64,${readFileSync(path.join(root, filename)).toString('base64')}`;
const html = `<!doctype html><meta charset="utf-8"><pre id="result">Rendering…</pre><script>
${compositor}
const artworks = ${JSON.stringify(artworks)};
const fontData = 'data:font/woff2;base64,${font}';
const legacyData = '${imageData('assets/logos/logo_transparent.png')}';
const purpleData = '${imageData('assets/frames/purple.png')}';
${readFileSync(path.join(here, 'render.js'), 'utf8')}
</script>`;
writeFileSync(path.join(here, 'render.local.html'), html);
const browser = process.env.PROPOSAL_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = mkdtempSync(path.join(os.tmpdir(), 'snapicorn-proposal-'));
const dom = execFileSync(browser, ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${profile}`, '--virtual-time-budget=15000', '--dump-dom', pathToFileURL(path.join(here, 'render.local.html')).href], { maxBuffer: 64 * 1024 * 1024, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const match = dom.match(/<pre id="result">([^<]+)<\/pre>/);
if (!match) throw new Error('Renderer returned no result');
const result = JSON.parse(match[1].replaceAll('&quot;', '"').replaceAll('&amp;', '&'));
if (result.error) throw new Error(result.error);
mkdirSync(path.join(here, 'previews'), { recursive: true });
for (const [filename, data] of Object.entries(result.files)) {
  if (!/^(?:[ab]-[a-z-]+\.png|previews\/[a-z0-9-]+\.png)$/.test(filename)) throw new Error('Unexpected renderer path');
  writeFileSync(path.join(here, filename), Buffer.from(data.split(',')[1], 'base64'));
}
const sha = file => createHash('sha256').update(readFileSync(path.join(root, file))).digest('hex');
const candidateFiles = Object.keys(artworks).map(name => `proposals/pro-86-watermark/${name}.png`);
if (candidateFiles.some(file => packageFiles.includes(file))) throw new Error('Proposal unexpectedly packaged');
const evidence = {
  date: '2026-10-31 (Asia/Manila)', tool: 'Hand-authored SVG geometry + local Chrome Canvas rasterization; no image generation service or image reference inputs',
  browserVersion: execFileSync('powershell', ['-NoProfile', '-Command', `(Get-Item -LiteralPath '${browser}').VersionInfo.ProductVersion`], { encoding: 'utf8' }).trim(),
  candidates: result.candidates.map(item => ({ ...item, sha256: sha(`proposals/pro-86-watermark/${item.name}.png`) })),
  checks: result.checks, productionHashes: Object.fromEntries(['assets/logos/logo_transparent.png', 'assets/frames/purple.png', 'scripts/composition.js', 'scripts/composition-coordinator.js', 'scripts/export.js', 'tools/static-package.js'].map(file => [file, sha(file)])),
  proposalPathsInReleaseAllowlist: 0,
};
writeFileSync(path.join(here, 'verification.json'), JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify(evidence, null, 2));
