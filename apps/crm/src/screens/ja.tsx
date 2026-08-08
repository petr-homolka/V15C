/**
 * Já — pohled, motiv a co je pod kapotou.
 *
 * Nahrazuje přihlášení, dokud žádné není (dok. 19). Persona drží přesně to,
 * co bude po přihlášení v tokenu.
 */

import { getPreference, setTheme } from '../theme.js'
import { docCount } from '../demo/store'
import { usePersona } from '../persona'
import { Avatar, Card, Divider, GroupTitle, LargeTitle, Meta, Row, Screen } from '../ui'

type Preference = 'light' | 'dark' | 'system'

const THEMES: Array<[Preference, string]> = [
  ['light', 'Světlý'],
  ['dark', 'Tmavý'],
  ['system', 'Podle systému'],
]

export function Ja({ go }: { go: (r: string) => void }) {
  const { personas, persona, setPersona } = usePersona()
  const current = getPreference() as Preference

  const groups = new Map<string, typeof personas>()
  for (const p of personas) {
    const key = p.organizationName ?? 'Systém'
    const list = groups.get(key)
    if (list) list.push(p)
    else groups.set(key, [p])
  }

  return (
    <Screen>
      <LargeTitle title="Pohled" subtitle="Zatím se nepřihlašuje — pohled se vybírá" />

      {[...groups].map(([name, list]) => (
        <div key={name}>
          <GroupTitle>{name}</GroupTitle>
          <Card>
            {list.map((p, i) => (
              <div key={p.key}>
                {i > 0 ? <Divider /> : null}
                <Row
                  leading={<Avatar text={p.displayName} tone={p.key === persona.key ? 'blue' : 'gray'} />}
                  title={p.displayName}
                  subtitle={p.roleLabel}
                  meta={p.key === persona.key ? <Meta tone="blue">vybráno</Meta> : undefined}
                  onClick={() => {
                    setPersona(p.key)
                    go('/')
                  }}
                />
              </div>
            ))}
          </Card>
        </div>
      ))}

      <GroupTitle>Vzhled</GroupTitle>
      <Card>
        {THEMES.map(([value, label], i) => (
          <div key={value}>
            {i > 0 ? <Divider /> : null}
            <Row
              title={label}
              meta={current === value ? <Meta tone="blue">vybráno</Meta> : undefined}
              onClick={() => {
                setTheme(value)
                go('/ja')
              }}
            />
          </div>
        ))}
      </Card>

      <GroupTitle>Data</GroupTitle>
      <Card>
        <Row title="Testovací sada" meta={<Meta>{docCount()} dokumentů</Meta>} />
        <Divider />
        <Row title="Zápis do databáze" meta={<Meta>zatím ne</Meta>} />
      </Card>
    </Screen>
  )
}
