/**
 * Číselníky — rozšiřitelné nabídky s „+ Přidat nové“.
 *
 * Zadání: kde se z něčeho vybírá, nesmí být nabídka konečná. Nové položky
 * vznikají na úrovni organizace, superadmin je může adoptovat pro celý systém,
 * a v nastavení organizace je lze smazat.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ JEDNA VĚC, KTERÁ SE TÍM NESMÍ ROZBÍT                                │
 * │                                                                     │
 * │ Kdyby byl rozšiřitelný KAŽDÝ výběr, přestane fungovat motor lhůt    │
 * │ a výkazy. Když si organizace přidá vlastní „právní důvod péče“,     │
 * │ výpočet vzdělávacích hodin pro něj nemá větev. Když si přidá        │
 * │ vlastní „důvod odmítnutí zájemce“, roční výkaz podle § 49c odst. 4  │
 * │ ho nemá kam zařadit — a zákon zná právě tři.                        │
 * │                                                                     │
 * │ Řešení není zakázat rozšiřování, ale rozdělit ho:                   │
 * │                                                                     │
 * │   UZAVŘENÉ výběry  — vyjmenovává je zákon nebo na nich větví motor. │
 * │                      Nerozšiřují se.                                │
 * │   OTEVŘENÉ číselníky — slovník. Rozšiřují se volně.                 │
 * │   MAPOVANÉ číselníky — rozšiřují se, ale nová položka MUSÍ říct,    │
 * │                      jak se chová: „nový druh vzdělávání“ řekne,   │
 * │                      jestli je to e-learning. Tím zůstane pro       │
 * │                      motor předvídatelná, i když je nová.           │
 * └─────────────────────────────────────────────────────────────────────┘
 */

import type { AuditFields, Id, IsoDate, IsoDateTime } from './common'

/* ------------------------------------------------------------------ */
/* Definice číselníku — platform/registry/codebooks/{code}             */
/* ------------------------------------------------------------------ */

export interface CodebookDef {
  /** 'expense.category', 'education.form', … */
  code: string
  label: string
  /** Kde se ta nabídka v aplikaci objevuje — kvůli orientaci v nastavení. */
  usedIn: string

  kind: 'open' | 'mapped'
  /**
   * U `mapped`: pole, které nová položka musí vyplnit, a povolené hodnoty.
   * Tím se nová položka zařadí do chování, na kterém motor větví.
   */
  behavior: {
    field: string
    label: string
    allowed: string[]
    required: boolean
  } | null

  /** Smí organizace přidávat vlastní položky? U číselníků ano; jinde ne. */
  openForOrgs: boolean
  /** Smí být položka vyřazena z nabídky. */
  retirable: boolean
  note: string | null
}

/* ------------------------------------------------------------------ */
/* Položka číselníku                                                   */
/* ------------------------------------------------------------------ */

/**
 * Žije na dvou místech se stejným tvarem:
 *   platform/registry/codebookItems/{id}   — výchozí sada a adoptované
 *   orgs/{orgId}/codebookItems/{id}        — vlastní položky organizace
 *
 * Výběr v aplikaci je sjednocení obojího. Obě kolekce jsou malé, takže to
 * jsou dva dotazy, které se dají držet v paměti — na rozdíl od dopočítávání
 * z použití, které by bylo drahé (README sekce 1.4).
 */
export interface CodebookItem extends AuditFields {
  id: Id
  codebookCode: string             // 'expense.category'
  /** Strojový kód. U adoptované položky se NEMĚNÍ, aby vazby držely. */
  code: string
  label: string
  description: string | null

  origin: 'platform' | 'organization'
  organizationId: Id | null        // null u platformních

  /** U `mapped` číselníků povinné — viz `CodebookDef.behavior`. */
  behavior: Record<string, string> | null

  order: number
  /** Vyřazená položka se nenabízí, ale v historii zůstává čitelná. */
  status: 'active' | 'retired'
  retiredOn: IsoDate | null
  retiredByPersonId: Id | null
  retiredReason: string | null

  /**
   * Adopce superadminem. Organizační položka se nekopíruje ani neruší —
   * vznikne platformní se STEJNÝM `code` a tady se jen zaznamená, že
   * se to stalo. Ve výběru se položky sjednotí podle `code` a platformní
   * vyhrává, takže se nezdvojí.
   */
  adoption: {
    proposedByOrganizationId: Id
    proposedOn: IsoDate
    decision: 'adopted' | 'rejected' | null
    decidedOn: IsoDate | null
    decidedByPersonId: Id | null
    /** Kód platformní položky, která z toho vznikla. */
    platformItemCode: string | null
    rejectionNote: string | null
  } | null
}

/**
 * Výsledek pokusu o smazání položky.
 *
 * „Smazat“ v UI je jedno tlačítko, ale výsledek závisí na tom, jestli se
 * položka někde použila:
 *
 *   – nepoužitá  → skutečně se odstraní (nic se tím neztrácí);
 *   – použitá    → VYŘADÍ SE z nabídky a zůstane čitelná v historii.
 *
 * Kdyby se použitá položka odstranila, záznamy by ukazovaly na nic a
 * v časové ose i ve zprávě by zůstalo prázdné místo. To je totéž pravidlo
 * jako všude jinde (dok. 10) — jen tady stojí za to říct nahlas, protože
 * uživatel klikl na „Smazat“ a musí se dozvědět, co se stalo.
 */
export interface CodebookDeletionOutcome {
  itemId: Id
  usageCount: number
  action: 'removed' | 'retired'
  /** Text pro uživatele — fakticky, bez poučování (dok. 16). */
  message: string
}

/* ------------------------------------------------------------------ */
/* Katalog číselníků                                                   */
/* ------------------------------------------------------------------ */

/**
 * Které nabídky v systému jsou rozšiřitelné. Seznam je v kódu záměrně —
 * je to rozhodnutí o tom, kde smí flexibilita být, a má být vidět v diffu,
 * ne zahrabané v databázi.
 */
export const CODEBOOKS: readonly CodebookDef[] = [
  {
    code: 'expense.category',
    label: 'Kategorie výdaje',
    usedIn: 'výdaj ve spisu, reporty pro účetní',
    kind: 'mapped',
    behavior: {
      field: 'rightCode',
      label: 'Písmeno práva podle § 47a odst. 2',
      allowed: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'none'],
      required: true,
    },
    openForOrgs: true,
    retirable: true,
    note: 'Bez písmene práva by výdaj nešel zařadit do čerpání SPVPP.',
  },
  {
    code: 'education.form',
    label: 'Forma vzdělávání',
    usedIn: 'záznam o vzdělávání',
    kind: 'mapped',
    behavior: {
      field: 'countsAs',
      label: 'Počítá se jako',
      allowed: ['in_person', 'online_live', 'elearning', 'self_study'],
      required: true,
    },
    openForOrgs: true,
    retirable: true,
    note: 'Limit e-learningu je parametr sady pravidel, takže nová forma musí říct, čím je.',
  },
  {
    code: 'education.topic',
    label: 'Téma vzdělávání',
    usedIn: 'záznam o vzdělávání, vzdělávací plán',
    kind: 'open',
    behavior: null,
    openForOrgs: true,
    retirable: true,
    note: null,
  },
  {
    code: 'education.provider',
    label: 'Poskytovatel vzdělávání',
    usedIn: 'záznam o vzdělávání',
    kind: 'open',
    behavior: null,
    openForOrgs: true,
    retirable: true,
    note: null,
  },
  {
    code: 'contact.place',
    label: 'Místo osobního styku',
    usedIn: 'záznam osobního styku',
    kind: 'mapped',
    behavior: {
      field: 'countsAs',
      label: 'Pro účely § 47b odst. 4 se počítá jako',
      allowed: ['home', 'organization', 'other'],
      required: true,
    },
    openForOrgs: true,
    retirable: true,
    note: 'Kontakt mimo domov se počítá stejně (dok. 11), ale místo se vykazuje.',
  },
  {
    code: 'contact.absenceReason',
    label: 'Důvod nepřítomnosti dítěte',
    usedIn: 'záznam osobního styku',
    kind: 'mapped',
    behavior: {
      field: 'justifiedByDefault',
      label: 'Výchozí omluvitelnost',
      allowed: ['yes', 'no', 'ask'],
      required: false,
    },
    openForOrgs: true,
    retirable: true,
    note: 'Omluvitelnost zůstává rozhodnutím člověka; číselník jen předvyplní.',
  },
  {
    code: 'careEpisode.place',
    label: 'Místo zajištěné péče',
    usedIn: 'respitní péče',
    kind: 'open',
    behavior: null,
    openForOrgs: true,
    retirable: true,
    note: null,
  },
  {
    code: 'careProvider.relation',
    label: 'Vztah poskytovatele péče',
    usedIn: 'profil poskytovatele zajištěné péče',
    kind: 'mapped',
    behavior: {
      field: 'payable',
      label: 'Lze proplatit',
      allowed: ['yes', 'no', 'depends_on_household'],
      required: true,
    },
    openForOrgs: false,
    retirable: false,
    note: 'Manžel v rodinné domácnosti plní vlastní povinnost (§ 965 odst. 3 OZ) — nelze proplatit. Proto uzavřené.',
  },
  {
    code: 'document.category',
    label: 'Kategorie dokumentu',
    usedIn: 'dokumenty ve spisu',
    kind: 'mapped',
    behavior: {
      field: 'family',
      label: 'Skupina',
      allowed: ['legal', 'plan', 'report', 'evidence', 'authority', 'internal', 'other'],
      required: true,
    },
    openForOrgs: true,
    retirable: true,
    note: 'Skupina řídí, co se nabízí k podpisu a co jde do exportu.',
  },
  {
    code: 'task.type',
    label: 'Druh úkolu',
    usedIn: 'úkoly',
    kind: 'open',
    behavior: null,
    openForOrgs: true,
    retirable: true,
    note: null,
  },
  {
    code: 'event.kind',
    label: 'Druh události v kalendáři',
    usedIn: 'kalendář',
    kind: 'open',
    behavior: null,
    openForOrgs: true,
    retirable: true,
    note: null,
  },
  {
    code: 'agenda.code',
    label: 'Agenda pracovníka',
    usedIn: 'členství — poměr agend',
    kind: 'open',
    behavior: null,
    openForOrgs: true,
    retirable: true,
    note: 'Poměr agend je nastavený parametr, ne měření času (dok. 11).',
  },
  {
    code: 'relation.kind',
    label: 'Vztah osoby k dítěti',
    usedIn: 'kontakt s blízkými, asistovaný kontakt',
    kind: 'open',
    behavior: null,
    openForOrgs: true,
    retirable: true,
    note: null,
  },
  {
    code: 'placement.endReason',
    label: 'Důvod ukončení umístění',
    usedIn: 'ukončení umístění dítěte',
    kind: 'mapped',
    behavior: {
      field: 'countsAs',
      label: 'Pro výkazy se počítá jako',
      allowed: [
        'to_permanent_foster', 'to_parents', 'to_guardian', 'to_adoption',
        'to_institution', 'adulthood', 'care_terminated_other', 'child_died',
      ],
      required: true,
    },
    openForOrgs: true,
    retirable: true,
    note: null,
  },
  {
    code: 'authority.kind',
    label: 'Druh úřadu',
    usedIn: 'žádosti úřadů, adresáti zpráv',
    kind: 'mapped',
    behavior: {
      field: 'countsAs',
      label: 'Chová se jako',
      allowed: ['ospod', 'kraj_ku', 'court', 'police', 'prosecutor', 'labour_office', 'other'],
      required: true,
    },
    openForOrgs: true,
    retirable: true,
    note: 'Tři adresáti zprávy podle § 47b odst. 5 jsou uzavřené jinde, tady jde jen o pojmenování.',
  },
] as const

/**
 * Výběry, které se ROZŠIŘOVAT NESMĚJÍ. Seznam je tady, aby se dal otestovat
 * a aby bylo na jednom místě vidět proč.
 */
export const CLOSED_CHOICES: ReadonlyArray<{ field: string; reason: string }> = [
  { field: 'Agreement.carerKind', reason: '§ 2a písm. b) vs c) — jiná výše SPVPP a jiný režim zániku' },
  { field: 'Agreement.custodyBasis', reason: '§ 2a písm. c) vyjmenovává sedm možností; motor podle nich větví' },
  { field: 'ServiceInquiry.refusalReason', reason: '§ 48a odst. 1 písm. d) zná právě tři důvody a výkaz je sčítá zvlášť' },
  { field: 'Report.kind', reason: 'na druhu závisí, jestli se nuluje šestiměsíční cyklus' },
  { field: 'Obligation.kind', reason: 'ke každé lhůtě patří výpočet; nová hodnota by neměla odkud počítat' },
  { field: 'MandateObligation.kind', reason: 'lhůty vůči úřadům plynou ze zákona, ne z praxe organizace' },
  { field: 'Delivery.recipientKind', reason: '§ 47b odst. 5 určuje tři adresáty; čtvrtý by zprávu nedoručil' },
  { field: 'AssistantAction.tier', reason: 'stupeň 3 je platformní ochrana, organizace ho nesmí uvolnit (dok. 15)' },
  { field: 'VisibilityClass', reason: 'na oddělení metadat a obsahu stojí celý model oprávnění (dok. 04)' },
  { field: 'OrgRole', reason: 'role jsou v tokenu a v pravidlech; nová role by neměla pravidlo' },
]

/** Pro pohodlí: definice podle kódu. */
export function codebookDef(code: string): CodebookDef | undefined {
  return CODEBOOKS.find((c) => c.code === code)
}

/**
 * Sjednocení platformních a organizačních položek pro jeden výběr.
 * Platformní vyhrává nad organizační se stejným `code` — tím se adoptovaná
 * položka nezdvojí. Vyřazené se nenabízejí, ale dají se dohledat.
 */
export function mergeCodebook(
  platformItems: readonly CodebookItem[],
  orgItems: readonly CodebookItem[],
): CodebookItem[] {
  const byCode = new Map<string, CodebookItem>()
  for (const item of orgItems) byCode.set(item.code, item)
  for (const item of platformItems) byCode.set(item.code, item)
  return [...byCode.values()]
    .filter((i) => i.status === 'active')
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label, 'cs'))
}
