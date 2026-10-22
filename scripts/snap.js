function startCountdown(callback) {
    cancelCountdown();
    const generation = captureGeneration;
    const countdownEl = document.getElementById('countdown');
    const photoLabel = document.getElementById('countdown-photo');
    if (photoLabel) {
        photoLabel.textContent = `Photo ${imageCount + 1} of ${rowCount}`;
        photoLabel.hidden = false;
    }
    let count = 3;
    countdownEl.style.display = 'block';
    countdownEl.textContent = count;

    countdownTimer = setInterval(() => {
        if (generation !== captureGeneration) {
            return;
        }
        count--;
        if (count === 0) {
            cancelCountdown();
            countdownEl.style.display = 'none';
            if (photoLabel) photoLabel.hidden = true;
            callback();
        }
        else {
            countdownEl.textContent = count;
        }
    }, 1000);
}

function cancelCountdown() {
    if (countdownTimer !== null) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
}

function takePhotosSequentially(count) {
    const generation = captureGeneration;
    if (imageCount >= count) {
        goToEditScreen();
        return;
    }

    startCountdown(() => {
        if (generation !== captureGeneration) return;
        try {
            if (!video.srcObject || !hasUsableVideo() ||
                video.srcObject.getVideoTracks().some(track => track.readyState === 'ended')) {
                throw new Error('Camera was interrupted.');
            }
            const canvas = document.createElement('canvas');
            const scaleFactor = 1;
            canvas.width = video.videoWidth * scaleFactor;
            canvas.height = video.videoHeight * scaleFactor;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas is unavailable.');

            // Unmirror camera
            ctx.save();
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            ctx.restore();

            const dataURL = canvas.toDataURL('image/png');
            latestImageDataURL = dataURL;
            imageURLs.push(latestImageDataURL);
            updatePreview(dataURL, imageCount);
            imageCount++;
            takePhotosSequentially(count); // recurse after photo taken
        } catch {
            exitPhotobooth('Could not capture your photos. Check your camera, then select Start Photobooth to retry.');
        }
    });
}
