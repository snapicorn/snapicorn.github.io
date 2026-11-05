import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

// Independently create the active placeholder's decoded appearance. This writes
// fresh PNG chunks and scanlines; it never reads or copies the source PNG.
const width = 1214;
const height = 1093;
const rgba = Buffer.from([255, 255, 255, 255]);
const scanline = Buffer.alloc(1 + width * 4, 255);
scanline[0] = 0; // PNG filter: None
const rawPixels = Buffer.alloc(scanline.length * height);
for (let y = 0; y < height; y += 1) scanline.copy(rawPixels, y * scanline.length);

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const result = Buffer.alloc(12 + data.length);
  result.writeUInt32BE(data.length, 0);
  typeBytes.copy(result, 4);
  data.copy(result, 8);
  result.writeUInt32BE(crc32(result.subarray(4, 8 + data.length)), 8 + data.length);
  return result;
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // color type: RGBA
const gamma = Buffer.alloc(4);
gamma.writeUInt32BE(45455, 0);
const physicalResolution = Buffer.alloc(9);
physicalResolution.writeUInt32BE(3779, 0);
physicalResolution.writeUInt32BE(3779, 4);
physicalResolution[8] = 1; // pixels per metre
const output = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('sRGB', Buffer.from([0])),
  chunk('gAMA', gamma),
  chunk('pHYs', physicalResolution),
  chunk('IDAT', deflateSync(rawPixels)),
  chunk('IEND', Buffer.alloc(0)),
]);

if (!rgba.equals(Buffer.from([255, 255, 255, 255]))) throw new Error('Unexpected pixel definition');
writeFileSync(new URL('../assets/imgs/placeholder-white.png', import.meta.url), output);
