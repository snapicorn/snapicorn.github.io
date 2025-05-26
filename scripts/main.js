startButton.addEventListener('click', () => {
  homeScreen.style.display = 'none';
  boothScreen.style.display = 'block';
  startCamera();
  // Insert placeholder images
  for (let x = 0; x < rowCount; x++) {
    const container = document.createElement('div');
    container.className = 'preview-wrapper';
    const img = document.createElement('img');
    img.src = '';
    img.className = 'preview-img';
    img.draggable = true;
    img.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', img.src);
    });
    previewImages.push(img);
    container.appendChild(img);
    wrapper.appendChild(container);
  }
});

snapButton.addEventListener('click', () => {
  snapButton.disabled = true;
  takePhotosSequentially(rowCount);
});

frameButtons.forEach(button => {
  button.addEventListener('click', () => {
    let frameName = button.getAttribute('data-frame');
    applyFrame(frameName);
  })
})

function saveEditedImage() {
  alert('Exporting full composite coming soon 👀');
}

function restartPhotobooth() {
  document.getElementById('edit-screen').style.display = 'none';
  boothScreen.style.display = 'block';
  imageCount = 0; // reset the counter
  previewStrip.innerHTML = ''; // clear previous images
  previewStrip.style.opacity = 0;
  imageURLs = [];
  snapButton.disabled = false;
  startCamera();
}