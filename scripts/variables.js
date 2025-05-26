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

let latestImageDataURL = '';
let finalStrip = '';
let finalCanvas = '';
let columnCount = 1
let rowCount = 4
let previewImages = [];

let imageCount = 0;
let imageURLs = [];