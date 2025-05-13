downloadButton.onclick = () => {
    const downloadCanvas = finalCanvas;
    const ctx = downloadCanvas.getContext('2d');

    // Get the pixel ratio between canvas and its CSS size
    const canvasRect = downloadCanvas.getBoundingClientRect();
    const scaleX = downloadCanvas.width / finalCanvas.width;
    const scaleY = downloadCanvas.height / finalCanvas.height;

    document.querySelectorAll('.sticker').forEach(sticker => {
        const stickerRect = sticker.getBoundingClientRect();
        console.log(stickerRect);
        const style = getComputedStyle(sticker);

        const x = (stickerRect.left - canvasRect.left + stickerRect.width / 2) * scaleX;
        const y = (stickerRect.top - canvasRect.top + stickerRect.height / 2) * scaleY;

        const fontSize = parseFloat(style.fontSize) * ((scaleX + scaleY) / 2); // average scale for uniformity
        console.log(fontSize)
        ctx.font = `${fontSize}px ${style.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sticker.textContent.trim(), x, y);
    });
    let a = document.createElement('a');
    a.href = downloadCanvas.toDataURL('image/png');
    a.download = 'snapicorn.png';
    a.click();
};

shareButton.onclick = async () => {
    try {
        const ctx = finalCanvas.getContext('2d');
        const stickers = document.querySelectorAll('.sticker');
        stickers.forEach(sticker => {
            const { left, top } = sticker.getBoundingClientRect();
            const editRect = document.getElementById('edit-area').getBoundingClientRect();

            const x1 = left - editRect.left;
            const y1 = top - editRect.top;

            ctx.font = '3rem sans-serif';
            ctx.fillText(sticker.textContent, x, y);
        });
        // Convert the canvas directly to a Blob
        finalCanvas.toBlob(async (blob) => {
            if (!blob) {
                alert('Could not generate image for sharing.');
                return;
            }

            const file = new File([blob], 'snapicorn.png', { type: 'image/png' });

            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Snapicorn',
                    text: 'Check out my sparkly pic!'
                });
            } else {
                alert('Sharing is not supported on this device.');
            }
        }, 'image/png');
    } catch (err) {
        console.error('Error sharing image:', err);
        alert('Something went wrong while trying to share.');
    }
};