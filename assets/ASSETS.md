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

The original `logos/logo_transparent.png` remains the export watermark for **None only**, provisionally retained and still Unverified for publication. The owner confirmed ChatGPT origin; see the [31 October reassessment](#original-watermark-reassessment--31-october-2026). `frames/purple.png` now contains the independently authored, owner-selected **B — Cream Moonwalk** PNG; Purple omits the original watermark entirely. The original Purple survives only at `frames/historical/purple-legacy.png`, outside the release allowlist. See the [current integration ledger](#cream-moonwalk-local-integration--31-october-2026). VintageCharm is also historical and excluded; no new public redistribution permission is claimed for these historical assets.

Keep backdrops, selection handles, Gallery empty artwork and zoom decoration in the DOM/CSS. Export draws the existing photos, the original watermark for None only, the optional Purple frame, then ordered pixel stickers. Do not apply pixelated image rendering or disable canvas smoothing for camera photos or the logo. Sticker tray images use `image-rendering: pixelated`; canvas smoothing is disabled only inside each sticker draw's save/restore. Handoff PNGs and Cream Moonwalk are copied byte-for-byte with alpha and source aspect preserved. Scaling/rotation can create transformed edges; integer-grid perfection at every angle is not asserted.

## PRO-86 remediation preparation — 30 October 2026

Historical preparation snapshot: the [31 October integration ledger](#cream-moonwalk-local-integration--31-october-2026) supersedes the legacy runtime behavior, frame hash and pending Purple selection below. Original evidence remains preserved.

This continues the [completed provenance audit in PRO-86](https://linear.app/botlog/issue/PRO-86/release-blocker-clear-snapicorn-asset-provenance-and-public), against HEAD `b399321dd6e2f061c248117d1281d84a9de1b272`. It prepares decisions only. No artwork, composition, exported pixels, Gallery data, Git history or publication configuration is changed. The pre-existing edits to `docs/pro-64-verification.md` are preserved. Supplied global working agreements apply; no repository/ancestor or relevant nested AGENTS.md was found. The handoff's AGENTS.md was read as reference constraints, not release authorization.

### Completed attribution correction and retention status

The retained source is `snapicorn-handoff/node_modules/@phosphor-icons/react`, version **2.1.10**, under the local handoff retained outside the repository. Its complete `LICENSE` was copied byte-for-byte to `assets/licenses/phosphor-MIT.txt`: **Copyright (c) 2020 Phosphor Icons**. The prior 2023 notice matched core upstream rather than the actual React source package. Both local SVG path strings match `dist/defs/Camera.es.js` (regular) and `dist/defs/Sparkle.es.js` (fill); About now credits both. No icon geometry changed.

| Assets | Public distribution status after preparation | Action |
| --- | --- | --- |
| Fraunces 600 and DM Sans 400/500/600 WOFF2 | Verified by completed audit; exact Fontsource 5.3.0 files and matching complete OFL notices | Retain binaries and both complete notices. |
| `design/camera.svg`, `design/brand-sparkle.svg` | Verified: MIT grant and corrected source-package notice | Retain with complete Phosphor notice. |
| 12 generated PNGs listed above | Unverified: generation recorded and bytes matched in audit; authority/input clearance incomplete | Retain in working source pending evidence; do not treat this as publication clearance. |
| `logos/logo_transparent.png` | Owner-attested ChatGPT origin; Unverified for publication; conditional retention recommended | Follow the [reassessment and owner authorization conditions](#original-watermark-reassessment--31-october-2026). Not fully Verified; None also requires clearance. |
| `frames/purple.png` | Unverified | Clear all component rights or obtain separate replacement approval. |
| `imgs/placeholder-white.png` | Approved independent replacement integrated and verified. | Active placeholder provenance resolved. See verification below. |
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
- [ ] Owner completes the [original watermark retention conditions](#original-watermark-reassessment--31-october-2026), including account authority, reference-input disposition and explicit file-specific authorization for raw delivery and finished strips, **or** separately authorizes a cleared replacement and its new baseline. Recovery of the original conversation is desirable, not an automatic prerequisite to an informed retention decision.
- [x] Owner selects the exact independently authored 700×2090 Cream Moonwalk PNG and authorizes local integration, omission of Purple's watermark and intentional new regression baselines. Public distribution remains separately gated; legacy Purple stays excluded.
- [x] Owner authorized local allowlist packaging and exclusion of all four historical paths; implemented and locally verified without deleting source files. This does not authorize publication.
- [ ] Identify public repository/history/archive channels separately; artifact exclusion cannot clear those copies. VintageCharm requires explicit raw-font distribution permission if retained in any distributed artifact.
- [x] Approved independent white placeholder integrated and verified.
- [ ] After the choices above, implement and verify the allowlist artifact and any separately approved replacements; retain notices and evidence, validate direct-URL exclusions and relative paths, and obtain visual/output acceptance.
- [ ] Owner approves any eventual deployment/publication separately after **both** PRO-64 and PRO-78 satisfy their respective remaining hosting, hardware/device, accessibility and full-flow acceptance. PRO-86 remains unresolved; PRO-64 remains In Progress and blocked by PRO-86, PRO-78 remains Backlog and blocked by PRO-86. No dependency is waived.

Recommended first implementation task, after approval of historical exclusions: implement the isolated allowlist release packager with artifact-content and direct-URL exclusion checks. This contains accidental redistribution without altering artwork/output, but does not authorize publishing an artifact with uncleared active assets. Rights evidence collection proceeds before any replacement choice; creation/integration of cleared watermark and Purple follows only the corresponding owner decisions.

### Preparation verification

The corrected MIT notice byte-matches the installed source `LICENSE` (SHA-256 `6918b72504641180600cbbd4a86b0dfa9dfccf788775694325b71b9a029f6eb4`). Both SVG path strings match their source definitions. Static reference checks confirmed all 21 active image/font paths exist, all 16 scripts are registered, and the four tracked historical asset paths are disjoint from application references. `snapicorn.png` as a download filename is not a reference to `assets/logos/snapicorn.png`. Documentation relative links resolve. `git diff --check` passed; `node --test test/app.test.js` passed **13/13**, including local HTML/CSS resources and script order. No full suite was needed for attribution/documentation-only changes. Watermark/Purple dimensions and alpha were read without saving, their hashes remain as above, and no image/font/script/style files changed. No browser or Gallery data was accessed. Proposed release-artifact and 404 checks remain unimplemented, not reported as passed. Actual remote hosting was not tested, and no release approval is inferred.

## Local allowlist package — PRO-86 implementation, 30 October 2026

The owner authorized local packaging and exclusion of the four historical files, without source deletion or publication. `npm run package:local` now creates `dist/local-package/` from the explicit [43-file allowlist](../tools/static-package.js): index, 16 scripts, two styles, all 21 active images/fonts and the three full notices. Runtime paths and bytes are preserved. ASSETS.md, README, tests, fixtures, dependencies, metadata and verification artifacts are not included. Source assets and prior uncommitted verification documentation remain intact.

Generation uses a fixed output, validates source/destination components, rejects links and unexpected entries, and never deletes files or directories. Full suite: **229/229 passed**; lint and `git diff --check` passed. Loopback servers rooted in the generated directory returned source-identical bytes for every runtime resource and notice at `/` and `/snapicorn/`; all four historical direct paths returned **404 at both mounts**. See [generation, inspection, safeguards and verification evidence](../docs/pro-86-packaging.md).

This package is **not yet publication-cleared**. Local copying does not clear the 12 generated PNGs' authority/reference-input rights, original watermark, Purple frame or active white placeholder. Public repository/history/archive exposure and any stale deployed files require separate owner decisions. PRO-64/PRO-78 release gates remain unchanged. No artwork/pixel/behavior changes, source deletion, history rewrite, commit, push, deployment or publication occurred.

## Original watermark reassessment — 31 October 2026

**Recommendation: conditionally retain the original watermark. Evidence status: owner-attested ChatGPT origin; repository continuity corroborated; generation record not independently verified; publication authorization pending (Unverified, not fully Verified).** This reassessment supersedes earlier watermark-only statements that its creator was wholly unknown or that replacement/original conversation recovery is necessarily required. It does not clear publication or other assets.

> The owner confirms that the original Snapicorn watermark was generated using ChatGPT. The original generation conversation is currently unavailable, so the exact prompt, generation date, and any reference inputs have not been independently verified.

### Evidence and limits

Reviewed the supplied global AGENTS.md agreements, PRO-86 description and both existing comments (packaging and proposals), relevant README/asset/release documentation, proposal README/verification record, and local Git history at HEAD `7d1d7f653cf7ce55b50ce010b403dea4417221e4`. No applicable filesystem AGENTS.md was found in the repository, relevant asset/proposal directories or filesystem ancestors.

| Evidence category | Finding | What it establishes |
| --- | --- | --- |
| Owner-confirmed provenance | The attestation above, supplied with this reassessment request | ChatGPT origin according to the owner; does not identify the contracting account, actual inputs or precise generation date. |
| Repository historical evidence | `66bf302ce87efe2820fc4a7bcf2bef23f7b4801f`, “Add initial files,” author/committer date **1 May 2025, 23:20:23 +08:00**: adds `images/logo_transparent.png`; initial HTML uses it as favicon | Recorded presence in early development, not an independently authenticated generation timestamp. Git dates are contributor-controlled. |
| Repository custody continuity | `cfb1d1d4dc8428fcf1299c869bfa1ad2e8e21a86`, **3 May 2025, 23:21:41 +08:00**: R100 relocation to `assets/logos/logo_transparent.png` | Initial, relocated and HEAD files share Git blob `b24f8d5fbbd84ec719834988a618e253c1b22a0e`; direct binary comparison confirms current bytes equal the initial file. |
| Early watermark use | `e95161a750f908daa24bf86ba4d2d528c2e3cb2e`, “Add watermark,” **3 May 2025, 23:48:52 +08:00**: loads this path and draws it before PNG encoding; `9b6e302c704c112e2f01de312c058f02519ccb27`, “Center watermark,” **12 May 2025, 22:02:37 +08:00**: retains path and adjusts placement | Supports the suggested May 2025 development/use timeframe. Code history does not prove a particular export or public release actually occurred. |
| Source-file metadata | Current file: **189,796 bytes; 690×624; 8-bit indexed PNG (color type 3), palette transparency**. Chunks: IHDR, PLTE, tRNS, pHYs, IDAT, IEND | No text, EXIF, generation-time, author, prompt or C2PA record in this PNG. Absence of metadata neither disproves ChatGPT origin nor establishes that no reference image was used. Filesystem timestamps are not generation evidence. |
| Earlier documentation | Initial README is only “# snapicorn”; retained October 2026 ASSETS.md says original watermark rights were not established in the handoff. Relevant README/ASSETS history and commit-message searches contain no recovered generation record | Earlier uncertainty is consistent with missing records, not evidence against the owner's new attestation. The handoff's separate logo-minimal/ImageGen provenance does not authenticate this original mark. |
| Independently verified generation records | **None recovered or supplied** | Exact prompt/date/model, reference inputs, generating account and any edits before the first commit remain unverified. No claim that the original conversation was located. |

Exact current watermark SHA-256: `3269ed4cab6167919a04a588f5c7f76ac634a599d9876fefde7b5a19898db887`. Historical code/commit evidence supports custody and use only; it does not prove contractual entitlement.

### Official terms and redistribution assessment

Official sources accessed 31 October 2026:

- [OpenAI individual Terms of Use, effective 11 December 2024 (official archive)](https://openai.com/policies/row-terms-of-use/revisions/2024-12-11/), Registration, Using our Services, Content and Disclaimer: the generating user receives OpenAI's output interests to the extent legally possible, must hold input permissions and have authority when acting for another entity. The grant excludes other users' output and Third Party Output; uniqueness and non-infringement are not promised.
- [Current individual Terms of Use, effective 1 January 2026](https://openai.com/policies/terms-of-use/), corresponding sections: retain those core ownership, input-rights and review obligations. Current terms corroborate the general position; they do not retroactively prove this generation's contract. The restriction on distributing the service is distinct from rights in generated output.
- [Official ChatGPT FAQ, commercial uses](https://help.openai.com/en/articles/6783457-what-is-chatgpt): expressly supports reprinting, selling and merchandising output under the terms/policies on either free or paid plans.
- [Archived December 2024 Europe terms](https://openai.com/policies/dec-2024-eu-terms/): parallel output ownership and input-permission provisions, but regional applicability depends on the generating user's residence. Individual terms distinguish Enterprise/API/business agreements; no account category or jurisdiction is established here.
- [Sharing & publication policy](https://openai.com/policies/sharing-publication-policy/): sharing guidance calls for manual review, attribution to the person/company and clear AI disclosure; individual terms prohibit falsely describing output as human-generated. Retain accurate AI disclosure and ensure the eventual publication presentation addresses applicable guidance; no UI/export changes are made here.

**Assessment/inference:** these grants and commercial-use guidance reasonably support public website use, raw watermark delivery and embedding/resizing in users' downloadable/shared/saved strips, provided Snapicorn has the generating user's authority and any input/reference permissions. No separate OpenAI image royalty or requirement to retain a generation transcript was found in the reviewed provisions. Missing chat history alone therefore does not require replacement.

December 2024 individual terms are a plausible historical fit if creation occurred near the recorded May 2025 use under a non-European individual account; the repository only establishes presence by its first recorded commit, so it cannot fix the creation date, residence, account type or governing terms. Earlier creation, regional terms, an employer/client account or a third-party tool could change the applicable agreement. Confirm those facts and retain the applicable version when identifiable; disclose remaining uncertainty rather than assume today's terms governed.

Contractual allocation of OpenAI's interests is **not** a determination that this image has enforceable copyright, is exclusive, is suitable for trademark registration, or is free from third-party claims. It does not license uploaded logos, characters, lettering, stock images or other references. The owner's present statement establishes origin by recollection, but **does not yet adequately establish generating-account authority or reference-input clearance**. No trademark search or independent third-party rights clearance was performed.

### Conditions and exact owner decision

Keep the current file while resolving these narrow conditions; do not replace it solely because the conversation is missing:

1. Owner identifies, without credentials/private account identifiers, whether they were the generating account holder or acted with its holder/organization's authority; confirms Snapicorn's right to the stated uses and records any employer/client claim, permission or transfer. Supply a redacted supporting record if available.
2. Owner records the best remembered creation period, service/account category and residence relevant to terms. Confirm the archived agreement if identifiable; otherwise explicitly acknowledge that its exact version remains unverified. Do not invent a date or model.
3. Owner states whether reference images, uploaded artwork, existing logos/characters or third-party lettering were used, to the best of their knowledge. For known inputs, identify them and document permission for service submission, adaptation and the public uses. A remembered text-only process can be recorded as a further attestation, not independent verification. If inputs cannot be recalled, list them as unknown. Recovery of a chat/export/original output tied to this file would strengthen this evidence; permission from an actual reference rights holder resolves a known input issue.
4. After reviewing the above, owner explicitly authorizes **retention of this exact SHA-256 file** for website display, raw PNG hosting/public repository/archive delivery, resizing/adaptation, and inclusion in user-customized PNGs for download, sharing and Gallery save, including commercial use where applicable. Owner acknowledges Purple occlusion and accepts the specifically listed residual prompt/date/account/terms/input uncertainties. Unknown inputs may support an informed risk-acceptance decision, but such approval cannot create missing third-party permissions; known conflicting rights require clearance or a separately approved replacement.

Suggested final decision record, to complete accurately rather than treat as already given:

> I authorize Snapicorn to retain assets/logos/logo_transparent.png, SHA-256 3269ed4cab6167919a04a588f5c7f76ac634a599d9876fefde7b5a19898db887, for the public raw-file, website, adaptation and user-finished PNG uses listed above. My generating-account authority and reference-input account are [identify supporting record/attestation and any permissions]. The remaining uncertainties I accept are [list explicitly, including unavailable original conversation and any unverified agreement or inputs]. I acknowledge that Purple currently obscures the watermark. This decision concerns this watermark only; it does not authorize deployment or clear other assets.

**No such final authorization has been given in this reassessment.** Preserve the Unverified publication status even if an owner later elects risk-based retention without independent generation records; record the actual decision and evidence level. If the owner cannot establish authority, finds uncleared references, or declines residual uncertainty, use a separately approved cleared replacement.

### Preserved alternatives and separate release matters

[A — Horn Camera and B — Orbit Camera](../proposals/pro-86-watermark/README.md) remain available, unapproved and unintegrated. Their existing review instructions describe optional replacement approval, not a requirement to replace the original. No proposal assets or prior records were deleted.

At reassessment time, legacy Purple obscured the watermark at all three ratios. That prior review evidence remains historical. The subsequent explicit owner authorization below changes Purple to omit the watermark rather than conceal it; None retains the original placement.

Purple component rights, the other 12 generated artwork files and their reference chains, placeholder provenance, historical-file/public-history/archive exposure and all PRO-64/PRO-78 acceptance remain **separate unresolved matters**. This reassessment does not clear related historical logo variants or authorize publication of comparison previews. No dependencies or acceptance criteria are changed.

### Reassessment verification

Documentation relative links/anchors and official source URLs were checked; Git history, blob identity, direct initial/current byte equality and current SHA-256 were checked read-only. Diff/whitespace and file-hash checks confirm documentation-only changes, preserving existing proposal files and release-package bytes. Application tests were not run because application behavior did not change. No artwork, composition/export code, PNG regression baseline, release artifact or user/Gallery data was changed; no package rebuild, staging, commit, history rewrite, push, deployment or publication.

## Cream Moonwalk local integration — 31 October 2026

The owner's integration task selects B and authorizes the exact PNG plus one compositor rule: **None draws the original watermark; Purple never loads or draws it**. This supersedes the proposal's earlier integration stop condition. Authorization covers local integration and verification only, with no publication or other asset replacement. This is not application-wide clearance.

| Material | Current role and supporting provenance | Publication status |
| --- | --- | --- |
| `frames/purple.png` | Exact B — Cream Moonwalk, 700×2090, 8-bit RGBA. SHA-256 `2ae9455c799d864a47da64b0daf949b8093d34a972e334797fc4b180e59fdcad`, verified before replacement and after byte-for-byte copying | Owner-approved local integration; publication remains separately gated. |
| [Cream Moonwalk source and creation record](../proposals/pro-86-purple-frame/README.md) | Preserved `b-cream-moonwalk.svg`, `.png`, `build.mjs` and verification records. Independently authored SVG geometry by Codex, locally rasterized with Chrome Canvas: AI-assisted vector artwork. The creation record identifies no ImageGen job, stock art, font, character, traced path or imported image used to construct it. Legacy images served only as comparison controls. SVG SHA-256 `6036251870e57600e956e4e53f42894460a4522526b97467b2baa6f7dc47215c` | All proposals/comparison composites are excluded from packaging. No exclusivity or copyright-enforceability claim; record owner authority for public raw-file, adaptation and finished-PNG uses before publication. |
| `frames/historical/purple-legacy.png` | Original Purple preserved byte-identically, SHA-256 `6b8e34b0d00bca71e0febc22f4c76e712468ddf8cbca0fecace16bea5b72e762`. Historical only; no runtime reference | Rights unresolved; explicitly excluded alongside the four earlier historical exclusions. Public repository/history/archive exposure is separate. |
| `logos/logo_transparent.png` | Original owner-attested ChatGPT watermark, unchanged SHA-256 `3269ed4cab6167919a04a588f5c7f76ac634a599d9876fefde7b5a19898db887`; None only | Provisionally retained, Unverified for publication. Account authority, actual reference inputs and file-specific public-use authorization remain outstanding under the reassessment above. |

The artwork and its transparent safe areas are untouched; no opaque patch is added. Photo width, height calculation, order, sampling, crop/mirror behavior, gaps, reserved footer dimensions, full-frame scaling and sticker order remain unchanged. Purple retains its selection name/value and asset path. Preview and export consume the same revision; frame changes discard old PNG caches through the existing invalidation mechanism.

The package still contains only the explicit **43 runtime files**, with five historical exclusions. [Integration verification](../docs/pro-86-cream-moonwalk.md) records the new baselines, pixel checks, preservation checks and exact command results. Older reports/proposal renders remain historical snapshots of the legacy compositor.

Remaining publication blockers include the original watermark clearance, the separate 12-file generated-artwork authority/reference ledger, owner public-use authorization for the new artwork, historical repository/archive/remote-copy handling, and unchanged PRO-64/PRO-78 hosted HTTPS, hardware/device, accessibility and full-flow acceptance. No application-wide publication clearance is declared. PRO-86 stays Backlog, PRO-64 In Progress and PRO-78 Backlog; dependencies and remaining acceptance criteria are unchanged. No Gallery/Settings data access, commit, push, deployment, publication or history rewrite.

## Active white placeholder verification

The approved independently generated placeholder is integrated. The Node generator at proposals/pro-86-white-placeholder/generate.mjs constructs opaque-white RGBA scanlines from constants without reading the original PNG. Production and candidate SHA-256: 130c63e29191d3a09961b3544b29e7f02fd56e17559b6878bc827c6449bbf2f0. The original was preserved from the verified HEAD blob at proposals/pro-86-white-placeholder/original-placeholder-white.png, SHA-256 10ab133c3a00c97ae9dd10bc46897624aba31b72626cfb1bf0c40c1d7d846898. Full decoding confirmed 1214×1093, 8-bit RGBA, all pixels opaque white and zero differences. All 231 tests passed, including fallback loading at both mounts. Lint and diff checks passed. The 43-file local package contains the approved hash and excludes all proposals and the preserved original. The active white-placeholder provenance concern is resolved.
