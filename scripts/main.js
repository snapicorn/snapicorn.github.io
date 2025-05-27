startButton.addEventListener('click', async () => {
  await startCamera();
  addPlaceholderImages();
  homeScreen.style.display = 'none';
  boothScreen.style.display = 'block';
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

async function restartPhotobooth() {
  await startCamera();
  document.getElementById('edit-screen').style.display = 'none';
  boothScreen.style.display = 'block';
  imageCount = 0; // reset the counter
  previewStrip.innerHTML = ''; // clear previous images
  imageURLs = [];
  snapButton.disabled = false;
  addPlaceholderImages();
}