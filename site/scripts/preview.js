function updatePreview(imageDataURL, index) {
    previewImages[index].src = imageDataURL;
    previewImages[index].alt = `Captured photo ${index + 1} of ${rowCount}`;
    previewImages[index].style.opacity = 1;
    updateCaptureProgress(session.photos.length);
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
            operations.pendingImageLoads.delete(cancel);
            image.onload = null;
            image.onerror = null;
            if (error) reject(error);
            else resolve(image);
        }
        operations.pendingImageLoads.add(cancel);
        image.onload = () => {
            if (generation !== operations.generation || !image.width || !image.height) {
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

function generatePhotoStrip() {
    document.getElementById('review-heading').focus();
    return requestComposition();
}
async function showFinalStrip(dataURL, generation = operations.generation, isCurrent = () => true) {
    const stripImg = document.createElement('img');
    stripImg.id = 'compiled-strip';
    stripImg.alt = 'Your four-photo Snapicorn strip';
    await loadSessionImage(dataURL, generation, stripImg);
    if (generation !== operations.generation || !isCurrent()) return;
    const stripContainer = document.getElementById('strip-preview');
    stripContainer.innerHTML = '';
    stripContainer.appendChild(stripImg);
    const stage = document.getElementById('strip-stage');
    stage.style.aspectRatio = `${stripImg.naturalWidth} / ${stripImg.naturalHeight}`;
    stage.style.setProperty('--strip-ratio', stripImg.naturalWidth / stripImg.naturalHeight);
    updateFrameThumbnails(dataURL);
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
        img.src = 'assets/imgs/placeholder-white.png';
        img.alt = `Photo ${x + 1} of ${rowCount}, not captured yet`;
        img.className = 'preview-img';
        img.draggable = false;
        previewImages.push(img);
        container.appendChild(img);
        wrapper.appendChild(container);
    }
    updateCaptureProgress();
}
