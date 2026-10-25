// Elements
const startButton = document.getElementById('startButton');
const homeScreen = document.getElementById('home-screen');
const boothScreen = document.getElementById('booth-screen');
const snapButton = document.getElementById('snap');
const previewStrip = document.getElementById('preview-strip');
const video = document.getElementById('camera');
const wrapper = document.getElementById('preview-strip');
const downloadButton = document.getElementById('download');
const shareButton = document.getElementById('share');
const frameButtons = document.querySelectorAll('.frameButton');

const rowCount = 4;
// Durable only for this page lifetime. main.js owns photo commits and reset.
const session = {
  id: 0,
  photos: [], // Ordered { source, width, height } records; candidates never enter here.
  geometry: null, // Initial capture aspect, retained across mixed-aspect retakes.
  frame: 'none',
  stickerHistory: StickerHistory.create(),
  revision: 0,
  output: { base: '', canvas: null },
};
const ui = {
  destination: 'home',
  phase: 'camera-off',
  retake: null,
  menuOpen: false,
  dialogInvoker: null,
  selectedSticker: null,
  tool: 'frame',
  zoom: 100,
};
// Cancellation identity is independent of session identity and camera startup.
const operations = {
  generation: 0,
  countdownTimer: null,
  busy: false,
  renderRequest: 0,
  compositionStatus: 'idle',
  pendingImageLoads: new Set(),
};
let previewImages = [];
