/**
 * Výběr pohledu. Nahrazuje přihlášení, dokud žádné není (dok. 19).
 *
 * Vedle pohledu je tu i motiv — `theme.js` z PWA vrstvy vlastní jak třídu na
 * <html>, tak barvu systémové lišty. Vlastní přepínání by se s ním rozešlo.
 */

import { getPreference, setTheme } from '../theme.js'
import { usePersona } from '../persona'
import { docCount } from '../demo/store'
import { AppBar, Badge, List, Row, Screen, Section } from '../ui'

type Preference = 'light' | 'dark' | 'system'

const THEMES: Array<[Preference, string]> = [
  ['light', 'Světlý'],
  ['dark', 'Tmavý'],
  ['system', 'Podle systému'],
]

export function Switcher({ go }: { go: (r: string) => void }) {
  const { personas, persona, setPersona } = usePersona()
  const current = getPreference()

  const groups = new Map<string, typeof personas>()
  for (const p of personas) {
    const key = p.organizationName ?? 'Systém'
    const list = groups.get(key)
    if (list) list.push(p)
    else groups.set(key, [p])
  }

  return (
    <Screen>
      <AppBar
        title="Pohled"
        subtitle={`Testovací data — ${docCount()} dokumentů`}
        left={
          <button
            type="button"
            onClick={() => go('/')}
            aria-label="Zpět"
            className="text-label-14 -ml-1 flex h-8 w-8 items-center justify-center rounded-md text-[var(--ds-gray-900)]"
          >
            ←
          </button>
        }
      />

      {[...groups].map(([name, list]) => (
        <Section key={name} title={name}>
          <List>
            {list.map((p) => (
              <Row
                key={p.key}
                title={p.displayName}
                subtitle={p.roleLabel}
                trailing={p.key === persona.key ? <Badge tone="blue">vybráno</Badge> : null}
                onClick={() => {
                  setPersona(p.key)
                  go('/')
                }}
              />
            ))}
          </List>
        </Section>
      ))}

      <Section title="Motiv">
        <List>
          {THEMES.map(([value, label]) => (
            <Row
              key={value}
              title={label}
              trailing={current === value ? <Badge tone="blue">vybráno</Badge> : null}
              onClick={() => {
                setTheme(value)
                go('/prepnout')
              }}
            />
          ))}
        </List>
      </Section>
      <div className="h-10" />
    </Screen>
  )
}
