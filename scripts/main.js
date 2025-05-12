startButton.addEventListener('click', () => {
  homeScreen.style.display = 'none';
  boothScreen.style.display = 'block';
  startCamera();
});

snapButton.addEventListener('click', () => {
  previewStrip.style.opacity = 100;
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
  startCamera();
}