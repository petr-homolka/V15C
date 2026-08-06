/* Rasterizes pwa/icons/*.svg to the PNGs the manifest references.
 *
 * UNLIKE the other scripts here, this one is NOT dependency-free — it drives a
 * headless Chromium so the icons render in real Geist Sans rather than whatever
 * a generic SVG rasterizer substitutes. It is therefore not part of the normal
 * regeneration flow; the committed PNGs are checked in, and you only need this
 * when the SVG sources change.
 *
 *   npm i --no-save playwright-core   # or point EXECUTABLE at any Chromium
 *   node design-system/scripts/rasterize-icons.mjs
 *
 * Any rasterizer will do (rsvg-convert, Inkscape, a design tool) as long as it
 * embeds the font — these are placeholder icons and expected to be replaced.
 */
import { readFileSync } from "node:fs";

const EXECUTABLE =
  process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const DIR = new URL("../", import.meta.url).pathname;
const ICONS = `${DIR}pwa/icons`;

const JOBS = [
  { svg: "icon.svg", out: "icon-512.png", size: 512 },
  { svg: "icon.svg", out: "icon-192.png", size: 192 },
  { svg: "icon.svg", out: "apple-touch-icon.png", size: 180 },
  { svg: "icon-maskable.svg", out: "icon-maskable-512.png", size: 512 },
];

let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  console.error(
    "playwright-core is not installed. Run `npm i --no-save playwright-core`,\n" +
      "or rasterize pwa/icons/*.svg with any tool that embeds the font.",
  );
  process.exit(1);
}

// Inlined as a data: URI — the page is set via setContent and has no base URL,
// so a relative font path would not resolve.
const font = readFileSync(
  `${DIR}fonts/geist-sans/Geist-Variable.woff2`,
).toString("base64");

const browser = await chromium.launch({ executablePath: EXECUTABLE });

for (const job of JOBS) {
  const svg = readFileSync(`${ICONS}/${job.svg}`, "utf8")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();

  const page = await browser.newPage({
    viewport: { width: job.size, height: job.size },
  });
  await page.setContent(
    `<!doctype html><meta charset="utf-8"><style>
      @font-face {
        font-family: "Geist Sans";
        src: url(data:font/woff2;base64,${font}) format("woff2-variations");
        font-weight: 100 900;
      }
      html, body { margin: 0; padding: 0; width: ${job.size}px; height: ${job.size}px; overflow: hidden; }
      svg { display: block; width: ${job.size}px; height: ${job.size}px; }
    </style>${svg}`,
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${ICONS}/${job.out}`, omitBackground: true });
  await page.close();
  console.log(`${job.out} (${job.size}×${job.size})`);
}

await browser.close();
