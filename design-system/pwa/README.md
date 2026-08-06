# PWA layer

What an installed, standalone app needs on top of the Geist design system.
Everything here is additive — in a normal browser tab it stays inert.

The design system already gets three PWA fundamentals right by accident of how
it is vendored:

- **No external requests.** `geist.css` imports only siblings and the fonts are
  local `.woff2`, so the whole visual layer is precacheable and works offline.
  A CDN font would have made that impossible.
- **~285 KB of type**, total, for both families with italics — a budget you can
  precache without thinking about it.
- **`100dvh`, not `100vh`**, so layout is correct under retracting mobile
  browser chrome and in standalone mode.

This directory covers what it does *not* get right on its own.

## Files

| File | What it is |
|---|---|
| `head.html` | **Generated.** Copy-paste `<head>` block, in the right order |
| `pwa.css` | Safe-area utilities, standalone-mode rules, app-like affordances |
| `no-flash.js` | Sets the theme class before first paint — **must be inlined** |
| `theme.js` | Owns the theme, keeps the OS chrome colour in sync |
| `sw.js` | Service worker precaching the design layer |
| `manifest.webmanifest` | **Generated.** Colours come from the tokens |
| `colors.json` | **Generated.** The `--ds-*` tokens the shell needs as literal hex |
| `icons/` | **Placeholders.** SVG sources plus rasterized PNGs |

Regenerate the generated ones with:

```bash
node design-system/scripts/build-pwa.mjs
```

## Wiring it up

1. Paste `head.html` into your `<head>`. The order in it is deliberate; see the
   comments inside.
2. Serve the design system from `/design-system/`, or edit the paths.
3. Copy `sw.js` to your **site root** and register it from the app:

   ```js
   if ("serviceWorker" in navigator) {
     addEventListener("load", () =>
       navigator.serviceWorker.register("/sw.js", { scope: "/" }));
   }
   ```

   A service worker can only control pages at or below its own URL, so serving
   it from `/design-system/pwa/sw.js` would scope it to that directory alone.
4. Replace the icons.
5. Fill in the real `name`, `short_name`, `description` and `start_url` — edit
   them in `scripts/build-pwa.mjs`, not in the generated manifest.

## The four problems this solves

### 1. Status bar colour vs. class-based dark mode

`<meta name="theme-color" media="(prefers-color-scheme: dark)">` keys off the
**OS** preference. The design system's dark mode keys off a **class**. The
moment someone picks a theme that contradicts their OS setting the two
disagree, and the status bar is visibly the wrong colour — much more obvious in
standalone mode, where it sits flush against the page.

`theme.js` resolves this by taking sole ownership once it loads: it removes the
media-scoped tags (they were only the pre-JS fallback) and maintains a single
unconditional tag. That removal is necessary, not tidiness — the browser honours
the *first* tag whose media matches, so a stale one would win.

The hex is never hard-coded there. It is read back out of the live
`--ds-background-100`, so a token sync moves the status bar with it.

> One wrinkle worth knowing: the tokens are `oklch()`, and resolving that to
> sRGB in the browser is not as simple as it looks. Both `ctx.fillStyle` and
> `getComputedStyle().color` hand back `"oklch(0.961 0 0)"` verbatim rather than
> normalising to hex. Painting one pixel to a 1×1 canvas and reading the bytes
> is the only approach that actually forces the conversion — that is what
> `theme.js` does.

### 2. Safe areas

`tokens/theme.css` does use `env(safe-area-inset-*)` — but only inside fumadocs'
own selectors (`[data-geistdocs-mobile-sidebar]`, `[data-mobile-docs-bar]`), so
an app that is not a docs site gets nothing from it.

`pwa.css` provides the general equivalents: `--pwa-safe-*` custom properties and
`.pwa-safe-*`, `.pwa-topbar`, `.pwa-bottombar` utilities. They are namespaced
`--pwa-*` on purpose — `--ds-*` belongs to upstream, and a future sync must not
be able to collide with names invented here.

**All of it is inert without `viewport-fit=cover`** in the viewport meta. That
is in `head.html`; without it every inset resolves to 0 and content clips under
the notch.

### 3. Theme flash on cold start

Class-based dark mode means the first paint is light until JS runs. Launched
from the home screen that is very visible.

`no-flash.js` fixes it, but **only if inlined** — `build-pwa.mjs` embeds it into
`head.html` for that reason. An external `<script src>` resolves after the first
frame is already on screen, even when render-blocking.

It always sets an explicit `.light` or `.dark`, never neither. That makes
`tokens/dark-auto.css` redundant, so a PWA should not import it — the class is
authoritative.

### 4. Font flash

`font-display: swap` means fallback text on first paint. `head.html` preloads
the two variable faces ahead of the stylesheet so the fetch starts immediately
instead of waiting for `geist.css` to parse. `crossorigin` is required on font
preloads even same-origin, because font fetches are always CORS-mode.

## Theme API

```js
import { setTheme, toggleTheme, getPreference, getResolvedTheme }
  from "/design-system/pwa/theme.js";

setTheme("dark");      // "light" | "dark" | "system"
toggleTheme();         // flips and pins the result
getPreference();       // what the user chose
getResolvedTheme();    // what is actually showing
```

Preference persists in `localStorage["theme"]`, the contract `no-flash.js`
reads. The `<html>` element emits a `themechange` event on every change.

## Service worker

`sw.js` precaches the *design layer* — the two variable fonts and the
stylesheets — and nothing else. Those are the assets that make an app look
broken offline, and the ones this directory owns. Your routes and data are
yours; there is an `APP_PRECACHE` hook for them.

Strategies: fonts cache-first (immutable within a version), design-layer CSS/JS
stale-while-revalidate, everything else untouched. Italic and pixel faces are
deliberately not precached — a large share of the byte budget that most apps
never render — but they are still cached on first use.

**Bump `VERSION` whenever a precached asset changes.** This matters more than it
looks: the font filenames are stable across upstream releases
(`Geist-Variable.woff2` carries no content hash), so syncing a new `geist`
version changes the bytes behind an unchanged URL. Without a bump, installed
clients keep serving the old faces indefinitely.

The worker does not call `skipWaiting()` on install — an open client is running
the previous version's code, and swapping the cache under it can serve a
mismatched pair of assets. Post it `"skip-waiting"` when the app is ready:

```js
navigator.serviceWorker.controller?.postMessage("skip-waiting");
```

## Icons

**Placeholders.** `icon.svg` (full-bleed, `purpose="any"`) and
`icon-maskable.svg` (`purpose="maskable"`, artwork kept inside the guaranteed
centre circle of 80% diameter, background bleeding to all four edges). Colours
are the resolved literals from `colors.json`.

The PNGs are committed. Only if you change the SVGs do you need to re-rasterize:

```bash
npm i --no-save playwright-core
node design-system/scripts/rasterize-icons.mjs
```

That script is the one thing here with a dependency — it drives headless
Chromium so the icons render in real Geist Sans. Any rasterizer that embeds the
font works just as well.

## Not included

- **Offline route.** `sw.js` deliberately does not intercept navigations. Doing
  that without a real offline page turns a network error into a blank page —
  add the strategy once you have somewhere to fall back to.
- **Push, background sync, share target, shortcuts.** All app-shaped decisions,
  none of them design-system concerns.
- **Real icons.** Needs a brand.
