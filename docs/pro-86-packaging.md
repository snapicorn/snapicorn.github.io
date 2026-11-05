# PRO-86 local static package

The [Settings-removal release candidate](#settings-removal-release-candidate) supersedes the earlier handoffs below.

Implemented and verified on 30 October 2026 (Asia/Manila), using Node.js 24.22.0 on Windows. This package is **not yet publication-cleared**. Packaging approval permits local copies of active assets for verification; it does not establish redistribution rights or authorize deployment.

See the [Pastel Purple release candidate](#pastel-purple-release-candidate) for the current package. The [31 October integration report](pro-86-cream-moonwalk.md) and earlier results are retained as historical evidence.

## Generate and inspect

From the repository root:

```sh
npm run package:local
```

The fixed output is `dist/local-package/`, already ignored through `dist` in `.gitignore`. No command-line destination or manifest override is accepted. The tool uses only Node built-ins. No framework, runtime bundler or dependency was added. It copies current working-tree files, including the previously corrected complete Phosphor notice, without changing source bytes or relative paths.

The authoritative explicit list is `packageFiles` in [tools/static-package.js](../tools/static-package.js). New source files are never automatically included. Repeated generation produces the same paths and bytes for the same input bytes; timestamps and other filesystem metadata are not reproducible-build outputs. There is no archive or generated timestamp in the package.

| Included category | Files |
| --- | ---: |
| `index.html` | 1 |
| Registered classic `scripts/*.js` (individually enumerated) | 16 |
| `styles/foundation.css`, `styles/style.css` | 2 |
| Active images: eight design PNGs, two SVGs, four sticker PNGs, watermark, Purple, white placeholder | 17 |
| Locally hosted WOFF2 fonts | 4 |
| Complete Fraunces OFL, DM Sans OFL and Phosphor MIT notices | 3 |
| **Total** | **43** |

All four historical paths below are excluded. Of the 71 tracked files at the start of this task, 43 are included and **28 are excluded** (these four plus 24 source-only files). New packaging infrastructure, tests and this report are also excluded. Development dependencies and any untracked/private artifacts are denied by default, irrespective of their names or location. README and ASSETS.md stay in source for developers; only the three required license texts accompany runtime files. No repository metadata, QA fixture, verification documentation or evidence directory is copied.

Inspect every generated filename in PowerShell:

```powershell
Get-ChildItem -LiteralPath dist/local-package -File -Recurse | Select-Object FullName
```

Serve only the package for a local browser preview:

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory dist/local-package
```

Open `http://localhost:8000/`; stop with Ctrl+C. Serving the repository root is not an exclusion test and can still expose historical assets.

## Guarded generation

The tool fixes its output beneath the canonical repository root. It validates each allowlist path and every existing component of source and destination paths with `lstat`, rejecting symbolic links/junctions, special files and hard-linked files. Absolute POSIX/Windows paths, drive-relative paths, backslashes and traversal components are rejected. Only known parent directories may exist inside the package. Before copying, it checks every source and the entire existing destination for unexpected files/directories. It performs no deletion and refreshes only allowlisted regular files; unrelated contents cause a failure instead of being cleaned away.

Generation is synchronous, intended for a trusted local checkout without concurrent filesystem edits. It is not an atomic directory swap: an I/O failure can leave a partial package. Resolve the reported problem and rerun successfully before inspection or use. Never use this command as a remote deployment or stale-file cleanup procedure.

## Automated evidence

```sh
npm test
npm run lint
git diff --check
```

The full suite passed **229/229**, with zero failures or skips. Lint and diff whitespace checks passed. Seven new packaging tests cover exact membership and source-byte equality, repeat generation, unapproved source files, historical-file preservation/exclusion, missing-source preflight, path validation, unexpected destination entries, source and destination junctions, hard links and loopback HTTP serving. Link-fixture and loopback tests needed execution outside the restricted Windows sandbox; the initial sandbox attempt reported EPERM/EACCES, then all tests passed with local test permissions.

The HTTP test generates the actual `dist/local-package/` directory, then starts and closes separate loopback-only servers with that directory as their filesystem root at `/` and `/snapicorn/`. It scans HTML resource attributes, CSS URLs and literal JavaScript asset references, and executes the production dynamic sticker catalog to expand its paths. All 21 active image/font paths are covered, including the lazy watermark/Purple loads and white capture placeholder. All 43 package files and the mounted index return HTTP 200 with bytes identical to source. The strict subdirectory server rejects root-level asset leakage and has no SPA fallback. This establishes local HTTP availability, not browser decoding, hosted HTTPS or physical-device acceptance.

| Excluded source path | `/` direct request | `/snapicorn/` direct request |
| --- | --- | --- |
| `assets/fonts/VintageCharm-Regular.otf` | 404 | 404 |
| `assets/logos/logo_filled.png` | 404 | 404 |
| `assets/logos/snapicorn.png` | 404 | 404 |
| `assets/imgs/placeholder-black.png` | 404 | 404 |

These eight direct requests reach the local server; exclusion is not inferred from missing links. Additional metadata/package/test/document URLs return 404. Byte equality covers all application scripts, styles, HTML, notices and active assets. The existing application suite still passes its camera, composition, export, Gallery, Settings and recovery checks. No application behavior or source asset was changed by this task. The existing uncommitted attribution edits and PRO-64 hardware-verification documentation were preserved. No new manual camera, browser-rendering, PNG pixel, Gallery or Settings acceptance was attempted.

## Remaining publication decisions

- Supply the 12-file generated-artwork ledger: account/service and applicable agreement, authority/transfer to Snapicorn, public raw-file and finished-strip uses, and every actual reference-input chain.
- Clear the original watermark, still mandatory for None. Cream Moonwalk now replaces active Purple under local integration approval; legacy Purple is historical and excluded. Public distribution remains separately gated; see the [current integration ledger](../assets/ASSETS.md#cream-moonwalk-local-integration--31-october-2026).
- Resolve the active white placeholder's provenance or separately authorize its independently created replacement. This task keeps it unchanged.
- Identify public repository/history/archive copies of historical files and approve their distribution/access handling separately. Package exclusion does not remove those copies or stale assets on an existing host.
- Complete the unchanged PRO-64 and PRO-78 hosting, hardware/device, accessibility and full-flow acceptance, then separately approve any publication and host-specific artifact replacement.

PRO-86 remains unresolved. PRO-64 and PRO-78 retain their statuses, dependencies and acceptance requirements. The packaging implementation did not delete/replace source assets, rewrite Git history, push, deploy or publish. Local verification is the end of the implementation task.

## Cream Moonwalk integration addendum — 31 October 2026

The 30 October evidence above is historical. Current generation still uses exactly 43 allowlisted runtime files; `assets/frames/purple.png` is now the exact approved Cream Moonwalk PNG. A fifth explicit historical exclusion, `assets/frames/historical/purple-legacy.png`, retains the original Purple locally without distributing it. All `proposals/` files remain denied by default. No recursive asset copy or wildcard was introduced. Current all-resource byte comparisons and direct 404 checks at both mounts, plus exact asset hashes, are recorded in [integration verification](pro-86-cream-moonwalk.md). This local package remains **not publication-cleared**.

## Pastel Purple release candidate

This records the previous candidate. Use the [final footer handoff](#final-footer-stage-1-handoff) for the next redeployment.

The owner approved the Pastel Purple PNG and editable SVG for integration on 4 November 2026. The PNG uses the existing runtime path. The allowlist still contains 43 files, with the editable SVG, proposals and five historical assets excluded. All 43 files match the rebuilt package manifest. Only `assets/frames/purple.png` differs from the previous release manifest.

The browser verifier passed against the [Pastel Purple PNG and RGBA baselines](../test/fixtures/pastel-purple/baselines.json). All three None entries match the historical Cream Moonwalk baselines exactly. All 12 photo regions retain their pixels, and all 24 download checks match the preview PNG bytes. The 231-test suite passed, including byte and exclusion checks on loopback at `/`, `/snapicorn/` and `/snapicorn-release/`.

The local handoff is staged at `dist/pages-release/`, with the complete verified payload under `site/` and [SHA256SUMS](../tools/pages-release/SHA256SUMS) beside it. It targets the separate release repository, `snapicorn/snapicorn-release`. Its `main` branch was checked at [670d7f8](https://github.com/snapicorn/snapicorn-release/commit/670d7f83fdb0ee1bddf39d99b4e2c1e5cf77a596), whose manifest matched the pre-integration package.

After explicit deployment approval, confirm the release repository still has that baseline, apply the two-file update to `site/assets/frames/purple.png` and `SHA256SUMS`, then run **Deploy Snapicorn to GitHub Pages** on `main`. The workflow verifies all 43 file hashes before upload. Check the served Purple PNG hash and the excluded paths at the release URL after deployment. If rollback is needed, revert the two-file release commit and run the same workflow again.

## Final footer Stage 1 handoff

The locally prepared release is at `dist/pages-release-footer/`. Its `site/` has 42 allowlisted files, and [SHA256SUMS](../tools/pages-release/SHA256SUMS) lists the exact payload. The approved logo was already shipped at `assets/design/logo-minimal.png`; its bytes are unchanged.

Compared with the retained previous Stage 1 package, copy these files to the same paths in the clean release repository:

- `site/assets/frames/purple.png`
- `site/scripts/composition.js`
- `site/scripts/composition-coordinator.js`
- `site/index.html` (includes the pre-existing development removal of the obsolete credits paragraph)
- `SHA256SUMS`
- `.github/workflows/deploy-pages.yml` (updates the expected payload count)

Remove `site/assets/logos/logo_transparent.png` from the release repository's payload when applying the update. Do not copy editable sources, sample photos, tests, or proposals. If an older generated `dist/local-package/` still contains the legacy asset, archive that generated output before rebuilding; the packager intentionally refuses to clean unexpected entries.

Run `npm test`, `npm run lint` and `node tools/verify-frame-pixels.js` for the development checks. The browser verifier checks PNG and RGBA baselines, untouched photo regions, and preview/download equality. To check the approved footer pixels as well, set `FRAME_APPROVAL_DIR` to the directory containing the owner review PNGs and sample contact sheet, then run the same verifier. Native share and Gallery paths are covered by the application tests; the browser fixture does not invoke the device share sheet or use existing Gallery data.

After separate approval, confirm the release repository's current manifest, apply the update there, and run **Deploy Snapicorn to GitHub Pages** on its `main` branch. Verify the served PNG and the absence of the legacy watermark at the Stage 1 URL. The production root is outside this release. To roll back, revert the release commit and run the same workflow.

## Settings-removal release candidate

Run `npm run package:local` from the development checkout. The regenerated payload has 42 files. It removes `scripts/settings.js` and includes `scripts/motion.js` to honor an existing Reduce motion choice. CSS continues to follow the OS preference. Gallery and About explain local storage and photo privacy. The [release manifest](../tools/pages-release/SHA256SUMS) lists the 42 exact SHA-256 hashes, including the three bundled license notices.

The [Stage 1 commit](https://github.com/snapicorn/snapicorn-release/commit/aad399a8d0de88ac8e336c981cebc656eaaaa362) applies only the Settings removal and manifest update. The [manual deployment](https://github.com/snapicorn/snapicorn-release/actions/runs/41826885122) passed. All 42 hosted payload hashes and the directory index match the manifest, and 23 excluded URLs returned 404. The hosted Chromium run used a fresh profile and a synthetic camera. It passed four captures, retake cancel and accept, both frames at three aspect ratios, approved footer pixels, exact preview/download bytes, Gallery save/reload/preview/download/keep/delete, About, and OS and saved reduced-motion checks. The browser reported zero console and resource errors.

The full suite passed 215 tests. Lint and Git diff checks passed. The six owner-performed hosted checks and earlier desktop physical-camera evidence retain their original scope. The release candidate still lacks the broader physical-device, camera recovery, and accessibility coverage recorded in PRO-64 and PRO-78.

### Shared browser storage

The root and Stage 1 use the same HTTPS origin. They share the `snapicorn-finished-gallery` IndexedDB database at version 1, the `finished-pngs` store, and any previously saved `snapicorn-motion-preference` value in the same browser profile. A Stage 1 save is visible at the root after cutover. An explicit deletion from either mount removes that same record. The cutover requires no key rename, data copy, reset, or schema upgrade. The old root build at `66d68b9` uses neither IndexedDB nor localStorage. During a rollback it cannot display Gallery records. They become visible again when the new Gallery is served.

A disposable Chrome profile verified that saving at the local subdirectory, opening and downloading at the local root, explicitly deleting there, and returning to the subdirectory operate on the same record. The saved Reduce value and an unrelated localStorage entry survived navigation. Treat the real site origin as shared throughout the cutover and rollback. Use a fresh profile for all verification.

The prepared local cutover runbook is `dist/root-cutover.md`. Production acceptance and the GitHub-side switch require the owner's release-scope decision and approval.
