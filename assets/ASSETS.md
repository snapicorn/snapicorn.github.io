# Design assets

The active artwork is used by the static site and its photostrip compositor. The explicit runtime inventory is in [tools/static-package.js](../tools/static-package.js). Source artwork and documentation are excluded from the generated site package.

## Artwork and sources

| Files | Source | Use |
| --- | --- | --- |
| `design/logo-minimal.png` | Owner-attested ChatGPT artwork from the 22 October 2026 handoff | Interface, favicon, frame choices and both strip footers |
| `design/sprite-unicorn-1.png` through `sprite-unicorn-4.png` | Same handoff | Decorative Home sample; never camera data |
| `design/magic-home-backdrop.png`, `magic-editor-backdrop.png`, `magic-gallery-empty.png` | Same handoff | Interface backgrounds and empty Gallery illustration |
| `stickers/sticker-pixel-{star,rainbow,unicorn,heart}.png` | Same handoff | Sticker tray and finished strips |
| `design/camera.svg`, `design/brand-sparkle.svg` | Phosphor React 2.1.10, regular Camera and filled Sparkle paths | Camera controls and header |
| `fonts/fraunces-latin-600.woff2` | Fontsource 5.3.0 | Headings and wordmark |
| `fonts/dm-sans-latin-{400,500,600}.woff2` | Fontsource 5.3.0 | Body text and controls |
| `frames/purple.svg`, `frames/purple.png` | Independently authored AI-assisted vector artwork, locally rasterized | Editable source and runtime Pastel Purple paper |
| `imgs/placeholder-white.png` | Independent procedural PNG | Pending capture slots |

Keep the complete [Fraunces OFL](licenses/fraunces-OFL.txt), [DM Sans OFL](licenses/dm-sans-OFL.txt), and [Phosphor MIT](licenses/phosphor-MIT.txt) notices with their runtime files. No font or icon package is required at runtime. The prior source audit matched the Phosphor notice to the React package, copyright 2020 Phosphor Icons.

## Composition

Both frames use the existing minimalist logo and wordmark. Purple uses lavender paper, a continuous border and compositor-drawn sparkle accents. The compositor fills the gaps between photos using the same frame gradient. The current Purple PNG is 700 × 2090 RGBA; keep its transparent photo-safe areas when editing the [SVG](frames/purple.svg).

Backdrops, editing handles, zoom decoration and Gallery empty artwork stay in the DOM/CSS. Export draws photos, optional Purple paper, footer branding, then ordered stickers. Photos and the logo use normal smoothing; only sticker draws disable smoothing inside save/restore. Preview and export share the same composed result.

Rebuild the white placeholder with `node tools/generate-placeholder.js`. It writes opaque white pixels at 1214 × 1093 from constants without reading an existing PNG. Expected SHA-256: `130c63e29191d3a09961b3544b29e7f02fd56e17559b6878bc827c6449bbf2f0`.

Current artwork identities are also checked in [composition tests](../test/composition.test.js). See [browser pixel verification](../docs/verification.md) before changing approved artwork or composition.

## Provenance and historical files

The owner declared on 4 November 2026 that the 12 handoff PNGs were generated using the owner's own ChatGPT account, with ChatGPT-generated references and no external third-party artwork supplied for those chains. The prior handoff audit recorded matching bytes and prompt/revision notes; independent service job records were unavailable. See [provenance evidence and limitations](../docs/artwork-provenance.md).

Unused legacy artwork, eight unused stickers, rejected alternatives and comparison renders have been removed from the maintained tree. The active SVG and placeholder generator are retained. Earlier source files and detailed PRO task reports remain recoverable from Git at cleanup baseline `de170d5`; this cleanup does not remove existing repository history or hosted copies.

Use ignored `proposals/` for disposable review renders. Keep approved editable source and lasting provenance here instead of committing generated comparisons or whole-tree hash snapshots.
