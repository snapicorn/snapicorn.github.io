import globals from 'globals';
import js from '@eslint/js';

const browserAppGlobalNames = [
  'composePhotoStrip',
  'composeFrame',
  'updateFrameSelection',
  'frameRequest',
  'exitPhotobooth',
  'hasUsableVideo',
  'loadSessionImage',
  'pendingImageLoads',
  'sessionBusy',
  'setCameraStatus',
  'setExportEnabled',
  'addPlaceholderImages',
  'applyFilter',
  'applyFrame',
  'boothScreen',
  'captureGeneration',
  'cancelCountdown',
  'countdownTimer',
  'finalCanvas',
  'finalStrip',
  'frameButtons',
  'generatePhotoStrip',
  'goToEditScreen',
  'homeScreen',
  'imageCount',
  'imageURLs',
  'latestImageDataURL',
  'previewImages',
  'previewStrip',
  'restartPhotobooth',
  'rowCount',
  'shareButton',
  'sessionTransitioning',
  'showFinalStrip',
  'snapButton',
  'startButton',
  'startCamera',
  'startCountdown',
  'stopCamera',
  'takePhotosSequentially',
  'updatePreview',
  'updateFrameThumbnails',
  'video',
  'wrapper',
  'downloadButton',
];

const mutableAppGlobals = new Set([
  'frameRequest',
  'sessionBusy',
  'finalCanvas',
  'finalStrip',
  'imageCount',
  'imageURLs',
  'latestImageDataURL',
  'previewImages',
  'captureGeneration',
  'countdownTimer',
  'sessionTransitioning',
]);

const browserAppGlobals = Object.fromEntries(
  browserAppGlobalNames.map(name => [name, mutableAppGlobals.has(name) ? 'writable' : 'readonly']),
);
const browserGlobalsForApp = { ...globals.browser };

// A few app globals share names with browser-provided globals. They are
// declared by the app itself, so remove those built-ins for script linting.
for (const name of browserAppGlobalNames) {
  delete browserGlobalsForApp[name];
}

export default [
  {
    ignores: ['node_modules/**'],
  },
  {
    files: ['scripts/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...browserGlobalsForApp,
        ...browserAppGlobals,
      },
    },
    // These classic scripts share globals through index.html load order, so
    // ESLint's per-file unused-variable check mistakes cross-file use for dead code.
    rules: {
      ...js.configs.recommended.rules,
      // The app globals are declared by one classic script and configured for
      // sibling scripts; the redeclare rule cannot distinguish those roles.
      'no-redeclare': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['test/*.test.js'],
    ...js.configs.recommended,
    languageOptions: {
      globals: globals.node,
    },
  },
];
