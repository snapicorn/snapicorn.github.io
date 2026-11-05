// Browser-only synthetic fixture. Production composition/preview/export functions run verbatim.
(async () => {
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const canvas = (width, height) => Object.assign(document.createElement('canvas'), { width, height });
  const pixels = c => c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  const differences = (a, b) => {
    check(a.length === b.length, 'Equal pixel buffer dimensions');
    let count = 0;
    for (let i = 0; i < a.length; i += 4) {
      if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2] || a[i + 3] !== b[i + 3]) count++;
    }
    return count;
  };
  const decode = async source => {
    const image = await loadSessionImage(source, operations.generation);
    const c = canvas(image.width, image.height);
    c.getContext('2d').drawImage(image, 0, 0);
    return c;
  };
  const load = loadSessionImage;
  const loads = [];
  loadSessionImage = (source, ...args) => {
    loads.push(source);
    return load(imageSources[source] || source, ...args);
  };
  const downloads = [];
  HTMLAnchorElement.prototype.click = function () {
    check(this.download === 'snapicorn.png', 'Download filename unchanged');
    downloads.push(this.href);
  };
  const bytesOf = async source => new Uint8Array(await (await fetch(source)).arrayBuffer());
  const equalBytes = (a, b) => a.length === b.length && a.every((value, index) => value === b[index]);
  const digest = async bytes => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)),
    value => value.toString(16).padStart(2, '0')).join('');
  const outputs = [], checks = [];
  const sheet = reviewImages ? await loadSessionImage(reviewImages['sample-captures'], 0) : null;
  ui.destination = 'booth'; ui.phase = 'customize';
  session.id = 1;
  const logoPath = 'assets/design/logo-minimal.png';
  const frame = await loadSessionImage('assets/frames/purple.png', 0);
  const alpha = pixels(await decode(imageSources['assets/frames/purple.png']));
  check(alpha.some((value, i) => i % 4 === 3 && value === 0), 'Transparent frame pixels');
  check(alpha.some((value, i) => i % 4 === 3 && value === 255), 'Opaque frame pixels');
  for (const [aspect, width, height, stripHeight] of [
    ['4x3', 640, 480, 2090], ['16x9', 1280, 720, 1642], ['3x4', 480, 640, 3490],
  ]) {
    const photos = Array.from({ length: 4 }, (_, index) => {
      const c = canvas(width, height), ctx = c.getContext('2d');
      if (sheet) {
        const quadrantWidth = Math.floor(sheet.width / 2);
        const quadrantHeight = Math.floor(sheet.height / 2);
        const scale = Math.min(quadrantWidth / width, quadrantHeight / height);
        const w = width * scale, h = height * scale;
        const x = (index % 2) * quadrantWidth + (quadrantWidth - w) / 2;
        const y = Math.floor(index / 2) * quadrantHeight + (quadrantHeight - h) / 2;
        ctx.drawImage(sheet, x, y, w, h, 0, 0, width, height);
        return c;
      }
      // Distinct numbered-color quadrants and asymmetric edge marks reveal crop, mirror and order errors.
      const colors = [['#bd3344', '#42bc67', '#3355ca', '#f5cd21'],
        ['#ab47bc', '#26a69a', '#ef6c00', '#1565c0'],
        ['#778811', '#ee5577', '#22aaee', '#cc6633'],
        ['#445566', '#993311', '#ddaa22', '#7788ee']][index];
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = colors[i];
        ctx.fillRect(i % 2 * width / 2, Math.floor(i / 2) * height / 2, width / 2, height / 2);
      }
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 13 + index * 7, height);
      ctx.fillStyle = '#000000'; ctx.fillRect(width - 9, 0, 9, 19 + index * 11);
      return c;
    });
    session.geometry = { width, height };
    session.photos = photos.map(photo => ({ source: photo.toDataURL(), width, height }));
    const decodedPhotos = await Promise.all(session.photos.map(photo => loadSessionImage(photo.source, 0)));
    const photoHeight = Math.round(600 * height / width);
    const withoutLogo = composePhotoStrip(decodedPhotos, null, width, height, () => canvas(1, 1));
    const purpleControl = composeFrame(withoutLogo, frame, () => canvas(1, 1));
    const mask = canvas(700, stripHeight);
    mask.getContext('2d').drawImage(frame, 0, 0, 700, stripHeight);
    const maskPixels = pixels(mask);
    const previous = {};
    for (const frameName of ['none', 'purple', 'none', 'purple']) {
      const oldOutput = session.output;
      const loadStart = loads.length;
      const pending = applyFrame(frameName);
      check(!isCompositionCurrent(), 'Pending frame invalidates current export');
      check(await pending, 'Composition succeeded');
      const output = session.output;
      check(output !== oldOutput && !output.pngBlob && !output.pngPromise, 'Frame change invalidates cached PNG');
      check(isCompositionCurrent(), 'New revision is current');
      const requested = loads.slice(loadStart);
      check(requested.filter(source => source === logoPath).length === 1, 'Current mark loaded exactly once');
      check(!requested.some(source => source.includes('logo_transparent')), 'No legacy logo load');
      check(output.canvas.width === 700 && output.canvas.height === stripHeight, 'Output geometry');
      const actual = pixels(output.canvas);
      check(differences(actual, pixels(await decode(document.getElementById('compiled-strip').src))) === 0,
        'Editor preview decoded equality');
      const name = `${frameName}-${aspect}`;
      const control = frameName === 'none' ? withoutLogo : purpleControl;
      const photoEnd = stripHeight - 150;
      const regionPixels = (c, x, y, w, h) => c.getContext('2d').getImageData(x, y, w, h).data;
      let upperStart = 0;
      for (let i = 0; i < 3; i++) {
        const gapTop = 50 + photoHeight + i * (photoHeight + 30);
        const gap = regionPixels(output.canvas, 50, gapTop, 600, 30);
        const rail = regionPixels(control, 24, gapTop, 1, 30);
        check(gap.every((value, offset) => value === rail[Math.floor(offset / 2400) * 4 + offset % 4]),
          'Every gap pixel matches the side paper');
        check(differences(regionPixels(output.canvas, 0, upperStart, 700, gapTop - upperStart),
          regionPixels(control, 0, upperStart, 700, gapTop - upperStart)) === 0,
        'Rows outside the gaps match the control');
        upperStart = gapTop + 30;
      }
      check(differences(regionPixels(output.canvas, 0, upperStart, 700, photoEnd - upperStart),
        regionPixels(control, 0, upperStart, 700, photoEnd - upperStart)) === 0,
      'Rows through the fourth photo match the control');
      if (reviewImages) {
        // Compare the approved design below the photos. The review harness used
        // in-memory canvases for its captures; the app decodes captured PNGs.
        const footer = c => c.getContext('2d').getImageData(0, photoEnd, 700, 150).data;
        check(differences(footer(output.canvas), footer(await decode(reviewImages[`${name}-after`]))) === 0,
          `Production footer pixels match the approved PNG: ${name}`);
      }
      const regions = [];
      for (let i = 0; i < 4; i++) {
        const y = 50 + i * (photoHeight + 30);
        const expectedPhoto = canvas(600, photoHeight);
        expectedPhoto.getContext('2d').drawImage(decodedPhotos[i], 0, 0, 600, photoHeight);
        const region = output.canvas.getContext('2d').getImageData(50, y, 600, photoHeight).data;
        const expected = sheet ? withoutLogo.getContext('2d').getImageData(50, y, 600, photoHeight).data
          : pixels(expectedPhoto);
        check(differences(region, expected) === 0, 'Every photo pixel, edge, orientation and order unchanged');
        let touched = 0;
        for (let row = y; row < y + photoHeight; row++) for (let x = 50; x < 650; x++) {
          if (maskPixels[(row * 700 + x) * 4 + 3]) touched++;
        }
        check(touched === 0, 'Frame does not touch any photo pixel');
        regions.push({ photo: i + 1, differingPixels: 0, overlayPixels: touched });
      }
      await finishStrip();
      check(ui.phase === 'export', 'Production Finish reached Export');
      const exportPreview = document.getElementById('export-preview').firstElementChild;
      check(differences(actual, pixels(await decode(exportPreview.src))) === 0, 'Export preview decoded equality');
      const cachedBlob = output.pngBlob;
      check(cachedBlob instanceof Blob, 'Finish prepares cached PNG');
      const previewBytes = await bytesOf(output.dataURL);
      for (let repeat = 0; repeat < 2; repeat++) {
        await downloadButton.onclick();
        const target = downloads.at(-1);
        check(equalBytes(await bytesOf(target), previewBytes), 'Download PNG bytes equal preview PNG');
        check(differences(actual, pixels(await decode(target))) === 0, 'Download decoded RGBA equals preview');
        check(output.pngBlob === cachedBlob, 'Repeated download reuses matching PNG cache');
      }
      if (previous[frameName]) check(previous[frameName] === output.dataURL, 'Switching round trip preserves exact PNG');
      else {
        previous[frameName] = output.dataURL;
        outputs.push({ name, png: output.dataURL, rgbaSha256: await digest(actual) });
        checks.push({ name, width: 700, height: stripHeight, matchedApprovedFooter: !!reviewImages, regions,
          repeatedDownloads: 2, pngByteEquality: true, decodedEquality: true, cacheInvalidated: true });
      }
      backToCustomizing();
    }
  }
  cancelExportPreparation();
  document.getElementById('result').textContent = JSON.stringify({ outputs, checks, downloadActions: downloads.length });
})().catch(error => {
  document.getElementById('result').textContent = JSON.stringify({ error: error.stack });
});
