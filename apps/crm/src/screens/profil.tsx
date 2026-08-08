/**
 * Hlavička profilu — společná pro pěstouna, dítě i kolegu.
 *
 * Skladba je záměrně stejná jako v pořádných administracích: **obrázek,
 * jméno, pod ním řádek drobných údajů s ikonami, vpravo akce.** Žádný
 * barevný blok — hlavička má představit člověka, ne křičet.
 */

import type { ReactNode } from 'react'
import { Face, type FaceKind } from '../face'
import { Button } from '../ui'

export function ProfileHeader({
  uid,
  name,
  kind = 'person',
  facts,
  actions,
  onEditImage,
}: {
  uid: string
  name: string
  kind?: FaceKind
  facts: Array<{ icon: 'pin' | 'phone' | 'mail' | 'cake' | 'home' | 'tag'; text: string }>
  actions?: ReactNode
  onEditImage: () => void
}) {
  return (
    <section className="rounded-xl border border-[var(--ds-gray-alpha-400)] bg-[var(--ds-background-100)] p-4 sm:p-5">
      <div className="flex flex-wrap items-start gap-4">
        <button
          type="button"
          onClick={onEditImage}
          className="relative shrink-0"
          aria-label="Změnit obrázek"
        >
          <Face uid={uid} name={name} kind={kind} size="lg" />
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--ds-gray-alpha-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)]">
            <Icon name="camera" />
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="text-heading-20 truncate text-[var(--ds-gray-1000)]">{name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5">
            {facts.map((f) => (
              <span
                key={f.icon + f.text}
                className="text-copy-13 flex items-center gap-1.5 text-[var(--ds-gray-900)]"
              >
                <Icon name={f.icon} />
                {f.text}
              </span>
            ))}
          </div>
        </div>

        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  )
}

const PATHS: Record<string, string> = {
  pin: 'M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z M12 10h.01',
  phone: 'M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  cake: 'M4 20h16M5 20v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6M12 8V5m0 3a1.5 1.5 0 0 0 1.5-1.5C13.5 5 12 3.5 12 3.5S10.5 5 10.5 6.5A1.5 1.5 0 0 0 12 8Z',
  home: 'M4 11l8-6 8 6v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8Z',
  tag: 'M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Zm5-5h.01',
  camera: 'M4 8h3l1.5-2h7L17 8h3v11H4V8Zm8 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
}

export function Icon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name] ?? PATHS.tag!} />
    </svg>
  )
}

/** Tlačítko „Upravit obrázek" — používají ho všechny profily stejně. */
export function EditImageButton({ onClick }: { onClick: () => void }) {
  return (
    <Button size="sm" onClick={onClick}>
      Obrázek a označení
    </Button>
  )
}
