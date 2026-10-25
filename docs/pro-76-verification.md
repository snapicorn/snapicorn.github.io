# PRO-76 implementation and verification

23 October 2026 (Asia/Manila). Local Gallery only, using the accepted PRO-66 retained-vanilla architecture. Read the complete PRO-76 issue/comments, accepted PRO-66 ADR/comments, supplied global agreements, current application and PRO-75 verification, and finalized 22 October ChatGPT Work handoff: AGENTS.md, DESIGN-SYSTEM.md, IMPLEMENTATION-HANDOFF.md, QA-REPORT.md, Gallery/Export source, visual cascade and Gallery desktop reference. No repository/ancestor AGENTS.md was found. The approved prototype was read only. Linear's agent-context endpoint returned unavailable; the actual issues and source were used.

## Sequencing and scope

The owner specifically authorizes PRO-76 implementation while PRO-75 remains In Progress for deferred physical-device/manual and release acceptance. The exception was recorded on PRO-76 in Linear on 23 October. It changes execution order only: earlier statuses, dependency relations, acceptance requirements and PRO-64/PRO-78 release gates remain intact. PRO-76 remains **In Progress** because representative-device storage/memory/touch and other manual acceptance remain outstanding. No PRO-77 behavior is added.

## Implemented behavior

Save to Gallery is an explicit Export action. It joins the existing current-output PNG preparation and passes the exact prepared Blob, with captured dimensions, to storage. It does not recompose pixels or serialize the session. Duplicate in-flight saves and repeat saves of the same published output are suppressed. Saving/Saved/failure feedback is separate from Download/Share status. An immutable write already requested may finish after navigation/reset; session/revision/output guards prevent its completion from labeling a different image Saved. Navigation during encoding prevents a later write. Failure leaves Export, Download and the live session usable. Weak keys avoid retaining old output canvases for status bookkeeping.

Gallery navigation preserves the live completed booth session. Empty, loading, list and unavailable/error states are distinct. Newest-first metadata becomes eight cards per page, with working Previous/Next. Cards open a native labeled preview dialog with Download PNG, the shared safe native PNG-sharing boundary, and Delete from Gallery. Share is explicitly initiated; unsupported/canceled/failed outcomes retain Download. Native completion does not claim target delivery.

Delete first reveals confirmation with Keep it focused. Keep/Escape/close/backdrop preserves the image; dismissal also aborts a requested deletion before its transaction commits. Confirmed deletion re-reads id/time/dimensions/bytes in the same write transaction and deletes only that key. Missing/changed records abort; failure retains the record and usable preview. Downloaded files are unaffected. There is no bulk deletion, automatic cleanup or reset.

The cream/plum/lavender tokens, Fraunces/DM Sans, approved empty artwork, lavender cards and native dialog surfaces are reused. Settings has no placeholder control. The focused About/Home privacy text now distinguishes in-memory captures from explicitly saved PNGs; no broader About redesign.

## Database contract and safeguards

Production: **snapicorn-finished-gallery**, **version 1**, object store **finished-pngs**, keyPath **id**. Records contain only `{id, savedAt, blob, metadata: {width, height, bytes, type: 'image/png'}}`. ID is a new UUID; savedAt is Unix milliseconds. Writes whitelist metadata and validate Blob type/size, PNG signature/IHDR dimensions and pixel cap. Reads validate shape, identity, timestamp, metadata and PNG header; decoding failures are reported without modifying the record. Lists return metadata rather than an array of Blobs. Malformed records are skipped/reported and preserved.

Create the store only for a brand-new database. No existing record is overwritten or migrated; `add` rejects collisions. Version 1 has no migration or destructive upgrade path. Unknown schemas/newer versions report a recoverable error without schema/record changes. Any future version needs a separately reviewed nondestructive policy. The prototype database **snapicorn-design-prototype is never opened**, reused, migrated or cleared.

Saves/deletes resolve only on transaction completion; default request errors abort the transaction. Explicit aborts, quota failures and denied/unavailable storage reject with usable retry feedback. Open failures reset the cached attempt. Blocked opens report other tabs; late connections close instead of leaking after failed/canceled opens. Version changes close/invalidate the connection, release Gallery resources and offer reload/retry. Unexpected close also invalidates the connection.

Capacity checks and add share one write transaction, serializing concurrent saves. Provisional limits: **100 records, 12 MiB per PNG, 128 MiB aggregate, 8,000,000 pixels per image**. All records, including malformed ones, count toward capacity; unknown-size records are conservatively charged 12 MiB. Full storage never evicts images. The existing 700×2090, 700×1642 and 700×3490 outputs fit the pixel cap. Synthetic PNG sizes below are evidence for these fixtures only; actual photos can compress differently. Limits need representative hardware acceptance and are not a performance promise.

Eight transient thumbnail URLs are retained at most. Each thumbnail fits within 320×620 pixels, generated serially; bitmap resources close and temporary canvases clear after encoding. Old queued requests check page identity before fetching/decoding. A fallback Image decoder uses one temporary full-image URL with an eight-second load deadline. One full preview remains attached while open. Preview and download URLs revoke on close, replacement, navigation/page exit; download URLs also expire after the established 60-second grace period. Browser decode caches, the live session and browser implementation have additional memory costs; these are application safeguards, not a measured process-memory ceiling.

BroadcastChannel sends only a change signal, refreshing active lists, checking stale previews and invalidating stale Saved feedback. Focus/visibility/navigation re-read storage as fallbacks. Camera/editor/session persistence remains separate. Guidance states origin/profile scope, clearing/eviction risk, no automatic backup/sync, and Download for a separate copy; it promises neither permanence nor absolute privacy.

## Affected files

| File | Change |
| --- | --- |
| scripts/gallery-store.js (new) | Dedicated connection, schema/validation, capacity policy, transaction completion, read/list/save/identity-checked delete |
| scripts/gallery.js (new) | Save states, Gallery rendering/pagination, serial thumbnails, modal/actions, confirmation, cross-tab refresh and resources |
| scripts/export.js | Shared native PNG request helper and safe prepared-Blob sharing; existing Export regression behavior retained |
| scripts/main.js | Gallery navigation/render/focus/save-button lifecycle and protected restart exit |
| index.html | Export save action/guidance, working navigation, Gallery states/cards host and preview/confirmation markup |
| styles/style.css | Approved responsive Gallery cards, empty state, preview, destructive action and readable status styling |
| assets/design/magic-gallery-empty.png (new), assets/ASSETS.md | Byte-identical approved decorative artwork and provenance |
| eslint.config.js | Registers focused classic-script shared functions |
| test/gallery.test.js, test/idb-fixture.js (new) | Isolated storage tests and disposable in-memory IndexedDB double |
| test/recovery.test.js, test/app.test.js | Gallery/lifecycle/failure/keyboard regression coverage; script/navigation expectations |
| README.md, this file | Storage contract, use, limits, evidence, sequencing and acceptance |

No runtime/development dependency or framework migration. Existing unrelated tracked/untracked files are preserved.

## Automated verification

- `npm test`: **198 passed, 0 failed** (146 baseline; 52 added tests/file checks).
- `npm run lint`: **passed**.
- `git diff --check`: **passed**, line-ending notices only.

Coverage includes exact Export Blob persistence and reopen, commit-before-success, duplicate/repeated saves, stale save/encoding completions, denied/unavailable/open retry, quota/abort, capacity/image limits, blocked/version/connection lifecycle, missing/malformed records, ordering/pagination, preview/download/share, serial resources/URL cleanup, confirmed/canceled/failed/identity-mismatched deletion, fallback multi-tab refresh/Saved invalidation and keyboard boundaries. Existing capture, retake, composition, frame, sticker/history and Export tests remain passing. Node/VM tests mock browser/device APIs and use only disposable in-memory records. They do not measure actual device storage behavior.

## Synthetic browser verification

In-app Chromium used actual production composition/assets, Canvas PNG encoding and real IndexedDB on a localhost QA origin. No physical camera was requested. A prelude maps every production DB open to uniquely named **snapicorn-gallery-test-pro76-20261023-0415-a7d4** and **snapicorn-gallery-test-pro76-20261023-0415-a7d5** databases and rejects access outside the run’s QA prefix; BroadcastChannels are also namespaced. Auxiliary abort/blocked/version databases use the same isolated prefix. No production/prototype databases were opened, cleared or deleted, and no deleteDatabase/reset operation was used. Old QA databases were preserved.

**27 batch assertions + 6 reload assertions + 2 cross-tab assertions + 6 final keyboard assertions passed (41 recorded assertions)**. Batch checks include byte fidelity, duplicate saves, native outcome simulations, canceled/confirmed deletion, URL cleanup, malformed preservation, an actual IndexedDB transaction aborted after add success, actual blocked upgrade, actual versionchange and old-version refusal. A second browser tab saved a synthetic image and notified the first; deleting only that QA-owned image refreshed both lists and closed the first tab's stale preview. Five remaining scenario PNGs survived reload byte-for-byte. The application preserved the deliberately malformed QA record; a separate explicit fixture control later removed only that known synthetic corruption to prepare clean visual screenshots.

PNG SHA-256 compares complete encoded bytes of the original successful Export Blob with the Blob read back from IndexedDB; no image redraw or normalization occurs:

| Scenario | Dimensions | PNG bytes | SHA-256 (Export = saved record) |
| --- | --- | --- | --- |
| None | 700×2090 | 53,263 | `50353a2a2e7abcde8c32c45dc51657b58cf0a47399311f6634b5fbc63aaca799` |
| Purple | 700×2090 | 176,822 | `546dd5b0c14fe7ea3037475c8e3c68e117a7910333e1853b98d8c145ae215714` |
| Stickers | 700×2090 | 249,123 | `fd86e6f330555411c586f48f1377fe12fc9c127ad7a6ff3c7f62adeeb8177890` |
| Retake | 700×2090 | 248,673 | `0a472b482bfb2fba59b78ec6ea6aa1320fb9993f5eb009b99f4fd9d021ed2a5c` |
| Wide | 700×1642 | 230,313 | `87c382b1e213b94bef72d3f31bd05af6e9bf64089590ab6451b05595a2af1bad` |
| Portrait | 700×3490 | 360,787 | `54c924e005ae0c925b976ef6ce6bc76094b22aac3dfa472dbe25e4d735421c0d` |

Preview Blob, two intercepted Gallery download URLs and the mocked shared File also matched the saved original. Portrait was deliberately deleted during the confirmed-deletion test; the other five hashes were rechecked after reload. Native sharing was deliberately simulated; target delivery and trusted-user-activation on real devices remain unverified. The later native download event/path instrumentation timed out; UI reported a download request, but **no Gallery file-on-disk or durable-save claim is made**. Existing Downloads files were not altered or deleted.

## Responsive and keyboard evidence

Browser viewport overrides did not change the actual 1280×720 browser surface. The fixture therefore used same-origin, explicitly sized iframes, and measured the application document itself. This is synthetic responsive Chromium evidence, not physical-phone/tablet or full top-level viewport certification.

| Application iframe | Client / scroll width | Observed layout |
| --- | --- | --- |
| 1440×1000 | 1425 / 1425 | Four card columns; whole upright strip thumbnails; approved typography/cards |
| 768×1024 | 753 / 753 | Two columns; full-image preview and actions fit; no horizontal overflow |
| 320×900 | 305 / 305 | Two compact cards; labels wrap; preview/actions scroll internally; mobile disclosure works |
| 844×390 | 829 / 829 | Three columns; preview actions remain vertically reachable |

Saved screenshots were visually inspected for all four sizes, including tablet/mobile previews and landscape actions. The first backward-Tab check exposed a native boundary escape; explicit wrapping, consistent with the app's other dialogs, fixed it. The six final keyboard checks confirm backward/forward wrapping (including confirmation controls), Keep focus with 3px ring, Escape retaining the image and returning to its card, and mobile navigation closing/focusing the Gallery heading. A corresponding automated regression was added. The Gallery hover and destructive-action cascade was corrected during visual inspection. Temporary viewport overrides were reset.

Browser results, screenshots and fixtures are local verification artifacts and are not included in the repository: browser-results.json, reload-results.json, cross-tab-results.json, keyboard-results.json, viewport-metrics.json, gallery-*.png, preview-*.png, confirm-mobile.png, prelude.js, fixture.js and server.py. The QA server/fixture stays outside production. Initial sandbox server connectivity required a localhost-only listener outside the sandbox. Browser-level quota pressure, eviction and site clearing were not induced; deterministic doubles covered quota/denial without filling disk or touching user data.

## Outstanding acceptance and PRO-77 readiness

Still required: real-camera photos; representative low-memory phone/tablet measurements for the provisional caps/serial decoding; sustained navigation/open/save behavior at capacity; real touch and orientation; Safari/Firefox/WebKit storage semantics; private/denied storage and real device quota behavior; browser clearing/eviction on a fresh disposable origin/profile only; screen-reader announcements/focus; native sharing with real activation and receiving apps; actual Gallery file placement/appearance; hosted HTTPS/subpath delivery; and all earlier PRO-64/PRO-78/manual gates. A passing synthetic test cannot establish durable retention, browser storage availability or physical-device acceptance.

PRO-77 has Gallery's documented guidance and separate persistence boundary available as an implementation foundation, but PRO-76 remains In Progress and its dependency/acceptance gate is not cleared. Starting PRO-77 requires separate owner direction and, if acceptance is still deferred, a specific sequencing exception. No PRO-77 or later issue was implemented.

No staging, commit, push, deployment, publication, repository reset, prototype modification, user-record deletion or migration occurred. Changes remain uncommitted alongside preserved pre-existing work.
