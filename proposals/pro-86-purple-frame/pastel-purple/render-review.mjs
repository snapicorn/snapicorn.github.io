import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const folder = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(folder, '../../..');
const read = file => fs.readFileSync(file);
const data = (type, bytes) => `data:image/${type};base64,${bytes.toString('base64')}`;
const sources = {
  before: data('png', read(path.join(folder, '../b-cream-moonwalk.png'))),
  candidate: data('svg+xml', read(path.join(folder, 'purple.svg'))),
};

async function render({ before, candidate }) {
  const makeCanvas = (width = 1, height = 1) =>
    Object.assign(document.createElement('canvas'), { width, height });
  const load = source => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not decode a review image'));
    image.src = source;
  });
  const pixels = canvas => canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
  const require = (condition, message) => { if (!condition) throw new Error(message); };
  const files = {};
  const save = (name, canvas) => { files[name] = canvas.toDataURL('image/png'); };
  const currentFrame = await load(before);
  const art = makeCanvas(700, 2090);
  art.getContext('2d').drawImage(await load(candidate), 0, 0);
  save('purple', art);
  const proposedFrame = await load(files.purple);
  const decoded = makeCanvas(700, 2090);
  decoded.getContext('2d').drawImage(proposedFrame, 0, 0);
  const candidatePixels = pixels(decoded);
  require(pixels(art).every((value, i) => value === candidatePixels[i]), 'SVG and PNG pixels differ');
  const current = makeCanvas(700, 2090);
  current.getContext('2d').drawImage(currentFrame, 0, 0);
  require(pixels(current).every((value, i) => i % 4 !== 3 || value === candidatePixels[i]),
    'Source alpha must match Cream Moonwalk exactly');

  const overview = makeCanvas(1440, 1130), overviewContext = overview.getContext('2d');
  const footers = makeCanvas(1440, 730), footerContext = footers.getContext('2d');
  for (const [canvas, context, title] of [
    [overview, overviewContext, 'Purple frame review'],
    [footers, footerContext, 'Footer comparison at export size'],
  ]) {
    context.fillStyle = '#f6f3f8';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#332540';
    context.font = '600 32px system-ui';
    context.fillText(title, 20, 45);
    context.font = '16px system-ui';
  }

  const photoSource = (width, height, index) => {
    const photo = makeCanvas(width, height), context = photo.getContext('2d');
    const palettes = [
      ['#a6c7dc', '#f3dcc3', '#527776'],
      ['#b6acd4', '#f3d8e3', '#685681'],
      ['#e6b9a8', '#f8e6bd', '#9e657a'],
      ['#99c7c6', '#e8dfc2', '#5c7993'],
    ];
    const [sky, horizon, hills] = palettes[index];
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, sky);
    gradient.addColorStop(1, horizon);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    context.fillStyle = '#fff8e9';
    context.beginPath();
    context.arc(width * (.68 + .025 * index), height * .28, height * .10, 0, 2 * Math.PI);
    context.fill();
    for (let layer = 0; layer < 3; layer++) {
      context.globalAlpha = .38 + .24 * layer;
      context.fillStyle = hills;
      context.beginPath();
      context.moveTo(0, height);
      for (let point = 0; point <= 80; point++) {
        const fraction = point / 80;
        const slope = .54 + layer * .15 + Math.sin(fraction * 8 + layer + index) * .08;
        context.lineTo(fraction * width, slope * height);
      }
      context.lineTo(width, height);
      context.fill();
    }
    context.globalAlpha = 1;
    context.fillStyle = '#3d3445';
    context.font = `600 ${width * .026}px system-ui`;
    context.fillText(`0${index + 1} / TEST CAPTURE`, width * .045, height * .13);
    return load(photo.toDataURL('image/png'));
  };

  const aspects = [['4x3', 640, 480, 2090], ['16x9', 1280, 720, 1642], ['3x4', 480, 640, 3490]];
  for (const [index, [aspect, width, height, stripHeight]] of aspects.entries()) {
    const photos = await Promise.all(Array.from({ length: 4 }, (_, i) => photoSource(width, height, i)));
    const base = composePhotoStrip(photos, null, width, height, makeCanvas);
    require(base.width === 700 && base.height === stripHeight, `Wrong output size for ${aspect}`);
    const scaledFrame = makeCanvas(700, stripHeight);
    scaledFrame.getContext('2d').drawImage(proposedFrame, 0, 0, 700, stripHeight);
    const stripBefore = composeFrame(base, currentFrame, makeCanvas);
    const stripAfter = composeFrame(base, proposedFrame, makeCanvas);
    const photoHeight = Math.round(600 * height / width);
    for (let photo = 0; photo < 4; photo++) {
      const y = 50 + photo * (photoHeight + 30);
      const region = canvas => canvas.getContext('2d').getImageData(50, y, 600, photoHeight).data;
      const frameRegion = region(scaledFrame);
      const actual = region(stripAfter);
      require(frameRegion.every((value, i) => i % 4 !== 3 || value === 0),
        `Overlay touches photo ${photo + 1} at ${aspect}`);
      require(region(base).every((value, i) => value === actual[i]),
        `Photo ${photo + 1} changed at ${aspect}`);
    }
    const ratio = aspect.replace('x', ':');
    overviewContext.fillText(`${ratio}   ·   700 × ${stripHeight}`, 20 + index * 480, 82);
    footerContext.fillText(`${ratio}   ·   700 × ${stripHeight}`, 20, 124 + index * 205);
    for (const [column, [name, strip]] of [['before', stripBefore], ['after', stripAfter]].entries()) {
      save(`${name}-${aspect}`, strip);
      const x = 20 + index * 480 + column * 225;
      const label = column ? 'Pastel Purple' : 'Cream Moonwalk';
      overviewContext.fillText(label, x, 110);
      overviewContext.drawImage(strip, x, 125, 196, stripHeight * 196 / 700);
      if (index === 0) footerContext.fillText(label, 20 + column * 700, 83);
      footerContext.drawImage(strip, 0, stripHeight - 180, 700, 180,
        20 + column * 700, 132 + index * 205, 700, 180);
    }
  }
  save('comparison', overview);
  save('footer-comparison', footers);
  return files;
}

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'snapicorn-purple-review-'));
const entry = path.join(temporary, 'render.html');
fs.writeFileSync(entry, `<!doctype html><meta charset="utf-8"><pre id="result"></pre><script>
${read(path.join(root, 'scripts/composition.js'))}
const result = document.getElementById('result');
window.addEventListener('error', event => { result.textContent = JSON.stringify({ error: event.message }); });
(${render})(${JSON.stringify(sources)}).then(files => {
  result.textContent = JSON.stringify(files);
}).catch(error => { result.textContent = JSON.stringify({ error: error.stack }); });
</script>`);
const browser = process.env.FRAME_TEST_BROWSER ||
  path.join(process.env.ProgramFiles, 'Google', 'Chrome', 'Application', 'chrome.exe');
const dom = execFileSync(browser, ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--user-data-dir=${path.join(temporary, 'profile')}`, '--virtual-time-budget=30000', '--dump-dom',
  pathToFileURL(entry).href], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
const match = dom.match(/<pre id="result">([^<]+)<\/pre>/);
assert.ok(match, 'Browser returned rendered review PNGs');
const files = JSON.parse(match[1].replaceAll('&quot;', '"').replaceAll('&amp;', '&').replaceAll('&gt;', '>'));
assert.equal(files.error, undefined, files.error);
assert.equal(Object.keys(files).length, 9);
for (const [name, source] of Object.entries(files)) {
  fs.writeFileSync(path.join(folder, `${name}.png`), Buffer.from(source.split(',')[1], 'base64'));
}
console.log('Review PNGs rendered. Source alpha matches and all 12 photo regions are pixel-identical.');
