/**
 * Testovací data v paměti.
 *
 * Sada se **nestahuje ani nečte z Firestore** — vygeneruje ji tady v prohlížeči
 * týž generátor, který ji sype do emulátoru (`tools/seed`). Dva důvody:
 *
 *  1. Pro první testy není potřeba přihlášení (přepínač pohledů), ale pravidla
 *     nepřihlášenému čtení nic nepovolí — a to je správně. Data proto zatím
 *     nejdou přes Firestore vůbec.
 *  2. Sada a obrazovky se nemohou rozejít. Kdyby aplikace čekala JSON, byla by
 *     to druhá pravda, kterou nikdo neaktualizuje.
 *
 * Až bude přihlášení, vymění se tenhle modul za dotazy do Firestore. Rozhraní
 * níž je proto úmyslně tak úzké, jak jde: dotaz na kolekci a dotaz na dokument.
 */

import { build } from '../../../../tools/seed/src/build'

export interface Doc<T = Record<string, unknown>> {
  path: string
  id: string
  data: T
}

let cache: { byPath: Map<string, Doc>; byParent: Map<string, Doc[]> } | null = null

function load() {
  if (cache) return cache
  const { docs } = build()
  const byPath = new Map<string, Doc>()
  const byParent = new Map<string, Doc[]>()
  for (const raw of docs) {
    const id = raw.path.slice(raw.path.lastIndexOf('/') + 1)
    const doc: Doc = { path: raw.path, id, data: raw.data }
    byPath.set(raw.path, doc)
    const parent = raw.path.slice(0, raw.path.lastIndexOf('/'))
    const list = byParent.get(parent)
    if (list) list.push(doc)
    else byParent.set(parent, [doc])
  }
  cache = { byPath, byParent }
  return cache
}

/** Dokumenty jedné kolekce. Cesta je stejná jako ve `schema/src/paths.ts`. */
export function collection<T>(path: string): Array<Doc<T>> {
  return (load().byParent.get(path) ?? []) as Array<Doc<T>>
}

export function document<T>(path: string): Doc<T> | null {
  return (load().byPath.get(path) ?? null) as Doc<T> | null
}

/** Kolik dokumentů sada má — ukazuje se v ladicí liště. */
export function docCount(): number {
  return load().byPath.size
}
