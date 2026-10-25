// Loaded images and a canvas factory keep output independent of editor layout.
function composePhotoStrip(photos, logo, originalWidth, originalHeight, createCanvas, targetWidth = 600) {
    if (photos.length !== 4 ||
        ![originalWidth, originalHeight, targetWidth].every(value => Number.isFinite(value) && value > 0)) {
        throw new Error('Four usable photos and valid dimensions are required.');
    }
    const photoHeight = Math.round(targetWidth * originalHeight / originalWidth);
    const padding = 50;
    const gap = 30;
    const watermarkHeight = 100;
    const canvas = createCanvas();
    canvas.width = targetWidth + padding * 2;
    canvas.height = photoHeight * 4 + gap * 3 + watermarkHeight + padding * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is unavailable.');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    photos.forEach((photo, index) => {
        // Captures already contain the camera mirror transform. Do not mirror or crop again.
        ctx.drawImage(photo, padding, padding + index * (photoHeight + gap), targetWidth, photoHeight);
    });
    const logoScale = Math.min(targetWidth * 0.4 / logo.width, watermarkHeight * 0.8 / logo.height);
    const logoWidth = logo.width * logoScale;
    const logoHeight = logo.height * logoScale;
    ctx.drawImage(logo, (canvas.width - logoWidth) / 2,
        canvas.height - padding / 2 - watermarkHeight + (watermarkHeight - logoHeight) / 2,
        logoWidth, logoHeight);
    return canvas;
}

function composeFrame(base, frame, createCanvas, stickers = [], stickerImages = []) {
    const canvas = createCanvas();
    canvas.width = base.width;
    canvas.height = base.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is unavailable.');
    ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
    if (frame) ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
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
