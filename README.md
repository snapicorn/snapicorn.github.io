# Snapicorn

Snapicorn is a small, static photobooth app built with HTML, CSS, and vanilla JavaScript. It captures four photos, arranges them into a vertical strip, and offers a purple frame, four pixel stickers, PNG download, and an opt-in local Gallery.

## Requirements

- Node.js 20.19+, 22.13+, or 24+ for the development checks.
- A modern browser. Camera access requires HTTPS on a hosted site; browsers treat `localhost` as a secure context for local development.

The photobooth itself has no JavaScript runtime dependencies. ESLint is used only for development.

## Privacy and camera access

Start Photobooth opens the booth with the camera off. Only Enable camera asks for video access; audio is always disabled. Hosted camera access requires HTTPS. Captures and the composed strip are held in page memory and processed with browser video/canvas APIs for the current session. Leaving or reloading the page clears the app's session state. The app does not save captures to an account or server as part of its own flow. Browser extensions, hosting infrastructure, and device/browser features are outside the app's control.

Download PNG requests a browser download only after you choose Download; this is not proof of a durably saved file. Share opens the device/browser's native sharing flow when available; the destination and any resulting transmission are chosen outside Snapicorn. Sharing support varies by browser and device.

Share catches PNG encoding and native API failures, treats cancellation normally, and keeps the finished strip available for Download PNG or another share attempt. Only the current successfully rendered composition can share. Repeated clicks cannot overlap, and stale completions cannot replace newer feedback. A completed API request does not prove that the receiving app saved or delivered the image. See [PRO-60 verification and remaining acceptance](docs/pro-60-verification.md).

## Current feature set and limits

The app captures four camera photos in sequence, lets you review all four and accept individual retakes, then composes them into a vertical strip with the existing watermark, None or Purple, and optional Star, Rainbow, Unicorn and Heart pixel stickers. PNG download, native sharing and explicit Save to Gallery consume the current completed composition. Home's unicorn strip is decorative sample artwork, not captured photos. Filters, animated stickers, QR sharing, photo rearrangement, and additional layouts remain deferred.

This is a static site with no build step. Its scripts, styles, fonts, and images are served from the repository's own paths. Use HTTPS for hosted camera access; `localhost` is suitable for local camera development. The project has automated mock-based tests but does not currently certify browser/device support. Physical-camera behavior, cross-browser/device coverage, native sharing, screen-reader announcements, and actual downloaded-file appearance still need manual acceptance; see the linked PRO-61/62 verification notes below.

Design asset origins and known licensing limits are documented in [assets/ASSETS.md](assets/ASSETS.md). Font and Phosphor notices are included under `assets/licenses/`. Permission to redistribute the original watermark, purple frame, or unused VintageCharm font has not been established, so confirm their rights before publication.

## Run locally

Install the development tools once:

```sh
npm ci
```

Start any static file server from the repository root. For example, with Python installed:

```sh
python -m http.server 8000
```

Open `http://localhost:8000` in a browser, select Start Photobooth, then Enable camera to try the live photobooth. The app serves its existing HTML, scripts, styles, and assets directly; there is no build step.

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

An initial capture failure returns to Home with a retry message. Select Start Photobooth, then Enable camera to try again. A retake failure closes the dialog and retains every original. Composition failures retain Review and its photos; select Make it yours to retry. Image loads have an eight-second timeout. Failed frame/sticker updates retain the requested edits and offer Retry; export stays disabled until that composition succeeds. The prior successful result stays internal and is never exported as the new edit. Rapid edits supersede earlier requests, including pending preview loads. Only the latest request may publish or re-enable export. Download encoding failures show a retry message without changing the strip.

Session ownership follows the accepted PRO-66 ADR. `scripts/variables.js` separates `session` (identity, ordered photo records, initial geometry, frame and published output), `ui` (destination, booth phase and temporary retake), and `operations` (cancellation generation, timer, render request, pending image loads and busy state). Camera startup/readiness resources stay in `scripts/camera.js`. `scripts/main.js` owns named transitions and photo commits; counts derive from the photo list. No store framework or runtime dependency is introduced.

`cancelTransientWork()` releases camera tracks, timers and pending image handlers without discarding committed work. `navigateTo()` uses that path and retains completed photos, frame and output. `resetPhotoboothState()` discards the session only for confirmed restart, partial capture exit/failure, or page exit. A different generation invalidates late success, error and cleanup callbacks; camera acquisition and render requests also retain their own guards.

`scripts/snap.js` captures full mirrored photo records with source dimensions. Review stops the camera before rendering four ordered cards. Retakes start camera-off, hold a separate slot/candidate, decode the candidate, and stop the stream before comparison. Only Use replacement updates that slot and invalidates the old composed pixels; every dismissal path drops candidate references and restores focus. The original capture geometry stays fixed, so a different-aspect replacement is rescaled into the original slot with no added crop.

`scripts/composition.js` draws loaded images into fresh canvases independently of the DOM. `scripts/composition-coordinator.js` snapshots the current photos, frame and ordered sticker transforms, loads their images, composes and encodes temporary pixels, then decodes the preview before publishing one matching revision. Session, operation, render and model identities reject stale success/error/cleanup. A gesture draft is never an exportable committed result. Export serializes the published canvas without reading editor coordinates or drawing layers.

The production output contract is unchanged: four photos in capture order, already mirrored by capture, no second mirror or center crop; photo width 600px and height rounded from camera aspect; 50px padding, 30px gaps and a 100px watermark region. The existing logo fits within 240×80px, centered horizontally, with its original vertical placement. A 4:3 input yields 700×2090; a 16:9 input yields 700×1642. Purple stretches the existing frame over the full strip; None restores the base. The filename remains `snapicorn.png`.

Composition tests use asymmetric controlled photo samples, draw-coordinate assertions and a simulated nearest-neighbor pixel sampler for 4:3, 16:9 and portrait inputs. They verify order, orientation, aspect, spacing, watermark, frame layering, repeatability, racing callbacks, failures and preview/export source consistency. They do **not** decode actual asset pixels, render browser Canvas, encode PNGs or exercise an actual download.

Manual browser, physical-camera, device, and cross-browser acceptance for PRO-56, PRO-57, and PRO-58 is deferred by owner decision. Mocked tests do not establish camera hardware behavior. Outstanding checks include permission allow/deny and retry; readiness and camera-indicator cleanup; visible Cancel during countdown and composition; interruption/failure feedback and same-page retry; at least two consecutive four-photo sessions; preview, frame and downloaded PNG appearance; and supported device/browser behavior. These issues remain In Progress pending their acceptance requirements. PRO-58 proceeded under an owner-approved exception to the PRO-56/PRO-57 dependency gate; PRO-59 also proceeds under an explicit owner-approved exception despite these deferred checks, without changing the previous issue statuses. That earlier exception covered PRO-59 only. PRO-59 remains In Progress pending a real-browser comparison of preview and downloaded PNG for None/Purple and rapid frame changes, plus the deferred manual browser, camera and device acceptance.

## Project structure

- `index.html` — screen markup and classic-script load order.
- `scripts/` — shared session values and camera, capture, composition, frame, and export behavior.
- `styles/foundation.css` — approved design tokens, local fonts, shared controls, cards, focus, dialog surfaces and OS reduced-motion support.
- `styles/style.css` — approved responsive Home, Capture, Customize and Export layouts.
- `assets/` — original composition assets plus approved interface artwork and fonts; see [asset sources and licensing](assets/ASSETS.md).
- `test/` — automated checks that do not require a real camera.

Filters, animated stickers, QR sharing, and additional layouts are not part of the working feature set.

## Approved UI foundation (PRO-72)

The foundation follows the finalized 22 October 2026 handoff (`DESIGN-SYSTEM.md`, `IMPLEMENTATION-HANDOFF.md`, `QA-REPORT.md`, and the final `src/styles.css` → `src/magic.css` cascade). Cream paper, plum text, lavender surfaces and purple actions are defined once in `styles/foundation.css`. Fraunces 600 headings and DM Sans 400/500/600 load from local Latin WOFF2 files with serif/sans-serif fallbacks. Shared spacing tokens use their pixel sizes in their names, for example `--space-24`. Load the foundation before screen adapters; keep screen-specific layout out of shared components.

Primary buttons have restrained depth and hover/press feedback; secondary buttons use white bordered surfaces. Native disabled controls lose their depth shadow, and keyboard focus uses a 3px purple outline with a 4px offset. None/Purple now use native radios in a Frame fieldset (PRO-62), with a visible check and border on the selected frame. The OS reduced-motion preference suppresses transitions and button movement without removing camera mirroring. There is no motion setting or persistence in this issue. Future disabled links must also remove `href` and the tab stop in their owning behavior; CSS alone cannot disable keyboard activation.

The in-page logo, small brand sparkle, Home unicorn samples and Home/editor backdrops are presentation only. The exact tagline remains **Snap. Smile. Sparkle.** PNGs still use the original watermark and Purple frame. PRO-72 established the foundation without changing application scripts or output behavior. PRO-61 integrates the layouts described below; PRO-73 adds navigation and review/retakes below; PRO-74 adds stickers/history below; Settings is integrated under PRO-77 below. PRO-76 adds Gallery below. PRO-75 adds the separate Export flow described below.

The owner explicitly authorized PRO-72 despite deferred manual browser/hardware acceptance for PRO-56–PRO-59. This is a new sequencing exception limited to PRO-72, recorded in Linear; earlier issue statuses and outstanding acceptance requirements remain unchanged. Passing mock tests and synthetic browser checks do not establish physical-camera or real-device acceptance.

## Approved core layouts (PRO-61)

Home uses the approved invitation and decorative four-photo unicorn strip. PRO-73 changes Start Photobooth to open camera-off; Enable camera explicitly acquires video. Capture places the viewfinder beside four numbered slots on desktop/tablet and stacks them on phones. The 3–2–1 timer overlays the viewfinder, with the current photo number and a live completed-photo count. Cancel / Exit keeps the existing session cleanup and retry behavior.

The editor keeps the production composed strip upright on the approved lavender workmat. None/Purple are native radios with their existing async selection safeguards; failed updates retain the requested choice and disable export until Retry succeeds. PRO-75 moves Download PNG and Share into the separate Export step below; PRO-73 protects Make another strip with a confirmation before reset. All four photographs fit the preview, including tall camera inputs, through presentation sizing only. Camera video and thumbnails contain the complete captured aspect instead of cropping it to the prototype's fixed 4:3 sample. No export pixels, filenames or composition assets changed.

Screen changes focus the destination heading; successful frame updates retain the user's focus. Native controls, visible focus, live timer/progress feedback and the foundation's reduced-motion styles remain in use. PRO-62 adds contextual countdown feedback, distinct pending/captured photo alternatives, native frame radios and focus on Cancel during capture. See [PRO-62 verification](docs/pro-62-verification.md) for checked behavior and remaining acceptance.

The owner authorized PRO-61 despite PRO-59's outstanding manual acceptance gate. This sequencing exception is recorded in Linear; PRO-56–59 retain their statuses. PRO-61 remains In Progress pending physical-device and remaining manual acceptance. See [PRO-61 verification](docs/pro-61-verification.md) for browser comparisons, responsive checks, synthetic PNG hashes and remaining gaps.

## Keyboard and accessibility (PRO-62)

Use Tab / Shift+Tab to reach the existing actions, Enter / Space to activate buttons, and arrow keys to select None/Purple in the Frame group. Screen changes focus the destination heading; starting capture focuses Cancel / Exit before disabling Snap. Frame updates retain focus. The existing current-step indicators expose Capture, Customize or Export with `aria-current="step"`; hidden screens leave the accessibility tree and tab order.

Photo slots distinguish not-yet-captured and captured photos by number. The completed strip description includes its rendered frame. Decorative Home artwork and frame checkmarks are excluded from accessible names. A polite atomic timer announces the photo number at the start of each countdown and the remaining digits; separate polite progress/status regions report captured counts, preparation, frame updates and existing retry errors. These semantics do not establish spoken announcement timing with a screen reader. Existing 3px focus rings, native disabled export controls and OS reduced-motion rules remain in place; no persisted preference is added.

The owner authorized PRO-62 to proceed despite PRO-61's outstanding acceptance requirements. That sequencing exception is limited to PRO-62 and does not close earlier issues or their manual gates. PRO-62 remains In Progress pending the verification described in its [evidence and remaining acceptance](docs/pro-62-verification.md).


## Review, retakes and navigation (PRO-73)

Home, Photobooth, Gallery, Settings and About are working destinations. The mobile disclosure closes after navigation; Escape closes it and returns focus to its toggle. Gallery is implemented under PRO-76 below; Settings is implemented under PRO-77 below. Photobooth navigation resumes a completed in-memory session, including its current Review/Customize/Export step. Home’s Start Photobooth offers the same protected new-session confirmation as Make another strip. Partial capture is canceled and cleared. Reload/page exit loses the session; there is no persistent router, browser Back/Forward contract or saved editable project.

After four photos, Review displays all four in order. Retake photo N opens a native modal with the original and replacement preview. Enable camera explicitly starts video, Take replacement uses the same 3–2–1 countdown, and Use replacement commits only N. Cancel, close, Escape, backdrop dismissal, failure and navigation retain all originals. The dialog traps focus natively and returns it to the initiating retake action. Review photos in Customize returns to Review without losing the chosen frame.

Make another strip opens Keep this strip / Start new strip. Keep, Escape and backdrop dismissal preserve the session and pixels. Only Start new strip clears them and opens a fresh camera-off session. Download the current PNG before confirming if you want to keep it.

The owner specifically authorized PRO-73 despite PRO-64 remaining incomplete. This does not change earlier issue statuses or release requirements and does not authorize PRO-74. Physical-camera, device, cross-browser, screen-reader and release acceptance remain deferred and outstanding. See [PRO-73 verification](docs/pro-73-verification.md) for automated and synthetic-browser evidence, architecture details and acceptance gaps.

## Pixel stickers and history (PRO-74)

Frame and Stickers are keyboard-accessible tabs: Left/Right switches tabs, Home/End selects the first/last. Choose Star, Rainbow, Unicorn or Heart to add it; select an existing sticker on the strip to edit it. Drag with a pointer, resize from any corner, or use the native Size (8–45% of strip width) and Rotation (−180° to 180°) sliders. Arrow keys move the focused sticker by one output pixel; Shift+Arrow moves ten. Delete/Backspace or Remove sticker removes it. Undo/Redo buttons affect stickers only. Selecting a sticker and changing preview zoom add no history.

`scripts/sticker-geometry.js` validates normalized transforms against the dynamic output dimensions, including rotated square asset boxes. Images fit those boxes without stretching. `scripts/sticker-history.js` owns immutable transform snapshots, the cursor and an uncommitted gesture draft/token. `scripts/sticker-gestures.js` computes pointer transforms from a frozen preview rectangle; `scripts/sticker-editor.js` binds these functions to controls and selection. A completed moved drag/resize commits once. Cancel, lost pointer capture, Escape and navigation discard drafts; late pointer events cannot modify them. Editing after Undo removes the redo branch. Frames, photos, accepted retakes and navigation remain outside sticker history.

Preview zoom ranges from 80–140%. All four photos fit at 100%; higher zoom scrolls inside the workmat. The preview stage derives its aspect from the decoded composition. Zoom, handles and decorative artwork never enter the output. Pixel smoothing is disabled only while drawing each sticker, within canvas save/restore. Photos and watermark keep their existing sampling. Every composition starts from the current ordered photos and original watermark, then draws the frame and stickers; repeated exports add no drawings. PRO-74 adds no fixed 4:3 crop, framework, runtime dependency, Gallery or Settings. The separate Export screen is integrated in PRO-75 below.

The owner specifically authorizes PRO-74 while PRO-73 remains In Progress for manual acceptance. This exception changes only PRO-74 execution order: existing dependencies, earlier statuses and all minimum-release/manual requirements remain intact. PRO-74 remains In Progress pending its outstanding acceptance. See [PRO-74 implementation and verification](docs/pro-74-verification.md). PRO-75 and other follow-up issues are not started by this work.


## Approved Export experience (PRO-75)

Choose **Finish strip** after customization to open **It’s a keeper.** The upright workmat shows the exact completed composition, without sticker selection handles or editor controls, and reports its actual PNG dimensions. Pending/failed compositions and unfinished gestures prevent Finish; retain your edits and use Retry in Customize. The output contract, assets and `snapicorn.png` filename are unchanged.

**Back to customizing** preserves photos, frame, stickers and undo/redo history. Ordinary navigation also retains the completed session and Export step. **Make another strip** uses the existing confirmation: Keep, Escape and backdrop dismissal retain the exact result; Start new strip alone resets to camera-off. Reload/page exit still clears session memory.

`scripts/export.js` consumes the published output, never draws layers. Finish prepares one PNG Blob on that result; Download PNG and the existing PRO-60 sharing helper reuse it and join any in-flight encoding. New edits invalidate it through the composition revision. Stale encode/preview/share callbacks cannot export or publish another revision. Encoding failures retain the preview and permit retry; unsupported/canceled/failed sharing keeps Download available.

Downloads use a temporary object URL and a short-lived anchor with the existing filename. Repeated requests reuse the same Blob and URL. The URL stays alive for a 60-second grace period after the latest request, then is revoked; replacement, Back, navigation, confirmed restart and page exit release it earlier. URL cleanup is independent of the cached Blob, so another download can recreate a URL without recomposing or re-encoding. Feedback says **“PNG download requested”**, with no durable-save guarantee. Native share completion likewise asks the user to confirm in the chosen app.

The owner specifically authorizes PRO-75 while PRO-74 and PRO-60 remain In Progress for deferred acceptance. Only PRO-75 execution order changes: dependencies, earlier statuses and PRO-64/PRO-78 release requirements remain intact. PRO-75 remains In Progress pending physical-device, real-photo saved-file and native-share acceptance. Gallery is added under PRO-76 below; Settings is integrated under PRO-77 below. See [PRO-75 implementation and verification](docs/pro-75-verification.md) for tests, decoded PNG comparisons, responsive/keyboard evidence and remaining gaps.


## Local Gallery (PRO-76)

On Export, choose **Save to Gallery** to store the exact prepared finished PNG. Saving is optional; nothing is auto-saved. The action shows Saving, Saved or a recoverable error, and prevents overlapping or repeated saves of the same published result. An already requested write can finish after navigation or restart; its completion cannot label a different revision Saved. Save failure leaves Download PNG and the live session usable.

Open **Gallery** from navigation for newest-first saved strips. It distinguishes loading, empty, unavailable and malformed-record states. Eight cards appear per page; Previous/Next reaches older images. Open a card to preview, Download PNG, explicitly Share strip through the supported native flow, or Delete from Gallery. Delete first opens a confirmation with **Keep it** focused. Keep, Escape, close and backdrop dismissal preserve the image. A dismissal also aborts a requested deletion if its transaction has not yet committed. Only **Delete this strip** requests deletion of the selected record, rechecked in the same write transaction. Downloaded copies are unaffected. There is no bulk delete or database reset.

Images belong to the **current browser profile and site origin** (including scheme, host and port). Clearing site/browser data or browser storage eviction may remove them. They are not automatically backed up or synchronized. Download PNG for a separate copy; a requested download is not proof of durable storage. This feature makes no promise of permanent storage or absolute privacy.

### Storage contract and safeguards

Production uses IndexedDB **`snapicorn-finished-gallery`, version 1**, with one `finished-pngs` object store keyed by `id`. Every new record contains only:

```js
{
  id: 'unique UUID',
  savedAt: 1792728000000, // Unix milliseconds
  blob: finishedPNGBlob,
  metadata: { width: 700, height: 2090, bytes: 53263, type: 'image/png' }
}
```

`scripts/gallery-store.js` owns the connection, validation and transactions. New saves validate PNG signature/IHDR dimensions, Blob type/size and a small metadata whitelist. Reads validate records and headers; image decoding failures retain the saved record and show a warning. Gallery listing returns metadata only, skips and reports malformed records without repairing or deleting them, and loads each displayed Blob separately. A save/delete succeeds only at transaction completion. Quota, abort, denied/unavailable storage and failed opens are retryable errors; limits never evict or overwrite images.

Version 1 creates the store only in a brand-new database. Existing databases/records are not migrated, cleared or replaced. A future schema change needs a separately reviewed, nondestructive policy; do not bump the version casually. Blocked opens report the blocking tabs and permit retry; late connections from canceled/blocked opens are closed. A `versionchange` closes the connection and invalidates Gallery resources. An older app encountering a newer version reports it without changing records. **`snapicorn-design-prototype` is never opened, reused or migrated.**

Capacity checks and `add` run in one write transaction, serializing concurrent saves across tabs. Limits are **100 records, 12 MiB per PNG, 128 MiB aggregate and 8,000,000 pixels per image**. These are provisional safeguards, not device-performance measurements. Existing 700×2090, 700×1642 and 700×3490 outputs fit the pixel cap; this run's synthetic PNGs were 53–361 kB, which does not establish real-photo compression or device memory use. If a limit is reached, download or deliberately delete an individual image before retrying. No silent eviction, raw captured photos, unfinished sessions, sticker/history records or editable projects are stored.

`scripts/gallery.js` owns Gallery state, separate from the live session. It creates thumbnails one at a time, sized within 320×620 pixels, for at most eight displayed cards. Only one full preview remains attached. Temporary bitmap/canvas resources are released after thumbnail encoding; object URLs are revoked on page replacement, preview close, navigation and page exit. Download URLs receive the existing 60-second consumption grace period while the preview stays open. Save feedback uses weak output keys, so replacing/resetting a session does not retain old canvases. Browser decoders/caches and the live booth have additional memory costs; no total-memory or hardware-capacity guarantee is implied.

BroadcastChannel sends a change signal without image content, refreshing active lists and checking stale previews. Focus, visibility and navigation also re-read storage when channel support is absent. A record that vanished in another tab reports missing; deletion verifies id, timestamp and dimensions/size in its transaction. No cross-tab record overwrite is used.

The owner explicitly authorized PRO-76 implementation while PRO-75 manual/physical-device acceptance remains deferred. This PRO-76-only execution-order exception is recorded in Linear; it changes no earlier status, dependency or PRO-64/PRO-78 release gate. PRO-76 remains In Progress pending representative storage/device acceptance. See [PRO-76 verification](docs/pro-76-verification.md) for tests, disposable browser evidence, exact PNG byte comparisons and remaining risks. PRO-77 is not implemented.

## Settings and motion (PRO-77)

Settings keeps the approved two-card layout: Motion and Your photos. Only strips explicitly saved by the user go to Gallery; finished PNGs belong to the current browser profile and site origin, can be lost through browser clearing or eviction, and are not permanent backup or cloud sync. Download PNG gives a separate copy. Open Gallery uses the same in-page navigation as the header.

`scripts/settings.js` owns the preference independently of photos, edits, Export and Gallery. Production localStorage key `snapicorn-motion-preference` accepts only `system` (Follow my device, the default) or `reduce` (Reduce motion). It never reads the prototype key, stores images, or changes Gallery records. Invalid values fall back to Follow my device without rewriting storage on load. Reads and writes are caught, including unavailable storage and throwing accessors. A failed write retains the selected choice for this visit and shows a concise status; it cannot guarantee remembering that choice after reload. A later successful selection can persist again.

One live `prefers-reduced-motion` listener updates the effective `html[data-motion]` value. Explicit Reduce motion always wins; Follow my device uses the current device preference. Shared CSS suppresses animation, transitions, smooth scrolling and tactile button movement for either reduced-motion path. Camera mirroring and sticker position/rotation remain intact, as do countdown numbers, completed-photo counts and progress/state feedback. The CSS OS media query remains a fallback when JavaScript is unavailable. No animation, sound, auto-save or speculative settings are added.

All five destinations preserve a completed in-memory session and its Review/Customize/Export phase. Navigation closes the mobile disclosure, updates the active header button and focuses the destination heading; choosing the already active destination also closes the disclosure. Settings uses native radio keyboard behavior. Tablet header spacing accommodates all five destinations. Reload still clears the editing session; only the preference and explicitly saved finished Gallery PNGs have their respective persistence paths. There is no deep-link or browser Back/Forward routing contract.

The owner authorized a PRO-77-only sequencing exception while PRO-76 and PRO-62 retain deferred manual acceptance. Their statuses, dependencies and all earlier requirements remain unchanged; PRO-64 and PRO-78 remain mandatory release gates. See [PRO-77 verification and remaining acceptance](docs/pro-77-verification.md). PRO-77 remains In Progress pending actual OS/device acceptance.


## Minimum-release verification (PRO-64)

The current 220-test baseline, local root/subdirectory resource checks, synthetic core-flow results, actual downloaded-file evidence, and executable owner checklist are recorded in [PRO-64 verification](docs/pro-64-verification.md). Hosted HTTPS, physical-camera/device and remaining real-world acceptance are incomplete; PRO-64 and the separate PRO-78 full-experience gate are not release approvals.
