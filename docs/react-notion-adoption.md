# Adopting react-notion — what we took, what we didn't

Deliverable: [`styles/notion-density.css`](../styles/notion-density.css).

Source: [`splitbee/react-notion`](https://github.com/splitbee/react-notion) v0.10.0,
MIT, read at commit `a937f47`.

## Read this first: the package can't be the project

`react-notion` is a **read-only renderer**, and that's not a quibble about scope —
it's the whole shape of the library. From the source:

- `NotionRenderer` (`src/renderer.tsx`, 64 lines) takes a `blockMap` prop and walks
  it recursively into `<Block>` elements. There is no editing, no input handling,
  no state, no persistence. Nothing writes.
- The `blockMap` has to come from Notion's **private, undocumented** endpoint
  `https://www.notion.so/api/v3/loadPageChunk`. The README is explicit that the
  package doesn't handle API communication at all and points at a separate worker
  to do it. So the content of record lives in Notion, on an unofficial API.
- Total surface is 1,744 lines, of which 683 are CSS and 377 are type
  definitions. The actual rendering logic is ~680 lines.
- Last commit **2024-10-28** — around 22 months stale as of this writing. It
  still targets React 16 and TypeScript 3.9 in devDependencies.
- Its own README says it is "best suited as minimal renderer for blogs & content
  pages" and redirects anyone wanting a full-featured solution to
  [`react-notion-x`](https://github.com/NotionX/react-notion-x) (5.4k★, actively
  maintained).

Against the Routine feature set, that leaves: no editor, no tasks, no calendar,
no time blocking, no Console, no local-first storage, and a hard dependency on
Notion as the backend. So `react-notion` can't be "enough for the project" — it
renders documents someone else's app authored.

**But the CSS is genuinely valuable**, and that's exactly what the earlier survey
recommended it for: it's a faithful reimplementation of Notion's own stylesheet,
which makes it the cheapest accurate source for Notion's real spacing, type and
colour values. That's what has been adopted.

## What was adopted

All of `src/styles.css`, translated. `styles/notion-density.css` keeps Notion's
structure, rhythm and proportions, and replaces every hard-coded value with a
Geist token — so it now works in dark mode, which the original does not.

Class names are re-prefixed `.notion-*` → `.nd-*` so the layer stands on its own
and doesn't collide if `react-notion` (or `react-notion-x`) is ever added for
rendering imported Notion content.

### Colour mapping

Notion derives nearly everything from one warm near-black, `rgb(55, 53, 47)`, at
varying alpha:

| Notion value | Role | Geist token | Fit |
| --- | --- | --- | --- |
| `rgb(55,53,47)` | body text, caret | `--ds-gray-1000` | see note on warmth below |
| `rgba(55,53,47,.6)` | captions, table headers | `--ds-gray-900` | role match |
| `rgba(55,53,47,.4)` | icons, nav spacer | `--ds-gray-900` | role match |
| `rgba(55,53,47,.09)` | hairline rules, table borders | `--ds-gray-alpha-400` (`.08`) | near-exact |
| `rgba(55,53,47,.16)` | stronger borders, underlines | `--ds-gray-alpha-500` | nearest step |
| `rgba(55,53,47,.08)` | hover background | `--ds-gray-alpha-200` (`.081`) | near-exact |
| `rgba(55,53,47,.16)` | active/press background | `--ds-gray-alpha-300` | nearest step |
| `rgb(247,246,243)` | code block background | `--ds-background-200` | role match |
| `#eb5757` | inline code text | `--ds-red-900` | role match |
| `rgba(135,131,120,.15)` | inline code background | `--ds-gray-alpha-200` | role match |
| `white` | gallery card surface | `--ds-background-100` | exact |
| `0 0 0 1px` + `0 2px 4px` @ `rgba(15,15,15,.1)` | card elevation | `--ds-shadow-border-small` | see note |
| `3px` | radius, near-universal | `--radius-sm` (4px) | no 3px step in Geist |
| system font stack | body | `--font-geist-sans` | — |
| `SFMono-Regular, …` | code | `--font-geist-mono` | — |

Two mappings worth calling out:

**The card shadow was already a shadow-border.** Notion hand-rolls
`rgba(15,15,15,0.1) 0 0 0 1px, rgba(15,15,15,0.1) 0 2px 4px` — a 1px ring plus a
soft drop shadow. That is precisely the pattern `--ds-shadow-border-small`
encodes, so this is a clean substitution rather than an approximation.

**Notion's near-black is warm; Geist's is neutral.** `rgb(55, 53, 47)` carries a
slight brown cast, and it's a real part of why Notion feels soft rather than
clinical. Geist's `--ds-gray-1000` is `oklch(0.205 0 0)` — chroma exactly zero.
Adopting the token therefore *loses* that warmth deliberately. Getting it back
would mean a custom hue ramp; since `tokens/theme.css` must stay byte-identical to
upstream, that would have to live in an app stylesheet layered after it. Worth
doing only if the neutral version actually reads as too cold in practice — check
it on screen before adding a parallel ramp.

### Type & rhythm

Kept verbatim, because this is the part that makes Notion feel like Notion:

- body `16px` / `1.5`
- em-based heading ramp — title `2.5em`/700, h1 `1.875em`/600, h2 `1.5em`/600,
  h3 `1.25em`/600, heading line-height `1.3`
- **block padding `3px 2px`** — the signature rhythm that makes blocks feel
  individually targetable without visible chrome
- content column `708px`
- `120ms ease-in` background transitions on hover, `100ms ease-out` on cards

All exposed as `--nd-*` custom properties so density is tunable without editing
rules. Namespaced `--nd-*` rather than `--ds-*`, matching the `--pwa-*` convention
already used by the PWA layer.

### The nine annotation hues

Notion's `red pink blue purple teal yellow orange brown gray` map onto Geist's
`red pink blue purple teal amber green gray` at step `900` for text and `200`/`100`
for highlight surfaces. Geist has no orange or brown, so **orange folds into amber
and brown into gray** — a visible change if source content uses them heavily.

## Deliberate deviations

Seven places where the original was not copied faithfully:

1. **Dark mode.** The original is light-only with hard-coded colours; `CLAUDE.md`
   forbids that, and Geist's role-based steps mean the translated layer inverts
   correctly with no extra rules. No `prefers-color-scheme` query was added —
   `tokens/dark-auto.css` already covers that case.
2. **Focus rings.** The original has none — `.notion-toggle > summary` even sets
   `outline: none`. For a keyboard-first app that's a real accessibility defect, so
   `var(--ds-focus-ring)` was added to every interactive element.
3. **`overflow-x: auto` on code blocks**, not `scroll`. The original shows a
   permanent scrollbar gutter on platforms with classic scrollbars.
4. **Tables scroll in their own container.** The original sets
   `white-space: nowrap` with no overflow handling, so a wide table pushes the
   whole page sideways.
5. **Checkbox accent is `--ds-blue-700`**, not Notion's `#eb5757`. A red checkbox
   reads as an error state in a task app.
6. **`prefers-reduced-motion`** support added; the original has none.
7. **A compact preset** (`.nd-compact`) that pulls the scale to `14px` and drops
   block padding to `1px`. This is the point from the earlier survey: Notion's
   density is right for a note body and wrong for planner chrome. The default
   `.nd-doc` is Notion-faithful; `.nd-compact` is for note previews embedded in a
   dense surface. Calendar rows, task lists and the Console should not use this
   layer at all.

## Verification

- Every `--ds-*` and `--font-*` token referenced was checked to exist in
  `design-system/tokens/`.
- No hex, `rgb()`, `rgba()`, `oklch()` or `hsl()` literal remains; no raw
  `box-shadow`; no `prefers-color-scheme` query. Braces balance.
- **Not yet rendered.** These are static checks — the layer has not been
  exercised against real markup in a browser, because the repo has no app to
  mount it in. Treat the visual result as unverified until something renders it.

## If you do want a Notion renderer

Use [`react-notion-x`](https://github.com/NotionX/react-notion-x) (5.4k★),
actively maintained, far broader block coverage, and what `react-notion`'s own
README recommends. It's the right choice for *importing* Notion content — but it's
still a renderer, so it doesn't change the conclusion above about authoring.

For the editing surface, the survey's recommendation stands:
[`novel`](https://github.com/steven-tey/novel) or
[`BlockNote`](https://github.com/TypeCellOS/BlockNote), both Tiptap-based.
