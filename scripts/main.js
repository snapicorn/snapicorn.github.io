startButton.addEventListener('click', startPhotobooth);
snapButton.addEventListener('click', beginCapture);
frameButtons.forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.checked) applyFrame(radio.value);
  });
});
document.getElementById('enable-camera').addEventListener('click', enableCamera);
document.getElementById('retake-enable').addEventListener('click', enableCamera);
document.getElementById('customize').addEventListener('click', goToEditScreen);
document.getElementById('back-to-review').addEventListener('click', enterReview);
document.getElementById('more').addEventListener('click', restartPhotobooth);
document.getElementById('finish-strip').addEventListener('click', finishStrip);
document.getElementById('back-to-customizing').addEventListener('click', backToCustomizing);
document.getElementById('export-more').addEventListener('click', restartPhotobooth);
document.getElementById('cancel').addEventListener('click', () => navigateTo('home'));
document.getElementById('take-replacement').addEventListener('click', takeReplacement);
document.getElementById('accept-replacement').addEventListener('click', acceptRetake);
for (const id of ['retake-cancel', 'retake-close']) {
  document.getElementById(id).addEventListener('click', () => cancelRetake());
}
for (const id of ['keep-strip', 'restart-close']) {
  document.getElementById(id).addEventListener('click', () => closeRestart());
}
document.getElementById('new-strip').addEventListener('click', confirmRestart);
document.querySelectorAll('[data-destination]').forEach(button => {
  button.addEventListener('click', () => navigateTo(button.getAttribute('data-destination')));
});
document.getElementById('menu-toggle').addEventListener('click', () => {
  ui.menuOpen = !ui.menuOpen;
  renderNavigation();
});
for (const id of ['site-nav', 'menu-toggle']) {
  document.getElementById(id).addEventListener('keydown', event => {
    if (event.key === 'Escape' && ui.menuOpen) {
      ui.menuOpen = false;
      renderNavigation();
      document.getElementById('menu-toggle').focus();
    }
  });
}
// Native modal dialogs make the background inert; wrap boundary Tab presses explicitly.
for (const [id, dismiss] of [['retake-dialog', cancelRetake], ['restart-dialog', closeRestart]]) {
  const dialog = document.getElementById(id);
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const buttons = [...dialog.querySelectorAll('button:not([disabled]):not([hidden])')];
    const first = buttons[0];
    const last = buttons.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog.addEventListener('close', () => {
    if (id === 'retake-dialog' && !dialog.open && ui.retake) cancelRetake();
  });
  let backdropPressed = false;
  const outside = event => {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom;
  };
  dialog.addEventListener('pointerdown', event => { backdropPressed = event.target === dialog && outside(event); });
  dialog.addEventListener('click', event => {
    if (backdropPressed && event.target === dialog && outside(event)) dismiss();
    backdropPressed = false;
  });
}
window.addEventListener('pagehide', () => exitPhotobooth());
StickerEditor.initialize();
Gallery.initialize();
renderSession();

function hasCompletedPhotos() {
  return session.photos.length === rowCount;
}

function startPhotobooth() {
  if (hasCompletedPhotos()) restartPhotobooth();
  else navigateTo('booth');
}

function renderNavigation() {
  document.getElementById('menu-toggle').setAttribute('aria-expanded', String(ui.menuOpen));
  document.getElementById('site-nav').setAttribute('data-open', String(ui.menuOpen));
  document.querySelectorAll('[data-destination]').forEach(button => {
    if (button.getAttribute('data-destination') === ui.destination) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
}

function renderSession() {
  const inBooth = ui.destination === 'booth';
  const reviewing = hasCompletedPhotos() && ui.phase === 'review';
  homeScreen.style.display = ui.destination === 'home' ? 'block' : 'none';
  boothScreen.style.display = inBooth && !hasCompletedPhotos() ? 'block' : 'none';
  document.getElementById('review-screen').style.display = inBooth && reviewing ? 'block' : 'none';
  document.getElementById('edit-screen').style.display = inBooth && ui.phase === 'customize' ? 'block' : 'none';
  document.getElementById('export-screen').style.display = inBooth && ui.phase === 'export' ? 'block' : 'none';
  document.getElementById('about-screen').style.display = ui.destination === 'about' ? 'block' : 'none';
  document.getElementById('gallery-screen').style.display = ui.destination === 'gallery' ? 'block' : 'none';
  const phase = ui.retake ? ui.retake.phase : ui.phase;
  const ready = phase === 'ready';
  const opening = phase === 'opening';
  const candidate = phase === 'candidate';
  document.getElementById('camera').hidden = !['ready', 'capturing'].includes(phase);
  video.setAttribute('aria-label', ui.retake ? 'Live replacement camera preview' : 'Live front-camera preview');
  document.getElementById('camera-placeholder').hidden = !['camera-off', 'opening'].includes(phase);
  document.getElementById('camera-label').textContent = ['ready', 'capturing'].includes(phase) ? 'LIVE · NO AUDIO' : 'CAMERA OFF';
  document.getElementById('enable-camera').hidden = !['camera-off', 'opening'].includes(phase);
  document.getElementById('enable-camera').disabled = opening;
  document.getElementById('enable-camera').textContent = opening ? 'Opening camera…' : 'Enable camera';
  snapButton.hidden = ['camera-off', 'opening'].includes(phase);
  snapButton.disabled = !ready || operations.busy;
  document.getElementById('snap-label').textContent = phase === 'capturing' ? 'Snapping…' : 'Take 4 photos';
  document.getElementById('customize').disabled = operations.busy;
  if (ui.retake) {
    document.getElementById('camera-wrapper').hidden = ['candidate-loading', 'candidate'].includes(phase);
    document.getElementById('retake-enable').hidden = !['camera-off', 'opening'].includes(phase);
    document.getElementById('retake-enable').disabled = opening;
    document.getElementById('retake-enable').textContent = opening ? 'Opening camera…' : 'Enable camera';
    document.getElementById('take-replacement').hidden = !['ready', 'capturing'].includes(phase);
    document.getElementById('take-replacement').disabled = !ready;
    document.getElementById('accept-replacement').hidden = !candidate;
    document.getElementById('accept-replacement').disabled = !candidate;
    document.getElementById('retake-candidate').hidden = !candidate;
  }
  setExportEnabled(!operations.busy && isCompositionCurrent());
  renderNavigation();
}

function focusDestination() {
  let heading = 'capture-heading';
  if (ui.destination === 'home') heading = 'home-heading';
  else if (ui.destination === 'about') heading = 'about-heading';
  else if (ui.destination === 'gallery') heading = 'gallery-heading';
  else if (ui.phase === 'review') heading = 'review-heading';
  else if (ui.phase === 'customize') heading = 'edit-heading';
  else if (ui.phase === 'export') heading = 'export-heading';
  document.getElementById(heading).focus();
}

function cancelTransientWork() {
  // Navigation cancels operations without discarding committed photos or pixels.
  operations.generation++;
  operations.renderRequest++;
  cancelExportPreparation();
  StickerEditor.cancel(false);
  // A canceled pending edit stays invalid and is recomposed on return.
  if (operations.compositionStatus === 'pending') operations.compositionStatus = 'idle';
  cancelCountdown();
  stopCamera();
  operations.pendingImageLoads.forEach(cancel => cancel());
  operations.busy = false;
  document.getElementById('countdown').style.display = 'none';
  document.getElementById('countdown').textContent = '';
  document.getElementById('countdown-photo').hidden = true;
  setCameraStatus('countdown-status', '');
  updateFrameSelection(session.frame);
}

function navigateTo(destination) {
  if (!['home', 'booth', 'gallery', 'about'].includes(destination)) return;
  if (destination === ui.destination && !ui.retake) {
    ui.menuOpen = false;
    renderNavigation();
    focusDestination();
    return;
  }
  if (ui.destination === 'gallery') Gallery.leave();
  cancelRetake(false);
  closeRestart(false);
  if (hasCompletedPhotos()) cancelTransientWork();
  else resetPhotoboothState();
  ui.destination = destination;
  ui.menuOpen = false;
  setCameraStatus('booth-camera-status', '');
  setCameraStatus('edit-camera-status', '');
  setCameraStatus('review-status', '');
  renderSession();
  focusDestination();
  if (destination === 'booth' && ui.phase === 'customize' && !isCompositionCurrent()) requestComposition();
  if (destination === 'gallery') Gallery.enter();
}

async function enableCamera() {
  const retake = ui.retake;
  if (ui.destination !== 'booth' || (retake ? retake.phase : ui.phase) !== 'camera-off') return;
  const generation = operations.generation;
  if (retake) retake.phase = 'opening';
  else ui.phase = 'opening';
  const status = retake ? 'retake-status' : 'booth-camera-status';
  setCameraStatus(status, '');
  renderSession();
  const ready = await startCamera();
  if (generation !== operations.generation || retake !== ui.retake) return;
  const phase = ready ? 'ready' : 'camera-off';
  if (retake) retake.phase = phase;
  else ui.phase = phase;
  if (!ready) setCameraStatus(status, 'Camera unavailable. Check permissions or connect a camera, then Enable camera to retry.');
  renderSession();
  const focusTarget = retake ? (ready ? 'take-replacement' : 'retake-enable')
    : (ready ? 'snap' : 'enable-camera');
  document.getElementById(focusTarget).focus();
}

function beginCapture() {
  if (ui.destination !== 'booth' || ui.phase !== 'ready' || ui.retake || operations.busy) return;
  ui.phase = 'capturing';
  operations.busy = true;
  document.getElementById('cancel').focus();
  renderSession();
  takePhotosSequentially(rowCount);
}

function commitCapturedPhoto(photo) {
  if (ui.phase !== 'capturing' || session.photos.length >= rowCount) return;
  if (!session.geometry) session.geometry = { width: photo.width, height: photo.height };
  session.photos.push(photo);
  updatePreview(photo.source, session.photos.length - 1);
}

function enterReview() {
  if (!hasCompletedPhotos() || ui.retake) return;
  cancelTransientWork();
  ui.phase = 'review';
  renderReviewPhotos();
  renderSession();
  focusDestination();
}

function renderReviewPhotos() {
  const grid = document.getElementById('review-grid');
  grid.innerHTML = '';
  session.photos.forEach((photo, slot) => {
    const card = document.createElement('article');
    card.className = 'review-photo';
    const image = document.createElement('img');
    image.src = photo.source;
    image.alt = `Photo ${slot + 1} for your strip`;
    const actions = document.createElement('div');
    const label = document.createElement('strong');
    label.textContent = `Photo ${slot + 1}`;
    const button = document.createElement('button');
    button.className = 'text-button';
    button.textContent = `Retake photo ${slot + 1}`;
    button.addEventListener('click', () => openRetake(slot, button));
    actions.appendChild(label);
    actions.appendChild(button);
    card.appendChild(image);
    card.appendChild(actions);
    grid.appendChild(card);
  });
}

function openRetake(slot, invoker = document.activeElement) {
  if (ui.destination !== 'booth' || ui.phase !== 'review' || operations.busy || ui.retake ||
      !Number.isInteger(slot) || !session.photos[slot]) return;
  cancelTransientWork();
  ui.retake = { slot, candidate: null, phase: 'camera-off' };
  ui.dialogInvoker = invoker;
  document.getElementById('retake-heading').textContent = `Retake photo ${slot + 1}`;
  const original = document.getElementById('retake-original');
  original.src = session.photos[slot].source;
  original.alt = `Original photo ${slot + 1}`;
  document.getElementById('retake-camera-host').appendChild(document.getElementById('camera-wrapper'));
  setCameraStatus('retake-status', '');
  renderSession();
  document.getElementById('retake-dialog').showModal();
  document.getElementById('retake-cancel').focus();
}

async function stageRetakeCandidate(photo, generation) {
  const retake = ui.retake;
  if (!retake || generation !== operations.generation) return;
  stopCamera();
  retake.phase = 'candidate-loading';
  renderSession();
  try {
    await loadSessionImage(photo.source, generation, document.getElementById('retake-candidate'));
    if (generation !== operations.generation || retake !== ui.retake) return;
    retake.candidate = photo;
    retake.phase = 'candidate';
    operations.busy = false;
    renderSession();
    document.getElementById('accept-replacement').focus();
  } catch {
    if (generation === operations.generation && retake === ui.retake) failRetake();
  }
}

function takeReplacement() {
  if (!ui.retake || ui.retake.phase !== 'ready' || operations.busy) return;
  const generation = operations.generation;
  ui.retake.phase = 'capturing';
  operations.busy = true;
  document.getElementById('retake-cancel').focus();
  renderSession();
  startCountdown(() => {
    if (generation !== operations.generation) return;
    try { stageRetakeCandidate(capturePhoto(), generation); }
    catch { failRetake(); }
  }, ui.retake.slot);
}

function cancelRetake(restoreFocus = true) {
  if (!ui.retake) return;
  const invoker = ui.dialogInvoker;
  cancelTransientWork();
  ui.retake = null;
  ui.dialogInvoker = null;
  document.getElementById('retake-dialog').close();
  document.getElementById('retake-original').removeAttribute('src');
  document.getElementById('retake-candidate').removeAttribute('src');
  document.getElementById('camera-wrapper').hidden = false;
  document.querySelector('.camera-panel').prepend(document.getElementById('camera-wrapper'));
  renderSession();
  if (restoreFocus && invoker?.isConnected) invoker.focus();
}

function failRetake() {
  cancelRetake();
  setCameraStatus('review-status', 'Could not retake that photo. Your originals are safe. Select Retake to retry.');
}

function acceptRetake() {
  const retake = ui.retake;
  if (!retake || retake.phase !== 'candidate' || !retake.candidate) return;
  session.photos = session.photos.map((photo, slot) => slot === retake.slot ? retake.candidate : photo);
  session.revision++;
  // Pixels become invalid only after acceptance, never while comparing a candidate.
  session.output = { base: '', canvas: null };
  updatePreview(retake.candidate.source, retake.slot);
  cancelRetake(false);
  renderReviewPhotos();
  renderSession();
  document.getElementById('review-grid').children[retake.slot].children[1].children[1].focus();
  setCameraStatus('review-status', `Photo ${retake.slot + 1} replaced. Your other photos are unchanged.`);
}

function restartPhotobooth() {
  if (!hasCompletedPhotos()) { confirmRestart(); return; }
  if (document.getElementById('restart-dialog').open) return;
  ui.dialogInvoker = document.activeElement;
  document.getElementById('restart-dialog').showModal();
  document.getElementById('keep-strip').focus();
}

function closeRestart(restoreFocus = true) {
  const dialog = document.getElementById('restart-dialog');
  if (!dialog.open) return;
  const invoker = ui.dialogInvoker;
  ui.dialogInvoker = null;
  dialog.close();
  if (restoreFocus && invoker?.isConnected) invoker.focus();
}

function confirmRestart() {
  if (hasCompletedPhotos() && !document.getElementById('restart-dialog').open) return;
  if (ui.destination === 'gallery') Gallery.leave();
  closeRestart(false);
  cancelRetake(false);
  resetPhotoboothState();
  ui.destination = 'booth';
  renderSession();
  focusDestination();
}

function resetPhotoboothState() {
  cancelTransientWork();
  session.id++;
  session.photos = [];
  session.geometry = null;
  session.frame = 'none';
  session.stickerHistory = StickerHistory.create();
  session.revision++;
  operations.compositionStatus = 'idle';
  ui.selectedSticker = null;
  StickerEditor.tool('frame');
  StickerEditor.zoom(100);
  StickerEditor.render();
  session.output = { base: '', canvas: null };
  ui.phase = 'camera-off';
  previewImages = [];
  previewStrip.innerHTML = '';
  document.getElementById('review-grid').innerHTML = '';
  document.getElementById('strip-preview').innerHTML = '';
  document.getElementById('export-preview').innerHTML = '';
  setCameraStatus('export-status', '');
  addPlaceholderImages();
  updateFrameSelection('none');
  updateFrameThumbnails('assets/design/logo-minimal.png');
  setCameraStatus('review-status', '');
}

function exitPhotobooth(message = '') {
  cancelRetake(false);
  closeRestart(false);
  resetPhotoboothState();
  ui.destination = 'home';
  renderSession();
  setCameraStatus('camera-status', message);
  focusDestination();
}

function setExportEnabled(enabled) {
  document.getElementById('finish-strip').disabled = !enabled || isFinishPending();
  downloadButton.disabled = !enabled || isDownloadPending();
  shareButton.disabled = !enabled || isNativeSharePending();
  Gallery.renderSave();
}

function setCameraStatus(elementId, message) {
  const status = document.getElementById(elementId);
  if (status) status.textContent = message;
}
