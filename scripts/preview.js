function updatePreview(imageDataURL, index) {
    previewImages[index].src = imageDataURL;
    previewImages[index].style.opacity = 1;
    updateCaptureProgress(index + 1);
}

function updateCaptureProgress(completed = 0) {
    const progress = document.getElementById('capture-progress');
    if (progress) progress.textContent = `${completed} captured`;
    Array.from(previewStrip.children).forEach((slot, index) => {
        slot.setAttribute('data-active', String(index === completed));
    });
}

function updateFrameThumbnails(source) {
    document.querySelectorAll('.mini-strip').forEach(thumbnail => {
        thumbnail.src = source;
    });
}

// Every load settles on success, failure, timeout, or session cancellation.
function loadSessionImage(source, generation, image = new Image()) {
    return new Promise((resolve, reject) => {
        let settled = false;
        const timeout = setTimeout(() => finish(new Error('Image loading timed out.')), 8000);
        const cancel = () => finish(new Error('Session cancelled.'));
        function finish(error) {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            pendingImageLoads.delete(cancel);
            image.onload = null;
            image.onerror = null;
            if (error) reject(error);
            else resolve(image);
        }
        pendingImageLoads.add(cancel);
        image.onload = () => {
            if (generation !== captureGeneration || !image.width || !image.height) {
                finish(new Error('Image is unavailable.'));
            } else finish();
        };
        image.onerror = () => finish(new Error('Image could not be loaded.'));
        try {
            image.src = source;
        } catch (error) {
            finish(error);
        }
    });
}

async function generatePhotoStrip(imageDataURLs, originalWidth, originalHeight, targetWidth = 600) {
    const generation = captureGeneration;
    try {
        if (imageDataURLs.length !== rowCount || originalWidth <= 0 || originalHeight <= 0) {
            throw new Error('Four usable photos are required.');
        }
        const photos = [];
        for (const source of [...imageDataURLs]) {
            photos.push(await loadSessionImage(source, generation));
            if (generation !== captureGeneration) return;
        }
        const logo = await loadSessionImage('../assets/logos/logo_transparent.png', generation);
        if (generation !== captureGeneration) return;
        const canvas = composePhotoStrip(photos, logo, originalWidth, originalHeight,
            () => document.createElement('canvas'), targetWidth);
        const dataURL = canvas.toDataURL('image/png');
        await showFinalStrip(dataURL, generation);
        if (generation !== captureGeneration) return;
        finalStrip = dataURL;
        finalCanvas = canvas;
        updateFrameSelection('none');
        sessionBusy = false;
        setExportEnabled(true);
    } catch {
        if (generation === captureGeneration) {
            exitPhotobooth('Could not build your photo strip. Select Start Photobooth to retry with four new photos.');
        }
    }
}

async function showFinalStrip(dataURL, generation = captureGeneration, isCurrent = () => true) {
    const stripImg = document.createElement('img');
    stripImg.id = 'compiled-strip';
    stripImg.alt = 'Your four-photo Snapicorn strip';
    await loadSessionImage(dataURL, generation, stripImg);
    if (generation !== captureGeneration || !isCurrent()) return;
    const stripContainer = document.getElementById('strip-preview');
    stripContainer.innerHTML = '';
    stripContainer.appendChild(stripImg);
    updateFrameThumbnails(dataURL);
    const enteringEditor = document.getElementById('edit-screen').style.display === 'none';
    boothScreen.style.display = 'none';
    document.getElementById('edit-screen').style.display = 'block';
    if (enteringEditor) document.getElementById('edit-heading')?.focus();
    stopCamera();
}
function addPlaceholderImages() {
    for (let x = 0; x < rowCount; x++) {
        const container = document.createElement('div');
        container.className = 'preview-wrapper';
        const number = document.createElement('span');
        number.className = 'preview-number';
        number.textContent = String(x + 1).padStart(2, '0');
        number.setAttribute('aria-hidden', 'true');
        container.appendChild(number);
        const img = document.createElement('img');
        img.src = '../assets/imgs/placeholder-white.png';
        img.alt = `Photo ${x + 1} of ${rowCount}`;
        img.className = 'preview-img';
        img.draggable = false;
        previewImages.push(img);
        container.appendChild(img);
        wrapper.appendChild(container);
    }
    updateCaptureProgress();
}
