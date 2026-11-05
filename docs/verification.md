# Verification coverage

## Automated checks

Run `npm test` and `npm run lint` from the repository root after installing development dependencies with `npm ci`.

[Source CI](../.github/workflows/ci.yml) runs `npm ci`, lint, the full Node test suite (including package integrity), and `npm run package:local` on pull requests targeting `main` and pushes to `main`. Its matrix checks the minimum supported 20.x and 22.x versions (20.19.0 and 22.13.0) and 24.x on Linux, plus 24.x on Windows. The supported range is declared in `package.json`; versions beyond 24.x are permitted but are not covered by this matrix.

The workflow has read-only repository permissions and does not publish a package or deploy the site. A successful run reports checks; requiring them before merge must be configured separately in the repository's branch rules. Browser pixel verification remains a separate local check, and full browser/device acceptance remains below.

The Node tests cover camera/session cancellation and recovery, capture order, retake/restart, composition, sticker geometry and history, PNG preparation, sharing fallbacks, Gallery persistence, reduced motion, and static packaging. Camera, device sharing and storage failures use controlled doubles; they do not establish physical-device acceptance. Packaging tests use disposable fixtures and loopback-only servers.

For actual Chromium Canvas/PNG checks, run `node tools/verify-frame-pixels.js`. The verifier uses synthetic photos and a fresh temporary browser profile, checks the current [PNG/RGBA baselines](../test/fixtures/pastel-purple/baselines.json), untouched photo regions and preview/download equality. It needs local Chrome; override its path with `FRAME_TEST_BROWSER`. It does not use personal Gallery data or invoke a device share sheet. `FRAME_APPROVAL_DIR` optionally supplies the approved sample photos and review PNGs for additional comparisons. Do not rewrite baselines merely to make a failure pass.

## Retained acceptance evidence

These are summaries of prior reports, not new verification results for the current checkout. Detailed reports and earlier evidence references are available in Git at cleanup baseline `de170d5`.

| Prior exercise | Established result | Limits |
| --- | --- | --- |
| Desktop physical camera, 25 October 2026 | Two 600 × 450 sessions, retake cancel/accept, restart, countdown exit/navigation and owner-observed camera LED shutdown; None and Purple-with-stickers downloads matched their previews | Dark input did not establish real-world mirror/orientation. Uses earlier footer artwork; does not accept current decorative pixels. |
| Stage 1 hosted Chromium after Settings removal | Reported 42 hosted payload hashes, 23 excluded URLs, capture/retake, both frames at three ratios, footer pixels, download equality, Gallery save/reload/preview/download/delete, About and motion checks | Fresh profile with a synthetic camera; scoped to the release recorded in the old report, not current hosted bytes |
| Earlier responsive and keyboard checks | Desktop viewport layouts, focus, dialog return, semantic status/countdown and simulated reduced motion | Resized desktop views and mocks do not establish physical touch, spoken screen-reader output or real OS/device behavior |

Settings controls have been removed. `scripts/motion.js` still honors an existing Reduce motion choice; CSS also follows the OS preference. Older Settings implementation reports do not describe the current interface.

## Remaining manual acceptance

Before release acceptance, record the exact revision, browser/device versions, input dimensions, tested URL and results for:

- Camera permission denial, restoration and explicit retry; hardware interruption/recovery, including during photo 2; direct track-state and privacy-indicator cleanup after exits.
- Recognizable asymmetric scenes for mirror/orientation and capture order; actual wide/portrait camera input; current frame/sticker pixels and repeated downloaded PNGs against previews.
- Physical phones/tablets, touch transforms, rotation, low-memory behavior and Gallery capacity; Safari/Firefox/WebKit behavior, private/denied storage, quota and eviction on disposable data.
- Keyboard-only use, native 200% zoom, spoken screen-reader countdown/status/dialogs and actual OS reduced-motion changes.
- Native sharing with real user activation and receiving apps, download placement, and hosted HTTPS root/subpath resource loading for the exact approved artifact.

Use a fresh disposable browser profile. Never clear site data, force eviction or delete records in a profile containing personal Gallery data. See [asset provenance](../assets/ASSETS.md) and [packaging](packaging.md) for distribution and release details.
