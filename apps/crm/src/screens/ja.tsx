/**
 * Pohled — náhrada přihlášení, vzhled a stav dat (dok. 19).
 */

import { getPreference, setTheme } from '../theme.js'
import { docCount } from '../demo/store'
import { Face } from '../face'
import { usePersona } from '../persona'
import { Card, Chip, Grid, InfoRow, PageHead, Row, Screen, Segmented, Stack } from '../ui'

type Preference = 'light' | 'dark' | 'system'

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
    <Screen wide>
      <PageHead title="Pohled" subtitle="Zatím se nepřihlašuje — pohled se vybírá" />

      <Grid>
        <Stack>
          {[...groups].map(([name, list]) => (
            <Card key={name} title={name}>
              {list.map((p) => (
                <Row
                  key={p.key}
                  leading={<Face uid={p.personId ?? p.key} name={p.displayName} />}
                  title={p.displayName}
                  subtitle={p.roleLabel}
                  meta={p.key === persona.key ? <Chip tone="purple">vybráno</Chip> : undefined}
                  onClick={() => {
                    setPersona(p.key)
                    go('/')
                  }}
                />
              ))}
            </Card>
          ))}
        </Stack>

        <Stack>
          <Card title="Vzhled">
            <InfoRow label="Motiv">
              <Segmented
                value={current}
                onChange={(v) => {
                  setTheme(v)
                  go('/ja')
                }}
                options={[
                  ['light', 'Světlý'],
                  ['dark', 'Tmavý'],
                  ['system', 'Podle systému'],
                ]}
              />
            </InfoRow>
          </Card>

          <Card title="Rozvržení">
            <InfoRow label="A — panel a seznamy">
              <button type="button" onClick={() => go('/prehled')} className="kt-link kt-link-sm">
                Otevřít
              </button>
            </InfoRow>
            <InfoRow label="B — spis jako dokument">
              <button type="button" onClick={() => go('/b')} className="kt-link kt-link-sm">
                Otevřít
              </button>
            </InfoRow>
          </Card>

          <Card title="Data">
            <InfoRow label="Testovací sada">{docCount()} dokumentů</InfoRow>
            <InfoRow label="Zápis do databáze">zatím ne</InfoRow>
            <InfoRow label="Přihlášení">zatím ne</InfoRow>
          </Card>
        </Stack>
      </Grid>
    </Screen>
  )
}
