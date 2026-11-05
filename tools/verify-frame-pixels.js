import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const data = file => `data:image/png;base64,${fs.readFileSync(path.join(root, file)).toString('base64')}`;
const approved = 'd16f06fac83b087205d35eed3c1e8b79f88ab4e530b6b578b08db14df5ef0a9f';
assert.equal(hash(fs.readFileSync(path.join(root, 'assets/frames/purple.png'))), approved);
const png = fs.readFileSync(path.join(root, 'assets/frames/purple.png'));
assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20), png[24], png[25]], [700, 2090, 8, 6]);
assert.equal(hash(fs.readFileSync(path.join(root, 'assets/design/logo-minimal.png'))),
  '91fe06e8fe83b9e989663585cb5a334faeac69fa12874605b9b422b323b53c57');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'snapicorn-frame-pixels-'));
// A fresh profile and synthetic images keep this check independent of camera and Gallery data.
const entry = path.join(temporary, 'verify.html');
const sourceNames = ['sticker-history', 'variables', 'composition', 'preview', 'composition-coordinator', 'edit', 'export'];
const images = Object.fromEntries(['assets/frames/purple.png', 'assets/design/logo-minimal.png']
  .map(file => [file, data(file)]));
const reviewDirectory = process.env.FRAME_APPROVAL_DIR;
const reviewImages = reviewDirectory ? Object.fromEntries(['sample-captures', ...['none', 'purple'].flatMap(
  frame => ['4x3', '16x9', '3x4'].map(aspect => `${frame}-${aspect}-after`),
)].map(name => [name, `data:image/png;base64,${fs.readFileSync(path.join(reviewDirectory, `${name}.png`)).toString('base64')}`])) : null;
const html = `<!doctype html><meta charset="utf-8">
<style>@font-face {
  font-family: Fraunces;
  font-weight: 600;
  src: url(data:font/woff2;base64,${fs.readFileSync(path.join(root, 'assets/fonts/fraunces-latin-600.woff2')).toString('base64')}) format('woff2');
}</style>
<div id="strip-preview"></div><div id="strip-stage"></div><div id="export-preview"></div>
<div id="export-dimensions"></div><button id="retry-composition"></button>
<button id="download"></button><button id="share"></button><pre id="result">Pending</pre>
<script>const imageSources=${JSON.stringify(images)};
const reviewImages=${JSON.stringify(reviewImages)};
const StickerEditor={render(){},cancel(){}};
function renderSession(){} function setCameraStatus(){} function setExportEnabled(){} function focusDestination(){}
function cancelTransientWork(){cancelExportPreparation();}
${sourceNames.map(name => read(`scripts/${name}.js`)).join('\n')}
${read('tools/fixtures/cream-moonwalk/browser.js')}
</script>`;
fs.writeFileSync(entry, html);
const programFiles = process.env.ProgramFiles || process.env.PROGRAMFILES || '';
const browser = process.env.FRAME_TEST_BROWSER || path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe');
const dom = execFileSync(browser, ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  ...(process.env.FRAME_TEST_RESTRICTED_HOST === '1' ? ['--no-sandbox'] : []),
  `--user-data-dir=${temporary}/profile`, '--virtual-time-budget=30000', '--dump-dom', pathToFileURL(entry).href],
{ encoding: 'utf8', maxBuffer: 80 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
const match = dom.match(/<pre id="result">([^<]+)<\/pre>/);
assert.ok(match, 'Browser returned a result');
const result = JSON.parse(match[1].replaceAll('&quot;', '"').replaceAll('&amp;', '&'));
assert.equal(result.error, undefined, result.error);
const baselinePath = path.join(root, 'test/fixtures/pastel-purple/baselines.json');
const actual = {};
for (const output of result.outputs) {
  const bytes = Buffer.from(output.png.split(',')[1], 'base64');
  actual[output.name] = { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20),
    pngSha256: hash(bytes), rgbaSha256: output.rgbaSha256 };
  fs.writeFileSync(path.join(temporary, `${output.name}.png`), bytes);
  delete output.png;
}
// Explicit baseline creation only; normal verification never rewrites expectations.
if (reviewDirectory) {
  assert.ok(!process.argv.includes('--write-baselines'), 'Approval photos must not replace synthetic baselines');
} else if (process.argv.includes('--write-baselines')) {
  fs.writeFileSync(baselinePath, JSON.stringify(actual, null, 2) + '\n');
} else {
  assert.deepEqual(actual, JSON.parse(fs.readFileSync(baselinePath, 'utf8')));
}
fs.writeFileSync(path.join(temporary, 'results.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ browser, evidence: temporary, approvedSha256: approved, ...result }, null, 2));
