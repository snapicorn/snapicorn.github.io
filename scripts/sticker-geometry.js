// Transforms use a square asset box, normalized to the actual composition.
const StickerGeometry = (() => {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;

  function dimensions(geometry) {
    if (!geometry || ![geometry.width, geometry.height].every(value => Number.isFinite(value) && value > 0)) {
      throw new Error('Output dimensions are required.');
    }
    return { width: 700, height: Math.round(600 * geometry.height / geometry.width) * 4 + 290 };
  }

  function extent(size, rotation, output) {
    const radians = rotation * Math.PI / 180;
    const half = size * output.width * (Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians))) / 2;
    return { x: half / output.width, y: half / output.height };
  }

  function constrain(sticker, output) {
    const rotation = clamp(finite(sticker.rotation, 0), -180, 180);
    const radians = rotation * Math.PI / 180;
    const span = Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians));
    const size = Math.min(clamp(finite(sticker.size, 0.22), 0.08, 0.45),
      Math.min(output.width, output.height) / (output.width * span));
    const half = extent(size, rotation, output);
    return { ...sticker, size, rotation,
      x: clamp(finite(sticker.x, 0.5), half.x, 1 - half.x),
      y: clamp(finite(sticker.y, 0.5), half.y, 1 - half.y) };
  }

  function equal(first, second) {
    return first.length === second.length && first.every((sticker, index) =>
      ['id', 'key', 'x', 'y', 'size', 'rotation'].every(key => sticker[key] === second[index][key]));
  }
  return { clamp, dimensions, extent, constrain, equal };
})();
