import assert from 'node:assert/strict';
import { copyFileSync, existsSync, linkSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { buildPackage, historicalExclusions, listPackageFiles, outputRelativePath, packageFiles, validateRelativePath } from '../tools/static-package.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'snapicorn-package-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const filename of packageFiles) {
    mkdirSync(path.dirname(path.join(root, filename)), { recursive: true });
    copyFileSync(path.join(repositoryRoot, filename), path.join(root, filename));
  }
  return root;
}

test('package is exact, byte-identical and deterministic; source-only files never enter it', t => {
  const root = fixture(t);
  for (const filename of [...historicalExclusions, '.git/private', 'test/qa.html', 'node_modules/private.js', 'docs/verification.md', 'assets/new-unapproved.png']) {
    mkdirSync(path.dirname(path.join(root, filename)), { recursive: true });
    writeFileSync(path.join(root, filename), 'source-only');
  }
  assert.equal(packageFiles.length, 43);
  assert.equal(new Set(packageFiles).size, packageFiles.length);
  const output = buildPackage(root);
  assert.deepEqual(listPackageFiles(output), [...packageFiles].sort());
  const first = packageFiles.map(filename => readFileSync(path.join(output, filename)));
  buildPackage(root);
  packageFiles.forEach((filename, index) => {
    assert.deepEqual(readFileSync(path.join(output, filename)), first[index]);
    assert.deepEqual(first[index], readFileSync(path.join(root, filename)));
  });
  for (const filename of historicalExclusions) {
    assert.equal(existsSync(path.join(output, filename)), false);
    assert.equal(readFileSync(path.join(root, filename), 'utf8'), 'source-only');
  }
});

test('unsafe relative paths are rejected on both Windows and POSIX', () => {
  for (const filename of ['../outside', 'assets/../outside', '/tmp/outside', 'C:/outside', 'C:outside', '\\\\server\\share', 'assets\\outside', './index.html', 'assets//outside', 'assets/%2e%2e/outside', 'assets/file:stream', '']) {
    assert.throws(() => validateRelativePath(filename), /Unsafe package path/);
  }
  packageFiles.forEach(validateRelativePath);
});

test('unexpected destination files or directories stop generation without overwriting anything', t => {
  const root = fixture(t);
  const output = buildPackage(root);
  writeFileSync(path.join(output, 'index.html'), 'keep existing');
  writeFileSync(path.join(output, 'private.txt'), 'keep private');
  assert.throws(() => buildPackage(root), /Unexpected package file/);
  assert.equal(readFileSync(path.join(output, 'index.html'), 'utf8'), 'keep existing');
  rmSync(path.join(output, 'private.txt'));
  mkdirSync(path.join(output, 'unapproved-empty'));
  assert.throws(() => buildPackage(root), /Unexpected package directory/);
  assert.equal(readFileSync(path.join(output, 'index.html'), 'utf8'), 'keep existing');
});

test('missing sources fail before destination writes', t => {
  const root = fixture(t);
  rmSync(path.join(root, packageFiles.at(-1)));
  assert.throws(() => buildPackage(root), /ENOENT/);
  assert.equal(existsSync(path.join(root, 'dist')), false);
});

test('source junctions and destination parent/output/nested junctions cannot escape', t => {
  for (const location of ['assets', 'dist', outputRelativePath, `${outputRelativePath}/assets`]) {
    const root = fixture(t);
    const outside = mkdtempSync(path.join(os.tmpdir(), 'snapicorn-outside-'));
    t.after(() => rmSync(outside, { recursive: true, force: true }));
    writeFileSync(path.join(outside, 'sentinel'), 'untouched');
    const target = path.join(root, location);
    if (location === 'assets') rmSync(target, { recursive: true });
    mkdirSync(path.dirname(target), { recursive: true });
    symlinkSync(outside, target, 'junction');
    assert.throws(() => buildPackage(root), /Links and special files/);
    assert.deepEqual(readFileSync(path.join(outside, 'sentinel')), Buffer.from('untouched'));
    assert.deepEqual(existsSync(path.join(outside, 'index.html')), false);
  }
});

test('hard-linked source and output files are rejected without changing their other names', t => {
  for (const destination of [false, true]) {
    const root = fixture(t);
    const output = destination ? buildPackage(root) : root;
    const target = path.join(output, 'index.html');
    const alias = path.join(root, 'alias.html');
    const before = readFileSync(target);
    linkSync(target, alias);
    assert.throws(() => buildPackage(root), /Hard links/);
    assert.deepEqual(readFileSync(alias), before);
  }
});

function referencedFiles() {
  const references = new Set();
  const html = readFileSync(path.join(repositoryRoot, 'index.html'), 'utf8');
  for (const [, resource] of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
    if (!/^(?:[a-z]+:|\/\/|#)/i.test(resource)) references.add(resource);
  }
  for (const filename of packageFiles.filter(filename => filename.endsWith('.css'))) {
    const css = readFileSync(path.join(repositoryRoot, filename), 'utf8');
    for (const [, resource] of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
      references.add(path.posix.normalize(path.posix.join(path.posix.dirname(filename), resource)));
    }
  }
  for (const filename of packageFiles.filter(filename => filename.endsWith('.js'))) {
    const source = readFileSync(path.join(repositoryRoot, filename), 'utf8');
    for (const [, resource] of source.matchAll(/['"](assets\/[^'"\s]+)['"]/g)) references.add(resource);
  }
  // Execute the actual dynamic sticker catalog, rather than hardcoding its expansions.
  const editor = readFileSync(path.join(repositoryRoot, 'scripts/sticker-editor.js'), 'utf8');
  const catalog = editor.slice(editor.indexOf('const assets ='), editor.indexOf('let nextId'));
  for (const sticker of vm.runInNewContext(`${catalog}; assets`)) references.add(sticker.src);
  return references;
}

test('generated directory serves every reference and notice, with historical URLs 404 at both mounts', async () => {
  const output = buildPackage(repositoryRoot);
  const references = referencedFiles();
  assert.equal([...references].filter(filename => filename.startsWith('assets/')).length, 21);
  for (const filename of references) assert.ok(packageFiles.includes(filename), `Reference outside allowlist: ${filename}`);
  // Each server's filesystem root is the generated directory itself, with no SPA fallback.
  for (const mount of ['/', '/snapicorn/']) {
    const requests = [];
    const server = http.createServer((request, response) => {
      requests.push(request.url);
      const pathname = new URL(request.url, 'http://localhost').pathname;
      const relative = pathname.startsWith(mount) ? decodeURIComponent(pathname.slice(mount.length)) || 'index.html' : '';
      const target = path.resolve(output, relative);
      if (!relative || !target.startsWith(`${output}${path.sep}`) || !existsSync(target)) {
        response.writeHead(404).end();
        return;
      }
      response.writeHead(200).end(readFileSync(target));
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      const base = `http://127.0.0.1:${server.address().port}${mount}`;
      for (const filename of new Set(['', ...references, ...packageFiles])) {
        const response = await fetch(new URL(filename, base));
        assert.equal(response.status, 200, `${mount}${filename}`);
        assert.deepEqual(Buffer.from(await response.arrayBuffer()), readFileSync(path.join(repositoryRoot, filename || 'index.html')));
      }
      for (const filename of [...historicalExclusions, '.git/config', 'package.json', 'test/qa.html', 'docs/pro-64-verification.md']) {
        assert.equal((await fetch(new URL(filename, base))).status, 404, `${mount}${filename}`);
        assert.ok(requests.includes(`${mount}${filename}`));
      }
      if (mount !== '/') {
        assert.equal((await fetch(new URL('/assets/imgs/placeholder-white.png', base))).status, 404);
      }
    } finally {
      await new Promise(resolve => server.close(resolve));
    }
  }
});
