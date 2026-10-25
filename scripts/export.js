// Export owns preparation, actions and URL lifetimes; pixels stay with session.output.
let nativeShareAttempt = null;
let exportFeedbackVersion = 0;
let downloadAttempt = null;
let finishAttempt = null;
let downloadResource = null;

function isFinishPending() { return finishAttempt !== null; }
function isDownloadPending() { return downloadAttempt !== null; }

function cancelExportPreparation() {
    finishAttempt = null;
    downloadAttempt = null;
    releaseExportResources();
}

function exportIdentity(output = session.output) {
    const generation = operations.generation;
    const sessionId = session.id;
    const revision = session.revision;
    return () => generation === operations.generation && sessionId === session.id &&
        revision === session.revision && output === session.output && isCompositionCurrent();
}

function setExportStatus(message) {
    setCameraStatus(ui.phase === 'export' ? 'export-status' : 'edit-camera-status', message);
}

function releaseExportResources() {
    if (!downloadResource) return;
    clearTimeout(downloadResource.timer);
    URL.revokeObjectURL(downloadResource.url);
    downloadResource = null;
}

async function preparePNG(output, isCurrent) {
    if (output.pngBlob) return output.pngBlob;
    // Download, Finish and Share join one encoding of this immutable result.
    const pending = output.pngPromise || (output.pngPromise = encodePNG(output.canvas));
    try {
        const blob = await pending;
        if (isCurrent()) output.pngBlob = blob;
        return blob;
    } finally {
        if (output.pngPromise === pending) delete output.pngPromise;
    }
}

async function finishStrip() {
    if (ui.destination !== 'booth' || ui.phase !== 'customize' || finishAttempt ||
        operations.busy || !isCompositionCurrent()) return;
    const output = session.output;
    const isCurrent = exportIdentity(output);
    const attempt = {};
    finishAttempt = attempt;
    renderSession();
    setExportStatus('Preparing your finished strip…');
    try {
        const image = new Image();
        await loadSessionImage(output.dataURL, operations.generation, image);
        if (!isCurrent()) return;
        image.alt = document.getElementById('compiled-strip').alt;
        const preview = document.getElementById('export-preview');
        preview.innerHTML = '';
        preview.appendChild(image);
        document.getElementById('export-dimensions').textContent = `${output.canvas.width} × ${output.canvas.height} pixels · PNG`;
        ui.selectedSticker = null;
        StickerEditor.render();
        ui.phase = 'export';
        setCameraStatus('edit-camera-status', '');
        setExportStatus('');
        renderSession();
        focusDestination();
        // Prepare ahead of a user share gesture, without automatically exporting.
        await preparePNG(output, isCurrent);
    } catch {
        if (isCurrent()) setExportStatus(ui.phase === 'export'
            ? 'Could not prepare your strip. Your strip is safe. Select Download PNG or Share strip to retry.'
            : 'Could not prepare your strip. Your edits are safe. Select Finish strip to retry.');
    } finally {
        if (finishAttempt === attempt) {
            finishAttempt = null;
            renderSession();
        }
    }
}

function backToCustomizing() {
    if (ui.phase !== 'export') return;
    cancelTransientWork();
    ui.phase = 'customize';
    setCameraStatus('export-status', '');
    renderSession();
    focusDestination();
}

function isNativeSharePending() {
    return nativeShareAttempt !== null;
}

function encodePNG(canvas) {
    return new Promise((resolve, reject) => {
        // Promise construction also catches synchronous encoding exceptions.
        canvas.toBlob(blob => {
            if (blob) resolve(blob);
            else reject(new Error('PNG encoding returned no Blob.'));
        }, 'image/png');
    });
}

downloadButton.onclick = async () => {
    if (downloadAttempt || operations.busy || !isCompositionCurrent()) return;
    const output = session.output;
    const isCurrent = exportIdentity(output);
    const attempt = {};
    downloadAttempt = attempt;
    const feedbackVersion = ++exportFeedbackVersion;
    const feedback = message => {
        if (isCurrent() && feedbackVersion === exportFeedbackVersion) setExportStatus(message);
    };
    renderSession();
    try {
        const blob = await preparePNG(output, isCurrent);
        if (!isCurrent()) return;
        if (!downloadResource || downloadResource.output !== output) {
            releaseExportResources();
            const resource = { output, url: URL.createObjectURL(blob) };
            downloadResource = resource;
        }
        // Keep the URL alive after click so the browser can consume it. Repeated
        // requests renew the grace period; navigation/replacement also releases it.
        clearTimeout(downloadResource.timer);
        const resource = downloadResource;
        resource.timer = setTimeout(() => {
            if (downloadResource === resource) releaseExportResources();
        }, 60000);
        const a = document.createElement('a');
        a.href = downloadResource.url;
        a.download = 'snapicorn.png';
        document.body.appendChild(a);
        try { a.click(); }
        finally { a.remove(); }
        feedback('PNG download requested. Your strip is still available here.');
    } catch {
        feedback('Could not export your strip. Your strip is safe. Select Download PNG to retry.');
    } finally {
        if (downloadAttempt === attempt) {
            downloadAttempt = null;
            renderSession();
        }
    }
};

async function shareCurrentStrip() {
    if (nativeShareAttempt || operations.busy || !isCompositionCurrent()) return;
    const output = session.output;
    const attempt = {};
    const feedbackVersion = ++exportFeedbackVersion;
    const isCurrent = exportIdentity(output);
    const feedback = message => {
        if (isCurrent() && feedbackVersion === exportFeedbackVersion) {
            setExportStatus(message);
        }
    };
    nativeShareAttempt = attempt;
    shareButton.disabled = true;
    let stage = 'encoding';
    try {
        if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function' ||
            typeof File !== 'function') {
            feedback('Sharing is unavailable here. Select Download PNG to save your strip.');
            return;
        }
        feedback('Preparing image for sharing…');
        // Cache only on the matching published result. Replacement/reset drops it.
        const blob = await preparePNG(output, isCurrent);
        if (!isCurrent()) return;
        output.pngBlob = blob;
        stage = 'sharing';
        if (!await requestNativePNGShare(blob)) {
            feedback('Sharing is unavailable here. Select Download PNG to save your strip.');
            return;
        }
        feedback('Share request completed. Check the chosen app to confirm.');
    } catch (error) {
        if (stage === 'sharing' && error?.name === 'AbortError') {
            feedback('Sharing canceled. Your strip is ready to download or share again.');
        } else {
            feedback(stage === 'encoding'
                ? 'Could not prepare the image for sharing. Select Download PNG or try Share again.'
                : 'Could not share your strip. Select Download PNG or try Share again.');
        }
    } finally {
        if (nativeShareAttempt === attempt) {
            nativeShareAttempt = null;
            // Release this lock without restoring an old revision's enabled state.
            shareButton.disabled = operations.busy || !isCompositionCurrent();
        }
    }
}

async function requestNativePNGShare(blob) {
    if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function' || typeof File !== 'function') return false;
    const file = new File([blob], 'snapicorn.png', { type: 'image/png' });
    if (!navigator.canShare({ files: [file] })) return false;
    await navigator.share({ files: [file], title: 'Snapicorn', text: 'Check out my sparkly pic!' });
    return true;
}

async function sharePreparedPNG(blob, feedback) {
    if (nativeShareAttempt) { feedback('Another share request is still open. Close it before retrying.'); return; }
    const attempt = {};
    nativeShareAttempt = attempt;
    try {
        const shared = await requestNativePNGShare(blob);
        feedback(shared ? 'Share request completed. Check the chosen app to confirm.'
            : 'Sharing is unavailable here. Select Download PNG to save your strip.');
    } catch (error) {
        feedback(error?.name === 'AbortError' ? 'Sharing canceled. Your saved image is still here.'
            : 'Could not share your strip. Select Download PNG or try Share again.');
    } finally {
        if (nativeShareAttempt === attempt) { nativeShareAttempt = null; renderSession(); }
    }
}

shareButton.onclick = shareCurrentStrip;
