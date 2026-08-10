/**
 * Tvář — avatar pěstouna, dítěte i kolegy, a barevné označení řádku.
 *
 * Tři stupně, v tomhle pořadí:
 *  1. **fotka**, kterou si někdo nahrál,
 *  2. **obrázek ze sady** (motiv + barva) — vybírá se při založení,
 *  3. **iniciály**, dokud si nikdo nic nevybral.
 *
 * Fotka se před uložením zmenší na 256 px přes `<canvas>`. To má vedlejší
 * účinek, na kterém záleží: **překreslením se zahodí EXIF**, tedy i GPS
 * souřadnice domácnosti (dok. 21). Zmenšenina je zároveň to jediné, co se
 * kdy zobrazuje v seznamu.
 *
 * Barevné označení je **soukromé**. Klíčová osoba si jím značí, co potřebuje,
 * a nikomu se to nezobrazuje ani nikam nezapisuje — proto localStorage a ne
 * databáze. Kdyby to viděli ostatní, byl by z toho nálepkovací systém na
 * rodiny, a to je přesně to, co charta zakazuje (dok. 16).
 */

import { useEffect, useState, type ReactNode } from 'react'

/* --- motivy --------------------------------------------------------------- */

/** Jednoduché tvary, ne portréty. Vybírá si je i dítě, tak ať jsou veselé. */
export const MOTIFS: Record<string, string> = {
  kocka: 'M5 11l-1-5 4 2h8l4-2-1 5v4a6 6 0 0 1-6 5h-2a6 6 0 0 1-6-5v-4Zm4 4h.01M15 15h.01M12 17l-1.5-1M12 17l1.5-1',
  pes: 'M4 9c0-3 2-5 4-4l1 1h6l1-1c2-1 4 1 4 4v4a7 7 0 0 1-7 6h-2a7 7 0 0 1-7-6V9Zm5 5h.01M15 14h.01M12 17c-.8 0-1.5-.4-1.5-1h3c0 .6-.7 1-1.5 1Z',
  srdce: 'M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z',
  hvezda: 'M12 4l2.4 5 5.6.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.6-.8L12 4Z',
  kytka: 'M12 21v-8m0 0c0-3.3 2.2-5 5-5 0 3.3-2.2 5-5 5Zm0 0c0-3.3-2.2-5-5-5 0 3.3 2.2 5 5 5Zm0-8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  strom: 'M12 3l4.5 6H14l4 6H6l4-6H7.5L12 3Zm0 12v6',
  slunce: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5v2m0 18v2M2 12h2m16 0h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19',
  micek: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5.2 3.6 2.6-1.4 4.2H9.8l-1.4-4.2L12 8.2Z',
  kniha: 'M12 6c-1.6-1.3-3.6-2-6-2v13c2.4 0 4.4.7 6 2m0-13c1.6-1.3 3.6-2 6-2v13c-2.4 0-4.4.7-6 2m0-13v13',
  hudba: 'M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm10-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z',
  raketa: 'M12 3c3 2 5 5.5 5 9l2 3-4 1-1 3-2-2-2 2-1-3-4-1 2-3c0-3.5 2-7 5-9Zm0 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
  domek: 'M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z',
}

export const MOTIF_KEYS = Object.keys(MOTIFS)

/* --- barvy ---------------------------------------------------------------- */

export type Tint = 'none' | 'purple' | 'blue' | 'teal' | 'green' | 'amber' | 'pink' | 'red'

export const TINTS: Tint[] = ['none', 'purple', 'blue', 'teal', 'green', 'amber', 'pink', 'red']

/** Pozadí obrázku a kroužek kolem. Vše z tokenů, nikde žádný hex. */
export const TINT_BG: Record<Tint, string> = {
  none: 'bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]',
  purple: 'bg-[var(--ds-purple-100)] text-[var(--ds-purple-900)]',
  blue: 'bg-[var(--ds-blue-100)] text-[var(--ds-blue-900)]',
  teal: 'bg-[var(--ds-teal-100)] text-[var(--ds-teal-900)]',
  green: 'bg-[var(--ds-green-100)] text-[var(--ds-green-900)]',
  amber: 'bg-[var(--ds-amber-100)] text-[var(--ds-amber-900)]',
  pink: 'bg-[var(--ds-pink-100)] text-[var(--ds-pink-900)]',
  red: 'bg-[var(--ds-red-100)] text-[var(--ds-red-900)]',
}

const TINT_RING: Record<Tint, string> = {
  none: '',
  purple: 'ring-2 ring-[var(--ds-purple-700)]',
  blue: 'ring-2 ring-[var(--ds-blue-700)]',
  teal: 'ring-2 ring-[var(--ds-teal-700)]',
  green: 'ring-2 ring-[var(--ds-green-700)]',
  amber: 'ring-2 ring-[var(--ds-amber-700)]',
  pink: 'ring-2 ring-[var(--ds-pink-700)]',
  red: 'ring-2 ring-[var(--ds-red-700)]',
}

export const TINT_LABEL: Record<Tint, string> = {
  none: 'bez označení',
  purple: 'fialová',
  blue: 'modrá',
  teal: 'tyrkysová',
  green: 'zelená',
  amber: 'oranžová',
  pink: 'růžová',
  red: 'červená',
}

/* --- uložení -------------------------------------------------------------- */

export interface FaceRecord {
  motif: string | null
  color: Tint
  photo: string | null
  /** Soukromá barva řádku — jiná věc než barva obrázku. */
  mark: Tint
}

const KEY = 'v15c.faces'
const EMPTY: FaceRecord = { motif: null, color: 'none', photo: null, mark: 'none' }

function readAll(): Record<string, FaceRecord> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, FaceRecord>
  } catch {
    return {}
  }
}

let cache: Record<string, FaceRecord> | null = null
const listeners = new Set<() => void>()

function all(): Record<string, FaceRecord> {
  if (!cache) cache = readAll()
  return cache
}

export function faceOf(uid: string): FaceRecord {
  return all()[uid] ?? EMPTY
}

export function setFace(uid: string, patch: Partial<FaceRecord>): void {
  const next = { ...all(), [uid]: { ...faceOf(uid), ...patch } }
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Když je úložiště plné (velká fotka), radši nic než spadnout.
  }
  listeners.forEach((l) => l())
}

/** Překreslí komponentu, když se avatar změní jinde na obrazovce. */
export function useFace(uid: string): FaceRecord {
  const [, bump] = useState(0)
  useEffect(() => {
    const l = () => bump((n) => n + 1)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])
  return faceOf(uid)
}

/**
 * Zmenšení fotky na čtverec 256 px. Ořezává se ze středu — profilová fotka
 * je vždycky čtverec a roztažená hlava vypadá špatně.
 */
export async function shrinkPhoto(file: File, size = 256): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  )
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.82)
}

/* --- výchozí podoba ------------------------------------------------------- */

/**
 * Než si někdo vybere, dostane podobu **odvozenou z UID**.
 *
 * Dospělí a rodiny dostanou iniciály na šedém podkladu. **Barvu má jen
 * dítě** — a jen protože si obrázek pak stejně vybere samo. Kdyby barvu
 * dostal každý řádek, přestala by barva cokoli znamenat a seznam dvaceti
 * rodin by vypadal jako hračka, ne jako pracovní nástroj.
 */
const KID_MOTIFS = ['kocka', 'pes', 'raketa', 'micek', 'hvezda', 'kytka', 'srdce', 'hudba']
const AUTO_TINTS: Tint[] = ['purple', 'blue', 'teal', 'green', 'amber', 'pink']

function hash(uid: string): number {
  let h = 0
  for (let i = 0; i < uid.length; i++) h = (h * 31 + uid.charCodeAt(i)) >>> 0
  return h
}

export function autoFace(uid: string, kind: FaceKind): FaceRecord {
  const h = hash(uid)
  if (kind !== 'child') return { motif: null, color: 'none', photo: null, mark: 'none' }
  return {
    motif: KID_MOTIFS[h % KID_MOTIFS.length]!,
    color: AUTO_TINTS[(h >> 3) % AUTO_TINTS.length]!,
    photo: null,
    mark: 'none',
  }
}

export type FaceKind = 'child' | 'person' | 'family'

/* --- zobrazení ------------------------------------------------------------ */

const SIZES = { xs: 'h-6 w-6', sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-16 w-16' }
const GLYPH = { xs: 'h-3 w-3', sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-8 w-8' }
const TEXT = { xs: 'text-label-12', sm: 'text-label-13', md: 'text-label-14', lg: 'text-heading-20' }

export function Face({
  uid,
  name,
  kind = 'person',
  size = 'sm',
  showMark = true,
}: {
  uid: string
  name: string
  kind?: FaceKind
  size?: keyof typeof SIZES
  showMark?: boolean
}) {
  const stored = useFace(uid)
  const auto = autoFace(uid, kind)
  // Uložené vyhrává, ale jen v tom, co je vyplněné — jinak platí odvozené.
  const face: FaceRecord = {
    motif: stored.motif ?? auto.motif,
    color: stored.color === 'none' ? auto.color : stored.color,
    photo: stored.photo,
    mark: stored.mark,
  }
  const initials = name
    .split(/[\s—-]+/)
    .filter((w) => /^\p{L}/u.test(w))
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')

  const ring = showMark ? TINT_RING[face.mark] : ''
  const shape = kind === 'family' ? 'rounded-lg' : 'rounded-full'
  const base = `${SIZES[size]} ${ring} ${shape} shrink-0 overflow-hidden ring-offset-2 ring-offset-[var(--ds-background-100)]`

  if (face.photo) {
    return <img src={face.photo} alt="" className={`${base} object-cover`} />
  }

  if (face.motif && MOTIFS[face.motif]) {
    return (
      <div className={`${base} ${TINT_BG[face.color]} flex items-center justify-center`}>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={GLYPH[size]}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={MOTIFS[face.motif]} />
        </svg>
      </div>
    )
  }

  return (
    <div className={`${base} ${TINT_BG[face.color]} ${TEXT[size]} flex items-center justify-center`}>
      {initials}
    </div>
  )
}

/* --- výběr ---------------------------------------------------------------- */

/**
 * Výběr obrázku a barvy. Otevírá se z profilu (karta pěstouna nebo dítěte),
 * protože tam se to dá i změnit — v seznamu by to byla past na omylem.
 */
export function FacePicker({
  uid,
  name,
  kind = 'person',
  onClose,
}: {
  uid: string
  name: string
  kind?: FaceKind
  onClose: () => void
}) {
  const stored = useFace(uid)
  const auto = autoFace(uid, kind)
  const face: FaceRecord = {
    motif: stored.motif ?? auto.motif,
    color: stored.color === 'none' ? auto.color : stored.color,
    photo: stored.photo,
    mark: stored.mark,
  }
  const [busy, setBusy] = useState(false)

  const upload = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      setFace(uid, { photo: await shrinkPhoto(file) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet title="Obrázek a označení" onClose={onClose}>
      <div className="flex items-center gap-4 pb-5">
        <Face uid={uid} name={name} kind={kind} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="text-copy-16 truncate text-[var(--ds-gray-1000)]">{name}</div>
          <label className="text-label-13 mt-1.5 inline-flex h-8 cursor-pointer items-center rounded-lg bg-[var(--ds-purple-700)] px-3 text-white hover:bg-[var(--ds-purple-800)]">
            {busy ? 'Zpracovávám…' : 'Nahrát fotku'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void upload(e.target.files?.[0])}
            />
          </label>
          {face.photo ? (
            <button
              type="button"
              onClick={() => setFace(uid, { photo: null })}
              className="text-copy-14 ml-2 text-[var(--ds-gray-900)]"
            >
              Odebrat
            </button>
          ) : null}
        </div>
      </div>

      <p className="text-label-13 pb-2 text-[var(--ds-gray-900)]">Obrázek ze sady</p>
      <div className="grid grid-cols-6 gap-2 pb-5">
        {MOTIF_KEYS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setFace(uid, { motif: m, photo: null })}
            className={`flex h-11 w-full items-center justify-center rounded-xl ${
              face.motif === m && !face.photo
                ? TINT_BG[face.color === 'none' ? 'purple' : face.color]
                : 'bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={MOTIFS[m]} />
            </svg>
          </button>
        ))}
      </div>

      <p className="text-label-13 pb-2 text-[var(--ds-gray-900)]">Barva obrázku</p>
      <TintRow value={face.color} onChange={(t) => setFace(uid, { color: t })} />

      <p className="text-label-13 pb-2 pt-5 text-[var(--ds-gray-900)]">
        Moje označení <span className="text-[var(--ds-gray-700)]">— vidíte jen vy</span>
      </p>
      <TintRow value={face.mark} onChange={(t) => setFace(uid, { mark: t })} />
      <p className="text-copy-14 pt-3 text-[var(--ds-gray-900)]">
        Kroužek kolem obrázku a jméno v barvě. Neukládá se do spisu a nikdo další
        ho nevidí — je to vaše poznámka, ne hodnocení rodiny.
      </p>
    </Sheet>
  )
}

function TintRow({ value, onChange }: { value: Tint; onChange: (t: Tint) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TINTS.map((t) => (
        <button
          key={t}
          type="button"
          aria-label={TINT_LABEL[t]}
          onClick={() => onChange(t)}
          className={`h-9 w-9 rounded-full ${TINT_BG[t]} ${
            value === t ? 'ring-2 ring-[var(--ds-gray-1000)] ring-offset-2 ring-offset-[var(--ds-background-100)]' : ''
          } ${t === 'none' ? 'text-[var(--ds-gray-700)]' : ''} flex items-center justify-center`}
        >
          {t === 'none' ? '—' : ''}
        </button>
      ))}
    </div>
  )
}

/** Spodní panel. Na mobilu se otevírá odspodu, aby na něj dosáhl palec. */
export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-50 bg-[var(--ds-gray-alpha-600)]" />
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-[var(--ds-gray-alpha-400)] bg-[var(--ds-background-100)] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:bottom-8 sm:rounded-2xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--ds-gray-400)]" />
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-label-13 rounded-lg px-2 py-1 text-[var(--ds-purple-700)]"
          >
            Hotovo
          </button>
        </div>
        {children}
      </div>
    </>
  )
}
