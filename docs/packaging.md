# Static packaging and release

## Build and preview locally

From the repository root:

```sh
npm run package:local
python -m http.server 8000 --bind 127.0.0.1 --directory dist/local-package
```

Open `http://localhost:8000/`. Hosted camera use requires HTTPS. The packager uses Node built-ins and produces two ignored outputs:

- `dist/local-package/`: the allowlisted runtime files, with their original paths and bytes.
- `dist/SHA256SUMS`: SHA-256 hashes computed from that generated payload, sorted by relative filename.

The current [allowlist](../tools/static-package.js) has 42 files: one HTML file, 16 scripts, two stylesheets, 16 images, four WOFF2 fonts and three complete license notices. Editable SVG source, README, asset notes, tests, fixtures, proposals and development dependencies are excluded. New source files are never included automatically.

Regenerate the payload and manifest together after every source change. The manifest describes the local build, not a deployed release. It belongs beside a release's `site/` directory, outside the web payload; do not commit a working-tree hash snapshot to this development repository.

## Generation safeguards

Output paths are fixed beneath the canonical repository root. The packager validates source, output and manifest paths before writing. It rejects links/junctions, hard links, special files, traversal, unexpected package files/directories and a directory at the manifest path. It performs no deletion. If an older output contains an obsolete file, inspect and archive that output before rebuilding; do not bypass preflight.

Generation assumes a trusted local checkout without concurrent filesystem edits. Copying is not atomic: an I/O failure can leave partial output or an older manifest. Use only a successfully completed build. Serving the repository root does not test package exclusions.

## Verification

```sh
npm test
npm run lint
node tools/verify-frame-pixels.js
```

Packaging tests verify membership, exact source bytes, deterministic hashes, unsafe-path rejection and loopback serving at `/`, `/snapicorn/` and `/snapicorn-release/`. Retired asset URLs remain in exclusion checks even after removal from source. Browser pixel checks require local Chrome; `FRAME_TEST_BROWSER` can select its executable. See [coverage and manual acceptance](verification.md).

## Release layout and rollback

The existing release workflow template is [deploy-pages.yml](../tools/pages-release/.github/workflows/deploy-pages.yml). It expects a release repository with `site/`, a sibling `SHA256SUMS`, and the workflow under `.github/workflows/`. Retain the supplied [.gitattributes](../tools/pages-release/.gitattributes) so payload bytes are not changed by line-ending conversion. The workflow checks all payload hashes and three license notices before uploading. If the allowlist changes, update its expected file count too.

For a separately approved release, use the complete freshly generated package and matching manifest. Remove retired files from the release payload; verify served hashes and excluded direct URLs after deployment. Roll back by reverting the release commit and running the same workflow. Local packaging does not publish anything.

## Shared browser storage

Root and subpath deployments on the same HTTPS origin and browser profile share `snapicorn-finished-gallery` IndexedDB version 1, its `finished-pngs` store, and the legacy `snapicorn-motion-preference` value. Saves and explicit deletions affect that shared Gallery. No storage migration or reset is needed for a path cutover. The old root build at `66d68b9` cannot display Gallery records; they become visible again when a Gallery-capable build is served.

Use disposable profiles for verification. Historical release results and remaining physical-device limits are summarized in [verification.md](verification.md); previous run-specific handoffs are available in Git at `de170d5`.
