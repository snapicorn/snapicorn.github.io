# Snapicorn

Snapicorn is a small, static photobooth app built with HTML, CSS, and vanilla JavaScript. It captures four photos, arranges them into a vertical strip, and offers a purple frame and PNG download.

## Requirements

- Node.js 20.19+, 22.13+, or 24+ for the development checks.
- A modern browser. Camera access requires HTTPS on a hosted site; browsers treat `localhost` as a secure context for local development.

The photobooth itself has no JavaScript runtime dependencies. ESLint is used only for development.

## Run locally

Install the development tools once:

```sh
npm ci
```

Start any static file server from the repository root. For example, with Python installed:

```sh
python -m http.server 8000
```

Open `http://localhost:8000` in a browser and allow camera access to try the live photobooth. The app serves its existing HTML, scripts, styles, and assets directly; there is no build step.

## Checks

Run automated tests:

```sh
npm test
```

Lint the active scripts and test file:

```sh
npm run lint
```

Tests use Node's built-in test runner and mocked browser objects. They check script syntax/order, local HTML and CSS asset paths, camera startup/cleanup, session reset, countdown timing, cancellation, capture/composition failures, and retry. They do not replace real-browser checks of camera permissions, image rendering, downloads, or device sharing.

## Capture recovery

Each photo uses a three-second 3–2–1 countdown. Capture and composition share an operation guard; repeated Snap clicks cannot start another run. Cancel / Exit returns to Home, stops camera tracks, and clears partial photos, previews, countdowns, and pending image callbacks. Leaving the page also clears the session.

If the camera is interrupted, a canvas operation fails, or a required photo/logo/preview fails to load, the app returns to Home with a retry message. Select Start Photobooth to start a clean four-photo session. Image loads have an eight-second timeout. Failed frame updates retain the last successful strip, frame selection and export; select a frame again to retry. Rapid frame selections supersede earlier requests, including pending preview loads. Only the latest request may publish or re-enable export. Download encoding failures show a retry message without changing the strip. Export controls are disabled while composition or a frame update is pending.

Session state is declared in `scripts/variables.js`. `resetPhotoboothState()` and `exitPhotobooth()` in `scripts/main.js` own reset and exit cleanup. A generation counter invalidates asynchronous work from earlier sessions; `loadSessionImage()` in `scripts/preview.js` settles image loads on success, error, timeout, or cancellation. `scripts/composition.js` draws loaded images into fresh canvases through a supplied canvas factory, independently of the DOM. `generatePhotoStrip()` loads all four captures and the original logo before drawing. `applyFrame()` builds from the unframed strip and uses both session and request guards. Preview decoding must succeed before the canvas and frame button selection are published. Export serializes that completed canvas without reading editor coordinates or adding layers; future sticker work must extend composition explicitly.

The production output contract is unchanged: four photos in capture order, already mirrored by capture, no second mirror or center crop; photo width 600px and height rounded from camera aspect; 50px padding, 30px gaps and a 100px watermark region. The existing logo fits within 240×80px, centered horizontally, with its original vertical placement. A 4:3 input yields 700×2090; a 16:9 input yields 700×1642. Purple stretches the existing frame over the full strip; None restores the base. The filename remains `snapicorn.png`.

Composition tests use asymmetric controlled photo samples, draw-coordinate assertions and a simulated nearest-neighbor pixel sampler for 4:3, 16:9 and portrait inputs. They verify order, orientation, aspect, spacing, watermark, frame layering, repeatability, racing callbacks, failures and preview/export source consistency. They do **not** decode actual asset pixels, render browser Canvas, encode PNGs or exercise an actual download.

Manual browser, physical-camera, device, and cross-browser acceptance for PRO-56, PRO-57, and PRO-58 is deferred by owner decision. Mocked tests do not establish camera hardware behavior. Outstanding checks include permission allow/deny and retry; readiness and camera-indicator cleanup; visible Cancel during countdown and composition; interruption/failure feedback and same-page retry; at least two consecutive four-photo sessions; preview, frame and downloaded PNG appearance; and supported device/browser behavior. These issues remain In Progress pending their acceptance requirements. PRO-58 proceeded under an owner-approved exception to the PRO-56/PRO-57 dependency gate; PRO-59 also proceeds under an explicit owner-approved exception despite these deferred checks, without changing the previous issue statuses. That earlier exception covered PRO-59 only. PRO-59 remains In Progress pending a real-browser comparison of preview and downloaded PNG for None/Purple and rapid frame changes, plus the deferred manual browser, camera and device acceptance.

## Project structure

- `index.html` — screen markup and classic-script load order.
- `scripts/` — shared session values and camera, capture, composition, frame, and export behavior.
- `styles/foundation.css` — approved design tokens, local fonts, shared controls, cards, focus, dialog surfaces and OS reduced-motion support.
- `styles/style.css` — approved responsive Home, Capture and combined edit/export layouts.
- `assets/` — original composition assets plus approved interface artwork and fonts; see [asset sources and licensing](assets/ASSETS.md).
- `test/` — automated checks that do not require a real camera.

Filters, stickers, QR sharing, and additional layouts are not part of the working feature set yet.

## Approved UI foundation (PRO-72)

The foundation follows the finalized 22 October 2026 handoff (`DESIGN-SYSTEM.md`, `IMPLEMENTATION-HANDOFF.md`, `QA-REPORT.md`, and the final `src/styles.css` → `src/magic.css` cascade). Cream paper, plum text, lavender surfaces and purple actions are defined once in `styles/foundation.css`. Fraunces 600 headings and DM Sans 400/500/600 load from local Latin WOFF2 files with serif/sans-serif fallbacks. Shared spacing tokens use their pixel sizes in their names, for example `--space-24`. Load the foundation before screen adapters; keep screen-specific layout out of shared components.

Primary buttons have restrained depth and hover/press feedback; secondary buttons use white bordered surfaces. Native disabled controls lose their depth shadow, and keyboard focus uses a 3px purple outline with a 4px offset. None/Purple retain native toggle-button behavior and `aria-pressed`, with a visible check and border on the selected frame. The OS reduced-motion preference suppresses transitions and button movement without removing camera mirroring. There is no motion setting or persistence in this issue. Future disabled links must also remove `href` and the tab stop in their owning behavior; CSS alone cannot disable keyboard activation.

The in-page logo, small brand sparkle, Home unicorn samples and Home/editor backdrops are presentation only. The exact tagline remains **Snap. Smile. Sparkle.** PNGs still use the original watermark and Purple frame. PRO-72 established the foundation without changing application scripts or output behavior. PRO-61 integrates the layouts described below; navigation, review/retakes, stickers, history, Gallery, settings and separate export flows remain out of scope.

The owner explicitly authorized PRO-72 despite deferred manual browser/hardware acceptance for PRO-56–PRO-59. This is a new sequencing exception limited to PRO-72, recorded in Linear; earlier issue statuses and outstanding acceptance requirements remain unchanged. Passing mock tests and synthetic browser checks do not establish physical-camera or real-device acceptance.

## Approved core layouts (PRO-61)

Home uses the approved invitation and decorative four-photo unicorn strip. Start Photobooth still acquires the camera immediately. Capture places the viewfinder beside four numbered slots on desktop/tablet and stacks them on phones. The 3–2–1 timer overlays the viewfinder, with the current photo number and a live completed-photo count. Cancel / Exit keeps the existing session cleanup and retry behavior.

The editor keeps the production composed strip upright on the approved lavender workmat. None/Purple remain native toggle buttons with their existing async selection safeguards. Download PNG and Share stay in this screen; Make another strip keeps the existing restart behavior. All four photographs fit the preview, including tall camera inputs, through presentation sizing only. Camera video and thumbnails contain the complete captured aspect instead of cropping it to the prototype's fixed 4:3 sample. No export pixels, filenames or composition assets changed.

Screen changes focus the destination heading; successful frame updates retain the user's focus. Native controls, visible focus, live timer/progress feedback and the foundation's reduced-motion styles remain in use. Broader keyboard and assistive-technology acceptance belongs to PRO-62.

The owner authorized PRO-61 despite PRO-59's outstanding manual acceptance gate. This sequencing exception is recorded in Linear; PRO-56–59 retain their statuses. PRO-61 remains In Progress pending physical-device and remaining manual acceptance. See [PRO-61 verification](docs/pro-61-verification.md) for browser comparisons, responsive checks, synthetic PNG hashes and remaining gaps.
