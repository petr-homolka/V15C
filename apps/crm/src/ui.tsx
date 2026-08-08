/**
 * Stavební kusy rozhraní.
 *
 * Záměr: **aplikace, ne tabulka.** Jedna věc na obrazovce, hodně vzduchu,
 * vlasové linky místo rámečků, barva jen tam, kde nese informaci.
 *
 * Pravidla, kterých se držím:
 *  – plochu drží `--ds-background-200`, karty `--ds-background-100`;
 *  – oddělovač je vlasová linka uvnitř karty, ne rámeček kolem každého řádku;
 *  – dotyková plocha nejmíň 44 px;
 *  – barevný štítek nejvýš jeden na řádek, jinak se přestane číst.
 */

import type { ReactNode } from 'react'

/* --- plocha --------------------------------------------------------------- */

export function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-[calc(3rem+env(safe-area-inset-bottom))]">
      {children}
    </div>
  )
}

/** Velký nadpis, jak je na mobilu zvykem — ne lišta s drobným písmem. */
export function LargeTitle({
  title,
  subtitle,
  right,
  back,
}: {
  title: string
  subtitle?: string | null
  right?: ReactNode
  back?: () => void
}) {
  return (
    <header className="pb-4 pt-2">
      {back ? (
        <button
          type="button"
          onClick={back}
          className="text-copy-14 -ml-1 mb-2 flex h-8 items-center gap-1 rounded-lg pr-2 text-[var(--ds-blue-700)]"
        >
          <Chevron dir="left" /> Zpět
        </button>
      ) : null}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-heading-32 leading-tight text-[var(--ds-gray-1000)]">{title}</h1>
          {subtitle ? (
            <p className="text-copy-14 pt-1 text-[var(--ds-gray-900)]">{subtitle}</p>
          ) : null}
        </div>
        {right}
      </div>
    </header>
  )
}

/** Nadpis skupiny. Malý, tichý, bez rámečku. */
export function GroupTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-1 pb-2 pt-6">
      <h2 className="text-label-13 text-[var(--ds-gray-900)]">{children}</h2>
      {action}
    </div>
  )
}

/** Karta se seskupenými řádky — základní stavební prvek obrazovky. */
export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-[var(--ds-background-100)] shadow-[var(--ds-shadow-border-small)]">
      {children}
    </div>
  )
}

export function Divider() {
  return <div className="ml-4 h-px bg-[var(--ds-gray-alpha-400)]" />
}

/**
 * Řádek. Vodorovné dělení je záměrně **za** ikonou, aby seznam držel
 * pohromadě a nerozpadl se na krabičky.
 */
export function Row({
  title,
  subtitle,
  meta,
  accessory,
  leading,
  onClick,
  dimmed,
  wrapTitle,
}: {
  title: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  accessory?: ReactNode
  leading?: ReactNode
  onClick?: () => void
  dimmed?: boolean
  /** Úkol se nemá zkracovat — jeho text je to jediné, co ho odlišuje. */
  wrapTitle?: boolean
}) {
  const rest = (
    <>
      <div className="min-w-0 flex-1 py-3">
        <div
          className={`text-copy-16 ${wrapTitle ? '' : 'truncate'} ${
            dimmed ? 'text-[var(--ds-gray-700)] line-through' : 'text-[var(--ds-gray-1000)]'
          }`}
        >
          {title}
        </div>
        {subtitle ? (
          <div className="text-copy-14 truncate pt-0.5 text-[var(--ds-gray-900)]">{subtitle}</div>
        ) : null}
      </div>
      {meta ? <div className="shrink-0 pl-2">{meta}</div> : null}
      {accessory ?? (onClick ? <Chevron /> : null)}
    </>
  )

  const body = (
    <>
      {leading}
      {rest}
    </>
  )

  const cls = 'flex min-h-[52px] w-full items-center gap-3 px-4 text-left'

  // Když je vlevo vlastní tlačítko (odškrtnutí úkolu), nesmí být tlačítkem
  // celý řádek — tlačítko v tlačítku prohlížeč neumí.
  if (onClick && leading) {
    return (
      <div className={cls}>
        {leading}
        <button
          type="button"
          onClick={onClick}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          {rest}
        </button>
      </div>
    )
  }

  return onClick ? (
    <button type="button" onClick={onClick} className={`${cls} active:bg-[var(--ds-gray-100)]`}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  )
}

export function Chevron({ dir = 'right' }: { dir?: 'right' | 'left' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-[var(--ds-gray-700)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={dir === 'right' ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} />
    </svg>
  )
}

/** Kolečko s iniciálami — v seznamu rodin nese víc než ikona složky. */
export function Avatar({ text, tone = 'gray' }: { text: string; tone?: 'gray' | 'blue' | 'amber' }) {
  const bg =
    tone === 'blue'
      ? 'bg-[var(--ds-blue-200)] text-[var(--ds-blue-900)]'
      : tone === 'amber'
        ? 'bg-[var(--ds-amber-200)] text-[var(--ds-amber-900)]'
        : 'bg-[var(--ds-gray-200)] text-[var(--ds-gray-900)]'
  // Jen slova, která začínají písmenem — „Markovi — pěstounská péče" jinak
  // dá iniciály „M—".
  const initials = text
    .split(/[\s—-]+/)
    .filter((w) => /^\p{L}/u.test(w))
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
  return (
    <div className={`text-label-14 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg}`}>
      {initials}
    </div>
  )
}

/* --- ovládání ------------------------------------------------------------- */

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
    <div className="flex gap-1 rounded-xl bg-[var(--ds-gray-200)] p-1">
      {options.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`text-button-14 h-8 flex-1 rounded-lg ${
            key === value
              ? 'bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-[var(--ds-shadow-small)]'
              : 'text-[var(--ds-gray-900)]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function Chip({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-copy-14 shrink-0 whitespace-nowrap rounded-full bg-[var(--ds-background-100)] px-3.5 py-2 text-[var(--ds-gray-1000)] shadow-[var(--ds-shadow-border-small)] active:bg-[var(--ds-gray-100)]"
    >
      {children}
    </button>
  )
}

export type Tone = 'neutral' | 'blue' | 'amber' | 'red' | 'green'

const TONE: Record<Tone, string> = {
  neutral: 'text-[var(--ds-gray-900)]',
  blue: 'text-[var(--ds-blue-700)]',
  amber: 'text-[var(--ds-amber-900)]',
  red: 'text-[var(--ds-red-700)]',
  green: 'text-[var(--ds-green-700)]',
}

/** Stav se píše textem v barvě, ne bublinou. Bublin bylo v seznamu moc. */
export function Meta({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`text-copy-14 ${TONE[tone]}`}>{children}</span>
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-copy-14 px-4 py-4 text-[var(--ds-gray-900)]">{children}</p>
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

export function daysUntil(iso: string, today = new Date()): number {
  return Math.round(
    (new Date(iso).setHours(0, 0, 0, 0) - new Date(today).setHours(0, 0, 0, 0)) / 86_400_000,
  )
}

/**
 * Jak se termín říká lidsky. Po termínu se to napíše, ale nekřičí se —
 * je to informace, ne výtka (dok. 16).
 */
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

export const dueTone = (iso: string): Tone => (daysUntil(iso) < 0 ? 'red' : 'neutral')

/** 5 dětí / 2 děti / 1 dítě — bez tohohle to v češtině skřípe. */
export function childCountLabel(n: number): string {
  if (n === 0) return 'bez dítěte'
  if (n === 1) return '1 dítě'
  if (n < 5) return `${n} děti`
  return `${n} dětí`
}
