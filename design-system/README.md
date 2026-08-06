# Geist Design System

Vercel's design system, vendored into this repo: the literal `--ds-*` tokens that
paint vercel.com, plus the Geist Sans / Geist Mono / Geist Pixel typefaces.

Nothing here is a reconstruction or an eyeballed approximation — the token values
are copied verbatim out of the published npm packages, and the font binaries are
the ones Vercel ships.

## Provenance

| What | Source | Version | Licence |
|---|---|---|---|
| `--ds-*` tokens, Tailwind theme, utilities | [`@vercel/geistdocs`](https://www.npmjs.com/package/@vercel/geistdocs) → `theme.css` | 1.19.5 | Apache-2.0 |
| Geist Sans, Geist Mono, Geist Pixel (`.woff2`) | [`geist`](https://www.npmjs.com/package/geist) → `dist/fonts/` | 1.7.2 | SIL OFL 1.1 |

See [`NOTICE.md`](./NOTICE.md) for the full attribution, and
[`fonts/LICENSE.txt`](./fonts/LICENSE.txt) for the OFL text.

## Layout

```
design-system/
├── geist.css                  ← plain-CSS entrypoint (fonts + tokens + base)
├── tokens/
│   ├── theme.css              ← verbatim @vercel/geistdocs theme.css (Tailwind v4)
│   ├── ds-tokens.css          ← generated: just the :root / .dark --ds-* literals
│   ├── dark-auto.css          ← generated: optional prefers-color-scheme mapping
│   └── tokens.json            ← generated: machine-readable, 115 tokens
├── fonts/
│   ├── fonts.css              ← @font-face + --font-geist-* family vars
│   ├── geist-sans/            ← Geist-Variable, Geist-Italic-Variable (wght 100–900)
│   ├── geist-mono/            ← GeistMono-Variable, GeistMono-Italic-Variable
│   ├── geist-pixel/           ← Square, Grid, Circle, Triangle, Line
│   └── LICENSE.txt            ← SIL OFL 1.1
├── pwa/                       ← installed-app layer: safe areas, theme-color,
│   │                            no-flash, service worker, manifest, icons
│   └── README.md              ← see this if you are shipping a PWA
├── scripts/
│   ├── extract-tokens.mjs     ← regenerates the generated files under tokens/
│   ├── build-preview.mjs      ← regenerates preview.html
│   ├── build-pwa.mjs          ← regenerates the generated files under pwa/
│   └── rasterize-icons.mjs    ← re-renders the icon PNGs (needs playwright)
└── preview.html               ← open in a browser: every token and type style rendered
```

Only the **variable** font files are vendored. They span the full 100–900 range,
so every static weight the `geist` package ships is reachable — at ~70 KB per
family instead of ~2 MB.

## Usage

### Plain CSS / any framework

```css
@import "./design-system/geist.css";
```

That is the whole setup. You now have every `--ds-*` token, both font families,
and the base `<html>` / `<body>` defaults from vercel.com.

```css
.card {
  background: var(--ds-background-100);
  color: var(--ds-gray-1000);
  box-shadow: var(--ds-shadow-border-small);
  border-radius: 6px;
}
```

Dark mode is class-based, the same way Vercel does it — put `.dark` on `<html>`:

```html
<html class="dark">
```

To *also* follow the OS preference when no class is set, import the opt-in file
after the entrypoint:

```css
@import "./design-system/geist.css";
@import "./design-system/tokens/dark-auto.css";
```

An explicit `.light` or `.dark` class still wins over the OS preference.

### Tailwind v4

Use `tokens/theme.css` instead of `geist.css`. It carries the `@theme inline`
block that maps every `--ds-*` token onto a Tailwind colour, plus the Geist
typography and material utilities.

```css
@import "tailwindcss";
@import "./design-system/fonts/fonts.css";
@import "./design-system/tokens/theme.css";

@layer base {
  :root {
    --font-sans: var(--font-geist-sans);
    --font-mono: var(--font-geist-mono);
  }
}
```

```html
<div class="bg-background-100 text-gray-1000 material-small text-copy-14">…</div>
```

⚠️ `tokens/theme.css` is upstream's file, unmodified. That means it also carries
things a generic app does not want:

- `@source` directives pointing at `node_modules/streamdown` and `./dist`
- fumadocs theming (`--color-fd-*`, `#nd-sidebar`, `#nd-page`, `#nd-toc`, …)
- Shiki syntax-highlighting variables

They are inert without those dependencies — the `@source` globs simply do not
resolve and Tailwind ignores them, and the `#nd-*` rules never match. Left in
place on purpose so the file stays diffable against future upstream releases. If
you want only the values, use `tokens/ds-tokens.css`.

### JavaScript / tooling

```js
import tokens from "./design-system/tokens/tokens.json" with { type: "json" };

tokens.tokens["--ds-blue-700"];
// { group: "color", light: "oklch(57.61% 0.2508 258.23)",
//   dark: "oklch(57.61% 0.2321 258.23)", darkOverridden: true }
```

`dark` falls back to the light value when the `.dark` block does not override the
token; `darkOverridden` records which of the two it is.

---

## The tokens

### Colour scales

Every hue runs **100 → 1000**. The number is a fixed role, not a lightness — in
dark mode the same step means the same *thing*, which is why `gray-1000` is near
black in light mode and near white in dark mode. Values are `oklch()` throughout.

| Step | Role |
|---|---|
| 100–200 | Subtle backgrounds |
| 300–400 | Borders, separators |
| 500–600 | Stronger borders, disabled/placeholder |
| 700–800 | Solid fills, secondary text |
| 900 | High-contrast accents, primary text on subtle bg |
| 1000 | Maximum contrast — body text |

Hues: `gray`, `gray-alpha`, `blue`, `red`, `amber`, `green`, `teal`, `purple`,
`pink`. Plus `--ds-background-100` / `--ds-background-200`, `--ds-black`,
`--ds-white`.

`gray-alpha-*` is the translucent gray ramp — use it for borders and overlays
that must sit on top of arbitrary backgrounds. `--ds-gray-alpha-400` is the
default border colour across the system.

The anchors, light → dark:

| Token | Light | Dark |
|---|---|---|
| `--ds-background-100` | `oklch(1 0 0)` (white) | `oklch(0 0 0)` (black) |
| `--ds-background-200` | `oklch(0.984 0 0)` | `oklch(0.027 0 0)` |
| `--ds-gray-1000` | `oklch(0.205 0 0)` | `oklch(0.946 0 0)` |
| `--ds-gray-alpha-400` | `oklch(0 0 0 / 0.08)` | `oklch(1 0 0 / 0.14)` |
| `--ds-blue-700` | `oklch(57.61% 0.2508 258.23)` | `oklch(57.61% 0.2321 258.23)` |

Semantic use of the hues: **blue** = informational / focus, **red** = destructive
and error, **amber** = warning, **green** = success, **teal** / **purple** /
**pink** = accents and syntax highlighting.

### Shadows

Shadows are composed, not primitive: `--ds-shadow-border-base` (the hairline) is
combined with a blur layer and `--ds-shadow-background-border`. Reach for a
`material-*` utility rather than a raw shadow where you can.

| Token | Use |
|---|---|
| `--ds-shadow-border` | Hairline outline only |
| `--ds-shadow-border-inset` | Same, drawn inside the box |
| `--ds-shadow-2xs` … `--ds-shadow-2xl` | Elevation ramp, no border |
| `--ds-shadow-border-small` / `-medium` / `-large` | Elevation **with** the hairline |
| `--ds-shadow-tooltip`, `-menu`, `-modal`, `-fullscreen` | Purpose-built for those surfaces |
| `--ds-focus-ring` | 2px background gap + 2px blue ring |

Dark mode does not just tint the shadows — it raises their opacity (`0.04` → `0.16`)
and switches the hairline from `rgba(0,0,0,.08)` to `rgba(255,255,255,.145)`.

### Radii and breakpoints

Defined in `theme.css` as Tailwind theme values:

`--radius-xs` 2px · `sm` 4px · `md` 6px · `lg` 8px · `xl` 12px · `2xl` 16px.
Plus `--radius: 0.625rem` (10px) on `:root` for shadcn-style components.

Breakpoints are Geist's own scale, not Tailwind's defaults:
`sm` 401px · `md` 601px · `lg` 961px · `xl` 1200px · `2xl` 1400px.

---

## Typography

Four families of type utilities, all defined in `tokens/theme.css` (Tailwind
only). The number in the name is the pixel font-size.

**Heading** — `text-heading-72 / 64 / 56 / 48 / 40 / 32 / 24 / 20 / 16 / 14`.
Weight `450`, aggressively negative tracking that tightens as size grows
(`-4.32px` at 72, `-0.28px` at 14). A `<strong>` inside a heading 16–32 shifts to
`font-medium` and `gray-900`.

**Copy** — body prose. `text-copy-24 / 20 / 18 / 16 / 14 / 13`, plus
`-14-mono` and `-13-mono`. Generous leading (16px text → 24px line height).

**Label** — UI text in a fixed-height context. `text-label-20 / 18 / 16 / 14 / 13 / 12`,
plus `-16-mono`, `-14-mono`, `-13-mono`, `-12-mono`. Tighter leading than copy.

**Button** — `text-button-16 / 14 / 12`. `font-medium`.

Copy vs. label is the distinction worth internalising: **copy** is for text that
wraps into paragraphs, **label** is for single-line text inside a control.

`.prose` headings map to the heading scale automatically:
`h1 → 32`, `h2 → 24`, `h3 → 20`, `h4 → 16`, `h5/h6 → 14`.

### Font stack

| Variable | Family |
|---|---|
| `--font-geist-sans` | Geist Sans → system sans fallbacks |
| `--font-geist-mono` | Geist Mono → `ui-monospace`, SFMono-Regular, … |
| `--font-geist-pixel-{square,grid,circle,triangle,line}` | Geist Pixel display faces → Geist Mono |

Both text families are variable, `font-weight: 100 900`, with matching italics.

`<html>` sets `font-feature-settings: "rlig" 1, "calt" 0, "ss11" 1`. That is
verbatim from upstream: ligatures on, **contextual alternates deliberately off**,
and stylistic set 11 enabled. Keep it — it is a large part of why Geist looks
like Geist on vercel.com.

---

## Materials

`material-*` utilities (Tailwind only) bundle a surface, a radius and the right
shadow, so elevation and corner rounding stay in step:

| Utility | Shadow | Radius |
|---|---|---|
| `material-base` | border | 6px |
| `material-small` | border-small | 6px |
| `material-medium` | border-medium | 12px |
| `material-large` | border-large | 12px |
| `material-tooltip` | tooltip | 6px |
| `material-menu` | menu | 12px |
| `material-modal` | modal | 12px |
| `material-fullscreen` | fullscreen | 16px |

All of them set `background: var(--ds-background-100)`.

---

---

## Installed apps (PWA)

If this is going to be installed to a home screen, see
[`pwa/README.md`](./pwa/README.md). Three things already work in your favour —
no external requests (so the whole visual layer is precacheable), a ~285 KB type
budget, and `100dvh` rather than `100vh`.

Four do not, and the `pwa/` layer covers them: the OS status-bar colour cannot
read `var()` and desynchronises from class-based dark mode; the safe-area insets
in `theme.css` are locked to fumadocs selectors; the theme class is applied too
late to avoid a flash on cold start; and `font-display: swap` shows fallback
text on first paint.

## Preview

Open [`preview.html`](./preview.html) directly in a browser — no server, no build.
It renders every colour ramp, shadow, radius and type style in both themes, and
doubles as a visual regression check after an upstream sync.

## Updating from upstream

```bash
npm pack @vercel/geistdocs@<version>   # → theme.css
npm pack geist@<version>               # → dist/fonts/**

node design-system/scripts/extract-tokens.mjs
node design-system/scripts/build-preview.mjs
node design-system/scripts/build-pwa.mjs
```

1. Replace `tokens/theme.css` with the new `theme.css`, unmodified.
2. Re-run the three scripts above. `extract-tokens.mjs` throws if the `:root` /
   `.dark` blocks it depends on have moved or stopped carrying `--ds-*`
   declarations, so a breaking upstream restructure fails loudly rather than
   silently emitting an empty token set.
3. Refresh the font `.woff2` files only if the `geist` version changed. Note the
   rename: upstream's `Geist-Italic[wght].woff2` is vendored as
   `Geist-Italic-Variable.woff2` — square brackets in a filename are awkward in
   CSS `url()` and on some toolchains.
4. Open `preview.html` and eyeball both themes.
5. **If you ship the PWA layer:** check whether `pwa/colors.json` changed, and
   bump `VERSION` in `pwa/sw.js` if any precached asset did. The font filenames
   carry no content hash, so new bytes arrive behind an unchanged URL — without
   a bump, installed clients keep serving the old faces indefinitely.
6. Bump the versions in this README, `NOTICE.md`, and the header of
   `scripts/extract-tokens.mjs`.
