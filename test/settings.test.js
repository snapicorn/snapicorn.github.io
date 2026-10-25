import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../scripts/settings.js', import.meta.url), 'utf8');
function setup({ saved = null, matches = false, readDenied = false, writeDenied = false, unavailable = false, legacy = false, accessorDenied = false } = {}) {
  const values = new Map(saved === null ? [] : [['snapicorn-motion-preference', saved]]);
  const radios = ['system', 'reduce'].map(value => ({ value, addEventListener(name, handler) { this[name] = handler; } }));
  const root = { setAttribute(name, value) { this[name] = value; } };
  const status = {};
  const link = { addEventListener(name, handler) { this[name] = handler; } };
  let listener;
  let destination;
  const media = { matches };
  media[legacy ? 'addListener' : 'addEventListener'] = (...args) => { listener = args.at(-1); };
  const storage = {
    getItem(key) { if (readDenied) throw Error('denied'); return values.get(key) ?? null; },
    setItem(key, value) { if (writeDenied) throw Error('quota/denied'); values.set(key, value); },
  };
  const context = vm.createContext({ window: { localStorage: unavailable ? undefined : storage, matchMedia: () => media },
    document: { documentElement: root, querySelectorAll: () => radios, getElementById: id => id === 'settings-gallery' ? link : status },
    navigateTo(value) { destination = value; },
  });
  if (accessorDenied) Object.defineProperty(context.window, 'localStorage', { get() { throw Error('denied accessor'); } });
  vm.runInContext(source + '\nSettings.initialize();', context);
  return { root, radios, status, values, link, get destination() { return destination; },
    choose(value) { const radio = radios.find(radio => radio.value === value); radio.checked = true; radio.change(); },
    os(value) { media.matches = value; listener(); },
  };
}

test('default follows the device without writing storage on load', () => {
  const app = setup();
  assert.equal(app.radios[0].checked, true);
  assert.equal(app.root['data-motion'], 'no-preference');
  assert.equal(app.values.size, 0);
});
for (const saved of ['system', 'reduce']) test('restores valid preference ' + saved, () => {
  const app = setup({ saved });
  assert.equal(app.radios.find(radio => radio.checked).value, saved);
  assert.equal(app.root['data-motion'], saved === 'reduce' ? 'reduce' : 'no-preference');
});
for (const saved of ['', 'invalid', 'true', 'REDUCE', '{"motion":"reduce"}']) test('invalid stored value falls back without rewriting: ' + saved, () => {
  const app = setup({ saved });
  assert.equal(app.radios[0].checked, true);
  assert.equal(app.values.get('snapicorn-motion-preference'), saved);
});
for (const options of [{ readDenied: true }, { writeDenied: true }, { unavailable: true }, { accessorDenied: true }]) test('storage failure keeps usable memory choice ' + JSON.stringify(options), () => {
  const app = setup(options);
  app.choose('reduce');
  assert.equal(app.root['data-motion'], 'reduce');
  app.os(false);
  assert.equal(app.radios[1].checked, true);
  app.choose('system');
  assert.equal(app.root['data-motion'], 'no-preference');
  if (!options.readDenied) assert.match(app.status.textContent, /this visit/);
});
test('saved choice survives a fresh script lifetime; denied writes cannot promise reload persistence', () => {
  const app = setup(); app.choose('reduce');
  assert.equal(setup({ saved: app.values.get('snapicorn-motion-preference') }).radios[1].checked, true);
  const blocked = setup({ writeDenied: true }); blocked.choose('reduce');
  assert.equal(setup({ saved: blocked.values.get('snapicorn-motion-preference') }).radios[0].checked, true);
});
for (const legacy of [false, true]) test('live OS changes and explicit override, legacy listener: ' + legacy, () => {
  const app = setup({ legacy, matches: true });
  assert.equal(app.root['data-motion'], 'reduce');
  app.os(false); assert.equal(app.root['data-motion'], 'no-preference');
  app.os(true); assert.equal(app.root['data-motion'], 'reduce');
  app.choose('reduce'); app.os(false); assert.equal(app.root['data-motion'], 'reduce');
  app.choose('system'); assert.equal(app.root['data-motion'], 'no-preference');
});
test('Gallery anchor uses the existing in-memory navigation transition', () => {
  const app = setup(); let prevented = false;
  app.link.click({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true); assert.equal(app.destination, 'gallery');
});
test('Settings has a labeled native group, descriptive guidance and responsive cards', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const settings = html.split('id="settings-screen"')[1].split('id="about-screen"')[0];
  assert.equal([...settings.matchAll(/type="radio" name="motion"/g)].length, 2);
  assert.match(settings, /<legend class="visually-hidden">Motion preference<\/legend>/);
  assert.match(settings, /aria-describedby="motion-description motion-storage-status"/);
  assert.match(settings, /href="#gallery"/);
  for (const text of ['choose to save', 'browser profile and site origin', 'cleared or evicted', 'permanent backup or cloud sync', 'separate copy']) assert.ok(settings.includes(text));
  const css = readFileSync(new URL('../styles/style.css', import.meta.url), 'utf8');
  assert.match(css, /\.settings-page \{ max-width: 680px; width: calc\(100% - 40px\)/);
  assert.match(css, /\.preference-options \{[^}]*flex-wrap: wrap/);
});

test('denied reads disclose visit-only fallback before interaction', () => {
  assert.match(setup({ readDenied: true }).status.textContent, /this visit/);
  assert.match(setup({ accessorDenied: true }).status.textContent, /this visit/);
});
