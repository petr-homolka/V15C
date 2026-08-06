# Third-party notices

This directory vendors material from two Vercel packages. Neither is authored
here; both are redistributed under their original licences, reproduced or linked
below.

---

## Geist design tokens

**Source:** [`@vercel/geistdocs`](https://www.npmjs.com/package/@vercel/geistdocs) v1.19.5,
file `theme.css`
**Upstream:** https://github.com/vercel/geistdocs
**Licence:** Apache License 2.0
**Copyright:** © Vercel, Inc.

Vendored as:

- `tokens/theme.css` — verbatim, unmodified
- `tokens/ds-tokens.css`, `tokens/dark-auto.css`, `tokens/tokens.json` —
  mechanically derived from the above by `scripts/extract-tokens.mjs`; the token
  values are unchanged

Full licence text: https://www.apache.org/licenses/LICENSE-2.0

---

## Geist Sans, Geist Mono and Geist Pixel

**Source:** [`geist`](https://www.npmjs.com/package/geist) v1.7.2, `dist/fonts/`
**Upstream:** https://github.com/vercel/geist-font · https://vercel.com/font
**Licence:** SIL Open Font License, Version 1.1
**Copyright:** © 2023 Vercel, in collaboration with basement.studio

Vendored as the variable `.woff2` faces under `fonts/geist-sans/`,
`fonts/geist-mono/` and `fonts/geist-pixel/`. The binaries are unmodified; two
files were renamed only to drop square brackets from the filename
(`Geist-Italic[wght].woff2` → `Geist-Italic-Variable.woff2`, and the Mono
equivalent).

Full licence text: [`fonts/LICENSE.txt`](./fonts/LICENSE.txt)

The OFL permits bundling, embedding and redistribution — including commercially
— provided the fonts are not sold on their own, the copyright notice and licence
travel with them, and any *modified* derivative does not use the reserved font
names. Nothing here modifies the fonts.

---

## Trademarks

"Vercel" and "Geist" are trademarks of Vercel, Inc. Vendoring these tokens and
fonts is not an endorsement by, or an affiliation with, Vercel.
