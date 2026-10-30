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
const approved = '2ae9455c799d864a47da64b0daf949b8093d34a972e334797fc4b180e59fdcad';
assert.equal(hash(fs.readFileSync(path.join(root, 'assets/frames/purple.png'))), approved);
const png = fs.readFileSync(path.join(root, 'assets/frames/purple.png'));
assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20), png[24], png[25]], [700, 2090, 8, 6]);
assert.equal(hash(fs.readFileSync(path.join(root, 'assets/logos/logo_transparent.png'))),
  '3269ed4cab6167919a04a588f5c7f76ac634a599d9876fefde7b5a19898db887');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'snapicorn-frame-pixels-'));
// A fresh profile and synthetic images avoid camera, Gallery and Settings access.
const entry = path.join(temporary, 'verify.html');
const sourceNames = ['sticker-history', 'variables', 'composition', 'preview', 'composition-coordinator', 'edit', 'export'];
const images = Object.fromEntries(['assets/frames/purple.png', 'assets/logos/logo_transparent.png']
  .map(file => [file, data(file)]));
const html = `<!doctype html><meta charset="utf-8">
<div id="strip-preview"></div><div id="strip-stage"></div><div id="export-preview"></div>
<div id="export-dimensions"></div><button id="retry-composition"></button>
<button id="download"></button><button id="share"></button><pre id="result">Pending</pre>
<script>const imageSources=${JSON.stringify(images)};
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
  `--user-data-dir=${temporary}/profile`, '--virtual-time-budget=30000', '--dump-dom', pathToFileURL(entry).href],
{ encoding: 'utf8', maxBuffer: 80 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
const match = dom.match(/<pre id="result">([^<]+)<\/pre>/);
assert.ok(match, 'Browser returned a result');
const result = JSON.parse(match[1].replaceAll('&quot;', '"').replaceAll('&amp;', '&'));
assert.equal(result.error, undefined, result.error);
const baselinePath = path.join(root, 'test/fixtures/cream-moonwalk/baselines.json');
const actual = {};
for (const output of result.outputs) {
  const bytes = Buffer.from(output.png.split(',')[1], 'base64');
  actual[output.name] = { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20),
    pngSha256: hash(bytes), rgbaSha256: output.rgbaSha256 };
  fs.writeFileSync(path.join(temporary, `${output.name}.png`), bytes);
  delete output.png;
}
// Explicit baseline creation only; normal verification never rewrites expectations.
if (process.argv.includes('--write-baselines')) {
  fs.writeFileSync(baselinePath, JSON.stringify(actual, null, 2) + '\n');
} else {
  assert.deepEqual(actual, JSON.parse(fs.readFileSync(baselinePath, 'utf8')));
}
fs.writeFileSync(path.join(temporary, 'results.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ browser, evidence: temporary, approvedSha256: approved, ...result }, null, 2));
