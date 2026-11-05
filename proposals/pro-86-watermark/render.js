// Runs only inside the disposable local renderer created by build.mjs.
(async () => {
  const files = {}, candidates = [], checks = [];
  const canvas = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
  const load = src => new Promise((resolve, reject) => {
    const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('Image decode failed')); image.src = src;
  });
  const save = (name, image) => { files[name] = image.toDataURL('image/png'); };
  const font = new FontFace('Proposal Fraunces', `url(${fontData})`, { weight: '600' });
  document.fonts.add(await font.load());
  const marks = { legacy: await load(legacyData) };
  for (const [name, shapes] of Object.entries(artworks)) {
    const mark = canvas(690, 624), ctx = mark.getContext('2d');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="690" height="624">${shapes}</svg>`;
    ctx.drawImage(await load('data:image/svg+xml;base64,' + btoa(svg)), 0, 0);
    ctx.fillStyle = '#7c49c6'; ctx.font = '600 108px "Proposal Fraunces"'; ctx.textAlign = 'center';
    ctx.fillText('Snapicorn', 345, 515);
    const pixels = ctx.getImageData(0, 0, 690, 624).data;
    let transparent = 0, partial = 0, opaque = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++; else if (pixels[i] === 255) opaque++; else partial++;
    }
    if (!transparent || !partial || !opaque || pixels[3] !== 0 || pixels[pixels.length - 1] !== 0) throw new Error('Alpha contract failed');
    save(`${name}.png`, mark);
    marks[name] = await load(files[`${name}.png`]);
    candidates.push({ name, width: marks[name].naturalWidth, height: marks[name].naturalHeight, transparentPixels: transparent, partialAlphaPixels: partial, opaquePixels: opaque, cornerAlpha: 0, decoded: true });
  }
  // Original synthetic landscape fixtures: no camera, Gallery data or external photos.
  function photo(w, h, index) {
    const image = canvas(w, h), ctx = image.getContext('2d');
    const palettes = [['#dfb6ca','#fce6b8','#796da0'],['#96c4d4','#e3e8db','#546f82'],['#e8b8a1','#f4dba7','#a46d80'],['#b6b8df','#f0d5e5','#6d769f']];
    const [sky, horizon, hill] = palettes[index];
    const gradient = ctx.createLinearGradient(0,0,0,h); gradient.addColorStop(0, sky); gradient.addColorStop(1, horizon);
    ctx.fillStyle = gradient; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = '#fff1ca'; ctx.beginPath(); ctx.arc(w * .73, h * .28, Math.min(w,h) * .115, 0, Math.PI * 2); ctx.fill();
    for (let layer = 0; layer < 3; layer++) {
      ctx.fillStyle = hill; ctx.globalAlpha = .3 + layer * .22;
      ctx.beginPath(); ctx.moveTo(0,h);
      for (let x = 0; x <= w; x += w / 80) ctx.lineTo(x, h * (.56 + layer * .13) + Math.sin(x / w * 7 + index + layer) * h * .1);
      ctx.lineTo(w,h); ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.fillStyle = '#fffaf2'; ctx.font = `${Math.round(w * .035)}px sans-serif`;
    ctx.fillText(`0${index + 1} / SYNTHETIC LANDSCAPE`, w * .04, h * .91);
    return image;
  }
  const frame = await load(purpleData), outputs = {};
  for (const [aspect, w, h] of [['landscape',1280,720],['standard',640,480],['portrait',480,640]]) {
    const photos = Array.from({ length: 4 }, (_, i) => photo(w,h,i));
    for (const [name, mark] of Object.entries(marks)) {
      const base = composePhotoStrip(photos, mark, w, h, () => canvas(1,1));
      for (const context of ['none', 'purple']) {
        const output = composeFrame(base, context === 'purple' ? frame : null, () => canvas(1,1));
        const filename = `previews/${name}-${context}-${aspect}.png`;
        save(filename, output); await load(files[filename]); outputs[`${name}-${context}-${aspect}`] = output;
        checks.push({ filename, width: output.width, height: output.height, decoded: true });
      }
    }
  }
  // Footer board shows the exact 700×150 bottom region at native pixels.
  const board = canvas(1460, 820), b = board.getContext('2d');
  b.fillStyle = '#fffaf2'; b.fillRect(0,0,board.width,board.height);
  b.fillStyle = '#332540'; b.font = '600 27px sans-serif'; b.fillText('Snapicorn / watermark review · NOT APPROVED', 28, 42);
  b.font = '16px sans-serif'; b.fillText('Native export pixels · 4:3 synthetic scenes · legacy comparison only',28,72);
  for (const [row, name] of Object.keys(marks).entries()) {
    b.fillStyle = '#332540'; b.font = '600 18px sans-serif'; b.fillText(name,28,116 + row * 230);
    for (const [col, context] of ['none','purple'].entries()) {
      const strip = outputs[`${name}-${context}-standard`], x = 20 + col * 720, y = 150 + row * 230;
      b.font = '16px sans-serif'; b.fillText(context === 'none' ? 'None' : 'Purple (existing frame)',x,y-10);
      b.drawImage(strip, 0,strip.height-150,700,150,x,y,700,150);
    }
  }
  save('previews/footer-comparison.png', board);
  document.getElementById('result').textContent = JSON.stringify({ files, candidates, checks });
})().catch(error => { document.getElementById('result').textContent = JSON.stringify({ error: error.stack }); });
