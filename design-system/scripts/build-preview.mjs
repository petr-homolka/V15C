/* Generates design-system/preview.html from tokens.json.
 *
 * Static output on purpose: the page must open straight off the filesystem,
 * where fetch() of a sibling JSON file is blocked by the file:// origin policy.
 *
 * Run after extract-tokens.mjs:  node design-system/scripts/build-preview.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const DIR = new URL("../", import.meta.url).pathname;
const { tokens, source } = JSON.parse(
  readFileSync(`${DIR}tokens/tokens.json`, "utf8"),
);

const names = Object.keys(tokens);
const HUES = [
  "gray",
  "gray-alpha",
  "blue",
  "red",
  "amber",
  "green",
  "teal",
  "purple",
  "pink",
];
const STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000];

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const swatch = (name) => {
  const t = tokens[name];
  if (!t) return "";
  return `      <div class="sw">
        <div class="chip" style="background:var(${name})"></div>
        <div class="txt">
          <code>${esc(name.replace("--ds-", ""))}</code>
          <span class="val" data-light="${esc(t.light)}" data-dark="${esc(t.dark)}">${esc(t.light)}</span>
        </div>
      </div>`;
};

const ramp = (hue) => {
  const rows = STEPS.map((s) => `--ds-${hue}-${s}`)
    .filter((n) => names.includes(n))
    .map(swatch)
    .join("\n");
  return `    <section class="ramp">
      <h3>${hue}</h3>
      <div class="grid">
${rows}
      </div>
    </section>`;
};

const SHADOWS = names.filter(
  (n) => tokens[n].group === "shadow" && !n.includes("-base") && !n.includes("background-border"),
);

const shadowCard = (name) => `      <div class="shcard">
        <div class="box" style="box-shadow:var(${name})"></div>
        <code>${esc(name.replace("--ds-", ""))}</code>
      </div>`;

const TYPE = {
  Heading: [72, 64, 56, 48, 40, 32, 24, 20, 16, 14].map((n) => [
    `heading-${n}`,
    `font-weight:450;font-size:${n}px;line-height:${{ 72: 72, 64: 64, 56: 56, 48: 56, 40: 48, 32: 40, 24: 32, 20: 26, 16: 24, 14: 20 }[n]}px;letter-spacing:${{ 72: "-4.32px", 64: "-3.84px", 56: "-3.36px", 48: "-2.88px", 40: "-2.4px", 32: "-1.28px", 24: "-0.96px", 20: "-0.4px", 16: "-0.32px", 14: "-0.28px" }[n]}`,
  ]),
  Copy: [
    ["copy-24", "font-size:24px;line-height:36px"],
    ["copy-20", "font-size:20px;line-height:36px"],
    ["copy-18", "font-size:18px;line-height:28px"],
    ["copy-16", "font-size:16px;line-height:24px"],
    ["copy-14", "font-size:14px;line-height:20px"],
    ["copy-13", "font-size:13px;line-height:18px"],
    ["copy-14-mono", "font-family:var(--font-geist-mono);font-size:14px;line-height:20px"],
    ["copy-13-mono", "font-family:var(--font-geist-mono);font-size:13px;line-height:18px"],
  ],
  Label: [
    ["label-20", "font-size:20px;line-height:32px"],
    ["label-18", "font-size:18px;line-height:20px"],
    ["label-16", "font-size:16px;line-height:20px"],
    ["label-14", "font-size:14px;line-height:20px"],
    ["label-13", "font-size:13px;line-height:16px"],
    ["label-12", "font-size:12px;line-height:16px"],
    ["label-16-mono", "font-family:var(--font-geist-mono);font-size:16px;line-height:20px"],
    ["label-14-mono", "font-family:var(--font-geist-mono);font-size:14px;line-height:20px"],
    ["label-13-mono", "font-family:var(--font-geist-mono);font-size:13px;line-height:20px"],
    ["label-12-mono", "font-family:var(--font-geist-mono);font-size:12px;line-height:16px"],
  ],
  Button: [
    ["button-16", "font-weight:500;font-size:16px;line-height:20px"],
    ["button-14", "font-weight:500;font-size:14px;line-height:20px"],
    ["button-12", "font-weight:500;font-size:12px;line-height:16px"],
  ],
};

const typeSection = ([group, items]) => `    <section class="ramp">
      <h3>${group.toLowerCase()}</h3>
${items
  .map(
    ([n, css]) => `      <div class="typerow">
        <code>text-${esc(n)}</code>
        <div style="${css}">Sphinx of black quartz, judge my vow</div>
      </div>`,
  )
  .join("\n")}
    </section>`;

const RADII = [
  ["xs", "2px"],
  ["sm", "4px"],
  ["md", "6px"],
  ["lg", "8px"],
  ["xl", "12px"],
  ["2xl", "16px"],
];

const PIXEL = ["square", "grid", "circle", "triangle", "line"];

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Geist Design System — preview</title>
<link rel="stylesheet" href="./geist.css">
<style>
  body { margin: 0; padding: 0 0 8rem; }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
  header {
    position: sticky; top: 0; z-index: 10;
    display: flex; align-items: center; gap: 16px;
    padding: 16px 24px; margin-bottom: 40px;
    background: var(--ds-background-100);
    border-bottom: 1px solid var(--ds-gray-alpha-400);
  }
  header h1 { margin: 0; font-size: 20px; font-weight: 450; letter-spacing: -0.4px; }
  header .meta { color: var(--ds-gray-900); font-size: 13px; font-family: var(--font-geist-mono); }
  header button {
    margin-left: auto; font: inherit; font-size: 14px; font-weight: 500;
    padding: 6px 12px; border: 0; border-radius: 6px; cursor: pointer;
    background: var(--ds-gray-1000); color: var(--ds-background-100);
  }
  header button:focus-visible { outline: 0; box-shadow: var(--ds-focus-ring); }
  h2 {
    font-size: 24px; font-weight: 450; letter-spacing: -0.96px;
    margin: 56px 0 8px; padding-top: 24px;
    border-top: 1px solid var(--ds-gray-alpha-400);
  }
  h2:first-of-type { border-top: 0; margin-top: 0; }
  h3 { font-size: 13px; font-weight: 500; color: var(--ds-gray-900); margin: 28px 0 10px;
       font-family: var(--font-geist-mono); }
  p.lede { color: var(--ds-gray-900); font-size: 14px; line-height: 20px; margin: 0 0 8px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 8px; }
  .sw { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .chip {
    width: 34px; height: 34px; flex: none; border-radius: 6px;
    box-shadow: var(--ds-shadow-border-base);
  }
  .sw .txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .sw code { font-size: 12px; font-family: var(--font-geist-mono); }
  .sw .val {
    font-size: 10px; font-family: var(--font-geist-mono); color: var(--ds-gray-900);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .shgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 24px; }
  .shcard { display: flex; flex-direction: column; gap: 10px; align-items: flex-start; }
  .shcard .box {
    width: 100%; height: 68px; border-radius: 8px;
    background: var(--ds-background-100);
  }
  .shcard code, .rcard code { font-size: 12px; font-family: var(--font-geist-mono);
                              color: var(--ds-gray-900); }
  .rgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 16px; }
  .rcard { display: flex; flex-direction: column; gap: 8px; }
  .rcard .box { height: 56px; background: var(--ds-gray-100);
                box-shadow: var(--ds-shadow-border-base); }
  .typerow {
    display: grid; grid-template-columns: 150px 1fr; gap: 20px;
    align-items: baseline; padding: 10px 0;
    border-top: 1px solid var(--ds-gray-alpha-200);
  }
  .typerow > code { font-size: 12px; font-family: var(--font-geist-mono);
                    color: var(--ds-gray-900); }
  .typerow > div { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .mats { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; }
  .mat { padding: 20px; background: var(--ds-background-100);
         font-size: 13px; font-family: var(--font-geist-mono); color: var(--ds-gray-900); }
  .pixrow { display: grid; grid-template-columns: 150px 1fr; gap: 20px;
            align-items: center; padding: 10px 0;
            border-top: 1px solid var(--ds-gray-alpha-200); }
  .pixrow > code { font-size: 12px; font-family: var(--font-geist-mono);
                   color: var(--ds-gray-900); }
  .pixrow > div { font-size: 26px; }
  .weights { display: flex; flex-wrap: wrap; gap: 20px; align-items: baseline; }
  .weights div { font-size: 28px; letter-spacing: -0.5px; }
  .weights small { display: block; font-size: 11px; font-family: var(--font-geist-mono);
                   color: var(--ds-gray-900); letter-spacing: 0; }
  section.ramp { margin-bottom: 4px; }
</style>
</head>
<body>
<header>
  <h1>Geist Design System</h1>
  <span class="meta">${esc(source.package)}@${esc(source.version)} · geist@1.7.2</span>
  <button type="button" id="t">Toggle theme</button>
</header>

<div class="wrap">

<h2>Colour</h2>
<p class="lede">${names.filter((n) => tokens[n].group === "color").length} colour tokens. Step numbers are roles, not lightness — the same step means the same thing in both themes.</p>
${["background-100", "background-200", "black", "white"]
  .map((n) => `--ds-${n}`)
  .filter((n) => names.includes(n))
  .map(swatch)
  .join("\n")
  .replace(/^/, '<section class="ramp">\n  <h3>base</h3>\n  <div class="grid">\n')}
  </div>
</section>
${HUES.map(ramp).join("\n")}

<h2>Shadows</h2>
<p class="lede">Elevation is composed from a hairline border plus blur layers. Dark mode raises opacity rather than merely tinting.</p>
<div class="shgrid">
${SHADOWS.map(shadowCard).join("\n")}
</div>

<h2>Radii</h2>
<div class="rgrid">
${RADII.map(
  ([k, v]) => `  <div class="rcard">
    <div class="box" style="border-radius:${v}"></div>
    <code>radius-${k} · ${v}</code>
  </div>`,
).join("\n")}
</div>

<h2>Typography</h2>
<p class="lede">Geist Sans, variable 100–900, with <code>"rlig" 1, "calt" 0, "ss11" 1</code> applied on &lt;html&gt;.</p>
<section class="ramp">
  <h3>weights</h3>
  <div class="weights">
${[100, 200, 300, 400, 450, 500, 600, 700, 800, 900]
  .map(
    (w) =>
      `    <div style="font-weight:${w}">Geist<small>${w}</small></div>`,
  )
  .join("\n")}
  </div>
</section>
${Object.entries(TYPE).map(typeSection).join("\n")}
<section class="ramp">
  <h3>geist pixel</h3>
${PIXEL.map(
  (p) => `  <div class="pixrow">
    <code>pixel-${p}</code>
    <div style="font-family:var(--font-geist-pixel-${p})">Geist Pixel 0123</div>
  </div>`,
).join("\n")}
</section>

<h2>Materials</h2>
<p class="lede">Surface + radius + shadow, bundled so elevation and rounding stay in step.</p>
<div class="mats">
${[
  ["base", "border", "6px"],
  ["small", "border-small", "6px"],
  ["medium", "border-medium", "12px"],
  ["large", "border-large", "12px"],
  ["tooltip", "tooltip", "6px"],
  ["menu", "menu", "12px"],
  ["modal", "modal", "12px"],
  ["fullscreen", "fullscreen", "16px"],
]
  .map(
    ([n, s, r]) =>
      `  <div class="mat" style="box-shadow:var(--ds-shadow-${s});border-radius:${r}">material-${n}</div>`,
  )
  .join("\n")}
</div>

</div>

<script>
  const root = document.documentElement;
  document.getElementById("t").addEventListener("click", () => {
    root.classList.toggle("dark");
    const dark = root.classList.contains("dark");
    for (const el of document.querySelectorAll(".val")) {
      el.textContent = dark ? el.dataset.dark : el.dataset.light;
    }
  });
</script>
</body>
</html>
`;

writeFileSync(`${DIR}preview.html`, html);
console.log(`preview.html written (${names.length} tokens)`);
