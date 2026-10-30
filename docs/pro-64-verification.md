# PRO-64 minimum-release verification

**Latest pass:** [25 October 2026 remaining local camera acceptance](#remaining-local-camera-acceptance--25-october-2026) resumes checkpoint `b399321` and preserves the [hardware and real-PNG evidence](#hardware-and-real-png-acceptance--25-october-2026). No additional physical scenario could run because owner participation and the Brave connection were unavailable. Denial/interruption, visual orientation, hosted HTTPS, device/browser/accessibility and asset-rights requirements remain open. The older matrices below are historical; PRO-64 remains **In Progress**.

**Follow-up:** D1 is fixed and locally verified under [PRO-79](https://linear.app/botlog/issue/PRO-79/bug-keep-capture-placeholders-inside-the-static-application-mount); see the addendum below. The original verification remains historical evidence. PRO-64 remains incomplete with its other acceptance requirements unchanged.

23 October 2026 (Asia/Manila). **Gate incomplete; do not release or mark Done.** Verification covers the current uncommitted vanilla JavaScript application after PRO-77. No application behavior, assets, dependencies, output contract or hosting configuration was changed. PRO-78 was not started.

## Baseline and evidence boundaries

Read the complete PRO-64 issue and comments (none), its dependencies and earlier PRO-56–62 acceptance requirements, PRO-77/78 scope, README, asset inventory, current capture/composition/export/navigation code, tests, and existing PRO-60–63/73–77 verification reports. No repository, ancestor or nested AGENTS.md was found; the supplied global working agreements apply.

HEAD is `70b44b651f19d212af3835db0c63970e854641f3`. The working tree already contained tracked and untracked implementation, tests, assets and verification documents. A starting status inventory and SHA-256 inventory were retained outside the repository. This verification adds this report and a README link; all pre-existing implementation is preserved. Nothing was staged or committed.

Executed once against the current working tree:

| Check | Result |
| --- | --- |
| `npm test` | **Passed: 220 tests, 0 failures, 0 skipped** |
| `npm run lint` | **Passed**, exit 0 |
| `git diff --check` | **Passed**, exit 0; existing LF/CRLF notices only |
| Enumerated local HTTP resource sweep | **Passed: 42 resources × two prefixes = 84 matching responses**; this sweep omitted one runtime `../assets/` path, investigated separately below |
| Runtime placeholder under strict subdirectory delivery | **Failed**: escaped URL 404; correct subdirectory asset 200 |
| Downloaded None PNG decoding/content | **Passed: 20 assertions**, including exact preview/file bytes |

Node `v24.22.0`, npm `11.19.1`. No install or build is required for the app. README's existing static-server and verification commands match package.json and the direct HTML/classic-script application. Tests use disposable doubles; no tests ran against user storage.

Historical evidence was reused rather than rerunning the full earlier synthetic batches. PRO-61/73/74 cover Capture/editor/Review at desktop, tablet, narrow portrait and landscape widths; PRO-62 covers accessibility semantics; PRO-60 covers sharing failure handling; PRO-75 covers decoded Blob/preview/download-URL equality, wide/portrait geometry and one prior actual synthetic download; PRO-76 covers isolated Gallery storage; PRO-77 covers current navigation and motion styling. The retained PRO-75 `saved-file-result.json` and browser results, and PRO-77 browser results were inspected. These retain their original scope and limitations. In particular, intercepted Blob URLs are not files saved to disk, simulated media is not a physical camera, iframes/resized views are not physical devices, and semantics are not spoken screen-reader acceptance.

## Environments and isolation

- Windows desktop environment: registry display version `25H2`, build `26200.9711`. The legacy registry product label says Windows 10 Pro; no marketing-version inference is used.
- Codex in-app Chromium: reported UA `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36`. Exact Chromium patch build and physical device model were not exposed/recorded.
- Connected Brave: executable product version `155.1.97.59`. This is another Chromium browser, not Firefox/WebKit coverage.
- Local URLs: `http://127.0.0.1:8094/`, `/snapicorn/`, the explicitly labeled external `/qa/fixture`, and strict subdirectory-only `http://127.0.0.1:8095/snapicorn/`. Loopback is a browser secure context, **not hosted HTTPS acceptance**.

The QA servers bind only 127.0.0.1. Port 8094 maps the unchanged working tree to both local prefixes; port 8095 makes resources outside `/snapicorn/` unavailable to expose base-path escapes. The fixture alone adds an external prelude. It blocks IndexedDB opens and preference writes, returns no remembered preference, and supplies a labeled synthetic canvas stream only in synthetic mode. The real-mode fixture leaves getUserMedia unmodified. Production files have no fixture route, demo or fallback. On the unmodified pages no Gallery save/delete or preference change was performed. No production/prototype database was opened by the QA prelude, migrated, cleared or deleted. Existing Downloads files were not changed; only the new run-owned download was copied into the evidence directory.

Initial sandbox listener access timed out; an approved localhost-only listener outside the sandbox resolved connectivity. A stale browser error tab was replaced with a fresh tab. A browser read-only evaluation could not expose navigator; environment metadata was subsequently collected by the external fixture. One locator wait expired before the normal twelve-second capture completed; subsequent observation confirmed successful Review. These were harness/access limitations, not application failures.

## Verification matrix

**Passed** applies only to the evidence named in that row. **Failed** is a reproduced unmet criterion. **Blocked** means required access or an observable outcome was unavailable. **Not Tested** means no corresponding exercise occurred. One application path defect was confirmed. An unavailable result is not a pass.

| Requirement / evidence level | Status | Actual evidence or remaining gap |
| --- | --- | --- |
| Enumerated local HTML, classic scripts/order, CSS, fonts, logo, frames, stickers, artwork and license notices | Passed | 42 resources at both `/` and `/snapicorn/`: HTTP 200 and exact working-tree bytes; correct JS/CSS/image/font response types recorded. Runtime placeholder is assessed separately below; the sweep is not proof of every resource. |
| Runtime capture placeholder at root | Passed | `../assets/imgs/placeholder-white.png` resolves to `/assets/imgs/placeholder-white.png`, HTTP 200 and exact working-tree bytes on the root mount. |
| Every runtime resource stays inside a subdirectory mount | Failed | Capture placeholders escape `/snapicorn/`. All four images decode with naturalWidth 0 on the strict mount; escaped URL 404 while `/snapicorn/assets/imgs/placeholder-white.png` is 200. See defect D1. |
| Local browser root/subdirectory Home initialization and captured console | Passed | Unmodified Home loaded in in-app Chromium and Brave; `/snapicorn/` Home loaded in both. No captured warning/error messages on the inspected pages. Fixture image resources decoded and all four declared font faces reported loaded. Lazy original watermark/Purple loaded during composition. This is not an exhaustive network HAR; even the strict-mount placeholder 404 was not exposed by the browser console collector. |
| Configured HTTPS URL/root/subpath | Blocked | Owner explicitly confirmed **there is no existing approved HTTPS endpoint** serving this tree. No hosting configuration, publication or remote deployment was changed or inferred from the Git remote. |
| Explicit camera-off entry | Passed | Keyboard Enter opened Capture, focused its heading and showed CAMERA OFF. Synthetic fixture recorded no requests before activation; Enable alone requested video with `audio: false`. |
| Real permission allow/deny/retry and readiness | Blocked | Both available browsers reached Opening camera… after Enable, with no accessible permission decision or usable hardware video. Both requests were canceled through Cancel / Exit. No successful permission, denied-permission outcome, absent-camera diagnosis or hardware support is claimed. |
| Permission/device/readiness failures, interruption, image/canvas errors and retry | Passed | Current automated suite covers failure/readiness bounds, late startup cleanup, interrupted tracks, drawing/encoding/image failures, bounded image loads and retry. Hardware/error acceptance remains blocked. The eight-second readiness timeout starts after playback; it does not bound a pending user permission request. |
| Four-photo order / full composition | Passed | Current synthetic browser completed four normal three-second countdowns to numbered Review, then Customize/Export. Actual None file has red, green, blue, yellow photos in order and expected asymmetric edges. |
| Cancel and fresh retry | Passed | Space started countdown and focused Cancel. Enter on Cancel returned Home; synthetic track ended. Fresh Start → Enable → capture completed. Cancel also exited each unresolved real camera request to usable Home. |
| Two consecutive sessions | Passed | Two complete synthetic four-photo sessions on one page, with confirmed restart between them. Second Review had exactly four photos; reset began camera-off/None. This does not accept two physical-camera sessions. |
| Stream release in synthetic flow | Passed | After cancellation and both completed sessions, all three supplied tracks were `ended`; second Review had no attached video source. |
| Physical sessions / camera indicator shutdown | Blocked | No hardware stream, LED, browser privacy indicator, real disconnect or device cleanup was observable. |
| None/Purple selection and preview | Passed | None exported; ArrowRight selected Purple, which rendered the original frame over the strip and enabled Finish. Both previews decoded at 700×2090. No output contract was changed. |
| Actual None PNG file | Passed | Production Download returned a new file, decoded and compared as described below. This is a real downloaded synthetic PNG, not a real-photo file. |
| Actual Purple file / repeat-download files | Blocked | Repeated None and subsequent Purple UI requests reported PNG download requested, with no captured browser errors, but no additional file appeared in the observed `snapicorn*.png` Downloads inventory. Their actual file content/repeat equality is unverified. Do not infer an application defect or a successful save from request feedback. |
| Dynamic geometry / mirror / watermark / repeated composition | Passed | Current deterministic suite plus retained synthetic browser PNG/Blob evidence covers 4:3, 16:9 and portrait 3:4, one mirror, order, watermark/frame placement and repeatability. Current actual downloaded file validates 4:3/None only. |
| Real-photo orientation, crop, both frame files, dynamic aspects and repeat-download consistency | Blocked | Requires working hardware/owner files. Earlier Blob equality and current synthetic-file equality do not satisfy this real-world acceptance. |
| Narrow portrait/landscape CSS layouts | Passed | Reused documented synthetic browser evidence at 320×900 (305px usable width) and 844×390, plus desktop/tablet/breakpoint coverage in PRO-61/73–77. Current run inspected the desktop Purple Export. No physical orientation claim. |
| Physical phone/tablet layouts, touch, orientation and performance | Blocked | No physical mobile/tablet environment available through the verification surfaces. |
| Keyboard and dialog behavior | Passed | Enter/Space start/capture/cancel, heading/Cancel focus, frame ArrowRight, Download Enter, restart initial Keep focus, forward/backward boundary wrapping, Escape preservation/return focus, and retake Escape returning to Retake photo 1 with four photos retained. Scope is desktop Chromium; this was not a complete keyboard-only traversal of every new feature. |
| Screen-reader speech, actual OS reduced-motion switching and real browser/text zoom | Not Tested | Source/automated and prior simulated evidence exists. No named screen reader, actual OS setting change or native 200% zoom exercise occurred. |
| Shipped Share safety | Passed | Current automated coverage and PRO-60/75 synthetic outcomes cover unsupported capability, encoding failures, rejection/cancel, stale results and Download fallback. Enabled sharing is implemented with error handling. |
| Actual native sharing / receiver delivery | Not Tested | Optional at this minimum gate; no native target was invoked. API success alone would not prove destination delivery. |
| Firefox / Safari / Android browser acceptance | Not Tested | Neither browser/device combination was exercised. Brave plus in-app Chromium does not establish cross-engine support. |

## Actual downloaded-file evidence

The production Download action returned a PNG file (browser collision suffix; the app still requests `snapicorn.png`). The file is **59,739 bytes, 700×2090**, SHA-256 **`a9253fa541f02f912d8f07ba8086b5219c818e77035fd49322ce29a8c782451c`**. A copy is retained as `download-none-1.png`; no existing file was replaced.

Its full encoded bytes equal the actual Export preview data URL saved as `reference-none.png`. Independent Pillow decoding passed 20 assertions: dimensions/byte equality; each photo's ordered color, complete expected slot height, white left edge/black right edge after the single capture mirror; white None padding; and nonempty watermark pixels. Visual inspection confirmed upright photos, mirrored numbers, all four slots and the original watermark. This synthetic fixture cannot establish personal-camera EXIF/device orientation behavior.

The expected contract remains 600px photo width, `round(600 * inputHeight / inputWidth)` photo height, 50px padding, 30px gaps and 100px watermark region. Four 4:3 photos yield 700×2090; 16:9 yields 700×1642; portrait 3:4 yields 700×3490. Purple stretches the existing frame over the full output. None removes it. Real wide/portrait **downloaded** files were not produced in this run.

The native download event/path call took approximately twenty minutes despite a requested short timeout. Further requests used ordinary UI actions plus a before/after Downloads inventory; no additional new files were observed. The missing files remain an acceptance gap, not a pass or a diagnosed product defect. The retained Purple reference/screenshot is preview evidence only.

## Owner checklist to complete the minimum gate

Run on an owner-approved endpoint only after it exists; publication needs its own authorization. Use a fresh disposable browser profile/site origin and non-sensitive test subjects. Do not clear or delete the existing Gallery or change the owner's current settings. Each row starts **Not Tested** for the owner; record Passed/Failed/Blocked with artifact names when executed.

For every run record: local date/time, full URL including subdirectory, tested revision/artifact identity, device model, OS/build, full browser version, camera/front-or-rear and negotiated video width×height, orientation, permission starting state, display/zoom and input method. For assistive checks also record screen-reader name/version. Do not infer any unrecorded environment from this report.

| Action | Expected result | Evidence to retain |
| --- | --- | --- |
| In desktop Chromium, open approved HTTPS root and configured trailing-slash subpath in fresh tabs; reload with Network and Console open. Traverse Home → Capture → Review → Customize → Export using the rows below so lazy assets load. | Every current HTML/script/CSS/font/logo/frame/placeholder/artwork resource resolves under the intended base; no relevant 404, mixed-content, decode or uncaught script errors. | Exact two URLs/revision, network export or failed-request list, console export, screenshot of rendered Home/Export. If only one host path is configured, record that limitation and arrange the other through separately authorized hosting. |
| From fresh permission state choose Start Photobooth; wait; then Enable camera and deny. Retry after explicitly allowing camera through the browser UI. | Start stays camera-off without a permission request. Denial gives usable feedback; explicit retry reaches nonzero live video and only then enables Take 4 photos. Audio remains off. | Short recording including permission UI, camera status, browser version and camera dimensions. Never treat a pending prompt as denied. |
| Enable and start capture. Cancel on photo 2's countdown; start again without reload. Navigate Home during another live countdown; return and retry. | No stale photo/countdown enters the new session; four fresh slots start at 01; camera indicator/LED turns off after cancel/navigation and can restart. | Recording showing countdown, control focus/status and physical/browser indicator before/after; measured shutdown delay. |
| Capture four distinct poses/cards labeled 1–4 with an asymmetric left/right marker. Customize/finish, keep a downloaded copy, then Make another strip → Keep/Escape; finally confirm Start new strip and complete four different photos. | Exactly four photos in correct order in both sessions; Keep/Escape retains output/focus, confirmed reset starts camera-off with no previous photos; completion releases the camera. | Two-session recording, both Review screenshots, camera dimensions and indicator shutdown after each session. |
| On a disposable camera setup, disconnect the camera during capture; if feasible reproduce delayed readiness. Retry on the same page. During slow composition/loading use the available exit/navigation path. | No stuck capture/export or leaked active stream; concise recovery feedback, retained originals where promised and successful explicit retry. Pending image callbacks cannot publish into a new session. | Exact interruption steps/timing, status/console, indicator state and retry result. If not reproducible or no disconnectable camera, record Not Tested rather than simulate a pass. |
| For the labeled 1–4 session select None → Purple → None → Purple rapidly. Wait for the final selection, Finish, save the actual PNG; go Back, select None, save it too. Download each current result twice, acknowledging normal browser file prompts. | Final selected frame matches preview **and each saved file**; no old revision is exported. Repeats decode to identical pixels for the unchanged revision. PNG remains usable after unsupported/canceled sharing if tested. | Open saved files in an independent viewer; retain exact files/byte sizes/dimensions, hashes or decoded-pixel comparison and matching preview screenshots. Request feedback alone is insufficient. |
| Repeat the saved-file comparison with a real wide input and a portrait input where hardware/browser actually supplies those dimensions. Keep top/bottom and left/right markers visible. | Output is 700 × `[4*round(600*h/w)+290]`; complete source aspect, one expected mirror, order, watermark, selected frame and no UI decorations. Merely rotating a viewport may not change camera dimensions. | Recorded negotiated width×height, original scene/orientation, downloaded None/Purple PNGs and dimensions/pixel/visual comparisons. Expected examples: 700×1642 at 16:9, 700×3490 at 3:4. |
| On a real iPhone/iPad Safari and representative Android Chrome, run the core flow in portrait, rotate to landscape during Capture and again in Customize/Export; scroll to lower actions. | Four photos and Enable/Cancel/frame/Finish/Download remain reachable without horizontal clipping. Orientation does not corrupt capture/session/output. | Device/OS/browser versions, portrait/landscape recordings and actual saved-file location/appearance. Resized desktop windows cannot close this row. |
| With keyboard only, use Tab/Shift+Tab, Enter/Space and radio arrows through Start, Enable, capture/cancel, frames, Finish, Download and restart. Check retake/restart dialog Escape and boundary wrapping. Repeat narrow/landscape and native 200% browser/text zoom. | Visible 3px focus, appropriate heading/Cancel focus, clean names/checked values, no hidden-screen tab stops, trapped modal focus and focus return. No essential action/text clipped. | Short recording/AX inspection with zoom and viewport recorded; list any unreachable control and exact key sequence. |
| With a named screen reader/browser/OS (for example NVDA with desktop Chromium), run one capture/cancel and one completed sequence; then toggle the actual OS reduced-motion preference and test the app's explicit override in the disposable profile. | Countdown identifies photo and digits without a blocking backlog; progress/errors/frame/dialog changes make sense. Motion reduction suppresses decoration while numbers/progress, mirrored video and image transforms remain visible. | Reader/version/browser/OS, spoken-output notes or recording, focus/status results and both actual OS/explicit-setting states. Keep this separate from prior simulated matchMedia results. |

The full sticker/history, Gallery capacity/quota/deletion/multi-tab, Settings persistence and full cross-browser design acceptance belong to PRO-78 and their owning issues. This checklist does not authorize those destructive/storage scenarios or start PRO-78. Native share testing is optional for PRO-64; any future real native send requires an explicitly chosen test destination.

## Blockers, failures and handoff

### D1 — capture placeholder escapes a subdirectory (P2)

Source: `scripts/preview.js:81`, `img.src = '../assets/imgs/placeholder-white.png'` inside `addPlaceholderImages()`.

Reproduce without a camera:

1. Serve the current tree only under `/snapicorn/`, with no app assets at the host root. The external harness can reproduce this with `python server.py 8095 --strict-subpath` from the evidence directory.
2. Open `http://127.0.0.1:8095/snapicorn/` and activate Start Photobooth.
3. Inspect `#preview-strip img`: all four `src` attributes are `../assets/imgs/placeholder-white.png`, resolved as `http://127.0.0.1:8095/assets/imgs/placeholder-white.png`, with `complete: true` and `naturalWidth: 0`.
4. Request that escaped resource: **404**. Request `http://127.0.0.1:8095/snapicorn/assets/imgs/placeholder-white.png`: **200**, exact repository asset bytes.

Expected: each placeholder resolves within the application mount and decodes successfully. Actual: every placeholder escapes one directory. Numbered cards remain visible through CSS; this evidence does not claim that capture/composition itself fails. Root delivery works and a host with a duplicate root asset can mask the defect, as the initial dual-root QA server did. The current passing resource test inspects HTML/CSS references, not this JavaScript-assigned URL.

This fails PRO-64's every-resource/subdirectory criterion. A **separate, focused implementation issue is needed before subdirectory acceptance**: correct the runtime base path and add a strict mounted-resource regression. No application fix, new tracker issue or dependency change was made in this verification-only task. Evidence: `strict-subpath-browser.json`, `strict-subpath-http.json`, `strict-subpath-capture.png`, and `strict_subpath_check.py`.

Other environment observations remain undiagnosed: open the local real-camera page, Start → Enable → Opening camera… without an accessible permission decision; Cancel returns Home. After the one confirmed None file, repeat None/Purple requests show requested feedback but no newly observed files. Neither observation identifies its cause sufficiently to file a separate software defect. If owner execution reproduces an application failure, retain steps/environment/artifacts and scope its fix separately.

Release blockers remain: **D1 for subdirectory acceptance**; approved hosted HTTPS/current-artifact verification; real permissions/readiness/interruption/indicator cleanup and two physical sessions; real photo/None/Purple/aspect/repeat-file acceptance; physical responsive/accessibility coverage. The earlier asset inventory also retains unconfirmed publication rights for the original watermark/Purple frame (and unused VintageCharm font); this is an existing owner clearance question, not a newly diagnosed code defect.

PRO-64 is **In Progress**, not Done. Earlier issue statuses/dependencies remain unchanged; PRO-56–62 acceptance is not silently closed. PRO-78 remains the separate full-experience gate and was not executed. The implementation and synthetic baseline are available for subsequent acceptance, but neither release gate is satisfied. D1 needs separately scoped implementation; hosting/access, owner execution and rights confirmation remain required.

Supporting browser results, screenshots and fixtures are local verification artifacts and are not included in the repository. Retained files include baseline status/hashes, `static-results.json`, `state-synthetic-*.json`, `keyboard-results.json`, `browser-logs.json`, `download-none-result.json`, `download-none-1.png`, `reference-none.png`, `reference-purple.png`, `png-results.json`, `export-purple.png`, the download inventory and external server/fixture/check scripts. The run-owned server/tabs were closed after evidence collection. No commit, push, deploy, publication, hosting change, application fix, user-data deletion or framework migration occurred.

## PRO-79 addendum — placeholder path fix, 23 October 2026

Searched Linear for placeholder issues (including archived issues) and Snapicorn path issues; no existing issue covered D1. Created PRO-79 as a narrowly scoped Bug blocking PRO-64, with reproduction, expected/actual behavior and acceptance criteria. No ancestor or repository AGENTS.md was found; the supplied global agreements apply. Linear's optional shared-context tool returned unavailable; issue/report/source evidence was read directly.

Changed only the placeholder assignment in `scripts/preview.js` from `../assets/imgs/placeholder-white.png` to `assets/imgs/placeholder-white.png`. Classic-script image sources resolve against the HTML document, so the document-relative path works at both mounts without deployment-specific configuration. Nearby runtime watermark, Purple frame, frame-thumbnail and sticker paths already use document-relative `assets/` URLs; no related change was needed. Camera, composition, frames, stickers, Gallery storage, Settings and export implementation were untouched by this fix.

Added `test/placeholder.test.js`. It invokes the production `addPlaceholderImages()` function with disposable DOM doubles, resolves all four assigned image URLs against each application mount, then requests each from a loopback server that serves only the expected mounted placeholder path. It checks HTTP 200, exact asset bytes, image alternatives and drag behavior. The original source failed the strict subdirectory assertion (`/assets/` instead of `/snapicorn/assets/`); the fixed source passes both cases. A root-relative regression also fails the mounted-path assertion. Browser decoding is verified separately below.

| Local verification | Result |
| --- | --- |
| Root browser: `http://127.0.0.1:8096/` → Start Photobooth | All four actual Capture placeholders complete and decode at 1214×1093; resolved `/assets/imgs/placeholder-white.png` |
| Strict browser: `http://127.0.0.1:8097/snapicorn/` → Start Photobooth | All four complete and decode at 1214×1093; resolved `/snapicorn/assets/imgs/placeholder-white.png` |
| Independent HTTP checks | Both correct URLs return 200, 7,645 bytes; strict server's escaped `/assets/imgs/placeholder-white.png` returns 404 |
| `npm test` | Passed: 222 tests, 0 failures, 0 skipped |
| `npm run lint` | Passed, exit 0 |
| `git diff --check` | Passed, exit 0; existing LF/CRLF notices only |

The browser checks used the Codex in-app Chromium surface on Windows, unmodified app pages on run-owned loopback ports, and the normal Start Photobooth control. No camera enable, Gallery action or Settings change was performed. Automated storage tests use existing disposable doubles. The sandbox initially denied a test loopback connection; the focused test and full suite then passed with approved local networking. This is local placeholder verification only, not hosted HTTPS, hardware, cross-engine or full-flow release acceptance.

The browser and server outputs are local verification artifacts and are not included in this commit. Servers bind only 127.0.0.1; the strict server exposes no root assets. Run-owned browser tab and servers were closed after verification.

D1 is resolved in the current uncommitted working tree. PRO-64 remains **In Progress**, with its acceptance criteria unchanged. Remaining blockers: approved hosted HTTPS/current-artifact verification; real camera permissions/readiness/interruption/indicator cleanup and two physical sessions; actual real-photo None/Purple/aspect/repeat-download files; physical responsive and accessibility acceptance (including spoken screen reader, native zoom and actual OS motion); existing watermark/Purple publication-rights clearance (and unused VintageCharm inventory question). Earlier issue acceptance is not inferred, and PRO-78 was not started. All pre-existing uncommitted work was preserved; nothing was staged, committed, pushed, deployed or published.

## Hardware and real-PNG acceptance — 25 October 2026

**PRO-64 remains In Progress; release acceptance is incomplete.** This pass resumes at `b399321dd6e2f061c248117d1281d84a9de1b272`, initially a clean checkout. It changes this report only. No implementation, dependency, asset, test or hosting change was made. No Gallery destination, save, read, deletion or Settings action was used. Existing Downloads images were inventoried by filename/size/time only; only the four newly produced files named below were read and copied to local evidence. No commit, push, deployment or publication occurred.

Read the current issue/comments, PRO-78, project issue inventory, prior report/addendum, README, asset-rights inventory and relevant camera/session/composition/export code. No ancestor/repository/nested AGENTS.md was found; the user-supplied global agreements apply. Earlier statuses/dependencies are preserved, including PRO-79 In Progress despite its locally verified fix, PRO-63 Done, PRO-60 In Progress and PRO-78 Backlog. Historical Backlog statements in earlier issue prose do not describe PRO-64's current state.

### Environment and evidence limits

- Windows registry: display version **25H2**, build **26200.9711**; Brave executable product version **156.1.98.60**. Device/webcam model was not supplied. No Firefox, Safari or mobile-device execution occurred.
- Unmodified local app at **http://127.0.0.1:49364/**, served with `python -m http.server 49364 --bind 127.0.0.1`. This is loopback development, not hosted HTTPS acceptance. The sandboxed listener was unreachable; an approved loopback-only listener outside the sandbox worked. Run-owned servers and tab were closed at the end.
- The owner granted permission and explicitly confirmed a **physical webcam**, not a virtual camera. Browser video reached **600×450**, readiness state 4, playing; capture enabled afterward. No synthetic stream or fixture was used in this pass. The owner confirmed the scene was intentionally dark. Different encoded images/noise establish fresh captures, but these images cannot establish recognizable-world orientation, mirror direction or edge landmarks.
- Native Computer Use stopped when it could not confidently determine Brave's URL. After the owner's permission grant, browser DOM control worked. The DOM wrapper did not expose MediaStream track objects; an omitted `srcObject`/track value is not proof of no stream. Shutdown evidence combines paused/zero-size video after exits with the owner's physical LED observations; retained-track `readyState` enumeration and shutdown latency were not measured.
- Automated Download actions showed request feedback but produced no observed files; a five-second download-event wait expired. The owner clicked the production Download action twice per result, producing four actual files. This successful manual path does not identify an application download defect. Clicking the visually hidden frame input did not select it; native ArrowRight selected Purple. The visible label was not tested by pointer. A sticker movement attempt used an incompatible accessibility-role locator and did not run; no movement result is claimed. Locator timing/access limitations are not product failures.

### Current verification matrix

Passed applies only to the stated environment and evidence. Blocked means a required observable result/access is unavailable; Not Tested means the exercise did not occur. No new application defect was confirmed, so no bug issue was created. The project issue inventory was checked; known D1 remains owned by PRO-79.

| Requirement | Status | Evidence / remaining limit |
| --- | --- | --- |
| Baseline identity and earlier automated/local-path evidence | Passed | Clean initial HEAD `b399321`; no app diff. Of 57 inventoried historical app/test/package/assets files, 56 hashes match; only `scripts/preview.js` differs as expected from PRO-79. Reuse the historical 222-test/lint and strict-mount fix evidence, without claiming a fresh suite run. |
| Camera-off entry, permission allow, ordinary readiness | Passed | Start showed four pending slots, CAMERA OFF and focused Capture heading. After the owner allowed access, physical webcam played at 600×450 and Take 4 photos became available. Repeated explicit Enable operations reached readiness. |
| Permission deny and allow/retry after denial | Not Tested | Permission was granted by the owner; no denial outcome was exercised. Pending permission must not be treated as denial. |
| Delayed readiness and physical interruption/recovery | Not Tested | Ordinary readiness passed; no deliberate delay, disconnect, permission revocation or hardware error was induced. |
| Two consecutive complete four-photo sessions, no stale UI/images | Passed | Same page, no reload: four distinct Review images each time. Confirmed restart cleared Review/output, left four pending slots, None selected and zero stickers. All second-session images differ from every first-session/accepted source. |
| Retake cancel and accept | Passed | Real photo-2 candidate canceled: all four source strings unchanged and focus returned to Retake photo 2. Second real candidate accepted: changed-source vector `[false,true,false,false]`. Final None slot pixels equal the four accepted captures. |
| Protected restart | Passed | Keep retained the exact Purple/sticker Export source. Confirmed Start new strip alone cleared the result and returned camera-off. |
| Countdown Cancel / Exit, same-page retry and Home navigation | Passed | After the two completed sessions, a further live countdown was canceled to usable Home. Start returned four fresh pending slots; Enable worked again. Home navigation during another live countdown returned Home. Video was paused, 0×0, readiness 0 after each exit. Cancellation was during photo 1; photo-2 cancellation remains a manual extension. |
| Physical camera shutdown at tested exits | Passed | Owner reported LED off at first Review and retake candidates, then at second Review, Cancel / Exit and Home navigation. This is owner-observed hardware evidence, not an agent-observed LED recording or timing measurement. |
| Direct audit of every acquired track being ended | Blocked | Browser DOM wrapper did not expose MediaStream objects. No retained-track list or browser media diagnostics was collected. Physical shutdown observation above passed, but this stronger diagnostic was not obtained. |
| None real-capture PNGs, repeats and preview equality | Passed | Two newly saved files, each 437,681 bytes, 700×2090; both byte-for-byte and decoded-RGBA equal to the actual Export preview. Each output photo region is pixel-identical to its accepted 600×450 capture, in order. |
| Purple and all four sticker assets with real-capture PNGs | Passed | Purple preview rendered; Star/Rainbow/Unicorn/Heart were added and visibly rendered. Two actual Purple-with-four-stickers files, each 620,920 bytes, 700×2090; both byte-for-byte and decoded-RGBA equal to Export. Bare Purple has preview evidence only; no bare-Purple download was saved. Pointer transforms/history were not reaccepted here. |
| Dimensions, retained captured aspect, output decorations | Passed | Actual input 600×450; output 700×2090. None regions equal full accepted photos at 600×450 with no additional crop/mirror. Visible watermark and Purple/stickers inspected; Export controls/workmat/handles do not appear in PNG. Physical scene-to-capture mirror/orientation is separately blocked below. |
| Identifiable-scene orientation/mirror and real wide/portrait inputs | Blocked | Owner chose to continue with intentionally dark input; no readable asymmetric markers. Hardware supplied only 4:3. Earlier synthetic aspect/orientation evidence remains synthetic. |
| Current local root load and scoped console | Passed | Home/Capture/Review/Customize/Export and lazy logo/Purple loaded. Four placeholders decoded 1214×1093. Final captured warning/error list empty. Not a new exhaustive resource/subpath sweep. |
| Approved hosted HTTPS root/subpath/current artifact | Blocked | Earlier owner confirmation says no approved HTTPS endpoint serves this tree; none was provided for this pass. No deployment, hosting modification or remote inference. |
| Physical phone/tablet portrait/landscape/touch/performance | Blocked | No such device available to this pass. Earlier desktop viewport results retain their narrower scope. |
| Firefox, Safari and Android browser acceptance | Not Tested | Brave desktop only. |
| Spoken screen reader, native 200% zoom, actual OS reduced motion | Not Tested | Earlier semantics/simulated-motion evidence retained; no fresh assistive/OS exercise. |
| Original watermark/Purple publication rights and unused VintageCharm inventory | Blocked | `assets/ASSETS.md` and README still record unestablished rights. Needs owner clearance; no new rights claim is inferred. |
| Native sharing/receiver delivery | Not Tested | Optional minimum-gate coverage; earlier automated safety/fallback evidence retained. No Share action was used. |

### Saved-file evidence and verification

New files were `Downloads/snapicorn (5).png` and `(6).png` (None), then `(7).png` and `(8).png` (Purple with all four stickers). Existing files were not replaced or deleted. Run-owned copies, preview PNGs read from the rendered DOM, session screenshots, individual capture PNGs, JSON observations and the independent Pillow checker are retained outside the repository:

The run-owned copies, previews, screenshots, captures, observations and independent checker remain in the private local evidence directory outside the repository.

| Result | SHA-256 of preview and both actual downloads |
| --- | --- |
| None | `bbf351fcad4e1762c5a4820bf22f4a0177f23c61f91575c96549cdbbf45c964f` |
| Purple + four stickers | `c63e7d43a6d10363313509e64d63380c7cb5c7d8b1e7928215862ac828542531` |

`check_png.py` independently opened/decoded the retained PNGs, reported sizes/hashes, compared all four actual downloads against their preview bytes and RGBA pixels, and compared None's four full photo regions against accepted captures. All comparisons returned true; dimensions matched 700×2090. `retake-results.json`, `session-2-reset.json`, `session-2-results.json`, `cancel-navigation.json`, `owner-observations.json` and `browser-logs-final.json` retain the other scoped results. Images remain local; none were uploaded to Linear or committed. Only report/metadata is added to Linear.

No full automated suite or lint rerun was needed because app/tests are unchanged. Documentation whitespace is checked with `git diff --check`; its result is recorded in the handoff. Reused historical synthetic download evidence was also checked against its retained file hash (59,739 bytes, SHA-256 `a9253fa541f02f912d8f07ba8086b5219c818e77035fd49322ce29a8c782451c`). It is not counted as hardware evidence.

### Remaining Windows procedure

Use a fresh disposable browser profile with the unchanged local app, not the profile/origin containing personal Gallery data. From this repository, run `python -m http.server 49364 --bind 127.0.0.1`, then open `http://127.0.0.1:49364/`. Stop the server with Ctrl+C afterward. Do not open Gallery, Save to Gallery, clear site data or delete existing images. Record revision, full URL, PC/webcam model, OS/build, full browser version, permission starting state, actual video width×height, orientation and time with each result. Repeat hosted tests only when a separately approved existing HTTPS endpoint is supplied; this procedure grants no publishing approval.

| Remaining action | Expected behavior | Evidence to capture |
| --- | --- | --- |
| Start with fresh camera permission. Start Photobooth; Enable → Block/Deny. Set this disposable site's camera permission to Allow using browser UI; explicitly retry Enable without reloading where possible. | No request before Enable. Denial returns usable feedback and retry; allow/retry reaches moving nonzero video before capture enables. | Recording including browser permission UI, failure/retry status, live preview and LED. A pending prompt is not denial. |
| With live video on a disposable USB-webcam setup, unplug during photo 2's countdown; reconnect and explicitly retry. Separately cancel during photo 2. If hardware cannot disconnect safely, leave interruption Not Tested. | Concise recovery, no stuck countdown/export, LED off, clean fresh slots on retry. Retake interruption must preserve originals. | Exact timing/actions, status/console, LED before/after, successful retry. Do not substitute a simulated ended track. |
| For direct cleanup evidence, retain actual tracks after every Enable using the DevTools snippet below; complete/cancel/retake/navigate, then inspect them. | Every retained track is ended after its exit; LED/privacy indicator off. Measure delay rather than assuming a bound. | Before/after console tables plus physical indicator recording; no device IDs needed. |
| Use lit cards 1–4 with an asymmetric arrow/text and visible four edges. Capture, cancel/accept a retake, save None twice and Purple with stickers twice. Repeat with actual wide and portrait hardware input if supported. | One expected capture mirror, complete aspect/order/edges/watermark, correct final frame/stickers; repeats and preview/file pixels equal. Width 700; height `4*round(600*h/w)+290`. 16:9 gives 1642; 3:4 gives 3490. Rotating a viewport alone does not prove changed camera dimensions. | Actual input dimensions, scene/Review/Export images and saved PNGs, dimensions/hashes or decoded comparisons. Bare Purple and rapid None/Purple toggling may be checked here too. |
| In Windows Firefox, repeat core hardware/save flow; use keyboard only and native 200% zoom. With a named screen reader, run countdown/progress/errors/dialogs. Change actual Windows motion preference and test the explicit reduced-motion choice only in the disposable profile. | Reachable controls, visible focus, correct modal return focus, intelligible announcements, no clipping; motion preference changes styling without losing camera/output behavior. | Exact versions, focus/zoom screenshots, spoken-output notes/recording and setting/result. Earlier DOM semantics are insufficient. |
| When physical mobile devices and approved HTTPS exist, run Safari on iPhone/iPad and Chrome on Android in portrait/landscape, rotating during Capture and Customize/Export. Exercise configured root/subpath and lazy resources with Network/Console visible. | Controls and all photos reachable, no session/output corruption; resources resolve at intended mount with no relevant failed requests. | Exact device/browser/URL/artifact, orientation recording, network/console evidence and actual saved PNGs/location. Rights clearance remains a separate owner action. |

While live after each Enable, run this scoped diagnostic in DevTools; it retains references only and does not replace camera behavior:

```js
{
  const video = document.querySelector('#camera');
  window.pro64Tracks ??= [];
  window.pro64Tracks.push(...(video.srcObject?.getTracks() ?? []));
  console.log({ width: video.videoWidth, height: video.videoHeight });
  console.table(window.pro64Tracks.map(track => ({ kind: track.kind, state: track.readyState })));
}
```

After each exit, repeat only the `console.table(...)` line; earlier tracks should now say `ended`. This diagnostic remains **Not Tested** here. Close the disposable profile after retaining evidence; do not clear another profile's storage.

Recommended next actions are the remaining permission/interruption/lit-scene checks, then approved hosting/device/accessibility coverage and asset-rights clearance. PRO-64 remains In Progress; earlier statuses and PRO-78's separate Backlog release gate are unchanged. This verification pass stops here.

## Remaining local camera acceptance — 25 October 2026

Focused continuation ending at **13:02 Asia/Manila**. HEAD remains `b399321dd6e2f061c248117d1281d84a9de1b272`. The report already had 88 uncommitted added lines from the preceding hardware pass; those are preserved. Read the current PRO-64 description and all three comments, this report, relevant camera/session/capture/composition code and asset inventory. No ancestor, repository or nested AGENTS.md was found; the supplied global agreements apply. Linear's shared-context tool returned `Tool get_agent_context not found`; the issue and comments were accessible.

Environment metadata rechecked: Windows **25H2, build 26200.9711**, installed Brave executable **156.1.98.60**. Webcam/PC model and a fresh browser UA were unavailable. The initial Brave connection was inventoried, but opening the unchanged app at **http://127.0.0.1:49365/** timed out against the sandboxed loopback server. That server was stopped and a loopback-only server was started with approved networking. Before a browser retry, Brave disappeared from both the browser inventory and native window list. No application page was successfully observed in this continuation. This is a browser/access limitation, not a confirmed application defect.

Owner participation was requested for browser-site denial/restoration, an approved lit paper marker reading `1 → RIGHT` through `4 → RIGHT`, and safe browser-site revocation or owner-operated USB interruption. No response or permission-change approval was received during this pass. No permission prompt was acted on, camera enabled, device disconnected or OS service touched. The run-owned server was stopped. No Gallery or Settings action, image acquisition, new download or uploaded diagnostic occurred.

### Focused matrix (supersedes only the matching remaining rows above)

| Requirement | Status | Exact evidence / remaining limit |
| --- | --- | --- |
| Explicit denial, clear feedback, usable UI and no camera activity after denial | Blocked | Owner permission action unavailable; browser connection lost before app load. No denial occurred. Intended error wording in `enableCamera()` is source evidence only. |
| Restore permission through normal browser controls; same-page retry or required reload | Blocked | Neither browser-site restoration nor retry could run. Same-page Enable is the intended code path; no recovery behavior is physically accepted here. |
| Permission revocation/device interruption, recovery and stale-callback absence | Blocked | Safe interruption method/owner participation not established and Brave unavailable. No hardware interruption occurred. Existing automated generation/capture checks remain automated evidence only. |
| Direct MediaStream track-state audit after exits | Blocked | No live stream or authorized diagnostic surface was available. No `readyState` values were obtained. Prior owner-observed LED shutdown remains Passed with its original scope; it does not prove enumerated track states or latency. |
| Identifiable scene-to-capture mirror/orientation and four-photo scene order | Blocked | Marker approval/physical scene unavailable. The prior dark physical captures prove accepted-source pixel order, not recognizable-world orientation/order. |
| Retake and Export orientation with identifiable scene | Blocked | No marker capture, retake or Export ran. Earlier retake cancellation/acceptance and preview/file equality remain Passed separately. |
| Physical 4:3 output geometry | Passed | Reused prior physical 600×450 input and actual 700×2090 PNG evidence; not rerun. |
| Physical wide/portrait input and dynamic output geometry | Blocked | Only earlier 600×450 hardware input is established; no actual wide/portrait source was available. No synthetic stream, forced constraints or viewport rotation substitutes for this requirement. |
| Two physical sessions; retake cancel/accept; restart/shutdown; four actual PNGs matching previews | Passed | Reused preceding hardware matrix and its local evidence directory/hashes. No redundant session or repeated download was attempted. |
| Approved hosted HTTPS delivery | Blocked | No approved endpoint supplied; loopback is not hosted HTTPS. |
| Physical mobile-device acceptance | Blocked | No physical mobile device available. |
| Firefox and Safari coverage | Not Tested | Neither engine exercised in this pass. |
| Spoken screen reader and actual OS motion | Not Tested | No assistive-technology or OS-setting exercise; prior semantics/simulations remain separate. |
| Asset redistribution rights | Blocked | `assets/ASSETS.md` still records unestablished original watermark/Purple and VintageCharm rights; no supporting license/ownership evidence supplied. |
| PRO-78 full-experience acceptance | Not Tested | Separate outstanding gate; not started. |

Source inspection corroborates the intended contract only: `capturePhoto()` mirrors the full video once; composition preserves photo array order without another mirror; output width is 700 and height is `4 * round(600 * inputHeight / inputWidth) + 290`. A lit marker must be compared against the real scene and mirrored live preview, Review, accepted retake and Export to accept orientation. At the default target width, 16:9 predicts 700×1642 and 3:4 predicts 700×3490; neither is a physical result here. The diagnostic snippet above remains unexecuted. Do not infer an interruption defect or successful denial/recovery from code alone.

No new confirmed defect; no bug issue created. PRO-64 remains **In Progress**. Only this report is edited; application/tests/assets are unchanged, so no full test/lint suite is repeated. `git diff --check` passed before this addendum; final documentation whitespace verification is recorded in the handoff. All existing uncommitted work is preserved. Nothing staged, committed, pushed, deployed or published; no hosting modification. Stop after this focused pass, pending owner participation and browser availability.

### Owner decision — 27 October 2026 (Asia/Manila)

The owner answered: **“No owner participation now; document blockers”** and **“Leave physical interruption blocked.”** Permission denial/restoration, identifiable-marker capture and orientation, physical interruption/recovery, and live track-state diagnostics therefore remain **Blocked**. No permission change or device interruption is authorized by this reply. No additional browser/camera session was started; prior Passed evidence and all other release blockers remain unchanged. PRO-64 stays **In Progress**; PRO-78 was not started. This update records the decision only, preserves Gallery/Settings and existing changes, and adds no implementation, commit, push, deployment or publication.
