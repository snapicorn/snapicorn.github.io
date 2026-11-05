// Read-only artwork investigation. Writes new evidence here; preserves prior review files.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const here = path.dirname(fileURLToPath(import.meta.url));
const proposal = path.resolve(here, '..');
const root = path.resolve(proposal, '../..');
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function inventory(directory, prefix = '') {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (['.git', 'node_modules', 'final-refinement'].includes(entry.name)) return [];
    const relative = path.join(prefix, entry.name);
    return entry.isDirectory() ? inventory(path.join(directory, entry.name), relative) : [relative];
  });
}
const before = Object.fromEntries(inventory(root).map(file => [file, hash(path.join(root, file))]));
const data = (file, mime = 'image/png') => `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
const sources = { 'b-cream-moonwalk': data(path.join(proposal, 'b-cream-moonwalk.svg'), 'image/svg+xml') };
let renderer = fs.readFileSync(path.join(proposal, 'render.js'), 'utf8');
// Count actual visible watermark contributions whose source coordinates fall in
// portrait photo 4. An opaque patch there would violate portrait photo clearance.
renderer = renderer.replace('checks.push({ name, aspect,', `
      let conflictingVisibleWatermarkPixels = 0;
      let visibleBounds = null;
      if (name === 'b-cream-moonwalk') {
        for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
          const k = (y * c.width + x) * 4;
          if (p[k] === q[k] && p[k+1] === q[k+1] && p[k+2] === q[k+2]) continue;
          const sourceY = (y + .5) * 2090 / c.height;
          if (x >= 50 && x < 650 && sourceY >= 2540 * 2090 / 3490 && sourceY < 3340 * 2090 / 3490) conflictingVisibleWatermarkPixels++;
          if (!visibleBounds) visibleBounds = { minX: x, maxX: x, minY: y, maxY: y };
          visibleBounds.minX = Math.min(visibleBounds.minX, x); visibleBounds.maxX = Math.max(visibleBounds.maxX, x);
          visibleBounds.minY = Math.min(visibleBounds.minY, y); visibleBounds.maxY = Math.max(visibleBounds.maxY, y);
        }
      }
      checks.push({ conflictingVisibleWatermarkPixels, visibleBounds, name, aspect,`);
// The comparison board requires A; it is unrelated to this isolated investigation.
renderer = renderer.slice(0, renderer.indexOf('  const board =')) + `
  document.getElementById('result').textContent = JSON.stringify({ files, alpha, checks });
})().catch(error => { document.getElementById('result').textContent = JSON.stringify({ error: error.stack }); });`;
const html = `<!doctype html><meta charset="utf-8"><pre id="result">Rendering</pre><script>
${fs.readFileSync(path.join(root, 'scripts/composition.js'), 'utf8')}
const sources=${JSON.stringify(sources)}, watermarkData=${JSON.stringify(data(path.join(root, 'assets/logos/logo_transparent.png')))}, legacyData=${JSON.stringify(data(path.join(root, 'assets/frames/purple.png')))};
${renderer}</script>`;
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'pro86-final-'));
const entry = path.join(temporary, 'render.html');
fs.writeFileSync(entry, html);
const browser = process.env.PROPOSAL_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const dom = execFileSync(browser, ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${temporary}/profile`, '--virtual-time-budget=20000', '--dump-dom', pathToFileURL(entry).href], { encoding: 'utf8', maxBuffer: 80 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
const match = dom.match(/<pre id="result">([^<]+)<\/pre>/);
if (!match) throw new Error('No browser result');
const result = JSON.parse(match[1].replaceAll('&quot;', '"').replaceAll('&amp;', '&'));
if (result.error) throw new Error(result.error);
for (const [aspect, height] of [['4x3', 2090], ['16x9', 1642], ['3x4', 3490]]) {
  const check = result.checks.find(item => item.name === 'b-cream-moonwalk' && item.aspect === aspect);
  if (!check || check.width !== 700 || check.height !== height) throw new Error('Output dimensions changed');
  if (check.photoVisibility.some(photo => photo.pixelsTouchedByOverlay)) throw new Error('Photo overlay coverage');
  if (aspect !== '3x4' && check.conflictingVisibleWatermarkPixels <= 0) throw new Error('Expected geometric conflict missing');
  if (aspect === '3x4' && check.watermarkDifferencePixels !== 0) throw new Error('Portrait watermark became visible');
}
const previews = [];
for (const [name, url] of Object.entries(result.files)) {
  if (!/^previews\/b-cream-moonwalk-(4x3|16x9|3x4)(-footer)?\.png$/.test(name)) continue;
  const file = path.join(here, path.basename(name));
  fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  const bytes = fs.readFileSync(file);
  previews.push({ file: path.basename(file), width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), sha256: hash(file), matchesPreviousPreview: hash(file) === hash(path.join(proposal, name)) });
}
const changed = Object.keys(before).filter(file => hash(path.join(root, file)) !== before[file]);
if (changed.length) throw new Error(`Pre-existing files changed: ${changed}`);
const png = fs.readFileSync(path.join(proposal, 'b-cream-moonwalk.png'));
const savedPngMatchesRasterBytes = png.equals(Buffer.from(result.files['b-cream-moonwalk.png'].split(',')[1], 'base64'));
if (!savedPngMatchesRasterBytes) throw new Error('Existing PNG differs from fresh SVG raster');
const report = {
  date: '2026-10-31 (Asia/Manila)', outcome: 'Artwork-only complete occlusion conflicts with zero portrait photo coverage; stopped without artwork edits.',
  png: { width: png.readUInt32BE(16), height: png.readUInt32BE(20), bitDepth: png[24], colorType: png[25], sha256: hash(path.join(proposal, 'b-cream-moonwalk.png')), savedPngMatchesRasterBytes },
  svgSha256: hash(path.join(proposal, 'b-cream-moonwalk.svg')),
  portraitPhoto4SourceBounds: { x: [50, 650], y: [2540 * 2090 / 3490, 3340 * 2090 / 3490] },
  alpha: result.alpha, checks: result.checks, previews,
  preservation: { filesCompared: Object.keys(before).length, changed, before },
};
fs.writeFileSync(path.join(here, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, preservation: { filesCompared: report.preservation.filesCompared, changed } }, null, 2));
