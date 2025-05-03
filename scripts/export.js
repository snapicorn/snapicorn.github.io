downloadButton.onclick = () => {
    const a = document.createElement('a');
    a.href = finalStrip;
    a.download = 'snapicorn.png';
    a.click();
};

shareButton.onclick = async () => {
    const blob = await (await fetch(finalStrip)).blob();
    const file = new File([blob], 'snapicorn.png', { type: blob.type });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
            files: [file],
            title: 'Snapicorn',
            text: 'Check out my sparkly pic!'
        });
    } else {
        alert('Sharing not supported on this device.');
    }
};