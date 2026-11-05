import globals from 'globals';
import js from '@eslint/js';

const browserAppGlobalNames = [
  'StickerGeometry', 'StickerHistory', 'StickerGestures', 'StickerEditor',
  'requestComposition', 'isCompositionCurrent', 'isNativeSharePending',
  'finishStrip', 'backToCustomizing', 'cancelExportPreparation', 'cancelTransientWork',
  'isFinishPending', 'isDownloadPending',
  'Settings', 'navigateTo', 'GalleryStore', 'Gallery', 'exportIdentity', 'preparePNG', 'encodePNG', 'sharePreparedPNG', 'startPhotobooth',
  'session', 'ui', 'operations', 'rowCount', 'previewImages',
  'startButton', 'homeScreen', 'boothScreen', 'snapButton', 'previewStrip',
  'video', 'wrapper', 'downloadButton', 'shareButton', 'frameButtons',
  'composePhotoStrip', 'composeFrame', 'noneFooterFont', 'updateFrameSelection', 'exitPhotobooth',
  'hasUsableVideo', 'loadSessionImage', 'setCameraStatus', 'setExportEnabled',
  'addPlaceholderImages', 'applyFrame', 'cancelCountdown', 'generatePhotoStrip',
  'goToEditScreen', 'restartPhotobooth', 'showFinalStrip', 'startCamera',
  'startCountdown', 'stopCamera', 'takePhotosSequentially', 'updatePreview',
  'updateFrameThumbnails', 'capturePhoto', 'enterReview', 'commitCapturedPhoto',
  'renderSession', 'focusDestination',
];
const browserAppGlobals = Object.fromEntries(
  browserAppGlobalNames.map(name => [name, name === 'previewImages' ? 'writable' : 'readonly']),
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
    files: ['test/*.test.js', 'tools/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      globals: globals.node,
    },
  },
];
