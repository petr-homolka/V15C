/* Theme control for an installed app: owns the .dark class and keeps the OS
 * chrome (status bar, titlebar) matching it.
 *
 * The problem this solves. `<meta name="theme-color" media="...">` keys off the
 * OS preference, but the design system's dark mode keys off a class. The moment
 * someone picks a theme that contradicts their OS setting, the two disagree and
 * the status bar is the wrong colour — very visible in standalone mode, where
 * the status bar sits flush against the page.
 *
 * So once this module loads it takes sole ownership: it removes the
 * media-scoped tags from head.html (they were only the pre-JS fallback) and
 * maintains one unconditional tag reflecting the theme actually in effect.
 * Per the HTML spec the browser honours the first tag whose media matches, so
 * leaving them in place would let a stale tag win over ours.
 *
 * Colour values are never duplicated here — they are read back out of the live
 * --ds-background-100 token, so an upstream sync moves the status bar with it.
 */

const STORAGE_KEY = "theme";
const COLOR_TOKEN = "--ds-background-100";

/** @typedef {"light" | "dark" | "system"} ThemePreference */

const media = window.matchMedia("(prefers-color-scheme: dark)");

/** @returns {ThemePreference} */
export function getPreference() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    /* private mode */
  }
  return "system";
}

/** The theme actually in effect, after resolving "system". */
export function getResolvedTheme() {
  const pref = getPreference();
  if (pref === "system") return media.matches ? "dark" : "light";
  return pref;
}

/* A <meta> cannot hold var(), and the tokens are oklch() — which is not safe to
 * put in theme-color, since the OS chrome parser is not the CSS engine.
 *
 * So the colour has to be resolved to sRGB. Note that reading it back as a
 * *string* does not work: both `ctx.fillStyle` and `getComputedStyle().color`
 * hand back "oklch(0.961 0 0)" verbatim in current browsers rather than
 * normalising to hex. Painting one pixel and reading the bytes is the only
 * approach that actually forces the conversion — and it costs a 1×1 canvas. */
let ctx;
function toHex(cssColor) {
  if (!cssColor) return null;
  try {
    if (!ctx) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      ctx = canvas.getContext("2d", { willReadFrequently: true });
    }
    if (!ctx) return null;

    // fillStyle silently ignores values it cannot parse, so clear to a known
    // sentinel first — otherwise an unparseable token yields the previous fill.
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000000";
    ctx.fillStyle = cssColor;
    ctx.fillRect(0, 0, 1, 1);

    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    if (a === 0) return null;
    return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  } catch {
    // Tainted canvas or a headless context without 2D support.
    return null;
  }
}

function syncMetaThemeColor() {
  const resolved = getComputedStyle(document.documentElement)
    .getPropertyValue(COLOR_TOKEN)
    .trim();
  const hex = toHex(resolved);
  if (!hex) return;

  // Drop the pre-JS fallback tags; from here this module is the only writer.
  for (const el of document.querySelectorAll('meta[name="theme-color"][media]')) {
    el.remove();
  }

  let meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", hex);
}

function applyResolved(theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme !== "dark");
  syncMetaThemeColor();
  root.dispatchEvent(
    new CustomEvent("themechange", { detail: { theme }, bubbles: true }),
  );
}

/** @param {ThemePreference} pref */
export function setTheme(pref) {
  try {
    if (pref === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, pref);
  } catch {
    /* private mode: the class still applies, it just will not persist */
  }
  applyResolved(pref === "system" ? (media.matches ? "dark" : "light") : pref);
}

/** Flip between light and dark, pinning the result (never leaves it on system). */
export function toggleTheme() {
  setTheme(getResolvedTheme() === "dark" ? "light" : "dark");
}

// Follow the OS only while the preference is "system".
media.addEventListener("change", () => {
  if (getPreference() === "system") applyResolved(media.matches ? "dark" : "light");
});

// no-flash.js already set the class; this aligns the meta tag with it.
applyResolved(getResolvedTheme());
