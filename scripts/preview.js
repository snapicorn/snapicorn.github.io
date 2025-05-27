function updatePreview(imageDataURL, index) {
    // const container = document.createElement('div');
    // container.className = 'preview-wrapper';
    // const img = document.createElement('img');
    // img.src = imageDataURL;
    // img.className = 'preview-img';
    // img.draggable = true;
    // img.addEventListener('dragstart', (e) => {
    //     e.dataTransfer.setData('text/plain', img.src);
    // });

    // container.appendChild(img);
    // wrapper.appendChild(container);
    previewImages[index].src = imageDataURL;
    previewImages[index].style.opacity = 1;
}

function generatePhotoStrip(imageDataURLs, originalWidth, originalHeight, targetWidth = 600) {
    const aspectRatio = originalHeight / originalWidth;
    const imgWidth = targetWidth;
    const imgHeight = Math.round(imgWidth * aspectRatio);
    console.log(imgWidth);
    console.log(imgHeight);
    const padding = 50;
    const gap = 30;
    const watermarkHeight = 100;

    const totalHeight = (imgHeight * imageDataURLs.length) + (gap * (imageDataURLs.length - 1)) + watermarkHeight;
    //const totalHeight = imgHeight * imageDataURLs.length;

    const canvas = document.createElement('canvas');
    canvas.width = imgWidth + padding * 2;
    canvas.height = totalHeight + padding * 2;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let loadedCount = 0;
    imageDataURLs.forEach((dataURL, index) => {
        const img = new Image();
        img.src = dataURL;

        img.onload = () => {
            const yOffset = padding + index * (imgHeight + gap);
            ctx.drawImage(img, padding, yOffset, imgWidth, imgHeight);
            loadedCount++;

            if (loadedCount === imageDataURLs.length) {

                const watermarkImg = new Image();
                watermarkImg.src = '../assets/logos/logo_transparent.png';

                watermarkImg.onload = () => {
                    const maxLogoWidth = imgWidth * 0.4;
                    const maxLogoHeight = watermarkHeight * 0.8;

                    const logoAspectRatio = watermarkImg.width / watermarkImg.height;

                    let logoWidth = maxLogoWidth;
                    let logoHeight = logoWidth / logoAspectRatio;

                    if (logoHeight > maxLogoHeight) {
                        logoHeight = maxLogoHeight;
                        logoWidth = logoHeight * logoAspectRatio;
                    }

                    const x = (canvas.width - logoWidth) / 2;
                    const y = (canvas.height - (padding / 2) - watermarkHeight) + (watermarkHeight - logoHeight) / 2;
                    ctx.drawImage(watermarkImg, x, y, logoWidth, logoHeight);

                    finalStrip = canvas.toDataURL('image/png');
                    finalCanvas = canvas;
                    showFinalStrip(finalStrip);
                };
            }
        };
    });
}

function showFinalStrip(dataURL) {
    const stripContainer = document.getElementById('strip-preview');
    stripContainer.innerHTML = ''; // clear previous
    const stripImg = document.createElement('img');
    stripImg.src = dataURL;
    stripImg.id = 'compiled-strip';

    stripImg.onload = () => {
        boothScreen.style.display = 'none';
        document.getElementById('edit-screen').style.display = 'block';
    }

    stripContainer.appendChild(stripImg);
    stopCamera();
}

function addPlaceholderImages() {
    for (let x = 0; x < rowCount; x++) {
        const container = document.createElement('div');
        container.className = 'preview-wrapper';
        const img = document.createElement('img');
        img.src = '../assets/imgs/placeholder-white.png';
        img.className = 'preview-img';
        img.draggable = true;
        img.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', img.src);
        });
        previewImages.push(img);
        container.appendChild(img);
        wrapper.appendChild(container);
    }
}