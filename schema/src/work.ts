/**
 * Úkoly, vlákna, zprávy, kalendář.
 *
 * Plochá kolekce úkolů na úrovni organizace, aby „moje úkoly“ byl jeden
 * indexovaný dotaz (README sekce 2).
 */

import type { AuditFields, Id, IsoDate, IsoDateTime, Ref } from './common'

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/tasks/{taskId}                                         */
/* ------------------------------------------------------------------ */

/**
 * Úkol NIKDY nezavírá zákonnou lhůtu (dok. 12). Splnění se dopočítává
 * z `MonitoringContact`, `Report` a dalších, nikdy z úkolu — jinak by systém
 * vykazoval soulad podle odškrtnutého políčka.
 *
 * Ruční zadání je ta nejmenší cesta, ne hlavní: úkoly vznikají z lhůty,
 * z revize zprávy, ze zprávy v chatu.
 */
export interface Task extends AuditFields {
  id: Id
  title: string
  detail: string | null

  origin: TaskOrigin
  originRef: Ref | null
  /** Úkol lhůtu POUZE SLOUŽÍ, neplní ji. */
  servesObligationId: Id | null

  caseFileId: Id | null
  caseFileReference: string | null
  subjectDisplayName: string | null

  assigneePersonId: Id | null
  createdForRole: string | null      // úkol pro roli, když ještě není osoba
  dueOn: IsoDate | null
  status: 'open' | 'in_progress' | 'done' | 'cancelled'
  doneAt: IsoDateTime | null
  doneByPersonId: Id | null
}

export type TaskOrigin =
  | 'manual' | 'obligation' | 'message' | 'report_review'
  | 'standard_criterion' | 'checklist_gap' | 'submission' | 'assistant'

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/caseFiles/{cid}/threads/{threadId}                     */
/* ------------------------------------------------------------------ */

/**
 * Vlákno. `kind` rozhoduje o tom, kdo v něm může být — a to je bezpečnostní
 * věc, ne kosmetika:
 *   – 'registry' (podatelna) smí obsahovat jen zaměstnance; dopis od soudu
 *     o jiné rodině ve vlákně s pěstounem by byl únik (dok. 14);
 *   – 'assistant' je soukromé vlákno jednoho člověka s Eli; není to spis
 *     (dok. 15) a Eli tam nikdy nemluví k pěstounovi.
 */
export interface MessageThread extends AuditFields {
  id: Id
  kind: 'case' | 'group' | 'registry' | 'assistant'
  caseFileId: Id | null
  title: string

  participants: Array<{
    personId: Id
    role: 'staff' | 'caregiver' | 'child' | 'relative'
    joinedAt: IsoDateTime
    /** Odchod se zaznamená; už odeslané zprávy zůstanou viditelné (dok. 10). */
    leftAt: IsoDateTime | null
    removedByPersonId: Id | null
  }>

  /* --- denormalizace pro seznam vláken: jeden dotaz --- */
  lastMessageAt: IsoDateTime | null
  lastMessagePreview: string | null
  messageCount: number
  /** Do časové osy jde VLÁKNO, ne každá zpráva — sto zpráv by osu utopilo. */
  timelineEntryId: Id | null
}

/** .../threads/{threadId}/messages/{messageId} */
export interface Message extends AuditFields {
  id: Id
  threadId: Id
  authorPersonId: Id
  text: string
  attachmentDocumentIds: Id[]
  /** Zprávy se nemažou; oprava je nová zpráva, ne přepis historie (dok. 09). */
  supersedesMessageId: Id | null
  editedNote: string | null
  readBy: Array<{ personId: Id; at: IsoDateTime }>
}

/**
 * Připnutí podstatné zprávy do spisu. Zpráva se NEKOPÍRUJE — vzniká
 * samostatný záznam v časové ose s odkazem na ni (dok. 12).
 */
export interface PinnedMessage extends AuditFields {
  id: Id
  caseFileId: Id
  threadId: Id
  messageId: Id
  reason: string | null
}

/* ------------------------------------------------------------------ */
/* orgs/{orgId}/events/{eventId} — kalendář                            */
/* ------------------------------------------------------------------ */

/**
 * Kalendář se chová jako Google Calendar (zadání, dok. 11). Systém
 * NENAVRHUJE termíny ani nesestavuje trasy — termíny si Klíčová osoba
 * domlouvá s pěstounem sama, mimo systém.
 *
 * Čas na cestě je JEN pro plánování, nikdy jako výkaz práce — systém není
 * docházkový.
 */
export interface CalendarEvent extends AuditFields {
  id: Id
  ownerPersonId: Id
  title: string
  kind: 'visit' | 'meeting' | 'education' | 'admin' | 'personal' | 'other'

  startAt: IsoDateTime
  endAt: IsoDateTime
  allDay: boolean
  /** Výchozí předpokládaná doba návštěvy je 1 hodina (zadání, dok. 11). */
  place: string | null

  caseFileId: Id | null
  subjectDisplayName: string | null
  attendeePersonIds: Id[]

  travelMinutesEstimate: number | null
  /** Anonymizovaný iCal export — titulek nesmí prozradit čl. 9 údaje (dok. 11). */
  externalCalendarRef: string | null

  status: 'planned' | 'done' | 'cancelled'
  /** Vazba na zápis, který z návštěvy vznikl. */
  resultEntryId: Id | null
}
