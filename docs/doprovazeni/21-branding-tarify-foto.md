# 21 — Branding a dopisní papíry, tarify, fotografování

Tři věci a jedna oprava.

---

## 0. Oprava: o tarifech jsem rozhodoval, aniž bych měl

V dok. 20 jsem napsal, že diktát a přepis jsou v bezplatné variantě, a odůvodnil
jsem to. **To nebylo moje rozhodnutí.** Napravil jsem to dvěma způsoby:

**1. Zapsal jsem tvoje rozhodnutí.**

| | |
| --- | --- |
| AI | **první 2 měsíce**, pak **kredit nebo paušál s limitem**. Nikdy zdarma. |
| Zdarma | **ruční dopisování**. Diktát ani přepis ne — to je AI. |
| Video | **zakázané navždy** |

**2. Změnil jsem strukturu, aby se to nemohlo zopakovat.** `PLAN_FEATURES` byla
konstanta v kódu, tedy názor zapsaný do programu. Teď je to
**`PlanMatrix` — datovaný záznam** na platformní úrovni, stejně jako ceník a
právní sady (dok. 02, 19). Kód se smí ptát *„má tahle organizace `ai.dictation`?“*,
ale nesmí obsahovat názor na to, jestli to má být zdarma. Změna tarifu je nový
záznam s platností „od“, ne nasazení kódu.

### Co z toho plyne pro produkt

**Ruční cesta musí být úplná, ne trpěná.** Organizace, která po dvou měsících
nezaplatí, píše rukou — a systém jí musí být pořád k užitku. To sedí s tím, co
už v návrhu je:

- **knihovna vět** (dok. 07) je deterministická, funguje offline a je to náhrada
  diktátu, ne jeho doplněk;
- **fotografování dokladů** (sekce 3) nahrazuje přepisování údajů z účtenek
  a certifikátů a **AI nepotřebuje**;
- **checklisty** vyplněné na návštěvě dělají ze zprávy poloprázdný formulář
  místo prázdné stránky.

Bez AI tedy chybí diktát, souhrny, Eli a čtení dokumentů. Všechno ostatní jede.

### AI po zkušebním období

```ts
mode: 'trial' | 'credit' | 'flat' | 'none'
flatMonthlyLimit: { unit: 'token' | 'call'; amount: number } | null
```

Zkušební období běží **od zavedení organizace**, ne od prvního použití — jinak by
se dalo natáhnout tím, že si organizace AI dva měsíce nezapne. Po vyčerpání
paušálu se **zastaví jen AI**, nic jiného (dok. 19).

---

## 1. Video: zakázané natrvalo

Bylo `mode: 'forbidden' | 'premium_only'`. Teď je to `allowed: false` —
**konstanta, ne režim**, takže se to nedá zapnout ani omylem v nastavení.

Zpráva při pokusu zůstává faktická (dok. 16):

> Video se do spisu nenahrává. Popis situace patří do zápisu, snímek jako
> fotografie.

---

## 2. Branding a dopisní papíry

Dokumenty z tohohle systému chodí na OSPOD, na krajský úřad a k soudu. Musí
vypadat jako úřední dokument organizace, ne jako výstup z aplikace.

### 2.1 Co si organizace nastavuje

**Logo, akcentní barvu a zápatí.** To je to, co dělá dokument jejím, a nic z toho
nemůže rozbít sazbu.

Zápatí není kosmetika — bez těchto údajů to není úřední dokument: název, sídlo,
IČO, DIČ, registrace, bankovní účet, **ID datové schránky**, web, telefon,
e-mail a **číslo pověření k výkonu SPOD**.

**Písmo se nekonfiguruje.** Geist Sans a Geist Mono jsou vendorované (CLAUDE.md)
a dokument sázený stejným písmem jako aplikace drží jednotný dojem. Kdyby si
každá organizace vybírala písmo, půlka výstupů skončí v Comic Sans a zbytek
nečitelná na tisku.

**Akcentní barva se nepoužívá jako barva textu ani pozadí** — na to jsou tokeny
návrhového systému, které drží kontrast v obou režimech. Akcent je linka
v hlavičce, proužek u loga, barva odkazu v PDF. Tam, kde jeho záměna nemůže
způsobit nečitelnost.

### 2.2 Referenční blok — „ty obvyklé věci“

| Pole | Odkud se bere |
| --- | --- |
| **Naše značka** | z číselné řady organizace, přiděluje se transakčně |
| **Spisová značka** | `CaseFile.reference` — nic nového se nevymýšlí |
| **Vaše značka** | z příchozího podání (dok. 14 — podatelna to čte z dopisu) |
| **Datum vašeho dokumentu** | totéž |
| **Vyřizuje** | Klíčová osoba včetně telefonu a e-mailu |
| **Místo a datum** | „V Teplicích, 7. srpna 2026“ |
| **Věc** | předmět |
| **Přílohy** | seznam s vazbou na dokumenty ve spisu |
| **Na vědomí** | u zprávy podle § 47b odst. 5 jsou tři adresáti (dok. 05) |

Co se nedá odvodit, zůstane prázdné — prázdno je platný stav (dok. 16).

**Jednací čísla přiděluje Cloud Function transakčně.** Z klienta by dvě zprávy
vytvořené naráz dostaly stejné číslo, a to je v úřední korespondenci vada, která
se pozná až u soudu. Řady se restartují k 1. 1., jak je v ČR zvykem.

### 2.3 Čtyři šablony

| Kód | Formát | K čemu |
| --- | --- | --- |
| `dopis-a4` | A4 | dopis do **okénkové obálky** |
| `zprava-a4` | A4 | zpráva k založení do spisu, bez okénka |
| `sdeleni-a5` | A5 | krátké sdělení |
| `potvrzeni-a5` | A5 na šířku | potvrzení, certifikát |

**Adresní okénko je to, co se v praxi rozbije nejčastěji.** Když adresa neleží
v okénku, dopis se nedá odeslat. Výchozí rozměry vycházejí z běžné úpravy
(ČSN 01 6910, ČSN 88 6510), ale **je nutné je ověřit proti obálkám, které
organizace skutečně kupuje** — u výrobců se okénko o pár milimetrů liší.
Proto jsou to parametry šablony, ne konstanty v kódu.

Druhá a další strana má užší hlavičku bez loga a číslování „Strana 2 z 5“ —
u zprávy o průběhu PP se to čeká.

### 2.4 QR kód — a proč nesmí vést na dokument

Tohle je nejdůležitější rozhodnutí celé sekce.

Dopis se zprávou o dítěti v pěstounské péči jde poštou, leží na stole
v podatelně a projde rukama několika lidí. **Kdyby QR vedl na dokument, byl by
to klíč k údajům podle čl. 9 GDPR vytištěný na papíře** — kdokoli by ho vyfotil,
měl by obsah spisu dítěte.

> **QR vede na ověřovací stránku, ne na obsah.**

Bez přihlášení stránka ukáže jen to, co ověření potřebuje:

```
Vydal:            Doprovázení Podkrušnohoří, o.p.s.
Vydáno:           7. 8. 2026
Druh dokumentu:   Zpráva o průběhu výkonu pěstounské péče
Naše značka:      ZPR-2026/0042
Počet stran:      4
Otisk obsahu:     ✓ odpovídá
Stav:             platné (nenahrazeno novější verzí)
```

Žádné jméno dítěte, žádný obsah, žádné id spisu v odkazu. Kdo je **přihlášený**
a má na dokument právo, uvidí na téže stránce i odkaz na dokument. Rozhoduje
přihlášení, ne držení papíru.

Kolekce `verifications/{token}` proto leží **mimo `orgs/**`** — musí být čitelná
bez přihlášení. `list` je zakázaný: kdyby šla vypsat, dal by se z ní přečíst
přehled toho, kdo komu co posílá. Otestované.

### 2.5 Vysázení se musí dát zopakovat

`RenderRequest` drží **snímek brandingu a verzi šablony**. Bez toho by se
loňská zpráva vytiskla jinak, než odešla — a u dokumentu, který je ve spisu
a u soudu, to je vada.

Dvě věci, které se v PDF vynutí:

- `showGapMarkers: true` je typ, který jinou hodnotu nepřipouští — mezera
  `[DOPLNIT: …]` **nesmí vypadnout tiše** (dok. 14);
- koncept se sází s **vodoznakem**, aby se nespletl s odeslaným dokumentem.

---

## 3. Fotografování: hlavní vstup dokladů z terénu

Zadání: aplikace musí umět fotit a vkládat **zmenšené verze** k příslušnému
profilu. Nejde o krásné fotky, ale o pokoj, vysvědčení, účtenku, smlouvu,
certifikát, poznámky. Totéž pro vkládání fotek a snímků obrazovky z mobilu.

### 3.1 Zmenšuje se na zařízení, před nahráním

Ne po nahrání. Tři důvody:

1. Pracovnice v terénu má často **slabý signál a datový limit** — 8 MB fotka se
   nenahraje, 200 KB ano.
2. Originál z mobilu má 3–8 MB, po zmenšení **150–250 KB**.
3. **Co se nenahraje, to se nemusí platit ani mazat** (dok. 19 sekce 6.1).

```
delší strana        2200 px   → čitelné A4 i s drobným písmem
JPEG kvalita        72
odstíny šedi        u dokladů — menší soubor, stejná čitelnost
narovnání a výřez   automaticky, když to jde
více snímků         → jedno PDF (účtenka i smlouva mají víc stran)
```

Účel se vybírá z **číselníku `photo.purpose`** (rozšiřitelného, dok. 20) a
mapuje se na zpracování: doklad do odstínů šedi, **fotka pokoje zůstává
barevná** — u pokoje je barva informace, u účtenky ne.

### 3.2 EXIF se odstraňuje vždy a nedá se to vypnout

Toto je věc, kterou by bylo snadné přehlédnout, a měla by nepříjemné důsledky:

> **Fotka pokoje v pěstounské rodině nese v EXIF GPS souřadnice — tedy adresu
> domácnosti dítěte v náhradní péči.**

Ta adresa se nezobrazuje ani v aplikaci příbuzných (dok. 09), takže ji nesmí
prozradit metadata fotky, kterou si někdo stáhne ze spisu nebo která se přiloží
k odpovědi úřadu. `stripExif` je proto typ `true`, ne `boolean` — jinou hodnotu
nepřipouští.

### 3.3 Fotka musí být připnutá k něčemu

`subject` je povinný: osoba, dítě, spis, záznam, výdaj, vzdělávání nebo dohoda.
Fotka bez vazby je k nenalezení a za dva roky nikdo nebude vědět, co na ní je.

V terénu bez signálu jde do **fronty** a nahraje se po připojení (dok. 02).

### 3.4 Co se nedělá

- **Žádné vylepšování fotek.** Cílem je čitelnost, ne krása.
- **Žádné rozpoznávání textu při focení** — OCR běží na pozadí po nahrání
  (dok. 17) a je to AI, takže podléhá oprávnění.
- **Žádné ukládání originálu.** Zmenšená verze *je* ta verze.

---

## 4. Kde to je

| Věc | Soubor |
| --- | --- |
| Branding, šablony, referenční blok, číselné řady, QR ověření, vysázení | `schema/src/branding.ts` |
| `PlanMatrix`, `AiEntitlement`, fotografování, video, `UploadPolicy` | `schema/src/media.ts` |
| Číselník `photo.purpose` | `schema/src/codebooks.ts` |
| Cesty včetně `verifications/{token}` mimo organizace | `schema/src/paths.ts` |
| Oprávnění: veřejné ověření, branding, zákaz zvýšení jednacího čísla z klienta | `firestore.rules` |
| Testy (31, všechny prochází) | `tests/rules.test.mjs` |
| Testovací data: branding, 4 šablony na organizaci, 3 řady, AI ve třech stavech | `tools/seed/` |

### Co to mění jinde

| Dokument | Změna |
| --- | --- |
| 05, 13 | dokumenty pro úřady dostávají hlavičku, jednací číslo a QR ověření |
| 14 | `RenderRequest` drží snímek brandingu; mezery se v PDF vynutí |
| 19 | tarify jsou datový záznam, ne konstanta; do kvóty se přidává zvuk |
| 20 | **oprava**: diktát a přepis nejsou zdarma; video nemá režim |
