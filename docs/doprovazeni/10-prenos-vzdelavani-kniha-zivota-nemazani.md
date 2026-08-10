# 10 — Přenos vzdělávání, kniha života, skupinová vlákna a zákaz mazání

Navazuje na [09](./09-komunikace-aplikace-pro-rodice-onboardingy.md).
**Přepisuje sekci 6 dokumentu 09** v otázce vzdělávacího období.

---

## 1. Zaznamenaná rozhodnutí

| Otázka | Rozhodnutí |
| --- | --- |
| Vzdělávání při přechodu | **přenáší se** — splněné hodiny se započítají i u nové organizace |
| Kniha života | existuje pro **dítě, rodiče, pěstouna**; rodič má přístup **až po schválení dítětem, pěstounem a Klíčovou osobou** |
| Skupinová vlákna | **ano** |
| Přístup po zániku dohody | **zaniká ihned**; při přechodu v rámci systému se změní jen organizace a Klíčová osoba, **historii vidí dál**; při odchodu ze systému dostane Závěrečnou zprávu a přístup se **deaktivuje** |
| Mazání | **v systému se nikdy nic nemaže. Nikdy.** |

---

## 2. Přenos vzdělávání — rozhodnutí a jeho model

Rozhodl jsi, že se hodiny přenášejí. To zavírá mezeru, na kterou jsem upozorňoval:
přechod k jiné organizaci **nemůže vynulovat zákonnou povinnost**.

### Důsledek pro model: období je osobní, ne dohodové

Dosud jsem období ukotvoval datem uzavření dohody, protože tak to říká § 47a odst. 3.
Přenášejí-li se hodiny, je logičtější, aby **povinnostní cyklus patřil osobě** a přežil
změnu dohody:

```ts
interface EducationPeriod {
  personId: string
  anchorSource: 'first_agreement' | 'current_agreement'   // nastavitelné
  anchorDate: string          // u 'first_agreement' se při přechodu NEMĚNÍ
  agreementIds: string[]      // období může přesahovat víc dohod
  requiredHours: number       // 18 / 24 podle typu PP v daném okamžiku
  carriedInHours: number      // převod z předchozího období (§ 47a odst. 3)
  completedHours: number      // včetně hodin z předchozí organizace
  transferredInHours: number  // z toho přeneseno při přechodu — vykazuje se zvlášť
}
```

Příklad podle tvého zadání: pěstoun má u staré organizace splněné **3 hodiny**,
přechází 1. 1. Nové období nevzniká — pokračuje to původní, jen se k němu přidá nová
dohoda. Zbývá mu **21 hodin** (při 24), ne 24.

`transferredInHours` je oddělené záměrně: nová organizace musí vidět, **co si přinesl**
a co u ní splnil, protože ze SPVPP hradí jen to druhé.

### Právní poznámka, kterou nechávám v dokumentu

Doslovný text § 47a odst. 3 (*„První období … počíná běžet ke dni uzavření dohody“*)
by šel čtený i tak, že nová dohoda zakládá nové období. Tvoje čtení je opačné a je
věcně obhajitelnější, protože povinnost je uložena **osobě**, ne organizaci.

Model proto nese `anchorSource` jako **nastavitelný** parametr (dok. 07 sekce 1),
takže kdyby MPSV nebo krajský úřad zaujaly jiný výklad, změní se konfigurace, ne kód.
Výchozí hodnota: **`first_agreement`** podle tvého rozhodnutí.

---

## 3. Kniha života

Metodika ji zmiňuje jako nástroj podpory identity dítěte ve vztahu k jeho původu —
i tam, kde dítě není s rodiči v kontaktu.

```ts
interface LifeBook {
  childId: string
  // Kniha je DÍTĚTE. Ostatní do ní přispívají.
  entries: Array<{
    id: string
    authorPersonId: string
    authorRole: 'child' | 'caregiver' | 'key_person' | 'parent' | 'relative'
    kind: 'story' | 'photo' | 'document' | 'milestone' | 'memory' | 'family_tree'
    content: string
    attachmentIds: string[]
    occurredOn: PartialDate | null       // kdy se to stalo, ne kdy se to zapsalo
    createdAt: string
    visibleTo: string[]
  }>
  parentAccess: ParentAccessGrant[]
}
```

### Trojí schválení přístupu rodiče

```ts
interface ParentAccessGrant {
  parentPersonId: string
  approvals: {
    child:      { approvedAt: string | null; byPersonId: string | null }
    caregiver:  { approvedAt: string | null; byPersonId: string | null }
    keyPerson:  { approvedAt: string | null; byPersonId: string | null }
  }
  status: 'pending' | 'granted' | 'revoked'
  scope: 'read' | 'read_and_propose'
  revokedAt: string | null
  revokedByPersonId: string | null
  revokedReason: string | null
}
```

**Udělení vyžaduje všechny tři.** Chybí-li jedno, přístup nevznikne.

### Odvolání navrhuji asymetricky — a to je záměr

> **Udělení potřebuje tři souhlasy. Odvolání stačí jeden.**

Kdyby odvolání vyžadovalo také shodu tří, znamenalo by to, že dítě, které se rozhodne,
že už nechce, aby rodič jeho knihu viděl, musí přesvědčit ještě dva další lidi. To je
u nástroje na identitu dítěte špatně nastavené. Souhlas dítěte navíc podle standardu
**2a.3** není formalita — má se mu „přikládat váha“.

Proto: kdokoli ze tří může přístup odvolat, s uvedením důvodu. Odvolání je okamžité.

### Kniha po odchodu z péče — potvrzeno: zůstává trvale

Kniha je **dítěte** a **zůstává v systému trvale**, i po zletilosti. Dítě k ní má
**trvalý přístup**; export je navíc, ne náhrada.

Dva důsledky, které je nutné podchytit:

1. **Účet dítěte musí přežít konec umístění.** Přístup se nesmí odvozovat od aktivního
   `Placement` ani od dohody — jinak by kniha zletilému zmizela právě v okamžiku, kdy ji
   potřebuje nejvíc. Je to stejná lekce jako u pěstouna (sekce 5): **přístup plyne
   z toho, že je subjektem těch dat.**
2. **Po zletilosti je to dospělý s plnými právy subjektu údajů** — může žádat i o další
   údaje ze svého spisu, nejen o knihu. To je nad rámec knihy života, ale model s tím
   musí počítat, protože ta osoba v systému zůstane.

### Dítě vidí, kdo do knihy vidí — potvrzeno

V dětské aplikaci je přehled: kdo má ke knize přístup, od kdy a v jakém rozsahu.
Dítě odtud může přístup rovnou **odvolat** — samo, bez souhlasu ostatních
(asymetrické pravidlo výše).

### Přispívání rodiče — potvrzeno

`scope: 'read'` je výchozí, `'read_and_propose'` volitelný. Rodičův příspěvek **nejde
do knihy přímo**, ale do schvalování. Fotky dítěte z doby před umístěním jsou často to
nejcennější, co může přinést; kniha ale nesmí být kanál pro nevhodné vzkazy.

```ts
interface LifeBookEntry {
  // …
  status: 'draft' | 'proposed' | 'approved' | 'rejected'
  proposedByPersonId: string | null
  reviewedByPersonId: string | null
  reviewedAt: string | null
  rejectionReason: string | null
}
```

**Kdo schvaluje jednotlivý příspěvek:** navrhuji **Klíčovou osobu** — je to profesionál
odpovědný za nejlepší zájem dítěte a vyžadovat u každé fotky znovu shodu tří lidí by
knihu zadusilo. Dítě pak může kterýkoli příspěvek ze své knihy **nechat odebrat**, což
odpovídá tomu, že kniha je jeho, i asymetrickému pravidlu výše. Odebraný příspěvek se
nemaže, jen přestane být součástí knihy (sekce 6).

---

## 4. Skupinová vlákna

Doplňuji do modelu z dok. 09 sekce 2 tři pravidla, bez kterých by skupiny narušily ta
dvě bezpečnostní pravidla:

1. **Žádné implicitní členství.** Skupina vzniká výslovným výběrem účastníků. Nikdy ne
   „všichni na případu“.
2. **Přidání účastníka je viditelná událost pro všechny členy.** Nikdo nesmí být do
   vlákna přidán tiše — kdyby šlo někoho přidat nepozorovaně, celá důvěryhodnost
   soukromých vláken padá.
3. **Varování při překročení hranice.** Vytváří-li se skupina, která obsahuje současně
   biologického rodiče a pěstouna, nebo dítě a pěstouna tam, kde dítě má i soukromé
   vlákno, systém na to výslovně upozorní a vyžádá potvrzení. Nezakazuje to — může to
   být zamýšlené (společná schůzka) — ale nesmí se to stát omylem.

Odchod nebo odebrání z vlákna se **zaznamená**; už odeslané zprávy zůstávají viditelné
těm, kdo je viděli (sekce 6).

---

## 5. Životní cyklus přístupu pěstouna

```
Dohoda aktivní
   └── pěstoun má přístup ke svým agendám

Dohoda zaniká
   ├── A) Přechází k jiné organizaci V SYSTÉMU
   │      → přístup pokračuje bez přerušení
   │      → v profilu se mění: NÁZEV ORGANIZACE + KLÍČOVÁ OSOBA
   │      → HISTORII VIDÍ DÁL (i tu od předchozí organizace)
   │
   └── B) Odchází ze systému
          → dostane Závěrečnou zprávu
          → přístup se DEAKTIVUJE (data zůstávají, viz sekce 6)
```

### Jedna subtilita, kterou je snadné implementovat špatně

Pěstoun vidí **svou historii napříč organizacemi**. Nová organizace ale **nevidí
záznamy staré organizace** (dok. 09 sekce 6). To nejsou protimluvy — jsou to **dvě
různé projekce nad týmiž daty**:

| Projekce | Rozsah |
| --- | --- |
| **Pěstounova vlastní** | vše, co se týká jeho, napříč organizacemi — je to jeho právo na přístup k vlastním údajům |
| **Organizační** | jen to, kde je organizace v `orgAccessList` |

Implementačně to znamená, že přístup pěstouna **nesmí být odvozen z členství
v organizaci**, ale z toho, že je subjektem daných dat. Kdyby se to postavilo přes
organizační scope, buď by pěstoun po přechodu ztratil historii, nebo by nová
organizace získala přístup ke staré — obojí špatně.

Zákonná zpráva při zániku (§ 47b odst. 5) tedy plní ve variantě B i praktickou roli:
je to poslední věc, kterou pěstoun dostane, a proto musí být **vygenerovaná
a předaná dřív**, než se přístup deaktivuje.

---

## 6. „Nikdy se nic nemaže“ — a jak to skloubit se skartací

Beru to jako architektonické pravidlo napříč systémem:

- **Žádné hard delete.** Nikde, žádnou rolí, ani superadminem.
- **Oprava je nová verze**, ne přepis. Původní hodnota zůstává čitelná v historii,
  včetně kdo a kdy ji změnil a proč.
- **Deaktivace místo smazání**: `deactivatedAt`, `supersededById`, `status`.
- **Zprávy, zápisy, výkazy, checklisty, podpisy** jsou append-only už z povahy spisu.
- **Autorství se nikdy neanonymizuje** (dok. 03 sekce 1).

### Jedna faktická tenze, kterou musím zmínit

„Nikdy nic nemazat“ naráží na dvě věci, které jsou v této agendě také zákonné:

1. **Skartační řád** — na spisovou dokumentaci se vztahuje zákon č. 499/2004 Sb.
   o archivnictví a spisové službě. Po uplynutí lhůty se spis **posuzuje ve skartačním
   řízení**; původní zadání (M5) s tím počítalo.
2. **GDPR čl. 5 odst. 1 písm. e)** — osobní údaje se nemají uchovávat déle, než je
   nutné. Právo na výmaz (čl. 17) je tu naopak z většiny **vyloučené**, protože
   zpracování plyne ze zákonné povinnosti a § 57 ZSPOD ho pověřené osobě výslovně
   umožňuje. Takže „nemazat“ je po dobu běhu lhůt v pořádku — problém je až **po** nich.

### Návrh, který drží obojí

> **V aplikaci se nemaže nikdy. Vyřazení existuje výhradně jako samostatné, auditované
> skartační řízení na úrovni platformy — a i to po sobě nechává záznam, že proběhlo.**

```ts
interface DisposalProcedure {
  caseFileId: string
  retentionBasis: string          // právní titul lhůty
  retentionExpiredOn: string
  proposedOn: string
  approvedByPersonId: string | null
  executedOn: string | null
  outcome: 'archived' | 'anonymized' | 'disposed'
  // ZŮSTÁVÁ NAVŽDY, i když obsah spisu už ne:
  tombstone: { caseFileUid: string; personUids: string[]; disposedContentHash: string }
}
```

Rozdíl proti mazání je podstatný: **nikdo v systému nemá tlačítko smazat**. Vyřazení je
právní procedura s návrhem, schválením a nezničitelným záznamem o tom, co bylo vyřazeno
a kdy. Tím je tvoje pravidlo splněné v tom, co znamená prakticky — data nezmizí omylem,
zlovolně ani „úklidem“ — a zároveň systém neblokuje zákonnou skartaci.

Pro MVP to znamená: **stavíme jen append-only a deaktivace.** Skartační řízení je
odložené (dok. 08), ale model už nese `retentionBasis`, aby se dalo doplnit bez migrace.

---

## 7. Dopad na rozsah

| Přidáno do MVP | Poznámka |
| --- | --- |
| **Kniha života** s trojím schválením a asymetrickým odvoláním | tvé rozhodnutí |
| **Skupinová vlákna** včetně tří ochranných pravidel | tvé rozhodnutí |
| **Přenos vzdělávacích hodin** při přechodu | tvé rozhodnutí |
| **Append-only napříč systémem**, deaktivace místo mazání | architektonické pravidlo |
| Export knihy života pro dítě | při odchodu z péče |

---

## 8. Uzavřená rozhodnutí ke knize života

| Otázka | Rozhodnutí |
| --- | --- |
| Přispívání rodiče | **jen čtení jako výchozí**; návrhy ke schválení jako volba |
| Kniha po zletilosti | **zůstává v systému trvale**, dítě má trvalý přístup |
| Vidí dítě, kdo má přístup | **ano**, a může ho samo odvolat |

Zbývá jen jedno, a je to návrh, ne otevřená otázka: **schvalovatelem jednotlivého
příspěvku rodiče navrhuji Klíčovou osobu** (sekce 3). Pokud chceš místo toho vyžadovat
shodu více lidí, řekni — je to jednořádková změna v konfiguraci, ne v modelu.
