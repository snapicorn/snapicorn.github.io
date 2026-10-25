# PRO-62 accessibility verification

22 October 2026. Baseline: `70b44b651f19d212af3835db0c63970e854641f3` (clean working tree before this issue). Changes remain local and uncommitted.

## Changes and preserved behavior

The existing Home, Capture and editor headings remain the focus destinations for screen changes. Capture now focuses Cancel / Exit before disabling Snap so keyboard focus remains on an available control. Successful frame updates retain focus. Home's retry message also describes its focused heading when capture or composition fails.

None/Purple use native same-name radios with labels and a Frame fieldset/legend. Tab enters the selected radio; arrow keys change it. The existing request and session guards still protect async rendering and export. A failed request restores the checked state and description of the last rendered frame. Decorative checkmarks are hidden from accessible names, while selected state remains native.

Photo alternatives distinguish numbered pending slots from captured photos. The completed strip describes its rendered frame. Home sample artwork is decorative. The visible countdown remains unchanged; a separate polite, atomic timer gives photo context at the start of each countdown and then the remaining digit. Captured counts, strip preparation, frame updates and existing retry errors use polite status regions. Current-step indicators remain on the two existing stages; no new navigation was added.

The existing 3px focus style is extended to the visible radio card. Native disabled export states and OS reduced-motion CSS are retained. No framework, dependency, persisted setting, camera constraint, capture transform, composition geometry, PNG encoding, output asset or filename was changed. Native sharing behavior remains outside this change.

## Automated evidence

- `npm test`: 54 passed, 0 failed. Three new tests cover the HTML semantics contract, contextual countdown/Cancel focus/reset, and native radio change/failure/retry. Existing tests now assert checked state and the updated photo descriptions.
- Existing composition and recovery checks pass for capture order/mirroring, 4:3 / 16:9 / portrait geometry, watermark, framing, stale callback races, failures and export-source consistency.
- `npm run lint`: passed.
- `git diff --check`: passed.

Mocked DOM/canvas tests do not prove screen-reader speech, physical cameras or downloaded-file fidelity.

## Browser evidence

Checked in the Codex in-app Chromium browser on Windows at `http://127.0.0.1:8762/fixture`. The development-only server injects a synthetic 640×480 canvas stream before loading the production scripts. It lives outside the repository in this chat's visualization workspace under `pro62/server.py`. No physical-camera permission was requested. The browser build number was not recorded; no coverage claim extends to other browser/OS combinations.

- Tab reached Start; Enter opened Capture and focused its heading.
- Tab reached Take 4 photos; Space began the countdown, disabled Snap and focused Cancel with a computed 3px outline.
- Enter on Cancel during countdown returned to the Home heading. A fresh keyboard start/capture completed all four photos and focused the editor heading.
- The accessibility tree exposed pending/captured image alternatives, the composed strip description and native radio checked values. Home decoration and inactive screens were absent.
- From the editor heading, Tab reached Make another strip, then the selected frame radio. Right selected Purple, retained radio focus and updated the image description; the visible card focus outline measured 3px.
- Tab reached Download PNG. Enter activation was exercised, but the browser download-event wait timed out. Actual file saving/content comparison remains unverified; no successful download is claimed.
- Shift+Tab returned through the radio group to Make another strip; Enter opened Capture and focused its heading with fresh slots.
- The live-region roles, polite/atomic attributes and current-step markup were inspected in the browser DOM. The simplified accessibility-tree output exposed changing timer/progress text but did not expose all live-region/current-step properties. These are semantics checks, not spoken announcement acceptance.

Browser inspection found that a CSS-generated checkmark entered the radio's name. It was replaced with an `aria-hidden` span; final browser reinspection confirmed clean None/Purple names, checked values, retained Purple focus and the 3px card outline. Evidence is saved beside the fixture as `editor-ax.txt` and `editor-keyboard.png`. No other design changes were introduced.

## Remaining acceptance and sequencing

PRO-62 remains **In Progress**. The owner explicitly deferred manual physical-camera, device, cross-browser and screen-reader acceptance, and authorized PRO-62 despite PRO-61's outstanding gate. This exception applies only to PRO-62; no earlier issue status or acceptance requirement was changed.

Still required: spoken countdown/progress/error timing and queue behavior with a named screen-reader/browser/OS combination; OS reduced-motion switching and confirmation that timer/progress remain visible; actual keyboard-downloaded None/Purple PNG comparison; physical-camera permission/readiness/interruption/cleanup and repeat sessions; supported devices, responsive keyboard behavior, browser zoom and cross-browser coverage. The available browser API did not expose reduced-motion emulation; its existing CSS was inspected, but OS switching was not tested. Avoid inferring these results from source semantics or synthetic video.

Recommended next implementation issue: PRO-63, release hygiene and accurate app guidance, when authorized. PRO-64 remains the minimum-release acceptance gate. No work on either issue was started; PRO-62 stops here.
