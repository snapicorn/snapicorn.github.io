startButton.addEventListener('click', () => {
  homeScreen.style.display = 'none';
  boothScreen.style.display = 'block';
  startCamera();
});

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
    } else
    {
      countdownEl.textContent = count;
    }
  }, 1000);
}

snapButton.addEventListener('click', () => {
  previewStrip.style.opacity = 100;
  takePhotosSequentially(rowCount);
});

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
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL('image/png');
    latestImageDataURL = dataURL;
    imageURLs.push(latestImageDataURL);
    updatePreview(dataURL);
    imageCount++;
    takePhotosSequentially(count); // recurse after photo taken

  });
}

function updatePreview(imageDataURL) {


  const container = document.createElement('div');
  container.className = 'preview-wrapper';
  const img = document.createElement('img');
  img.src = imageDataURL;
  img.className = 'preview-img';
  img.draggable = true;
  img.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', img.src);
  });

  container.appendChild(img);
  wrapper.appendChild(container);
}

function goToEditScreen() {
  boothScreen.style.display = 'none';
  document.getElementById('edit-screen').style.display = 'block';
  generatePhotoStrip(imageURLs, video.videoWidth, video.videoHeight);
}

function applyFilter(filter) {
  const img = document.getElementById('compiled-strip');
  img.style.filter = filter;
}

function applyFrame(frameUrl) {
  const frame = document.getElementById('frame-overlay');
  frame.style.backgroundImage = frameUrl === 'none' ? '' : `url(${frameUrl})`;
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

function goBackToBooth() {
  document.getElementById('edit-screen').style.display = 'none';
  boothScreen.style.display = 'block';
}

function saveEditedImage() {
  alert('Exporting full composite coming soon 👀');
}

function askForMore() {
  document.getElementById('edit-screen').style.display = 'none';
  boothScreen.style.display = 'block';
  imageCount = 0; // reset the counter
  previewStrip.innerHTML = ''; // clear previous images
  previewStrip.style.opacity = 0;
  startCamera();
}

function generatePhotoStrip(imageDataURLs, originalWidth, originalHeight, targetWidth = 600) {
  const aspectRatio = originalHeight / originalWidth;
  const imgWidth = targetWidth;
  const imgHeight = Math.round(imgWidth * aspectRatio);
  const padding = 50;
  const gap = 20;
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

  //let stripHeight = 0;
  //console.log(imageDataURLs)
  imageDataURLs.forEach((dataURL, index) => {
    const img = new Image();
    img.src = dataURL;

    img.onload = () => {
      //  ctx.drawImage(img, 0, index * imgHeight, imgWidth, imgHeight);
      const yOffset = padding + index * (imgHeight + gap);
      ctx.drawImage(img, padding, yOffset, imgWidth, imgHeight);
      loadedCount++;

      if (loadedCount === imageDataURLs.length) {
        // ctx.fillStyle = '#000'; // watermark color
        // ctx.font = 'bold 24px Arial';
        // ctx.textAlign = 'center';
        // ctx.fillText('Snapicorn Photobooth', imgWidth / 2, totalHeight - watermarkHeight / 2 + 10);

        // finalStrip = canvas.toDataURL('image/png');
        // showFinalStrip(finalStrip);
        //canvas.height += watermarkHeight;

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
          const y = canvas.height - watermarkHeight + (watermarkHeight - logoHeight) / 2;
          ctx.drawImage(watermarkImg, x, y, logoWidth, logoHeight);
        
          const finalStrip = canvas.toDataURL('image/png');
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

  stripContainer.appendChild(stripImg);
  stopCamera();
}
