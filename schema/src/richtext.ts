/**
 * Blokový editor a formát, ve kterém se ukládá text.
 *
 * Vzor je Routine (a Notion): **blokový editor s „/“ příkazy**. V Routine se
 * tomu říká přesně takhle — „/“ příkaz vypíše na začátku řádku nabídku bloků,
 * každý blok má vlevo úchyt `⋮⋮` na výběr a přetažení, nadpisy se dají
 * sbalit a vedle „/“ fungují markdownové zkratky (`#`, `##`, `1.`, `-`, `>`).
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ DŮSLEDEK PRO MODEL, KTERÝ SE SNADNO PŘEHLÉDNE                       │
 * │                                                                     │
 * │ Blokový editor NEUKLÁDÁ text jako string. `DocumentDraft.currentText`│
 * │ byl string — kdyby tak zůstal, každé uložení by rozházelo strukturu  │
 * │ a auditní stopa „co přepsal člověk“ (dok. 14) by porovnávala jinak   │
 * │ zformátovaný text, ne obsah.                                        │
 * │                                                                     │
 * │ Ukládá se proto OBOJÍ:                                              │
 * │   `blocks`    — pravda, strukturovaně;                              │
 * │   `plainText` — odvozený mirror pro hledání, vektory, PDF a diff.    │
 * │ Mirror se generuje z bloků, nikdy naopak.                           │
 * └─────────────────────────────────────────────────────────────────────┘
 */

import type { Id, IsoDateTime } from './common'

/* ------------------------------------------------------------------ */
/* Formát obsahu                                                       */
/* ------------------------------------------------------------------ */

export interface RichText {
  format: 'blocks'
  /** Verze schématu bloků — kvůli budoucí migraci obsahu. */
  version: 1
  blocks: Block[]
  /** Odvozeno z `blocks`. Nikdy se needituje samostatně. */
  plainText: string
}

export interface Block {
  id: Id
  type: BlockType
  /** Vložený text bloku s formátováním. */
  spans: Span[]
  /** Vnořené bloky — odsazení v seznamech a obsah sbalitelné sekce. */
  children: Block[]
  attrs: BlockAttrs
}

export type BlockType =
  | 'paragraph'
  | 'heading1' | 'heading2' | 'heading3'
  | 'bulletList' | 'numberedList' | 'todo'
  | 'quote' | 'callout' | 'divider'
  | 'code' | 'table'
  | 'image' | 'file'
  /** Odkaz na záznam v systému — viz `mention` níže. */
  | 'mention'
  /** Mezera v konceptu: `[DOPLNIT: …]` — viditelná i v exportu (dok. 14). */
  | 'gap'
  /** Věta z knihovny, aby bylo poznat, co je předvyplněné (dok. 07). */
  | 'sentence'
  /** Dopočítaná hodnota — needitovatelná, přepočítá se (dok. 07). */
  | 'computed'

export interface BlockAttrs {
  checked?: boolean               // todo
  collapsed?: boolean             // sbalený nadpis — Routine to umí u H1–H3
  language?: string               // code
  calloutTone?: 'info' | 'warning' | 'note'
  documentId?: Id                 // image, file
  /** U `mention`: na co se odkazuje. */
  refType?: string
  refId?: Id
  /** U `gap`: co se má doplnit. */
  gapLabel?: string
  /** U `sentence`: která věta z knihovny a v jakém tvaru. */
  sentenceTemplateId?: Id
  /** U `computed`: podle čeho se to spočítalo. */
  computedFrom?: string
  columns?: number                // table
}

export interface Span {
  text: string
  marks?: Mark[]
  /** Odkaz — `href` u externího, `refId` u vnitřního. */
  href?: string
}

export type Mark = 'bold' | 'italic' | 'underline' | 'strike' | 'code' | 'highlight'

/* ------------------------------------------------------------------ */
/* Katalog „/“ příkazů                                                 */
/* ------------------------------------------------------------------ */

export interface SlashCommand {
  /** Co uživatel napíše za „/“. Česky, protože pracovníci píšou česky. */
  keyword: string
  aliases: string[]
  label: string
  /** Ikona — jméno z lucide, aby se nekreslilo nic vlastního (dok. 19). */
  icon: string
  group: SlashGroup
  inserts: BlockType
  /** Markdownová zkratka, která dělá totéž bez otevírání nabídky. */
  markdown: string | null
  /** Kde ten příkaz vůbec dává smysl. */
  contexts: EditorContext[]
}

export type SlashGroup = 'text' | 'lists' | 'blocks' | 'spis' | 'ai'

/**
 * Kontext editoru. Není to kosmetika: v poznámce nemá co dělat „dopočítaná
 * hodnota z dohody“ a v knize života dítěte nemá co dělat Eli (dok. 17).
 */
export type EditorContext =
  | 'note' | 'plan' | 'report' | 'authority_reply' | 'message' | 'life_book'

const ALL_TEXT: EditorContext[] = ['note', 'plan', 'report', 'authority_reply', 'message', 'life_book']

export const SLASH_COMMANDS: readonly SlashCommand[] = [
  /* --- text --- */
  { keyword: 'text', aliases: ['odstavec', 'p'], label: 'Text', icon: 'type',
    group: 'text', inserts: 'paragraph', markdown: null, contexts: ALL_TEXT },
  { keyword: 'nadpis1', aliases: ['h1', 'nadpis'], label: 'Nadpis 1', icon: 'heading-1',
    group: 'text', inserts: 'heading1', markdown: '# ', contexts: ALL_TEXT },
  { keyword: 'nadpis2', aliases: ['h2'], label: 'Nadpis 2', icon: 'heading-2',
    group: 'text', inserts: 'heading2', markdown: '## ', contexts: ALL_TEXT },
  { keyword: 'nadpis3', aliases: ['h3'], label: 'Nadpis 3', icon: 'heading-3',
    group: 'text', inserts: 'heading3', markdown: '### ', contexts: ALL_TEXT },

  /* --- seznamy --- */
  { keyword: 'seznam', aliases: ['odrazky', 'ul'], label: 'Odrážky', icon: 'list',
    group: 'lists', inserts: 'bulletList', markdown: '- ', contexts: ALL_TEXT },
  { keyword: 'cislovany', aliases: ['ol', 'cislo'], label: 'Číslovaný seznam', icon: 'list-ordered',
    group: 'lists', inserts: 'numberedList', markdown: '1. ', contexts: ALL_TEXT },
  { keyword: 'ukol', aliases: ['todo', 'zaskrtavatko'], label: 'Zaškrtávací položka', icon: 'square-check',
    group: 'lists', inserts: 'todo', markdown: '[] ', contexts: ALL_TEXT },

  /* --- bloky --- */
  { keyword: 'citace', aliases: ['quote'], label: 'Citace', icon: 'quote',
    group: 'blocks', inserts: 'quote', markdown: '> ', contexts: ALL_TEXT },
  { keyword: 'zvyrazneni', aliases: ['callout', 'poznamka'], label: 'Zvýrazněný blok', icon: 'info',
    group: 'blocks', inserts: 'callout', markdown: null, contexts: ALL_TEXT },
  { keyword: 'oddelovac', aliases: ['linka', 'hr'], label: 'Oddělovač', icon: 'minus',
    group: 'blocks', inserts: 'divider', markdown: '---', contexts: ALL_TEXT },
  { keyword: 'tabulka', aliases: ['table'], label: 'Tabulka', icon: 'table',
    group: 'blocks', inserts: 'table', markdown: null, contexts: ['plan', 'report', 'authority_reply'] },
  { keyword: 'kod', aliases: ['code'], label: 'Kód', icon: 'code',
    group: 'blocks', inserts: 'code', markdown: '```', contexts: ['note'] },
  { keyword: 'obrazek', aliases: ['foto', 'image'], label: 'Obrázek', icon: 'image',
    group: 'blocks', inserts: 'image', markdown: null, contexts: ALL_TEXT },
  { keyword: 'soubor', aliases: ['priloha', 'dokument'], label: 'Soubor ze spisu', icon: 'paperclip',
    group: 'blocks', inserts: 'file', markdown: null, contexts: ALL_TEXT },

  /* --- spis: tohle je to, co odlišuje náš editor od obecného --- */
  { keyword: 'osoba', aliases: ['pestoun', 'zminka'], label: 'Odkaz na osobu', icon: 'user',
    group: 'spis', inserts: 'mention', markdown: '@', contexts: ['note', 'plan', 'report', 'authority_reply', 'message'] },
  { keyword: 'dite', aliases: [], label: 'Odkaz na dítě', icon: 'baby',
    group: 'spis', inserts: 'mention', markdown: '@', contexts: ['note', 'plan', 'report', 'authority_reply', 'message'] },
  { keyword: 'navsteva', aliases: ['styk', 'kontakt'], label: 'Odkaz na osobní styk', icon: 'footprints',
    group: 'spis', inserts: 'mention', markdown: null, contexts: ['plan', 'report', 'authority_reply'] },
  { keyword: 'dopocet', aliases: ['hodnota', 'udaj'], label: 'Dopočítaná hodnota', icon: 'calculator',
    group: 'spis', inserts: 'computed', markdown: null, contexts: ['plan', 'report', 'authority_reply'] },
  { keyword: 'veta', aliases: ['knihovna'], label: 'Věta z knihovny', icon: 'library',
    group: 'spis', inserts: 'sentence', markdown: null, contexts: ['plan', 'report', 'authority_reply'] },
  { keyword: 'doplnit', aliases: ['mezera', 'gap'], label: 'Místo k doplnění', icon: 'circle-dashed',
    group: 'spis', inserts: 'gap', markdown: null, contexts: ['plan', 'report', 'authority_reply'] },

  /* --- Eli --- */
  { keyword: 'eli', aliases: ['ai', 'napoveda'], label: 'Zeptat se Eli', icon: 'sparkles',
    group: 'ai', inserts: 'paragraph', markdown: null,
    // V knize života dítěte Eli není (dok. 17) — a v odpovědi úřadu jen jako koncept.
    contexts: ['note', 'plan', 'report', 'authority_reply'] },
  { keyword: 'diktovat', aliases: ['nahrat', 'mikrofon'], label: 'Diktovat', icon: 'mic',
    group: 'ai', inserts: 'paragraph', markdown: null, contexts: ['note', 'plan', 'report'] },
] as const

/* ------------------------------------------------------------------ */
/* Chování editoru                                                     */
/* ------------------------------------------------------------------ */

/**
 * Co editor umí, jako data — aby se to dalo zapnout a vypnout na úrovni
 * organizace a otestovat, místo aby to bylo poschovávané v komponentách.
 */
export interface EditorCapabilities {
  /** „/“ na začátku řádku otevře nabídku bloků. */
  slashMenu: boolean
  /** Markdownové zkratky (`#`, `1.`, `-`, `>`, `---`). */
  markdownShortcuts: boolean
  /** Úchyt `⋮⋮` vlevo u bloku: výběr, přetažení, kontextová nabídka. */
  blockHandle: boolean
  /** Panel nad označeným textem (tučné, kurzíva, odkaz, barva). */
  bubbleMenu: boolean
  /** Sbalování nadpisů H1–H3 se vším pod nimi. */
  collapsibleHeadings: boolean
  /** Výběr více bloků ⇧↑ / ⇧↓ a jejich hromadné přesunutí. */
  multiBlockSelection: boolean
  /** @ pro odkaz na osobu, dítě, dokument. */
  mentions: boolean
  /** Kolik verzí obsahu se drží; u konceptů to je auditní stopa (dok. 14). */
  revisionHistory: boolean
}

export const DEFAULT_EDITOR_CAPABILITIES: EditorCapabilities = {
  slashMenu: true,
  markdownShortcuts: true,
  blockHandle: true,
  bubbleMenu: true,
  collapsibleHeadings: true,
  multiBlockSelection: true,
  mentions: true,
  revisionHistory: true,
}

/**
 * Klávesové zkratky. Vycházejí z toho, co lidé znají z Notionu a Routine —
 * vymýšlet vlastní by znamenalo učit uživatele něco, co nikde jinde neplatí.
 */
export const EDITOR_SHORTCUTS: ReadonlyArray<{ keys: string; action: string }> = [
  { keys: 'Mod-b', action: 'tučně' },
  { keys: 'Mod-i', action: 'kurzíva' },
  { keys: 'Mod-u', action: 'podtrženě' },
  { keys: 'Mod-e', action: 'kód' },
  { keys: 'Mod-k', action: 'odkaz' },
  { keys: 'Mod-Shift-x', action: 'přeškrtnout' },
  { keys: 'Mod-Alt-1', action: 'nadpis 1' },
  { keys: 'Mod-Alt-2', action: 'nadpis 2' },
  { keys: 'Mod-Alt-3', action: 'nadpis 3' },
  { keys: 'Mod-Shift-8', action: 'odrážky' },
  { keys: 'Mod-Shift-7', action: 'číslovaný seznam' },
  { keys: 'Mod-Shift-9', action: 'zaškrtávací položka' },
  { keys: 'Tab', action: 'odsadit blok' },
  { keys: 'Shift-Tab', action: 'zrušit odsazení' },
  { keys: 'Shift-ArrowUp', action: 'rozšířit výběr bloků' },
  { keys: 'Shift-ArrowDown', action: 'rozšířit výběr bloků' },
  { keys: 'Mod-Shift-ArrowUp', action: 'posunout blok výš' },
  { keys: 'Mod-Shift-ArrowDown', action: 'posunout blok níž' },
  { keys: 'Mod-z', action: 'zpět' },
  { keys: 'Mod-Shift-z', action: 'znovu' },
]

/**
 * Kterou knihovnu použít: **TipTap** (nad ProseMirror). Má oficiální
 * blokovou šablonu, `@tiptap/extension-drag-handle-react` pro úchyt bloku
 * a je udržovaná — což je celé zadání z dok. 19 sekce 7: žádná vlastní
 * knihovna tam, kde existuje udržovaná.
 *
 * Ikony: **lucide** — jména jsou v `SlashCommand.icon`.
 *
 * Co se z TipTapu NEBERE: jeho placené cloudové doplňky (spolupráce v reálném
 * čase, AI). Spolupráci nepotřebujeme — spis píše jeden autor a záznamy jsou
 * append-only (dok. 02), takže by to byla složitost bez užitku.
 */
export const EDITOR_STACK = {
  engine: 'tiptap',
  icons: 'lucide',
  dragHandle: '@tiptap/extension-drag-handle-react',
  avoid: ['realtime collaboration', 'tiptap cloud AI'],
} as const

/** Prázdný obsah — `null` by znamenal „nevyplněno“, což je jiný stav. */
export function emptyRichText(): RichText {
  return { format: 'blocks', version: 1, blocks: [], plainText: '' }
}
