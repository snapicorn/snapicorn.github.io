import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const context = vm.createContext({});
for (const file of ['sticker-geometry', 'sticker-history', 'sticker-gestures']) {
  vm.runInContext(readFileSync(new URL(`../scripts/${file}.js`, import.meta.url), 'utf8'), context);
}
const { G, H, P } = vm.runInContext('({ G: StickerGeometry, H: StickerHistory, P: StickerGestures })', context);
const sticker = { id: 'one', key: 'star', x: 0.5, y: 0.5, size: 0.22, rotation: 0 };
const output = { width: 700, height: 2090 };
const plain = value => JSON.parse(JSON.stringify(value));

test('pointer math supports scaled preview drag and radial corner resize, rejects old events', () => {
  const bounds = { left: 100, top: 20, width: 140, height: 418 };
  const event = { button: 0, pointerId: 8, timeStamp: 100, clientX: 170, clientY: 229 };
  const drag = { ...P.begin(event, sticker, 'drag', bounds), original: sticker };
  const moved = P.patch(drag, { ...event, timeStamp: 101, clientX: 184, clientY: 270.8 });
  assert.ok(Math.abs(moved.x - 0.6) < 1e-12 && Math.abs(moved.y - 0.6) < 1e-12);
  assert.equal(P.patch(drag, { ...event, pointerId: 9 }), null);
  assert.equal(P.patch(drag, { ...event, timeStamp: 99 }), null);
  assert.equal(P.begin({ ...event, button: 2 }, sticker, 'drag', bounds), null);
  const corner = { ...event, clientX: 180, clientY: 239 };
  const resize = { ...P.begin(corner, sticker, 'resize', bounds), original: sticker };
  assert.equal(P.patch(resize, { ...corner, clientX: 190, clientY: 249 }).size, 0.44);
});

for (const [width, height, expected] of [[640, 480, 2090], [1280, 720, 1642], [480, 640, 3490]]) {
  test(`rotated bounds use ${width}×${height} output geometry`, () => {
    const dimensions = G.dimensions({ width, height });
    assert.equal(dimensions.height, expected);
    for (const rotation of [-180, -135, -90, -45, 0, 45, 90, 135, 180]) {
      for (const size of [0.01, 0.08, 0.45, 2]) {
        for (const edge of [-1, 0, 1, 2]) {
          const bounded = G.constrain({ ...sticker, x: edge, y: edge, size, rotation }, dimensions);
          assert.ok(bounded.size >= 0.08 && bounded.size <= 0.45);
          // Independently project all four corners, rather than reusing the clamp's extent helper.
          const halfSide = bounded.size * dimensions.width / 2;
          const angle = rotation * Math.PI / 180;
          for (const horizontal of [-halfSide, halfSide]) {
            for (const vertical of [-halfSide, halfSide]) {
              const x = bounded.x * dimensions.width + horizontal * Math.cos(angle) - vertical * Math.sin(angle);
              const y = bounded.y * dimensions.height + horizontal * Math.sin(angle) + vertical * Math.cos(angle);
              assert.ok(x >= -1e-9 && x <= dimensions.width + 1e-9);
              assert.ok(y >= -1e-9 && y <= dimensions.height + 1e-9);
            }
          }
        }
      }
    }
  });
}

test('four edits, remove and exact undo/redo restoration; new edit invalidates redo', () => {
  let state = H.reduce(H.create(), { type: 'add', sticker }, output);
  const versions = [plain(H.current(state))];
  for (const patch of [{ x: 0.7 }, { y: 0.8 }, { rotation: 132 }, { size: 0.4 }]) {
    state = H.reduce(state, { type: 'change', id: 'one', patch }, output);
    versions.push(plain(H.current(state)));
  }
  for (let i = 3; i >= 0; i--) {
    state = H.reduce(state, { type: 'undo' }, output);
    assert.deepEqual(plain(H.current(state)), versions[i]);
  }
  for (let i = 1; i <= 4; i++) {
    state = H.reduce(state, { type: 'redo' }, output);
    assert.deepEqual(plain(H.current(state)), versions[i]);
  }
  state = H.reduce(state, { type: 'remove', id: 'one' }, output);
  assert.equal(H.current(state).length, 0);
  state = H.reduce(state, { type: 'undo' }, output);
  assert.deepEqual(plain(H.current(state)), versions[4]);
  state = H.reduce(state, { type: 'change', id: 'one', patch: { rotation: -90 } }, output);
  assert.equal(state.index, state.entries.length - 1);
});

for (const kind of ['drag', 'resize']) {
  test(`${kind} is atomic, cancellation preserves snapshots and redo, stale tokens and no-ops are ignored`, () => {
    let state = H.reduce(H.create(), { type: 'add', sticker }, output);
    const original = state;
    state = H.reduce(state, { type: 'begin', id: 'one', token: 'first', gesture: { kind } }, output);
    for (let i = 1; i <= 10; i++) state = H.reduce(state,
      { type: 'move', token: 'first', patch: kind === 'drag' ? { x: 0.5 + i / 100 } : { size: 0.22 + i / 100 } }, output);
    assert.equal(state.entries, original.entries);
    assert.notDeepEqual(plain(H.visible(state)), plain(H.current(state)));
    const canceled = H.reduce(state, { type: 'cancel', token: 'first' }, output);
    assert.equal(canceled.entries, original.entries);
    assert.equal(H.reduce(canceled, { type: 'move', token: 'first', patch: { x: 1 } }, output), canceled);
    state = H.reduce(state, { type: 'end', token: 'first' }, output);
    assert.equal(state.index, original.index + 1);
    state = H.reduce(state, { type: 'undo' }, output);
    assert.deepEqual(plain(H.current(state)), plain(H.current(original)));
    const entries = state.entries;
    state = H.reduce(state, { type: 'begin', id: 'one', token: 'next' }, output);
    state = H.reduce(state, { type: 'move', token: 'next', patch: {} }, output);
    state = H.reduce(state, { type: 'end', token: 'next' }, output);
    assert.equal(state.entries, entries);
    assert.equal(state.index, original.index);
  });
}
