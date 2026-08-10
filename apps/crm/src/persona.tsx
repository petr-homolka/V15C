/**
 * Přepínač pohledů místo přihlášení.
 *
 * Pro první testy se nepřihlašuje (dok. 19) — pohled se **vybírá**. Persona
 * drží přesně to, co bude po přihlášení v tokenu: kdo jsem, v jaké organizaci
 * a s jakou rolí. Obrazovky se tedy ptají na totéž co potom, jen zdroj je jiný.
 *
 * Volba přežívá obnovení stránky, protože přepínat pohled po každém uložení
 * souboru by při vývoji zdržovalo.
 */

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { agreementsOfCarer, children, members, orgs, persons } from './demo/data'

export type PersonaRole =
  | 'superadmin'
  | 'management'
  | 'key_worker'
  | 'carer'
  | 'child'

export interface Persona {
  key: string
  role: PersonaRole
  roleLabel: string
  displayName: string
  /** Superadmin není v žádné organizaci. */
  organizationId: string | null
  organizationName: string | null
  personId: string | null
  childId: string | null
}

const ROLE_LABEL: Record<PersonaRole, string> = {
  superadmin: 'Správce systému',
  management: 'Vedení',
  key_worker: 'Klíčová osoba',
  carer: 'Pečující osoba',
  child: 'Dítě',
}

/** Sestaví pohledy z testovacích dat — ne z pevného seznamu. */
export function buildPersonas(): Persona[] {
  const out: Persona[] = [
    {
      key: 'superadmin',
      role: 'superadmin',
      roleLabel: ROLE_LABEL.superadmin,
      displayName: 'Správce systému',
      organizationId: null,
      organizationName: null,
      personId: null,
      childId: null,
    },
  ]

  for (const o of orgs()) {
    const byId = new Map(persons(o.id).map((p) => [p.id, p]))

    for (const m of members(o.id)) {
      if (m.status !== 'active') continue
      const p = byId.get(m.personId)
      if (!p) continue
      const role: PersonaRole = m.role === 'key_worker' ? 'key_worker' : 'management'
      out.push({
        key: `${o.id}:${m.personId}`,
        role,
        roleLabel: ROLE_LABEL[role],
        displayName: p.displayName,
        organizationId: o.id,
        organizationName: o.displayName,
        personId: p.id,
        childId: null,
      })
    }

    // Jeden pěstoun a jedno dítě na organizaci stačí — jejich aplikace se
    // teprve staví a pohled je tu proto, aby bylo vidět, že vidí jen své.
    const carer = persons(o.id).find(
      (p) => p.roles.includes('caregiver') && agreementsOfCarer(o.id, p.id).length > 0,
    )
    if (carer) {
      out.push({
        key: `${o.id}:carer:${carer.id}`,
        role: 'carer',
        roleLabel: ROLE_LABEL.carer,
        displayName: carer.displayName,
        organizationId: o.id,
        organizationName: o.displayName,
        personId: carer.id,
        childId: null,
      })
    }

    const kid = children(o.id).find((c) => c.careEndedOn === null)
    if (kid) {
      out.push({
        key: `${o.id}:child:${kid.id}`,
        role: 'child',
        roleLabel: ROLE_LABEL.child,
        displayName: kid.displayName,
        organizationId: o.id,
        organizationName: o.displayName,
        personId: null,
        childId: kid.id,
      })
    }
  }

  return out
}

interface PersonaState {
  personas: Persona[]
  persona: Persona
  setPersona: (key: string) => void
}

const Ctx = createContext<PersonaState | null>(null)
const STORAGE_KEY = 'v15c.persona'

export function PersonaProvider({ children: kids }: { children: ReactNode }) {
  const personas = useMemo(() => buildPersonas(), [])
  const [key, setKey] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && personas.some((p) => p.key === stored)) return stored
    // Výchozí je Klíčová osoba — na ní se v terénu tráví nejvíc času.
    return (personas.find((p) => p.role === 'key_worker') ?? personas[0]!).key
  })

  const value = useMemo<PersonaState>(() => {
    const persona = personas.find((p) => p.key === key) ?? personas[0]!
    return {
      personas,
      persona,
      setPersona: (next) => {
        localStorage.setItem(STORAGE_KEY, next)
        setKey(next)
      },
    }
  }, [personas, key])

  return <Ctx.Provider value={value}>{kids}</Ctx.Provider>
}

export function usePersona(): PersonaState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePersona mimo PersonaProvider')
  return ctx
}
