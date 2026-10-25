# PRO-77 Settings and motion verification

23 October 2026 (Asia/Manila). Implementation only for PRO-77. Reviewed the complete Linear issue, PRO-66 ADR and comments, supplied working agreements, relevant current code, and approved 22 October ChatGPT Work handoff: AGENTS.md, DESIGN-SYSTEM.md, IMPLEMENTATION-HANDOFF.md, QA-REPORT.md, Settings/navigation source, styles.css → magic.css cascade and desktop Settings reference. No repository/ancestor AGENTS.md was found. Linear agent-context returned unavailable; actual issue/source evidence was used. The prototype was read only.

## Implementation

Settings matches the approved 680px two-card layout, cream/lavender/plum tokens, local Fraunces/DM Sans, rounded radio labels and responsive padding. Motion and Your photos are the only sections. The photo guidance explains explicit saves, finished PNGs scoped to this browser profile/site origin, clearing/eviction risk, no permanent backup/cloud sync, and Download PNG as a separate copy. Open Gallery is a native link whose normal activation uses the existing in-page transition.

`scripts/settings.js` owns the preference, storage failure feedback and one device media-query listener. The production key is `snapicorn-motion-preference`, with only `system` and `reduce` accepted. Default/invalid values follow the device; loading never rewrites storage. Reads/writes/accessor failures are caught; the selected in-memory value still applies and visit-only feedback explains failed persistence. A later successful selection clears that feedback. Neither prototype preferences nor Gallery data are read or migrated.

Effective motion is reduced whenever the explicit choice or device requests reduction. Live modern/legacy media-query listeners update the root attribute and native radios; unrelated scripts hold no motion state. Shared CSS suppresses animation, transitions, smooth scrolling and tactile button transforms. The OS CSS media query also remains as a fallback. The root scrolling element is covered. Camera mirroring and sticker geometry keep their transforms; numbers, progress and live state updates remain visible. There is no new animation, sound or speculative preference.

The existing navigation owner now exposes all five destinations. Completed photos, output, revision, history and Review/Customize/Export phase survive navigation. The mobile disclosure closes after destination selection, including selection of the current destination; headings receive focus and header active states use aria-current. Partial capture cleanup remains unchanged. Tablet header spacing/type prevents the fifth destination from wrapping the wordmark. There is no routing framework, deep-link/Back/Forward contract, dependency or export/composition/schema change.

## Files changed by PRO-77

Added: `scripts/settings.js`, `test/settings.test.js`, `docs/pro-77-verification.md`.

Updated: `index.html`, `scripts/main.js`, `styles/foundation.css`, `styles/style.css`, `eslint.config.js`, `test/app.test.js`, `test/recovery.test.js`, `README.md`.

Earlier uncommitted tracked/untracked work remains present. Gallery scripts/schema/records, composition/edit/export/capture code and approved prototype were not modified by this task. The test fixture is a local verification artifact and is not included in the repository.

## Automated verification

- `npm test`: **220 passed, 0 failed** (198 baseline plus 22 focused tests).
- `npm run lint`: passed.
- `git diff --check`: passed; notices about existing line-ending normalization only.

Tests cover default and remembered preferences, invalid values, denied reads/writes and throwing localStorage accessor, unavailable storage, visit-only feedback, fresh-script reload behavior, simulated live device changes with modern/legacy listeners, explicit override, native group/description and Gallery-link semantics, responsive card rules, completed-session preservation at all three booth phases, heading focus and selecting the current mobile destination. All existing capture, retake, image composition, sticker/history, Export and Gallery regressions remain passing.

## Browser verification

In-app Chromium used an isolated localhost QA origin on port 8078. The initial port 8077 timed out; a different port resolved browser access. QA overrides block every IndexedDB open before application scripts run, so neither production nor prototype Gallery records are accessed. Gallery navigation deliberately reaches its unavailable state. No real camera or personal photos were used.

**21 recorded synthetic assertions pass:** live simulated device motion changes, explicit override, native group/production-key persistence, computed suppression of animation/transition/smooth scrolling/tactile transform, visible camera mirror and sticker transform retention, completed synthetic session identity across five destinations, heading focus, active Settings state, and Gallery link/focus. Actual reload restored Reduce motion and its root attribute. The first camera check inspected a hidden video (computed transform none); the fixture was corrected to show the ready view before checking, and the visible mirror assertion passes. This was a fixture error, not an application change.

Browser keyboard interaction: Space/ArrowRight select the native radio, focus is on Reduce motion with a computed 3px outline, Tab reaches Open Gallery, and Enter opens Gallery/focuses its heading. In the 320px iframe, Enter expands the mobile disclosure; Escape closes it and returns focus to the toggle; selecting current Settings closes it and focuses the heading. Photo guidance and Gallery action remain reachable by scrolling/keyboard. No screen reader was used.

Fixed-size same-origin iframes exercised the application CSS viewport. These are synthetic responsive checks, not physical devices or certification of top-level viewport resizing. Screenshots were inspected; no application horizontal overflow at these sizes:

| Viewport | Document client/scroll width | Card width |
| --- | --- | --- |
| 1440×1000 | 1440 / 1440 | 680 |
| 768×1024 | 768 / 768 | 680 |
| 320×900 | 305 / 305 | 265 |
| 844×390 | 829 / 829 | 680 |
| 701×900 | 686 / 686 | 646 |

The tablet wordmark initially wrapped after adding the fifth destination; the scoped header adjustment corrected it and was visually rechecked. Narrow portrait radios wrap vertically, card text wraps, and lower photo guidance/link remain reachable. Landscape requires normal vertical scrolling. A final top-level browser check measured client/scroll width 1265/1265. The QA result preformatted block was made wrapping to avoid fixture-generated overflow.

Browser results, screenshots and fixtures are local verification artifacts and are not included in the repository: server/fixture/prelude, browser-results.json, keyboard-results.json, mobile-keyboard-results.json, viewport-metrics.json, desktop/tablet/mobile/landscape and final Settings screenshots. The 701px measurement is recorded above; final screenshot shows current typography and navigation. Browser storage denial and invalid-value cases were verified with Node/VM doubles, not real browser permission settings. No actual OS preference was changed: live changes used an EventTarget-backed matchMedia substitute; computed explicit-preference CSS was exercised in Chromium.

## Sequencing, acceptance and release readiness

The owner specifically authorized PRO-77 while PRO-76 and PRO-62 retain deferred manual acceptance. This exception was recorded in Linear before implementation. Only PRO-77 changed to In Progress; no earlier issue status or dependency was changed. PRO-64 and PRO-78 remain mandatory release gates. PRO-78 was not implemented.

PRO-77 remains **In Progress** because actual OS reduced-motion switching, physical phone/tablet behavior, cross-browser coverage and assistive-technology acceptance remain outstanding. Real OS Follow my device and explicit override must both be accepted before final UI release. Also carry forward representative storage/memory, real camera/touch/orientation, native share/download outcomes, screen readers and hosted HTTPS/subpath checks from earlier issues. Browser storage denial/private-mode acceptance needs a fresh disposable origin/profile; never test clearing/eviction against user Gallery data.

Implementation is available for final release testing, but release acceptance is incomplete. No staging, commit, push, deployment, publication, framework migration or user-data modification occurred. Stop after PRO-77.
