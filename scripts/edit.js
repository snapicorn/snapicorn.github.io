function goToEditScreen() {
    generatePhotoStrip(imageURLs, video.videoWidth, video.videoHeight);
}

function applyFilter(filter) {
    const img = document.getElementById('compiled-strip');
    img.style.filter = filter;
}

function applyFrame(frameName) {
    let baseStrip = new Image();
    baseStrip.src = finalStrip;

    baseStrip.onload = () => {
        const ctx = finalCanvas.getContext('2d');
        ctx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.drawImage(baseStrip, 0, 0, finalCanvas.width, finalCanvas.height);

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