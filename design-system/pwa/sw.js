/* Service worker for the design layer.
 *
 * Scope note: this precaches the *design system* — fonts and stylesheets — and
 * nothing else. Those are the assets that make an app look broken when they are
 * missing offline, and they are the assets this directory owns. Your app's own
 * JS, routes and data are yours to add; see the APP_PRECACHE hook below.
 *
 * Register it from the app, not from head.html, so the app decides when:
 *
 *   if ("serviceWorker" in navigator) {
 *     addEventListener("load", () =>
 *       navigator.serviceWorker.register("/sw.js", { scope: "/" }));
 *   }
 *
 * A service worker can only control pages at or below its own URL, so it must
 * be served from the site root — copy or route this file to /sw.js rather than
 * registering it from /design-system/pwa/.
 */

/* Bump on every change to this file OR to any precached asset.
 *
 * This matters more than it looks: the font filenames are stable across
 * upstream releases (Geist-Variable.woff2 does not carry a hash), so syncing a
 * new `geist` version changes the bytes behind an unchanged URL. Without a bump
 * here, installed clients keep serving the old faces from cache indefinitely.
 */
const VERSION = "geist-ds-v1";

const DS = "/design-system";

const PRECACHE = [
  `${DS}/geist.css`,
  `${DS}/fonts/fonts.css`,
  `${DS}/tokens/ds-tokens.css`,
  `${DS}/pwa/pwa.css`,
  `${DS}/pwa/theme.js`,
  `${DS}/fonts/geist-sans/Geist-Variable.woff2`,
  `${DS}/fonts/geist-mono/GeistMono-Variable.woff2`,
];

/* Italic and pixel faces are deliberately not precached — they are a large
 * fraction of the byte budget and most apps never render them. They still get
 * cached on first use by the fetch handler below. Move an entry up into
 * PRECACHE if your app shows it above the fold. */

/** Add your app's own critical assets here, or precache them from a second SW. */
const APP_PRECACHE = [];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll([...PRECACHE, ...APP_PRECACHE]))
      // Do not skipWaiting automatically: an already-open client is running the
      // previous version's code, and swapping the cache under it can serve a
      // mismatched pair of assets. The page asks for the swap when it is ready
      // (see the message handler below).
      .then(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/** Let the page trigger the update once it has told the user. */
self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});

const isFont = (url) => url.pathname.startsWith(`${DS}/fonts/`) && url.pathname.endsWith(".woff2");
const isDesignAsset = (url) => url.pathname.startsWith(`${DS}/`);

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Never touch anything but same-origin GETs. Cross-origin and mutating
  // requests belong to the app and must not be intercepted here.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Fonts are immutable for the lifetime of a VERSION: cache-first, no
  // revalidation. This is what makes a cold launch render in Geist rather than
  // the fallback stack.
  if (isFont(url)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(VERSION).then((c) => c.put(request, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Stylesheets and scripts in the design layer: serve the cached copy at once,
  // refresh it in the background for the next load.
  if (isDesignAsset(url)) {
    event.respondWith(
      caches.open(VERSION).then(async (cache) => {
        const hit = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit ?? network;
      }),
    );
  }

  // Everything else falls through to the network untouched. Add a
  // navigation-request strategy here when the app has an offline route to
  // fall back to — doing it without one just turns a network error into a
  // blank page.
});
