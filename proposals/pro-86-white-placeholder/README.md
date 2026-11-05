# PRO-86 white placeholder replacement proposal

Candidate: `placeholder-white-independent.png` in this directory. It is separate from production assets, and no production reference was changed.

## Independent generation

Run `node proposals/pro-86-white-placeholder/generate.mjs`. The script creates fresh PNG chunks and unfiltered RGBA scanlines from the documented constant `(255, 255, 255, 255)`, dimensions 1214×1093, and standard sRGB/gamma/physical-resolution metadata. It does not read the current PNG. This makes the provenance of the candidate the local programmatic procedure and this repository change, not the existing asset.

## Findings

- Existing source: 1214×1093, 8-bit RGBA, 7,645 bytes; decoded pixels are uniformly opaque white. PNG chunks: IHDR, sRGB rendering intent 0, gAMA 45455, pHYs 3779×3779 pixels/metre, IDAT, IEND. No text or authorship metadata.
- Candidate: same dimensions, mode, standard metadata values, and expected opaque-white pixels. Hash and full pixel comparison are recorded in the PRO-86 task update.
- Alpha is 255 everywhere in both files; no transparency semantics are present. Rendering uses the decoded image as an ordinary `<img>` source in the Capture pending-slot path. The image's pixels and metadata do not control application logic.
- Existing `test/placeholder.test.js` invokes the production `addPlaceholderImages()` assignment and checks the resulting image URLs at `/` and `/snapicorn/`. For candidate validation, the same production function is served the candidate bytes under that exact path at both mounts; no production URL or asset is modified.

## Decision required

This is a proposal only. Production integration requires the owner's separate approval to replace `assets/imgs/placeholder-white.png` with this exact candidate SHA-256, with no other behavior or package change implied.
