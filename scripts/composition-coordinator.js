function isCompositionCurrent() {
    return !!session.output.canvas && session.output.sessionId === session.id &&
        session.output.revision === session.revision && operations.compositionStatus === 'ready' &&
        !session.output.gestureToken &&
        !session.stickerHistory.gesture;
}

// A requested revision remains unavailable until both encoding and preview decode succeed.
async function requestComposition() {
    cancelExportPreparation();
    const generation = operations.generation;
    const request = ++operations.renderRequest;
    const sessionId = session.id;
    const revision = session.revision;
    const isCurrent = () => generation === operations.generation && request === operations.renderRequest &&
        sessionId === session.id && revision === session.revision;
    const photosSnapshot = [...session.photos];
    const geometry = session.geometry;
    const frameName = session.frame;
    const stickers = StickerHistory.visible(session.stickerHistory);
    const gestureToken = session.stickerHistory.gesture?.token || null;
    const status = ui.phase === 'review' ? 'review-status' : 'edit-camera-status';
    operations.compositionStatus = 'pending';
    operations.busy = true;
    setExportEnabled(false);
    document.getElementById('retry-composition').hidden = true;
    setCameraStatus(status, ui.phase === 'review' ? 'Preparing your strip…' : 'Updating your strip…');
    renderSession();
    try {
        if (photosSnapshot.length !== rowCount || !geometry) throw new Error('Four usable photos are required.');
        const photos = [];
        for (const photo of photosSnapshot) {
            photos.push(await loadSessionImage(photo.source, generation));
            if (!isCurrent()) return false;
        }
        // Purple has its own footer artwork; omit the watermark rather than covering photos.
        const logo = frameName === 'none'
            ? await loadSessionImage('assets/logos/logo_transparent.png', generation) : null;
        if (!isCurrent()) return false;
        const base = composePhotoStrip(photos, logo, geometry.width, geometry.height,
            () => document.createElement('canvas'));
        const baseURL = base.toDataURL('image/png');
        const frame = frameName === 'purple' ? await loadSessionImage('assets/frames/purple.png', generation) : null;
        if (!isCurrent()) return false;
        const images = [];
        for (const sticker of stickers) {
            const asset = StickerEditor.assets.find(asset => asset.key === sticker.key);
            if (!asset) throw new Error('Unknown sticker.');
            images.push(await loadSessionImage(asset.src, generation));
            if (!isCurrent()) return false;
        }
        const canvas = frame || stickers.length
            ? composeFrame(base, frame, () => document.createElement('canvas'), stickers, images) : base;
        const dataURL = canvas === base ? baseURL : canvas.toDataURL('image/png');
        await showFinalStrip(dataURL, generation, isCurrent);
        if (!isCurrent()) return false;
        session.output = { base: baseURL, canvas, dataURL, revision, sessionId, frameName, gestureToken };
        operations.compositionStatus = 'ready';
        updateFrameSelection(frameName);
        StickerEditor.render();
        setCameraStatus(status, '');
        return true;
    } catch {
        if (isCurrent()) {
            operations.compositionStatus = 'error';
            setCameraStatus(status, ui.phase === 'review'
                ? 'Could not build your strip. Your photos are safe. Select Make it yours to retry.'
                : 'Could not update your strip. Your edits are safe. Retry to continue.');
            document.getElementById('retry-composition').hidden = false;
        }
        return false;
    } finally {
        if (isCurrent()) {
            operations.busy = false;
            renderSession();
        }
    }
}
