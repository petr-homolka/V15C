/**
 * Grafy. Ručně kreslené SVG, žádná knihovna.
 *
 * Důvod je věcný: knihovna na grafy váží víc než celá tahle aplikace a
 * uměla by dvacet druhů grafů, z nichž potřebujeme dva. Navíc by si nesla
 * vlastní barvy — takhle jdou z tokenů jako všechno ostatní.
 *
 * Oba grafy mají popisky a čísla; graf, ze kterého se nedá odečíst hodnota,
 * je obrázek, ne údaj.
 */

/** Plocha — vývoj v čase. Poslední bod je zvýrazněný, ten se čte nejvíc. */
export function Area({
  points,
  labels,
  height = 120,
}: {
  points: number[]
  labels: string[]
  height?: number
}) {
  const w = 320
  const h = height
  const pad = 6
  const max = Math.max(1, ...points)
  const step = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0
  const xy = points.map((v, i) => [pad + i * step, h - pad - (v / max) * (h - pad * 3)] as const)

  const line = xy.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${(pad + (points.length - 1) * step).toFixed(1)},${h - pad} L${pad},${h - pad} Z`
  const last = xy[xy.length - 1]

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Vývoj v čase">
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ds-purple-700)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--ds-purple-700)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Vodicí linky — tři, víc by z toho udělalo mřížkový papír. */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={pad}
            x2={w - pad}
            y1={h - pad - f * (h - pad * 3)}
            y2={h - pad - f * (h - pad * 3)}
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))}
        <path d={area} fill="url(#area-fill)" />
        <path d={line} fill="none" stroke="var(--ds-purple-700)" strokeWidth="2" strokeLinejoin="round" />
        {last ? <circle cx={last[0]} cy={last[1]} r="3.5" fill="var(--ds-purple-700)" /> : null}
      </svg>
      <div className="text-label-12 flex justify-between pt-1 text-[var(--muted-foreground)]">
        {labels.map((l, i) => (
          <span key={l + i}>{l}</span>
        ))}
      </div>
    </div>
  )
}

/** Prstenec — rozdělení celku. Nejvýš pět dílů, jinak se to nedá přečíst. */
export function Donut({
  slices,
  total,
  caption,
}: {
  slices: Array<{ label: string; value: number; tone: string }>
  total: number
  caption: string
}) {
  const r = 42
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0 -rotate-90" role="img" aria-label={caption}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--ds-gray-200)" strokeWidth="12" />
        {slices.map((s) => {
          const len = total > 0 ? (s.value / total) * c : 0
          const el = (
            <circle
              key={s.label}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={s.tone}
              strokeWidth="12"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
            />
          )
          offset += len
          return el
        })}
      </svg>

      <ul className="min-w-0 flex-1">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2 py-0.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.tone }} />
            <span className="text-copy-13 min-w-0 flex-1 truncate text-[var(--ds-gray-1000)]">
              {s.label}
            </span>
            <span className="text-copy-13 tabular-nums text-[var(--muted-foreground)]">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
