/**
 * Základní kusy rozhraní. Žádná knihovna komponent — jen tokeny a utility
 * z design systému (CLAUDE.md): barvy, stíny ani rádiusy se nepíšou natvrdo.
 */

import type { ReactNode } from 'react'

/* --- obrazovka ------------------------------------------------------------ */

export function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col pb-[env(safe-area-inset-bottom)]">
      {children}
    </div>
  )
}

export function AppBar({
  title,
  subtitle,
  left,
  right,
}: {
  title: string
  subtitle?: string | null
  left?: ReactNode
  right?: ReactNode
}) {
  return (
    <header className="app-bar sticky top-0 z-10 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center gap-3 px-4 py-3">
        {left}
        <div className="min-w-0 flex-1">
          <h1 className="text-heading-16 truncate text-[var(--ds-gray-1000)]">{title}</h1>
          {subtitle ? (
            <p className="text-copy-13 truncate text-[var(--ds-gray-900)]">{subtitle}</p>
          ) : null}
        </div>
        {right}
      </div>
      <div className="h-px w-full bg-[var(--ds-gray-alpha-400)]" />
    </header>
  )
}

export function Section({ title, action, children }: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="px-4 pt-6">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-label-14 text-[var(--ds-gray-900)]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

/* --- seznamy -------------------------------------------------------------- */

export function List({ children }: { children: ReactNode }) {
  return (
    <div className="material-small divide-y divide-[var(--ds-gray-alpha-400)] overflow-hidden bg-[var(--ds-background-100)]">
      {children}
    </div>
  )
}

export function Row({
  title,
  subtitle,
  trailing,
  onClick,
}: {
  title: ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
  onClick?: () => void
}) {
  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <div className="text-label-15 truncate text-[var(--ds-gray-1000)]">{title}</div>
        {subtitle ? (
          <div className="text-copy-13 truncate text-[var(--ds-gray-900)]">{subtitle}</div>
        ) : null}
      </div>
      {trailing}
    </>
  )
  if (!onClick) return <div className="flex items-center gap-3 px-4 py-3">{inner}</div>
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-[var(--ds-gray-100)]"
    >
      {inner}
    </button>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="text-copy-14 px-4 py-6 text-[var(--ds-gray-900)]">{children}</p>
  )
}

/* --- štítky --------------------------------------------------------------- */

export type Tone = 'neutral' | 'blue' | 'amber' | 'red' | 'green' | 'purple'

const TONE: Record<Tone, string> = {
  neutral: 'bg-[var(--ds-gray-200)] text-[var(--ds-gray-900)]',
  blue: 'bg-[var(--ds-blue-200)] text-[var(--ds-blue-900)]',
  amber: 'bg-[var(--ds-amber-200)] text-[var(--ds-amber-900)]',
  red: 'bg-[var(--ds-red-200)] text-[var(--ds-red-900)]',
  green: 'bg-[var(--ds-green-200)] text-[var(--ds-green-900)]',
  purple: 'bg-[var(--ds-purple-200)] text-[var(--ds-purple-900)]',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`text-label-12 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 ${TONE[tone]}`}
    >
      {children}
    </span>
  )
}

export function Button({
  children,
  onClick,
  variant = 'secondary',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}) {
  const cls =
    variant === 'primary'
      ? 'bg-[var(--ds-gray-1000)] text-[var(--ds-background-100)]'
      : 'bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-[var(--ds-shadow-border-small)]'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-button-14 inline-flex h-9 items-center justify-center rounded-md px-3 ${cls}`}
    >
      {children}
    </button>
  )
}

/* --- formáty -------------------------------------------------------------- */

const DATE = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' })
const DATE_SHORT = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'numeric' })

export const formatDate = (iso: string | null): string =>
  iso ? DATE.format(new Date(iso)) : '—'

export const formatDateShort = (iso: string): string => DATE_SHORT.format(new Date(iso))

/** Kolik dní zbývá; záporné číslo znamená po termínu. */
export function daysUntil(iso: string, today = new Date()): number {
  const a = new Date(iso)
  const ms = a.setHours(0, 0, 0, 0) - new Date(today).setHours(0, 0, 0, 0)
  return Math.round(ms / 86_400_000)
}

/**
 * Barva termínu. Po termínu je červená, do dvou týdnů jantarová — dál nic.
 * Není to varování ani výtka, jen informace (dok. 16).
 */
export function dueTone(iso: string): Tone {
  const d = daysUntil(iso)
  if (d < 0) return 'red'
  if (d <= 14) return 'amber'
  return 'neutral'
}

export function dueLabel(iso: string): string {
  const d = daysUntil(iso)
  if (d < 0) return `${Math.abs(d)} dní po termínu`
  if (d === 0) return 'dnes'
  if (d === 1) return 'zítra'
  return `za ${d} dní`
}
