import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../scripts/motion.js', import.meta.url), 'utf8');
const storageKey = 'snapicorn-motion-preference';

function motionAttributes(window) {
  const attributes = new Map();
  vm.runInNewContext(source, {
    window,
    document: { documentElement: { setAttribute: (name, value) => attributes.set(name, value) } },
  });
  return attributes;
}

test('keeps a saved Reduce motion choice after removing the settings page', () => {
  const attributes = motionAttributes({
    localStorage: { getItem: key => key === storageKey ? 'reduce' : null },
  });
  assert.equal(attributes.get('data-motion'), 'reduce');
});

test('leaves motion to the device when there is no saved Reduce motion choice', () => {
  for (const saved of [null, 'system', 'invalid']) {
    assert.equal(motionAttributes({ localStorage: { getItem: () => saved } }).size, 0);
  }
  assert.equal(motionAttributes({ get localStorage() { throw Error('denied'); } }).size, 0);
});
