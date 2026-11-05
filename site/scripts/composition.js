const noneFooterFont = '600 50px "Fraunces"';
const stripPadding = 50;
const photoGap = 30;
const footerAllowance = 100;

// Loaded images and a canvas factory keep output independent of editor layout.
function composePhotoStrip(photos, logo, originalWidth, originalHeight, createCanvas, targetWidth = 600) {
    if (photos.length !== 4 ||
        ![originalWidth, originalHeight, targetWidth].every(value => Number.isFinite(value) && value > 0)) {
        throw new Error('Four usable photos and valid dimensions are required.');
    }
    const photoHeight = Math.round(targetWidth * originalHeight / originalWidth);
    const canvas = createCanvas();
    canvas.width = targetWidth + stripPadding * 2;
    canvas.height = photoHeight * 4 + photoGap * 3 + footerAllowance + stripPadding * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is unavailable.');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    photos.forEach((photo, index) => {
        // Captures already contain the camera mirror transform. Do not mirror or crop again.
        ctx.drawImage(photo, stripPadding, stripPadding + index * (photoHeight + photoGap), targetWidth, photoHeight);
    });
    if (logo) drawHomeFooter(ctx, canvas, logo);
    return canvas;
}

function drawHomeFooter(ctx, canvas, logo) {
    // Scale the homepage footer's 20px icon box, 3px gap and 15px type to the PNG.
    const label = 'snapicorn';
    const iconWidth = 66;
    const iconHeight = 63;
    const gap = 10;
    const y = canvas.height - 80;
    ctx.font = noneFooterFont;
    const textWidth = ctx.measureText(label).width;
    const left = (canvas.width - iconWidth - gap - textWidth) / 2;
    const scale = Math.min(iconWidth / logo.width, iconHeight / logo.height);
    const width = logo.width * scale;
    const height = logo.height * scale;
    ctx.drawImage(logo, left + (iconWidth - width) / 2, y - height / 2, width, height);
    ctx.fillStyle = '#332540';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, left + iconWidth + gap, y);
}

function drawPurpleFooter(ctx, canvas, logo) {
    const x = canvas.width / 2;
    const y = canvas.height - 80;
    // Visible artwork bounds in logo-minimal.png; center the mark rather than its transparent margins.
    const scale = 54 / 883;
    ctx.drawImage(logo, x - (143 + 968 / 2) * scale, y - (181 + 883 / 2) * scale,
        logo.width * scale, logo.height * scale);
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
    // Extend the lavender gradient from the side rail across the transparent window in each gap.
    const photoHeight = (height - stripPadding * 2 - photoGap * 3 - footerAllowance) / 4;
    const railSampleX = Math.round(width * 24 / 700);
    const gapInset = Math.floor(width * 45 / 700);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    for (let index = 0; index < 3; index++) {
        const gapTop = stripPadding + photoHeight + index * (photoHeight + photoGap);
        ctx.drawImage(paper, railSampleX, gapTop, 1, photoGap,
            gapInset, gapTop, width - gapInset * 2, photoGap);
    }
    ctx.restore();
    // The fourth photo ends 150 px from the bottom. Preserve the existing overlay
    // at the rounded corners while moving the window's bottom trim.
    const photoEnd = height - stripPadding - footerAllowance;
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
        if (purpleLogo) drawPurpleFooter(ctx, canvas, purpleLogo);
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
