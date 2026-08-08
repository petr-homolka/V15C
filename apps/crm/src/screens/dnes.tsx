/**
 * Dnešek — schůzky a úkoly.
 *
 * Den je **seznam, ne mřížka**. Hodinová osa vypadá jako kalendář v počítači,
 * ale na mobilu z ní tři čtvrtiny plochy zabírá prázdná noc. Čas nese řádek.
 */

import { useState } from 'react'
import * as data from '../demo/data'
import { useLocal } from '../local'
import { usePersona } from '../persona'
import {
  Card, Divider, GroupTitle, LargeTitle, Meta, Note, Row, Screen,
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
    .filter((e) => (!mine || e.ownerPersonId === mine) && new Date(e.startAt).toDateString() === day.toDateString())
    .sort((a, b) => a.startAt.localeCompare(b.startAt))

  const tasks = data
    .tasks(orgId)
    .filter((t) => !mine || t.assigneePersonId === mine)
    .filter((t) => t.status === 'open' && !local.doneTasks.has(t.id))
    .sort((a, b) => (a.dueOn ?? '').localeCompare(b.dueOn ?? ''))

  const overdue = tasks.filter((t) => t.dueOn && new Date(t.dueOn) < new Date(new Date().toDateString()))
  const rest = tasks.filter((t) => !overdue.includes(t))

  const birthdays = data.children(orgId).filter((c) => {
    const b = new Date(c.birthDate)
    return b.getDate() === day.getDate() && b.getMonth() === day.getMonth() && !c.careEndedOn
  })

  return (
    <Screen>
      <LargeTitle
        title={isToday ? 'Dnes' : formatWeekday(day)}
        subtitle={formatDate(day.toISOString())}
        right={
          <div className="flex gap-1 pt-1">
            <Step onClick={() => setDay(new Date(day.getTime() - DAY_MS))}>‹</Step>
            <Step onClick={() => setDay(new Date(day.getTime() + DAY_MS))}>›</Step>
          </div>
        }
      />

      {birthdays.length > 0 ? (
        <Card>
          {birthdays.map((c, i) => (
            <div key={c.id}>
              {i > 0 ? <Divider /> : null}
              <Row
                title={`Narozeniny — ${c.displayName}`}
                subtitle={`${day.getFullYear() - new Date(c.birthDate).getFullYear()} let`}
              />
            </div>
          ))}
        </Card>
      ) : null}

      <GroupTitle>Schůzky</GroupTitle>
      <Card>
        {events.length === 0 ? (
          <Note>{isToday ? 'Dnes nemáte žádnou schůzku.' : 'Nic naplánovaného.'}</Note>
        ) : (
          events.map((e, i) => (
            <div key={e.id}>
              {i > 0 ? <Divider /> : null}
              <Row
                leading={
                  <div className="w-14 shrink-0 py-3">
                    {e.allDay ? (
                      <div className="text-copy-14 text-[var(--ds-gray-900)]">celý den</div>
                    ) : (
                      <>
                        <div className="text-copy-16 text-[var(--ds-gray-1000)]">{formatTime(e.startAt)}</div>
                        <div className="text-copy-14 text-[var(--ds-gray-700)]">{formatTime(e.endAt)}</div>
                      </>
                    )}
                  </div>
                }
                title={e.title}
                subtitle={
                  e.travelMinutesEstimate ? `cesta ${e.travelMinutesEstimate} min` : e.place ?? undefined
                }
                onClick={e.caseFileId ? () => go(`/spis/${e.caseFileId}`) : undefined}
              />
            </div>
          ))
        )}
      </Card>

      {overdue.length > 0 ? (
        <>
          <GroupTitle>Po termínu</GroupTitle>
          <Card>
            {overdue.map((t, i) => (
              <div key={t.id}>
                {i > 0 ? <Divider /> : null}
                <TaskRow task={t} go={go} />
              </div>
            ))}
          </Card>
        </>
      ) : null}

      <GroupTitle>Úkoly</GroupTitle>
      <Card>
        {rest.length === 0 ? (
          <Note>Nic otevřeného.</Note>
        ) : (
          rest.map((t, i) => (
            <div key={t.id}>
              {i > 0 ? <Divider /> : null}
              <TaskRow task={t} go={go} />
            </div>
          ))
        )}
      </Card>
    </Screen>
  )
}

function TaskRow({ task, go }: { task: data.TaskRow; go: (r: string) => void }) {
  const local = useLocal()
  return (
    <Row
      leading={
        <button
          type="button"
          aria-label="Hotovo"
          onClick={() => local.toggleTask(task.id)}
          className="my-3 h-[22px] w-[22px] shrink-0 rounded-full shadow-[0_0_0_1.5px_var(--ds-gray-500)]"
        />
      }
      title={task.title}
      wrapTitle
      subtitle={task.subjectDisplayName ?? undefined}
      meta={
        task.dueOn ? <Meta tone={dueTone(task.dueOn)}>{dueLabel(task.dueOn)}</Meta> : undefined
      }
      onClick={task.caseFileId ? () => go(`/spis/${task.caseFileId}`) : undefined}
    />
  )
}

function Step({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-copy-16 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-[var(--ds-shadow-border-small)]"
    >
      {children}
    </button>
  )
}
