/**
 * Eli — hlavní obrazovka.
 *
 * Chat je ústřední nástroj, ne pomocník v rohu (dok. 15). Proto je to první
 * věc, kterou pracovník uvidí: jeden sloupec, dole psaní, nad ním odpovědi,
 * a z odpovědi se dá jít dál do rodiny.
 */

import { useEffect, useRef, useState } from 'react'
import { answer, SUGGESTIONS, type EliAnswer } from '../eli/answer'
import { useLocal } from '../local'
import { usePersona } from '../persona'
import { Card, Chevron, Chip, Divider, Row, Screen } from '../ui'

interface Turn {
  id: number
  from: 'me' | 'eli'
  text: string
  answer?: EliAnswer
}

export function Eli({ go }: { go: (r: string) => void }) {
  const { persona } = usePersona()
  const local = useLocal()
  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [turns.length])

  const ask = (text: string) => {
    const q = text.trim()
    if (!q) return
    const a = answer(q, {
      organizationId: persona.organizationId!,
      personId: persona.personId,
      addEvent: local.addEvent,
      removeEvent: local.removeEvent,
    })
    setTurns((prev) => [
      ...prev,
      { id: prev.length * 2, from: 'me', text: q },
      { id: prev.length * 2 + 1, from: 'eli', text: a.text, answer: a },
    ])
    setDraft('')
  }

  const firstName = persona.displayName.split(' ')[0]

  return (
    <>
      <Screen>
        {turns.length === 0 ? (
          <div className="pt-[calc(env(safe-area-inset-top)+2.5rem)]">
            <h1 className="text-heading-32 text-[var(--ds-gray-1000)]">Dobrý den, {firstName}.</h1>
            <p className="text-copy-16 pt-2 text-[var(--ds-gray-900)]">
              Zeptejte se na cokoli k rodinám, lhůtám nebo kalendáři. Napíšu, co vím, a co
              neumím, řeknu rovnou.
            </p>
            <div className="flex flex-col items-start gap-2 pt-6">
              {SUGGESTIONS.map((s) => (
                <Chip key={s} onClick={() => (s.endsWith('…') ? setDraft(s.slice(0, -1)) : ask(s))}>
                  {s}
                </Chip>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
            {turns.map((t) =>
              t.from === 'me' ? (
                <div key={t.id} className="flex justify-end">
                  <p className="text-copy-16 max-w-[85%] rounded-2xl rounded-br-md bg-[var(--ds-blue-700)] px-4 py-2.5 text-white">
                    {t.text}
                  </p>
                </div>
              ) : (
                <div key={t.id} className="flex flex-col gap-3">
                  <p className="text-copy-16 max-w-[92%] text-[var(--ds-gray-1000)]">{t.text}</p>

                  {t.answer?.links && t.answer.links.length > 0 ? (
                    <Card>
                      {t.answer.links.map((l, i) => (
                        <div key={`${l.route}-${i}`}>
                          {i > 0 ? <Divider /> : null}
                          <Row title={l.label} subtitle={l.detail} onClick={() => go(l.route)} />
                        </div>
                      ))}
                    </Card>
                  ) : null}

                  {t.answer?.did ? (
                    <button
                      type="button"
                      onClick={() => {
                        t.answer!.did!.undo()
                        setTurns((prev) => [
                          ...prev,
                          { id: prev.length * 2 + 2, from: 'eli', text: 'Vráceno zpět.' },
                        ])
                      }}
                      className="text-copy-14 self-start text-[var(--ds-blue-700)]"
                    >
                      {t.answer.did.label}
                    </button>
                  ) : null}
                </div>
              ),
            )}
            <div ref={endRef} />
          </div>
        )}
      </Screen>

      <Composer value={draft} onChange={setDraft} onSend={() => ask(draft)} />
    </>
  )
}

/** Psaní drží spodní hrana — palec je tam, kde je klávesnice. */
function Composer({
  value,
  onChange,
  onSend,
}: {
  value: string
  onChange: (v: string) => void
  onSend: () => void
}) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(3.25rem+env(safe-area-inset-bottom))] z-20">
      <div className="mx-auto w-full max-w-2xl px-4 pb-2">
        <div className="flex items-end gap-2 rounded-2xl bg-[var(--ds-background-100)] p-1.5 shadow-[var(--ds-shadow-border-medium)]">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSend()
            }}
            placeholder="Napište Eli…"
            className="text-copy-16 min-w-0 flex-1 bg-transparent px-3 py-2 text-[var(--ds-gray-1000)] outline-none placeholder:text-[var(--ds-gray-700)]"
          />
          <button
            type="button"
            onClick={onSend}
            aria-label="Odeslat"
            disabled={value.trim().length === 0}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ds-gray-1000)] text-[var(--ds-background-100)] disabled:bg-[var(--ds-gray-300)] disabled:text-[var(--ds-gray-700)]"
          >
            <span className="rotate-[-90deg]">
              <Chevron />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
