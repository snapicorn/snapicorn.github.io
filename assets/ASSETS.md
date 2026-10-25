# Design assets

PRO-72 and PRO-61 use the finalized Snapicorn design handoff dated 22 October 2026. Raster files were copied without image conversion, resizing or alpha changes. Only assets referenced by the current interface are included.

| Local file | Handoff source | Use |
| --- | --- | --- |
| `design/logo-minimal.png` | `public/assets/logo-minimal.png` | Interface brand and favicon only |
| `design/brand-sparkle.svg` | Filled Phosphor Sparkle path used by `src/App.jsx`, extracted from the prebuilt bundle | Purple sparkle after the wordmark |
| `design/camera.svg` | Regular Phosphor Camera path from the handoff's installed `@phosphor-icons/react/dist/defs/Camera.es.js` | Home and capture button icon; existing Phosphor MIT notice applies |
| `design/sprite-unicorn-1.png` | `public/assets/sprite-unicorn-1.png` | Decorative Home sample; never camera data |
| `design/sprite-unicorn-2.png` | `public/assets/sprite-unicorn-2.png` | Second decorative Home sample |
| `design/sprite-unicorn-3.png` | `public/assets/sprite-unicorn-3.png` | Third decorative Home sample |
| `design/sprite-unicorn-4.png` | `public/assets/sprite-unicorn-4.png` | Fourth decorative Home sample |
| `design/magic-home-backdrop.png` | `public/assets/magic-home-backdrop.png` | Static Home background |
| `design/magic-editor-backdrop.png` | `public/assets/magic-editor-backdrop.png` | Static editor background |
| `design/magic-gallery-empty.png` | `public/assets/magic-gallery-empty.png` | PRO-76 decorative empty Gallery illustration; never saved PNG pixels |
| `stickers/sticker-pixel-star.png` | `public/assets/sticker-pixel-star.png` | PRO-74 Star sticker |
| `stickers/sticker-pixel-rainbow.png` | `public/assets/sticker-pixel-rainbow.png` | PRO-74 Rainbow sticker |
| `stickers/sticker-pixel-unicorn.png` | `public/assets/sticker-pixel-unicorn.png` | PRO-74 Unicorn sticker |
| `stickers/sticker-pixel-heart.png` | `public/assets/sticker-pixel-heart.png` | PRO-74 Heart sticker |
| `fonts/fraunces-latin-600.woff2` | `dist/client/assets/fraunces-latin-600-normal-BFCDtZfi.woff2` | Headings and wordmark |
| `fonts/dm-sans-latin-400.woff2` | `dist/client/assets/dm-sans-latin-400-normal-CW0RaeGs.woff2` | Body text |
| `fonts/dm-sans-latin-500.woff2` | `dist/client/assets/dm-sans-latin-500-normal-B9HHJjqV.woff2` | Interface medium weight |
| `fonts/dm-sans-latin-600.woff2` | `dist/client/assets/dm-sans-latin-600-normal-Aqo67rzb.woff2` | Controls |

Fraunces and DM Sans are distributed under the SIL Open Font License; their complete notices are in [licenses/fraunces-OFL.txt](licenses/fraunces-OFL.txt) and [licenses/dm-sans-OFL.txt](licenses/dm-sans-OFL.txt). The Phosphor icon is covered by [licenses/phosphor-MIT.txt](licenses/phosphor-MIT.txt). No font or icon package is required at runtime.

The logo, backdrops, Gallery empty illustration, unicorn samples and four pixel stickers were generated with OpenAI ImageGen for the approved design. The samples are AI-generated illustrations, not camera photos. The handoff's `asset-notes.md` records the prompts and revisions. No third-party artwork license, trademark clearance or exclusivity is asserted for generated files.

The original `logos/logo_transparent.png` and `frames/purple.png` remain the export watermark and frame. Their ownership/license was not established in the handoff. The existing VintageCharm OTF is preserved but no longer loaded by the UI; its license was not established either. No new permission to redistribute these existing assets is claimed here.

Keep backdrops, selection handles, Gallery empty artwork and zoom decoration in the DOM/CSS. Export draws the existing photos, watermark, optional Purple frame, then ordered pixel stickers. Do not apply pixelated image rendering or disable canvas smoothing for camera photos or the logo. Sticker tray images use `image-rendering: pixelated`; canvas smoothing is disabled only inside each sticker draw's save/restore. PNGs are copied byte-for-byte from the approved handoff with alpha and source aspect preserved. Scaling/rotation can create transformed edges; integer-grid perfection at every angle is not asserted.
