// Isolated original vector proposals. Writes only inside this proposal directory.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { packageFiles } from '../../tools/static-package.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
// Union of all supported photo rectangles, with sampling clearance at both ends.
// A continuous corridor avoids separators crossing photos when the entire asset scales.
const windows = [[28, 1975]];
const sideBays = [[28, 485], [518, 490], [1010, 454], [1468, 474]];
const holes = windows.map(([y, h]) => `<rect x="46" y="${y}" width="608" height="${h}" fill="black"/>`).join('');
const horn = (x, y, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})" stroke="#7c49c6" stroke-width="2.5" stroke-linejoin="round"><path d="M-14 20 0-22 14 20Z" fill="#fffaf2"/><path d="m-8 2 17 7m-13-20 9 4" fill="none"/></g>`;
const moon = (x, y, r) => `<path d="M${x + r * .3} ${y - r}a${r} ${r} 0 1 0 ${r * .7} ${r * 1.6}a${r * .8} ${r * .8} 0 0 1 ${-r * .7} ${-r * 1.6}Z" fill="#7c49c6"/>`;
let railsA = '', railsB = '';
for (const x of [23, 677]) {
  railsA += `<path d="M${x} 56V1920" stroke="#b99cde" stroke-width="2"/>`;
  for (let y = 94; y < 1900; y += 145) {
    railsA += `<ellipse cx="${x}" cy="${y}" rx="6" ry="10" fill="#fffaf2"/><circle cx="${x}" cy="${y + 33}" r="2.5" fill="#7c49c6"/>`;
    railsB += `<path d="M${x - 8} ${y - 24}Q${x + 9} ${y} ${x - 8} ${y + 24}" fill="none" stroke="#b99cde" stroke-width="2.5"/><circle cx="${x + 5}" cy="${y + 42}" r="3" fill="#7c49c6"/>`;
  }
}
const bays = sideBays.map(([y, h]) => `<path d="M39 ${y + 12}v${h - 24}M661 ${y + 12}v${h - 24}" stroke="#7c49c6" stroke-width="2"/>`).join('');
const artworks = {
  'a-lavender-wishes': `<rect width="700" height="2090" fill="#eee4fc"/><path d="M7 7H693V2083H7Z" fill="none" stroke="#7c49c6" stroke-width="2"/>${railsA}${bays}<g transform="translate(350 2045) scale(.65) translate(-350 -2018)"><path d="M130 1981Q350 2030 570 1981M185 2050Q350 2013 515 2050" fill="none" stroke="#b99cde" stroke-width="2"/>${horn(350, 2018, 1.45)}<circle cx="276" cy="2020" r="4" fill="#7c49c6"/><circle cx="424" cy="2020" r="4" fill="#7c49c6"/></g><path d="M324 16h52" stroke="#7c49c6" stroke-width="2"/>`,
  'b-cream-moonwalk': `<rect width="700" height="2090" fill="#fffaf2"/><path d="M8 8H692V2082H8Z" fill="none" stroke="#7c49c6" stroke-width="3"/>${railsB}${bays}<g transform="translate(350 2045) scale(.65) translate(-350 -2014)"><rect x="46" y="1964" width="608" height="100" rx="50" fill="#eee4fc"/><ellipse cx="350" cy="2014" rx="115" ry="28" fill="none" stroke="#b99cde" stroke-width="2" transform="rotate(-9 350 2014)"/>${moon(350, 2014, 26)}<circle cx="234" cy="2023" r="5" fill="#7c49c6"/><circle cx="463" cy="1998" r="5" fill="#7c49c6"/></g>${horn(28, 35, .45)}${horn(672, 35, .45)}`,
};
for (const [name, shapes] of Object.entries(artworks)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="2090" viewBox="0 0 700 2090"><title>${name} — original Snapicorn proposal, unapproved</title><defs><mask id="windows" maskUnits="userSpaceOnUse" x="0" y="0" width="700" height="2090"><rect width="700" height="2090" fill="white"/>${holes}</mask></defs><g mask="url(#windows)">${shapes}</g></svg>`;
  fs.writeFileSync(path.join(here, `${name}.svg`), svg);
}
const data = file => `data:image/png;base64,${fs.readFileSync(path.join(root, file)).toString('base64')}`;
const sources = Object.fromEntries(Object.keys(artworks).map(name => [name, `data:image/svg+xml;base64,${fs.readFileSync(path.join(here, `${name}.svg`)).toString('base64')}`]));
const html = `<!doctype html><meta charset="utf-8"><pre id="result">Rendering</pre><script>${fs.readFileSync(path.join(root, 'scripts/composition.js'), 'utf8')}
const sources=${JSON.stringify(sources)}, watermarkData=${JSON.stringify(data('assets/logos/logo_transparent.png'))}, legacyData=${JSON.stringify(data('assets/frames/purple.png'))};
${fs.readFileSync(path.join(here, 'render.js'), 'utf8')}</script>`;
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'pro86-purple-'));
const entry = path.join(temporary, 'render.html');
fs.writeFileSync(entry, html);
const browser = process.env.PROPOSAL_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const dom = execFileSync(browser, ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${temporary}/profile`, '--virtual-time-budget=20000', '--dump-dom', pathToFileURL(entry).href], { encoding: 'utf8', maxBuffer: 80 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
const match = dom.match(/<pre id="result">([^<]+)<\/pre>/);
if (!match) throw new Error('No browser result');
const result = JSON.parse(match[1].replaceAll('&quot;', '"').replaceAll('&amp;', '&'));
if (result.error) throw new Error(result.error);
fs.mkdirSync(path.join(here, 'previews'), { recursive: true });
for (const [filename, url] of Object.entries(result.files)) {
  if (!/^(?:[ab]-[a-z-]+\.png|previews\/[a-z0-9-]+\.png)$/.test(filename)) throw new Error('Unexpected output path');
  fs.writeFileSync(path.join(here, filename), Buffer.from(url.split(',')[1], 'base64'));
}
const hash = f => createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const pngs = Object.keys(result.files).map(file => {
  const filename = path.join(here, file), buffer = fs.readFileSync(filename);
  if (buffer.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Invalid PNG');
  return { file, width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), bitDepth: buffer[24], colorType: buffer[25], sha256: hash(filename) };
});
for (const name of Object.keys(artworks)) {
  const png = pngs.find(p => p.file === `${name}.png`);
  if (png.width !== 700 || png.height !== 2090 || png.colorType !== 6 || png.bitDepth !== 8) throw new Error('RGBA contract failed');
}
const baseline = JSON.parse(fs.readFileSync(path.join(here, 'refinement-files-before.json')));
const changed = Object.keys(baseline).filter(f => !fs.existsSync(path.join(root, f)) || hash(path.join(root, f)) !== baseline[f]);
if (changed.length) throw new Error(`Existing files changed: ${changed}`);
if (packageFiles.some(f => f.startsWith('proposals/'))) throw new Error('Proposals packaged');
const verification = { date: '2026-10-31 (Asia/Manila)', method: 'Original code-authored SVG; Chrome Canvas PNG rasterization; unchanged production composition functions', pngs, svgs: Object.keys(artworks).map(name => ({ file: `${name}.svg`, width: 700, height: 2090, sha256: hash(path.join(here, `${name}.svg`)) })), alpha: result.alpha, checks: result.checks, previousCoverage: result.previousCoverage, windows, existingFilesCompared: Object.keys(baseline).length, existingFilesChanged: changed, proposalFilesInPackage: 0, productionHashes: Object.fromEntries(['assets/frames/purple.png', 'assets/logos/logo_transparent.png', 'scripts/composition.js', 'scripts/composition-coordinator.js', 'scripts/export.js', 'tools/static-package.js'].map(f => [f, hash(path.join(root, f))])) };
fs.writeFileSync(path.join(here, 'verification.json'), JSON.stringify(verification, null, 2) + '\n');
console.log(JSON.stringify({ pngs: pngs.filter(p => !p.file.includes('/')), alpha: result.alpha, checks: result.checks, existingFilesCompared: verification.existingFilesCompared, existingFilesChanged: changed }, null, 2));
