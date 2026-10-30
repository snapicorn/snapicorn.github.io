# PRO-86 local static package

Implemented and verified on 30 October 2026 (Asia/Manila), using Node.js 24.22.0 on Windows. This package is **not yet publication-cleared**. Packaging approval permits local copies of active assets for verification; it does not establish redistribution rights or authorize deployment.

For the current Cream Moonwalk asset, fifth historical exclusion and updated results, see the [31 October integration report](pro-86-cream-moonwalk.md) and the addendum below. The original implementation results remain as historical evidence.

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
