# PRO-75 implementation and verification

23 October 2026 (Asia/Manila). Scoped integration of the approved Export experience in retained vanilla HTML/CSS/JavaScript. Read the complete PRO-75 issue and comments, complete PRO-66 ADR and comments, supplied global working agreements, current PRO-74/PRO-60 foundations, and finalized 22 October ChatGPT Work handoff: AGENTS.md, DESIGN-SYSTEM.md, IMPLEMENTATION-HANDOFF.md, QA-REPORT.md, Export/Finish source and the desktop Export reference screenshot. No repository/ancestor AGENTS.md was found. The approved prototype remains unchanged.

## Sequencing and acceptance

The owner explicitly authorizes PRO-75 implementation while PRO-74 and PRO-60 remain In Progress for deferred real-device/manual acceptance. This exception is recorded on PRO-75 in Linear and applies only to its execution order. Existing blocked-by/blocking relationships, earlier statuses, manual acceptance requirements and PRO-64/PRO-78 release gates remain unchanged. PRO-75 remains **In Progress**, not release accepted. PRO-76 is not implemented.

## Implementation and ownership

| File | PRO-75 change |
| --- | --- |
| `index.html` | Separate Export step, three-step progress, Finish strip, Back to customizing, actual dimensions, Download PNG, Share strip and protected Make another strip. No Save to Gallery placeholder. Privacy wording says download requested. |
| `styles/style.css` | Approved upright lavender workmat, shared two-column Export layout, stacked phone actions, typography and existing tokens/artwork. Dynamic strip fits without cropping. |
| `scripts/export.js` | Named Finish/Back transitions, matching decoded Export preview, shared PNG preparation, current-result Blob/promise reuse, Blob URL download and cleanup. Existing PRO-60 share handling consumes the same helper and feedback region. |
| `scripts/main.js` | Registers transitions/restart, renders Export phase and focus, respects preparation/action locks, cleans resources on navigation/reset/page exit. |
| `scripts/composition-coordinator.js` | Invalidates pending export preparation and URLs when requesting changed pixels; existing compositor and publication rules unchanged. |
| `eslint.config.js` | Registers the focused shared classic-script functions. |
| `test/recovery.test.js` | Adds 22 Export/lifecycle tests to the existing session harness, adapts download assertions to async Blob URLs and retains safe-share regression coverage. |
| `test/app.test.js` | Accounts for the new Export progress indicator in semantic checks. |
| `README.md`, this file | Current flow, ownership, resource lifecycle, evidence and outstanding acceptance. |

Finish accepts only the latest successful photo/frame/sticker revision with no active gesture. It decodes that published PNG into the separate preview, clears selection UI and focuses the Export heading. It prepares a Blob without automatically downloading or sharing. Preview/Blob failures are recoverable; an encoding failure keeps Export and offers Download/Share retry. Pending/failed composition keeps Finish and export actions disabled until the existing Retry succeeds.

One `session.output` owns the published canvas/data URL and prepared PNG Blob. Finish, Download and the existing share helper join one in-flight encoding on that record; each continuation checks session, generation, revision and output identity before caching or exporting. A newer edit, accepted retake, navigation or confirmed reset rejects stale results. No second compositor, layer redraw, output-size/crop/mirror/watermark/frame/sticker-geometry/history change, runtime dependency or framework is introduced.

Back preserves the exact output, photos, frame, sticker history/cursor and redo branch. Make another strip uses the existing native restart confirmation. Keep, Escape and backdrop dismissal leave output and session untouched; confirmed restart resets camera-off. Local preparation locks are invalidated on navigation/edit so old encoding cannot block a fresh action. The existing native-share lock remains until its platform attempt settles, and its late feedback cannot affect another revision or navigation generation.

Download creates an object URL from the prepared PNG Blob and temporarily attaches an anchor named `snapicorn.png`. The anchor is removed after click. Repeated downloads reuse the same Blob and URL and renew a 60-second grace period. URLs are revoked on expiry, replacement/new composition, Back, navigation, confirmed restart and page exit. A queued expiry checks resource identity before revoking. Back/navigation may release the URL while retaining the Blob for another request; canceled restart releases neither. URL/encoding failures retain a usable strip and retry action. The grace period is pragmatic browser-consumption time, not a download-completion or durable-save signal.

Sharing retains PRO-60 capability/File checks, duplicate suppression, encoding failure, AbortError cancellation, synchronous exceptions/rejection and stale completion guards. Unsupported/canceled/failed Share keeps Download available. Success feedback is qualified: “Share request completed. Check the chosen app to confirm.” Download says “PNG download requested. Your strip is still available here.” Neither claims durable saving or delivery.

## Automated verification

- `npm test`: **146 passed, 0 failed** (124 baseline, 22 added).
- `npm run lint`: **passed**.
- `git diff --check`: **passed**, Git line-ending notices only.

New checks cover Customize → Finish → Back, heading focus, exact output/history/redo retention, pending/failed/gesture gating, repeat Blob/URL reuse without drawing, URL expiry/recreation and cleanup on all exits, canceled/confirmed restart, stale download encoding across edits/navigation/restart, stale Finish preview success, preview and Blob failure/retry, shared Download/Share encoding, unsupported/canceled/failed Share in Export, URL creation failure/retry, detached-anchor cleanup, old queued URL expiry and native rejection after Back. Existing frame/sticker/retake, dynamic geometry and stale callback regressions remain passing. These Node/VM checks mock browser Canvas and device APIs.

## Browser PNG fidelity

In-app Chromium used an isolated localhost QA fixture with asymmetric synthetic colored photographs and actual production composition/assets, Canvas, PNG Blob encoding and PNG decoding. No physical camera permission was requested; production has no synthetic/demo entry. **46 checks passed**, including 8 exact RGBA/dimension comparisons between the prepared Blob and the actual Export image, two download URL decodes per scenario, output/history retention across Back and canceled restart, mocked native outcomes and confirmed reset. No browser warning/error or unhandled error was recorded in the final run.

| Scenario | PNG dimensions | Decoded RGBA SHA-256 (Blob = Export preview = repeated downloads) |
| --- | --- | --- |
| None | 700×2090 | `842bacdbb6282a499836913a597096845110e2b6faaa5c7a54eb18de0c82f832` |
| Purple | 700×2090 | `9ac394d4bed5e6cf64a6b07ab51afd34d79095b409acaae7b2759ec9ead0e584` |
| Stickers | 700×2090 | `aeebd779651880c3d20b75c05c88a6267fdb4925339c91e1be927b95ab3afd1e` |
| Retake | 700×2090 | `3a54e3963ab52a6e024ac27855b83002c0a62f9fd7eeaadb354eae1cdb83b723` |
| None stickers | 700×2090 | `f8f44297f9561bafb98a3ef110da7532419bafe23fa0d97f2eb2cc07b5437b4e` |
| None retake | 700×2090 | `997572d1d5c25383193f0a81fc60486aabcc7b5009f776aebd46f2ced09052d1` |
| Wide | 700×1642 | `4f2617519568f0e0920bd380d70c2b33dddeba835e15e3df3e08dde5eb90bac9` |
| Portrait | 700×3490 | `800091bc1e6868cd22fe3f41151217d4e62ba63a57f4b35dd78f51fb38d939ae` |

None/Purple were checked both alone and with all four stickers/accepted mixed-aspect retakes. Wide and portrait checks retain the dynamic output contract (700×1642 and 700×3490). Native outcomes were deliberately mocked; the batch intercepts anchor clicks to inspect exact Blob URL content without creating many files.

One separate real browser Download invocation returned a new synthetic PNG in Downloads. Its **185,708 bytes exactly equal the Export preview PNG**, 700×2090, SHA-256 `8764bedbbb52619ab7620014d9abd0e49546ec55a8b38356a0bc795560dcc857`. The fixture did not delete or alter any Downloads files. A returned file/byte comparison is synthetic browser evidence, not proof of durable storage, personal-camera appearance, mobile file placement or native target delivery.

Browser results, screenshots and fixtures are local verification artifacts and are not included in the repository: `browser-results.json`, `viewport-metrics.json`, `saved-file-result.json`, `preview-synthetic.png`, `export-*.png`, `fixture.js`, `server.py`. The initial sandbox listener was unreachable; stopping the duplicate sandbox listener and using the localhost-only server outside the sandbox resolved connectivity. The first fixture run lacked capture thumbnails for retake injection; initializing those fixed the fixture, and the final 46-check run passed. These are fixture/setup corrections, not production defects.

## Responsive and keyboard evidence

| Browser viewport | Document client / scroll width | Result |
| --- | --- | --- |
| 1440×1000 | 1425 / 1425 | Two columns; upright whole strip at 198×591 CSS px; Back focus ring visible. |
| 768×1024 | 753 / 753 | Two columns, 320px action column; whole strip and actions fit horizontally. |
| 320×900 | 305 / 305 | One column; whole strip at 166×496 CSS px; Back/dimensions/actions wrap and remain reachable by vertical scrolling. |
| 844×390 | 829 / 829 | Two columns; vertical scrolling reaches Download, Share and Make another strip. |

Screenshots were saved and visually inspected at all four sizes against the approved styling. No horizontal document overflow. Keyboard Tab from the Export heading reaches Back → Download → Share → Make another strip with visible 3px focus rings; the hidden Customize controls leave the tab order. Keyboard Enter opens restart with Keep focused; Escape retains the image and returns focus to Make another strip. Programmatic transition checks also confirm heading focus. Viewport overrides were reset afterward. These are resized desktop Chromium views, not physical phones/tablets or touch tests. Intermediate breakpoints, text zoom and every browser are not exhaustively verified.

## Remaining acceptance and PRO-76 readiness

Still required: real-photo saved-file visual comparison; physical phones/tablets, touch and orientation interactions; native share success/cancel/rejection on a supporting device/receiving app, including user activation and unsupported-device download fallback; Safari/Firefox and device-specific file placement; screen-reader feedback/focus; representative memory/performance and HTTPS/static-subpath release checks. Browser file creation is not durable-save certification. All earlier physical-camera/manual acceptance and PRO-64/PRO-78 gates remain open.

PRO-76 has a reusable immutable current-revision Blob boundary and completed Export surface to consume when separately authorized. Its dependency on PRO-75 remains intact; this work neither accepts the outstanding gate nor starts Gallery, persistence or another issue. Do not add a nonfunctional Save to Gallery control.

Existing tracked and untracked work was preserved. No staging, commit, push, deployment, publication, dependency installation, prototype modification, data deletion or history rewrite occurred. Changes remain uncommitted.
