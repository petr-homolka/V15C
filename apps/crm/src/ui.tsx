/**
 * Stavební kusy rozhraní.
 *
 * ┌───────────────────────────────────────────────────────────────────┐
 * │ TŘI PRAVIDLA, ZE KTERÝCH VYCHÁZÍ VŠECHNO OSTATNÍ                  │
 * │                                                                   │
 * │ 1. **Plochu drží šeď, ne barva.** Podklad stránky je zapuštěný,   │
 * │    karta je světlá a ohraničená vlasovou linkou. Žádné velké      │
 * │    stíny a žádné barevné bloky — ty dělají z aplikace plakát.     │
 * │                                                                   │
 * │ 2. **Barva něco znamená, jinak tam není.** Fialová je jen na      │
 * │    hlavní akci, aktivní položku a odkaz. Červená a jantarová      │
 * │    nesou termín. Nic dalšího barevné není.                        │
 * │                                                                   │
 * │ 3. **Hustota je pracovní, ne prezentační.** Řádek 44 px, popisek  │
 * │    13 px šedý, hodnota 14 px tmavá. Klíčová osoba se dívá na      │
 * │    dvacet rodin, ne na jednu.                                     │
 * └───────────────────────────────────────────────────────────────────┘
 *
 * Vzhled staví na tokenech Geistu (CLAUDE.md) — v kódu není jediný hex,
 * takže tmavý režim vychází sám.
 */

import { formatUidForReading } from '../../../schema/src/index'
import type { ReactNode } from 'react'

/* --- plocha --------------------------------------------------------------- */

export function Screen({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div
      className={`mx-auto w-full ${wide ? 'max-w-6xl' : 'max-w-4xl'} px-4 pb-16 pt-4 sm:px-6`}
    >
      {children}
    </div>
  )
}

/** Hlavička obrazovky: drobná drobečka, název, popis a akce vpravo. */
export function PageHead({
  title,
  subtitle,
  back,
  actions,
}: {
  title: string
  subtitle?: string | null
  back?: () => void
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 pb-5">
      <div className="min-w-0">
        {back ? (
          <button
            type="button"
            onClick={back}
            className="text-copy-13 -ml-1 mb-1.5 flex h-6 items-center gap-1 text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)]"
          >
            <Chevron dir="left" /> Zpět
          </button>
        ) : null}
        <h1 className="text-heading-24 truncate text-[var(--ds-gray-1000)]">{title}</h1>
        {subtitle ? (
          <p className="text-copy-14 pt-0.5 text-[var(--ds-gray-900)]">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  )
}

/**
 * Karta. Volitelně s vlastní hlavičkou — v ní je název a akce, oddělené
 * linkou. Tohle je nosný prvek celé aplikace.
 */
export function Card({
  title,
  action,
  children,
  footer,
  padded,
  table,
}: {
  title?: string
  action?: ReactNode
  children: ReactNode
  /** Řádek pod obsahem — počet záznamů, stránkování. */
  footer?: ReactNode
  /** Pro obsah, který není seznam řádků (text, mřížka). */
  padded?: boolean
  /** Karta, ve které je tabulka — KtUI jí odebere vnitřní odsazení. */
  table?: boolean
}) {
  return (
    <section className={`kt-card ${table ? 'kt-card-table' : ''}`}>
      {title ? (
        <header className="kt-card-header">
          <h2 className="kt-card-title">{title}</h2>
          {action ? <div className="kt-card-toolbar">{action}</div> : null}
        </header>
      ) : null}
      {padded ? <div className="kt-card-content">{children}</div> : children}
      {footer ? <footer className="kt-card-footer">{footer}</footer> : null}
    </section>
  )
}

/** Mřížka karet: na mobilu pod sebou, na širokém displeji dva sloupce. */
export function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2 lg:items-start">{children}</div>
}

export function Stack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>
}

export function Divider() {
  return <div className="h-px bg-[var(--ds-gray-alpha-400)]" />
}

/* --- řádky ---------------------------------------------------------------- */

/**
 * Dvojice popisek — hodnota. Na úzkém displeji pod sebou, na širokém vedle
 * sebe: popisek v pevném sloupci, hodnota za ním. Tak se dá karta číst svisle
 * jako formulář, ne jako odstavec.
 */
export function InfoRow({
  label,
  children,
  action,
}: {
  label: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-[var(--ds-gray-alpha-400)] px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="text-copy-13 text-[var(--ds-gray-900)] sm:w-40 sm:shrink-0">{label}</div>
      <div className="text-copy-14 min-w-0 flex-1 text-[var(--ds-gray-1000)]">{children}</div>
      {action}
    </div>
  )
}

/** Klikatelný řádek seznamu uvnitř karty. */
export function Row({
  title,
  subtitle,
  meta,
  leading,
  onClick,
  wrapTitle,
}: {
  title: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  leading?: ReactNode
  onClick?: () => void
  wrapTitle?: boolean
}) {
  const inner = (
    <>
      {leading}
      <div className="min-w-0 flex-1">
        <div className={`text-copy-14 ${wrapTitle ? '' : 'truncate'} text-[var(--ds-gray-1000)]`}>
          {title}
        </div>
        {subtitle ? (
          <div className="text-copy-13 truncate pt-0.5 text-[var(--ds-gray-900)]">{subtitle}</div>
        ) : null}
      </div>
      {meta ? <div className="shrink-0 pl-2">{meta}</div> : null}
      {onClick ? <Chevron /> : null}
    </>
  )
  const cls =
    'flex w-full items-center gap-3 border-b border-[var(--ds-gray-alpha-400)] px-4 py-2.5 text-left last:border-0'
  return onClick ? (
    <button type="button" onClick={onClick} className={`${cls} hover:bg-[var(--ds-gray-100)]`}>
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  )
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-copy-14 px-4 py-5 text-[var(--ds-gray-900)]">{children}</p>
}

/* --- tabulka -------------------------------------------------------------- */

/**
 * Tabulka pro širší displej. Na mobilu se nepoužívá — tam je seznam řádků,
 * protože šest sloupců na 390 px není tabulka, ale hlavolam.
 */
export function Table({
  columns,
  children,
}: {
  columns: Array<{ label: string; align?: 'right'; hide?: 'sm' | 'md' }>
  children: ReactNode
}) {
  return (
    <div className="kt-table-wrapper kt-scrollable">
      <table className="kt-table kt-table-border">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.label}
                scope="col"
                className={`${c.align === 'right' ? 'text-right' : ''} ${
                  c.hide === 'sm' ? 'hidden sm:table-cell' : c.hide === 'md' ? 'hidden md:table-cell' : ''
                }`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Tr({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <tr onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>
      {children}
    </tr>
  )
}

export function Td({
  children,
  align,
  hide,
  muted,
}: {
  children: ReactNode
  align?: 'right'
  hide?: 'sm' | 'md'
  muted?: boolean
}) {
  return (
    <td
      className={`${align === 'right' ? 'text-right tabular-nums' : ''} ${
        hide === 'sm' ? 'hidden sm:table-cell' : hide === 'md' ? 'hidden md:table-cell' : ''
      } ${muted ? 'text-[var(--muted-foreground)]' : ''}`}
    >
      {children}
    </td>
  )
}

/* --- ovládání ------------------------------------------------------------- */

export function Button({
  children,
  onClick,
  variant = 'secondary',
  size = 'md',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
}) {
  const look =
    variant === 'primary'
      ? 'kt-btn-primary'
      : variant === 'ghost'
        ? 'kt-btn-ghost'
        : 'kt-btn-outline'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`kt-btn ${look} ${size === 'sm' ? 'kt-btn-sm' : ''}`}
    >
      {children}
    </button>
  )
}

export function Field({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="kt-input"
    />
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: Array<[T, string]>
  onChange: (v: T) => void
}) {
  return (
    <div className="kt-tabs kt-tabs-line">
      {options.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          data-kt-tab-toggle
          aria-selected={key === value}
          className={`kt-tab-toggle ${key === value ? "active" : ""}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/* --- štítky --------------------------------------------------------------- */

export type Tone = 'neutral' | 'purple' | 'amber' | 'red' | 'green'

const CHIP: Record<Tone, string> = {
  neutral: 'kt-badge-secondary',
  purple: 'kt-badge-primary',
  amber: 'kt-badge-warning',
  red: 'kt-badge-destructive',
  green: 'kt-badge-success',
}

/**
 * Štítek stavu — KtUI `kt-badge` v obrysové variantě. Plná výplň by v tabulce
 * o dvaceti řádcích udělala pruhy; obrys nese barvu, ale nekřičí.
 */
export function Chip({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`kt-badge kt-badge-sm kt-badge-outline ${CHIP[tone]}`}>{children}</span>
  )
}

const TEXT_TONE: Record<Tone, string> = {
  neutral: 'text-[var(--ds-gray-900)]',
  purple: 'text-[var(--ds-purple-700)]',
  amber: 'text-[var(--ds-amber-900)]',
  red: 'text-[var(--ds-red-700)]',
  green: 'text-[var(--ds-green-700)]',
}

export function Meta({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`text-copy-13 ${TEXT_TONE[tone]}`}>{children}</span>
}

/**
 * Termín. **Štítek jen tehdy, když hoří** — po termínu nebo do čtrnácti dnů.
 * Datum za půl roku je údaj, ne varování, a bublina kolem něj by z tabulky
 * udělala vánoční stromek.
 */
export function Due({ iso }: { iso: string | null }) {
  if (!iso) return <span className="text-copy-13 text-[var(--ds-gray-700)]">—</span>
  const tone = dueTone(iso)
  if (tone === 'neutral') return <Meta>{formatDate(iso)}</Meta>
  return <Chip tone={tone}>{dueLabel(iso)}</Chip>
}

export function Chevron({ dir = 'right' }: { dir?: 'right' | 'left' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-[var(--ds-gray-700)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={dir === 'right' ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} />
    </svg>
  )
}

/* --- formáty -------------------------------------------------------------- */

const DATE = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' })
const SHORT = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'numeric' })
const TIME = new Intl.DateTimeFormat('cs-CZ', { hour: 'numeric', minute: '2-digit' })
const WEEKDAY = new Intl.DateTimeFormat('cs-CZ', { weekday: 'long' })

export const formatDate = (iso: string | null): string => (iso ? DATE.format(new Date(iso)) : '—')
export const formatShort = (iso: string): string => SHORT.format(new Date(iso))
export const formatTime = (iso: string): string => TIME.format(new Date(iso))
export const formatWeekday = (d: Date): string => {
  const w = WEEKDAY.format(d)
  return w.charAt(0).toUpperCase() + w.slice(1)
}

/** UID pro čtení: `u6t 4f3k`. Jen v profilu (dok. 25). */
export const formatUid = (uid: string): string => formatUidForReading(uid)

export function daysUntil(iso: string, today = new Date()): number {
  return Math.round(
    (new Date(iso).setHours(0, 0, 0, 0) - new Date(today).setHours(0, 0, 0, 0)) / 86_400_000,
  )
}

export function dueLabel(iso: string): string {
  const d = daysUntil(iso)
  if (d < -1) return `${Math.abs(d)} dní po termínu`
  if (d === -1) return 'včera'
  if (d === 0) return 'dnes'
  if (d === 1) return 'zítra'
  if (d < 7) return `za ${d} dny`
  if (d < 32) return `za ${d} dní`
  return formatShort(iso)
}

/** Krátký štítek do seznamu — přesná čísla patří do profilu. */
export function dueBadge(iso: string): string {
  const d = daysUntil(iso)
  if (d < 0) return 'po termínu'
  if (d === 0) return 'dnes'
  if (d === 1) return 'zítra'
  return `za ${d} dní`
}

export const dueTone = (iso: string): Tone => {
  const d = daysUntil(iso)
  if (d < 0) return 'red'
  if (d <= 14) return 'amber'
  return 'neutral'
}

export function childCountLabel(n: number): string {
  if (n === 0) return 'bez dítěte'
  if (n === 1) return '1 dítě'
  if (n < 5) return `${n} děti`
  return `${n} dětí`
}
