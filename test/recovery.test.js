import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function createBooth() {
  const intervals = new Map();
  const timeouts = new Map();
  const windowHandlers = {};
  const faults = {};
  const draws = [];
  const downloads = [];
  const transforms = [];
  const loadedImages = [];
  const encodedSizes = new Map();
  let timerId = 0;
  let stopped = 0;
  let requests = 0;
  let serial = 0;
  let canvasCount = 0;
  class Element {
    constructor() {
      this.style = {};
      this.children = [];
      this.handlers = {};
      this.textContent = '';
    }
    set innerHTML(value) { this.children = []; this.html = value; }
    get innerHTML() { return this.html; }
    appendChild(child) { this.children.push(child); }
    addEventListener(name, handler) { this.handlers[name] = handler; }
    removeEventListener(name) { delete this.handlers[name]; }
    setAttribute(name, value) { this[name] = value; }
    getAttribute(name) { return this[name]; }
    focus() { this.focusCount = (this.focusCount || 0) + 1; }
    click() { return this.handlers.click?.(); }
  }
  class MockImage extends Element {
    constructor() { super(); this.width = 640; this.height = 480; }
    set src(value) {
      this.source = value;
      Object.assign(this, encodedSizes.get(value));
      loadedImages.push(this);
      if (faults.hangImages) return;
      queueMicrotask(() => {
        if (faults.image?.(value)) this.onerror?.();
        else this.onload?.();
      });
    }
    get src() { return this.source; }
  }
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, new Element());
    return elements.get(id);
  };
  const video = element('camera');
  element('edit-screen').style.display = 'none';
  Object.assign(video, { videoWidth: 640, videoHeight: 480, play: async () => {} });
  const frames = ['none', 'purple'].map(name => Object.assign(new Element(), { 'data-frame': name }));
  const frameThumbnails = [new Element(), new Element()];
  const context = vm.createContext({
    document: {
      getElementById: element,
      querySelectorAll: selector => selector === '.frameButton' ? frames
        : selector === '.mini-strip' ? frameThumbnails : [],
      createElement: tag => {
        if (tag === 'img') return new MockImage();
        if (tag !== 'canvas') {
          const node = new Element();
          if (tag === 'a') node.click = () => downloads.push({ href: node.href, download: node.download });
          return node;
        }
        const canvas = new Element();
        const canvasNumber = ++canvasCount;
        canvas.getContext = () => faults.context || (faults.compositionContext && canvasNumber === 5) ? null : {
          save() { transforms.push(['save']); }, restore() { transforms.push(['restore']); },
          translate(...args) { transforms.push(['translate', ...args]); },
          scale(...args) { transforms.push(['scale', ...args]); }, fillRect() {},
          drawImage(image, ...coordinates) {
            if (faults.draw) throw new Error('draw failure');
            draws.push({ source: image.src || 'camera', coordinates });
          },
        };
        let encoded;
        canvas.toDataURL = () => {
          if (faults.encode) throw new Error('encode failure');
          encoded ||= `data:image/png;mock,${++serial}`;
          encodedSizes.set(encoded, { width: canvas.width, height: canvas.height });
          return encoded;
        };
        return canvas;
      },
    },
    Image: MockImage,
    window: { addEventListener: (name, handler) => { windowHandlers[name] = handler; } },
    navigator: { mediaDevices: { getUserMedia: async () => {
      requests++;
      const track = { readyState: 'live', stop() { stopped++; this.readyState = 'ended'; } };
      return { getTracks: () => [track], getVideoTracks: () => [track] };
    } } },
    console: { error() {} },
    setInterval: (callback, delay) => { assert.equal(delay, 1000); intervals.set(++timerId, callback); return timerId; },
    clearInterval: id => intervals.delete(id),
    setTimeout: callback => { timeouts.set(++timerId, callback); return timerId; },
    clearTimeout: id => timeouts.delete(id),
  });
  for (const name of ['variables', 'camera', 'snap', 'composition', 'preview', 'edit', 'export', 'main']) {
    vm.runInContext(readFileSync(new URL(`../scripts/${name}.js`, import.meta.url), 'utf8'), context);
  }
  return {
    context, element, faults, frames, frameThumbnails, draws, downloads, transforms, loadedImages, intervals, timeouts, windowHandlers,
    read: expression => vm.runInContext(expression, context),
    tick: () => [...intervals.values()].forEach(callback => callback()),
    get stopped() { return stopped; },
    get requests() { return requests; },
  };
}

async function settleImages() {
  for (let i = 0; i < 30; i++) await Promise.resolve();
}

async function captureFour(booth) {
  await booth.element('startButton').click();
  booth.element('snap').click();
  for (let i = 0; i < 12; i++) booth.tick();
  await settleImages();
}

test('capture slots announce ordered progress and reset after cancellation', async () => {
  const booth = createBooth();
  await booth.element('startButton').click();
  let slots = booth.element('preview-strip').children;
  assert.equal(slots.length, 4);
  assert.deepEqual(slots.map(slot => slot.children[0].textContent), ['01', '02', '03', '04']);
  assert.deepEqual(slots.map(slot => slot.children[1].alt),
    ['Photo 1 of 4', 'Photo 2 of 4', 'Photo 3 of 4', 'Photo 4 of 4']);
  assert.deepEqual(slots.map(slot => slot['data-active']), ['true', 'false', 'false', 'false']);
  assert.equal(booth.element('capture-heading').focusCount, 1);
  booth.element('snap').click();
  assert.equal(booth.element('snap-label').textContent, 'Snapping…');
  assert.equal(booth.element('countdown-photo').textContent, 'Photo 1 of 4');
  for (let i = 0; i < 6; i++) booth.tick();
  assert.equal(booth.element('capture-progress').textContent, '2 captured');
  assert.deepEqual(slots.map(slot => slot['data-active']), ['false', 'false', 'true', 'false']);
  assert.equal(booth.element('countdown-photo').textContent, 'Photo 3 of 4');
  booth.element('cancel').click();
  assert.equal(booth.element('capture-progress').textContent, '0 captured');
  assert.equal(booth.element('countdown-photo').hidden, true);
  assert.equal(booth.element('home-heading').focusCount, 1);
  await booth.element('startButton').click();
  slots = booth.element('preview-strip').children;
  assert.deepEqual(slots.map(slot => slot['data-active']), ['true', 'false', 'false', 'false']);
  assert.equal(booth.element('snap-label').textContent, 'Take 4 photos');
});

test('completed preview has an alternative and frame changes retain editor focus', async () => {
  const booth = createBooth();
  await captureFour(booth);
  assert.equal(booth.element('strip-preview').children[0].alt, 'Your four-photo Snapicorn strip');
  assert.equal(booth.element('capture-progress').textContent, '4 captured');
  assert.equal(booth.element('edit-heading').focusCount, 1);
  assert.ok(booth.frameThumbnails.every(thumbnail => thumbnail.src === booth.read('finalStrip')));
  await booth.context.applyFrame('purple');
  assert.equal(booth.element('edit-heading').focusCount, 1);
  assert.equal(booth.frames[1]['aria-pressed'], 'true');
  assert.equal(booth.element('download').disabled, false);
  booth.context.exitPhotobooth();
  assert.ok(booth.frameThumbnails.every(thumbnail => thumbnail.src === 'assets/design/logo-minimal.png'));
});

function assertCleanHome(booth) {
  assert.equal(booth.element('home-screen').style.display, 'block');
  assert.equal(booth.element('booth-screen').style.display, 'none');
  assert.equal(booth.read('imageCount'), 0);
  assert.equal(booth.read('imageURLs.length'), 0);
  assert.equal(booth.read('previewImages.length'), 0);
  assert.equal(booth.read('finalCanvas'), null);
  assert.equal(booth.read('sessionBusy'), false);
  assert.equal(booth.element('camera').srcObject, null);
  assert.equal(booth.element('countdown').style.display, 'none');
  assert.equal(booth.intervals.size, 0);
  assert.equal(booth.timeouts.size, 0);
}

test('countdown shows 3, 2, 1 for three seconds; repeated Snap cannot overlap', async () => {
  const booth = createBooth();
  await booth.element('startButton').click();
  booth.element('snap').click();
  booth.element('snap').click();
  assert.equal(booth.intervals.size, 1);
  for (const label of [3, 2, 1]) {
    assert.equal(Number(booth.element('countdown').textContent), label);
    assert.equal(booth.read('imageCount'), 0);
    booth.tick();
  }
  assert.equal(booth.read('imageCount'), 1);
  booth.element('cancel').click();
  assertCleanHome(booth);
  assert.equal(booth.stopped, 1);
});

test('cancel invalidates a queued countdown without stopping a fresh countdown', async () => {
  const booth = createBooth();
  await booth.element('startButton').click();
  booth.element('snap').click();
  const staleTick = [...booth.intervals.values()][0];
  booth.element('cancel').click();
  assertCleanHome(booth);
  await booth.element('startButton').click();
  booth.element('snap').click();
  staleTick();
  assert.equal(booth.intervals.size, 1);
  assert.equal(booth.read('imageCount'), 0);
  booth.element('cancel').click();
});

test('four-photo completion stops the camera, enables exports, and supports More', async () => {
  const booth = createBooth();
  await captureFour(booth);
  assert.equal(booth.read('imageURLs.length'), 4);
  assert.equal(booth.element('edit-screen').style.display, 'block');
  assert.equal(booth.read('finalCanvas.width'), 700);
  assert.equal(booth.read('finalCanvas.height'), 2090);
  assert.equal(booth.read('sessionBusy'), false);
  assert.equal(booth.element('download').disabled, false);
  assert.equal(booth.stopped, 1);
  await booth.element('more').click();
  assert.equal(booth.read('imageCount'), 0);
  assert.equal(booth.read('previewImages.length'), 4);
  booth.element('cancel').click();
});

for (const failure of ['context', 'draw', 'encode', 'interrupted']) {
  test(`capture ${failure} failure cleans up and same-page retry succeeds`, async () => {
    const booth = createBooth();
    await booth.element('startButton').click();
    booth.element('snap').click();
    if (failure === 'interrupted') booth.element('camera').srcObject.getVideoTracks()[0].readyState = 'ended';
    else booth.faults[failure] = true;
    for (let i = 0; i < 3; i++) booth.tick();
    assertCleanHome(booth);
    assert.match(booth.element('camera-status').textContent, /retry/);
    assert.equal(booth.stopped, 1);
    delete booth.faults[failure];
    await captureFour(booth);
    assert.equal(booth.element('edit-screen').style.display, 'block');
    assert.equal(booth.requests, 2);
  });
}

for (const failure of ['photo', 'watermark', 'display', 'context', 'draw', 'encode', 'timeout']) {
  test(`composition ${failure} failure is recoverable`, async () => {
    const booth = createBooth();
    await booth.element('startButton').click();
    booth.element('snap').click();
    // Stop just before the last photo starts composition.
    for (let i = 0; i < 11; i++) booth.tick();
    booth.faults.image = source => failure === 'photo' ? source.startsWith('data:')
      : failure === 'watermark' ? source.includes('logo')
      : failure === 'display' && source === 'data:image/png;mock,5';
    if (failure === 'context') booth.faults.compositionContext = true;
    if (failure === 'timeout') booth.faults.hangImages = true;
    booth.tick();
    if (['draw', 'encode'].includes(failure)) booth.faults[failure] = true;
    if (failure === 'timeout') {
      [...booth.timeouts.values()].forEach(callback => callback());
    }
    await settleImages();
    assertCleanHome(booth);
    assert.match(booth.element('camera-status').textContent, /retry/);
    for (const key of Object.keys(booth.faults)) delete booth.faults[key];
    await captureFour(booth);
    assert.equal(booth.element('edit-screen').style.display, 'block');
  });
}

test('cancel or page navigation during composition rejects pending loads and ignores late completion', async () => {
  for (const navigate of [false, true]) {
    const booth = createBooth();
    booth.faults.hangImages = true;
    await captureFour(booth);
    assert.equal(booth.read('pendingImageLoads.size'), 1);
    const lateLoad = booth.loadedImages.at(-1).onload;
    if (navigate) booth.windowHandlers.pagehide();
    else booth.element('cancel').click();
    await settleImages();
    assertCleanHome(booth);
    assert.equal(booth.read('pendingImageLoads.size'), 0);
    booth.faults.hangImages = false;
    await captureFour(booth);
    const completedCanvas = booth.read('finalCanvas');
    lateLoad();
    await settleImages();
    assert.equal(booth.read('finalCanvas'), completedCanvas);
    assert.equal(booth.element('edit-screen').style.display, 'block');
  }
});

test('a cancelled camera request cannot block retry or reopen the booth later', async () => {
  const booth = createBooth();
  let resolveRequest;
  let abandonedStops = 0;
  const originalRequest = booth.context.navigator.mediaDevices.getUserMedia;
  booth.context.navigator.mediaDevices.getUserMedia = () => new Promise(resolve => { resolveRequest = resolve; });
  const abandonedStart = booth.element('startButton').click();
  booth.windowHandlers.pagehide();
  booth.context.navigator.mediaDevices.getUserMedia = originalRequest;
  await booth.element('startButton').click();
  const currentStream = booth.element('camera').srcObject;
  resolveRequest({ getTracks: () => [{ stop: () => abandonedStops++ }] });
  await abandonedStart;
  assert.equal(abandonedStops, 1);
  assert.equal(booth.element('camera').srcObject, currentStream);
  assert.equal(booth.element('booth-screen').style.display, 'block');
  booth.element('cancel').click();
});

test('More cancels a pending frame load without allowing it to replace the next strip', async () => {
  const booth = createBooth();
  await captureFour(booth);
  booth.faults.hangImages = true;
  const frameUpdate = booth.context.applyFrame('purple');
  const lateLoad = booth.loadedImages.at(-1).onload;
  await booth.element('more').click();
  await frameUpdate;
  assert.equal(booth.read('finalCanvas'), null);
  assert.equal(booth.element('download').disabled, true);
  booth.faults.hangImages = false;
  booth.element('snap').click();
  for (let i = 0; i < 12; i++) booth.tick();
  await settleImages();
  const currentCanvas = booth.read('finalCanvas');
  lateLoad();
  await settleImages();
  assert.equal(booth.read('finalCanvas'), currentCanvas);
  assert.equal(booth.element('download').disabled, false);
});

test('frame load failure preserves the completed export and permits retry', async () => {
  const booth = createBooth();
  await captureFour(booth);
  const previousCanvas = booth.read('finalCanvas');
  booth.faults.image = source => source.includes('purple');
  const first = booth.context.applyFrame('purple');
  assert.equal(booth.element('download').disabled, true);
  await first;
  assert.equal(booth.read('finalCanvas'), previousCanvas);
  assert.match(booth.element('edit-camera-status').textContent, /retry/);
  assert.equal(booth.element('download').disabled, false);
  delete booth.faults.image;
  await booth.context.applyFrame('purple');
  assert.notEqual(booth.read('finalCanvas'), previousCanvas);
});

function assertPublished(booth, frame) {
  const preview = booth.element('strip-preview').children[0];
  assert.equal(booth.read('finalCanvas.width'), 700);
  assert.equal(booth.read('finalCanvas.height'), 2090);
  assert.equal(preview.src, booth.read("finalCanvas.toDataURL('image/png')"));
  assert.equal(booth.frames.find(button => button['aria-pressed'] === 'true')['data-frame'], frame);
  booth.element('download').onclick();
  assert.deepEqual(booth.downloads.at(-1), { href: preview.src, download: 'snapicorn.png' });
}

test('capture mirrors each photo once; composition preserves capture order and orientation', async () => {
  const booth = createBooth();
  await captureFour(booth);
  assert.deepEqual(booth.transforms, Array.from({ length: 4 }, () => [
    ['save'], ['translate', 640, 0], ['scale', -1, 1], ['restore'],
  ]).flat());
  assert.deepEqual(booth.draws.slice(4, 8).map(draw => draw.source),
    [1, 2, 3, 4].map(id => `data:image/png;mock,${id}`));
  assertPublished(booth, 'none');
});

test('Purple → None → Purple resolves latest request first and ignores stale success/failure', async () => {
  const booth = createBooth();
  await captureFour(booth);
  booth.faults.hangImages = true;
  const first = booth.context.applyFrame('purple');
  const oldBase = booth.loadedImages.at(-1);
  const second = booth.context.applyFrame('none');
  const middleBase = booth.loadedImages.at(-1);
  const third = booth.context.applyFrame('purple');
  booth.loadedImages.at(-1).onload();
  await settleImages();
  const purple = booth.loadedImages.at(-1);
  assert.match(purple.src, /purple/);
  purple.onload();
  await settleImages();
  assert.equal(booth.element('download').disabled, true);
  booth.element('download').onclick();
  assert.equal(booth.downloads.length, 0);
  booth.loadedImages.at(-1).onload();
  await third;
  const latest = booth.read('finalCanvas');
  assertPublished(booth, 'purple');
  oldBase.onerror();
  middleBase.onload();
  await Promise.all([first, second]);
  assert.equal(booth.read('finalCanvas'), latest);
  assert.equal(booth.element('edit-camera-status').textContent, '');
  assert.equal(booth.element('download').disabled, false);
});

test('stale preview callback cannot publish after a newer None selection', async () => {
  const booth = createBooth();
  await captureFour(booth);
  const purple = booth.context.applyFrame('purple');
  await purple;
  assertPublished(booth, 'purple');
  booth.faults.hangImages = true;
  const old = booth.context.applyFrame('purple');
  booth.loadedImages.at(-1).onload();
  await settleImages();
  booth.loadedImages.at(-1).onload();
  await settleImages();
  const stalePreview = booth.loadedImages.at(-1).onload;
  booth.faults.hangImages = false;
  await booth.context.applyFrame('none');
  const latest = booth.read('finalCanvas');
  stalePreview();
  await old;
  assert.equal(booth.read('finalCanvas'), latest);
  assertPublished(booth, 'none');
});

for (const failure of ['base', 'frame', 'preview', 'context', 'draw', 'encode', 'timeout']) {
  test(`frame ${failure} failure preserves preview, selection and export; retry works`, async () => {
    const booth = createBooth();
    await captureFour(booth);
    const previous = booth.read('finalCanvas');
    const previousPreview = booth.element('strip-preview').children[0];
    booth.faults.image = source => failure === 'base' ? source === previousPreview.src
      : failure === 'frame' ? source.includes('purple')
      : failure === 'preview' && source !== previousPreview.src && source.startsWith('data:');
    if (['context', 'draw', 'encode'].includes(failure)) booth.faults[failure] = true;
    if (failure === 'timeout') booth.faults.hangImages = true;
    const pending = booth.context.applyFrame('purple');
    if (failure === 'timeout') [...booth.timeouts.values()].forEach(callback => callback());
    await pending;
    assert.equal(booth.read('finalCanvas'), previous);
    assert.equal(booth.element('strip-preview').children[0], previousPreview);
    assert.match(booth.element('edit-camera-status').textContent, /retry/);
    for (const key of Object.keys(booth.faults)) delete booth.faults[key];
    assertPublished(booth, 'none');
    await booth.context.applyFrame('purple');
    assertPublished(booth, 'purple');
  });
}

test('download encoding failure is recoverable without mutating the composition', async () => {
  const booth = createBooth();
  await captureFour(booth);
  const previous = booth.read('finalCanvas');
  booth.faults.encode = true;
  booth.element('download').onclick();
  assert.equal(booth.downloads.length, 0);
  assert.match(booth.element('edit-camera-status').textContent, /retry/);
  assert.equal(booth.read('finalCanvas'), previous);
  delete booth.faults.encode;
  assertPublished(booth, 'none');
});

test('late Purple asset success or error cannot overwrite newer None output or feedback', async () => {
  for (const outcome of ['onload', 'onerror']) {
    const booth = createBooth();
    await captureFour(booth);
    booth.faults.hangImages = true;
    const stale = booth.context.applyFrame('purple');
    booth.loadedImages.at(-1).onload();
    await settleImages();
    const staleFrame = booth.loadedImages.at(-1)[outcome];
    booth.faults.hangImages = false;
    await booth.context.applyFrame('none');
    const latest = booth.read('finalCanvas');
    staleFrame();
    await stale;
    assert.equal(booth.read('finalCanvas'), latest);
    assert.equal(booth.element('edit-camera-status').textContent, '');
    assertPublished(booth, 'none');
  }
});
