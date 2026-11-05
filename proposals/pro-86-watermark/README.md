# PRO-86 watermark proposals — not approved

Prepared 31 October 2026 (Asia/Manila). **Proposals only; neither candidate is approved or active in production.** This entire directory is local review/support material, outside runtime assets and the release allowlist. Do not upload it as a website or release artifact: comparison PNGs contain the unresolved legacy watermark/Purple artwork.

## Review

Open `review.html` directly in a local browser. No server, camera access, account, network, download action or Gallery access is required. Keep this directory and its `previews/` folder together. Start with None at 4:3, inspect the native-size footer board, compare 16:9 and portrait, then switch to Purple and inspect the separate transparency/color swatches. Native 700 px strip display scrolls inside each card.

The saved `previews/footer-comparison.png` is also a quick side-by-side review. Eighteen full-strip PNGs compare legacy/A/B × None/Purple × three capture aspects, using the same four original synthetic landscape fixtures. They represent export geometry and surrounding image colors, not real camera photographs. No personal images, existing Gallery records or third-party stock photos were used.

**Observed constraint:** the current Purple frame is opaque over the watermark footer. Legacy and both proposals are fully hidden there at all three reviewed aspects. The frame is applied after the watermark by the unmodified compositor. The review deliberately retains this result. A separate purple color swatch evaluates the candidate itself; it does not represent a changed Purple export. Do not move the watermark above the frame or alter the frame to address this during integration without separate authorization.

## Candidates and rationale

| Candidate | Files | Rationale |
| --- | --- | --- |
| A — Horn camera | `a-horn-camera.png`, `a-horn-camera.svg` | Rounded camera, geometric horn and an original four-point lens glint. The direct unicorn cue and sturdy outline favor recognition at small sizes. Recommended starting point for owner review. |
| B — Orbit camera | `b-orbit-camera.png`, `b-orbit-camera.svg` | Crescent lens, orbital arc and compact camera. A quieter celestial direction; its finer orbit needs particular scrutiny at native size. |

Both use approved palette values purple `#7c49c6`, lavender `#eee4fc`, warm paper `#fffaf2` and the existing cleared Fraunces 600 wordmark font. They are deliberately simple rather than copying a detailed character. “Snapicorn” is the only lettering. No legacy geometry, Phosphor icon path, approved-but-uncleared logo, sprite or decorative frame component is reused in the candidate artwork.

The PNGs are exactly **690 × 624**, **8-bit RGBA PNG (color type 6)**, with a transparent canvas/negative space and partially transparent antialiased edges. Some camera interiors intentionally have opaque lavender/paper fills. There is no full-canvas background rectangle. Editable SVGs have the same canvas and embed the existing Fraunces font; `fraunces-OFL.txt` accompanies that embedded font. PNG lettering was rendered from the same local font using Chrome Canvas, avoiding runtime font dependencies in the candidate PNGs.

## Unchanged technical contract

The renderer loads the current `scripts/composition.js` verbatim and calls `composePhotoStrip()` then `composeFrame()` in an isolated local document. It never changes application code or session data. At default 600 px photo width, the 690:624 source fits to approximately **88.4615 × 80**, horizontally centered at **x=305.7692**, **y=H−115**. Its transparent source margins remain part of that fit; no trimming, cropping, stretching or alternate placement is applied.

Four full photos retain 50 px padding, 30 px gaps and the 100 px watermark region. Reviewed outputs: 700×1642 (1280×720 capture), 700×2090 (640×480), 700×3490 (480×640). White base → photos → watermark → optional existing Purple frame → ordered stickers remains the production contract. These preview fixtures contain no stickers; interactive sticker, camera/download/share and device acceptance were not rerun. No export filename, app layout, composition formula or release packaging rule changed.

## Provenance and support files

These two designs were newly authored as explicit geometry and lettering by Codex in this task. No image-generation service, external artwork, raster reference input, tracing or copied mascot was used for their creation. The existing legacy/Purple images were read only for comparison composites after the candidate geometry was authored. The visual direction came from the user's brief and the approved palette/type definitions in `styles/foundation.css`; existing Fraunces is the only embedded third-party resource, with its complete OFL notice retained. This is a documented independent creation process, not a claim of worldwide uniqueness, trademark clearance or an ownership/assignment determination.

- `build.mjs`: writes only inside this proposal directory, reads production composition/assets/font, generates editable SVGs and invokes local headless Chrome with an isolated temporary profile.
- `render.js`: exact candidate geometry comes from `build.mjs`; this browser renderer rasterizes it, generates original synthetic fixtures, calls the unmodified composition functions, checks alpha and decodes every generated strip.
- `verification.json`: dimensions, alpha counts, candidate hashes, production file hashes and strip decode results.
- `render.local.html`: ignored disposable renderer with embedded comparison images/font. Never publish or commit it. Local temporary Chrome profiles are disposable; no normal browser profile is opened.
- `review.html`, `previews/`: local review only. The review page preloads/decodes all 21 referenced PNGs and reports success or failure.

To regenerate, from the repository root on Windows with local Google Chrome:

```powershell
node proposals/pro-86-watermark/build.mjs
```

`PROPOSAL_BROWSER` may point to another local Chromium executable. The renderer needs permission to launch that browser; the initial sandbox run could not start Chrome's crash server. Regeneration subsequently succeeded with local renderer permissions. No dependency installation, production server, package generation or network access is needed. Re-running intentionally overwrites only these proposal artifacts; review their new hashes before any approval. Browser/font rasterization versions can affect bytes.

## Approval required before integration

Local verification passed: PNG headers independently confirmed 690×624, 8-bit RGBA/color type 6 for both candidates; alpha counts include zero, partial and full opacity. Headless Chrome decoded all 18 strip PNGs, both candidate PNGs and the footer board through `review.html`. Both designs, the footer board and a full None strip were visually inspected. Node syntax checks for both authoring scripts and `git diff --check` passed. No tracked production file changed; watermark and Purple hashes match the recorded pre-task baselines. No proposal path is in the release allowlist. No app test suite was run because this task changed only isolated proposal material; no new runtime acceptance is claimed.

The owner must choose **A, B, or request revisions**. For a chosen design, approve its exact PNG/SHA-256 in `verification.json`, its native-size legibility and the new None visual baselines at all three capture aspects. Acknowledge that unchanged Purple hides it; any requirement to make it visible in Purple is separately scoped. Confirm Snapicorn's authority for the newly authored source and font use, including public raw-file delivery, adaptation and user-finished strip distribution; retain any required authority/assignment record and the OFL notice with editable source redistribution.

Then explicitly authorize a **separate integration task** to replace the runtime watermark and verify the output baselines, placement, transparency and sticker/layer behavior. Approval of this proposal does not itself authorize integration, commit, publication or deployment. Legacy assets remain intact. Purple replacement, other asset rights and PRO-64/PRO-78 release acceptance remain separate unresolved work. PRO-86 remains Backlog; no completion or publication clearance is claimed.
