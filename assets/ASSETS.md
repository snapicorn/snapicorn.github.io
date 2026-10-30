# Design assets

PRO-72 and PRO-61 use the finalized Snapicorn design handoff dated 22 October 2026. Raster files were copied without image conversion, resizing or alpha changes. The table below lists the current handoff imports; historical repository assets also remain tracked and are covered by the PRO-86 remediation notes below.

| Local file | Handoff source | Use |
| --- | --- | --- |
| `design/logo-minimal.png` | `public/assets/logo-minimal.png` | Interface brand and favicon only |
| `design/brand-sparkle.svg` | Filled Phosphor Sparkle path used by `src/App.jsx`, extracted from the prebuilt bundle | Purple sparkle after the wordmark |
| `design/camera.svg` | Regular Phosphor Camera path from the handoff's installed `@phosphor-icons/react/dist/defs/Camera.es.js` | Home and capture button icon; existing Phosphor MIT notice applies |
| `design/sprite-unicorn-1.png` | `public/assets/sprite-unicorn-1.png` | Decorative Home sample; never camera data |
| `design/sprite-unicorn-2.png` | `public/assets/sprite-unicorn-2.png` | Second decorative Home sample |
| `design/sprite-unicorn-3.png` | `public/assets/sprite-unicorn-3.png` | Third decorative Home sample |
| `design/sprite-unicorn-4.png` | `public/assets/sprite-unicorn-4.png` | Fourth decorative Home sample |
| `design/magic-home-backdrop.png` | `public/assets/magic-home-backdrop.png` | Static Home background |
| `design/magic-editor-backdrop.png` | `public/assets/magic-editor-backdrop.png` | Static editor background |
| `design/magic-gallery-empty.png` | `public/assets/magic-gallery-empty.png` | PRO-76 decorative empty Gallery illustration; never saved PNG pixels |
| `stickers/sticker-pixel-star.png` | `public/assets/sticker-pixel-star.png` | PRO-74 Star sticker |
| `stickers/sticker-pixel-rainbow.png` | `public/assets/sticker-pixel-rainbow.png` | PRO-74 Rainbow sticker |
| `stickers/sticker-pixel-unicorn.png` | `public/assets/sticker-pixel-unicorn.png` | PRO-74 Unicorn sticker |
| `stickers/sticker-pixel-heart.png` | `public/assets/sticker-pixel-heart.png` | PRO-74 Heart sticker |
| `fonts/fraunces-latin-600.woff2` | `dist/client/assets/fraunces-latin-600-normal-BFCDtZfi.woff2` | Headings and wordmark |
| `fonts/dm-sans-latin-400.woff2` | `dist/client/assets/dm-sans-latin-400-normal-CW0RaeGs.woff2` | Body text |
| `fonts/dm-sans-latin-500.woff2` | `dist/client/assets/dm-sans-latin-500-normal-B9HHJjqV.woff2` | Interface medium weight |
| `fonts/dm-sans-latin-600.woff2` | `dist/client/assets/dm-sans-latin-600-normal-Aqo67rzb.woff2` | Controls |

Fraunces and DM Sans are distributed under the SIL Open Font License; their complete notices are in [licenses/fraunces-OFL.txt](licenses/fraunces-OFL.txt) and [licenses/dm-sans-OFL.txt](licenses/dm-sans-OFL.txt). Both the Camera and brand Sparkle icons are covered by [licenses/phosphor-MIT.txt](licenses/phosphor-MIT.txt). No font or icon package is required at runtime.

The handoff records the logo, backdrops, Gallery empty illustration, unicorn samples and four pixel stickers as generated with built-in OpenAI ImageGen for the approved design. The samples are AI-generated illustrations, not camera photos. The handoff's `asset-notes.md` records the prompts and revisions. This establishes recorded generation provenance, not complete public redistribution clearance. Account/service authority and reference-input rights still require the evidence below. No third-party artwork license, trademark clearance or exclusivity is asserted for generated files.

The original `logos/logo_transparent.png` and `frames/purple.png` remain the export watermark and frame. Their ownership/license was not established in the handoff. The existing VintageCharm OTF is preserved but no longer loaded by the UI; its license was not established either. No new permission to redistribute these existing assets is claimed here.

Keep backdrops, selection handles, Gallery empty artwork and zoom decoration in the DOM/CSS. Export draws the existing photos, watermark, optional Purple frame, then ordered pixel stickers. Do not apply pixelated image rendering or disable canvas smoothing for camera photos or the logo. Sticker tray images use `image-rendering: pixelated`; canvas smoothing is disabled only inside each sticker draw's save/restore. PNGs are copied byte-for-byte from the approved handoff with alpha and source aspect preserved. Scaling/rotation can create transformed edges; integer-grid perfection at every angle is not asserted.

## PRO-86 remediation preparation — 30 October 2026

This continues the [completed provenance audit in PRO-86](https://linear.app/botlog/issue/PRO-86/release-blocker-clear-snapicorn-asset-provenance-and-public), against HEAD `b399321dd6e2f061c248117d1281d84a9de1b272`. It prepares decisions only. No artwork, composition, exported pixels, Gallery data, Git history or publication configuration is changed. The pre-existing edits to `docs/pro-64-verification.md` are preserved. Supplied global working agreements apply; no repository/ancestor or relevant nested AGENTS.md was found. The handoff's AGENTS.md was read as reference constraints, not release authorization.

### Completed attribution correction and retention status

The retained source is `snapicorn-handoff/node_modules/@phosphor-icons/react`, version **2.1.10**, under the local handoff retained outside the repository. Its complete `LICENSE` was copied byte-for-byte to `assets/licenses/phosphor-MIT.txt`: **Copyright (c) 2020 Phosphor Icons**. The prior 2023 notice matched core upstream rather than the actual React source package. Both local SVG path strings match `dist/defs/Camera.es.js` (regular) and `dist/defs/Sparkle.es.js` (fill); About now credits both. No icon geometry changed.

| Assets | Public distribution status after preparation | Action |
| --- | --- | --- |
| Fraunces 600 and DM Sans 400/500/600 WOFF2 | Verified by completed audit; exact Fontsource 5.3.0 files and matching complete OFL notices | Retain binaries and both complete notices. |
| `design/camera.svg`, `design/brand-sparkle.svg` | Verified: MIT grant and corrected source-package notice | Retain with complete Phosphor notice. |
| 12 generated PNGs listed above | Unverified: generation recorded and bytes matched in audit; authority/input clearance incomplete | Retain in working source pending evidence; do not treat this as publication clearance. |
| `logos/logo_transparent.png`, `frames/purple.png` | Unverified | Clear rights or obtain separate replacement approval. Mandatory watermark blocks a None-only release too. |
| `imgs/placeholder-white.png` | Unverified provenance; audit decoded only opaque white pixels, 1214×1093 | Owner choose source evidence or a separately scoped independently created plain-color replacement/CSS solution. No pixel change now. |
| Four historical files below | Unused; rights unresolved, VintageCharm requires exclusion or an adequate grant | Proposed artifact exclusion only; files remain intact. |

Verified means documented permission supports the stated distribution with notices retained. Unverified does not assert infringement. No unresolved artwork is promoted to Verified.

### Evidence needed for generated artwork

Keep the handoff's `asset-notes.md`, `ASSETS.md`, generation records and file hashes as the evidence chain. The audit established exact-byte matches for the 12 current PNGs; the prompt notes alone do not identify the contracting account holder or prove reference rights. Supply a file-by-file ledger (group rows are acceptable only when they share the same evidence) with:

1. Current relative filename and SHA-256, original output identifier/path, generation date, actual service/provider and model/tool if known, and a redacted session/job record connecting that output to this file. Record any subsequent edits and reference files. Preserve originals; do not upload credentials or private account details to Git/Linear.
2. Generating account holder or organization, applicable agreement and effective version on the generation date (individual/regional, business/API or another provider), and the creator's authority to act for Snapicorn. If generated for someone else, provide their written assignment or license/authorization to Snapicorn.
3. A grant/confirmation covering public website display, delivery of the raw source PNGs through hosting/repository/archive, adaptation/resizing and use in user-customized finished PNGs that can be downloaded/shared/saved. Include required attribution and restrictions, if any. Stickers need explicit coverage of their finished-strip role; decorative samples/backdrops stay outside composition.
4. Every actual reference input's identity, source, creator/rights holder, license/permission, and evidence that it permitted submission to the generation service plus the resulting adaptation and public uses above. For a generated reference, follow its own generation/input chain back to a cleared source. If no images were supplied to a particular job, record that fact from its job evidence.

Recorded reference chains requiring confirmation:

| Current files | Handoff record | Remaining evidence |
| --- | --- | --- |
| `design/logo-minimal.png` | Text prompt for unicorn-camera mark | Confirm actual job inputs, account and authority; logo/trademark suitability is a separate owner review. |
| `design/sprite-unicorn-1.png` | New chunky sprite generated from scratch without horse-photo input; later clearance edit | Confirm original and edit jobs and all inputs. Earlier realistic/pixel attempts are historical, not the current source chain unless actually used. |
| `design/sprite-unicorn-{2,3,4}.png` | New first sprite used for style/character | Clear first sprite and confirm exact reference files/job records. |
| `design/magic-{home,editor}-backdrop.png` | Generated from selected Home/Customize visual references | Trace `references/approved-home.png` and `references/approved-customize.png` to their creation records and every supplied screenshot/image. Inspect the actual inputs for original Purple/watermark or other third-party elements; approval of a design does not establish rights. |
| `design/magic-gallery-empty.png` | Original chunky character from first sprite | Confirm first sprite and any other selected visual inputs actually supplied. |
| `stickers/sticker-pixel-{star,rainbow,unicorn,heart}.png` | First sprite as character/palette/style reference; heart also references generated star | Clear sprite and star chains and confirm no archived icon/other image was additionally supplied. Current sticker PNGs are not the archived Phosphor SVGs. |

For **OpenAI-generated output**, establish the actual OpenAI job and the generating user's authority. OpenAI's [individual Terms of Use, Content and Third Party Services](https://openai.com/policies/row-terms-of-use/) assign OpenAI's output interests to that user to the extent permitted by law, require input permissions, and exclude other users' output and Third Party Output from that assignment. Regional/business/API agreements may differ; retain the applicable agreement rather than assuming these individual terms govern. No uniqueness, trademark clearance or third-party reference rights follow from generation alone.

For **output supplied by a third-party service**, obtain that provider's terms/license and the supplier's authority/transfer evidence, even if the provider advertises an OpenAI model or appears inside an OpenAI workflow. Do not apply OpenAI's assignment to Third Party Output. If records reveal stock art, externally retrieved images, commissioned art or third-party references, clear their separate permissions. A screenshot of an approved design, an invoice for tool access, or an AI provenance label alone is insufficient. OpenAI's [content-provenance documentation](https://developers.openai.com/api/docs/guides/content-provenance) can support origin checks; origin verification does not grant rights.

Owner confirmation to attach to the ledger: “I identify the generating account/service and applicable agreement for each listed file, confirm my authority to grant Snapicorn the documented public source-file and finished-image uses, and provide the reference-input permissions and any transfers/restrictions linked in the ledger. Any unknown inputs or rights are listed as unresolved.” Do not request a blanket assertion without the supporting records. If an input remains uncleared, keep the affected output Unverified and choose independently created/cleared art in a later approved task.

### Replacement specifications — approval required before creation or integration

Commission independently drawn originals or use alternatives with explicit applicable grants. Deliver a provenance ledger, editable original if available, final PNG hash and complete notices/assignment. Grants must cover raw public-file redistribution, app customization, adaptations and users' finished PNG distribution. Do not trace the existing watermark or copy Purple's characters, bow, rainbow/star or other decorative components. The generated minimal logo is only a candidate after its own clearance and owner approval; it is not an automatic substitute.

| Constraint | Transparent watermark | Purple overlay |
| --- | --- | --- |
| Current integration | `scripts/composition-coordinator.js` loads `assets/logos/logo_transparent.png`; mandatory for None and Purple | Same coordinator conditionally loads `assets/frames/purple.png` for `purple`; keep None/Purple values and async behavior |
| Required source dimensions | **690×624** PNG with real RGBA transparency, matching current file | **700×2090** PNG with real RGBA transparency, matching current file |
| Current alpha behavior | Decoded alpha range 0–255; transparent background/negative space, no baked white rectangle | Decoded alpha range 0–255; preserve transparent photo windows and footer/watermark visibility; retain alpha layout as a functional constraint without copying decorative art |
| Render placement | `composePhotoStrip()` fits aspect within **240×80** at default 600px photo width; centers horizontally. With 690×624 source this is about **88.46×80**, at `x=(700-logoWidth)/2`, `y=H-115`. Preserve source aspect and current formula; do not stretch, crop or pixelate logo. | `composeFrame()` draws full overlay at `(0,0,W,H)` after photos/watermark and before stickers, stretching source to actual strip dimensions. Design must tolerate 700×1642, 700×2090 and 700×3490; do not assume all camera inputs are 4:3. |
| Art direction | Readable Snapicorn brand mark at actual rendered size; owner approves final design/clearance, including any lettering | Simple original purple/lavender frame is the conservative option; keep photos readable with transparent openings and no uncleared characters or embedded lettering |

The unchanged output contract is four full mirrored captures in order, 600px photo width, `photoHeight=round(600*inputHeight/inputWidth)`, 50px padding, 30px gaps, 100px watermark region, `W=700`, `H=4*photoHeight+290`. The frame's normalized transparent layout stretches with the full image; do not introduce fixed photo cropping to fit it. Preserve white base, layer order, existing sampling for photos/logo, sticker-only smoothing override, filenames/relative paths (or narrowly approved reference updates), current resource loading/error handling and `snapicorn.png` download name. No UI backdrop or handles enter output.

For later acceptance, compare None/Purple at 4:3, 16:9 and portrait 3:4 with identifiable asymmetric synthetic photos. Check alpha and source dimensions, footer visibility, all photo edges/order/mirror, stickers above frame, repeated preview/download decoded equality, and root/subdirectory asset resolution. Artwork replacement intentionally changes its own pixels: owner must approve new visual baselines. Photo pixels/geometry outside the approved overlay and watermark regions must remain consistent; do not demand equality with obsolete artwork hashes. Do not open or migrate existing Gallery records to validate replacements.

Current source SHA-256 (read-only baseline):

- Watermark: `3269ed4cab6167919a04a588f5c7f76ac634a599d9876fefde7b5a19898db887`
- Purple: `6b8e34b0d00bca71e0febc22f4c76e712468ddf8cbca0fecace16bea5b72e762`

### Historical exclusions and static-host exposure

These are the **four** unused historical files, checked against current `index.html`, `scripts/` and `styles/` (including dynamically constructed active sticker paths). All remain tracked:

| Exact path | Proposed release handling |
| --- | --- |
| `assets/fonts/VintageCharm-Regular.otf` | Exclude. Current OFL fonts already replace its UI role; no substitute is needed. Audit identifies SIAPGRAPH STUDIO and a personal-use-only author listing; no entitlement is recorded. A commercial desktop/end-product receipt alone does not establish raw OTF hosting/embedding rights. Retention in a public artifact requires a specific adequate grant. |
| `assets/logos/logo_filled.png` | Exclude unless separately cleared; relationship to watermark does not prove rights. |
| `assets/logos/snapicorn.png` | Exclude unless separately cleared, including embedded lettering. This file is distinct from the output filename `snapicorn.png`. |
| `assets/imgs/placeholder-black.png` | Exclude. No active reference; audit decoded plain opaque black, but source provenance is undocumented. Active placeholder is white. |

**Yes: repository-root static serving can expose these files by direct URL even without links or directory listings.** README's `python -m http.server` serves existing files beneath that root. There is no build step, tracked hosting workflow or release exclusion manifest here. A relative/subdirectory mount changes the URL prefix, not access to files copied beneath it. `.gitignore`, CSS non-use, robots rules and hiding links are not publication exclusions. Actual remote hosting settings have not been inspected or changed; do not infer deployment configuration from the handoff's React/Sites setup.

Safest proposed implementation, after owner approval: create a **separate disposable release directory using an explicit file allowlist**, leaving tracked source and history intact. Preserve relative paths. Include `index.html`, its 16 registered `scripts/*.js` files, `styles/foundation.css`, `styles/style.css`, and the **21 active image/font files only once cleared**: 8 design PNGs, 2 design SVGs, 4 sticker PNGs, 4 WOFF2s, watermark, Purple and white placeholder. Include the 3 full notices and this asset inventory (and README if distributed as documentation). Do not use recursive `assets/` copying, wildcard additions or a repository-root upload. Omit development tests, dependencies, `.git` and private evidence from the web artifact.

Before any separately authorized publication, inspect the full artifact listing against the allowlist and the four excluded paths. Serve only that directory locally; check all static/dynamic assets and font/license URLs at root and a subdirectory mount, and assert direct requests for the four historical paths return 404. A passing app reference scan alone does not prove exclusion. If an existing deployment contains them, uploading fewer files may leave stale files: the owner must approve host-specific clean artifact replacement/removal and verify direct URLs afterward. Preserve a recoverable prior artifact subject to its own access restrictions. No such implementation or remote removal is authorized/performed in this preparation.

Excluding files from the site does **not** hide them in an already public source repository, commit history, source archive or release attachment. Owner must separately identify those publication channels and decide access/distribution handling. No Git history rewrite or deletion is proposed here; clearance for those copies remains unresolved where applicable.

### Release-rights checklist (PRO-86)

The local packaging implementation below supersedes the earlier proposal's implementation-pending statements. Active-asset clearance remains pending; the authorized local verification package is not publication-cleared.

- [x] Correct complete Phosphor notice from exact React 2.1.10 source package; credit Camera and Sparkle. Keep all font/icon notices with the files.
- [x] Prepare reference-input evidence requirements, replacement specifications and exact historical exclusion proposal; no output change.
- [ ] Owner supplies/approves the 12-file generation ledger, account/service agreements, transfer/authority and each reference-input chain. Distinguish OpenAI output from third-party supplied output; resolve unknown selected-concept/screenshot inputs.
- [ ] Owner provides watermark creation/license/assignment covering raw delivery and finished strips, **or** authorizes an independently cleared 690×624 transparent replacement and approves its new output baseline. Decide whether to evaluate the generated minimal logo only after clearance.
- [ ] Owner provides rights for every Purple component, **or** approves a newly drawn 700×2090 transparent purple frame and new baselines. Omitting Purple would be a separate product/acceptance decision, not an assumed fallback.
- [x] Owner authorized local allowlist packaging and exclusion of all four historical paths; implemented and locally verified without deleting source files. This does not authorize publication.
- [ ] Identify public repository/history/archive channels separately; artifact exclusion cannot clear those copies. VintageCharm requires explicit raw-font distribution permission if retained in any distributed artifact.
- [ ] Owner chooses documented retention or a separately approved independent plain-white placeholder/CSS implementation. Keep current 1214×1093 active white file unchanged until then.
- [ ] After the choices above, implement and verify the allowlist artifact and any separately approved replacements; retain notices and evidence, validate direct-URL exclusions and relative paths, and obtain visual/output acceptance.
- [ ] Owner approves any eventual deployment/publication separately after **both** PRO-64 and PRO-78 satisfy their respective remaining hosting, hardware/device, accessibility and full-flow acceptance. PRO-86 remains unresolved; PRO-64 remains In Progress and blocked by PRO-86, PRO-78 remains Backlog and blocked by PRO-86. No dependency is waived.

Recommended first implementation task, after approval of historical exclusions: implement the isolated allowlist release packager with artifact-content and direct-URL exclusion checks. This contains accidental redistribution without altering artwork/output, but does not authorize publishing an artifact with uncleared active assets. Rights evidence collection proceeds before any replacement choice; creation/integration of cleared watermark and Purple follows only the corresponding owner decisions.

### Preparation verification

The corrected MIT notice byte-matches the installed source `LICENSE` (SHA-256 `6918b72504641180600cbbd4a86b0dfa9dfccf788775694325b71b9a029f6eb4`). Both SVG path strings match their source definitions. Static reference checks confirmed all 21 active image/font paths exist, all 16 scripts are registered, and the four tracked historical asset paths are disjoint from application references. `snapicorn.png` as a download filename is not a reference to `assets/logos/snapicorn.png`. Documentation relative links resolve. `git diff --check` passed; `node --test test/app.test.js` passed **13/13**, including local HTML/CSS resources and script order. No full suite was needed for attribution/documentation-only changes. Watermark/Purple dimensions and alpha were read without saving, their hashes remain as above, and no image/font/script/style files changed. No browser or Gallery data was accessed. Proposed release-artifact and 404 checks remain unimplemented, not reported as passed. Actual remote hosting was not tested, and no release approval is inferred.

## Local allowlist package — PRO-86 implementation, 30 October 2026

The owner authorized local packaging and exclusion of the four historical files, without source deletion or publication. `npm run package:local` now creates `dist/local-package/` from the explicit [43-file allowlist](../tools/static-package.js): index, 16 scripts, two styles, all 21 active images/fonts and the three full notices. Runtime paths and bytes are preserved. ASSETS.md, README, tests, fixtures, dependencies, metadata and verification artifacts are not included. Source assets and prior uncommitted verification documentation remain intact.

Generation uses a fixed output, validates source/destination components, rejects links and unexpected entries, and never deletes files or directories. Full suite: **229/229 passed**; lint and `git diff --check` passed. Loopback servers rooted in the generated directory returned source-identical bytes for every runtime resource and notice at `/` and `/snapicorn/`; all four historical direct paths returned **404 at both mounts**. See [generation, inspection, safeguards and verification evidence](../docs/pro-86-packaging.md).

This package is **not yet publication-cleared**. Local copying does not clear the 12 generated PNGs' authority/reference-input rights, original watermark, Purple frame or active white placeholder. Public repository/history/archive exposure and any stale deployed files require separate owner decisions. PRO-64/PRO-78 release gates remain unchanged. No artwork/pixel/behavior changes, source deletion, history rewrite, commit, push, deployment or publication occurred.
