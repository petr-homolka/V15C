/* Applies the theme class before first paint.
 *
 * This file exists to be INLINED into <head> — scripts/build-pwa.mjs embeds it
 * into pwa/head.html for exactly that reason. Loading it as an external script
 * defeats the point: the fetch resolves after the first frame is already on
 * screen, so a home-screen launch flashes light before flipping to dark.
 *
 * Sets an explicit .light or .dark class, never neither. That means
 * tokens/dark-auto.css is redundant once this runs — the class is always
 * authoritative — so a PWA should not import it.
 *
 * Storage contract, shared with theme.js: localStorage["theme"] is
 * "light" | "dark" | "system", or absent (treated as "system").
 */
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark =
      stored === "dark" ||
      ((stored === null || stored === "system") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    var root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.classList.toggle("light", !dark);
  } catch (e) {
    /* Private mode can throw on localStorage. Light is the safe default. */
  }
})();
