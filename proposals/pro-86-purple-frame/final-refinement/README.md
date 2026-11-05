# Cream Moonwalk final refinement — stopped on artwork limitation

31 October 2026 (Asia/Manila). Owner selected **B — Cream Moonwalk** as the preferred direction. A is not selected. This record supersedes the earlier request to choose A/B; it does not approve integration or publication.

**The requested combination is impossible with one static 700 × 2090 RGBA overlay under the unchanged compositor.** No artwork was changed. This is a stopped feasibility investigation, not a successfully refined candidate. All pre-existing artwork and review files remain intact.

## Evidence

The renderer embeds `scripts/composition.js` verbatim. The original watermark is drawn before the frame; the frame scales across the entire output. We reused the existing synthetic-photo review renderer without changing production functions, layer order, photo geometry, dimensions or smoothing.

At 3:4, photo 4 occupies x=[50,650), y=[2540,3340). Mapped into the 700 × 2090 source, this is x=[50,650), y=[1521.088825,2000.171920). Source alpha must remain zero there to protect the photo. At 4:3, the visible watermark includes source rows 1975–1999 inside that rectangle. An opaque artwork patch at those positions would cover portrait photo 4. Nonnegative RGBA alpha cannot cancel that coverage. Partial opacity also violates zero overlay coverage and cannot completely occlude the watermark.

Actual original-logo versus transparent-logo composition controls confirm the overlap:

| Aspect / output | Visible watermark pixels | Visible pixels mapping inside portrait photo 4 | Overlay pixels touching photos 1 / 2 / 3 / 4 |
| --- | ---: | ---: | --- |
| 4:3 / 700 × 2090 | 1,461 | 1,197 | 0 / 0 / 0 / 0 |
| 16:9 / 700 × 1642 | 3,133 | 2,869 | 0 / 0 / 0 / 0 |
| 3:4 / 700 × 3490 | 0 | 0 | 0 / 0 / 0 / 0 |

The counts in the conflict column classify output pixel centers mapped to source coordinates; they are not a claimed number of affected portrait pixels. The 4:3 render has identity scaling, so its interior overlapping source pixels alone establish the contradiction independently of boundary sampling details. Changing footer colors, crescent geometry or opacity solely below source y=2003 cannot hide watermark pixels above that boundary.

## Fresh diagnostic previews

These are newly rendered evidence of the existing B, **not fixed previews**. Each is byte-identical to its existing review counterpart; those files were not overwritten.

| Aspect | Full preview | Native footer crop |
| --- | --- | --- |
| 4:3 | [700 × 2090](b-cream-moonwalk-4x3.png) | [700 × 180](b-cream-moonwalk-4x3-footer.png) |
| 16:9 | [700 × 1642](b-cream-moonwalk-16x9.png) | [700 × 180](b-cream-moonwalk-16x9-footer.png) |
| 3:4 | [700 × 3490](b-cream-moonwalk-3x4.png) | [700 × 180](b-cream-moonwalk-3x4-footer.png) |

All three native footer crops were visually inspected: crescent, orbit and capsule are complete, with the existing aspect-dependent vertical scaling. The clipped original watermark remains visible above the capsule at 4:3 and 16:9. The 3:4 watermark is hidden. The requested consistent clean footer therefore fails acceptance.

## Verification and exact artifact

- Existing [B PNG](../b-cream-moonwalk.png): 700 × 2090, 8-bit RGBA (PNG color type 6). SHA-256: `2ae9455c799d864a47da64b0daf949b8093d34a972e334797fc4b180e59fdcad`.
- Existing [B SVG](../b-cream-moonwalk.svg) SHA-256: `6036251870e57600e956e4e53f42894460a4522526b97467b2baa6f7dc47215c`.
- Fresh SVG raster versus saved PNG: byte-identical PNG and zero differing decoded RGBA channels. Source alpha: 1,200,800 clear pixels, 262,200 opaque pixels, zero partial-alpha pixels.
- All 12 B photo regions: zero touched, opaque or equivalent-opaque overlay pixels.
- `node --test test/composition.test.js`: 6 passed, 0 failed (three aspects, watermark placement, validation and sticker ordering).
- `node proposals/pro-86-purple-frame/final-refinement/verify.mjs`: passed; all three output dimensions, photo clearance and geometric conflict checked. Initial sandbox Chrome startup failed; the permitted local Chrome run succeeded with synthetic photos and a fresh temporary profile.
- [verification.json](verification.json) contains exact preview hashes, output measurements, source hashes and a 190-file preservation inventory. All pre-existing repository/proposal files compared byte-identical, including A, prior review files, original watermark, production Purple, composition scripts, release packaging and baseline snapshots. No Gallery data was accessed.
- Only new evidence files in this directory were written. No production integration, packaging build, baseline update, staging, commit, push, deployment or publication. Existing unrelated working-tree changes are preserved.

Reproduce the isolated investigation using the command above; `PROPOSAL_BROWSER` may select a compatible Chromium executable. This script reads the existing SVG, PNG, original watermark and compositor, and writes only new evidence here. It deliberately does not run the earlier build script, which would rewrite existing review files.

## Remaining approval gate

B remains the preferred direction; A remains unselected and preserved. No compliant replacement PNG exists to approve under the current constraints. Owner direction is required to relax a constraint or authorize a separately scoped composition/design approach. No such change is implemented or inferred here. After an authorized solution is verified, the owner must approve the exact resulting PNG and SHA-256 before separately authorized production integration. The existing B hash above identifies an incomplete candidate, not an integration recommendation. Existing provenance/release gates remain unresolved.

PRO-86 stays Backlog, PRO-64 In Progress and PRO-78 Backlog. Stop here pending owner direction; do not integrate B.
