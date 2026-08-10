# Notion-like UI/UX & webdesign resources on GitHub

Companion to [`routine-co-resources.md`](./routine-co-resources.md). Star counts
are an **August 2026** snapshot.

## First, a calibration on the premise

Routine and Notion do share a lot, and it's the part that matters most for
implementation:

- a near-neutral gray scale doing almost all the work, with one accent hue
- hairline translucent borders instead of heavy dividers or drop shadows
- a **block-based editor** with a slash menu, drag handles, and inline
  transformation of blocks
- a collapsible left sidebar as the primary navigation
- restrained motion — short, small-distance transitions

Where they diverge is **density and scale**. Notion is document-first: generous
line-height, large default type, lots of whitespace, built for reading and
authoring long pages. Routine is control-first: compact rows, smaller type, tight
vertical rhythm, built for scanning a day and hitting keys. Same *vocabulary*,
different *setting* — Routine sits closer to the Linear/Vercel end of that
spectrum, which is the Geist system already vendored here.

Practically: borrow Notion's **block/editor patterns** and Notion-adjacent
**component behaviour**, but keep Geist's spacing and type scale. Adopting a
Notion-scale type ramp would make the planner feel slow.

---

## A. Extract the design language directly

The most efficient path — read the real tokens instead of eyeballing screenshots.

| Repo | ★ | Notes |
| --- | --- | --- |
| [dembrandt/dembrandt](https://github.com/dembrandt/dembrandt) | 2.3k | **Start here.** One command extracts any website's design system into tokens — colors, typography, borders, logo. Point it at both routine.co and notion.so and diff the output against `design-system/tokens/`. Playwright-based, has an MCP mode. |
| [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | 106.9k | A collection of `DESIGN.md` files distilled from well-known brand design systems, written specifically so coding agents produce matching UI. Directly usable alongside this repo's `CLAUDE.md`. |
| [itmeo/webgradients](https://github.com/itmeo/webgradients) | 2.5k | 180 gradients incl. a JSON dataset. Marginal for a planner UI — listed for completeness. |

Caveat on `dembrandt`: extracted tokens are a starting point, not truth. Computed
CSS gives you the values but not the *roles*, and Geist's whole premise is that a
step like `gray-900` means a role, not a lightness. Map extracted values onto
existing Geist steps rather than adding new ones.

---

## B. Notion-like app references

| Repo | ★ | Notes |
| --- | --- | --- |
| [AppFlowy-IO/AppFlowy](https://github.com/AppFlowy-IO/AppFlowy) | 75.0k | The leading OSS Notion alternative. Flutter + Rust. |
| [toeverything/AFFiNE](https://github.com/toeverything/AFFiNE) | 71.3k | Notion + Miro hybrid; the most polished OSS take on the aesthetic. Editor extracted as BlockSuite. |
| [docmost/docmost](https://github.com/docmost/docmost) | 21.3k | Collaborative wiki, TypeScript, Confluence/Notion alternative. Readable modern stack — good code to actually copy patterns from. |
| [colanode/colanode](https://github.com/colanode/colanode) | 5.0k | **Local-first** Slack + Notion alternative (Electron, SQLite, Yjs). The closest architectural match if you want offline-first with a Notion surface. |
| [mayneyao/eidos](https://github.com/mayneyao/eidos) | 3.2k | Extensible personal-data-management framework — Notion-style **database views** over local SQLite. The reference if you want Notion's table/board views. |
| [konstantinruge/notion-clone](https://github.com/konstantinruge/notion-clone) | 3.0k | Small, focused clone of the Notion editing surface. Good for reading the `contenteditable` block mechanics without a large codebase around it. |
| [splitbee/react-notion](https://github.com/splitbee/react-notion) | 3.0k | Fast React renderer for actual Notion pages — effectively a reimplementation of Notion's CSS. **Read its stylesheet** to see the real spacing and type values. |

---

## C. Notion-style editors

| Repo | ★ | Notes |
| --- | --- | --- |
| [steven-tey/novel](https://github.com/steven-tey/novel) | 16.4k | Notion-style WYSIWYG with slash menu, bubble menu, and AI autocompletion. Tiptap + Next.js + Vercel stack, so it drops into a Geist project with the least friction. **Best single reference.** |
| [TypeCellOS/BlockNote](https://github.com/TypeCellOS/BlockNote) | 10.1k | Block-based Notion-style editor on Tiptap, with slash menus, drag handles, and Yjs collaboration already wired up. |
| [toeverything/blocksuite](https://github.com/toeverything/blocksuite) | 6.0k | AFFiNE's editor toolkit; CRDT-native, web components. |
| [yoopta-editor/Yoopta-Editor](https://github.com/yoopta-editor/Yoopta-Editor) | 3.1k | Explicitly for building "Notion-like, Craft-like, Coda-like" editors. Slate-based. |
| [ueberdosis/tiptap](https://github.com/ueberdosis/tiptap) | 37.9k | The framework underneath most of the above. Use directly if you want full control of the block schema. |
| [Milkdown/milkdown](https://github.com/Milkdown/milkdown) | 11.8k | Pick this instead if notes must stay markdown-on-disk. |

---

## D. Component primitives — and a warning

**The warning first.** `CLAUDE.md` mandates Geist tokens and forbids hard-coded
colours, shadows and radii. Most popular Tailwind/React kits ship their *own*
token layer — daisyUI, Radix Themes, Flowbite, Preline each define a parallel
colour and radius system. Dropping one in gives you two competing design systems
and quietly breaks the light/dark role guarantee.

So: prefer **headless** libraries (behaviour + accessibility, zero styling) and
skin them with Geist tokens. Use pre-styled kits as *visual reference only*.

### Headless — safe to adopt

| Repo | ★ | Notes |
| --- | --- | --- |
| [radix-ui/primitives](https://github.com/radix-ui/primitives) | 19.1k | Unstyled accessible primitives — dialog, popover, dropdown, context menu, tooltip. Exactly the Notion interaction set, and it brings no colours of its own. **Primary recommendation.** |
| [tailwindlabs/headlessui](https://github.com/tailwindlabs/headlessui) | 28.7k | Unstyled accessible components designed for Tailwind. Smaller surface than Radix. |
| [dip/cmdk](https://github.com/dip/cmdk) | 12.9k | Unstyled command menu — Notion's ⌘K and Routine's Console. |
| [TanStack/table](https://github.com/TanStack/table) | 28.3k | Headless tables/datagrids. The way to build Notion database views under your own markup. |
| [clauderic/dnd-kit](https://github.com/clauderic/dnd-kit) | 17.5k | Headless drag-and-drop — block reordering and drag handles, keyboard-operable. |
| [openui/open-ui](https://github.com/openui/open-ui) | 4.5k | The W3C effort to standardise these controls. Useful for understanding native semantics before reaching for a library. |

### Pre-styled — reference only

| Repo | ★ | Notes |
| --- | --- | --- |
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | 120.6k | Copy-paste components over Radix. The **structure** is a great starting point; strip its CSS variables and re-map to Geist tokens rather than importing its theme. |
| [cosscom/coss](https://github.com/cosscom/coss) | 10.4k | Cal.com's official design system (Radix/Base UI + Tailwind + TanStack Table). A worked example of a real product design system in this exact idiom. |
| [radix-ui/themes](https://github.com/radix-ui/themes) | 8.6k | Radix's own styled layer. Read its **colour scale design** — the closest published thinking to Geist's role-based steps. |
| [primer/css](https://github.com/primer/css) | 13.0k | GitHub's design system — mature reference for dense, neutral-gray product UI. |
| [serafimcloud/21st](https://github.com/serafimcloud/21st) | 5.4k | Marketplace of shadcn-based components/blocks. Also [21st-dev/magic-mcp](https://github.com/21st-dev/magic-mcp) (5.6k) to search 10,000+ components from inside an editor. |
| [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits) | 44.9k | Animated interactive React components. Mostly marketing-site flourish — sparingly, if at all, in a planner. |
| [themesberg/flowbite](https://github.com/themesberg/flowbite) | 9.3k | Large Tailwind component set. |
| [htmlstreamofficial/preline](https://github.com/htmlstreamofficial/preline) | 6.4k | Tailwind component set, has an agent-skills integration. |
| [saadeghi/daisyui](https://github.com/saadeghi/daisyui) | 42.0k | Popular Tailwind component library — but its theming system directly conflicts with Geist. Reference only. |
| [markmead/hyperui](https://github.com/markmead/hyperui) | 12.2k | Free Tailwind v4 components, copy-paste, no runtime. |

---

## E. Motion

Notion and Routine both use motion sparingly. Two libraries cover it.

| Repo | ★ | Notes |
| --- | --- | --- |
| [motiondivision/motion](https://github.com/motiondivision/motion) | 33.1k | The former Framer Motion. Layout animations, spring physics, gesture support. |
| [formkit/auto-animate](https://github.com/formkit/auto-animate) | 13.9k | Zero-config transitions for list add/remove/reorder — enough for most planner interactions, one line per container. |

---

## F. Design-token tooling

Relevant because `design-system/scripts/extract-tokens.mjs` already does a
narrower version of this job.

| Repo | ★ | Notes |
| --- | --- | --- |
| [style-dictionary/style-dictionary](https://github.com/style-dictionary/style-dictionary) | 4.8k | The standard build system for transforming tokens across platforms. Worth adopting if tokens ever need to feed iOS/Android as well as CSS. |
| [design-tokens/community-group](https://github.com/design-tokens/community-group) | 2.1k | The **DTCG specification** — the interoperable format to target if `tokens.json` is ever consumed by other tools. |
| [tokens-studio/figma-plugin](https://github.com/tokens-studio/figma-plugin) | 1.6k | Tokens Studio for Figma — the bridge if design work happens in Figma. |
| [chakra-ui/panda](https://github.com/chakra-ui/panda) | 6.1k | Type-safe CSS-in-JS built around design tokens. An alternative to the Tailwind path, not an addition to it. |
| [system-ui/theme-ui](https://github.com/system-ui/theme-ui) | 5.4k | Constraint-based theming; useful reading on scale design. |

---

## G. Curated lists

| Repo | ★ | Notes |
| --- | --- | --- |
| [alexpate/awesome-design-systems](https://github.com/alexpate/awesome-design-systems) | 25.6k | Public design systems and pattern libraries. The best single index for studying how others document tokens and components. |
| [goabstract/Awesome-Design-Tools](https://github.com/goabstract/Awesome-Design-Tools) | 40.8k | Design tools and plugins, broadly. |
| [gztchan/awesome-design](https://github.com/gztchan/awesome-design) | 17.4k | General curated design resources — typography, colour, inspiration. |
| [ConardLi/garden-skills](https://github.com/ConardLi/garden-skills) | 10.1k | Agent **skills** collection including web design — relevant given this repo's Claude Code setup. |
| [youneslaaroussi/ui-buttons](https://github.com/youneslaaroussi/ui-buttons) | 3.8k | 100 CSS button styles. Narrow but occasionally handy. |
| [usablica/intro.js](https://github.com/usablica/intro.js) | 23.5k | Onboarding tours, if a first-run walkthrough is ever needed. |

---

## Suggested path for this repo

1. Run **`dembrandt`** against routine.co and notion.so; diff against
   `design-system/tokens/ds-tokens.css` to see what Geist already covers. Expect
   most gaps to be *spacing and type scale*, not colour.
2. Read **`react-notion`**'s stylesheet for Notion's real spacing/type values, and
   **`novel`** for the editor interaction model.
3. Build components from **Radix Primitives + cmdk + TanStack Table + dnd-kit**,
   styled exclusively with Geist tokens. Use `shadcn/ui` for structure, never its theme.
4. Keep motion to **`auto-animate`** unless layout animation is genuinely needed;
   reach for `motion` only then.
5. If tokens ever leave CSS, adopt **DTCG format** via `style-dictionary` rather
   than growing the bespoke extract script.

## Gaps

- **No OSS Notion-density design system exists as a drop-in.** Radix Themes and
  Primer are the nearest published systems in this idiom, and neither matches
  Geist's token structure — hence the headless-plus-Geist recommendation.
- **Token extraction can't recover roles.** Any extracted palette needs manual
  mapping onto Geist's `100`→`1000` role steps; that's a judgement task, not
  something the tooling decides.
- **Notion's inline-database UX has no faithful OSS component.** `eidos` is the
  closest working implementation; everything else is a generic datagrid.
