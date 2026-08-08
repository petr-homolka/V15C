/**
 * Eli — první obrazovka.
 *
 * Prázdný stav vypadá jako u chatovacích aplikací a je to tak správně: značka,
 * oslovení a **psací pole hned pod ním, ve výšce očí**. Nic jiného tam není,
 * protože nic jiného v té chvíli není potřeba.
 *
 * Jak přijde první odpověď, pole sjede dolů a plochu dostane rozhovor.
 */

import { useEffect, useRef, useState } from 'react'
import { answer, SUGGESTIONS, type EliAnswer } from '../eli/answer'
import { useLocal } from '../local'
import { usePersona } from '../persona'
import { Card, Chevron, Chip, Divider, Row } from '../ui'

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
    if (turns.length > 0) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
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

  const composer = (
    <Composer value={draft} onChange={setDraft} onSend={() => ask(draft)} />
  )

  /* --- prázdný stav: střed obrazovky ---------------------------------- */
  if (turns.length === 0) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-3xl flex-col justify-center px-4 pb-24">
        <Mark />
        <h1 className="text-heading-32 pt-5 text-[var(--ds-gray-1000)]">
          Dobrý den, {persona.displayName.split(' ')[0]}.
        </h1>
        <div className="pt-5">{composer}</div>
        <div className="flex flex-wrap gap-2 pt-4">
          {SUGGESTIONS.map((s) => (
            <Chip key={s} onClick={() => (s.endsWith('…') ? setDraft(s.slice(0, -1)) : ask(s))}>
              {s}
            </Chip>
          ))}
        </div>
      </div>
    )
  }

  /* --- rozhovor -------------------------------------------------------- */
  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-4 pb-40 pt-2">
        <div className="flex flex-col gap-5">
          {turns.map((t) =>
            t.from === 'me' ? (
              <div key={t.id} className="flex justify-end">
                <p className="text-copy-16 max-w-[85%] rounded-2xl rounded-br-md bg-[var(--ds-gray-100)] px-4 py-2.5 text-[var(--ds-gray-1000)]">
                  {t.text}
                </p>
              </div>
            ) : (
              <div key={t.id} className="flex flex-col gap-3">
                <p className="text-copy-16 max-w-[92%] leading-relaxed text-[var(--ds-gray-1000)]">
                  {t.text}
                </p>

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
                    className="text-copy-14 self-start rounded-lg text-[var(--ds-blue-700)]"
                  >
                    {t.answer.did.label}
                  </button>
                ) : null}
              </div>
            ),
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[var(--ds-background-100)] via-[var(--ds-background-100)] to-transparent pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-6">
        <div className="mx-auto w-full max-w-3xl px-4">{composer}</div>
      </div>
    </>
  )
}

/** Značka. Čtverec s iniciálou — logo přijde, až bude. */
function Mark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--ds-gray-1000)]">
      <span className="text-heading-20 text-[var(--ds-background-100)]">E</span>
    </div>
  )
}

/**
 * Psací pole. Vysoké, s odesláním vpravo dole — na mobilu se do něj musí
 * vejít dvě věty, ne půl řádku.
 */
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
    <div className="rounded-2xl bg-[var(--ds-background-100)] p-2 shadow-[var(--ds-shadow-border-medium)]">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSend()
        }}
        placeholder="Zeptejte se Eli…"
        className="text-copy-16 w-full bg-transparent px-2 py-2 text-[var(--ds-gray-1000)] outline-none placeholder:text-[var(--ds-gray-700)]"
      />
      <div className="flex items-center justify-between pt-1">
        <span className="text-label-12 pl-2 text-[var(--ds-gray-700)]">
          Odpovídám z dat vaší organizace
        </span>
        <button
          type="button"
          onClick={onSend}
          aria-label="Odeslat"
          disabled={value.trim().length === 0}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ds-gray-1000)] text-[var(--ds-background-100)] disabled:bg-[var(--ds-gray-200)] disabled:text-[var(--ds-gray-700)]"
        >
          <span className="-rotate-90">
            <Chevron />
          </span>
        </button>
      </div>
    </div>
  )
}
