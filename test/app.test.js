import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const activeScripts = [
  'variables.js',
  'camera.js',
  'snap.js',
  'composition.js',
  'preview.js',
  'edit.js',
  'export.js',
  'main.js',
];

function runCameraScript({ getUserMedia, video, alerts = [], timers = {} }) {
  const listeners = new Map();
  video.addEventListener ||= (name, handler) => {
    if (!listeners.has(name)) listeners.set(name, new Set());
    listeners.get(name).add(handler);
  };
  video.removeEventListener ||= (name, handler) => listeners.get(name)?.delete(handler);
  video.dispatchEvent ||= name => listeners.get(name)?.forEach(handler => handler());
  video.play ||= async () => {};
  const context = vm.createContext({
    video,
    navigator: { mediaDevices: { getUserMedia } },
    alert: message => alerts.push(message),
    console: { error() {} },
    setTimeout: timers.setTimeout || setTimeout,
    clearTimeout: timers.clearTimeout || clearTimeout,
  });

  vm.runInContext(readFileSync(path.join(repositoryRoot, 'scripts/camera.js'), 'utf8'), context);
  return context;
}

test('all active scripts parse as classic browser scripts', () => {
  for (const filename of activeScripts) {
    const source = readFileSync(path.join(repositoryRoot, 'scripts', filename), 'utf8');
    assert.doesNotThrow(() => new vm.Script(source, { filename }));
  }
});

test('every local HTML and stylesheet resource exists and classic script order is preserved', () => {
  const html = readFileSync(path.join(repositoryRoot, 'index.html'), 'utf8');
  const references = [...html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)]
    .map(([, reference]) => reference)
    .filter(reference => !/^(?:[a-z]+:|\/\/|#)/i.test(reference));

  const scripts = [...html.matchAll(/<script\b[^>]*src=["']scripts\/([^"']+)["']/g)]
    .map(([, filename]) => filename);
  assert.deepEqual(scripts, activeScripts);
  for (const reference of references) {
    assert.ok(existsSync(path.join(repositoryRoot, reference)), `missing local resource: ${reference}`);
    if (!reference.endsWith('.css')) continue;
    const stylesheetPath = path.join(repositoryRoot, reference);
    const stylesheet = readFileSync(stylesheetPath, 'utf8');
    for (const [, resource] of stylesheet.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
      assert.ok(existsSync(path.resolve(path.dirname(stylesheetPath), resource)),
        `missing stylesheet resource: ${resource}`);
    }
  }
});

test('camera startup waits for usable video and attaches the requested silent front-camera stream', async () => {
  const stream = { getTracks: () => [] };
  const video = { srcObject: null, videoWidth: 640, videoHeight: 480 };
  let requestedConstraints;
  const context = runCameraScript({
    video,
    getUserMedia: async constraints => {
      requestedConstraints = constraints;
      return stream;
    },
  });

  assert.equal(await context.startCamera(), true);

  assert.equal(video.srcObject, stream);
  assert.equal(requestedConstraints.audio, false);
  assert.equal(requestedConstraints.video.facingMode, 'user');
});

test('camera startup waits for a readiness event before reporting success', async () => {
  const video = { srcObject: null, videoWidth: 0, videoHeight: 0 };
  const context = runCameraScript({ video, getUserMedia: async () => ({ getTracks: () => [] }) });
  let settled = false;
  const startup = context.startCamera().then(result => { settled = true; return result; });
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(settled, false);
  video.videoWidth = 640;
  video.videoHeight = 480;
  video.dispatchEvent('loadedmetadata');
  assert.equal(await startup, true);
});

test('camera permission denial or missing device returns a recoverable failure', async () => {
  for (const error of ['NotAllowedError', 'NotFoundError']) {
    const context = runCameraScript({ video: { srcObject: null }, getUserMedia: async () => { throw new Error(error); } });
    assert.equal(await context.startCamera(), false, `${error} should be recoverable`);
  }
});

test('stopping the camera stops every track and clears the video source', () => {
  const stoppedTracks = [];
  const video = {
    srcObject: {
      getTracks: () => [
        { stop: () => stoppedTracks.push('video') },
        { stop: () => stoppedTracks.push('audio') },
      ],
    },
  };
  const context = runCameraScript({ video, getUserMedia: async () => null });

  context.stopCamera();

  assert.deepEqual(stoppedTracks, ['video', 'audio']);
  assert.equal(video.srcObject, null);
});

test('failed initialization releases tracks and a later retry succeeds', async () => {
  let stopped = 0;
  let calls = 0;
  const video = { srcObject: null, videoWidth: 0, videoHeight: 0 };
  const context = runCameraScript({ video, getUserMedia: async () => {
    calls++;
    return { getTracks: () => [{ stop: () => stopped++ }] };
  } });
  const failedStart = context.startCamera();
  await new Promise(resolve => setTimeout(resolve, 0));
  context.stopCamera();
  assert.equal(await failedStart, false);
  assert.equal(stopped, 1);
  video.videoWidth = 640;
  video.videoHeight = 480;
  assert.equal(await context.startCamera(), true);
  assert.equal(calls, 2);
  context.stopCamera();
  assert.equal(stopped, 2);
});

test('video readiness timeout releases the acquired stream', async () => {
  let triggerTimeout;
  let stopped = 0;
  const video = { srcObject: null, videoWidth: 0, videoHeight: 0 };
  const context = runCameraScript({
    video,
    getUserMedia: async () => ({ getTracks: () => [{ stop: () => stopped++ }] }),
    timers: { setTimeout: callback => { triggerTimeout = callback; return 1; }, clearTimeout() {} },
  });
  const startup = context.startCamera();
  await new Promise(resolve => setTimeout(resolve, 0));
  triggerTimeout();
  assert.equal(await startup, false);
  assert.equal(stopped, 1);
  assert.equal(video.srcObject, null);
});

test('concurrent starts share one camera request', async () => {
  let requests = 0;
  let resolveRequest;
  const request = new Promise(resolve => { resolveRequest = resolve; });
  const video = { srcObject: null, videoWidth: 640, videoHeight: 480 };
  const context = runCameraScript({ video, getUserMedia: () => { requests++; return request; } });
  const first = context.startCamera();
  const second = context.startCamera();
  assert.equal(requests, 1);
  resolveRequest({ getTracks: () => [] });
  assert.deepEqual(await Promise.all([first, second]), [true, true]);
});

test('stopping during video playback cancels startup and releases the stream', async () => {
  let resolvePlayback;
  let stopped = 0;
  const video = {
    srcObject: null,
    videoWidth: 0,
    videoHeight: 0,
    play: () => new Promise(resolve => { resolvePlayback = resolve; }),
  };
  const context = runCameraScript({ video, getUserMedia: async () => ({ getTracks: () => [{ stop: () => stopped++ }] }) });
  const startup = context.startCamera();
  await new Promise(resolve => setTimeout(resolve, 0));
  context.stopCamera();
  resolvePlayback();
  assert.equal(await startup, false);
  assert.equal(stopped, 1);
  assert.equal(video.srcObject, null);
});

test('capture stays disabled until the camera reports usable dimensions', async () => {
  const handlers = {};
  const snapButton = { disabled: true, addEventListener() {} };
  const context = vm.createContext({
    startButton: { addEventListener: (name, handler) => { handlers.start = handler; } },
    snapButton,
    frameButtons: [], homeScreen: { style: {} }, boothScreen: { style: {} },
    previewStrip: { innerHTML: '' }, video: { videoWidth: 0, videoHeight: 0 },
    sessionTransitioning: false, resetPhotoboothState() {},
    sessionBusy: false, pendingImageLoads: new Set(),
    downloadButton: {}, shareButton: {}, window: { addEventListener() {} },
    cancelCountdown() {}, updateFrameThumbnails() {}, captureGeneration: 0, frameRequest: 0, countdownTimer: null,
    imageCount: 0, imageURLs: [], latestImageDataURL: '', finalStrip: '',
    finalCanvas: null, previewImages: [],
    startCamera: async () => false, addPlaceholderImages() {},
    document: { getElementById: id => id === 'more'
      ? { addEventListener() {} }
      : { textContent: '', style: {}, innerHTML: '', addEventListener() {}, focus() {} } },
  });
  vm.runInContext(readFileSync(path.join(repositoryRoot, 'scripts/main.js'), 'utf8'), context);
  await handlers.start();
  assert.equal(snapButton.disabled, true);
});

test('restarting a session clears old capture state and restores the booth controls', async () => {
  const handlers = {};
  const editScreen = { style: { display: 'block' } };
  const boothScreen = { style: { display: 'none' } };
  const snapButton = { disabled: true, addEventListener() {} };
  const previewStrip = { innerHTML: 'old previews' };
  const stripPreview = { innerHTML: 'old composite' };
  const countdown = { textContent: '1', style: { display: 'block' } };
  const moreButton = { addEventListener: (name, handler) => { handlers.more = handler; } };
  let cameraStarts = 0;
  let placeholderBuilds = 0;
  let resolveCamera;
  const cameraPromise = new Promise(resolve => { resolveCamera = resolve; });

  const context = vm.createContext({
    startButton: { addEventListener: (name, handler) => { handlers.start = handler; } },
    snapButton,
    frameButtons: [],
    homeScreen: { style: {} },
    boothScreen,
    previewStrip,
    imageCount: 4,
    imageURLs: ['old-photo-1', 'old-photo-2'],
    previewImages: [{ src: 'old-photo' }],
    latestImageDataURL: 'old-photo',
    finalStrip: 'old-strip',
    finalCanvas: { old: true },
    captureGeneration: 0, frameRequest: 0,
    countdownTimer: null,
    sessionTransitioning: false,
    sessionBusy: false, pendingImageLoads: new Set(),
    downloadButton: {}, shareButton: {}, window: { addEventListener() {} },
    cancelCountdown() {}, updateFrameThumbnails() {},
    startCamera: () => { cameraStarts += 1; return cameraPromise.then(() => true); },
    addPlaceholderImages: () => { placeholderBuilds += 1; },
    takePhotosSequentially() {},
    applyFrame() {},
    document: { getElementById: id => ({
      'edit-screen': editScreen,
      'strip-preview': stripPreview,
      countdown,
      more: moreButton,
    })[id] || null },
  });

  vm.runInContext(readFileSync(path.join(repositoryRoot, 'scripts/main.js'), 'utf8'), context);
  const firstRestart = handlers.more();
  await handlers.more();
  assert.equal(cameraStarts, 1, 'rapid More activations share one transition');
  resolveCamera();
  await firstRestart;

  assert.equal(cameraStarts, 1);
  assert.equal(placeholderBuilds, 1);
  assert.equal(context.imageCount, 0);
  assert.equal(context.imageURLs.length, 0);
  assert.equal(context.previewImages.length, 0);
  assert.equal(context.latestImageDataURL, '');
  assert.equal(context.finalStrip, '');
  assert.equal(context.finalCanvas, null);
  assert.equal(context.captureGeneration, 1);
  assert.equal(previewStrip.innerHTML, '');
  assert.equal(stripPreview.innerHTML, '');
  assert.equal(countdown.textContent, '');
  assert.equal(countdown.style.display, 'none');
  assert.equal(snapButton.disabled, false);
  assert.equal(editScreen.style.display, 'none');
  assert.equal(boothScreen.style.display, 'block');

  context.imageURLs.push('session-one-photo');
  context.previewImages.push({ src: 'session-one-photo' });
  context.finalStrip = 'session-one-strip';
  await handlers.more();
  assert.equal(cameraStarts, 2);
  assert.equal(placeholderBuilds, 2);
  assert.equal(context.captureGeneration, 2);
  assert.equal(context.imageURLs.length, 0);
  assert.equal(context.previewImages.length, 0);
  assert.equal(context.finalStrip, '');
  assert.equal(previewStrip.innerHTML, '');
});

test('More uses one registered listener and no inline async handler', () => {
  const html = readFileSync(path.join(repositoryRoot, 'index.html'), 'utf8');
  const moreButton = html.match(/<button\b[^>]*\bid="more"[^>]*>/)?.[0];
  assert.ok(moreButton, 'More remains a native button');
  assert.doesNotMatch(moreButton, /\bonclick\s*=/i);
  assert.doesNotMatch(html, /onclick\s*=\s*["'][^"']*await/i);
  assert.match(readFileSync(path.join(repositoryRoot, 'scripts/main.js'), 'utf8'), /getElementById\('more'\)\.addEventListener\('click', restartPhotobooth\)/);
});

test('a countdown from an old session cannot capture into the next session', () => {
  let tick;
  const context = vm.createContext({
    captureGeneration: 0, frameRequest: 0,
    countdownTimer: null,
    imageCount: 0,
    rowCount: 4,
    imageURLs: [],
    document: { getElementById: () => ({ style: {}, textContent: '' }) },
    setInterval: callback => { tick = callback; return 1; },
    clearInterval() {},
  });
  vm.runInContext(readFileSync(path.join(repositoryRoot, 'scripts/snap.js'), 'utf8'), context);
  context.takePhotosSequentially(4);

  context.captureGeneration++;
  tick();

  assert.equal(context.imageCount, 0);
  assert.equal(context.imageURLs.length, 0);
});
