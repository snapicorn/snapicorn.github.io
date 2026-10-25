# PRO-60 safe native sharing

23 October 2026 (Asia/Manila). Read the complete PRO-60 issue, its comments, the complete PRO-66 retained-vanilla ADR and comments, supplied global working agreements, current export/composition/session implementation and PRO-74 verification notes. No repository AGENTS.md was found. Existing tracked and untracked work was preserved.

## Sequencing exception and release gates

The owner specifically authorized implementing PRO-60 while PRO-59 and PRO-74 (and earlier manual/hardware acceptance) remain incomplete, continuing the established decision to prioritize features while deferring manual acceptance. This exception applies only to PRO-60 execution order. PRO-59 still blocks PRO-60; PRO-60 still blocks PRO-75. Existing dependency relations, earlier issue statuses, PRO-64 minimum-release requirements and the PRO-78 full release gate remain unchanged. This work does not accept earlier issues or authorize PRO-75 or any other feature.

PRO-60 remains **In Progress** pending real browser/device download and native share/cancel acceptance. Native sharing remains optional for the minimum release; working PNG download is required. Any shipped enabled Share action must have safe handling. Unsupported environments receive the Download PNG fallback.

## Implementation

| File | Change |
| --- | --- |
| `scripts/export.js` | Named `shareCurrentStrip()` awaits Promise-wrapped `toBlob` and `navigator.share` inside one error boundary. Handles unavailable API/File, false/throwing capability checks, null Blob, synchronous encoding exceptions, synchronous/asynchronous API failures and normal `AbortError` cancellation. |
| `scripts/main.js` | Existing export-control rendering respects the share-operation lock while keeping Download independent. |
| `eslint.config.js` | Registers the one shared pending-share query for classic-script use. |
| `test/recovery.test.js` | Extends the existing session harness with 21 sharing tests and adapts the prior stale-sticker encoding test to await the complete flow. |
| `README.md` | Describes fallback, normal cancellation, revision safety and the limits of API success. |

Sharing consumes the published `session.output.canvas`; it never composes or redraws layers. One successfully encoded PNG Blob is cached on that exact output record, with no second image owner or object URLs. Repeated attempts reuse it. Replacing the result or resetting the session drops the current cache with the output record. An already-running platform operation may retain its immutable input until it settles; it cannot publish that input into a newer session.

Each attempt captures session identity, operation generation, revision and published output identity. After encoding and before native invocation, all must still match and `isCompositionCurrent()` must accept the result. Pending/failed compositions and gesture drafts cannot share. Late success/error cannot write feedback for another revision, navigation generation or session. Download advances the feedback version so a pending share cannot overwrite later download feedback.

One share attempt is allowed at a time, including during encoding and across edits/navigation/reset until the outstanding attempt settles. Download remains available whenever the composition is current. The lock's cleanup recomputes availability from the current composition instead of restoring an earlier enabled value. Sharing never changes photos, frame, stickers, history, navigation or session ownership. Failures and cancellation need no retakes or reset.

Unsupported sharing directs the user to Download PNG. Encoding/share failures offer Download PNG or Share retry. Cancellation reports a normal canceled outcome. Successful API resolution says **“Share request completed. Check the chosen app to confirm.”** It makes no delivery/save guarantee. The existing PNG download path and `snapicorn.png` filename are preserved, including its independent recoverable encoding feedback.

This is a reusable behavior boundary for PRO-75; no Export screen, compositor, Gallery, Settings, persistence, upload, framework or dependency was added.

## Verification

- `npm test`: **124 passed, 0 failed** (103 baseline tests, 21 added).
- `npm run lint`: **passed**.
- `git diff --check`: **passed** (Git line-ending notices only).

Tests cover payload/filename/source, one-Blob reuse, absent share/canShare/File, unsupported files, null Blob, synchronous encoding/File/capability/share exceptions, rejected native promises, AbortError, successful retries, Download after each failed/canceled attempt, duplicates during encoding/native sharing and rerendering, stale sticker/frame/photo/session/navigation encoding, stale native success/rejection/cancel while a newer composition is pending, and newer Download feedback. A dedicated test intentionally ignores DOM handler promises and observes that asynchronous failures produce no unhandled rejection.

The in-app Chromium browser ran an isolated fixture outside the repository with synthetic red/green/blue/yellow photos, the production scripts and real Canvas encoding/PNG decoding. **13 checks passed**, including real 700×2090 PNG dimensions and filename, Blob caching/reuse, qualified success feedback, unavailable API fallback, native rejection/cancellation handling, duplicate suppression and Download availability. Download's production action was invoked. No browser warning/error logs or unhandled browser errors were captured. Native capability functions existed in this browser, but native outcomes were deliberately mocked; no real receiving application was used.

The initial sandboxed localhost server was unreachable. A localhost-only server outside the sandbox with reverse-DNS lookup disabled allowed browser checks. This fixture is not part of production and requests no camera access. The browser results, screenshots and fixture are local verification artifacts and are not included in the repository.

## Outstanding acceptance

Still required: manually verify real downloaded-file appearance against the current photo/frame/sticker preview; native share invocation, cancel and rejection on a supporting physical browser/device; unsupported-browser download fallback; browser-specific user-activation behavior; representative device memory/performance and cross-browser support. API resolution cannot certify that a destination saved or delivered the PNG. Mocked native outcomes and synthetic Canvas checks do not close these requirements.

All carried physical-camera, hardware cleanup, accessibility/screen-reader, cross-browser, HTTPS/subpath, PRO-64 and PRO-78 release acceptance remain required. No earlier issue status was changed. PRO-75 can reuse this implementation when separately authorized, but PRO-60's acceptance/dependency gate remains open.

No staging, commit, push, deployment, publication, destructive cleanup or history rewrite occurred. All changes remain uncommitted.
