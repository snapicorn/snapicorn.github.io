# PRO-86 generated artwork publication clearance

## Active white placeholder verification

The approved independently generated placeholder is integrated. The Node generator at proposals/pro-86-white-placeholder/generate.mjs constructs opaque-white RGBA scanlines from constants without reading the original PNG. Production and candidate SHA-256: 130c63e29191d3a09961b3544b29e7f02fd56e17559b6878bc827c6449bbf2f0. The original was preserved from the verified HEAD blob at proposals/pro-86-white-placeholder/original-placeholder-white.png, SHA-256 10ab133c3a00c97ae9dd10bc46897624aba31b72626cfb1bf0c40c1d7d846898. Full decoding confirmed 1214×1093, 8-bit RGBA, all pixels opaque white and zero differences. All 231 tests passed, including fallback loading at both mounts. Lint and diff checks passed. The 43-file local package contains the approved hash and excludes all proposals and the preserved original. The active white-placeholder provenance concern is resolved.

## Evidence and file inventory

The shared findings below apply to every inventory row. The [asset ledger](../assets/ASSETS.md) and [prior PRO-86 audit](https://linear.app/botlog/issue/PRO-86/release-blocker-clear-snapicorn-asset-provenance-and-public) record built-in OpenAI ImageGen as the generating service and exact byte matches to the handoff's `public/assets/<filename>` copies. They identify the handoff's `asset-notes.md` as the retained prompt and revision record. This package reuses the documented audit of those notes and source bytes. The original handoff and service job records were unavailable for direct review here. The recorded chains are retained below. The consolidated inventory verifies the current bytes separately.

Git records the logo, sprites and two backdrops in `70b44b6` (22 October 2026), and the empty Gallery illustration and stickers in `b399321` (25 October 2026). These records establish custody and use. The owner confirms that the 12 generated Snapicorn PNG assets and the original watermark were generated using the owner's own ChatGPT account. The reference inputs for the 12 PNGs originated from ChatGPT-generated material, with no external third-party artwork supplied for those chains. This is an owner declaration. The handoff and Git records support file identity and custody. Independent account or generation records were unavailable. The original watermark conversation, its exact inputs, precise generation date and governing historical terms remain unverified.

| Repository path | Recorded prompt or reference chain and record gaps |
| --- | --- |
| `assets/design/logo-minimal.png` | Unicorn-camera mark text prompt. Exact job inputs were unavailable for independent review. Separate trademark review remains open. |
| `assets/design/magic-editor-backdrop.png` | Selected Customize concept `references/approved-customize.png`. Exact job attachments were unavailable for independent review. |
| `assets/design/magic-gallery-empty.png` | First chunky unicorn character. Exact sprite attachment was unavailable for independent review. |
| `assets/design/magic-home-backdrop.png` | Selected Home concept `references/approved-home.png`. Exact job attachments were unavailable for independent review. |
| `assets/design/sprite-unicorn-1.png` | Chunky sprite generated from scratch without the earlier horse photo, then edited for clearance. Exact job attachments were unavailable for independent review. |
| `assets/design/sprite-unicorn-2.png` | First sprite used for character/style. Exact reference bytes were unavailable for independent review. |
| `assets/design/sprite-unicorn-3.png` | First sprite used for character/style. Exact reference bytes were unavailable for independent review. |
| `assets/design/sprite-unicorn-4.png` | First sprite used for character/style. Exact reference bytes were unavailable for independent review. |
| `assets/stickers/sticker-pixel-heart.png` | First sprite and generated star. Exact reference bytes were unavailable for independent review. |
| `assets/stickers/sticker-pixel-rainbow.png` | First sprite style/palette chain. Exact reference bytes were unavailable for independent review. |
| `assets/stickers/sticker-pixel-star.png` | First sprite style/palette chain. Exact reference bytes were unavailable for independent review. |
| `assets/stickers/sticker-pixel-unicorn.png` | First sprite character/style chain. Exact reference bytes were unavailable for independent review. |

## Original watermark

Git records identical watermark bytes as `images/logo_transparent.png` in `66bf302` on 1 May 2025, relocated in `cfb1d1d` on 3 May. These dates establish repository custody. The watermark is now historical; both frames use the current minimalist logo. See the [historical terms and watermark reassessment](../assets/ASSETS.md#original-watermark-reassessment--31-october-2026).

## OpenAI terms and commercial use

OpenAI’s individual terms allocate its interests in output to the contracting user to the extent permitted by law and require permission for inputs. OpenAI’s ChatGPT FAQ describes commercial use of output subject to the applicable terms and policies. Determine the account category, region and governing version for the generation period. Any known protected third-party material requires its own permissions. Output ownership under the agreement does not establish exclusivity or trademark clearance. [OpenAI Terms of Use](https://openai.com/policies/row-terms-of-use/) · [ChatGPT FAQ](https://help.openai.com/en/articles/6783457-what-is-chatgpt)

## Exact-file publication inventory

Every included row is present as a raw file in the rebuilt `dist/local-package/`. SHA-256 was computed independently for source and packaged copies. All 42 package paths and hashes matched the allowlist and working-tree sources. All six explicit historical exclusions were absent.

| Repository path | SHA-256 | Provenance | Rights evidence | Runtime use | Raw file in package | Intended disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `assets/fonts/fraunces-latin-600.woff2` | `3a1de7711d147bad4422825045f87597fd77cca72e7c96d3b0a81735d00dda82` | Fontsource 5.3.0 | OFL | Headings and wordmark | Yes | Include with OFL notice |
| `assets/fonts/dm-sans-latin-400.woff2` | `4ab51eb2cd7305d177187908d6397474d4520663f6c6e572feb0a64f4fa80006` | Fontsource 5.3.0 | OFL | Body and controls, weight 400 | Yes | Include with OFL notice |
| `assets/fonts/dm-sans-latin-500.woff2` | `19bf1984956517c35c2bd35b6cdedac12a21d6fcd3596c614ecdfb88b648909d` | Fontsource 5.3.0 | OFL | Body and controls, weight 500 | Yes | Include with OFL notice |
| `assets/fonts/dm-sans-latin-600.woff2` | `6bb2b2645ba5eeaecf56322c543fa3a75b87b927977b9c03b1dabc4205089120` | Fontsource 5.3.0 | OFL | Body and controls, weight 600 | Yes | Include with OFL notice |
| `assets/design/logo-minimal.png` | `91fe06e8fe83b9e989663585cb5a334faeac69fa12874605b9b422b323b53c57` | Owner-attested ChatGPT | G | Favicon, UI branding, frame-choice thumbnails and both photostrip footers | Yes | Include |
| `assets/design/brand-sparkle.svg` | `d53de888bb192dffd98223fddf7101d551be2e2261ef31718383095e35ece2ac` | Phosphor React 2.1.10 | MIT | Header sparkle | Yes | Include with MIT notice |
| `assets/design/camera.svg` | `1c9bfa739dde0c9256f6df913a4efed1b7de3ed62e58ca1ef27948f2ad90a409` | Phosphor React 2.1.10 | MIT | Camera CSS mask | Yes | Include with MIT notice |
| `assets/design/sprite-unicorn-1.png` | `f737ecc9a695adc2eec74881a4fa5b9f435bafe04f5ba51bd25cb68d47b994c1` | Owner-attested ChatGPT | G | First decorative Home sample | Yes | Include |
| `assets/design/sprite-unicorn-2.png` | `75a8412420cf7f07c3145af2352da943a52a2e32e64dc66407f2894f9624afc9` | Owner-attested ChatGPT | G | Second decorative Home sample | Yes | Include |
| `assets/design/sprite-unicorn-3.png` | `3bdb03734cbe6da0a58fee330c2a8ce54a84b9d0f9900e0770f1de69f7c371ff` | Owner-attested ChatGPT | G | Third decorative Home sample | Yes | Include |
| `assets/design/sprite-unicorn-4.png` | `1876bd2daa5e1ee4a422fb718bb46f7714319cfb05eaa3bcd97f314ceda62d9f` | Owner-attested ChatGPT | G | Fourth decorative Home sample | Yes | Include |
| `assets/design/magic-home-backdrop.png` | `7e9ebeb3fb9a6a1fbd5a364a6de19797be77575e0dfe5ed57a8c46ea4b4b773b` | Owner-attested ChatGPT | G | Home UI background | Yes | Include |
| `assets/design/magic-editor-backdrop.png` | `293f5bf5a5773556aa3921981abe0313c77861d26e9bf2f7bf51ba85709c497d` | Owner-attested ChatGPT | G | Editor UI background | Yes | Include |
| `assets/design/magic-gallery-empty.png` | `2d24bac8a87d403e8b59f4b5029ea9bea19923d7961a99d921a80e78cac89010` | Owner-attested ChatGPT | G | Empty Gallery UI illustration | Yes | Include |
| `assets/stickers/sticker-pixel-star.png` | `1392c87692e6feded1cec384ab5465b4c286dcfd9e889e9d1a255fbd63ca7b87` | Owner-attested ChatGPT | G | Star tray, editor and composed PNG | Yes | Include |
| `assets/stickers/sticker-pixel-rainbow.png` | `a71c3af2824db8575156075c6ed58170c9956e64a58614b662cb2926be43f1d8` | Owner-attested ChatGPT | G | Rainbow tray, editor and composed PNG | Yes | Include |
| `assets/stickers/sticker-pixel-unicorn.png` | `203fe04818f29c09030c503ce8cf175f451e37245661e1244778012eab838902` | Owner-attested ChatGPT | G | Unicorn tray, editor and composed PNG | Yes | Include |
| `assets/stickers/sticker-pixel-heart.png` | `fcab2d5e5a4cdac25ad8ecece7f343da469e36c66631646373d5ce6b09aaec7d` | Owner-attested ChatGPT | G | Heart tray, editor and composed PNG | Yes | Include |
| `assets/logos/logo_transparent.png` | `3269ed4cab6167919a04a588f5c7f76ac634a599d9876fefde7b5a19898db887` | Owner-attested ChatGPT watermark | W | Historical | No | Retain locally |
| `assets/frames/purple.png` | `d16f06fac83b087205d35eed3c1e8b79f88ab4e530b6b578b08db14df5ef0a9f` | Independent AI-assisted vector artwork | C | Purple paper and border | Yes | Include |
| `assets/imgs/placeholder-white.png` | `130c63e29191d3a09961b3544b29e7f02fd56e17559b6878bc827c6449bbf2f0` | Independent procedural PNG | P | Capture pending-slot fallback | Yes | Include |
| `assets/licenses/fraunces-OFL.txt` | `cd3384cafac6f2bddc3955273958a2e029f97027c8037ac539ef5744a77b579e` | Upstream license notice | OFL | Redistribution notice | Yes | Include intact |
| `assets/licenses/dm-sans-OFL.txt` | `6fbd040a29c2037a765dfb9f2561e9965b5c95c6dcb5dce516089d63d5f17af7` | Upstream license notice | OFL | Redistribution notice | Yes | Include intact |
| `assets/licenses/phosphor-MIT.txt` | `6918b72504641180600cbbd4a86b0dfa9dfccf788775694325b71b9a029f6eb4` | Upstream license notice | MIT | Redistribution notice | Yes | Include intact |

- **G** Owner declaration and prior handoff byte/prompt audit. OpenAI output terms support use subject to the applicable agreement and input rights.
- **W** Owner declaration and Git custody. Archived December 2024 individual terms are a plausible fit given the May 2025 custody date. Confirm the best supported creation period, account category and region, any known references and the terms that applied. The historical agreement and exact inputs remain unverified.
- **C** The active Pastel Purple PNG is the approved footer proposal's paper layer, rasterized locally from the editable SVG. The compositor draws the logo and sparkle accents. The editable source and review images are excluded from the site package. [Asset record](../assets/ASSETS.md#final-footer-branding) · [Integration verification](pro-86-packaging.md#final-footer-stage-1-handoff)
- **P** Local generator constructs opaque white pixels from constants. The approved independent replacement resolves the provenance issue. Include it under the owner’s publication scope.
- **OFL / MIT** The prior audit matched the Fontsource binaries and complete SIL OFL notices and verified the Phosphor paths and matching MIT source notice. Preserve the notices and license conditions. [Asset ledger](../assets/ASSETS.md)

## Historical repository exposure

| Tracked source path excluded from package | Local Git evidence |
| --- | --- |
| `assets/fonts/VintageCharm-Regular.otf` | `cfb1d1d` and cached origin tree. No recorded raw-font redistribution grant. |
| `assets/logos/logo_filled.png` | `cfb1d1d` and cached origin tree. Rights unresolved. |
| `assets/logos/snapicorn.png` | `cfb1d1d` and cached origin tree. Rights unresolved. |
| `assets/imgs/placeholder-black.png` | `66d68b9` and cached origin tree. Legacy provenance undocumented. |
| `assets/frames/historical/purple-legacy.png` | Preserved in `af138ee`. The legacy artwork exists as `assets/frames/purple.png` in `f913b98` and the cached origin tree. Decorative component rights remain unresolved. |

The tracked proposal PNGs and SVGs for Lavender Wishes and Cream Moonwalk are also outside the package. The original white placeholder is in `66d68b9` and the cached origin tree. Its preserved local proposal copy is outside the package. The original watermark remains in the package and in the cached origin tree. The 12 generated PNGs are in local commits `70b44b6` and `b399321`.

The recorded origin is GitHub’s `snapicorn/snapicorn.github.io`. Local `origin/main` and `origin/vanilla` both point to `66d68b9`. Local `main` at `d25a83c` is five commits ahead of cached `origin/main`. The anonymous GitHub page check returned no repository contents. Current repository visibility, live branches, Pages settings and deployed bytes, forks, mirrors, archives and past downloads remain unverified. No remote fetch or private data access was used.

Keep tracked files and history intact while the owner reviews exposure. For an eventual separately authorized site release, serve the verified allowlisted directory and check legacy direct URLs for stale hosted copies. Before authorizing a public repository or archive, verify its visibility and included history separately, then decide whether any confirmed exposure requires a separately scoped response.

## Intended use and remaining release checks

The owner intends to use the documented artwork in Snapicorn, including raw asset delivery on the public website and use of the stickers, watermark and frame in generated photostrips. Pastel Purple and the independent white placeholder are approved for integration. Generation records are retained where available, and the original watermark's evidence gaps are documented above.

The active inventory has no identified missing third-party grant. Preserve the OFL and MIT notices and comply with the applicable OpenAI terms. Rights for the excluded legacy assets remain unresolved if those files are distributed separately through repository history, archives or hosting. Output rights do not guarantee exclusivity or trademark rights. Technical release acceptance remains with PRO-64 and PRO-78.
