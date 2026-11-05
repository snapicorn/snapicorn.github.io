# Purple frame proposals — PRO-86

Refined 31 October 2026 (Asia/Manila). **Unapproved, local review only. Neither candidate is integrated.** This refinement supersedes the earlier photo-coverage measurements and complete candidate-watermark-occlusion claims.

Open [review.html](review.html) for None / legacy / A / B at each aspect, native-size controls, 700 × 180 footer crops and transparency swatches. [contact-sheet.png](previews/contact-sheet.png) is a concise **1440 × 1360** A/B comparison across all three aspects. The six linked full-resolution candidate strips below are ready to upload to ChatGPT for owner visual review; the board is only a reduced overview.

| Aspect / full PNG size | A — Lavender Wishes | B — Cream Moonwalk |
| --- | --- | --- |
| 4:3 / 700 × 2090 | [A full PNG](previews/a-lavender-wishes-4x3.png) | [B full PNG](previews/b-cream-moonwalk-4x3.png) |
| 16:9 / 700 × 1642 | [A full PNG](previews/a-lavender-wishes-16x9.png) | [B full PNG](previews/b-cream-moonwalk-16x9.png) |
| 3:4 / 700 × 3490 | [A full PNG](previews/a-lavender-wishes-3x4.png) | [B full PNG](previews/b-cream-moonwalk-3x4.png) |

A retains lavender paper, cream beads, purple side threads and a geometric wish-horn. B retains cream paper, curved side stitches and a lavender moon-orbit capsule. Footer motifs are scaled uniformly to 65% about their centers and moved to y=2045 in source space, preserving their proportions before the existing compositor scales the entire frame.

## Investigation and refinement

The old shared mask ended photo 4's opening at source y=1942. Portrait scales that edge to y=1942×3490/2090 = 3242.86, while photo 4 occupies output [2540,3340). Sampling touches rows 3242–3339: **98 × 600 = 58,800 of 480,000 pixels, exactly 12.25%**. This is footer overlay coverage, not a photo crop. An independently reconstructed old binary mask reproduces it; see `previousCoverage` in [verification.json](verification.json). It also reproduces photo 3's separator overlap: 1,200 touched pixels (2 rows, 0.591716%) at 16:9 and 4,800 (8 rows, 1%) at 3:4.

Both revised SVG/PNG assets use one continuous clear corridor **x=[46,654), y=[28,2003)**. Photo bounds across the three outputs map into source y=[29.9427,2000.1719); the opening includes clearance for Canvas sampling. Side artwork stays outside x=[46,654), leaving 4px between the photo edge and paper. All horizontal artwork separators are removed; photo gaps show the unchanged white base. Existing side brackets remain decorative and do not define photo bounds. The opaque footer now starts at y=2003, below every supported photo region. Horn, swirls, capsule, moon and orbit fit within this footer safe area.

The unchanged production `composePhotoStrip()` / `composeFrame()` functions are read directly and embedded verbatim in the disposable renderer. Photo order, width 600, height `round(600*h/w)`, x=50, y=`50+i*(photoHeight+30)`, white base, padding 50, gap 30, watermark fit/position, normal smoothing, frame scaling and sticker-after-frame behavior are unchanged. No application source or production output baseline is edited.

## Measured photo visibility

Counts are taken from the scaled overlay alpha **inside each exact 600 × photoHeight rectangle**, including every boundary pixel. Any alpha above zero counts as touched; opaque count and alpha-sum / 255 are also recorded. The renderer fails if any candidate touches even one photo pixel.

| Candidate | Aspect / output | Photo 1 / 2 / 3 / 4 touched pixels | Clear pixels in each photo |
| --- | --- | --- | --- |
| A | 4:3 / 700 × 2090 | 0 / 0 / 0 / 0 | 270,000 / 270,000 (100%) |
| B | 4:3 / 700 × 2090 | 0 / 0 / 0 / 0 | 270,000 / 270,000 (100%) |
| A | 16:9 / 700 × 1642 | 0 / 0 / 0 / 0 | 202,800 / 202,800 (100%) |
| B | 16:9 / 700 × 1642 | 0 / 0 / 0 / 0 | 202,800 / 202,800 (100%) |
| A | 3:4 / 700 × 3490 | 0 / 0 / 0 / 0 | 480,000 / 480,000 (100%) |
| B | 3:4 / 700 × 3490 | 0 / 0 / 0 / 0 | 480,000 / 480,000 (100%) |

All 24 candidate photo regions are fully visible. Each source PNG remains **700 × 2090, 8-bit RGBA, PNG color type 6**, with 1,200,800 fully transparent pixels, 262,200 opaque pixels and zero partial-alpha source pixels. There is no baked checkerboard. Decoration edges inside opaque paper use antialiased RGB; full-canvas resizing can introduce partial alpha at corridor boundaries, safely outside the measured photos.

## Watermark behavior and remaining limitations

The production watermark still draws **before** the full-canvas frame. Original-logo versus transparent-dummy-logo controls measure its contribution to the final image:

| Frame | 4:3 differing pixels | 16:9 differing pixels | 3:4 differing pixels |
| --- | --- | --- | --- |
| None | 5,646 | 5,646 | 5,647 |
| Legacy Purple | 0 | 0 | 0 |
| Revised A | 1,461 | 3,133 | 0 |
| Revised B | 1,461 | 3,133 | 0 |

**Legacy Purple still completely hides the watermark. Revised A and B partially reveal and clip its top at 4:3 and 16:9; they fully hide it at 3:4.** The larger transparent corridor causes this proposal-artwork change; no layer order, watermark asset, placement, scaling or composition code was changed. These counts indicate final rendered contribution, not a percentage of source logo area. Native footer PNGs expose the actual clipped result. This visible trade-off requires owner review before integration; no complete-watermark-occlusion requirement is silently carried over from the old candidates.

A static vertically scaled source cannot retain the old full-width opaque footer while protecting portrait photo 4: that portrait region maps up to source y=2000.1719, overlapping the shorter outputs' watermark area. The chosen conservative artwork change protects every photo. Making the watermark fully visible or consistently concealed would require a separately approved design decision; this task does neither.

Only the three requested ratios with the existing 600px photo width are verified. Other aspect ratios, widths or browser sampling differences are not certified. Full-canvas nonuniform scaling still stretches the motifs in portrait and compresses them in landscape, as production already does. White separators are intentionally plain. Small footer details, reduced 65% motifs, clipped watermark and the revised visual baseline require owner review of native PNGs. No physical-device, real-photo, end-to-end download/share/Gallery or publication acceptance is claimed.

## Provenance

The geometry was independently authored as SVG code by Codex in this session and rasterized locally with Chrome Canvas. This is AI-assisted vector artwork, not a claim of human drawing. No ImageGen job, image prompt, stock artwork, imported illustration, font, character, traced path or external image reference was used to create either candidate. SVGs contain only original geometry, colors, a title and masks; no embedded third-party files. `build.mjs` is the editable construction record; the two SVGs also edit directly in a vector editor. The legacy frame and watermark are loaded solely for comparison composites and occlusion controls, never used to construct candidate geometry.

Design inputs were the user's brief, `assets/ASSETS.md`, current composition source, the approved 22 October handoff's `AGENTS.md`, `DESIGN-SYSTEM.md`, `IMPLEMENTATION-HANDOFF.md` and `QA-REPORT.md`, the Linear approved implementation roadmap, PRO-86 and its comments. Palette: purple `#7c49c6`, lavender `#eee4fc`, cream `#fffaf2`; secondary line color `#b99cde`. No legacy characters, bow, rainbow, decorative star or lettering was reproduced. This records the creation chain; it does not assert exclusivity, copyright enforceability or public-use authorization. Owner must confirm authority for raw artwork redistribution, adaptation and finished user PNG uses before integration/publication.

## Verification and preservation

- Final local Chrome render passed: twelve full strips and twelve footer crops decoded; all 24 candidate photo rectangles have zero touched/opaque/equivalent-opaque overlay pixels.
- SVG raster versus decoded saved candidate PNG: **zero differing RGBA channels** for both 700 × 2090 images. Exact SVG and PNG hashes are below.
- The all-aspect comparison board and all six native footer crops were visually inspected. All four numbered photo areas remain visible; side decoration, plain gaps and clipped/hidden watermark agree with the measurements. Owner visual review remains pending.
- `check-review.mjs` passed: 26 displayed PNGs decoded, zero broken images, all aspect switches, native-size toggle, transparency swatches and file-only image sources. See [review-checks.json](review-checks.json).
- `node --test test/composition.test.js`: **6 passed, 0 failed**, including three aspects, watermark placement and sticker ordering. Authoring-script syntax and `git diff --check` passed.
- [refinement-files-before.json](refinement-files-before.json) captured the **current pre-refinement bytes** of 148 existing tracked/watermark-proposal/package files. All remain byte-identical. The older [existing-files-before.json](existing-files-before.json) is retained as historical evidence; it predates unrelated watermark documentation edits and is not silently rewritten. The build now checks the explicitly named refinement snapshot.
- Production Purple SHA-256 remains `6b8e34b0d00bca71e0febc22f4c76e712468ddf8cbca0fecace16bea5b72e762`; original watermark remains `3269ed4cab6167919a04a588f5c7f76ac634a599d9876fefde7b5a19898db887`. Composition/coordinator/export/packager hashes are recorded in verification.json. No proposal is in the release allowlist; no package rebuild occurred.
- Existing unrelated `assets/ASSETS.md` and `proposals/pro-86-watermark/` work is preserved. No production artwork/export, Gallery, Settings or packager changes; no staging, commit, push, deployment or publication.

Rebuild from repository root using Node and local Chrome (no dependencies added):

```powershell
node proposals/pro-86-purple-frame/build.mjs
node proposals/pro-86-purple-frame/check-review.mjs
node --test test/composition.test.js
```

`PROPOSAL_BROWSER` can select a compatible Chromium executable. Rendering uses fresh disposable temporary profiles and data URLs; no personal profile, camera, Gallery/storage or user photos. Sandbox Chrome startup failed; permitted local rendering then succeeded. File-page QA draws images without restricted file-origin pixel readback; data-URL rendering separately performs alpha/pixel comparisons. The refinement manifest must remain unchanged; a later production edit needs an explicitly reviewed new snapshot.

## Exact artifact inventory

All filenames below are relative to this README. PNG dimensions are checked from saved IHDR bytes; SVG dimensions are their width/height and viewBox. Twelve full strips, twelve footer crops, one board and two candidate source PNGs = 27 PNGs. All hashes are SHA-256. Full previews are ordinary full-resolution PNGs, without review-page chrome or rescaling.

| Filename | Dimensions | SHA-256 |
| --- | --- | --- |
| [a-lavender-wishes.svg](a-lavender-wishes.svg) | 700 × 2090 | `fd46b29ada8207edef80614bef9c1153d81ae3e47e1c1691d6797909596afa8e` |
| [b-cream-moonwalk.svg](b-cream-moonwalk.svg) | 700 × 2090 | `6036251870e57600e956e4e53f42894460a4522526b97467b2baa6f7dc47215c` |
| [a-lavender-wishes.png](a-lavender-wishes.png) | 700 × 2090 | `baa21ee23610f6c9ef4414f8f92e0b1b549282cf51f5f7626bdf33f724d05971` |
| [b-cream-moonwalk.png](b-cream-moonwalk.png) | 700 × 2090 | `2ae9455c799d864a47da64b0daf949b8093d34a972e334797fc4b180e59fdcad` |
| [previews/none-4x3.png](previews/none-4x3.png) | 700 × 2090 | `91c6ba72ebfe2acaee50b074420f21deeb08a7ff4042bd6a14d1b2e75b90acb7` |
| [previews/none-4x3-footer.png](previews/none-4x3-footer.png) | 700 × 180 | `c728e5e050010813066a6566578e9f8b0b55c7cce7d1cdd70c6f484771b38319` |
| [previews/legacy-4x3.png](previews/legacy-4x3.png) | 700 × 2090 | `f79454a09912df7e8fd66b4a1b108d5a064d4ebf6bf1316ea52a1894001c7734` |
| [previews/legacy-4x3-footer.png](previews/legacy-4x3-footer.png) | 700 × 180 | `d26a8cb1f65bfb8c9899611575e691ad243e283b182234e89dcff3595dfdc759` |
| [previews/a-lavender-wishes-4x3.png](previews/a-lavender-wishes-4x3.png) | 700 × 2090 | `06acb91403738186ce8d1558f652ffca19f132a501a85137431655a5ec1003a5` |
| [previews/a-lavender-wishes-4x3-footer.png](previews/a-lavender-wishes-4x3-footer.png) | 700 × 180 | `504407b90dba5a9b18d20e4ef4f5c5830e09a891ef0338dcde1926855f671413` |
| [previews/b-cream-moonwalk-4x3.png](previews/b-cream-moonwalk-4x3.png) | 700 × 2090 | `0b3021261dc380cc61496d6ed5a0d045922d29d9dd4134ad125b0354ddf68d63` |
| [previews/b-cream-moonwalk-4x3-footer.png](previews/b-cream-moonwalk-4x3-footer.png) | 700 × 180 | `93d329f3c40ea6159205fd0dfd5e6d606cb48bc34861d89ce7df8214517bbec1` |
| [previews/none-16x9.png](previews/none-16x9.png) | 700 × 1642 | `4f61be84af4319229864b7b26274525d208b948b69fa6cb1f2aaeeec9167beeb` |
| [previews/none-16x9-footer.png](previews/none-16x9-footer.png) | 700 × 180 | `357832922ab51ed31e8524b5e1c8455b7603f31121b1af95632a5c0e60395d02` |
| [previews/legacy-16x9.png](previews/legacy-16x9.png) | 700 × 1642 | `f71966178922fc441f35dcbbbecdb5516c0d61f173f50338417a8c90a0759f32` |
| [previews/legacy-16x9-footer.png](previews/legacy-16x9-footer.png) | 700 × 180 | `14c6dbd381e5e2a6ad60953566cb55760c55da48cdd166d22d7e4703e6c10515` |
| [previews/a-lavender-wishes-16x9.png](previews/a-lavender-wishes-16x9.png) | 700 × 1642 | `05f918fceee0918f14949e4fcbd1eed1b9ef971c9ebc0ef2a6fbdaf45f12c097` |
| [previews/a-lavender-wishes-16x9-footer.png](previews/a-lavender-wishes-16x9-footer.png) | 700 × 180 | `523a7abe7546fcd30600dda9fd94a62cd9f39a1288133e1585b40380b0c25303` |
| [previews/b-cream-moonwalk-16x9.png](previews/b-cream-moonwalk-16x9.png) | 700 × 1642 | `df8c77bd365dabfbb06d793d9e60b7fbbdd70420b9de2bfb3c37d9ff00b64788` |
| [previews/b-cream-moonwalk-16x9-footer.png](previews/b-cream-moonwalk-16x9-footer.png) | 700 × 180 | `965dcc1e3c9fffc43af5e572b0eed02ec0445c4ac3947dc70b3818b3dd7a3298` |
| [previews/none-3x4.png](previews/none-3x4.png) | 700 × 3490 | `57ff96196ce03c3b10310b066b41eeab5521e7096968b7758e860d0bc50ce0f4` |
| [previews/none-3x4-footer.png](previews/none-3x4-footer.png) | 700 × 180 | `ed09dc78aba70330f1f8cf0ae66323cb3d53223f80d1b89fbd74bd550cf61a14` |
| [previews/legacy-3x4.png](previews/legacy-3x4.png) | 700 × 3490 | `33d3e51aa7fb49f6e4a3aa00fd47f604ced2699ea4a9bd2f8da593535858b738` |
| [previews/legacy-3x4-footer.png](previews/legacy-3x4-footer.png) | 700 × 180 | `14a9e8e579b41c39d79c4065e6423ac525485ceb279252113a42ae923ed71b49` |
| [previews/a-lavender-wishes-3x4.png](previews/a-lavender-wishes-3x4.png) | 700 × 3490 | `1cc4c29e0fff7984b53a574fc35488b7cec24c012122baa03fce91d579d93ccc` |
| [previews/a-lavender-wishes-3x4-footer.png](previews/a-lavender-wishes-3x4-footer.png) | 700 × 180 | `89d813ecc23071f6e2f015eeb1895714dd9a10dec16313bad524fda9883076d2` |
| [previews/b-cream-moonwalk-3x4.png](previews/b-cream-moonwalk-3x4.png) | 700 × 3490 | `1e466ce8a6f0471b3bb0bfd9eaafc62f57bf79b56a0060aabbd4c91cd2e00fe5` |
| [previews/b-cream-moonwalk-3x4-footer.png](previews/b-cream-moonwalk-3x4-footer.png) | 700 × 180 | `a6d656e717a8898024fb2cc3ee65ff57662a351cc088425817f8b671c83232e5` |
| [previews/contact-sheet.png](previews/contact-sheet.png) | 1440 × 1360 | `50070c11deeb673f5feb7cf0da2447ca890b208e3cc4116cb6030c41aedb26ed` |

## Required owner decision

Review A and B in all three aspects, including full-resolution photos and native footers; choose A, B or revisions. Approve the exact selected source PNG/hash and new visual baseline, explicitly considering partial watermark visibility/clipping at 4:3 and 16:9 and full occlusion at 3:4. Confirm documented source/use authority for public raw PNG/SVG delivery, adaptation and user-finished strips. Any integration and acceptance work requires a separate explicit authorization.

PRO-86 remains **Backlog**, PRO-64 **In Progress**, PRO-78 **Backlog**, with dependencies and acceptance criteria unchanged. Comparison composites contain unresolved legacy artwork/watermark: local review only; do not publish this directory. **Stopped for owner visual approval. Neither candidate is approved or integrated.**
