# 12 — Úkoly, časová osa, dokumenty a chat: propojovací vrstva

Navazuje na [11](./11-kalendar-a-rizeni-casu.md).

---

## 0. Poctivá odpověď na otázku „máš to integrované?“

**Ne, kromě chatu.** Prošel jsem si dokumenty a stav byl tento:

| Modul | Stav před tímto dokumentem |
| --- | --- |
| **Chat** | ✓ navržený — `MessageThread` v dok. 09, skupinová vlákna v dok. 10 |
| **Úkoly** | ✗ **jediná zmínka** ve třech dokumentech, žádný model |
| **Časová osa** | ✗ zmínky v pěti dokumentech, vždy jen v jiné souvislosti, žádný model |
| **Dokumenty** | ✗ totéž — zmiňované u PDF a podpisů, ale nikdy nenavržené |

Všechny tři jsem odškrtával v seznamu MVP, protože byly v původním zadání — ale nikdy
jsem je nenavrhl a **nikdy nepropojil** s tím, co vzniklo potom: s checklisty, plány,
lhůtami, podpisy, knihou života ani asistovanými kontakty. To je vážnější než chybějící
model, protože právě ty tři jsou místa, kam všechno ostatní ústí.

Tento dokument to napravuje.

---

## 1. Jeden princip, který to drží pohromadě

```
Časová osa   = PROJEKCE, ne úložiště
Úkoly        = lidské záměry
Lhůty        = zákon (dok. 11)
Dokumenty    = artefakty
Chat         = průběžná komunikace
```

> **Časová osa nic neukládá. Je to tenký index ukazatelů na typované entity.**

Kdyby si každá entita psala kopii do „logu časové osy“, vznikla by duplikace, rozpad
konzistence a dvě verze pravdy. Místo toho každá entita při vzniku zapíše **tenký
záznam do indexu** a obsah zůstane u sebe.

Tři věci z toho vypadnou zdarma:

1. **Rozdělení metadata / obsah** z dok. 04 funguje samo — index je metadata (OSPOD vidí
   „návštěva 14. 6.“), obsah je za ním v omezené podkolekci.
2. **Offline je levné** — synchronizuje se index, obsah se dotahuje na vyžádání
   (dok. 02 sekce 5).
3. **„Nikdy se nic nemaže“** (dok. 10) platí automaticky — index je append-only sada
   ukazatelů.

```ts
interface TimelineEntry {
  id: string
  caseFileId: string
  occurredAt: string                // KDY se to stalo, ne kdy se to zapsalo
  recordedAt: string

  refType: 'monitoring_contact' | 'contact_event' | 'note' | 'dictation'
         | 'document' | 'plan' | 'report' | 'education_record' | 'care_episode'
         | 'message_thread' | 'signature' | 'obligation' | 'handover' | 'transfer'
         | 'life_book_entry' | 'expense'
  refId: string

  actorPersonId: string             // autorství se nikdy neanonymizuje (dok. 03)
  subjectRefs: Array<{ type: 'family'|'caregiver'|'child'; id: string }>

  visibilityClass: 'metadata' | 'content'   // dok. 04
  summary: string                   // krátký titulek do proudu, bez citlivého detailu
}
```

`occurredAt` odděleně od `recordedAt` je podstatné: návštěva se často zapisuje večer
nebo druhý den, a časová osa má ukazovat, kdy se to **stalo**.

Volný záznam, který není žádnou jinou entitou (telefonát, poznámka), je samostatný typ:

```ts
interface TimelineNote {
  kind: 'call' | 'note' | 'email' | 'other'
  body: string                      // obsah — omezená podkolekce
  dictationId: string | null        // vzniklo-li z diktátu
}
```

---

## 2. Úkoly — a proč to nejsou lhůty

Původní zadání dalo úkolům název, popis, stav, prioritu, termín, odpovědného, vazbu na
více subjektů, podúkoly a kanban. To zůstává. Doplňuji dvě věci, které z toho dělají
součást systému, a ne oddělený seznam.

### Doplnění první: úkoly skoro nikdy nevznikají psaním

```ts
interface Task {
  organizationId: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done' | 'cancelled'   // 'cancelled', nikdy smazání
  priority: 'low' | 'normal' | 'high' | 'urgent'
  dueDate: string | null
  assignedPersonId: string
  creatorPersonId: string
  subjectRefs: Array<{ type: 'family'|'caregiver'|'child'; id: string }>
  subtasks: Array<{ id: string; title: string; done: boolean }>   // ukazatel „2/5“

  // TOHLE je integrace:
  origin: {
    kind: 'manual' | 'dictation' | 'checklist_item' | 'plan_goal_step'
        | 'obligation' | 'message' | 'report_review' | 'standard_criterion'
    refId: string | null
  }
  servesObligationId: string | null
}
```

Úkol vzniká z diktátu (dok. 02 sekce 4.1), z položky checklistu, z kroku cíle v plánu,
ze zprávy v chatu, z revize zprávy. Ruční zadání je ta nejmenší cesta, ne hlavní.

### Doplnění druhé: úkol nesmí být tím, co vykazuje splnění lhůty

> **Lhůta se nesplní zaškrtnutím úkolu.** Splní ji **skutečný záznam** — kontakt,
> zpráva, vzdělávací záznam.

`servesObligationId` je jen vazba „tento úkol slouží té lhůtě“. Stav lhůty se dopočítává
z `MonitoringContact`, `Report` a dalších (dok. 11 sekce 2), **nikdy z úkolu**.

Je to tentýž druh chyby jako jedno zaškrtávátko „návštěva proběhla“ (dok. 11 sekce 3):
kdyby zaškrtnutý úkol „navštívit Novákovy“ vykázal splnění zákonné lhůty bez záznamu
o kontaktu, systém by tvrdil soulad, který neexistuje. U agendy, kterou kontroluje
inspekce, je to ten nejhorší možný typ chyby.

### Kdo úkoly má

Úkoly jsou **interní** — Klíčová osoba, vedoucí, `org_admin`. **Pěstoun je nemá.**
Jeho portál je zúžený na vzdělávání a respity (dok. 04), a co po něm organizace chce,
k němu přichází jako **žádost, čekající podpis nebo zpráva v chatu**, ne jako přidělený
úkol. Nechci pěstounovi posílat úkolovník.

Přidělení úkolu kolegovi **vyžaduje online** — je to sdílená entita, server je autorita
(stejné pravidlo jako u kalendáře, dok. 11 sekce 7).

---

## 3. Dokumenty — a co k nim žádá standard 13a

Dokumenty jsou uzel s nejvíc vazbami: vzniká sem plán, zpráva, dohoda, certifikát,
účtenka, výkaz hlídání, doručenka, souhlas ORP, rozhodnutí soudu, fotka z chatu.

```ts
interface Document {
  caseFileId: string
  category: 'agreement' | 'agreement_consent' | 'court_decision' | 'plan_10c'
          | 'plan_10d' | 'report_6m' | 'final_report' | 'ospod_report'
          | 'certificate' | 'receipt' | 'care_log' | 'delivery_receipt'
          | 'declaration' | 'life_book' | 'other'
  title: string

  origin: 'generated' | 'uploaded' | 'chat_attachment' | 'checklist_photo' | 'imported'
  sourceRefId: string | null          // z čeho vzniklo

  // verze — nikdy se nepřepisuje, nikdy nemaže (dok. 10)
  versions: Array<{
    versionNo: number
    storagePath: string
    contentHash: string               // vazba na podpis (dok. 08)
    createdByPersonId: string
    createdAt: string
    supersededByVersionNo: number | null
  }>

  signatureCeremonyId: string | null
  retentionBasis: string | null        // pro skartační řízení (dok. 10)
  visibilityClass: 'metadata' | 'content'
}
```

### Co ze standardu 13a plyne a v modelu nebylo

Kritérium 13a žádá pravidla pro **založení, uzavření, zapůjčení spisu, nahlížení do
spisové dokumentace, pořizování kopií a odmítnutí žádosti o nahlédnutí**. To znamená
tři věci, které jsem dosud neměl:

```ts
interface CaseFileLending {              // ZAPŮJČENÍ spisu
  caseFileId: string
  lentToPersonId: string | null
  lentToAuthorityId: string | null
  lentOn: string
  returnDueOn: string | null
  returnedOn: string | null
  purpose: string
}

interface DocumentAccessLog {            // NAHLÍŽENÍ — i pouhé zobrazení
  documentId: string
  personId: string
  action: 'view' | 'download' | 'copy' | 'print'
  at: string
}

interface InspectionRequest {            // ŽÁDOST O NAHLÉDNUTÍ, včetně odmítnutí
  caseFileId: string
  requestedByPersonId: string
  requestedOn: string
  decision: 'granted' | 'partially_granted' | 'refused' | null
  decidedOn: string | null
  refusalReason: string | null           // 13a výslovně žádá pravidla pro odmítnutí
  scopeGranted: string | null
}
```

**Logování pouhého zobrazení** je nepříjemné na objem dat, ale plyne to ze dvou stran
zároveň: 13a žádá pravidla pro nahlížení a původní zadání (M5) chtělo audit i pro
**zobrazení** citlivých údajů dětí. Bez toho nejde dokázat, kdo se komu do spisu díval.

---

## 4. Chat — co k němu doplňuji

Model je z dok. 09. Doplňuji tři propojení:

1. **Příloha se stává dokumentem.** Fotka účtenky poslaná v chatu neskončí ve vlákně —
   vytvoří `Document` s kategorií a vazbou na spis. To je přesně to, čím má vlastní chat
   předčit WhatsApp (dok. 09 sekce 2): fotka je hned na správném místě.
2. **Do časové osy jde vlákno, ne každá zpráva.** Sto zpráv by proud utopilo. V ose je
   jeden záznam za vlákno, který se aktualizuje: *„Vlákno s pěstounkou · 12 zpráv ·
   poslední 14. 6.“* Klik vede do vlákna.
3. **Připnutí zprávy do spisu.** Když v chatu padne něco podstatného (domluva o termínu
   respitu, sdělení o zdravotním stavu), Klíčová osoba to **připne** — vznikne
   samostatný záznam v časové ose s odkazem na tu zprávu. Zpráva se nekopíruje.

```ts
interface PinnedMessage {
  messageId: string
  threadId: string
  pinnedByPersonId: string
  reason: string | null
}
```

---

## 5. Kdo co zakládá — propojovací tabulka

| Vznikne | → časová osa | → úkol | → dokument | → lhůta |
| --- | --- | --- | --- | --- |
| **Diktát** (AI, dok. 02) | ✓ záznam nebo návrh záznamu | ✓ návrhy úkolů | — | — |
| **Návštěva** (`MonitoringContact`) | ✓ | — | — | ✓ **plní** styk, per dítě |
| **Checklist na návštěvě** | ✓ | ✓ z položek | ✓ fotky | — |
| **Asistovaný kontakt** | ✓ + vyhodnocení | ✓ z příprav | — | — |
| **Plán 10c / 10d** | ✓ vznik a revize | ✓ z kroků cílů | ✓ podepsané PDF | ✓ revize plánu |
| **Zpráva o průběhu PP** | ✓ | ✓ z revize | ✓ PDF + doručenky | ✓ **plní** 6 měsíců, 15 dnů |
| **Vzdělávací záznam** | ✓ | — | ✓ certifikát | ✓ **plní** hodiny |
| **Respitní epizoda** | ✓ | — | ✓ doklad | ✓ čerpání dnů |
| **Výdaj / žádost** | ✓ (nízká priorita) | ✓ ke schválení | ✓ doklad | — |
| **Chat** | ✓ na úrovni vlákna | ✓ ze zprávy | ✓ z přílohy | — |
| **Podpisový obřad** | ✓ | ✓ čeká na podpis | ✓ podepsaná verze | — |
| **Přechod pěstouna** | ✓ | ✓ příprava dohody | ✓ závěrečná zpráva | ✓ okno kódu |
| **Předání Klíčové osoby** | ✓ | ✓ otevřené body | ✓ protokol | — |
| **Kniha života** | ✓ (jen fakt vzniku) | ✓ návrh ke schválení | ✓ přílohy | — |

Poslední řádek s výhradou: do časové osy spisu jde jen **fakt**, že příspěvek vznikl.
Kniha je dítěte (dok. 10) a její obsah není pracovní dokumentace.

---

## 6. Kam ústí AI diktát

Původní zadání (M4) chtělo, aby diktát vytvořil zápis do časové osy, úkoly a událost
v kalendáři a spároval jména s entitami. Navrhl jsem to v dok. 02 sekce 4.1 —
**dřív, než tyhle tři moduly měly model.** Teď to jde zapojit:

```
Diktát (text, pseudonymizovaný — dok. 02 sekce 6)
   ├── TimelineNote            kind: 'dictation'
   ├── Task[]                  origin: { kind: 'dictation' }
   ├── CalendarEvent           kind: 'monitoring_visit', délka 1 h (dok. 11)
   └── MonitoringContact       s presentChildIds — pokud diktát popisuje návštěvu
```

Pravidlo z dok. 02 platí bez výjimky: **AI navrhuje, člověk potvrzuje.** Nic z toho
nevznikne bez potvrzení Klíčovou osobou — a co člověk změnil, jde do auditu.

Pozor na `MonitoringContact`: z diktátu se **nesmí** dovodit, které děti byly přítomné,
bez potvrzení. Na tom visí zákonná lhůta per dítě (dok. 11 sekce 3), takže domýšlet
přítomnost dítěte z textu by vyrábělo nepravdivé vykázání souladu.

---

## 7. Offline pro všechny čtyři

| Modul | Offline |
| --- | --- |
| Časová osa | čtení indexu z cache; obsah jen pro stažené spisy |
| Volný záznam / diktát | ✓ zápis do outboxu — jednopisatelské |
| Úkoly vlastní | ✓ zápis; přidělení kolegovi jen online |
| Dokumenty | ✓ nahrání do outboxu s pokračovatelným uploadem; generování PDF na serveru |
| Chat | ✓ odchozí do outboxu, historie z cache |

Uživatel vždy vidí, **co ještě neodešlo** (dok. 02 sekce 5) — u zápisu z návštěvy
je to podstatné, protože odejít od rodiny s nesynchronizovaným zápisem je normální stav,
ale musí být vidět.

---

## 8. Dopad na rozsah

Nic nového do MVP nepřidávám — všechny čtyři už v seznamu byly (dok. 08). Přidávám jim
**model a propojení**, plus tři věci ze standardu 13a, které chyběly:

| Přidáno | Zdroj |
| --- | --- |
| `TimelineEntry` jako tenký index + `TimelineNote` | sekce 1 |
| `Task.origin` a `servesObligationId` | sekce 2 |
| `Document.versions` s `contentHash` | sekce 3, vazba na podpisy |
| `CaseFileLending` | standard 13a — zapůjčení spisu |
| `DocumentAccessLog` | standard 13a + audit zobrazení |
| `InspectionRequest` s odmítnutím | standard 13a |
| `PinnedMessage` | sekce 4 |

---

## 9. Otevřené

1. **Objem logu zobrazení.** Logovat každé otevření dokumentu je hodně zápisů. Navrhuji
   logovat na úrovni **spisu a dne** pro běžné prohlížení a **jednotlivě** pro stažení,
   kopii a tisk. Stačí to, nebo chceš každé zobrazení samostatně?
2. **Výdaje v časové ose** — mají tam být vůbec? Jsou to desítky položek ročně a osu to
   zašumí. Navrhuji je do osy nedávat a nechat je jen ve své agendě.
3. **Kanban úkolů** — zadání ho chce. Na mobilu je kanban nepohodlný; navrhuji na mobilu
   seznam s filtry a kanban jen na desktopu.
