# PRO-73 implementation and verification

22 October 2026 (Asia/Manila). Implementation follows the accepted PRO-66 retained-vanilla ADR and the approved 22 October ChatGPT Work handoff (`AGENTS.md`, `DESIGN-SYSTEM.md`, `IMPLEMENTATION-HANDOFF.md`, `QA-REPORT.md` and the Review/retake/restart/navigation reference in `src/App.jsx`). The prototype was read only and was not modified or copied into production.

The owner explicitly authorized PRO-73 despite PRO-64 remaining incomplete. This exception applies only to PRO-73. Earlier issue statuses and all deferred manual/release requirements remain unchanged. PRO-73 remains **In Progress** because physical-camera/device acceptance is outstanding. PRO-74 and subsequent work were not started.

## Behavior and ownership

| Boundary | Responsibility |
| --- | --- |
| `scripts/variables.js` | One committed `session`: id, four ordered photo records, initial capture geometry, frame and published base/canvas. Separate `ui` and `operations` records hold view state and asynchronous resources. |
| `scripts/main.js` | Named navigation, capture commit, review, candidate staging/accept/cancel and confirmed-reset transitions. Render controls from state; preserve completed work on navigation. |
| `scripts/camera.js` | Existing startup generation/promise, silent video constraints, readiness listeners/timeout and late-stream cleanup, unchanged. |
| `scripts/snap.js` | Three-second countdown and single mirrored, uncropped capture with source dimensions. Cancellation rejects queued ticks, including ticks from the same session's earlier operation. |
| `scripts/preview.js` / `scripts/edit.js` | Cancellable image decoding and request-guarded publication. Composition uses frozen initial geometry and photo snapshots. Preview publication no longer navigates or owns camera cleanup. |
| `scripts/export.js` | Consume the published canvas through its new owner. A late share-encoding callback cannot use a canceled operation/new session. The separate PRO-60 native-sharing rejection gap is not resolved here. |

Home Start opens camera-off. Only Enable camera acquires video, with audio false. Four captures enter Review inside Capture and release tracks before composition. Each card opens a native modal with separate original and candidate. The shared video/countdown DOM is moved into the dialog while camera resources remain owned by `camera.js`. Candidate capture stops its stream and successfully decodes before Use replacement is available. Acceptance changes only that slot, invalidates old pixels and retains the chosen frame. Cancel, close, Escape, backdrop, failure and navigation drop candidate references and keep originals. Native background inertness is supplemented by explicit Tab/Shift+Tab wrapping and focus return.

Home/Photobooth/About navigation and the mobile disclosure are operational. Photobooth resumes completed Review/Customize work; Home Start and Make another strip request Keep this strip / Start new strip. No committed data is cleared before confirmation. Partial capture is cleared on navigation; completed data stays in memory. Page exit/reload releases the session. No persistent router or Back/Forward guarantee is added. Gallery/Settings have no dead controls; they await their own issues. About uses current production capability/privacy/credit disclosures.

`scripts/composition.js` and composition assets are unchanged: photo width 600px, initial aspect rounded to photo height, 50px padding, 30px gaps, 100px watermark region, existing watermark/Purple asset and `snapicorn.png`. Mixed-aspect candidates rescale into established slots without new cropping or mirroring. UI artwork does not enter output pixels. Frame customization and export remain combined until their separate issue.

Other affected files: `index.html` (screens, controls and dialogs), `styles/style.css` (approved responsive adapters), `styles/foundation.css` (dialog comment only in this task), `eslint.config.js` (explicit shared-owner globals), `test/app.test.js`, `test/recovery.test.js`, and `README.md`. Pre-existing uncommitted PRO-62 accessibility and PRO-63 release-hygiene work is retained, including both verification documents. No dependencies were installed or changed.

## Automated results

- `npm test`: **79 passed, 0 failed**.
- `npm run lint`: **passed**.
- `git diff --check`: **passed**; Git emitted LF-to-CRLF notices for existing stylesheet working copies, without whitespace errors.

Tests cover camera-off entry, rapid starts, explicit permission retry, readiness/cleanup, ordered Review, per-slot acceptance, all candidate dismissals, decode failure/timeout, navigation during startup/countdown/retake/rendering, late camera success/error/finally, stale image/timer/dialog-close callbacks, confirmed/canceled restart, Home Start protection, frame retention/recomposition, focus-boundary handling and pagehide cleanup. Existing capture, frame, composition and export regressions were adapted to the explicit Enable/Review steps. Superseded immediate-camera/destructive-restart assertions were replaced by focused flow coverage.

Mixed-aspect fixtures verify 4:3 → 16:9, 16:9 → portrait 3:4 and portrait 3:4 → 4:3 replacements. They retain 700×2090, 700×1642 and 700×3490 respectively, maintain ordered source draws, and change exactly one photo record. Node mocks and the controlled composition sampler do not establish real hardware or actual PNG pixel fidelity.

## Browser evidence

Used the Codex in-app Chromium browser with a separate, labeled synthetic-video fixture outside the repository. It replaces getUserMedia only in that fixture with canvas video; the product has no demo fallback or fixture route. No physical-camera permission was requested. Initial cross-origin fixture composition was tainted by its test origin; the fixture was corrected to serve app/assets on one local origin, then capture/retake/composition were rerun successfully. This was a harness limitation, not an application change.

Verified through UI actions and DOM observations:

- Opening the booth reports zero camera requests and zero active tracks; Enable produces one silent stream. Real three-second countdowns produce four ordered Review photos, then zero active tracks.
- A 1280×720 retake of slot 2 in a 640×480 session preserves every original until acceptance. The changed-source comparison is `[false, true, false, false]`; the composed browser image decodes to **700×2090**.
- Purple remains selected and the preview source is byte-for-byte identical through About → Photobooth navigation. Review remains accessible from Customize.
- Retake Escape restores focus to the initiating button. Backdrop dismissal during a live retake closes it and reports zero active tracks. Final Tab and Shift+Tab wrap within the modal; mobile-menu Escape closes it and focuses its toggle.
- Restart Escape returns focus to Make another strip; confirmed Start new strip opens camera-off without another request. Home Start protects a completed session, Keep retains the photos, and Photobooth navigation restores the original Review sources.
- Final browser warning/error log was empty. No native-share success, physical device or screen-reader result is implied.

| Review viewport | Document client / scroll width | Layout |
| --- | --- | --- |
| 1440×1000 | 1425 / 1425 | Two columns |
| 768×1024 | 753 / 753 | Two columns |
| 320×900 | 305 / 305 | One column; disclosure navigation |
| 844×390 | 829 / 829 | Two columns; dialog scrolls internally to reachable actions |

Screenshots were visually inspected for desktop/tablet Review, phone Review/retake, mixed-aspect comparison, camera-off entry and landscape dialog. No document horizontal overflow appeared at these measured sizes. Temporary viewport overrides were reset.

The screenshots, fixture and viewport metrics are local verification artifacts and are not included in the repository. It contains `review-{desktop,tablet,mobile,landscape}.png`, `retake-candidate-desktop.png`, `retake-mobile.png`, `retake-landscape.png`, `restart-desktop.png`, `camera-off-{desktop,mobile}.png`, the isolated `fixture.html`/`server.py`, and `viewport-metrics.json`. These synthetic artifacts are not shipped application assets or physical-camera acceptance evidence.

## Outstanding acceptance and handoff

Still required: physical-camera allow/deny/retry; hardware readiness, interruption and camera-indicator cleanup across capture/review/retake/navigation; two consecutive real sessions; supported phone/tablet/touch and Safari/Firefox/other-browser coverage; screen-reader countdown/status/dialog announcements; OS reduced-motion and zoom checks; actual preview/download PNG appearance with None/Purple and mixed camera aspects; native sharing; hosted HTTPS/path and release acceptance. Manual browser/camera/device/release gates remain deferred by owner decision and required before release. Existing PRO-60 and asset-rights limitations remain open in their owning work.

PRO-74's session and geometry foundations are in place, but PRO-73 is not an accepted Done prerequisite while these criteria remain unsupported. Proceeding to PRO-74 needs separate owner direction; no subsequent feature was implemented. Work is uncommitted. No staging, commits, pushes, deployment, publication, destructive cleanup or earlier-status changes occurred.
