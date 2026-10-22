startButton.addEventListener('click', async () => {
  if (sessionTransitioning) return;
  sessionTransitioning = true;
  resetPhotoboothState();
  const generation = captureGeneration;
  setCameraStatus('camera-status', '');
  try {
    const ready = await startCamera();
    if (generation !== captureGeneration) return;
    if (!ready) {
      setCameraStatus('camera-status', 'Camera unavailable. Check permissions or connect a camera, then try again.');
      return;
    }
    addPlaceholderImages();
    snapButton.disabled = false;
    homeScreen.style.display = 'none';
    boothScreen.style.display = 'block';
    document.getElementById('capture-heading')?.focus();
  } finally {
    if (generation === captureGeneration) sessionTransitioning = false;
  }
});

snapButton.addEventListener('click', () => {
  if (sessionTransitioning || sessionBusy || snapButton.disabled) return;
  if (!video.srcObject || !hasUsableVideo()) {
    exitPhotobooth('Camera was interrupted. Select Start Photobooth to retry.');
    return;
  }
  sessionBusy = true;
  snapButton.disabled = true;
  document.getElementById('snap-label').textContent = 'Snapping…';
  takePhotosSequentially(rowCount);
});

frameButtons.forEach(button => {
  button.addEventListener('click', () => {
    let frameName = button.getAttribute('data-frame');
    applyFrame(frameName);
  })
})

document.getElementById('more').addEventListener('click', restartPhotobooth);
document.getElementById('cancel')?.addEventListener('click', () => exitPhotobooth());
window.addEventListener('pagehide', () => exitPhotobooth());

function saveEditedImage() {
  alert('Exporting full composite coming soon 👀');
}

async function restartPhotobooth() {
  if (sessionTransitioning) return;
  sessionTransitioning = true;
  resetPhotoboothState();
  const generation = captureGeneration;
  setCameraStatus('edit-camera-status', '');
  try {
    const ready = await startCamera();
    if (generation !== captureGeneration) return;
    if (!ready) {
      setCameraStatus('edit-camera-status', 'Camera unavailable. Check permissions or connect a camera, then try again.');
      return;
    }
    document.getElementById('edit-screen').style.display = 'none';
    boothScreen.style.display = 'block';
    addPlaceholderImages();
    snapButton.disabled = false;
    document.getElementById('capture-heading')?.focus();
  } finally {
    if (generation === captureGeneration) sessionTransitioning = false;
  }
}

function resetPhotoboothState() {
  cancelCountdown();
  captureGeneration++;
  frameRequest++;
  pendingImageLoads.forEach(cancel => cancel());
  sessionBusy = false;
  setExportEnabled(false);
  imageCount = 0;
  imageURLs = [];
  latestImageDataURL = '';
  finalStrip = '';
  finalCanvas = null;
  previewImages = [];
  previewStrip.innerHTML = '';
  const progress = document.getElementById('capture-progress');
  if (progress) progress.textContent = '0 captured';
  const snapLabel = document.getElementById('snap-label');
  if (snapLabel) snapLabel.textContent = 'Take 4 photos';
  document.getElementById('strip-preview').innerHTML = '';
  updateFrameThumbnails('assets/design/logo-minimal.png');
  const countdown = document.getElementById('countdown');
  countdown.textContent = '';
  countdown.style.display = 'none';
  const photoLabel = document.getElementById('countdown-photo');
  if (photoLabel) photoLabel.hidden = true;
  snapButton.disabled = true;
}

function exitPhotobooth(message = '') {
  stopCamera();
  resetPhotoboothState();
  sessionTransitioning = false;
  boothScreen.style.display = 'none';
  document.getElementById('edit-screen').style.display = 'none';
  homeScreen.style.display = 'block';
  setCameraStatus('edit-camera-status', '');
  setCameraStatus('camera-status', message);
  document.getElementById('home-heading')?.focus();
}

function setExportEnabled(enabled) {
  downloadButton.disabled = !enabled;
  shareButton.disabled = !enabled;
}

function setCameraStatus(elementId, message) {
  const status = document.getElementById(elementId);
  if (status) status.textContent = message;
}
