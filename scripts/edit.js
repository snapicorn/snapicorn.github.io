function goToEditScreen() {
    generatePhotoStrip(imageURLs, video.videoWidth, video.videoHeight);
    stopCamera();
}

function applyFilter(filter) {
    const img = document.getElementById('compiled-strip');
    img.style.filter = filter;
}

async function applyFrame(frameName) {
    if (sessionTransitioning || !finalCanvas || !finalStrip) return;
    const generation = captureGeneration;
    const request = ++frameRequest;
    const isCurrent = () => generation === captureGeneration && request === frameRequest;
    sessionBusy = true;
    setExportEnabled(false);
    setCameraStatus('edit-camera-status', '');
    try {
        if (frameName !== 'none' && frameName !== 'purple') throw new Error('Unknown frame.');
        const base = await loadSessionImage(finalStrip, generation);
        if (!isCurrent()) return;
        const frame = frameName === 'purple'
            ? await loadSessionImage('../assets/frames/purple.png', generation) : null;
        if (!isCurrent()) return;
        const canvas = composeFrame(base, frame, () => document.createElement('canvas'));
        await showFinalStrip(canvas.toDataURL('image/png'), generation, isCurrent);
        if (!isCurrent()) return;
        finalCanvas = canvas;
        updateFrameSelection(frameName);
    } catch {
        if (isCurrent()) {
            setCameraStatus('edit-camera-status', 'Could not apply that frame. Your strip is safe. Select a frame to retry.');
        }
    } finally {
        if (isCurrent()) {
            sessionBusy = false;
            setExportEnabled(true);
        }
    }
}

function updateFrameSelection(frameName) {
    frameButtons.forEach(button => {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-frame') === frameName));
    });
}

function addSticker(content) {
    const sticker = document.createElement('div');
    sticker.innerText = content;
    sticker.className = 'sticker';

    sticker.setAttribute('draggable', true);

    sticker.addEventListener('dragstart', (e) => {
        // e.dataTransfer.setData('text/plain', null);
        // e.dataTransfer.effectAllowed = 'move';
        sticker.dataset.dragging = true;
    });

    sticker.addEventListener('dragend', (e) => {
        const rect = sticker.parentElement.getBoundingClientRect();
        const x = e.clientX - rect.left - sticker.offsetWidth / 2;
        const y = e.clientY - rect.top - sticker.offsetHeight / 2;
        sticker.style.left = `${x}px`;
        sticker.style.top = `${y}px`;
    });

    document.getElementById('strip-preview').appendChild(sticker);
}
