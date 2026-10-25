import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { File } from 'node:buffer';
import { webcrypto } from 'node:crypto';
import { disposableIDB, png } from './idb-fixture.js';

function createBooth(storage) {
  const intervals = new Map();
  const timeouts = new Map();
  const windowHandlers = {};
  const faults = {};
  const draws = [];
  const downloads = [];
  const objectURLs = new Map();
  const revokedURLs = [];
  let urlSerial = 0;
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
      this.style = { setProperty(name, value) { this[name] = value; } };
      this.children = [];
      this.handlers = {};
      this.textContent = '';
      this.isConnected = true;
      this.width = 640; this.height = 480;
    }
    set innerHTML(value) { this.children = []; this.html = value; }
    get innerHTML() { return this.html; }
    appendChild(child) {
      this.children.push(child);
      if (child.id === 'compiled-strip' && faults.cssImageDimensions) Object.assign(child, faults.cssImageDimensions);
    }
    remove() { for (const parent of elements.values()) parent.children = parent.children.filter(child => child !== this); }
    prepend(child) { this.children.unshift(child); }
    removeAttribute(name) { if (name === 'src') delete this.source; else delete this[name]; }
    showModal() { this.open = true; }
    close() { this.open = false; }
    getBoundingClientRect() { return { left: 10, right: 500, top: 10, bottom: 500, width: 490, height: 490 }; }
    setPointerCapture() {}
    hasPointerCapture() { return false; }
    addEventListener(name, handler) { this.handlers[name] = handler; }
    removeEventListener(name) { delete this.handlers[name]; }
    setAttribute(name, value) { this[name] = value; }
    getAttribute(name) { return this[name]; }
    focus() { this.focusCount = (this.focusCount || 0) + 1; }
    click() { if (!this.disabled) return this.handlers.click?.(); }
  }
  class MockImage extends Element {
    constructor() { super(); this.width = 640; this.height = 480; }
    get naturalWidth() { return this.intrinsicWidth ?? this.width; }
    get naturalHeight() { return this.intrinsicHeight ?? this.height; }
    set src(value) {
      this.source = value;
      Object.assign(this, encodedSizes.get(value));
      this.intrinsicWidth = this.width;
      this.intrinsicHeight = this.height;
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
    if (!elements.has(id)) elements.set(id, ['retake-original', 'retake-candidate'].includes(id) ? new MockImage() : new Element());
    return elements.get(id);
  };
  const video = element('camera');
  element('edit-screen').style.display = 'none';
  Object.assign(video, { videoWidth: 640, videoHeight: 480, play: async () => {} });
  const frames = ['none', 'purple'].map(name => Object.assign(new Element(), { 'data-frame': name }));
  const frameThumbnails = [new Element(), new Element()];
  const context = vm.createContext({
    document: {
      body: element('body'),
      documentElement: element('html'),
      getElementById: element,
      querySelector: () => element('camera-panel'),
      querySelectorAll: selector => selector === '.frameButton' ? frames
        : selector === '.mini-strip' ? frameThumbnails : [],
      createElement: tag => {
        if (tag === 'img') return new MockImage();
        if (tag !== 'canvas') {
          const node = new Element();
          if (tag === 'a') node.click = () => downloads.push({ href: objectURLs.get(node.href)?.source, download: node.download });
          return node;
        }
        const canvas = new Element();
        const canvasNumber = ++canvasCount;
        canvas.getContext = () => faults.context || (faults.compositionContext && canvasNumber === 5) ? null : {
          save() { transforms.push(['save']); }, restore() { transforms.push(['restore']); },
          translate(...args) { transforms.push(['translate', ...args]); },
          scale(...args) { transforms.push(['scale', ...args]); }, fillRect() {},
          rotate(...args) { transforms.push(['rotate', ...args]); },
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
        canvas.toBlob = callback => {
          if (faults.encode) throw new Error('encode failure');
          const blob = new Blob([canvas.toDataURL()], { type: 'image/png' });
          blob.source = canvas.toDataURL();
          queueMicrotask(() => callback(blob));
        };
        return canvas;
      },
    },
    Image: MockImage,
    URL: {
      createObjectURL(blob) { const url = `blob:mock-${++urlSerial}`; objectURLs.set(url, blob); return url; },
      revokeObjectURL(url) { revokedURLs.push(url); objectURLs.delete(url); },
    },
    File,
    Blob,
    AbortController,
    crypto: webcrypto,
    indexedDB: storage?.factory,
    createImageBitmap: async () => ({ width: 100, height: 300, close() {} }),
    window: { addEventListener: (name, handler) => {
      const previous = windowHandlers[name];
      windowHandlers[name] = (...args) => { previous?.(...args); handler(...args); };
    } },
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
  for (const name of ['sticker-geometry', 'sticker-history', 'sticker-gestures', 'variables', 'camera', 'snap', 'composition', 'preview', 'composition-coordinator', 'edit', 'sticker-editor', 'export', 'gallery-store', 'gallery', 'settings', 'main']) {
    vm.runInContext(readFileSync(new URL(`../scripts/${name}.js`, import.meta.url), 'utf8'), context);
  }
  return {
    context, element, faults, frames, frameThumbnails, draws, downloads, transforms, loadedImages, intervals, timeouts, windowHandlers, objectURLs, revokedURLs,
    read: expression => vm.runInContext(expression, context),
    tick: () => [...intervals.values()].forEach(callback => callback()),
    get stopped() { return stopped; },
    get requests() { return requests; },
  };
}

async function settleImages() {
  for (let i = 0; i < 60; i++) await Promise.resolve();
}

async function captureFour(booth) {
  await booth.element('startButton').click();
  await booth.element('enable-camera').click();
  booth.element('snap').click();
  for (let i = 0; i < 12; i++) booth.tick();
  booth.element('customize').click();
  await settleImages();
}

test('capture slots announce ordered progress and reset after cancellation', async () => {
  const booth = createBooth();
  await booth.element('startButton').click();
  await booth.element('enable-camera').click();
  let slots = booth.element('preview-strip').children;
  assert.equal(slots.length, 4);
  assert.deepEqual(slots.map(slot => slot.children[0].textContent), ['01', '02', '03', '04']);
  assert.deepEqual(slots.map(slot => slot.children[1].alt),
    [1, 2, 3, 4].map(number => `Photo ${number} of 4, not captured yet`));
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
  await booth.element('enable-camera').click();
  slots = booth.element('preview-strip').children;
  assert.deepEqual(slots.map(slot => slot['data-active']), ['true', 'false', 'false', 'false']);
  assert.equal(booth.element('snap-label').textContent, 'Take 4 photos');
});

test('completed preview has an alternative and frame changes retain editor focus', async () => {
  const booth = createBooth();
  await captureFour(booth);
  assert.equal(booth.element('strip-preview').children[0].alt, 'Your four-photo Snapicorn strip, no frame');
  assert.equal(booth.element('capture-progress').textContent, '4 captured');
  assert.equal(booth.element('edit-heading').focusCount, 1);
  assert.ok(booth.frameThumbnails.every(thumbnail => thumbnail.src === booth.read('session.output.base')));
  await booth.context.applyFrame('purple');
  assert.equal(booth.element('edit-heading').focusCount, 1);
  assert.equal(booth.frames[1].checked, true);
  assert.equal(booth.element('strip-preview').children[0].alt, 'Your four-photo Snapicorn strip, Purple frame');
  assert.equal(booth.element('download').disabled, false);
  booth.context.exitPhotobooth();
  assert.ok(booth.frameThumbnails.every(thumbnail => thumbnail.src === 'assets/design/logo-minimal.png'));
});

test('capture keeps Cancel focused and gives countdown context without changing the visual digits', async () => {
  const booth = createBooth();
  await booth.element('startButton').click();
  await booth.element('enable-camera').click();
  booth.element('snap').click();
  assert.equal(booth.element('cancel').focusCount, 1);
  assert.equal(booth.element('snap').disabled, true);
  assert.equal(booth.element('countdown-status').textContent, 'Photo 1 of 4. 3');
  booth.tick();
  assert.equal(booth.element('countdown-status').textContent, '2');
  booth.tick();
  assert.equal(booth.element('countdown-status').textContent, '1');
  booth.tick();
  assert.equal(booth.element('preview-strip').children[0].children[1].alt, 'Captured photo 1 of 4');
  assert.equal(booth.element('countdown-status').textContent, 'Photo 2 of 4. 3');
  booth.element('cancel').click();
  assert.equal(booth.element('countdown-status').textContent, '');
  assert.equal(booth.element('home-heading').focusCount, 1);
});

test('native radio changes retain requested frame and block export on failure until retry', async () => {
  const booth = createBooth();
  await captureFour(booth);
  const purple = booth.frames[1];
  purple.value = 'purple';
  purple.checked = true;
  booth.frames[0].checked = false;
  booth.faults.image = source => source.includes('purple');
  purple.handlers.change();
  assert.equal(booth.element('edit-camera-status').textContent, 'Updating your strip…');
  assert.equal(booth.element('download').disabled, true);
  await settleImages();
  assert.equal(purple.checked, true);
  assert.equal(booth.frames[0].checked, false);
  assert.match(booth.element('edit-camera-status').textContent, /retry/i);
  assert.equal(booth.element('download').disabled, true);
  assert.equal(booth.element('strip-preview').children[0].alt, 'Your four-photo Snapicorn strip, no frame');
  delete booth.faults.image;
  purple.checked = true;
  purple.handlers.change();
  await settleImages();
  await assertPublished(booth, 'purple');
  assert.equal(booth.element('edit-heading').focusCount, 1);
});

function assertCleanHome(booth) {
  assert.equal(booth.element('home-screen').style.display, 'block');
  assert.equal(booth.element('booth-screen').style.display, 'none');
  assert.equal(booth.read('session.photos.length'), 0);
  assert.equal(booth.read('session.photos.map(photo => photo.source).length'), 0);
  assert.equal(booth.read('previewImages.length'), 4);
  assert.equal(booth.read('session.output.canvas'), null);
  assert.equal(booth.read('operations.busy'), false);
  assert.equal(booth.element('camera').srcObject, null);
  assert.equal(booth.element('countdown').style.display, 'none');
  assert.equal(booth.intervals.size, 0);
  assert.equal(booth.timeouts.size, 0);
}

test('countdown shows 3, 2, 1 for three seconds; repeated Snap cannot overlap', async () => {
  const booth = createBooth();
  await booth.element('startButton').click();
  await booth.element('enable-camera').click();
  booth.element('snap').click();
  booth.element('snap').click();
  assert.equal(booth.intervals.size, 1);
  for (const label of [3, 2, 1]) {
    assert.equal(Number(booth.element('countdown').textContent), label);
    assert.equal(booth.read('session.photos.length'), 0);
    booth.tick();
  }
  assert.equal(booth.read('session.photos.length'), 1);
  booth.element('cancel').click();
  assertCleanHome(booth);
  assert.equal(booth.stopped, 1);
});

test('cancel invalidates a queued countdown without stopping a fresh countdown', async () => {
  const booth = createBooth();
  await booth.element('startButton').click();
  await booth.element('enable-camera').click();
  booth.element('snap').click();
  const staleTick = [...booth.intervals.values()][0];
  booth.element('cancel').click();
  assertCleanHome(booth);
  await booth.element('startButton').click();
  await booth.element('enable-camera').click();
  booth.element('snap').click();
  staleTick();
  assert.equal(booth.intervals.size, 1);
  assert.equal(booth.read('session.photos.length'), 0);
  booth.element('cancel').click();
});

test('four-photo completion stops the camera, enables exports, and supports More', async () => {
  const booth = createBooth();
  await captureFour(booth);
  assert.equal(booth.read('session.photos.map(photo => photo.source).length'), 4);
  assert.equal(booth.element('edit-screen').style.display, 'block');
  assert.equal(booth.read('session.output.canvas.width'), 700);
  assert.equal(booth.read('session.output.canvas.height'), 2090);
  assert.equal(booth.read('operations.busy'), false);
  assert.equal(booth.element('download').disabled, false);
  assert.equal(booth.stopped, 1);
  await booth.element('more').click();
  booth.element('new-strip').click();
  assert.equal(booth.read('session.photos.length'), 0);
  assert.equal(booth.read('previewImages.length'), 4);
  booth.element('cancel').click();
});

for (const failure of ['context', 'draw', 'encode', 'interrupted']) {
  test(`capture ${failure} failure cleans up and same-page retry succeeds`, async () => {
    const booth = createBooth();
    await booth.element('startButton').click();
  await booth.element('enable-camera').click();
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
  await booth.element('enable-camera').click();
    booth.element('snap').click();
    // Stop just before the last photo starts composition.
    for (let i = 0; i < 11; i++) booth.tick();
    booth.faults.image = source => failure === 'photo' ? source.startsWith('data:')
      : failure === 'watermark' ? source.includes('logo')
      : failure === 'display' && source === 'data:image/png;mock,5';
    if (failure === 'context') booth.faults.compositionContext = true;
    if (failure === 'timeout') booth.faults.hangImages = true;
    booth.tick();
    booth.element('customize').click();
    if (['draw', 'encode'].includes(failure)) booth.faults[failure] = true;
    if (failure === 'timeout') {
      [...booth.timeouts.values()].forEach(callback => callback());
    }
    await settleImages();
    assert.equal(booth.read('session.photos.length'), 4);
    assert.equal(booth.element('review-screen').style.display, 'block');
    assert.match(booth.element('review-status').textContent, /retry/);
    for (const key of Object.keys(booth.faults)) delete booth.faults[key];
    await booth.element('customize').click();
    await settleImages();
    assert.equal(booth.element('edit-screen').style.display, 'block');
  });
}

test('cancel or page navigation during composition rejects pending loads and ignores late completion', async () => {
  for (const navigate of [false, true]) {
    const booth = createBooth();
    booth.faults.hangImages = true;
    await captureFour(booth);
    assert.equal(booth.read('operations.pendingImageLoads.size'), 1);
    const lateLoad = booth.loadedImages.at(-1).onload;
    if (navigate) booth.windowHandlers.pagehide();
    else booth.context.exitPhotobooth();
    await settleImages();
    assertCleanHome(booth);
    assert.equal(booth.read('operations.pendingImageLoads.size'), 0);
    booth.faults.hangImages = false;
    await captureFour(booth);
    const completedCanvas = booth.read('session.output.canvas');
    lateLoad();
    await settleImages();
    assert.equal(booth.read('session.output.canvas'), completedCanvas);
    assert.equal(booth.element('edit-screen').style.display, 'block');
  }
});

test('a cancelled camera request cannot block retry or reopen the booth later', async () => {
  const booth = createBooth();
  let resolveRequest;
  let abandonedStops = 0;
  const originalRequest = booth.context.navigator.mediaDevices.getUserMedia;
  booth.context.navigator.mediaDevices.getUserMedia = () => new Promise(resolve => { resolveRequest = resolve; });
  booth.element('startButton').click();
  const abandonedStart = booth.element('enable-camera').click();
  booth.windowHandlers.pagehide();
  booth.context.navigator.mediaDevices.getUserMedia = originalRequest;
  await booth.element('startButton').click();
  await booth.element('enable-camera').click();
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
  booth.element('new-strip').click();
  await frameUpdate;
  assert.equal(booth.read('session.output.canvas'), null);
  assert.equal(booth.element('download').disabled, true);
  booth.faults.hangImages = false;
  await booth.element('enable-camera').click();
  booth.element('snap').click();
  for (let i = 0; i < 12; i++) booth.tick();
  booth.element('customize').click();
  await settleImages();
  const currentCanvas = booth.read('session.output.canvas');
  lateLoad();
  await settleImages();
  assert.equal(booth.read('session.output.canvas'), currentCanvas);
  assert.equal(booth.element('download').disabled, false);
});

test('frame load failure retains last good pixels internally and prevents outdated export until retry', async () => {
  const booth = createBooth();
  await captureFour(booth);
  const previousCanvas = booth.read('session.output.canvas');
  booth.faults.image = source => source.includes('purple');
  const first = booth.context.applyFrame('purple');
  assert.equal(booth.element('download').disabled, true);
  await first;
  assert.equal(booth.read('session.output.canvas'), previousCanvas);
  assert.match(booth.element('edit-camera-status').textContent, /retry/i);
  assert.equal(booth.element('download').disabled, true);
  await booth.element('download').onclick();
  assert.equal(booth.downloads.length, 0);
  delete booth.faults.image;
  await booth.context.applyFrame('purple');
  assert.notEqual(booth.read('session.output.canvas'), previousCanvas);
});

async function assertPublished(booth, frame) {
  const preview = booth.element('strip-preview').children[0];
  assert.equal(booth.read('session.output.canvas.width'), 700);
  assert.equal(booth.read('session.output.canvas.height'), 2090);
  assert.equal(preview.src, booth.read("session.output.canvas.toDataURL('image/png')"));
  assert.equal(booth.frames.find(radio => radio.checked)['data-frame'], frame);
  await booth.element('download').onclick();
  assert.deepEqual(booth.downloads.at(-1), { href: preview.src, download: 'snapicorn.png' });
}

async function advanceToImage(booth, predicate) {
  for (let step = 0; step < 20; step++) {
    const image = booth.loadedImages.at(-1);
    if (predicate(image)) return image;
    image.onload();
    await settleImages();
  }
  assert.fail('Expected image load stage was never reached');
}

test('capture mirrors each photo once; composition preserves capture order and orientation', async () => {
  const booth = createBooth();
  await captureFour(booth);
  assert.deepEqual(booth.transforms, Array.from({ length: 4 }, () => [
    ['save'], ['translate', 640, 0], ['scale', -1, 1], ['restore'],
  ]).flat());
  assert.deepEqual(booth.draws.slice(4, 8).map(draw => draw.source),
    [1, 2, 3, 4].map(id => `data:image/png;mock,${id}`));
  await assertPublished(booth, 'none');
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
  const purple = await advanceToImage(booth, image => image.src.includes('purple'));
  assert.match(purple.src, /purple/);
  purple.onload();
  await settleImages();
  assert.equal(booth.element('download').disabled, true);
  await booth.element('download').onclick();
  assert.equal(booth.downloads.length, 0);
  booth.loadedImages.at(-1).onload();
  await third;
  const latest = booth.read('session.output.canvas');
  await assertPublished(booth, 'purple');
  oldBase.onerror();
  middleBase.onload();
  await Promise.all([first, second]);
  assert.equal(booth.read('session.output.canvas'), latest);
  assert.match(booth.element('edit-camera-status').textContent, /download requested/);
  assert.equal(booth.element('download').disabled, false);
});

test('stale preview callback cannot publish after a newer None selection', async () => {
  const booth = createBooth();
  await captureFour(booth);
  const purple = booth.context.applyFrame('purple');
  await purple;
  await assertPublished(booth, 'purple');
  booth.faults.hangImages = true;
  const old = booth.context.applyFrame('purple');
  const oldPreview = await advanceToImage(booth, image => image.id === 'compiled-strip');
  const stalePreview = oldPreview.onload;
  booth.faults.hangImages = false;
  await booth.context.applyFrame('none');
  const latest = booth.read('session.output.canvas');
  stalePreview();
  await old;
  assert.equal(booth.read('session.output.canvas'), latest);
  await assertPublished(booth, 'none');
});

for (const failure of ['photo', 'frame', 'preview', 'context', 'draw', 'encode', 'timeout']) {
  test(`frame ${failure} failure preserves preview and requested edit, blocks export; retry works`, async () => {
    const booth = createBooth();
    await captureFour(booth);
    const previous = booth.read('session.output.canvas');
    const previousPreview = booth.element('strip-preview').children[0];
    booth.faults.image = source => failure === 'photo' ? source === booth.read('session.photos[0].source')
      : failure === 'frame' ? source.includes('purple')
      : failure === 'preview' && source !== previousPreview.src && source.startsWith('data:') &&
        !booth.read('session.photos.some(photo => photo.source === ' + JSON.stringify(source) + ')');
    if (['context', 'draw', 'encode'].includes(failure)) booth.faults[failure] = true;
    if (failure === 'timeout') booth.faults.hangImages = true;
    const pending = booth.context.applyFrame('purple');
    if (failure === 'timeout') [...booth.timeouts.values()].forEach(callback => callback());
    await pending;
    assert.equal(booth.read('session.output.canvas'), previous);
    assert.equal(booth.element('strip-preview').children[0], previousPreview);
    assert.match(booth.element('edit-camera-status').textContent, /retry/i);
    assert.equal(booth.frames[1].checked, true);
    assert.equal(booth.element('download').disabled, true);
    await booth.element('download').onclick();
    assert.equal(booth.downloads.length, 0);
    for (const key of Object.keys(booth.faults)) delete booth.faults[key];
    await booth.element('retry-composition').click();
    await assertPublished(booth, 'purple');
  });
}

test('download encoding failure is recoverable without mutating the composition', async () => {
  const booth = createBooth();
  await captureFour(booth);
  const previous = booth.read('session.output.canvas');
  booth.faults.encode = true;
  await booth.element('download').onclick();
  assert.equal(booth.downloads.length, 0);
  assert.match(booth.element('edit-camera-status').textContent, /retry/);
  assert.equal(booth.read('session.output.canvas'), previous);
  delete booth.faults.encode;
  await assertPublished(booth, 'none');
});

test('late Purple asset success or error cannot overwrite newer None output or feedback', async () => {
  for (const outcome of ['onload', 'onerror']) {
    const booth = createBooth();
    await captureFour(booth);
    booth.faults.hangImages = true;
    const stale = booth.context.applyFrame('purple');
    const frame = await advanceToImage(booth, image => image.src.includes('purple'));
    const staleFrame = frame[outcome];
    booth.faults.hangImages = false;
    await booth.context.applyFrame('none');
    const latest = booth.read('session.output.canvas');
    staleFrame();
    await stale;
    assert.equal(booth.read('session.output.canvas'), latest);
    assert.equal(booth.element('edit-camera-status').textContent, '');
    await assertPublished(booth, 'none');
  }
});


async function captureToReview(booth) {
  booth.element('startButton').click();
  await booth.element('enable-camera').click();
  booth.element('snap').click();
  for (let i = 0; i < 12; i++) booth.tick();
  await settleImages();
}

async function candidateFor(booth, slot = 1) {
  booth.context.openRetake(slot, booth.element('retake-invoker'));
  await booth.element('retake-enable').click();
  booth.element('take-replacement').click();
  for (let i = 0; i < 3; i++) booth.tick();
  await settleImages();
}

function dismissDialog(booth, id, route) {
  const dialog = booth.element(id);
  if (route === 'escape') dialog.handlers.cancel({ preventDefault() {} });
  if (route === 'backdrop') {
    const event = { target: dialog, clientX: 0, clientY: 0 };
    dialog.handlers.pointerdown(event);
    dialog.handlers.click(event);
  }
}

test('opening Photobooth and rapid starts stay camera-off; only Enable camera requests silent video', async () => {
  const booth = createBooth();
  booth.element('startButton').click();
  booth.element('startButton').click();
  assert.equal(booth.requests, 0);
  assert.equal(booth.read('ui.phase'), 'camera-off');
  assert.equal(booth.element('snap').disabled, true);
  let release;
  const realAcquire = booth.context.navigator.mediaDevices.getUserMedia;
  booth.context.navigator.mediaDevices.getUserMedia = () => new Promise(resolve => { release = resolve; });
  const opening = booth.element('enable-camera').click();
  booth.element('enable-camera').click();
  booth.element('startButton').click();
  assert.equal(booth.read('ui.phase'), 'opening');
  release(await realAcquire());
  await opening;
  assert.equal(booth.requests, 1);
  assert.equal(booth.read('ui.phase'), 'ready');
  booth.context.exitPhotobooth();
});

test('permission failure allows explicit retry without resetting the page', async () => {
  const booth = createBooth();
  const realAcquire = booth.context.navigator.mediaDevices.getUserMedia;
  booth.context.navigator.mediaDevices.getUserMedia = async () => { throw new Error('NotAllowedError'); };
  booth.element('startButton').click();
  await booth.element('enable-camera').click();
  assert.equal(booth.read('ui.phase'), 'camera-off');
  assert.match(booth.element('booth-camera-status').textContent, /retry/);
  booth.context.navigator.mediaDevices.getUserMedia = realAcquire;
  await booth.element('enable-camera').click();
  assert.equal(booth.read('ui.phase'), 'ready');
  booth.context.exitPhotobooth();
});

test('Review shows all four ordered originals and stops tracks before customization', async () => {
  const booth = createBooth();
  await captureToReview(booth);
  assert.equal(booth.read('ui.phase'), 'review');
  assert.equal(booth.element('review-screen').style.display, 'block');
  assert.equal(booth.read('session.output.canvas'), null);
  assert.equal(booth.element('download').disabled, true);
  assert.equal(booth.stopped, 1);
  assert.equal(booth.element('camera').srcObject, null);
  assert.deepEqual(booth.element('review-grid').children.map(card => card.children[0].src),
    Array.from(booth.read('session.photos'), photo => photo.source));
  assert.equal(booth.element('review-heading').focusCount, 1);
  await booth.element('customize').click();
  assert.equal(booth.read('ui.phase'), 'customize');
  await assertPublished(booth, 'none');
});

for (const route of ['cancel', 'close', 'escape', 'backdrop', 'navigation', 'failure']) {
  test(`retake ${route} keeps every original and releases candidate/camera resources`, async () => {
    const booth = createBooth();
    await captureToReview(booth);
    const originals = [...booth.read('session.photos')];
    if (route === 'failure') {
      booth.context.openRetake(2, booth.element('retake-invoker'));
      await booth.element('retake-enable').click();
      booth.faults.draw = true;
      booth.element('take-replacement').click();
      for (let i = 0; i < 3; i++) booth.tick();
    } else {
      await candidateFor(booth, 2);
      assert.equal(booth.read('ui.retake.phase'), 'candidate');
      assert.equal(booth.element('camera').srcObject, null);
      if (route === 'cancel') booth.element('retake-cancel').click();
      if (route === 'close') booth.element('retake-close').click();
      if (['escape', 'backdrop'].includes(route)) dismissDialog(booth, 'retake-dialog', route);
      if (route === 'navigation') booth.context.navigateTo('about');
    }
    await settleImages();
    assert.equal(booth.read('ui.retake'), null);
    assert.deepEqual([...booth.read('session.photos')], originals);
    assert.equal(booth.element('camera').srcObject, null);
    assert.equal(booth.element('retake-candidate').getAttribute('src'), undefined);
    assert.equal(booth.read('operations.pendingImageLoads.size'), 0);
    assert.equal(booth.intervals.size, 0);
    assert.equal(booth.stopped, 2);
    if (route !== 'navigation') assert.equal(booth.element('retake-invoker').focusCount, 1);
  });
}

for (const [originalWidth, originalHeight, replacementWidth, replacementHeight, stripHeight] of [
  [640, 480, 1280, 720, 2090],
  [1280, 720, 480, 640, 1642],
  [480, 640, 640, 480, 3490],
]) {
  test(`confirmed mixed-aspect retake ${originalWidth}x${originalHeight} → ${replacementWidth}x${replacementHeight} replaces one slot and preserves output geometry`, async () => {
    const booth = createBooth();
    Object.assign(booth.element('camera'), { videoWidth: originalWidth, videoHeight: originalHeight });
    await captureToReview(booth);
    const originals = [...booth.read('session.photos')];
    Object.assign(booth.element('camera'), { videoWidth: replacementWidth, videoHeight: replacementHeight });
    await candidateFor(booth, 1);
    const replacement = booth.read('ui.retake.candidate');
    assert.deepEqual([...booth.read('session.photos')], originals);
    assert.equal(replacement.width, replacementWidth);
    booth.element('accept-replacement').click();
    booth.context.acceptRetake();
    const photos = [...booth.read('session.photos')];
    assert.equal(photos[1], replacement);
    for (const slot of [0, 2, 3]) assert.equal(photos[slot], originals[slot]);
    assert.equal(booth.element('capture-progress').textContent, '4 captured');
    await booth.element('customize').click();
    assert.equal(booth.read('session.output.canvas.width'), 700);
    assert.equal(booth.read('session.output.canvas.height'), stripHeight);
    const rendered = booth.draws.slice(-5, -1);
    assert.deepEqual(rendered.map(draw => draw.source), photos.map(photo => photo.source));
    for (const draw of rendered) assert.equal(draw.coordinates[3], Math.round(600 * originalHeight / originalWidth));
    assert.equal(booth.element('camera').srcObject, null);
  });
}

for (const route of ['keep', 'escape', 'backdrop']) {
  test(`restart ${route} retains completed work and confirmed restart alone resets camera-off`, async () => {
    const booth = createBooth();
    await captureFour(booth);
    await booth.context.applyFrame('purple');
    const canvas = booth.read('session.output.canvas');
    const originals = [...booth.read('session.photos')];
    const id = booth.read('session.id');
    booth.element('more').click();
    booth.element('more').click();
    assert.equal(booth.read('session.output.canvas'), canvas);
    if (route === 'keep') booth.element('keep-strip').click();
    else dismissDialog(booth, 'restart-dialog', route);
    assert.equal(booth.read('session.id'), id);
    assert.deepEqual([...booth.read('session.photos')], originals);
    assert.equal(booth.read('session.output.canvas'), canvas);
    assert.equal(booth.read('session.frame'), 'purple');
    await assertPublished(booth, 'purple');
    booth.element('more').click();
    booth.element('new-strip').click();
    assert.equal(booth.read('session.photos.length'), 0);
    assert.equal(booth.read('session.geometry'), null);
    assert.equal(booth.read('session.output.canvas'), null);
    assert.equal(booth.read('ui.phase'), 'camera-off');
    assert.equal(booth.requests, 1);
    assert.equal(booth.read('session.id'), id + 1);
  });
}

test('navigation preserves requested edits and retries canceled composition on return, without stale publication', async () => {
  const booth = createBooth();
  await captureFour(booth);
  await booth.context.applyFrame('purple');
  const canvas = booth.read('session.output.canvas');
  const id = booth.read('session.id');
  booth.faults.hangImages = true;
  const pending = booth.context.applyFrame('none');
  const late = booth.loadedImages.at(-1).onload;
  booth.context.navigateTo('about');
  late();
  await pending;
  assert.equal(booth.element('about-screen').style.display, 'block');
  assert.equal(booth.element('edit-screen').style.display, 'none');
  booth.context.navigateTo('home');
  booth.context.navigateTo('booth');
  assert.equal(booth.read('session.id'), id);
  assert.equal(booth.read('session.output.canvas'), canvas);
  assert.equal(booth.read('session.frame'), 'none');
  assert.equal(booth.read('ui.phase'), 'customize');
  assert.equal(booth.requests, 1);
  assert.equal(booth.element('download').disabled, true);
  booth.faults.hangImages = false;
  booth.loadedImages.at(-1).onload();
  await settleImages();
  await assertPublished(booth, 'none');
});

for (const retake of [false, true]) {
  test(`navigation during ${retake ? 'retake' : 'initial'} camera acquisition rejects late success and error/finally`, async () => {
    for (const rejectOld of [false, true]) {
      const booth = createBooth();
      if (retake) await captureToReview(booth);
      else booth.element('startButton').click();
      const originals = [...booth.read('session.photos')];
      if (retake) booth.context.openRetake(0);
      const realAcquire = booth.context.navigator.mediaDevices.getUserMedia;
      let resolveOld, reject;
      booth.context.navigator.mediaDevices.getUserMedia = () => new Promise((resolve, fail) => { resolveOld = resolve; reject = fail; });
      const old = booth.element(retake ? 'retake-enable' : 'enable-camera').click();
      booth.context.navigateTo('about');
      booth.context.navigateTo('booth');
      if (retake) booth.context.openRetake(3);
      booth.context.navigator.mediaDevices.getUserMedia = realAcquire;
      await booth.element(retake ? 'retake-enable' : 'enable-camera').click();
      const current = booth.element('camera').srcObject;
      let abandonedStops = 0;
      if (rejectOld) reject(new Error('NotAllowedError'));
      else resolveOld({ getTracks: () => [{ stop: () => abandonedStops++ }] });
      await old;
      assert.equal(abandonedStops, rejectOld ? 0 : 1);
      assert.equal(booth.element('camera').srcObject, current);
      assert.equal(booth.read(retake ? 'ui.retake.phase' : 'ui.phase'), 'ready');
      assert.deepEqual([...booth.read('session.photos')], originals);
      assert.equal(booth.element(retake ? 'retake-status' : 'booth-camera-status').textContent, '');
      booth.context.exitPhotobooth();
    }
  });
}

test('navigation during initial and retake countdown rejects stale ticks and stops tracks', async () => {
  for (const retake of [false, true]) {
    const booth = createBooth();
    if (retake) { await captureToReview(booth); await candidateFor(booth); booth.element('retake-cancel').click(); booth.context.openRetake(0); }
    else booth.element('startButton').click();
    await booth.element(retake ? 'retake-enable' : 'enable-camera').click();
    booth.element(retake ? 'take-replacement' : 'snap').click();
    const lateTick = [...booth.intervals.values()][0];
    const originals = [...booth.read('session.photos')];
    booth.context.navigateTo('about');
    for (let i = 0; i < 3; i++) lateTick();
    assert.equal(booth.intervals.size, 0);
    assert.equal(booth.element('camera').srcObject, null);
    assert.deepEqual([...booth.read('session.photos')], originals);
    assert.equal(booth.read('ui.retake'), null);
  }
});

test('canceling a pending candidate decode rejects late callbacks without affecting another retake', async () => {
  for (const outcome of ['onload', 'onerror']) {
    const booth = createBooth();
    await captureToReview(booth);
    const originals = [...booth.read('session.photos')];
    booth.context.openRetake(0);
    await booth.element('retake-enable').click();
    booth.faults.hangImages = true;
    booth.element('take-replacement').click();
    for (let i = 0; i < 3; i++) booth.tick();
    const late = booth.loadedImages.at(-1)[outcome];
    booth.element('retake-cancel').click();
    booth.faults.hangImages = false;
    await candidateFor(booth, 3);
    const current = booth.read('ui.retake.candidate');
    late();
    await settleImages();
    assert.equal(booth.read('ui.retake.candidate'), current);
    assert.equal(booth.read('ui.retake.slot'), 3);
    assert.deepEqual([...booth.read('session.photos')], originals);
    booth.element('retake-cancel').click();
  }
});

test('candidate decode failure and timeout discard the candidate while preserving originals', async () => {
  for (const timeout of [false, true]) {
    const booth = createBooth();
    await captureToReview(booth);
    const originals = [...booth.read('session.photos')];
    booth.context.openRetake(0);
    await booth.element('retake-enable').click();
    if (timeout) booth.faults.hangImages = true;
    else booth.faults.image = () => true;
    booth.element('take-replacement').click();
    for (let i = 0; i < 3; i++) booth.tick();
    if (timeout) [...booth.timeouts.values()].forEach(callback => callback());
    await settleImages();
    assert.equal(booth.read('ui.retake'), null);
    assert.deepEqual([...booth.read('session.photos')], originals);
    assert.match(booth.element('review-status').textContent, /originals are safe/);
    assert.equal(booth.element('camera').srcObject, null);
    assert.equal(booth.timeouts.size, 0);
  }
});

test('pagehide releases active retake and completed session references', async () => {
  const booth = createBooth();
  await captureToReview(booth);
  booth.context.openRetake(0);
  await booth.element('retake-enable').click();
  booth.windowHandlers.pagehide();
  assertCleanHome(booth);
  assert.equal(booth.read('ui.retake'), null);
  assert.equal(booth.read('session.geometry'), null);
  assert.equal(booth.stopped, 2);
});


test('mobile navigation disclosure closes on Escape from toggle or navigation', () => {
  const booth = createBooth();
  for (const id of ['menu-toggle', 'site-nav']) {
    booth.element('menu-toggle').click();
    assert.equal(booth.element('menu-toggle')['aria-expanded'], 'true');
    booth.element(id).handlers.keydown({ key: 'Escape' });
    assert.equal(booth.element('menu-toggle')['aria-expanded'], 'false');
    assert.equal(booth.read('ui.menuOpen'), false);
  }
});

test('dialogs wrap Tab and Shift+Tab at visible enabled button boundaries', () => {
  const booth = createBooth();
  for (const id of ['retake-dialog', 'restart-dialog']) {
    const first = booth.element('first');
    const last = booth.element('last');
    booth.element(id).querySelectorAll = () => [first, last];
    let prevented = 0;
    booth.context.document.activeElement = last;
    booth.element(id).handlers.keydown({ key: 'Tab', shiftKey: false, preventDefault: () => prevented++ });
    assert.ok(first.focusCount > 0);
    booth.context.document.activeElement = first;
    booth.element(id).handlers.keydown({ key: 'Tab', shiftKey: true, preventDefault: () => prevented++ });
    assert.ok(last.focusCount > 0);
    assert.equal(prevented, 2);
  }
});

test('a delayed close event from an older retake cannot dismiss a newly opened retake', async () => {
  const booth = createBooth();
  await captureToReview(booth);
  booth.context.openRetake(0);
  booth.element('retake-cancel').click();
  booth.context.openRetake(2);
  booth.element('retake-dialog').handlers.close();
  assert.equal(booth.read('ui.retake.slot'), 2);
  assert.equal(booth.element('retake-dialog').open, true);
  booth.element('retake-cancel').click();
});


test('accepting a retake invalidates pixels, preserves frame and recomposes from ordered originals', async () => {
  const booth = createBooth();
  await captureFour(booth);
  await booth.context.applyFrame('purple');
  booth.element('back-to-review').click();
  const previous = booth.read('session.output.canvas');
  await candidateFor(booth, 0);
  assert.equal(booth.read('session.output.canvas'), previous);
  booth.element('accept-replacement').click();
  assert.equal(booth.read('session.output.canvas'), null);
  assert.equal(booth.element('download').disabled, true);
  assert.equal(booth.read('session.frame'), 'purple');
  await booth.element('customize').click();
  assert.notEqual(booth.read('session.output.canvas'), previous);
  await assertPublished(booth, 'purple');
});


test('Home Start protects an existing strip while Photobooth navigation resumes it', async () => {
  const booth = createBooth();
  await captureFour(booth);
  const canvas = booth.read('session.output.canvas');
  const id = booth.read('session.id');
  booth.context.navigateTo('home');
  booth.element('startButton').click();
  assert.equal(booth.element('restart-dialog').open, true);
  assert.equal(booth.read('session.output.canvas'), canvas);
  booth.element('keep-strip').click();
  assert.equal(booth.read('ui.destination'), 'home');
  booth.context.navigateTo('booth');
  assert.equal(booth.read('ui.phase'), 'customize');
  assert.equal(booth.read('session.id'), id);
  assert.equal(booth.read('session.output.canvas'), canvas);
  assert.equal(booth.requests, 1);
});

function stickerState(booth) {
  return JSON.parse(booth.read('JSON.stringify(StickerHistory.current(session.stickerHistory))'));
}

function pointerEvent(type, x, y, pointerId = 1, timeStamp = 100) {
  return { type, button: 0, pointerId, timeStamp, clientX: x, clientY: y,
    preventDefault() {}, stopPropagation() {} };
}

async function addStar(booth) {
  await captureFour(booth);
  booth.element('add-star').click();
  await settleImages();
  return booth.element('sticker-layer').children[0];
}

test('four assets, sliders, keyboard positioning, remove and sticker-only undo/redo share one owner', async () => {
  const booth = createBooth();
  await captureFour(booth);
  const photos = [...booth.read('session.photos')];
  for (const key of ['star', 'rainbow', 'unicorn', 'heart']) booth.element(`add-${key}`).click();
  await settleImages();
  assert.equal(stickerState(booth).length, 4);
  const nodes = booth.element('sticker-layer').children;
  const historyIndex = booth.read('session.stickerHistory.index');
  nodes[0].handlers.click();
  nodes[0].handlers.focus();
  assert.equal(booth.read('session.stickerHistory.index'), historyIndex);
  const start = stickerState(booth);
  nodes[0].handlers.keydown({ key: 'ArrowRight', preventDefault() {} });
  const size = booth.element('sticker-size');
  size.handlers.input({ target: { value: '45' } });
  booth.element('sticker-rotation').handlers.input({ target: { value: '-180' } });
  await settleImages();
  assert.equal(stickerState(booth)[0].size, 0.45);
  assert.equal(stickerState(booth)[0].rotation, -180);
  await booth.context.applyFrame('purple');
  for (let count = 0; count < 3; count++) booth.element('undo-sticker').click();
  await settleImages();
  assert.deepEqual(stickerState(booth), start);
  assert.equal(booth.read('session.frame'), 'purple');
  assert.deepEqual([...booth.read('session.photos')], photos);
  for (let count = 0; count < 3; count++) booth.element('redo-sticker').click();
  booth.element('remove-sticker').click();
  assert.equal(stickerState(booth).length, 3);
  booth.element('undo-sticker').click();
  assert.equal(stickerState(booth).length, 4);
  booth.element('sticker-layer').children[0].handlers.click();
  booth.element('sticker-size').handlers.input({ target: { value: '8' } });
  assert.equal(booth.element('redo-sticker').disabled, true);
  await settleImages();
  await assertPublished(booth, 'purple');
});

for (const kind of ['drag', 'resize']) {
  test(`pointer ${kind} commits once on release; late moves cannot alter a new gesture`, async () => {
    const booth = createBooth();
    const node = await addStar(booth);
    const initial = stickerState(booth);
    const index = booth.read('session.stickerHistory.index');
    const target = kind === 'drag' ? node : node.children[3];
    target.handlers.pointerdown(pointerEvent('pointerdown', 150, 450));
    const oldMove = node.handlers.pointermove;
    const oldEnd = node.handlers.pointerup;
    for (let i = 1; i <= 5; i++) oldMove(pointerEvent('pointermove', 150 + i * 10, 450 - i * 10, 1, 100 + i));
    assert.deepEqual(stickerState(booth), initial);
    assert.equal(booth.read('session.stickerHistory.index'), index);
    assert.equal(booth.element('download').disabled, true);
    node.handlers.pointerup(pointerEvent('pointerup', 200, 400, 1, 110));
    await settleImages();
    assert.equal(booth.read('session.stickerHistory.index'), index + 1);
    const committed = stickerState(booth);
    assert.notDeepEqual(committed, initial);
    target.handlers.pointerdown(pointerEvent('pointerdown', 200, 400, 1, 200));
    oldMove(pointerEvent('pointermove', 400, 100, 1, 120));
    oldEnd(pointerEvent('pointerup', 400, 100, 1, 210));
    assert.notEqual(booth.read('session.stickerHistory.gesture'), null);
    assert.deepEqual(stickerState(booth), committed);
    node.handlers.pointercancel(pointerEvent('pointercancel', 200, 400, 1, 201));
    booth.element('undo-sticker').click();
    await settleImages();
    assert.deepEqual(stickerState(booth), initial);
    await assertPublished(booth, 'none');
  });
}

for (const route of ['pointercancel', 'lostpointercapture', 'navigation', 'Escape']) {
  test(`${route} drops an already-rendered draft without publishing it as committed output`, async () => {
    const booth = createBooth();
    const node = await addStar(booth);
    const initial = stickerState(booth);
    const index = booth.read('session.stickerHistory.index');
    node.handlers.pointerdown(pointerEvent('pointerdown', 150, 450));
    const stale = node.handlers.pointermove;
    stale(pointerEvent('pointermove', 210, 330, 1, 101));
    await settleImages();
    assert.equal(booth.read('operations.compositionStatus'), 'ready');
    assert.equal(booth.element('download').disabled, true);
    if (route === 'navigation') booth.context.navigateTo('about');
    else if (route === 'Escape') node.handlers.keydown({ key: 'Escape', preventDefault() {} });
    else node.handlers[route](pointerEvent(route, 210, 330, 1, 102));
    stale(pointerEvent('pointermove', 300, 100, 1, 103));
    assert.equal(booth.read('session.stickerHistory.gesture'), null);
    assert.equal(booth.read('session.stickerHistory.index'), index);
    assert.deepEqual(stickerState(booth), initial);
    if (route === 'navigation') {
      assert.equal(booth.read('isCompositionCurrent()'), false);
      booth.context.navigateTo('booth');
    }
    await settleImages();
    await assertPublished(booth, 'none');
  });
}

test('selection, unchanged pointer gesture, foreign pointer and zoom do not add history', async () => {
  const booth = createBooth();
  const node = await addStar(booth);
  const index = booth.read('session.stickerHistory.index');
  const revision = booth.read('session.revision');
  node.handlers.click();
  booth.element('preview-zoom').handlers.input({ target: { value: '140' } });
  assert.equal(booth.read('session.revision'), revision);
  node.handlers.pointerdown(pointerEvent('pointerdown', 150, 450));
  node.handlers.pointermove(pointerEvent('pointermove', 350, 100, 2, 101));
  node.handlers.pointerup(pointerEvent('pointerup', 150, 450, 1, 102));
  await settleImages();
  assert.equal(booth.read('session.stickerHistory.index'), index);
  assert.equal(booth.read('session.revision'), revision);
  await assertPublished(booth, 'none');
});

for (const failure of ['sticker', 'draw', 'encode', 'preview']) {
  test(`sticker ${failure} failure retains requested history and blocks stale export; retry recovers`, async () => {
    const booth = createBooth();
    await addStar(booth);
    const canvas = booth.read('session.output.canvas');
    const preview = booth.element('strip-preview').children[0];
    const sources = [...booth.read('session.photos.map(photo => photo.source)')];
    booth.faults.image = source => failure === 'sticker' ? source.includes('sticker-pixel')
      : failure === 'preview' && source.startsWith('data:') && !sources.includes(source);
    if (['draw', 'encode'].includes(failure)) booth.faults[failure] = true;
    booth.element('sticker-rotation').handlers.input({ target: { value: '90' } });
    await settleImages();
    assert.equal(stickerState(booth)[0].rotation, 90);
    assert.equal(booth.read('session.output.canvas'), canvas);
    assert.equal(booth.element('strip-preview').children[0], preview);
    assert.equal(booth.element('download').disabled, true);
    assert.equal(booth.element('share').disabled, true);
    await booth.element('download').onclick();
    assert.equal(booth.downloads.length, 0);
    assert.equal(booth.element('retry-composition').hidden, false);
    for (const key of Object.keys(booth.faults)) delete booth.faults[key];
    await booth.element('retry-composition').click();
    await assertPublished(booth, 'none');
  });
}

test('newer sticker render rejects older success/error/finally and exports never redraw', async () => {
  const booth = createBooth();
  await addStar(booth);
  booth.faults.hangImages = true;
  booth.element('sticker-size').handlers.input({ target: { value: '40' } });
  const old = await advanceToImage(booth, image => image.id === 'compiled-strip');
  const lateSuccess = old.onload;
  booth.element('sticker-rotation').handlers.input({ target: { value: '90' } });
  const failed = booth.loadedImages.at(-1);
  const lateError = failed.onerror;
  booth.faults.hangImages = false;
  booth.element('sticker-size').handlers.input({ target: { value: '30' } });
  await settleImages();
  const current = booth.read('session.output.canvas');
  const preview = booth.element('strip-preview').children[0];
  lateSuccess(); lateError();
  await settleImages();
  assert.equal(booth.read('session.output.canvas'), current);
  assert.equal(booth.element('strip-preview').children[0], preview);
  assert.equal(booth.element('edit-camera-status').textContent, '');
  const draws = booth.draws.length;
  assert.equal(booth.element('strip-stage').style.aspectRatio, '700 / 2090');
  assert.equal(booth.element('strip-stage').style['--strip-ratio'], 700 / 2090);
  await assertPublished(booth, 'none');
  await assertPublished(booth, 'none');
  assert.deepEqual(booth.downloads.at(-1), booth.downloads.at(-2));
  assert.equal(booth.draws.length, draws);
});

test('share encoding started on an old revision cannot share after a sticker edit', async () => {
  const booth = createBooth();
  await addStar(booth);
  let complete;
  const canvas = booth.read('session.output.canvas');
  canvas.toBlob = callback => { complete = callback; };
  booth.context.navigator.canShare = () => true;
  let shares = 0;
  booth.context.navigator.share = async () => { shares++; };
  const sharing = booth.element('share').onclick();
  booth.element('sticker-size').handlers.input({ target: { value: '40' } });
  assert.doesNotThrow(() => complete({}));
  await sharing;
  assert.equal(shares, 0);
  assert.equal(booth.read('session.output.pngBlob'), undefined);
  await settleImages();
  await assertPublished(booth, 'none');
});

test('retake and navigation preserve sticker history; undo never changes photos or frame', async () => {
  const booth = createBooth();
  await addStar(booth);
  await booth.context.applyFrame('purple');
  const history = booth.read('session.stickerHistory');
  booth.context.enterReview();
  await candidateFor(booth, 2);
  booth.context.acceptRetake();
  assert.equal(booth.read('session.stickerHistory'), history);
  const photos = [...booth.read('session.photos')];
  await booth.element('customize').click();
  await settleImages();
  booth.element('undo-sticker').click();
  await settleImages();
  assert.equal(stickerState(booth).length, 0);
  assert.deepEqual([...booth.read('session.photos')], photos);
  assert.equal(booth.read('session.frame'), 'purple');
  await assertPublished(booth, 'purple');
});

test('preview uses intrinsic output dimensions even when CSS rounds the displayed image size', async () => {
  const booth = createBooth();
  await captureFour(booth);
  booth.faults.cssImageDimensions = { width: 180, height: 537 };
  booth.element('add-star').click();
  await settleImages();
  for (const value of ['10', '22', '45', '8']) {
    booth.element('sticker-size').handlers.input({ target: { value } });
    await settleImages();
    assert.equal(booth.element('strip-preview').children[0].width, 180);
    assert.equal(booth.element('strip-stage').style.aspectRatio, '700 / 2090');
    assert.equal(booth.element('strip-stage').style['--strip-ratio'], 700 / 2090);
  }
});

async function shareFixture() {
  const booth = createBooth();
  await captureFour(booth);
  const output = booth.read('session.output');
  const calls = [];
  let encodings = 0;
  const blob = new Blob(['controlled PNG'], { type: 'image/png' });
  blob.source = output.dataURL;
  output.canvas.toBlob = (callback, type) => {
    assert.equal(type, 'image/png');
    encodings++;
    queueMicrotask(() => callback(blob));
  };
  booth.context.navigator.canShare = payload => payload.files[0].type === 'image/png';
  booth.context.navigator.share = async payload => { calls.push(payload); };
  return { booth, output, blob, calls, get encodings() { return encodings; } };
}

async function assertShareFallback(booth, output) {
  assert.equal(booth.read('session.output'), output);
  assert.equal(booth.read('session.photos.length'), 4);
  assert.equal(booth.element('download').disabled, false);
  assert.equal(booth.element('share').disabled, false);
  await booth.element('download').onclick();
  assert.deepEqual(booth.downloads.at(-1), { href: output.dataURL, download: 'snapicorn.png' });
}

test('native share uses current PNG, preserves metadata and caches one Blob per published revision', async () => {
  const fixture = await shareFixture();
  const { booth, output, blob, calls } = fixture;
  const draws = booth.draws.length;
  await booth.element('share').onclick();
  await booth.element('share').onclick();
  assert.equal(fixture.encodings, 1);
  assert.equal(output.pngBlob, blob);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].files[0].name, 'snapicorn.png');
  assert.equal(calls[0].files[0].type, 'image/png');
  assert.equal(await calls[0].files[0].text(), 'controlled PNG');
  assert.equal(calls[0].title, 'Snapicorn');
  assert.equal(calls[0].text, 'Check out my sparkly pic!');
  assert.match(booth.element('edit-camera-status').textContent, /Check the chosen app/);
  assert.equal(booth.draws.length, draws);
  await assertShareFallback(booth, output);
  await booth.context.applyFrame('purple');
  const newerOutput = booth.read('session.output');
  assert.notEqual(newerOutput, output);
  assert.equal(newerOutput.pngBlob, undefined);
});

for (const unsupported of ['share missing', 'canShare missing', 'files unsupported', 'File missing']) {
  test(`native sharing fallback: ${unsupported}`, async () => {
    const { booth, output, calls } = await shareFixture();
    if (unsupported === 'share missing') delete booth.context.navigator.share;
    if (unsupported === 'canShare missing') delete booth.context.navigator.canShare;
    if (unsupported === 'files unsupported') booth.context.navigator.canShare = () => false;
    if (unsupported === 'File missing') booth.context.File = undefined;
    await booth.element('share').onclick();
    assert.equal(calls.length, 0);
    assert.match(booth.element('edit-camera-status').textContent, /unavailable.*Download PNG/);
    await assertShareFallback(booth, output);
  });
}

for (const failure of ['null Blob', 'encoding exception', 'canShare exception', 'File exception', 'share rejection', 'share exception', 'cancel']) {
  test(`native sharing handles ${failure}, preserves PNG download and permits retry`, async () => {
    const { booth, output } = await shareFixture();
    const error = Object.assign(new Error('controlled failure'), { name: failure === 'cancel' ? 'AbortError' : 'Error' });
    if (failure === 'null Blob') output.canvas.toBlob = callback => queueMicrotask(() => callback(null));
    if (failure === 'encoding exception') output.canvas.toBlob = () => { throw error; };
    if (failure === 'canShare exception') booth.context.navigator.canShare = () => { throw error; };
    if (failure === 'File exception') booth.context.File = class { constructor() { throw error; } };
    if (failure === 'share rejection' || failure === 'cancel') booth.context.navigator.share = () => Promise.reject(error);
    if (failure === 'share exception') booth.context.navigator.share = () => { throw error; };
    await assert.doesNotReject(booth.element('share').onclick());
    assert.match(booth.element('edit-camera-status').textContent,
      failure === 'cancel' ? /^Sharing canceled/ : /Could not.*(Download PNG|Share again)/);
    output.canvas.toBlob = callback => { const blob = new Blob(['retry']); blob.source = output.dataURL; callback(blob); };
    await assertShareFallback(booth, output);
    output.canvas.toBlob = callback => callback(new Blob(['retry'], { type: 'image/png' }));
    booth.context.File = File;
    booth.context.navigator.canShare = () => true;
    let retried = false;
    booth.context.navigator.share = async () => { retried = true; };
    await booth.element('share').onclick();
    assert.equal(retried, true);
  });
}

test('duplicate attempts are suppressed during encoding and native sharing, Download stays available', async () => {
  const { booth, output, blob } = await shareFixture();
  let encode;
  let finish;
  let shares = 0;
  let encodings = 0;
  output.canvas.toBlob = callback => { encodings++; encode = callback; };
  booth.context.navigator.share = () => { shares++; return new Promise(resolve => { finish = resolve; }); };
  const pending = booth.element('share').onclick();
  assert.equal(booth.element('share').disabled, true);
  await booth.element('share').onclick();
  encode(blob);
  await settleImages();
  booth.context.renderSession();
  assert.equal(booth.element('share').disabled, true);
  await booth.element('share').onclick();
  assert.equal(encodings, 1);
  assert.equal(shares, 1);
  await booth.element('download').onclick();
  assert.equal(booth.downloads.length, 1);
  const status = booth.element('edit-camera-status').textContent;
  finish();
  await pending;
  assert.equal(booth.element('edit-camera-status').textContent, status);
  assert.equal(booth.element('share').disabled, false);
});

for (const transition of ['frame', 'photo', 'session', 'navigation']) {
  test(`late share encoding cannot publish/share after ${transition} changes`, async () => {
    const { booth, output, blob, calls } = await shareFixture();
    let encode;
    output.canvas.toBlob = callback => { encode = callback; };
    const pending = booth.element('share').onclick();
    if (transition === 'frame') await booth.context.applyFrame('purple');
    if (transition === 'photo') {
      booth.context.enterReview();
      await candidateFor(booth, 0);
      booth.context.acceptRetake();
    }
    if (transition === 'session') booth.context.resetPhotoboothState();
    if (transition === 'navigation') booth.context.navigateTo('home');
    const status = booth.element('edit-camera-status').textContent;
    encode(blob);
    await pending;
    assert.equal(calls.length, 0);
    assert.equal(output.pngBlob, undefined);
    assert.equal(booth.element('edit-camera-status').textContent, status);
    assert.equal(booth.element('share').disabled, !booth.read('!operations.busy && isCompositionCurrent()'));
    if (transition === 'session') assert.equal(booth.read('session.output.canvas'), null);
  });
}

for (const result of ['success', 'rejection', 'cancel']) {
  test(`stale native share ${result} cannot overwrite newer feedback or unlock pending composition`, async () => {
    const { booth } = await shareFixture();
    let complete;
    booth.context.navigator.share = () => new Promise((resolve, reject) => {
      complete = () => result === 'success' ? resolve() : reject({ name: result === 'cancel' ? 'AbortError' : 'Error' });
    });
    const pending = booth.element('share').onclick();
    await settleImages();
    booth.faults.hangImages = true;
    booth.context.applyFrame('purple');
    const status = booth.element('edit-camera-status').textContent;
    complete();
    await pending;
    assert.equal(booth.element('edit-camera-status').textContent, status);
    assert.equal(booth.element('share').disabled, true);
    assert.equal(booth.element('download').disabled, true);
  });
}

test('ignored DOM handler promises have no unhandled rejection on asynchronous Blob/share failures', async () => {
  const unhandled = [];
  const listener = error => unhandled.push(error);
  process.on('unhandledRejection', listener);
  try {
    const { booth, output } = await shareFixture();
    output.canvas.toBlob = callback => queueMicrotask(() => callback(null));
    booth.element('share').onclick();
    await new Promise(resolve => setImmediate(resolve));
    output.canvas.toBlob = callback => queueMicrotask(() => callback(Object.assign(new Blob(['png']), { source: output.dataURL })));
    booth.context.navigator.share = () => Promise.reject(new Error('native rejection'));
    booth.element('share').onclick();
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(unhandled, []);
    await assertShareFallback(booth, output);
  } finally {
    process.off('unhandledRejection', listener);
  }
});

async function exportFixture() {
  const booth = createBooth();
  await captureFour(booth);
  await booth.context.finishStrip();
  return booth;
}

test('Finish and Back preserve exact published output, frame, sticker history and redo', async () => {
  const booth = createBooth();
  await captureFour(booth);
  await booth.context.applyFrame('purple');
  booth.read("StickerEditor.add('star'); StickerEditor.add('heart'); StickerEditor.history('undo')");
  await settleImages();
  const output = booth.read('session.output');
  const history = booth.read('session.stickerHistory');
  const photos = booth.read('session.photos');
  await booth.context.finishStrip();
  assert.equal(booth.read('ui.phase'), 'export');
  assert.equal(booth.element('edit-screen').style.display, 'none');
  assert.equal(booth.element('export-screen').style.display, 'block');
  assert.equal(booth.element('export-heading').focusCount, 1);
  assert.equal(booth.element('export-preview').children[0].src, output.dataURL);
  assert.equal(booth.element('export-dimensions').textContent, '700 × 2090 pixels · PNG');
  assert.equal(booth.read('ui.selectedSticker'), null);
  assert.equal(booth.downloads.length, 0);
  const blob = output.pngBlob;
  booth.context.backToCustomizing();
  assert.equal(booth.read('session.stickerHistory'), history);
  assert.equal(booth.read('session.photos'), photos);
  assert.equal(booth.read('session.frame'), 'purple');
  assert.equal(booth.element('edit-heading').focusCount, 2);
  assert.equal(booth.read('session.output'), output);
  await booth.context.finishStrip();
  assert.equal(output.pngBlob, blob);
  booth.context.backToCustomizing();
  booth.read("StickerEditor.history('redo')");
  await settleImages();
  assert.notEqual(booth.read('session.output'), output);
  assert.equal(booth.read('session.output.pngBlob'), undefined);
  assert.equal(booth.read('StickerHistory.current(session.stickerHistory).length'), 2);
});

for (const state of ['pending', 'failed', 'gesture']) {
  test(`Finish rejects ${state} composition and cannot export old pixels`, async () => {
    const booth = createBooth();
    await captureFour(booth);
    if (state === 'pending') { booth.faults.hangImages = true; booth.context.applyFrame('purple'); }
    if (state === 'failed') { booth.faults.image = () => true; await booth.context.applyFrame('purple'); }
    if (state === 'gesture') booth.read("session.stickerHistory = {...session.stickerHistory, gesture: {token: {}}}; renderSession()");
    assert.equal(booth.element('finish-strip').disabled, true);
    await booth.context.finishStrip();
    await booth.element('download').onclick();
    assert.equal(booth.read('ui.phase'), 'customize');
    assert.equal(booth.downloads.length, 0);
  });
}

test('repeated downloads reuse one prepared Blob and URL, never redraw; expiry permits another request', async () => {
  const booth = await exportFixture();
  const output = booth.read('session.output');
  const blob = output.pngBlob;
  output.canvas.toBlob = () => { throw new Error('must reuse prepared Blob'); };
  const draws = booth.draws.length;
  await booth.element('download').onclick();
  const url = [...booth.objectURLs.keys()][0];
  await booth.element('download').onclick();
  assert.equal(booth.objectURLs.size, 1);
  assert.equal(booth.objectURLs.get(url), blob);
  assert.deepEqual(booth.downloads[0], booth.downloads[1]);
  assert.equal(booth.downloads[0].download, 'snapicorn.png');
  assert.equal(booth.draws.length, draws);
  assert.match(booth.element('export-status').textContent, /^PNG download requested/);
  [...booth.timeouts.values()].forEach(callback => callback());
  assert.deepEqual(booth.revokedURLs, [url]);
  assert.equal(booth.objectURLs.size, 0);
  await booth.element('download').onclick();
  assert.equal(booth.objectURLs.size, 1);
  assert.equal(output.pngBlob, blob);
});

for (const exit of ['back', 'navigation', 'edit', 'restart', 'pagehide']) {
  test(`download URL is released on ${exit}, canceled restart retains it`, async () => {
    const booth = await exportFixture();
    const output = booth.read('session.output');
    await booth.element('download').onclick();
    const url = [...booth.objectURLs.keys()][0];
    booth.context.restartPhotobooth();
    booth.context.closeRestart();
    assert.equal(booth.read('session.output'), output);
    assert.equal(booth.objectURLs.has(url), true);
    if (exit === 'back') booth.context.backToCustomizing();
    if (exit === 'navigation') booth.context.navigateTo('home');
    if (exit === 'edit') { booth.context.backToCustomizing(); await booth.context.applyFrame('purple'); }
    if (exit === 'restart') { booth.context.restartPhotobooth(); booth.context.confirmRestart(); }
    if (exit === 'pagehide') booth.windowHandlers.pagehide();
    assert.deepEqual(booth.revokedURLs, [url]);
    assert.equal(booth.objectURLs.size, 0);
    if (['restart', 'pagehide'].includes(exit)) {
      assert.equal(booth.read('session.output.canvas'), null);
      assert.equal(booth.read('ui.phase'), 'camera-off');
      assert.equal(booth.element('export-preview').children.length, 0);
    }
  });
}

for (const transition of ['frame', 'navigation', 'restart']) {
  test(`late download encoding after ${transition} cannot cache, create a URL or click`, async () => {
    const booth = createBooth();
    await captureFour(booth);
    const output = booth.read('session.output');
    let encode;
    output.canvas.toBlob = callback => { encode = callback; };
    const pending = booth.element('download').onclick();
    await booth.element('download').onclick();
    assert.equal(booth.element('download').disabled, true);
    if (transition === 'frame') await booth.context.applyFrame('purple');
    if (transition === 'navigation') booth.context.navigateTo('home');
    if (transition === 'restart') { booth.context.restartPhotobooth(); booth.context.confirmRestart(); }
    encode(new Blob(['old pixels']));
    await pending;
    assert.equal(output.pngBlob, undefined);
    assert.equal(booth.downloads.length, 0);
    assert.equal(booth.objectURLs.size, 0);
  });
}

test('Finish preview failure is recoverable and stale preview load cannot navigate', async () => {
  const booth = createBooth();
  await captureFour(booth);
  booth.faults.image = () => true;
  await booth.context.finishStrip();
  assert.equal(booth.read('ui.phase'), 'customize');
  assert.match(booth.element('edit-camera-status').textContent, /Finish strip to retry/);
  delete booth.faults.image;
  booth.faults.hangImages = true;
  const pending = booth.context.finishStrip();
  const late = booth.loadedImages.at(-1).onload;
  booth.context.navigateTo('home');
  late();
  await pending;
  assert.equal(booth.read('ui.destination'), 'home');
  assert.equal(booth.read('ui.phase'), 'customize');
  assert.equal(booth.element('export-preview').children.length, 0);
});

test('Finish Blob failure retains Export preview and Download retries encoding', async () => {
  const booth = createBooth();
  await captureFour(booth);
  const output = booth.read('session.output');
  output.canvas.toBlob = callback => callback(null);
  await booth.context.finishStrip();
  assert.equal(booth.read('ui.phase'), 'export');
  assert.equal(booth.element('export-preview').children[0].src, output.dataURL);
  assert.match(booth.element('export-status').textContent, /Could not prepare/);
  assert.equal(booth.element('download').disabled, false);
  output.canvas.toBlob = callback => callback(Object.assign(new Blob(['png']), { source: output.dataURL }));
  await booth.element('download').onclick();
  assert.equal(booth.downloads.length, 1);
});

test('Download and Share join one encoding and share the prepared current Blob', async () => {
  const { booth, output, blob, calls } = await shareFixture();
  let encode;
  let encodings = 0;
  output.canvas.toBlob = callback => { encodings++; encode = callback; };
  const download = booth.element('download').onclick();
  const share = booth.element('share').onclick();
  assert.equal(encodings, 1);
  encode(blob);
  await Promise.all([download, share]);
  assert.equal(calls.length, 1);
  assert.equal(booth.downloads.length, 1);
  assert.equal([...booth.objectURLs.values()][0], output.pngBlob);
  assert.equal(await calls[0].files[0].text(), await output.pngBlob.text());
});

for (const result of ['unsupported', 'canceled', 'failed']) {
  test(`Export ${result} share preserves preview and working Download`, async () => {
    const booth = await exportFixture();
    const output = booth.read('session.output');
    booth.context.navigator.canShare = () => true;
    if (result !== 'unsupported') booth.context.navigator.share = async () => { throw { name: result === 'canceled' ? 'AbortError' : 'NotAllowedError' }; };
    await booth.element('share').onclick();
    assert.match(booth.element('export-status').textContent, result === 'unsupported' ? /unavailable/ : result === 'canceled' ? /canceled/ : /Could not share/);
    assert.equal(booth.element('export-preview').children[0].src, output.dataURL);
    await booth.element('download').onclick();
    assert.equal(booth.downloads.length, 1);
  });
}

test('a queued old URL timeout cannot revoke a newer download resource', async () => {
  const booth = await exportFixture();
  await booth.element('download').onclick();
  const oldExpiry = [...booth.timeouts.values()].at(-1);
  booth.context.backToCustomizing();
  await booth.context.applyFrame('purple');
  await booth.context.finishStrip();
  await booth.element('download').onclick();
  const currentURL = [...booth.objectURLs.keys()][0];
  oldExpiry();
  assert.equal(booth.objectURLs.has(currentURL), true);
});

test('object URL creation failure preserves prepared PNG and permits Download retry', async () => {
  const booth = await exportFixture();
  const output = booth.read('session.output');
  const create = booth.context.URL.createObjectURL;
  booth.context.URL.createObjectURL = () => { throw new Error('URL unavailable'); };
  await booth.element('download').onclick();
  assert.equal(booth.downloads.length, 0);
  assert.equal(booth.element('download').disabled, false);
  assert.match(booth.element('export-status').textContent, /Download PNG to retry/);
  booth.context.URL.createObjectURL = create;
  await booth.element('download').onclick();
  assert.equal(booth.downloads.length, 1);
  assert.equal([...booth.objectURLs.values()][0], output.pngBlob);
  assert.equal(booth.element('body').children.length, 0);
});

test('late native rejection after Back cannot overwrite customization feedback', async () => {
  const booth = await exportFixture();
  let reject;
  booth.context.navigator.canShare = () => true;
  booth.context.navigator.share = () => new Promise((resolve, fail) => { reject = fail; });
  const pending = booth.element('share').onclick();
  await settleImages();
  booth.context.backToCustomizing();
  booth.context.setCameraStatus('edit-camera-status', 'New editor feedback');
  reject({ name: 'NotAllowedError' });
  await pending;
  assert.equal(booth.element('edit-camera-status').textContent, 'New editor feedback');
  assert.equal(booth.read('ui.phase'), 'customize');
  assert.equal(booth.element('download').disabled, false);
});

async function galleryBooth() {
  const storage = disposableIDB();
  const booth = createBooth(storage);
  await captureFour(booth); await booth.context.finishStrip();
  const output = booth.read('session.output');
  output.pngBlob = png(output.canvas.width, output.canvas.height);
  return { booth, storage, output };
}
async function settleGallery() {
  for (let i = 0; i < 5; i++) { await settleImages(); await new Promise(resolve => setImmediate(resolve)); }
}

test('Gallery save uses exact successful Export Blob once, independently of download', async () => {
  const {booth, storage, output} = await galleryBooth();
  storage.faults.holdCommit = true;
  const saving = booth.element('save-gallery').click();
  booth.element('save-gallery').click();
  await settleGallery();
  assert.equal(booth.element('save-gallery').textContent, 'Saving…');
  assert.equal(booth.element('download').disabled, false);
  assert.equal(storage.records.size, 0);
  storage.faults.commit(); await saving;
  assert.equal(storage.records.size, 1);
  assert.equal([...storage.records.values()][0].blob, output.pngBlob);
  assert.equal(booth.element('save-gallery').textContent, 'Saved to Gallery');
  booth.element('save-gallery').click(); assert.equal(storage.records.size, 1);
});

for (const transition of ['edit','restart','navigation']) test('late Gallery save after '+transition+' cannot mark another revision saved', async () => {
  const {booth, storage, output} = await galleryBooth(); storage.faults.holdCommit = true;
  const saving = booth.element('save-gallery').click(); await settleGallery();
  if (transition === 'edit') { booth.context.backToCustomizing(); await booth.context.applyFrame('purple'); }
  if (transition === 'restart') { booth.context.restartPhotobooth(); booth.context.confirmRestart(); }
  if (transition === 'navigation') booth.context.navigateTo('home');
  storage.faults.commit(); await saving;
  assert.equal(storage.records.size, 1); assert.equal([...storage.records.values()][0].blob, output.pngBlob);
  if (transition !== 'navigation') assert.equal(booth.element('save-gallery').textContent, 'Save to Gallery');
  else assert.equal(booth.element('home-screen').style.display, 'block');
});

for (const name of ['SecurityError','QuotaExceededError','AbortError']) test('Gallery save '+name+' keeps Export and download usable', async () => {
  const {booth, storage, output} = await galleryBooth();
  if (name === 'SecurityError') storage.faults.openError=Object.assign(new Error(name),{name});
  else storage.faults.abort=Object.assign(new Error(name),{name});
  await booth.element('save-gallery').click();
  assert.equal(storage.records.size,0); assert.equal(booth.read('session.output'),output);
  assert.equal(booth.element('download').disabled,false); assert.equal(booth.element('save-gallery').disabled,false);
  assert.match(booth.element('gallery-save-status').textContent,/unavailable|full/);
  delete storage.faults.openError; delete storage.faults.abort;
  await booth.element('save-gallery').click(); assert.equal(storage.records.size,1);
});

test('Gallery unavailable is distinct from empty and Retry recovers', async () => {
  const storage=disposableIDB(); storage.faults.openError=new Error('denied'); const booth=createBooth(storage);
  booth.context.navigateTo('gallery');
  assert.match(booth.element('gallery-status').textContent,/Opening/);
  await settleGallery(); assert.equal(booth.element('gallery-empty').hidden,true);
  assert.equal(booth.element('gallery-retry').hidden,false);
  delete storage.faults.openError; await booth.element('gallery-retry').click(); await settleGallery();
  assert.equal(booth.element('gallery-empty').hidden,false);
});

test('Gallery renders newest first, previews saved PNG, downloads and releases URLs on navigation', async () => {
  const {booth,storage}=await galleryBooth(); await booth.element('save-gallery').click();
  const seed=[...storage.records.values()][0]; storage.records.set('newer',{...seed,id:'newer',savedAt:seed.savedAt+100});
  booth.context.navigateTo('gallery'); await settleGallery();
  const cards=booth.element('gallery-grid').children; assert.equal(cards.length,2);
  await cards[0].click(); assert.equal(booth.element('gallery-preview-image').src.startsWith('blob:'),true);
  assert.equal([...booth.objectURLs.values()].at(-1),storage.records.get('newer').blob);
  booth.element('gallery-download').click(); assert.equal(booth.downloads.at(-1).download,'snapicorn.png');
  booth.context.navigateTo('home'); assert.equal(booth.objectURLs.size,0);
});

test('Gallery keeps at most eight card thumbnails per page and clears them on page changes', async () => {
  const {booth,storage}=await galleryBooth(); await booth.element('save-gallery').click();
  const seed=[...storage.records.values()][0]; for(let i=0;i<10;i++)storage.records.set('extra-'+i,{...seed,id:'extra-'+i,savedAt:seed.savedAt+i+1});
  booth.context.navigateTo('gallery'); await settleGallery();
  assert.equal(booth.element('gallery-grid').children.length,8); assert.equal(booth.objectURLs.size,8);
  booth.element('gallery-next').click(); await settleGallery();
  assert.equal(booth.element('gallery-grid').children.length,3); assert.equal(booth.objectURLs.size,3);
  assert.equal(booth.revokedURLs.length,8);
});

for(const dismissal of ['keep','escape','close','backdrop']) test('Gallery delete confirmation '+dismissal+' preserves saved record',async()=>{
  const {booth,storage}=await galleryBooth(); await booth.element('save-gallery').click();
  booth.context.navigateTo('gallery'); await settleGallery(); await booth.element('gallery-grid').children[0].click();
  booth.element('gallery-delete').click(); assert.equal(booth.element('gallery-delete-confirmation').hidden,false);
  if(dismissal==='keep') booth.element('gallery-keep').click();
  if(dismissal==='escape') booth.element('gallery-preview-dialog').handlers.cancel({preventDefault(){}});
  if(dismissal==='close') booth.element('gallery-preview-close').click();
  if(dismissal==='backdrop') {
    const dialog=booth.element('gallery-preview-dialog'); const event={target:dialog,clientX:0,clientY:0};
    dialog.handlers.pointerdown(event); dialog.handlers.click(event);
  }
  assert.equal(storage.records.size,1);
});

test('confirmed Gallery deletion removes only selection and resets Saved action',async()=>{
  const {booth,storage}=await galleryBooth(); await booth.element('save-gallery').click();
  const seed=[...storage.records.values()][0];storage.records.set('other',{...seed,id:'other',savedAt:seed.savedAt-1});
  booth.context.navigateTo('gallery');await settleGallery();await booth.element('gallery-grid').children[0].click();
  booth.element('gallery-delete').click();await booth.element('gallery-confirm-delete').click();
  assert.equal(storage.records.size,1);assert.ok(storage.records.has('other'));
  assert.equal(booth.element('gallery-preview-dialog').open,false);assert.equal(booth.element('save-gallery').textContent,'Save to Gallery');
});

test('Gallery deletion failure retains preview and saved record with retry',async()=>{
  const {booth,storage}=await galleryBooth();await booth.element('save-gallery').click();
  booth.context.navigateTo('gallery');await settleGallery();await booth.element('gallery-grid').children[0].click();
  storage.faults.abort=new Error('abort');booth.element('gallery-delete').click();await booth.element('gallery-confirm-delete').click();
  assert.equal(storage.records.size,1);assert.equal(booth.element('gallery-preview-dialog').open,true);
  assert.match(booth.element('gallery-preview-status').textContent,/failed/);
  assert.equal(booth.element('gallery-download').disabled,false);
});

for(const outcome of ['unsupported','cancel','failure','success']) test('Gallery safe sharing '+outcome+' preserves PNG and download',async()=>{
  const {booth,storage}=await galleryBooth();await booth.element('save-gallery').click();
  booth.context.navigateTo('gallery');await settleGallery();await booth.element('gallery-grid').children[0].click();
  let shared;
  if(outcome!=='unsupported') {
    booth.context.navigator.canShare=()=>true;
    booth.context.navigator.share=async data=>{shared=data;if(outcome!=='success')throw Object.assign(new Error('share'),{name:outcome==='cancel'?'AbortError':'NotAllowedError'});};
  }
  await booth.element('gallery-share').click();
  assert.match(booth.element('gallery-preview-status').textContent,outcome==='unsupported'?/unavailable/:outcome==='cancel'?/canceled/:outcome==='failure'?/Could not share/:/Check the chosen app/);
  assert.equal(storage.records.size,1);assert.equal(booth.element('gallery-download').disabled,false);
  if(shared)assert.deepEqual(await shared.files[0].arrayBuffer(),await [...storage.records.values()][0].blob.arrayBuffer());
});

test('Gallery focus refresh observes multi-tab removal and dismisses missing preview',async()=>{
  const {booth,storage}=await galleryBooth();await booth.element('save-gallery').click();
  booth.context.navigateTo('gallery');await settleGallery();await booth.element('gallery-grid').children[0].click();
  storage.records.clear();booth.windowHandlers.focus();await settleGallery();
  assert.equal(booth.element('gallery-preview-dialog').open,false);assert.equal(booth.element('gallery-empty').hidden,false);
  assert.equal(booth.objectURLs.size,0);
});

test('Gallery versionchange closes connection, releases thumbnails and offers retry',async()=>{
  const {booth,storage}=await galleryBooth();await booth.element('save-gallery').click();
  booth.context.navigateTo('gallery');await settleGallery();storage.connections[0].onversionchange();
  assert.equal(storage.connections[0].closed,true);assert.equal(booth.objectURLs.size,0);
  assert.equal(booth.element('gallery-empty').hidden,true);assert.match(booth.element('gallery-status').textContent,/another tab/);
});

// Additional async boundary/resource cases use only the disposable in-memory factory.
test('Save canceled during PNG preparation never writes a different session', async () => {
  const {booth,storage,output} = await galleryBooth();
  delete output.pngBlob;
  let encode;
  output.canvas.toBlob = callback => { encode = callback; };
  const pending = booth.element('save-gallery').click();
  booth.context.navigateTo('home');
  encode(png(output.canvas.width, output.canvas.height));
  await pending;
  assert.equal(storage.records.size, 0);
  assert.equal(booth.element('gallery-save-status').textContent, '');
});

test('Gallery preview close and reopen release each full image URL', async () => {
  const {booth} = await galleryBooth();
  await booth.element('save-gallery').click();
  booth.context.navigateTo('gallery'); await settleGallery();
  const card = booth.element('gallery-grid').children[0];
  for (let i = 0; i < 5; i++) {
    await card.click();
    assert.equal(booth.objectURLs.size, 2);
    booth.element('gallery-preview-close').click();
    assert.equal(booth.objectURLs.size, 1);
  }
  booth.windowHandlers.pagehide();
  assert.equal(booth.objectURLs.size, 0);
});

test('closing a pending Gallery preview prevents a late image URL', async () => {
  const {booth,storage} = await galleryBooth();
  await booth.element('save-gallery').click();
  booth.context.navigateTo('gallery'); await settleGallery();
  storage.faults.holdCommit = true;
  const opening = booth.element('gallery-grid').children[0].click();
  await settleGallery();
  booth.element('gallery-preview-close').click();
  storage.faults.commit(); await opening;
  assert.equal(booth.objectURLs.size, 1);
  assert.equal(booth.element('gallery-preview-dialog').open, false);
});

test('missing saved record cannot be deleted from an old Gallery card', async () => {
  const {booth,storage} = await galleryBooth();
  await booth.element('save-gallery').click();
  booth.context.navigateTo('gallery'); await settleGallery();
  const card = booth.element('gallery-grid').children[0];
  storage.records.clear();
  await card.click();
  assert.match(booth.element('gallery-preview-status').textContent, /no longer/);
  assert.equal(booth.element('gallery-delete').disabled, true);
  assert.equal(booth.objectURLs.size, 1);
});

test('Gallery share rejects late feedback after preview dismissal and prevents overlap', async () => {
  const {booth} = await galleryBooth();
  await booth.element('save-gallery').click();
  booth.context.navigateTo('gallery'); await settleGallery();
  await booth.element('gallery-grid').children[0].click();
  let rejectShare, calls = 0;
  booth.context.navigator.canShare = () => true;
  booth.context.navigator.share = () => { calls++; return new Promise((resolve,reject) => { rejectShare = reject; }); };
  const pending = booth.element('gallery-share').click();
  booth.element('gallery-share').click();
  booth.element('gallery-preview-close').click();
  rejectShare(new Error('late rejection')); await pending;
  assert.equal(calls, 1);
  assert.equal(booth.element('gallery-preview-dialog').open, false);
  assert.equal(booth.objectURLs.size, 1);
});

test('focus fallback clears a stale Saved badge when BroadcastChannel is absent', async () => {
  const {booth,storage} = await galleryBooth();
  await booth.element('save-gallery').click();
  storage.records.clear();
  booth.windowHandlers.focus(); await settleGallery();
  assert.equal(booth.element('save-gallery').textContent, 'Save to Gallery');
  assert.equal(booth.element('save-gallery').disabled, false);
});

test('Gallery keyboard boundaries skip hidden confirmation controls', () => {
  const booth = createBooth();
  const dialog = booth.element('gallery-preview-dialog');
  const buttons = ['gallery-preview-close', 'gallery-download', 'gallery-share', 'gallery-delete', 'gallery-keep', 'gallery-confirm-delete'].map(id => booth.element(id));
  for (const button of buttons) button.closest = () => buttons.indexOf(button) >= 4 ? {} : null;
  dialog.querySelectorAll = () => buttons;
  booth.context.document.activeElement = buttons[0];
  let prevented = false;
  dialog.handlers.keydown({key:'Tab', shiftKey:true, preventDefault(){prevented=true;}});
  assert.equal(prevented, true);
  assert.equal(buttons[3].focusCount, 1);
  booth.context.document.activeElement = buttons[3];
  dialog.handlers.keydown({key:'Tab', shiftKey:false, preventDefault(){}});
  assert.equal(buttons[0].focusCount, 1);
});

test('dismissing a confirmed deletion before transaction completion aborts it', async () => {
  const {booth,storage} = await galleryBooth();
  await booth.element('save-gallery').click();
  booth.context.navigateTo('gallery'); await settleGallery();
  await booth.element('gallery-grid').children[0].click();
  storage.faults.holdCommit = true;
  booth.element('gallery-delete').click();
  const pending = booth.element('gallery-confirm-delete').click();
  await settleGallery();
  booth.element('gallery-keep').click();
  await pending;
  storage.faults.commit();
  assert.equal(storage.records.size, 1);
  assert.match(booth.element('gallery-preview-status').textContent, /canceled/);
  assert.equal(booth.element('gallery-preview-dialog').open, true);
});

test('choosing the current destination closes the mobile disclosure and focuses its heading', () => {
  const booth = createBooth();
  booth.context.navigateTo('settings');
  booth.element('menu-toggle').click();
  assert.equal(booth.read('ui.menuOpen'), true);
  booth.context.navigateTo('settings');
  assert.equal(booth.read('ui.menuOpen'), false);
  assert.equal(booth.element('settings-heading').focusCount, 2);
});

for (const phase of ['review', 'customize', 'export']) test('five destinations preserve completed session and focus from ' + phase, async () => {
  const booth = createBooth();
  await captureFour(booth);
  if (phase === 'review') booth.context.enterReview();
  if (phase === 'export') { await booth.context.finishStrip(); await settleImages(); }
  const photos = booth.read('session.photos');
  const output = booth.read('session.output');
  const history = booth.read('session.stickerHistory');
  const revision = booth.read('session.revision');
  for (const destination of ['settings', 'home', 'about', 'gallery', 'booth']) {
    booth.context.navigateTo(destination);
    assert.equal(booth.read('ui.destination'), destination);
    assert.equal(booth.read('ui.menuOpen'), false);
    assert.equal(booth.read('session.photos'), photos);
    assert.equal(booth.read('session.output'), output);
    assert.equal(booth.read('session.stickerHistory'), history);
    assert.equal(booth.read('session.revision'), revision);
    assert.equal(booth.read('ui.phase'), phase);
  }
  assert.equal(booth.element('settings-screen').style.display, 'none');
  assert.equal(booth.element('settings-heading').focusCount, 1);
});
