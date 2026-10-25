# PRO-74 implementation and verification

23 October 2026 (Asia/Manila). Scoped implementation of four static pixel stickers, bounded transforms, atomic sticker history and revisioned composition. Read the complete PRO-74 issue and PRO-66 retained-vanilla ADR, supplied working agreements, and approved 22 October ChatGPT Work handoff (`AGENTS.md`, `DESIGN-SYSTEM.md`, `IMPLEMENTATION-HANDOFF.md`, `QA-REPORT.md`, framework-neutral history/composition references, Frame/Stickers markup/styles and screenshot). The reference remains unchanged.

The owner explicitly authorized PRO-74 while **PRO-73 remains In Progress** for deferred hardware/manual acceptance. This exception applies only to PRO-74 execution order. Dependency relations, earlier issue statuses, PRO-64 minimum-release acceptance, carried manual requirements and PRO-78 release acceptance remain unchanged. PRO-74 remains **In Progress**, not release accepted. No subsequent issue is implemented.

## Ownership and behavior

| File | Responsibility |
| --- | --- |
| `scripts/sticker-geometry.js` | Normalize/clamp size, rotation and position against dynamic strip dimensions. Use rotated square asset boxes, with each source image contained without stretching. |
| `scripts/sticker-history.js` | Sole sticker owner: immutable transform snapshots, cursor and uncommitted gesture draft/token. No image/canvas copies in history. |
| `scripts/sticker-gestures.js` | Pure drag/resize calculations using frozen start coordinates, preview bounds and original transform. Validate pointer identity/time. |
| `scripts/sticker-editor.js` | Four asset definitions, control bindings, persistent sticker hit targets, selection, keyboard actions, tabs and zoom. |
| `scripts/composition.js` | Existing photo/watermark drawing, optional frame, then ordered stickers on a new canvas. Optional sticker arguments preserve existing callers. |
| `scripts/composition-coordinator.js` | Snapshot current photos/frame/stickers; load, draw, encode and decode before publishing a matching result. Reject stale session, operation, request and model revisions. Tag draft results separately. |
| `scripts/variables.js`, `scripts/main.js` | Session owns history/revision; UI owns selection/tool/zoom. Navigation cancels drafts, retains committed edits and retries canceled pending composition on return. Confirmed reset clears sticker history. Accepted retakes retain it. |
| `scripts/preview.js`, `scripts/edit.js`, `scripts/export.js` | Decode/present the current composition, request frame changes and gate export/share against the published revision. Delayed share encoding also checks current revision. |

Adding, removing, changing size/rotation and arrow movement use the same constrained history path. Each moved drag/resize commits exactly once on pointerup. Selection, unchanged gestures and zoom add no entries. New edits after Undo discard redo. Cancel, lost capture, Escape and navigation discard drafts without touching committed snapshots. Gesture token closures and pointer timestamps reject stale move/end events, including reuse of a pointer ID. Undo/Redo affect stickers alone, never photos, frame choice, retakes or session navigation.

Frame/Stickers tabs support Left/Right and Home/End, roving tab stops and labeled focusable panels. Size and rotation use native sliders (8–45% and −180…180°). Focused sticker targets support arrows (one output pixel), Shift+Arrow (ten pixels), Delete/Backspace and visible selection/corner handles. Pointer capture and `touch-action: none` support mouse/touch-compatible events; this is not physical-touch acceptance. Native disabled export controls and Retry expose pending/failure recovery. Preview zoom spans 80–140%, with internal scrolling above fit size.

Markup/styles live in `index.html`, `styles/style.css` and the existing foundation. The reduced-motion button rule excludes sticker transforms, so reducing decorative motion cannot remove positioning/rotation. Explicit classic-script registration loads geometry/history/gesture functions before session initialization, and coordinator/editor bindings before main initialization. `eslint.config.js` registers their shared names. No framework, bundler, dependency or generic state layer was added.

## Composition and image fidelity

Every request starts from the current four photo records and original watermark, uses the existing dynamic aspect, then applies the selected frame and stickers in insertion order. It never draws onto an earlier published canvas. The established output remains 600px photo width, aspect-rounded photo height, 50px padding, 30px gaps and 100px watermark region. Baselines remain **700×2090**, **700×1642** and **700×3490** for 4:3, 16:9 and portrait 3:4 inputs. Capture mirroring, photo order, no-added-crop behavior, original watermark/Purple asset and filename `snapicorn.png` remain intact.

Only a successfully encoded and preview-decoded current revision can export. Pending or failed requested edits retain their model/controls and disable Download/Share; Retry recomposes them. Last-good pixels may remain visible/internal during recovery but cannot be exported as the requested edit. A rendered draft retains its gesture token, so cancellation/navigation cannot accidentally bless it as committed output. Stale success, failure and finally paths cannot publish or unlock controls. The separate PRO-60 native-share rejection gap is unchanged.

The preview stage uses the decoded image's **natural** dimensions. Browser checking caught that CSS-rounded `width`/`height` could otherwise introduce aspect drift on repeated publication; the regression fixture now deliberately separates CSS and intrinsic sizes. UI zoom, handles, workmat/backdrop and selection styling never enter composition.

Four PNGs were copied byte-for-byte from the approved handoff, without conversion or alpha changes. All have RGBA PNG headers; Rainbow retains its 1448×1086 aspect, and the other three are 1254×1254. The tray uses pixelated sampling. Canvas image smoothing is disabled only inside each sticker's save/restore (including drawing failures); photos/frame/watermark use normal sampling. Rotation/scaling can still create transformed edges; integer-grid perfection at every angle is not asserted.

| Asset | SHA-256, equal to approved source |
| --- | --- |
| Star | `1392c87692e6feded1cec384ab5465b4c286dcfd9e889e9d1a255fbd63ca7b87` |
| Rainbow | `a71c3af2824db8575156075c6ed58170c9956e64a58614b662cb2926be43f1d8` |
| Unicorn | `203fe04818f29c09030c503ce8cf175f451e37245661e1244778012eab838902` |
| Heart | `fcab2d5e5a4cdac25ad8ecece7f343da469e36c66631646373d5ce6b09aaec7d` |

See `assets/ASSETS.md` for source paths/provenance. Existing watermark/frame rights remain unresolved in their owning work.

## Automated verification

- `npm test`: **103 passed, 0 failed** (79 baseline tests before this task).
- `npm run lint`: **passed**.
- `git diff --check`: **passed**, with Git LF-to-CRLF notices only.

`test/stickers.test.js` covers actual-aspect rotated bounds, pointer math, exact history restoration, remove/undo, redo branching, atomic gestures, cancellation and stale tokens. `test/composition.test.js` retains the established asymmetric photo fixtures and adds ordered stickers after the frame, non-square asset fitting, fresh output and scoped smoothing/restoration on failure. `test/recovery.test.js` extends the existing session/camera/retake harness with all four stickers, keyboard/sliders, selection/no-ops, drag/resize, stale move/end events, cancel/lost capture/Escape/navigation, draft-result gating, requested-render failures/retry, stale success/error/finally, intrinsic-size preview regression, repeated exports without additional draws and delayed-share revision rejection. Photo/retake/session regressions remain passing. Old frame rollback assertions were updated to the explicitly allowed retain-request-and-retry policy.

These are controlled Node/VM image/canvas tests, not real PNG pixel or physical-device acceptance.

## Browser evidence

Used the in-app Chromium browser on a separate **PRO-74 QA · Synthetic video only** fixture. It supplies canvas video only inside that external fixture; production has no demo entry or camera fallback. No physical-camera permission was requested. The initial sandboxed localhost server was unreachable; local-only serving succeeded outside the network sandbox. Diagnostic JSON initially caused fixture-only document overflow; wrapping the diagnostic text corrected it without a product layout change.

Verified four approved assets and transparent appearance, four keyboard edits with exact four-Undo/four-Redo restoration, a mouse drag and corner resize each creating one entry, size/rotation sliders, Frame/Stickers keyboard tabs, Purple compatibility, stable intrinsic aspect over repeated renders and unchanged preview source during zoom. One long browser drag was interrupted by the automation's hit-testing error after a partial move had committed; the resulting single entry was inspected. Corner resizing completed successfully. This does not establish exhaustive pointer or touch acceptance.

At 140% zoom, the desktop strip was about 251×750 CSS px inside a 552px-high viewport, which scrolled internally. Zoom left the composed image source unchanged. At 100%, all four photos fit the internal viewport. Mobile and landscape controls were reached with keyboard focus and visually inspected.

| Viewport | Document client / scroll width | Layout |
| --- | --- | --- |
| 1440×1000 | 1425 / 1425 | Two columns |
| 768×1024 | 753 / 753 | Two columns |
| 320×900 | 305 / 305 | Stacked preview/tools; wrapped preview toolbar |
| 844×390 | 829 / 829 | Two columns; vertical page scrolling to actions |

700/701, 800/801 and 900/901 boundaries were also measured with no document horizontal overflow. All fit the full 4:3 output at 100% preview zoom. A maximum-size diagonal sticker stayed within the composition bounds; UI AABB rounding was below 0.02 CSS px. Handles may extend outside the image because they are editing decoration.

Fresh synthetic portrait and wide sessions also decoded to **700×3490** and **700×1642**. At 100%, their desktop stages were approximately **107.5×536** and **198×464.4** CSS px inside the 552px-high internal viewport, without internal clipping. The wide session included Purple and all four stickers; the 45% diagonal sticker's DOM bounds fit the stage. Final browser warning/error log was empty. These are synthetic aspect checks, not actual camera/file fidelity acceptance.

The server, viewport metrics, screenshots and check outputs are local verification artifacts and are not included in the repository: isolated `server.py`, `viewport-metrics.json`, `aspect-metrics.json`, desktop/tablet/mobile/landscape screenshots and `npm-test.txt`, `npm-lint.txt`, `diff-check.txt`. All photographs in those artifacts are synthetic.

## Outstanding acceptance and handoff

Still unverified: physical touch/phone/tablet input and tiny-target usability; actual camera permissions, readiness, interruption and hardware cleanup; real preview versus downloaded/decoded PNG fidelity for all assets/None/Purple/aspects and repeated exports; Safari/Firefox/other browsers; screen-reader announcements and complete accessibility acceptance; OS reduced-motion switching and browser/text zoom; sustained phone memory/render performance; native-share destinations/cancel/rejection; hosted HTTPS/subpath and release acceptance. Browser synthetic preview encoding/decoding does not close the real PNG/file gate. Existing deferred PRO-73 and earlier requirements remain mandatory before release.

The implementation is ready for owner/code review, with PRO-74 acceptance still open. PRO-75 is not started; its export work must carry this current-result contract and the separately owned PRO-60 sharing requirement. No PRO-60, PRO-75, Gallery, Settings, animation/GIF or Magic Mode was implemented.

Pre-existing tracked and untracked PRO-62/63/73 work and their verification notes remain. Additional affected files include `README.md`, `assets/ASSETS.md`, the four files in `assets/stickers/`, and `test/app.test.js` for classic script registration. No Git staging, commit, push, deployment, publication, history rewrite or destructive cleanup occurred. Work remains uncommitted.
