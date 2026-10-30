# PRO-86 Cream Moonwalk local integration

Verified 31 October 2026 (Asia/Manila). Local integration only; **not publication-cleared**. Base commit: `7d1d7f653cf7ce55b50ce010b403dea4417221e4`. Node.js 24.22.0, Windows, local Chrome 156.0.8078.79. No issue writes, commits, push, deployment, publication or history changes.

## Approved bytes and behavior

Before changing production files, `proposals/pro-86-purple-frame/b-cream-moonwalk.png` matched the owner's exact SHA-256:

`2ae9455c799d864a47da64b0daf949b8093d34a972e334797fc4b180e59fdcad`

The active `assets/frames/purple.png` is a byte-for-byte copy: **700×2090, 8-bit RGBA (PNG color type 6)**. There was no conversion, resizing, repainting or safe-area modification. The original frame survives at `assets/frames/historical/purple-legacy.png`, with its original hash `6b8e34b0d00bca71e0febc22f4c76e712468ddf8cbca0fecace16bea5b72e762`.

None loads and draws the original watermark at its original position and aspect-preserving size. Purple never loads or draws it; the base contains only white and the four ordered photos. No opaque artwork hides watermark pixels. The original watermark bytes remain unchanged: `3269ed4cab6167919a04a588f5c7f76ac634a599d9876fefde7b5a19898db887`.

Photo width remains 600; photo height is `round(600*inputHeight/inputWidth)`; padding 50, gaps 30 and reserved footer height 100 remain unchanged. No additional mirror, crop or photo transform was introduced. The optional frame still scales over the full canvas before ordered stickers. Selection values and `snapicorn.png` download naming remain unchanged. Preview and download consume the same completed output revision. Frame changes rebuild the base and discard the previous output's PNG cache.

## Regression results

`node tools/verify-frame-pixels.js` runs the verbatim production compositor, coordinator, preview, frame selection and export functions in a disposable Chromium profile with synthetic asymmetric photo fixtures and real Canvas/PNG encoding. UI-only callbacks are stubbed; Gallery, Settings, camera and main initialization are not loaded. Relative image loads map to the exact source bytes embedded as data URLs. The separate static-package tests verify actual relative HTTP paths.

| Input | Both frame output sizes | None watermark contribution | Purple watermark contribution | All four photo regions |
| --- | --- | ---: | ---: | --- |
| 4:3, 640×480 | 700×2090 | 5,646 differing pixels versus watermark-free base | 0 | Zero differing photo pixels; zero overlay-alpha pixels |
| 16:9, 1280×720 | 700×1642 | 5,646 | 0 | Zero differing photo pixels; zero overlay-alpha pixels |
| 3:4, 480×640 | 700×3490 | 5,647 | 0 | Zero differing photo pixels; zero overlay-alpha pixels |

Every pixel, including all photo boundaries, matches a separately scaled decoded source photo in the correct position/order/orientation. Frame alpha is zero throughout each photo rectangle. Purple exactly equals the independently assembled frame-over-watermark-free control. None exactly matches the original watermark control. An additional local comparison embedded the verbatim **pre-integration HEAD** `composePhotoStrip()` under a separate name: all three None images matched exactly, including the RGBA hashes below.

At each aspect, the real coordinator executes **None → Purple → None → Purple**, checking unavailable export while pending, fresh output/cache identity after each change, and exact PNG equality on returning to each frame. Each state runs the production Finish and Download handlers twice: **24 download actions total**. Editor preview, Export preview and download target have zero decoded differences; every download target's PNG bytes equal the preview's PNG bytes. Repeats reuse the matching PNG Blob; frame changes invalidate it. Existing stale-load/racing-frame and stale-encoding assertions remain intact and pass.

The fixture intercepts anchor clicks and reads their actual Blob URLs. It verifies production download selection/encoding and filename, not native OS save dialogs or files saved by browser UI. No new physical-camera, mobile, Firefox/Safari or hosted HTTPS acceptance is claimed. All three Purple PNGs were visually inspected; their footer and all four synthetic photo regions remain visible with the existing aspect-dependent frame stretching.

### Intentional baselines

New explicit PNG-byte and decoded-RGBA SHA-256 expectations are in [baselines.json](../test/fixtures/cream-moonwalk/baselines.json), with reproducible fixture code in [browser.js](../tools/fixtures/cream-moonwalk/browser.js). These are the integration baselines for the approved artwork and watermark omission. Earlier proposal renders and historical verification hashes remain unchanged; they describe older composition behavior. Existing assertions were not relaxed.

| Output | Decoded RGBA SHA-256 |
| --- | --- |
| None 4:3 | `d8d9abec9c990de7d304c7342aecd90ff392da1855d62d55c4f99a107d394274` |
| Purple 4:3 | `a6b4fea130a46dc186477dfdb06020f9c1de29450ecbde6fbb3195bb1a278190` |
| None 16:9 | `e0c03212f432bfed1ae230ce02d29728d8e0dab55158f433a8748d2f1e69942b` |
| Purple 16:9 | `d34922a56b3dca070a21c38d82abafcf60f6318d0a61e160ce40ac079e760cd0` |
| None 3:4 | `1b56fe4aa012c25916b9aa3fddc7a6da39d6680df2b28bc09eb23bbf75eb463b` |
| Purple 3:4 | `2a49e0db0ce29519fc8ed3082102599cea96506b4311008c5ca0bfc8e0f4d080` |

Normal verification never rewrites baselines. `--write-baselines` was used explicitly for this approved integration, then a separate normal invocation passed. `FRAME_TEST_BROWSER` can choose a compatible executable; default is local Chrome. PNG encoding/sampling differences in another version require investigation, not automatic baseline regeneration. Final local PNGs, generated fixture HTML and results are written to a disposable temporary evidence directory printed by the verifier.

## Commands and failures

| Final check | Result |
| --- | --- |
| `npm test` | **231 passed, 0 failed, 0 skipped** |
| `npm run lint` | Passed, exit 0 |
| `node --check tools/fixtures/cream-moonwalk/browser.js` | Passed, exit 0 |
| `git diff --check` | Passed, exit 0; Git emitted only LF-to-CRLF working-copy notices |
| `npm run package:local` | Passed, exit 0; **43 files, 5 historical exclusions** |
| `node tools/verify-frame-pixels.js` | Passed, exit 0; all six PNG/RGBA baselines, 24 download actions and all pixel assertions |
| Package HTTP checks within `npm test` | Passed at `/` and `/snapicorn/`; every allowlisted file, mounted index and all 21 active image/font references returned source-identical bytes |

Initial failures and corrections:

- The first targeted test run failed three new fixture assertions because separately created white-fill sampler functions have different object identities. Assertions now compare exact draw rectangles and photo object identities; existing assertions were untouched.
- The first full suite discovered a browser-only helper under `test/` and failed it because Node has no `document`. The helper was moved to `tools/fixtures/`. The same sandbox run blocked existing junction/hard-link fixtures with EPERM and loopback fetch with EACCES. The full suite subsequently passed outside the restricted sandbox; none of those checks was skipped.
- Chromium could not launch its crash handler inside the sandbox. The disposable-profile verifier ran outside it. Its first real render exposed a fixture-control mismatch between Canvas sources and decoded PNG Image sources. Controls now use the same decoded source type as production; exact comparisons then passed at all ratios. No production correction or tolerance was introduced for this fixture issue.

No unresolved integration failure remains. Native browser saving and the broader release acceptance listed below remain unverified by this task.

## Packaging, preservation and changed files

The explicit allowlist is unchanged at 43 runtime files. The active frame bytes match the approved PNG. All five historical direct URLs return **404 at both mounts**, including `assets/frames/historical/purple-legacy.png`. The selected proposal PNG also returns 404; the entire proposal tree remains absent. Metadata, test and documentation URLs remain excluded, and the strict subdirectory server rejects root-level asset leakage. Repeated packaging preserves the same listing and source-identical bytes. This is local HTTP verification, not deployment.

Original proposal files were not edited. **73 proposal files** match the retained pre-refinement manifest in `proposals/pro-86-purple-frame/final-refinement/verification.json`; the approved source PNG/SVG and original watermark hashes also match. The final-refinement evidence directory and all other proposal records remain in place. Existing uncommitted watermark-reassessment documentation was preserved and supplemented with current behavior/provenance. No live Gallery records or Settings data were accessed or modified; their existing unit tests use disposable fixtures.

Changed files:

- `scripts/composition.js`, `scripts/composition-coordinator.js`: optional logo drawing and None-only watermark load.
- `assets/frames/purple.png`; new `assets/frames/historical/purple-legacy.png`: approved runtime copy and retained original.
- `tools/static-package.js`, `test/static-package.test.js`: fifth historical exclusion and proposal HTTP exclusion regression.
- `test/composition.test.js`, `test/recovery.test.js`: exact asset/geometry identity, watermark omission/restoration, switch/cache and repeated-download assertions.
- New `tools/verify-frame-pixels.js`, `tools/fixtures/cream-moonwalk/browser.js`, `test/fixtures/cream-moonwalk/baselines.json`: reproducible real-browser pixel verification and explicit baselines.
- `README.md`, `assets/ASSETS.md`, `docs/pro-86-packaging.md`, this report: current output behavior, provenance, historical distinctions and verification.
- Ignored `dist/local-package/` regenerated locally. No proposal file was added to its allowlist.

## Remaining publication gates

The [asset ledger](../assets/ASSETS.md#cream-moonwalk-local-integration--31-october-2026) distinguishes independently authored Cream Moonwalk, unresolved historical Purple, and the provisionally retained owner-attested ChatGPT watermark. Original watermark authority/input/publication clearance, the separate 12-file generated-artwork ledger, white-placeholder provenance, new-artwork public-use authorization and historical repository/archive/stale-host handling remain outstanding. Local integration is not public distribution approval.

PRO-86 remains **Backlog**, PRO-64 **In Progress**, PRO-78 **Backlog**, with no tracker changes or dependency/acceptance edits. Their remaining hosted HTTPS, physical-camera/device, accessibility and complete-flow requirements remain intact. All work is uncommitted and unstaged. No push, deployment, publication, history rewrite or further phase is authorized or performed.
