function startCountdown(callback, slot = session.photos.length) {
    cancelCountdown();
    const generation = operations.generation;
    const countdownEl = document.getElementById('countdown');
    const photoLabel = document.getElementById('countdown-photo');
    photoLabel.textContent = `Photo ${slot + 1} of ${rowCount}`;
    photoLabel.hidden = false;
    let count = 3;
    countdownEl.style.display = 'block';
    countdownEl.textContent = count;
    setCameraStatus('countdown-status', `Photo ${slot + 1} of ${rowCount}. ${count}`);
    const timer = setInterval(() => {
        if (generation !== operations.generation || timer !== operations.countdownTimer) return;
        count--;
        if (count === 0) {
            cancelCountdown();
            countdownEl.style.display = 'none';
            setCameraStatus('countdown-status', '');
            photoLabel.hidden = true;
            callback();
        } else {
            countdownEl.textContent = count;
            setCameraStatus('countdown-status', String(count));
        }
    }, 1000);
    operations.countdownTimer = timer;
}

function cancelCountdown() {
    if (operations.countdownTimer !== null) {
        clearInterval(operations.countdownTimer);
        operations.countdownTimer = null;
    }
}

function capturePhoto() {
    if (!video.srcObject || !hasUsableVideo() ||
        video.srcObject.getVideoTracks().some(track => track.readyState === 'ended')) {
        throw new Error('Camera was interrupted.');
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is unavailable.');
    // Preserve the existing single mirror transform and full, uncropped source.
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    return { source: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height };
}

function takePhotosSequentially(count) {
    const generation = operations.generation;
    if (session.photos.length >= count) {
        enterReview();
        return;
    }
    startCountdown(() => {
        if (generation !== operations.generation) return;
        try {
            commitCapturedPhoto(capturePhoto());
            takePhotosSequentially(count);
        } catch {
            exitPhotobooth('Could not capture your photos. Check your camera, then select Start Photobooth to retry.');
        }
    });
}
