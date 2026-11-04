let cameraStartPromise = null;
let cameraStartGeneration = 0;
let cancelVideoReadiness = null;

async function startCamera() {
  if (cameraStartPromise) return cameraStartPromise;

  stopCamera();
  const generation = ++cameraStartGeneration;
  const startPromise = initializeCamera(generation);
  cameraStartPromise = startPromise;

  try {
    return await startPromise;
  } finally {
    if (cameraStartPromise === startPromise) cameraStartPromise = null;
  }
}

async function initializeCamera(generation) {
  const constraints = {
    video: {
      width: { ideal: 600 },
      height: { ideal: 450 }, // 3:4 aspect ratio
      facingMode: 'user'
    },
    audio: false
  };

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    if (generation !== cameraStartGeneration) {
      stopStream(stream);
      return false;
    }

    video.srcObject = stream;
    await video.play();
    if (generation !== cameraStartGeneration || video.srcObject !== stream) {
      if (video.srcObject === stream) {
        stopStream(stream);
        video.srcObject = null;
      }
      return false;
    }
    await waitForVideoReadiness();
    if (generation !== cameraStartGeneration || video.srcObject !== stream) {
      stopStream(stream);
      return false;
    }

    return true;
  } catch (error) {
    if (stream && video.srcObject === stream) {
      stopStream(stream);
      video.srcObject = null;
    }
    console.error('Error accessing camera:', error);
    return false;
  }
}

function waitForVideoReadiness() {
  if (hasUsableVideo()) return Promise.resolve();

  return new Promise((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(() => finish(new Error('Camera video did not become ready in time.')), 8000);
    const onReady = () => {
      if (hasUsableVideo()) finish();
    };
    const onError = () => finish(new Error('Camera video could not be played.'));

    function finish(error) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      video.removeEventListener('loadedmetadata', onReady);
      video.removeEventListener('canplay', onReady);
      video.removeEventListener('error', onError);
      cancelVideoReadiness = null;
      if (error) reject(error);
      else resolve();
    }

    video.addEventListener('loadedmetadata', onReady);
    video.addEventListener('canplay', onReady);
    video.addEventListener('error', onError);
    cancelVideoReadiness = () => finish(new Error('Camera startup was cancelled.'));
    onReady();
  });
}

function hasUsableVideo() {
  return video.videoWidth > 0 && video.videoHeight > 0;
}

function stopStream(stream) {
  if (stream) stream.getTracks().forEach(track => track.stop());
}

function stopCamera() {
  // A cancelled permission/play request must not block a fresh session.
  cameraStartPromise = null;
  if (cancelVideoReadiness) cancelVideoReadiness();
  cameraStartGeneration++;
  const stream = video.srcObject;
  if (stream) {
    stopStream(stream);
    video.srcObject = null;
  }
}
