# V15C

## Design system

This repo uses **Geist** — Vercel's design system — vendored in
[`design-system/`](./design-system).

It is not an approximation. The `--ds-*` tokens are copied verbatim from
`@vercel/geistdocs` (the same values that paint vercel.com), and the typefaces
are the `.woff2` binaries Vercel ships in the `geist` package.

```css
@import "./design-system/geist.css";
```

Then build with the tokens:

```css
.card {
  background: var(--ds-background-100);
  color: var(--ds-gray-1000);
  box-shadow: var(--ds-shadow-border-small);
  border-radius: 6px;
}
```

Dark mode is a `.dark` class on `<html>`.

- **[`design-system/README.md`](./design-system/README.md)** — the full reference:
  colour scales and what each step means, shadows, radii, breakpoints, the four
  typography families, materials, and how to sync with upstream.
- **[`design-system/preview.html`](./design-system/preview.html)** — open it in a
  browser (no server needed) to see every token rendered in both themes.
- **[`design-system/pwa/README.md`](./design-system/pwa/README.md)** — the
  installed-app layer: safe areas, status-bar colour that tracks the theme, no
  flash on cold start, and a service worker that precaches the visual layer.
- **[`design-system/NOTICE.md`](./design-system/NOTICE.md)** — licences.
  Tokens are Apache-2.0, fonts are SIL OFL 1.1.

Anything visual in this repo should be built from these tokens rather than
hard-coded values.
