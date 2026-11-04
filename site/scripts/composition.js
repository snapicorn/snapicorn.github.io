// Loaded images and a canvas factory keep output independent of editor layout.
function composePhotoStrip(photos, logo, originalWidth, originalHeight, createCanvas, targetWidth = 600) {
    if (photos.length !== 4 ||
        ![originalWidth, originalHeight, targetWidth].every(value => Number.isFinite(value) && value > 0)) {
        throw new Error('Four usable photos and valid dimensions are required.');
    }
    const photoHeight = Math.round(targetWidth * originalHeight / originalWidth);
    const padding = 50;
    const gap = 30;
    const footerAllowance = 100;
    const canvas = createCanvas();
    canvas.width = targetWidth + padding * 2;
    canvas.height = photoHeight * 4 + gap * 3 + footerAllowance + padding * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is unavailable.');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    photos.forEach((photo, index) => {
        // Captures already contain the camera mirror transform. Do not mirror or crop again.
        ctx.drawImage(photo, padding, padding + index * (photoHeight + gap), targetWidth, photoHeight);
    });
    if (logo) drawFooterBranding(ctx, canvas, logo, false);
    return canvas;
}

function drawFooterBranding(ctx, canvas, logo, purple) {
    const x = canvas.width / 2;
    const y = canvas.height - 80;
    // Visible artwork bounds in logo-minimal.png; center the mark rather than its transparent margins.
    const scale = 54 / 883;
    ctx.drawImage(logo, x - (143 + 968 / 2) * scale, y - (181 + 883 / 2) * scale,
        logo.width * scale, logo.height * scale);
    if (!purple) return;
    const glint = new Path2D('M0-15C2-5 5-2 15 0 5 2 2 5 0 15-2 5-5 2-15 0-5-2-2-5 0-15Z');
    ctx.fillStyle = '#b899d0';
    for (const offset of [-57, 57]) {
        ctx.save();
        ctx.translate(x + offset, y);
        ctx.scale(.4, .4);
        ctx.fill(glint);
        ctx.restore();
    }
}

function alignPurplePaper(frame, width, height, createCanvas) {
    const paper = createCanvas();
    paper.width = width;
    paper.height = height;
    const ctx = paper.getContext('2d');
    if (!ctx) throw new Error('Canvas is unavailable.');
    ctx.drawImage(frame, 0, 0, width, height);
    // The fourth photo ends 150 px from the bottom. Preserve the existing overlay
    // above it and at the rounded corners, moving only the window's bottom trim.
    const photoEnd = height - 150;
    const trimTop = photoEnd + 8;
    const cornersTop = Math.round(height * 2054 / 2090);
    if (cornersTop <= trimTop) return paper;
    const edge = createCanvas();
    edge.width = width;
    edge.height = 1;
    const edgeContext = edge.getContext('2d');
    if (!edgeContext) throw new Error('Canvas is unavailable.');
    edgeContext.drawImage(paper, 0, photoEnd - 1, width, 1, 0, 0, width, 1);
    ctx.clearRect(0, photoEnd, width, cornersTop - photoEnd);
    ctx.drawImage(edge, 0, photoEnd, width, trimTop - photoEnd);
    ctx.drawImage(frame, 0, 2003, 700, 51, 0, trimTop, width, cornersTop - trimTop);
    return paper;
}

function composeFrame(base, frame, createCanvas, stickers = [], stickerImages = [], purpleLogo = null) {
    const canvas = createCanvas();
    canvas.width = base.width;
    canvas.height = base.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is unavailable.');
    ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
    if (frame) {
        const paper = purpleLogo ? alignPurplePaper(frame, canvas.width, canvas.height, createCanvas) : frame;
        ctx.drawImage(paper, 0, 0, canvas.width, canvas.height);
        if (purpleLogo) drawFooterBranding(ctx, canvas, purpleLogo, true);
    }
    stickers.forEach((sticker, index) => {
        const image = stickerImages[index];
        if (!image || !image.width || !image.height) throw new Error('Sticker image is unavailable.');
        const size = sticker.size * canvas.width;
        const scale = Math.min(size / image.width, size / image.height);
        ctx.save();
        try {
            ctx.imageSmoothingEnabled = false;
            ctx.translate(sticker.x * canvas.width, sticker.y * canvas.height);
            ctx.rotate(sticker.rotation * Math.PI / 180);
            ctx.drawImage(image, -image.width * scale / 2, -image.height * scale / 2,
                image.width * scale, image.height * scale);
        } finally {
            ctx.restore();
        }
    });
    return canvas;
}
