// Local synthetic review only; no camera, storage, Gallery or production entry point.
(async () => {
  const files = {}, alpha = [], checks = [], previousCoverage = [];
  const canvas = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
  const load = src => new Promise((resolve, reject) => {
    const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('Image failed to decode')); image.src = src;
  });
  const save = (name, c) => { files[name] = c.toDataURL('image/png'); };
  const pixels = c => c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  const frames = { none: null, legacy: await load(legacyData) };
  for (const [name, source] of Object.entries(sources)) {
    const c = canvas(700, 2090); c.getContext('2d').drawImage(await load(source), 0, 0);
    const p = pixels(c); let clear = 0, partial = 0, opaque = 0;
    for (let i = 3; i < p.length; i += 4) { if (p[i] === 0) clear++; else if (p[i] === 255) opaque++; else partial++; }
    if (!clear || !opaque) throw new Error('Meaningful alpha missing');
    alpha.push({ name, transparentPixels: clear, partialAlphaPixels: partial, opaquePixels: opaque });
    save(`${name}.png`, c); frames[name] = await load(files[`${name}.png`]);
    const decoded = canvas(700, 2090); decoded.getContext('2d').drawImage(frames[name], 0, 0);
    const pngPixels = pixels(decoded);
    const differences = p.reduce((count, value, i) => count + (value !== pngPixels[i]), 0);
    if (differences) throw new Error('SVG/PNG raster mismatch');
    alpha[alpha.length - 1].svgPngDifferentChannels = differences;
  }
  function photo(w, h, i) {
    const c = canvas(w, h), ctx = c.getContext('2d');
    const palette = [['#8cb7cd', '#efd6a9', '#557b71'], ['#aaa5cd', '#f0d2d9', '#625577'], ['#e6b49a', '#f8dfab', '#a56c77'], ['#94b9bd', '#eee1bc', '#546b93']][i];
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, palette[0]); g.addColorStop(1, palette[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fffaf2'; ctx.beginPath(); ctx.arc(w * .74, h * .22, h * .09, 0, Math.PI * 2); ctx.fill();
    for (let j = 0; j < 3; j++) {
      ctx.globalAlpha = .35 + j * .22; ctx.fillStyle = palette[2]; ctx.beginPath(); ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += w / 80) ctx.lineTo(x, h * (.53 + j * .14) + Math.sin(x / w * 8 + j + i) * h * .08);
      ctx.lineTo(w, h); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Edge markers and corner letters make overlay occlusion visible at every aspect.
    ctx.strokeStyle = '#fffaf2'; ctx.lineWidth = 3; ctx.strokeRect(3, 3, w - 6, h - 6);
    ctx.fillStyle = '#332540'; ctx.font = `600 ${w * .035}px sans-serif`; ctx.fillText(`0${i + 1} / SYNTHETIC`, w * .055, h * .14);
    ctx.font = `${w * .025}px sans-serif`; ctx.fillText('LEFT', w * .035, h * .91); ctx.fillText('RIGHT', w * .83, h * .91);
    return c;
  }
  const logo = await load(watermarkData), outputs = {};
  const dummy = canvas(1, 1); // Transparent control isolates only the existing watermark's rendered pixels.
  for (const [aspect, w, h] of [['4x3', 640, 480], ['16x9', 1280, 720], ['3x4', 480, 640]]) {
    const photos = Array.from({ length: 4 }, (_, i) => photo(w, h, i));
    const base = composePhotoStrip(photos, logo, w, h, () => canvas(1, 1));
    const noLogo = composePhotoStrip(photos, dummy, w, h, () => canvas(1, 1));
    // Reproduce the previous binary mask independently of the revised artwork.
    const previous = canvas(700, 2090), previousContext = previous.getContext('2d');
    previousContext.fillRect(0, 0, 700, 2090);
    for (const [y, height] of [[28, 485], [518, 490], [1010, 454], [1468, 474]]) previousContext.clearRect(46, y, 608, height);
    const scaledPrevious = canvas(base.width, base.height);
    scaledPrevious.getContext('2d').drawImage(previous, 0, 0, base.width, base.height);
    const previousMask = pixels(scaledPrevious), height = Math.round(600 * h / w);
    previousCoverage.push({ aspect, photos: Array.from({ length: 4 }, (_, i) => {
      const y0 = 50 + i * (height + 30); let touched = 0;
      for (let y = y0; y < y0 + height; y++) for (let x = 50; x < 650; x++) if (previousMask[(y * 700 + x) * 4 + 3]) touched++;
      return { photo: i + 1, touched, percentTouched: 100 * touched / (600 * height) };
    }) });
    for (const [name, frame] of Object.entries(frames)) {
      const c = composeFrame(base, frame, () => canvas(1, 1));
      const control = composeFrame(noLogo, frame, () => canvas(1, 1));
      const p = pixels(c), q = pixels(control); let markDifferences = 0;
      for (let k = 0; k < p.length; k += 4) if (p[k] !== q[k] || p[k + 1] !== q[k + 1] || p[k + 2] !== q[k + 2]) markDifferences++;
      const coverage = canvas(c.width, c.height); if (frame) coverage.getContext('2d').drawImage(frame, 0, 0, c.width, c.height);
      const mask = pixels(coverage), photoHeight = Math.round(600 * h / w), visibility = [];
      for (let i = 0; i < 4; i++) {
        let covered = 0, opaque = 0, alphaSum = 0; const y0 = 50 + i * (photoHeight + 30);
        for (let y = y0; y < y0 + photoHeight; y++) for (let x = 50; x < 650; x++) {
          const a = mask[(y * 700 + x) * 4 + 3];
          if (a > 0) covered++;
          if (a === 255) opaque++;
          alphaSum += a;
        }
        visibility.push({ photo: i + 1, x: 50, y: y0, width: 600, height: photoHeight, pixelsTouchedByOverlay: covered, opaqueOverlayPixels: opaque, equivalentOpaquePixels: alphaSum / 255, percentClear: +(100 * (1 - covered / (600 * photoHeight))).toFixed(3) });
      }
      if (name === 'legacy' && markDifferences !== 0) throw new Error(`Watermark became visible: ${name} ${aspect}`);
      if (sources[name] && visibility.some(v => v.pixelsTouchedByOverlay !== 0)) throw new Error('Excessive photo occlusion');
      const filename = `previews/${name}-${aspect}.png`; save(filename, c); await load(files[filename]); outputs[`${name}-${aspect}`] = c;
      const footer = canvas(700, 180); footer.getContext('2d').drawImage(c, 0, c.height - 180, 700, 180, 0, 0, 700, 180); save(`previews/${name}-${aspect}-footer.png`, footer);
      checks.push({ name, aspect, width: c.width, height: c.height, decoded: true, watermarkDifferencePixels: markDifferences, photoVisibility: visibility });
    }
  }
  const board = canvas(1440, 1360), ctx = board.getContext('2d');
  ctx.fillStyle = '#fffaf2'; ctx.fillRect(0, 0, board.width, board.height);
  ctx.fillStyle = '#332540'; ctx.font = '600 28px Georgia'; ctx.fillText('Purple / refined A + B across all aspects', 28, 40);
  ctx.font = '16px sans-serif'; ctx.fillText('Unapproved local review · zero photo overlay pixels · see full-resolution files for details', 28, 70);
  for (const [column, aspect] of ['4x3', '16x9', '3x4'].entries()) {
    ctx.font = '600 22px Georgia'; ctx.fillText(aspect.replace('x', ':'), 28 + column * 480, 110);
    for (const [i, name] of ['a-lavender-wishes', 'b-cream-moonwalk'].entries()) {
      const image = outputs[`${name}-${aspect}`], width = 220;
      ctx.font = '16px sans-serif'; ctx.fillText(i === 0 ? 'A / Lavender Wishes' : 'B / Cream Moonwalk', 12 + column * 480 + i * 240, 144);
      ctx.drawImage(image, 10 + column * 480 + i * 240, 166, width, image.height * width / 700);
    }
  }
  save('previews/contact-sheet.png', board);
  document.getElementById('result').textContent = JSON.stringify({ files, alpha, checks, previousCoverage });
})().catch(error => { document.getElementById('result').textContent = JSON.stringify({ error: error.stack }); });
