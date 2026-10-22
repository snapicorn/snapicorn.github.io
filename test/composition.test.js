import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const compositor = vm.createContext({});
vm.runInContext(readFileSync(new URL('../scripts/composition.js', import.meta.url), 'utf8'), compositor);

// A controlled nearest-neighbor pixel sampler, not a browser Canvas or PNG encoder.
function createCanvas() {
  const layers = [];
  const canvas = {
    layers,
    getContext: () => ({
      fillRect: (...rect) => layers.push({ image: { sample: () => 'white' }, rect }),
      drawImage: (image, ...rect) => layers.push({ image, rect }),
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
    const logo = { width: 400, height: 200, sample: () => 'watermark' };
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
    assert.deepEqual(canvas.layers[5].rect, [270, stripHeight - 115, 160, 80]);
    assert.equal(canvas.layers[5].image, logo);
    assert.equal(canvas.sample(350, stripHeight - 75), 'watermark');
    assert.equal(canvas.sample(269, stripHeight - 75), 'white');
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
  });
}

test('wide watermark retains the production maximum width and centered placement', () => {
  const canvas = compositor.composePhotoStrip(Array(4).fill({}), { width: 1000, height: 100 },
    640, 480, createCanvas);
  assert.deepEqual(canvas.layers[5].rect, [230, 2003, 240, 24]);
});

test('invalid photo counts and dimensions fail before allocating output', () => {
  const create = () => { throw new Error('must not allocate'); };
  for (const [photos, width, height] of [[[], 640, 480], [Array(4), 0, 480],
    [Array(4), NaN, 480], [Array(4), 640, Infinity]]) {
    assert.throws(() => compositor.composePhotoStrip(photos, {}, width, height, create), /required/);
  }
});
