# 19 — Technologie, přihlášení, náklady a monetizace

Uzavírá blokující body **A1** a **A3** z [dok. 00](./00-prehled-a-co-zbyva.md).

---

## 1. Firebase / Firestore — můj názor

**Souhlasím, a to i s tvým hlavním důvodem.** Ale ne úplně z těch důvodů, které jsi
uvedl, a se čtyřmi věcmi, které je potřeba vědět předem.

### Nejsilnější argument je jiný, než sis myslel

Ten opravdu rozhodující důvod je **offline**. Zadání říká mobile-first pro terén
(dok. 02): pracovnice zapisuje v autě a v panelákovém bytě bez signálu. Firestore SDK
má **lokální persistenci a frontu zápisů zabudovanou** — to, co dok. 02 popisuje jako
„outbox“, je u Firestore výchozí chování, ne modul, který bychom psali a pak deset let
opravovali. Napsat spolehlivý offline outbox nad REST API je jedna z nejnáročnějších
věcí v celém projektu; tady se prostě nepíše.

Druhý argument je tvůj a je platný: **AI je ve stejném cloudu.** Vertex AI (Gemini)
v evropském regionu znamená **jednu zpracovatelskou smlouvu místo dvou** a žádný přenos
dat třetímu zpracovateli. Pro data podle čl. 9 o dětech je to podstatné zjednodušení
celého souhlasového a smluvního patra (dok. 02 sekce 6).

Třetí: **nulová správa serverů.** Přesně to, co jsi chtěl — žádný stroj, který někdo
musí za dva roky aktualizovat.

### K té dlouhověkosti

Argument „je to Google, bude to i za desítky let“ bych přijal s mírnou opravou. Google
produkty ruší — ale Firestore je pokračování Datastore, který jede od roku 2008, je
součástí Google Cloud (ne jen Firebase) a stojí na něm placení podnikoví zákazníci.
To je rozumná sázka. Kdyby přesto někdy skončil, cesta ven je export do jiné
dokumentové databáze — proto v modelu držím data v čitelném tvaru a bez chytrostí
vázaných na Firestore.

### Čtyři věci, které je potřeba vědět předem

**1. Region se volí jednou a nedá se změnit.** Databáze musí vzniknout v EU
(`europe-west3` Frankfurt nebo `europe-west1` Belgie). Změna později znamená migraci
celého systému. **Toto je první rozhodnutí, které při zakládání projektu padne, a je
nevratné.**

**2. „GDPR ready“ neplatí o Firebase paušálně.** Firestore, Storage a Functions jdou
zamknout do EU. **Firebase Authentication ale region volit neumí** a identitní záznamy
(e-mail, uid, poskytovatel) mohou být zpracovávány mimo EU pod standardními smluvními
klauzulemi Google. Nutno ověřit při zakládání projektu — a **navrhnout to tak, aby na
tom nezáleželo**:

> **V Authentication není nikdy nic o dětech a rodinách. Jen e-mail a uid.**
> Všechno osobní žije ve Firestore v EU. Jméno, telefon, adresa, role — nic z toho
> v Auth nebude.

To je návrhové pravidlo, ne poznámka. Zapsané do modelu (sekce 5).

**3. Bezpečnostní pravidla neumí skrýt pole ani filtrovat dotaz.** Tohle už v návrhu
je — celé oddělení metadat od obsahu v dok. 04 vzniklo právě z toho. Volbou Firestore
se to potvrzuje jako **správná a nutná** struktura, ne jako obezlička.

**4. Firestore neumí fulltext.** Umí ale **vektorové hledání** (`findNearest`), což
pokrývá to podstatné z dok. 17 — sémantické dotazy nad dokumenty bez další
infrastruktury. Pro přesné hledání (spisová značka, jméno, číslo dokladu) se ukládají
**tokeny do polí** a hledá se přes ně. Žádné Algolia, žádný Typesense, nic k správě.

### Kde je skutečné riziko

Ne v technologii, ale v **počtu čtení**. Firestore se platí za přečtené dokumenty.
Jedna špatně navržená obrazvka, která si při otevření přečte tři sta dokumentů, umí
zvednout náklady stonásobně. **Šetrnost ke čtení proto není optimalizace, ale pravidlo
návrhu modelu** — a je to hlavní důvod, proč jsou v dok. 12 časová osa a v dok. 11
ukazatele navržené jako **tenké projekce**, ne jako dopočet z podřízených záznamů.

---

## 2. Architektura

| Vrstva | Volba | Proč |
| --- | --- | --- |
| Databáze | **Firestore** (nativní režim, `europe-west3`) | offline, pravidla, realtime |
| Soubory | **Cloud Storage** (stejný region) | skeny, fotky, PDF |
| Server | **Cloud Functions gen. 2** (stejný region) | jen kde to jinak nejde — sekce 3 |
| Přihlášení | **Firebase Auth** | Google / Apple / Microsoft, sekce 5 |
| Notifikace | **FCM** | web push i mobil |
| Ochrana | **App Check** | aby AI endpointy nešly zneužít |
| AI | **Vertex AI (Gemini)**, evropský region, bez trénování | jedna smlouva, data v EU |
| OCR | **Cloud Vision / Document AI** | tentýž cloud, dok. 17 |
| Hosting | **Firebase Hosting** | PWA, statické |
| Klient | **Vite + React + TypeScript**, Firestore SDK přímo | žádná mezivrstva API |
| Vzhled | **Geist** (už vendorovaný) + Tailwind v4 | hotové v repozitáři |
| Mobil | **Capacitor** až později | z PWA, bez druhé kódové báze |

**Klíčové rozhodnutí o lehkosti kódu:** klient mluví s Firestore **přímo** a
autorizaci dělají **bezpečnostní pravidla**. Není mezi tím žádné vlastní API, které
bychom museli udržovat, verzovat a zabezpečovat. Pravidla *jsou* backend.

### Co znamená „lehké“ v číslech

Cíl: **jeden repozitář, jeden jazyk (TypeScript), žádný vlastní server, žádná
databázová migrace.** Když se něco dá vyřešit pravidlem místo funkce, vyřeší se
pravidlem.

---

## 3. Kde jsou Cloud Functions nevyhnutelné

Všude jinde stačí klient a pravidla. Tady ne:

| Funkce | Proč nemůže do klienta |
| --- | --- |
| Volání AI (Eli, koncepty) | klíče a kontrola kreditu |
| OCR a indexace dokumentu po nahrání | běží na pozadí, dok. 17 |
| Generování PDF (zprávy, exporty EXIT) | šablony a podpisové stopy |
| Přepočet lhůt při změně | aby seznamy byly **jeden dotaz**, ne dopočet na klientu |
| Agregace pro přehledy | šetření čtení |
| Ověření podpisového obřadu | dok. 08 — nesmí být ovlivnitelné klientem |
| Odchozí e-maily a doručenky | dok. 05, 13 |
| Předávací kód a přechody | dok. 02, 18 — atomicita |

---

## 4. Náklady

Rozsah podle tvého zadání: **300 organizací, ~12 000 dohod, ~10 000 dětí,
~600 aktivních pracovníků.**

| Položka | Odhad měsíčně |
| --- | --- |
| Firestore čtení (~4 mil.) | ~60 Kč |
| Firestore zápisy (~400 tis.) | ~20 Kč |
| Firestore úložiště (~20 GB) | ~30 Kč |
| Cloud Storage (skeny, ~300 GB) | ~200 Kč |
| Functions, Hosting, FCM | v bezplatném pásmu nebo desetikoruny |
| **Infrastruktura celkem** | **~300–800 Kč / měsíc za celou ČR** |
| **AI (Gemini + OCR)** | **jediná položka, která roste s používáním** |

Dvě upřímné poznámky:

- **Úplně zdarma to nebude.** Bezplatný tarif (Spark) nestačí — Functions a Vertex AI
  vyžadují Blaze. Ale při tomhle rozsahu jsou to stokoruny, ne desetitisíce.
- **AI je řádově dražší než všechno ostatní** a její cena roste s používáním, ne
  s počtem organizací. Tvoje rozhodnutí platit ji **kreditem zvlášť** je proto správné —
  jinak by jedna organizace, která si nechá přeindexovat dvacetiletý archiv, zaplatila
  provoz všem ostatním.

Ten odhad stojí a padá s tou šetrností ke čtení ze sekce 1. Proto ji beru jako
pravidlo modelu.

---

## 5. Přihlášení a zařízení

### Zásada

**Nic vlastního.** Žádná hesla, žádné obnovování hesel, žádná pravidla složitosti,
žádná databáze uživatelů. Přesně jak jsi chtěl.

| Poskytovatel | Stav |
| --- | --- |
| **Google** | zabudovaný ve Firebase Auth |
| **Apple** | zabudovaný |
| **Microsoft** | zabudovaný |
| ~~Seznam.cz~~ | **zrušeno rozhodnutím zadavatele** — nebyl zabudovaný a šel by jen jako obecný OIDC s Identity Platform. Kdo má Seznam a nic jiného, přihlásí se e-mailovým odkazem. |
| **E-mailový odkaz (bez hesla)** | **záložní pro všechny** — nic se nespravuje, poslední záchrana pro toho, kdo nemá nic z výše uvedeného |
| SMS | **ne** — platí se za zprávu a nic to nepřináší |

**Dítě od 12 let** (dok. 08) je jediný případ, kde to nevychází — účet u Google nebo
Apple mít nemusí. Tam: e-mailový odkaz, pokud e-mail má; jinak **pozvánka svázaná se
zařízením**, kterou vystaví Klíčová osoba. Detail nechávám na dobu, kdy se bude dětská
aplikace stavět.

### Zařízení — chybějící díl podpisu

Podpis podle dok. 08 stojí na biometrice zařízení. To znamená, že zařízení musí být
evidované — jinak ztracený telefon znamená ztracenou možnost podepsat a systém na to
nemá odpověď.

```ts
interface Device {
  personId: string
  label: string                     // „Petrův iPhone“ — zadá si člověk
  platform: 'ios' | 'android' | 'web'
  addedOn: string
  lastSeenOn: string

  webauthnCredentialId: string | null   // veřejná část, dok. 08
  fcmToken: string | null

  status: 'active' | 'revoked'
  revokedOn: string | null
  revokedByPersonId: string | null
  revokeReason: 'lost' | 'replaced' | 'left_organization' | 'other' | null
}
```

- **Odebrání zařízení může vlastník sám** a u zaměstnance i `org_admin`.
- **Nové zařízení se přidá přihlášením a novým obřadem** (dok. 08). Podpisy udělané
  starým zařízením zůstávají platné — jsou vázané na obsah, ne na zařízení.
- **Odebrání není mazání** (dok. 10): `status: 'revoked'`, historie zůstává.

### Pro první testy: bez přihlášení

Podle tvého zadání. Pravidla, aby to nebylo nebezpečné:

1. Přepínač **pohledů**, ne uživatelů — vybere se persona a UI se přepne.
2. Funguje **jen proti Firebase emulátoru** a jen když je nastaven vývojový příznak.
   V produkčním buildu ten kód **není** (vyřadí se při sestavení, ne podmínkou za běhu).
3. **Jen vygenerovaná demo data.** Žádná skutečná rodina v testovacím prostředí, ani
   „na chvilku“.
4. Persony přepínače odpovídají profilům z dok. 03, aby se testovala oprávnění, ne
   jen obrazovky.

---

## 6. Monetizace jako data, ne jako kód

Řekl jsi, že se model bude měnit. Takže se **nezadrátuje nikam do kódu** — použije se
přesně ta samá mechanika jako u právních parametrů (dok. 02): **datované série
hodnot.** Změna ceníku je pak nový záznam s platností „od“, ne nasazení nové verze.

```ts
interface PricingRuleset {              // stejný tvar jako právní sady, dok. 02
  id: string
  effectiveFrom: string
  currency: 'CZK'
  unit: 'agreement'                     // platí se za dohodu ve správě
  tiers: Array<{ fromCount: number; pricePerUnitMinor: number }>
  annualDiscountPct: number
  trialDays: number
  freePlanLimits: { maxAgreements: number; features: string[] }
}

interface Subscription {
  organizationId: string
  plan: 'free' | 'paid'
  billingPeriod: 'monthly' | 'annual'
  trialUntil: string | null
  pricingRulesetId: string              // podle čeho se počítá
  billableAgreementCount: number        // měřeno k datu, ne průběžně
  measuredOn: string
  status: 'trial' | 'active' | 'past_due' | 'suspended' | 'ended'
}

interface CreditWallet {                // AI se platí zvlášť
  organizationId: string
  balanceMinor: number
  autoTopUp: { enabled: boolean; thresholdMinor: number; amountMinor: number } | null
}
```

Čtyři poznámky, které se vyplatí mít rozhodnuté hned, i když se ceník změní:

1. **Základní varianta je příznaky, ne druhá aplikace.** `freePlanLimits.features` —
   jedna kódová báze. Dvě varianty jako dvě větve by byly dvojnásobná správa navždy.
2. **Měřená jednotka je počet dohod ve správě k datu**, ne průměr za měsíc. Je to
   jednoznačné, organizace to sama vidí a nedá se o tom vést spor.
3. **Kredit na AI se odečítá z `AiUsageLog`** (dok. 17). Ten záznam už existuje kvůli
   auditu, takže účtování nepotřebuje druhé měření. **Když kredit dojde, Eli přestane
   navrhovat — nic jiného se nezastaví.** Systém musí být plně použitelný bez AI.
4. **Platby: nestavět.** České neziskovky běžně platí **na fakturu převodem**, ne
   kartou. Takže dvě cesty: karta a předplatné přes platební službu (Stripe / GoPay /
   Comgate) a **ruční faktura** pro ty, kdo to potřebují. Vlastní platební logika ne.

**Chybějící kus:** kdo je plátcem, když pověřenou osobou je fyzická osoba (dok. 03 —
Klíčová osoba může být sama doprovázejícím subjektem). Odpověď: tentýž model, jen
organizace o jednom členovi. Ale ceník musí mít rozumný spodní stupeň, jinak jednomu
pěstounskému doprovázeči vyjde cena za dohodu absurdně.

### 6.1 Prostor v gigabajtech jako součást tarifu

Dotaz: 10 GB zdarma, každých dalších 10 GB za 100 Kč měsíčně — vyplatí se to?

**Na provoz je to velmi levné, ale jako příjem to nebude fungovat.** Čísla:

| | Naše cena | Tvoje cena |
| --- | --- | --- |
| 10 GB úložiště / měsíc | **~6 Kč** (Standard, `europe-west3`) | 100 Kč |
| stažení 10 GB / měsíc | ~30 Kč | v ceně |
| operace nad soubory | jednotky Kč | v ceně |

Marže je tedy pohodlná. Problém je jinde — **10 GB nikdo nevyčerpá.** Odhad:

```
naskenovaná stránka po normalizaci   ~150 KB
dokumentů na dohodu za rok           ~30 stran  →  ~4,5 MB / dohodu / rok
organizace se 40 dohodami            ~180 MB / rok
10 GB vydrží                         ~55 let
```

Takže druhý blok si nekoupí prakticky nikdo a z tarifu se stane **slib, ne příjem**.
To není špatně — jako slib je 10 GB dobrý a zároveň to je **pojistka proti zneužití**
(kdyby někdo začal nahrávat videa).

**Co dělá tu cenu nízkou, není tarif, ale normalizace při nahrání.** Sken stránky
z mobilu má běžně 1–3 MB; převod na PDF/A nebo JPEG s rozumnou kvalitou dá ~150 KB.
Je to **pětinásobná až dvacetinásobná úspora** a navíc zrychlí OCR. To je jediná věc,
kterou tady stojí za to opravdu naprogramovat.

**Jedna past, kterou je potřeba obejít vědomě.** V systému se nikdy nic nemaže
(dok. 10, 18) a archiv jen roste. Kdyby se platilo za celkový objem, **cena by tlačila
organizaci k tomu, aby data mazala** — přímo proti tomu, na čem celý návrh stojí.
Proto:

> **Do kvóty se počítají jen dokumenty aktivních spisů. Archiv je zdarma.**

A vychází to i technicky: archivní soubory se přesunou do třídy **Nearline nebo
Coldline**, která nás stojí zhruba polovinu až pětinu. Archiv tedy nabídneme zdarma
a ještě na tom vyděláme.

```ts
interface StorageQuota {
  organizationId: Id
  /** Inkrementuje se při nahrání, dekrementuje při archivaci. */
  activeBytes: number
  archivedBytes: number            // mimo kvótu
  includedBytes: number            // 10 GB z tarifu
  extraBlocksPurchased: number
  measuredAt: IsoDateTime
}
```

Měřit se to musí **počítadlem při zápisu** — Firestore ani Storage nedají objem za
organizaci samy a projít všechny soubory by bylo drahé.

**Doporučení:** 10 GB zdarma nechat jako slib s příplatkovými bloky pro pořádek,
ale **nepočítat s tím jako s příjmem** — ten stojí na počtu dohod a na kreditu za AI.

---

## 7. Co záměrně nestavíme

| Nestavíme | Použijeme |
| --- | --- |
| přihlašování, hesla, obnovy | Firebase Auth + OIDC poskytovatelé |
| vlastní API vrstvu | Firestore SDK + bezpečnostní pravidla |
| offline synchronizaci | Firestore persistence |
| vyhledávací infrastrukturu | vektorové hledání ve Firestore + tokeny |
| OCR | Cloud Vision / Document AI |
| textový editor | zavedená knihovna (ProseMirror / TipTap) |
| kalendář | `dnd-kit` (rozhodnuto v dok. 11) |
| generátor PDF | knihovna v Cloud Function |
| grafy | zavedená knihovna, tokeny z Geistu |
| platební logiku | platební služba + faktura |

Pravidlo: **žádná vlastní knihovna tam, kde existuje udržovaná.** A žádná knihovna
tam, kde stačí padesát řádků.

---

## 8. Co dělám dál

1. **Konsolidovaný datový model** — kolekce, tvary, indexy, bezpečnostní pravidla
   (bod A2 z dok. 00). Dělám hned.
2. Nečeká se na soupis obrazovek: model se dá postavit ze záznamů a pravidel a
   obrazovky se na něj potom položí.
3. Scaffold s Geistem a PWA vrstvou, demo data, přepínač person.
