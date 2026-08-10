/**
 * Dnešek — schůzky a úkoly.
 *
 * Den je seznam, ne mřížka: na hodinové ose zabírá tři čtvrtiny plochy
 * prázdná noc. Čas nese sloupec vlevo.
 */

import { useState } from 'react'
import * as data from '../demo/data'
import { useLocal } from '../local'
import { usePersona } from '../persona'
import {
  Button, Card, Chip, Grid, Note, PageHead, Row, Screen, Stack,
  dueLabel, dueTone, formatDate, formatTime, formatWeekday,
} from '../ui'

const DAY_MS = 86_400_000

export function Dnes({ go }: { go: (r: string) => void }) {
  const { persona } = usePersona()
  const local = useLocal()
  const orgId = persona.organizationId!
  const mine = persona.role === 'key_worker' ? persona.personId : null

  const [day, setDay] = useState(() => new Date())
  const isToday = day.toDateString() === new Date().toDateString()

  const events = [...data.events(orgId), ...local.events]
    .filter(
      (e) =>
        (!mine || e.ownerPersonId === mine) &&
        new Date(e.startAt).toDateString() === day.toDateString(),
    )
    .sort((a, b) => a.startAt.localeCompare(b.startAt))

  const tasks = data
    .tasks(orgId)
    .filter((t) => !mine || t.assigneePersonId === mine)
    .filter((t) => t.status === 'open' && !local.doneTasks.has(t.id))
    .sort((a, b) => (a.dueOn ?? '').localeCompare(b.dueOn ?? ''))

  const today = new Date(new Date().toDateString())
  const overdue = tasks.filter((t) => t.dueOn && new Date(t.dueOn) < today)
  const rest = tasks.filter((t) => !overdue.includes(t))

  const birthdays = data.children(orgId).filter((c) => {
    const b = new Date(c.birthDate)
    return b.getDate() === day.getDate() && b.getMonth() === day.getMonth() && !c.careEndedOn
  })

  return (
    <Screen wide>
      <PageHead
        title={isToday ? 'Dnes' : formatWeekday(day)}
        subtitle={formatDate(day.toISOString())}
        actions={
          <>
            <Button size="sm" onClick={() => setDay(new Date(day.getTime() - DAY_MS))}>
              ‹
            </Button>
            <Button size="sm" onClick={() => setDay(new Date())}>
              Dnes
            </Button>
            <Button size="sm" onClick={() => setDay(new Date(day.getTime() + DAY_MS))}>
              ›
            </Button>
          </>
        }
      />

      <Grid>
        <Stack>
          <Card title={`Schůzky (${events.length})`}>
            {events.length === 0 ? (
              <Note>{isToday ? 'Dnes nemáte žádnou schůzku.' : 'Nic naplánovaného.'}</Note>
            ) : (
              events.map((e) => (
                <Row
                  key={e.id}
                  leading={
                    <span className="w-12 shrink-0 tabular-nums">
                      {e.allDay ? (
                        <span className="text-copy-13 text-[var(--ds-gray-900)]">celý den</span>
                      ) : (
                        <>
                          <span className="text-copy-14 block text-[var(--ds-gray-1000)]">
                            {formatTime(e.startAt)}
                          </span>
                          <span className="text-copy-13 block text-[var(--ds-gray-700)]">
                            {formatTime(e.endAt)}
                          </span>
                        </>
                      )}
                    </span>
                  }
                  title={e.title}
                  subtitle={
                    e.travelMinutesEstimate
                      ? `cesta ${e.travelMinutesEstimate} min`
                      : e.place ?? undefined
                  }
                  onClick={e.caseFileId ? () => go(`/spis/${e.caseFileId}`) : undefined}
                />
              ))
            )}
          </Card>

          {birthdays.length > 0 ? (
            <Card title="Narozeniny">
              {birthdays.map((c) => (
                <Row
                  key={c.id}
                  title={c.displayName}
                  subtitle={`${day.getFullYear() - new Date(c.birthDate).getFullYear()} let`}
                  onClick={() => go(`/dite/${c.id}`)}
                />
              ))}
            </Card>
          ) : null}
        </Stack>

        <Stack>
          {overdue.length > 0 ? (
            <Card title={`Po termínu (${overdue.length})`}>
              {overdue.map((t) => (
                <TaskRow key={t.id} task={t} go={go} />
              ))}
            </Card>
          ) : null}

          <Card title={`Úkoly (${rest.length})`}>
            {rest.length === 0 ? <Note>Nic otevřeného.</Note> : rest.map((t) => (
              <TaskRow key={t.id} task={t} go={go} />
            ))}
          </Card>
        </Stack>
      </Grid>
    </Screen>
  )
}

function TaskRow({ task, go }: { task: data.TaskRow; go: (r: string) => void }) {
  const local = useLocal()
  return (
    <div className="flex items-center gap-3 border-b border-[var(--ds-gray-alpha-400)] px-4 py-2.5 last:border-0">
      <button
        type="button"
        aria-label="Hotovo"
        onClick={() => local.toggleTask(task.id)}
        className="h-4 w-4 shrink-0 rounded border border-[var(--ds-gray-600)] hover:border-[var(--ds-purple-700)]"
      />
      <button
        type="button"
        onClick={() => (task.caseFileId ? go(`/spis/${task.caseFileId}`) : undefined)}
        className="min-w-0 flex-1 text-left"
      >
        <span className="text-copy-14 block text-[var(--ds-gray-1000)]">{task.title}</span>
        {task.subjectDisplayName ? (
          <span className="text-copy-13 block truncate text-[var(--ds-gray-900)]">
            {task.subjectDisplayName}
          </span>
        ) : null}
      </button>
      {task.dueOn ? <Chip tone={dueTone(task.dueOn)}>{dueLabel(task.dueOn)}</Chip> : null}
    </div>
  )
}
