function goToEditScreen() {
    boothScreen.style.display = 'none';
    document.getElementById('edit-screen').style.display = 'block';
    generatePhotoStrip(imageURLs, video.videoWidth, video.videoHeight);
}

function applyFilter(filter) {
    const img = document.getElementById('compiled-strip');
    img.style.filter = filter;
}

function applyFrame(frameName) {
    let baseStripImage = new Image();
    baseStripImage.src = finalStrip;

    baseStripImage.onload = () => {
        const ctx = finalCanvas.getContext('2d');
        ctx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.drawImage(baseStripImage, 0, 0, finalCanvas.width, finalCanvas.height);

        if (frameName == 'none') {
            showFinalStrip(finalCanvas.toDataURL('image/png'));
            return;
        }

        const frame = new Image();
        let frameUrl = ''
        switch (frameName) {
            case 'purple':
                frameUrl = '../assets/frames/purple.png';
                break;
        }

        frame.src = frameUrl;
        frame.onload = () => {
            ctx.drawImage(frame, 0, 0, finalCanvas.width, finalCanvas.height);
            showFinalStrip(finalCanvas.toDataURL('image/png'));
        }

    }
}

function addSticker(emoji) {
    const sticker = document.createElement('div');
    sticker.textContent = emoji;
    sticker.style.position = 'absolute';
    sticker.style.left = '50%';
    sticker.style.top = '50%';
    sticker.style.fontSize = '2rem';
    sticker.style.transform = 'translate(-50%, -50%)';
    sticker.style.cursor = 'move';
    sticker.setAttribute('draggable', true);

    sticker.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', null);
        e.dataTransfer.effectAllowed = 'move';
        sticker.dataset.dragging = true;
    });

    sticker.addEventListener('dragend', (e) => {
        sticker.style.left = `${e.pageX - sticker.offsetWidth / 2}px`;
        sticker.style.top = `${e.pageY - sticker.offsetHeight / 2}px`;
    });

    document.getElementById('edit-area').appendChild(sticker);
}