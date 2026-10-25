import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../scripts/preview.js', import.meta.url), 'utf8');
const placeholder = readFileSync(new URL('../assets/imgs/placeholder-white.png', import.meta.url));

for (const mount of ['/', '/snapicorn/']) {
  test(`capture placeholders load within the ${mount} application mount`, async t => {
    const assetPath = `${mount}assets/imgs/placeholder-white.png`;
    const server = createServer((request, response) => {
      response.writeHead(request.url === assetPath ? 200 : 404, { 'Content-Type': 'image/png' });
      response.end(request.url === assetPath ? placeholder : 'Not found');
    });
    t.after(() => new Promise(resolve => server.close(resolve)));
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const baseURL = `http://127.0.0.1:${server.address().port}${mount}`;
    const images = [];
    function element() {
      return { children: [], appendChild(child) { this.children.push(child); }, setAttribute() {} };
    }
    const strip = element();
    const context = vm.createContext({
      document: { createElement: element, getElementById: () => null },
      rowCount: 4,
      previewImages: images,
      wrapper: strip,
      previewStrip: strip,
    });
    vm.runInContext(source, context);
    // Exercise the production assignment, rather than duplicating its URL in the test.
    context.addPlaceholderImages();
    assert.equal(images.length, 4);
    for (const [index, image] of images.entries()) {
      const resolved = new URL(image.src, baseURL);
      assert.equal(resolved.pathname, assetPath, 'placeholder must stay inside its mount');
      const response = await fetch(resolved);
      assert.equal(response.status, 200);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), placeholder);
      assert.equal(image.alt, `Photo ${index + 1} of 4, not captured yet`);
      assert.equal(image.draggable, false);
    }
  });
}
