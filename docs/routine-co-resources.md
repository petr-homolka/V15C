# Routine.co — design & functional resources on GitHub

A survey of open-source resources relevant to building a Routine-like app.
Star counts are a snapshot from **August 2026** and will drift.

## What Routine is (so the list has a target)

Routine ([routine.co](https://routine.co)) is a keyboard-first daily planner that
merges four things into one surface:

- a **Console** (command bar) for capture and navigation — the primary input method
- a **calendar** with day/week/month views, Google/Outlook sync, and **time blocking**
  via drag-and-drop of tasks onto the calendar
- **tasks** with an inbox, scheduling, and recurrence
- **notes** (incl. meeting notes) linked to events, people, and tasks

Reviews consistently praise the clean design, keyboard-driven capture, dashboard,
and time blocking; the recurring criticism is maturity — bugs, weaker mobile, and
missing features. Design-wise it sits in the dense, quiet, keyboard-centric
Linear/Vercel school, which is why the Geist system already vendored in this repo
is a reasonable foundation.

**There is no open-source clone of Routine.** Nothing on GitHub covers the whole
Console + calendar + tasks + notes surface. The list below is therefore split into
apps worth studying and components to assemble.

---

## A. Reference apps to study

Closest in scope first.

| Repo | ★ | Why it's relevant |
| --- | --- | --- |
| [super-productivity/super-productivity](https://github.com/super-productivity/super-productivity) | 21.2k | Closest functional analogue: todo list **plus timeboxing plus time tracking**, local-first, cross-platform. Study its timebox↔task model. |
| [toeverything/AFFiNE](https://github.com/toeverything/AFFiNE) | 71.3k | Notion+Miro hybrid; the reference for CRDT-backed docs in a polished Electron app. Its editor is extracted as BlockSuite (below). |
| [AppFlowy-IO/AppFlowy](https://github.com/AppFlowy-IO/AppFlowy) | 75.0k | Notion alternative, Flutter+Rust. Good model for local-data-ownership architecture. |
| [logseq/logseq](https://github.com/logseq/logseq) | 44.3k | Local-first PKM with **backlinks and a daily-journal-first UX** — very close to Routine's notes+day pairing. |
| [siyuan-note/siyuan](https://github.com/siyuan-note/siyuan) | 45.6k | Block-based, local-first knowledge base with a daily note workflow. |
| [go-vikunja/vikunja](https://github.com/go-vikunja/vikunja) | 5.0k | Self-hosted task manager with a clean Go API — a good data-model reference for tasks/projects/labels. |
| [calcom/cal.diy](https://github.com/calcom/cal.diy) | 47.3k | The Cal.com repo (now under this name). **The** open-source reference for calendar-provider integration, availability maths, and timezone handling. |
| [alainm23/planify](https://github.com/alainm23/planify) | 5.5k | Task manager with Todoist + CalDAV sync; useful for how tasks map onto CalDAV `VTODO`. |
| [TriliumNext/Trilium](https://github.com/TriliumNext/Trilium) | 37.3k | Hierarchical notes, local-first. |
| [streetwriters/notesnook](https://github.com/streetwriters/notesnook) | 14.4k | E2E-encrypted notes across web/desktop/mobile — the reference if encryption matters. |
| [laurent22/joplin](https://github.com/laurent22/joplin) | 55.8k | Mature multi-backend sync (WebDAV/Dropbox/OneDrive/Nextcloud). |
| [usememos/memos](https://github.com/usememos/memos) | 62.0k | Quick-capture-first note app; small, readable Go codebase. |
| [Leantime/leantime](https://github.com/Leantime/leantime) | 11.2k | Project management explicitly designed for ADHD/autism/dyslexia — worth reading for planner UX decisions. |
| [pbek/QOwnNotes](https://github.com/pbek/QOwnNotes) | 5.8k | Notes + todo with Nextcloud/CalDAV. |
| [TechbeeAT/jtxBoard](https://github.com/TechbeeAT/jtxBoard) | 660 | Journals + notes + tasks in one app, fully RFC 5545-based. A rare example of Routine's exact triad modelled on the iCal standard. |
| [rush86999/atom](https://github.com/rush86999/atom) | 819 | Self-hosted AI agent wired into calendar/tasks/Notion/Gmail — reference for the assistant layer. |

---

## B. Design resources

You already have Geist vendored under `design-system/`, so this section is about
what Geist does **not** cover: calendar surfaces, the command bar, and icons.

### Command bar (Routine's "Console")

| Repo | ★ | Notes |
| --- | --- | --- |
| [dip/cmdk](https://github.com/dip/cmdk) | 12.9k | Unstyled command menu for React. The default choice, and it pairs naturally with Geist (same design lineage as Vercel's own ⌘K). |
| [timc1/kbar](https://github.com/timc1/kbar) | 5.2k | Batteries-included ⌘K with nested actions and a shortcut registry — closer to Routine's hierarchical Console out of the box. |
| [haaarshsingh/kmenu](https://github.com/haaarshsingh/kmenu) | 830 | Smaller, opinionated, animated. |
| [asabaylus/react-command-palette](https://github.com/asabaylus/react-command-palette) | 645 | Accessibility-focused, with fuzzy matching. |
| [ospfranco/sol](https://github.com/ospfranco/sol) | 3.0k | A full macOS launcher/palette — read it for the *native* command-bar interaction model, not for code reuse. |
| [microsoft/PowerToys](https://github.com/microsoft/PowerToys) | 137.5k | Its Command Palette is the reference for an extensible, plugin-driven palette. |

### Calendar & time-blocking UI

| Repo | ★ | Notes |
| --- | --- | --- |
| [schedule-x/schedule-x](https://github.com/schedule-x/schedule-x) | 2.5k | Modern, MIT, framework-agnostic (React/Vue/Svelte/Angular) event calendar, explicitly positioned against FullCalendar. **Best starting point for a new build.** |
| [fullcalendar/fullcalendar](https://github.com/fullcalendar/fullcalendar) | 20.6k | The mature standard for drag-and-drop day/week/month views. Note the resource/timeline views live in the premium [fullcalendar-workspace](https://github.com/fullcalendar/fullcalendar-workspace) (798★) under a non-free licence. |
| [nhn/tui.calendar](https://github.com/nhn/tui.calendar) | 12.7k | Strong daily/weekly views with tasks and milestones — the closest built-in match to a planner layout. |
| [neuronetio/gantt-schedule-timeline-calendar](https://github.com/neuronetio/gantt-schedule-timeline-calendar) | 3.6k | High-performance timeline/scheduler if you want a horizontal day view. |
| [gpbl/react-day-picker](https://github.com/gpbl/react-day-picker) | 6.8k | The date picker to use for the mini-calendar / date fields. Actively maintained, highly styleable. |
| [samuelarbibe/dnd-timeline](https://github.com/samuelarbibe/dnd-timeline) | 245 | **Headless** timeline built on dnd-kit — the right shape if you want to render time blocks with your own Geist-styled markup. |

### Drag-and-drop (tasks → calendar)

| Repo | ★ | Notes |
| --- | --- | --- |
| [clauderic/dnd-kit](https://github.com/clauderic/dnd-kit) | 17.5k | The modern choice: headless, accessible, keyboard-operable — which matters for a keyboard-first app. |
| [SortableJS/Sortable](https://github.com/SortableJS/Sortable) | 31.2k | Framework-free, battle-tested list reordering. |
| [react-grid-layout/react-grid-layout](https://github.com/react-grid-layout/react-grid-layout) | 22.4k | Draggable + **resizable** grid — a viable primitive for a time-block grid and for the dashboard. |
| [Shopify/draggable](https://github.com/Shopify/draggable) | 18.5k | Well-built vanilla alternative. |
| [atlassian/react-beautiful-dnd](https://github.com/atlassian/react-beautiful-dnd) | 34.0k | **Archived — do not start here.** Listed only because it still dominates search results. |
| [Georgegriff/react-dnd-kit-tailwind-shadcn-ui](https://github.com/Georgegriff/react-dnd-kit-tailwind-shadcn-ui) | 819 | Working accessible kanban with dnd-kit + Tailwind — a useful worked example. |

### Icons

| Repo | ★ | Notes |
| --- | --- | --- |
| [lucide-icons/lucide](https://github.com/lucide-icons/lucide) | 23.8k | ISC-licensed, consistent 24px grid, per-framework packages. Sits comfortably next to Geist's own icon set. |

---

## C. Functional building blocks

### Notes & the editor (with backlinks)

| Repo | ★ | Notes |
| --- | --- | --- |
| [ueberdosis/tiptap](https://github.com/ueberdosis/tiptap) | 37.9k | Headless ProseMirror framework. Its **suggestion/mention** plugin is the mechanism for `@person`, `#task`, and `[[backlink]]`. Default recommendation. |
| [TypeCellOS/BlockNote](https://github.com/TypeCellOS/BlockNote) | 10.1k | Notion-style block editor on top of Tiptap, with slash menus and Yjs collaboration already wired. Fastest route to a Routine-like note surface. |
| [Milkdown/milkdown](https://github.com/Milkdown/milkdown) | 11.8k | Plugin-driven WYSIWYG **markdown** editor — pick this if notes must stay markdown-on-disk. |
| [toeverything/blocksuite](https://github.com/toeverything/blocksuite) | 6.0k | AFFiNE's editor toolkit; CRDT-native and local-first by construction. |
| [ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5) | 10.5k | Heavier, but the strongest collaborative-editing story if licensing suits. |
| [foambubble/foam](https://github.com/foambubble/foam) | 17.3k | Read for its **backlink/graph resolution** logic over plain markdown. |

### Calendar sync (Google / Outlook / iCloud / CalDAV)

| Repo | ★ | Notes |
| --- | --- | --- |
| [ridafkih/keeper.sh](https://github.com/ridafkih/keeper.sh) | 1.2k | **Most directly useful find.** A calendar sync tool and universal calendar MCP server aggregating Google, Outlook, Office 365, iCloud, CalDAV and ICS behind one interface — exactly Routine's integration surface, in TypeScript. |
| [calcom/cal.diy](https://github.com/calcom/cal.diy) | 47.3k | Production-grade provider adapters, OAuth flows, and availability computation. |
| [Kozea/Radicale](https://github.com/Kozea/Radicale) | 4.9k | Small, readable CalDAV/CardDAV server — the fastest way to get a local sync target for tests. |
| [pimutils/vdirsyncer](https://github.com/pimutils/vdirsyncer) | 1.9k | Two-way calendar/contact sync; read it for **conflict-resolution** strategy. |
| [bitfireAT/davx5-ose](https://github.com/bitfireAT/davx5-ose) | 2.8k | The reference CalDAV/CardDAV client implementation (Android/Kotlin). |
| [nextcloud/calendar](https://github.com/nextcloud/calendar) | 1.2k | Full RFC 5545 web calendar client. |
| [stalwartlabs/stalwart](https://github.com/stalwartlabs/stalwart) | 14.0k | Rust server fluent in CalDAV/CardDAV/JMAP/IMAP — relevant if you ever host the backend. |
| [aluxnimm/outlookcaldavsynchronizer](https://github.com/aluxnimm/outlookcaldavsynchronizer) | 1.1k | Hard-won Outlook interop edge cases. |

### iCalendar parsing & recurrence

Recurrence is where planner apps break. Do not hand-roll this.

| Repo | ★ | Notes |
| --- | --- | --- |
| [jkbrzt/rrule](https://github.com/jkbrzt/rrule) | 3.7k | RFC 5545 recurrence rules in JS/TS — expansion, `between()`, and natural-language output. Essential. |
| [kewisch/ical.js](https://github.com/kewisch/ical.js) | 1.2k | Mozilla's ICS (RFC 5545) and vCard parser; handles timezones and `VTIMEZONE` properly. |
| [adamgibbons/ics](https://github.com/adamgibbons/ics) | 787 | Lightweight ICS *generation* for Node. |
| [collective/icalendar](https://github.com/collective/icalendar) | 1.2k | The Python equivalent, if any backend tooling is Python. |
| [ical4j/ical4j](https://github.com/ical4j/ical4j) | 836 | JVM equivalent. |
| [rlanvin/php-rrule](https://github.com/rlanvin/php-rrule) | 706 | PHP equivalent. |

### Natural-language capture

| Repo | ★ | Notes |
| --- | --- | --- |
| [wanasit/chrono](https://github.com/wanasit/chrono) | 5.3k | Natural-language date parser ("tomorrow 3pm", "next tue"). This is the piece that makes a Console feel fast; multi-locale. |

### Local-first storage & sync

Routine's feel depends on instant local writes. Pick one of these deliberately —
it's the hardest decision to reverse.

| Repo | ★ | Notes |
| --- | --- | --- |
| [yjs/yjs](https://github.com/yjs/yjs) | 22.3k | The most mature CRDT; already integrated with Tiptap/BlockNote/ProseMirror. Best default if the editor drives your sync. |
| [pubkey/rxdb](https://github.com/pubkey/rxdb) | 23.3k | Local-first reactive database with pluggable replication to your own backend — no vendor lock-in. |
| [electric-sql/electric](https://github.com/electric-sql/electric) | 10.3k | Postgres→client sync. Right choice if the server of record is Postgres. |
| [loro-dev/loro](https://github.com/loro-dev/loro) | 6.0k | Rust CRDT with rich-text support and **version control / time travel** — interesting for note history. |
| [tinyplex/tinybase](https://github.com/tinyplex/tinybase) | 5.1k | Small reactive store + sync engine; low ceremony for a PWA. |
| [livestorejs/livestore](https://github.com/livestorejs/livestore) | 3.7k | Reactive SQLite with a built-in sync engine and event-sourcing model. |
| [automerge/automerge-classic](https://github.com/automerge/automerge-classic) | 14.7k | Historically important, but this is the **legacy** repo — use the current Rust-based Automerge from the same org. |
| [supabase/realtime](https://github.com/supabase/realtime) | 7.6k | Postgres changes + presence over WebSockets, if you go the hosted-Postgres route. |

### CLI / terminal references

Worth reading for keyboard-first interaction models even if you never ship a CLI.

| Repo | ★ | Notes |
| --- | --- | --- |
| [pimutils/khal](https://github.com/pimutils/khal) | 3.0k | CLI calendar — a masterclass in dense, keyboard-only date UX. |
| [pimutils/todoman](https://github.com/pimutils/todoman) | 588 | Standards-based (`VTODO`) CLI task manager. |
| [orgzly/orgzly-android](https://github.com/orgzly/orgzly-android) | 2.8k | Outliner unifying notes and todos. |

---

## Suggested stack for this repo

Given Geist is already vendored and `design-system/pwa/` exists, the
lowest-friction assembly is:

1. **Shell** — the existing Geist + PWA layer.
2. **Command bar** — `cmdk` for the primitive, `chrono` to parse what's typed into it.
3. **Calendar** — `schedule-x` if you want views for free; `dnd-timeline` + `dnd-kit`
   if you want to render time blocks with your own Geist-token markup. The second
   costs more and looks more like Routine.
4. **Notes** — `BlockNote` (Tiptap underneath) with the suggestion plugin for
   `@`/`[[ ]]` linking.
5. **Recurrence** — `rrule` plus `ical.js`, from day one.
6. **Sync** — `keeper.sh` for provider aggregation; `rxdb` or `yjs` for local-first
   state depending on whether tasks or notes dominate your data model.

## Gaps worth knowing about

- **No OSS Routine clone exists.** Super Productivity is the nearest whole-app
  analogue, and it does not have the notes or Console layers.
- **Free calendar libraries under-serve the day view.** FullCalendar's richest
  scheduler views are premium; `schedule-x` and headless `dnd-timeline` are the
  free paths.
- **The people/meeting-notes layer has no obvious library.** Contact resolution and
  attaching notes to attendees will be custom work; `jtxBoard` is the only surveyed
  project modelling journals+notes+tasks together, and it's Android-only.
