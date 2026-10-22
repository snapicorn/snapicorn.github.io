downloadButton.onclick = () => {
    if (sessionBusy || sessionTransitioning || !finalCanvas) return;
    try {
        const a = document.createElement('a');
        a.href = finalCanvas.toDataURL('image/png');
        a.download = 'snapicorn.png';
        a.click();
        setCameraStatus('edit-camera-status', '');
    } catch {
        setCameraStatus('edit-camera-status', 'Could not export your strip. Your strip is safe. Select Download to retry.');
    }
};

shareButton.onclick = async () => {
    if (sessionBusy || sessionTransitioning || !finalCanvas) return;
    try {
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
