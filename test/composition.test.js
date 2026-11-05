import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const compositor = vm.createContext({});
vm.runInContext(readFileSync(new URL('../scripts/composition.js', import.meta.url), 'utf8'), compositor);

test('approved Pastel Purple assets and geometry are exact', () => {
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  const frame = readFileSync(new URL('../assets/frames/purple.png', import.meta.url));
  assert.equal(hash(frame), 'd16f06fac83b087205d35eed3c1e8b79f88ab4e530b6b578b08db14df5ef0a9f');
  assert.deepEqual([frame.readUInt32BE(16), frame.readUInt32BE(20), frame[24], frame[25]], [700, 2090, 8, 6]);
  assert.equal(hash(readFileSync(new URL('../assets/frames/purple.svg', import.meta.url))),
    '8f22697d675132666dd5bc8e40c95e6fb8b01099a01f33d2c839e61a4e885c63');
  assert.equal(hash(readFileSync(new URL('../assets/design/logo-minimal.png', import.meta.url))),
    '91fe06e8fe83b9e989663585cb5a334faeac69fa12874605b9b422b323b53c57');
});

// A controlled nearest-neighbor pixel sampler, not a browser Canvas or PNG encoder.
function createCanvas() {
  const layers = [];
  const canvas = {
    layers,
    text: [],
    getContext: () => ({
      fillRect: (...rect) => layers.push({ image: { sample: () => 'white' }, rect }),
      drawImage: (image, ...rect) => layers.push({ image, rect }),
      measureText: () => ({ width: 210 }),
      fillText(...args) { canvas.text.push({ args, font: this.font, color: this.fillStyle }); },
    }),
    sample(x, y) {
      let pixel;
      for (const { image, rect: [left, top, width, height] } of layers) {
        if (x >= left && x < left + width && y >= top && y < top + height) {
          pixel = image.sample((x - left) / width, (y - top) / height) ?? pixel;
        }
      }
      return pixel;
    },
  };
  return canvas;
}

for (const [width, height, photoHeight, stripHeight] of [
  [640, 480, 450, 2090],
  [1280, 720, 338, 1642],
  [480, 640, 800, 3490],
]) {
  test(`controlled ${width}×${height} fixtures preserve production geometry and pixels`, () => {
    // Asymmetric fixtures represent already captured/mirrored photos.
    const photos = Array.from({ length: 4 }, (_, index) => ({
      width, height, sample: x => `${index + 1}-${x < 0.5 ? 'left' : 'right'}`,
    }));
    const logo = { width: 1254, height: 1254, sample: () => 'logo' };
    const compose = () => compositor.composePhotoStrip(photos, logo, width, height, createCanvas);
    const canvas = compose();
    assert.equal(canvas.width, 700);
    assert.equal(canvas.height, stripHeight);
    assert.equal(canvas.sample(0, 0), 'white');
    assert.deepEqual(canvas.layers[0].rect, [0, 0, 700, stripHeight]);
    for (let index = 0; index < 4; index++) {
      const y = 50 + index * (photoHeight + 30);
      assert.equal(canvas.layers[index + 1].image, photos[index]);
      assert.deepEqual(canvas.layers[index + 1].rect, [50, y, 600, photoHeight]);
      assert.equal(canvas.sample(50, y), `${index + 1}-left`);
      assert.equal(canvas.sample(649, y + photoHeight - 1), `${index + 1}-right`);
      assert.equal(canvas.sample(49, y), 'white');
      assert.equal(canvas.sample(650, y), 'white');
      assert.equal(canvas.sample(50, y + photoHeight), 'white');
    }
    assert.equal(canvas.layers[5].image, logo);
    assert.equal(canvas.sample(240, stripHeight - 80), 'logo');
    assert.equal(canvas.sample(350, stripHeight - 80), 'white');
    const repeated = compose();
    for (let y = 0; y < stripHeight; y += 13) {
      for (let x = 0; x < 700; x += 17) assert.equal(canvas.sample(x, y), repeated.sample(x, y));
    }
    // Frame transparency preserves photos; frame covers the same full canvas at any aspect.
    const base = { width: canvas.width, height: canvas.height,
      sample: (x, y) => canvas.sample(x * canvas.width, y * canvas.height) };
    const frame = { sample: (x, y) => x < 0.05 || y < 0.01 ? 'purple' : null };
    const none = compositor.composeFrame(base, null, createCanvas);
    const purple = compositor.composeFrame(base, frame, createCanvas);
    assert.deepEqual(purple.layers.map(layer => layer.rect), [
      [0, 0, 700, stripHeight], [0, 0, 700, stripHeight],
    ]);
    assert.equal(none.layers.length, 1);
    assert.equal(none.sample(0, 0), 'white');
    assert.equal(purple.sample(0, 0), 'purple');
    assert.equal(purple.sample(100, 100), '1-left');
    assert.equal(none.sample(100, 100), '1-left');
    assert.equal(canvas.sample(0, 0), 'white', 'framing never mutates the base');

    const withoutLogo = compositor.composePhotoStrip(photos, null, width, height, createCanvas);
    assert.equal(withoutLogo.width, canvas.width);
    assert.equal(withoutLogo.height, canvas.height);
    assert.equal(withoutLogo.layers.length, 5, 'Purple base draws only white and four photos');
    assert.equal(withoutLogo.sample(350, stripHeight - 75), 'white');
    assert.deepEqual(withoutLogo.layers.map(layer => layer.rect), canvas.layers.slice(0, 5).map(layer => layer.rect));
    assert.deepEqual(withoutLogo.layers.slice(1).map(layer => layer.image), photos);
  });
}

test('None centers the homepage icon and wordmark together in the footer', () => {
  const canvas = compositor.composePhotoStrip(Array(4).fill({}), { width: 1254, height: 1254 },
    640, 480, createCanvas);
  const [x, y, width, height] = canvas.layers[5].rect;
  const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9);
  near(width, height);
  near(height, 63);
  near(x + width / 2, 240);
  near(y + height / 2, 2090 - 80);
  assert.deepEqual(canvas.text, [{
    args: ['snapicorn', 283, 2090 - 80], font: '600 50px "Fraunces"', color: '#332540',
  }]);
});

test('invalid photo counts and dimensions fail before allocating output', () => {
  const create = () => { throw new Error('must not allocate'); };
  for (const [photos, width, height] of [[[], 640, 480], [Array(4), 0, 480],
    [Array(4), NaN, 480], [Array(4), 640, Infinity]]) {
    assert.throws(() => compositor.composePhotoStrip(photos, {}, width, height, create), /required/);
  }
});

test('ordered stickers draw after frame on fresh canvases, smoothing is scoped even on failure', () => {
  const canvases = [];
  function factory() {
    const events = [];
    const ctx = {
      imageSmoothingEnabled: true,
      save() { events.push(['save', this.imageSmoothingEnabled]); },
      restore() { this.imageSmoothingEnabled = true; events.push(['restore']); },
      translate(...args) { events.push(['translate', ...args]); },
      rotate(...args) { events.push(['rotate', ...args]); },
      drawImage(image, ...rect) {
        events.push(['draw', image.name, this.imageSmoothingEnabled, ...rect]);
        if (image.fail) throw new Error('drawing failed');
      },
    };
    const canvas = { events, ctx, getContext: () => ctx };
    canvases.push(canvas);
    return canvas;
  }
  const base = { name: 'photos and watermark', width: 700, height: 3490 };
  const frame = { name: 'purple' };
  const images = ['star', 'heart'].map(name => ({ name, width: 1024, height: 1024 }));
  images[1].width = 1448;
  images[1].height = 1086;
  const stickers = [{ x: 0.2, y: 0.3, size: 0.2, rotation: -45 }, { x: 0.8, y: 0.9, size: 0.4, rotation: 180 }];
  const first = compositor.composeFrame(base, frame, factory, stickers, images);
  const next = compositor.composeFrame(base, frame, factory, stickers, images);
  assert.notEqual(first, next);
  assert.deepEqual(first.events, next.events);
  assert.deepEqual(first.events.filter(event => event[0] === 'draw').map(event => event.slice(1, 3)),
    [['photos and watermark', true], ['purple', true], ['star', false], ['heart', false]]);
  assert.equal(first.width, 700);
  assert.equal(first.height, 3490);
  assert.deepEqual(first.events.find(event => event[0] === 'translate'), ['translate', 140, 1047]);
  assert.equal(first.ctx.imageSmoothingEnabled, true);
  assert.deepEqual(first.events.filter(event => event[0] === 'draw').at(-1).slice(3), [-140, -105, 280, 210]);
  assert.throws(() => compositor.composeFrame(base, null, factory, [stickers[0]], [{ ...images[0], fail: true }]), /drawing failed/);
  assert.equal(canvases.at(-1).ctx.imageSmoothingEnabled, true);
  assert.deepEqual(canvases.at(-1).events.at(-1), ['restore']);
});
