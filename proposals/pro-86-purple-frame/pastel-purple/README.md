# Pastel Purple frame

Pastel Purple uses lavender paper, one continuous rounded border and a small centered sparkle detail. It replaces Cream Moonwalk’s repeated rail marks and wide footer capsule. The editable SVG uses original vector shapes.

[Frame PNG](purple.png) · [Editable SVG](purple.svg) · [Before and after overview](comparison.png) · [Footers at export size](footer-comparison.png)

| Capture ratio | Export size | Cream Moonwalk | Pastel Purple |
| --- | --- | --- | --- |
| 4:3 | 700 × 2090 | [Before](before-4x3.png) | [After](after-4x3.png) |
| 16:9 | 700 × 1642 | [Before](before-16x9.png) | [After](after-16x9.png) |
| 3:4 | 700 × 3490 | [Before](before-3x4.png) | [After](after-3x4.png) |

The 700 × 2090 RGBA overlay retains the exact Cream Moonwalk alpha mask. The unchanged compositor places four 600 px wide photos in capture order with 30 px gaps. The white area above the footer varies with the capture ratio because the photo layout and overlay scale independently.

Rebuild the review PNGs from the repository root with `node proposals/pro-86-purple-frame/pastel-purple/render-review.mjs` and local Chrome. `FRAME_TEST_BROWSER` can select the executable. The renderer uses the retained Cream Moonwalk PNG as the before reference and synthetic captures for both versions.

The SVG and PNG match after rasterization. Browser checks found zero overlay coverage or changed pixels in all 12 photo regions. After integration, 24 download checks matched their preview PNGs byte for byte and all three None baselines matched the Cream Moonwalk baselines. The 231-test suite passed, including package checks at the release mount.

The owner approved this artwork for integration on 4 November 2026. The active [PNG](../../../assets/frames/purple.png) and [editable SVG](../../../assets/frames/purple.svg) match the approved files. See the [asset hashes](../../../assets/ASSETS.md#pastel-purple-integration--4-november-2026).
