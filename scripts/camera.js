async function startCamera() {
  const constraints = {
    video: {
      width: { ideal: 600 },
      height: { ideal: 450 }, // 3:4 aspect ratio
      facingMode: 'user'
    },
    audio: false
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
  } catch (err) {
    console.error('Error accessing camera:', err);
    alert('Unable to access camera. Please allow camera permissions.');
  }
}

function stopCamera() {
  const stream = video.srcObject;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}
