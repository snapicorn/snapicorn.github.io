function startCountdown(callback) {
    const countdownEl = document.getElementById('countdown');
    let count = 3;
    countdownEl.style.display = 'block';
    countdownEl.textContent = count;

    const interval = setInterval(() => {
        count--;
        if (count < 0) {
            clearInterval(interval);
            countdownEl.style.display = 'none';
            callback();
        }
        else {
            countdownEl.textContent = count;
        }
    }, 1000);
}

function takePhotosSequentially(count) {
    if (imageCount >= count) {
        goToEditScreen();
        return;
    }

    startCountdown(() => {
        const canvas = document.createElement('canvas');
        const scaleFactor = 1;
        canvas.width = video.videoWidth * scaleFactor;
        canvas.height = video.videoHeight * scaleFactor;
        const ctx = canvas.getContext('2d');

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
    });
}