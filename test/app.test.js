import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const activeScripts = [
  'sticker-geometry.js',
  'sticker-history.js',
  'sticker-gestures.js',
  'variables.js',
  'camera.js',
  'snap.js',
  'composition.js',
  'preview.js',
  'composition-coordinator.js',
  'edit.js',
  'sticker-editor.js',
  'export.js',
  'gallery-store.js',
  'gallery.js',
  'settings.js',
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

test('More uses one registered listener and no inline async handler', () => {
  const html = readFileSync(path.join(repositoryRoot, 'index.html'), 'utf8');
  const moreButton = html.match(/<button\b[^>]*\bid="more"[^>]*>/)?.[0];
  assert.ok(moreButton, 'More remains a native button');
  assert.doesNotMatch(moreButton, /\bonclick\s*=/i);
  assert.doesNotMatch(html, /onclick\s*=\s*["'][^"']*await/i);
  assert.match(readFileSync(path.join(repositoryRoot, 'scripts/main.js'), 'utf8'), /getElementById\('more'\)\.addEventListener\('click', restartPhotobooth\)/);
});

test('screen semantics use native frame radios, current steps and one contextual live countdown', () => {
  const html = readFileSync(path.join(repositoryRoot, 'index.html'), 'utf8');
  const radios = [...html.matchAll(/<input\b[^>]*type="radio"[^>]*>/g)].map(match => match[0]).filter(radio => radio.includes('name="frame"'));
  assert.equal(radios.length, 2);
  for (const name of ['none', 'purple']) {
    assert.ok(radios.some(radio => radio.includes(`id="frame-${name}"`) && radio.includes('name="frame"')));
    assert.match(html, new RegExp(`<label[^>]+for="frame-${name}"`));
  }
  assert.match(html, /<fieldset class="frame-picker">\s*<legend[^>]*>Frame<\/legend>/);
  assert.equal([...html.matchAll(/aria-current="step"/g)].length, 4);
  assert.match(html, /id="countdown" aria-hidden="true"/);
  assert.match(html, /id="countdown-status"[^>]*role="timer" aria-live="polite" aria-atomic="true"/);
  assert.match(html, /class="hero-art" aria-hidden="true"/);
});



test('navigation exposes only working destinations and both dialogs have accessible labels', () => {
  const html = readFileSync(path.join(repositoryRoot, 'index.html'), 'utf8');
  assert.deepEqual([...html.matchAll(/data-destination="([^"]+)"/g)].map(match => match[1]), ['home', 'booth', 'gallery', 'settings', 'about']);
  assert.match(html, /id="menu-toggle"[^>]+aria-expanded="false"[^>]+aria-controls="site-nav"/);
  for (const dialog of ['retake', 'restart']) {
    assert.match(html, new RegExp(`<dialog id="${dialog}-dialog" aria-labelledby="${dialog}-heading" aria-describedby="${dialog}-description"`));
  }
  assert.match(html, /id="gallery-preview-dialog"[^>]*aria-labelledby="gallery-preview-heading"/);
  assert.match(html, /id="settings-heading" tabindex="-1"/);
});
