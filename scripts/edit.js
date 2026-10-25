async function goToEditScreen() {
    if (ui.destination !== 'booth' || ui.phase !== 'review' || ui.retake || operations.busy) return;
    const generation = operations.generation;
    const ready = isCompositionCurrent() || await generatePhotoStrip();
    if (!ready || generation !== operations.generation) return;
    ui.phase = 'customize';
    renderSession();
    focusDestination();
}

async function applyFrame(frameName) {
    if (ui.destination !== 'booth' || ui.phase !== 'customize' || !session.geometry ||
        !['none', 'purple'].includes(frameName)) return;
    StickerEditor.cancel(false);
    updateFrameSelection(frameName);
    session.revision++;
    return requestComposition();
}

function updateFrameSelection(frameName) {
    session.frame = frameName;
    frameButtons.forEach(radio => {
        radio.checked = radio.getAttribute('data-frame') === frameName;
    });
    const preview = document.getElementById('strip-preview').children[0];
    if (preview && session.output.frameName === frameName && session.output.revision === session.revision) {
        const count = StickerHistory.visible(session.stickerHistory).length;
        preview.alt = `Your four-photo Snapicorn strip, ${frameName === 'purple' ? 'Purple frame' : 'no frame'}` +
            (count ? `, ${count} sticker${count === 1 ? '' : 's'}` : '');
    }
}
