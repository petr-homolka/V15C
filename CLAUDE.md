# V15C

## Design system — read this before writing any UI

This project's design system is **Geist** (Vercel's), vendored under
`design-system/`. Full reference: `design-system/README.md`.

**Never hard-code a colour, shadow or radius.** Use the tokens:

- Colour: `var(--ds-gray-1000)`, `var(--ds-background-100)`, `var(--ds-blue-700)`, …
  Every hue runs `100`→`1000`; the step is a *role*, not a lightness, so it means
  the same thing in light and dark mode. Hues: `gray`, `gray-alpha`, `blue`, `red`,
  `amber`, `green`, `teal`, `purple`, `pink`.
  - Body text → `--ds-gray-1000`. Muted text → `--ds-gray-900`.
  - Page background → `--ds-background-100`. Recessed → `--ds-background-200`.
  - Borders → `--ds-gray-alpha-400` (translucent, so it works over any surface).
- Elevation: `var(--ds-shadow-border-small)` and friends — never a raw `box-shadow`.
  In Tailwind, prefer the `material-*` utilities, which pair the shadow with the
  matching radius.
- Focus: `var(--ds-focus-ring)`.
- Type: Geist Sans via `var(--font-geist-sans)`, Geist Mono via `var(--font-geist-mono)`.
  In Tailwind, use the `text-heading-*` / `text-copy-* `/ `text-label-*` /
  `text-button-*` utilities rather than ad-hoc sizes.
  `copy` is for wrapping prose; `label` is for single-line text inside a control.

Dark mode is class-based: `.dark` on `<html>`. Do not add `prefers-color-scheme`
queries of your own — `design-system/tokens/dark-auto.css` already covers that
case and is opt-in.

### Which stylesheet to import

- Plain CSS, any framework → `design-system/geist.css` (fonts + tokens + base).
- Tailwind v4 → `design-system/tokens/theme.css` (adds the `@theme` mapping and
  the Geist utilities), plus `design-system/fonts/fonts.css`.

### Do not edit these by hand

- `design-system/tokens/theme.css` is upstream's file, verbatim. Keeping it
  unmodified is what makes future upstream syncs a clean diff. App-specific
  overrides go in your own stylesheet, layered after it.
- `tokens/ds-tokens.css`, `tokens/dark-auto.css`, `tokens/tokens.json` and
  `preview.html` are generated. Regenerate with:

  ```bash
  node design-system/scripts/extract-tokens.mjs
  node design-system/scripts/build-preview.mjs
  ```

Upstream versions currently vendored: `@vercel/geistdocs@1.19.5` (tokens,
Apache-2.0) and `geist@1.7.2` (fonts, SIL OFL 1.1). The sync procedure is at the
bottom of `design-system/README.md`.
