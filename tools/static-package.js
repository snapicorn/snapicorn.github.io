import { constants, copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const outputRelativePath = 'dist/local-package';

// Deliberately enumerate files: adding a source file never adds it to the package.
export const packageFiles = Object.freeze([
  'index.html',
  'scripts/sticker-geometry.js',
  'scripts/sticker-history.js',
  'scripts/sticker-gestures.js',
  'scripts/variables.js',
  'scripts/camera.js',
  'scripts/snap.js',
  'scripts/composition.js',
  'scripts/preview.js',
  'scripts/composition-coordinator.js',
  'scripts/edit.js',
  'scripts/sticker-editor.js',
  'scripts/export.js',
  'scripts/gallery-store.js',
  'scripts/gallery.js',
  'scripts/settings.js',
  'scripts/main.js',
  'styles/foundation.css',
  'styles/style.css',
  'assets/fonts/fraunces-latin-600.woff2',
  'assets/fonts/dm-sans-latin-400.woff2',
  'assets/fonts/dm-sans-latin-500.woff2',
  'assets/fonts/dm-sans-latin-600.woff2',
  'assets/design/logo-minimal.png',
  'assets/design/brand-sparkle.svg',
  'assets/design/camera.svg',
  'assets/design/sprite-unicorn-1.png',
  'assets/design/sprite-unicorn-2.png',
  'assets/design/sprite-unicorn-3.png',
  'assets/design/sprite-unicorn-4.png',
  'assets/design/magic-home-backdrop.png',
  'assets/design/magic-editor-backdrop.png',
  'assets/design/magic-gallery-empty.png',
  'assets/stickers/sticker-pixel-star.png',
  'assets/stickers/sticker-pixel-rainbow.png',
  'assets/stickers/sticker-pixel-unicorn.png',
  'assets/stickers/sticker-pixel-heart.png',
  'assets/logos/logo_transparent.png',
  'assets/frames/purple.png',
  'assets/imgs/placeholder-white.png',
  'assets/licenses/fraunces-OFL.txt',
  'assets/licenses/dm-sans-OFL.txt',
  'assets/licenses/phosphor-MIT.txt',
]);

export const historicalExclusions = Object.freeze([
  'assets/frames/historical/purple-legacy.png',
  'assets/fonts/VintageCharm-Regular.otf',
  'assets/logos/logo_filled.png',
  'assets/logos/snapicorn.png',
  'assets/imgs/placeholder-black.png',
]);

export function validateRelativePath(filename) {
  if (typeof filename !== 'string' || !/^[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*$/.test(filename)
      || filename.split('/').some(part => part === '.' || part === '..')
      || path.posix.isAbsolute(filename) || path.win32.isAbsolute(filename)) {
    throw new Error(`Unsafe package path: ${filename}`);
  }
}

function inspectPath(root, relative, { missing = false } = {}) {
  let current = root;
  const parts = relative.split('/');
  for (const [index, part] of parts.entries()) {
    current = path.join(current, part);
    let stat;
    try {
      stat = lstatSync(current);
    } catch (error) {
      if (missing && error.code === 'ENOENT') return;
      throw error;
    }
    if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) {
      throw new Error(`Links and special files are forbidden: ${current}`);
    }
    if (index < parts.length - 1 && !stat.isDirectory()) {
      throw new Error(`Expected directory: ${current}`);
    }
    if (stat.isFile() && stat.nlink !== 1) throw new Error(`Hard links are forbidden: ${current}`);
  }
}

export function listPackageFiles(output) {
  const files = [];
  const directories = new Set(packageFiles.flatMap(filename => {
    const parts = filename.split('/');
    return parts.slice(0, -1).map((_, index) => parts.slice(0, index + 1).join('/'));
  }));
  function visit(relative = '') {
    const directory = path.join(output, relative);
    if (!lstatSync(directory).isDirectory() || lstatSync(directory).isSymbolicLink()) {
      throw new Error(`Expected real package directory: ${directory}`);
    }
    for (const name of readdirSync(directory).sort()) {
      const filename = relative ? `${relative}/${name}` : name;
      inspectPath(output, filename);
      if (lstatSync(path.join(output, filename)).isDirectory()) {
        if (!directories.has(filename)) throw new Error(`Unexpected package directory: ${filename}`);
        visit(filename);
      } else {
        if (!packageFiles.includes(filename)) throw new Error(`Unexpected package file: ${filename}`);
        files.push(filename);
      }
    }
  }
  visit();
  return files.sort();
}

export function buildPackage(repositoryRoot) {
  const root = realpathSync(repositoryRoot);
  const output = path.join(root, outputRelativePath);
  for (const filename of packageFiles) {
    validateRelativePath(filename);
    inspectPath(root, filename);
    if (!lstatSync(path.join(root, filename)).isFile()) throw new Error(`Expected file: ${filename}`);
  }
  // Preflight the entire destination before writing. Never clean or recursively delete.
  inspectPath(root, outputRelativePath, { missing: true });
  if (existsSync(output)) listPackageFiles(output);
  for (const filename of packageFiles) {
    inspectPath(root, `${outputRelativePath}/${filename}`, { missing: true });
    const target = path.join(output, filename);
    mkdirSync(path.dirname(target), { recursive: true });
    // No deletion: refresh only validated regular files at allowlisted destinations.
    copyFileSync(path.join(root, filename), target, existsSync(target) ? 0 : constants.COPYFILE_EXCL);
  }
  return output;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 2) throw new Error('No arguments accepted; output is fixed at dist/local-package.');
    const output = buildPackage(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
    console.log(`Local package: ${output} (${packageFiles.length} files; ${historicalExclusions.length} historical exclusions).`);
    console.log('NOT PUBLICATION-CLEARED: active artwork rights and PRO-64/PRO-78 acceptance remain unresolved.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
