# 01 — Právní analýza a korekce zadání

Podklad: ZSPOD (zákon č. 359/1999 Sb.) ve znění **1. 1. 2026 – 31. 12. 2026**, Instrukce
VŘ2 č. 3/2025, metodické materiály MPSV 2023–2025, zápis MPSV–ADaR z 19. 3. 2025.

Tento dokument je **normativní** pro implementaci: kde se rozchází se zadáním
(`01_ARCHITEKTURA_A_PRAVIDLA.md`, `02_DATOVY_MODEL_DB.md`,
`03_SPECIFIKACE_MILNIKU_A_MODULU.md`), platí tento dokument.

---

## 0. Stav zdrojů

| Zdroj | Stav | Poznámka |
| --- | --- | --- |
| ZSPOD 359/1999 Sb. | **platný**, znění 1. 1. – 31. 12. 2026 | primární norma |
| Instrukce VŘ2 č. 3/2025 (21. 1. 2025) | **platná, jediná právně závazná** pro pověřené osoby | ruší Instrukci 8/2019 |
| Instrukce NM2 č. 8/2019 | **zrušená** | k dispozici jen pro historické dohody |
| Metodika doprovázení (25. 8. 2023) | doporučující, **předchází novele 2024** | část odkazů je zastaralá |
| Metodické materiály MPSV 2025 (pomoc při osobní péči, upřesnění respitů) | **doporučující**, nikoli závazné | potvrzeno zápisem MPSV–ADaR |
| Zákon 452/1992 Sb. (50/1973 Sb. o pěstounské péči) | **zrušený** ZSPOD | historický, bez dopadu na systém |
| Zákon 89/2012 Sb. (OZ), část druhá | **chybí ve zdrojích** | potřebný pro § 965 odst. 3 (povinnost manžela pečovat) a § 655 odst. 2 |
| Vyhláška 473/2012 Sb. | **chybí ve zdrojích** | § 5c (pásma čerpání), § 5f (úhrada stravy/ubytování), § 4, § 4a, § 5 — nutná |

**Doplnit před M3:** vyhláška 473/2012 Sb. v aktuálním znění a OZ část druhá.
Bez § 5c a § 5f nelze korektně implementovat SPVPP ani spoluúčast pěstouna.

---

## 1. Zásadní korekce — vzdělávání pěstounů

Zadání (M3.1): *„min. 24 hodin vzdělávání za kalendářní rok“*, model
`EducationLogDoc.year: number`.

**To je nesprávné ve třech ohledech.** § 47a odst. 2 písm. f) a odst. 3 ZSPOD:

1. **Rozsah není 24 h pro všechny.** Je **18 hodin** pro
   nezprostředkovanou pěstounskou péči a **24 hodin** pro **zprostředkovanou**.
2. **Období není kalendářní rok**, ale **12 kalendářních měsíců po sobě jdoucích**,
   přičemž *„První období 12 kalendářních měsíců po sobě jdoucích počíná běžet ke dni
   uzavření dohody o výkonu pěstounské péče.“* Období je tedy **klouzavé, ukotvené
   datem uzavření dohody** — u dohody z 15. 3. jde o období 15. 3. – 14. 3.
3. **Existuje převod přebytku.** Splní-li osoba povinnost ve větším rozsahu, *„lze
   rozdíl mezi požadovaným počtem hodin a skutečným počtem hodin započítat do
   rozsahu … v období bezprostředně následujících 12 kalendářních měsíců.“*
   Převod je jednosměrný a jen o **jedno** období dál.

**Zprostředkovaná vs nezprostředkovaná** je definována v § 47a odst. 1:
zprostředkovaná = PP po doručení sdělení podle § 24 odst. 5, **PPPD**, nebo PP
poskytovaná **sourozenci** dítěte svěřeného podle bodu 1 týmž pěstounem.
Nezprostředkovaná = vše ostatní (typicky příbuzní a osoby blízké).

**Důsledky pro model:**
- Povinnost je **osobní, ne rodinná** — u manželů s jednou dohodou má každý svou
  vlastní 12měsíční periodu a vlastní rozsah. Vzdělávací účet musí být per osoba.
- Nutná entita **vzdělávací období** (`educationPeriod`), ne pole `year`.
- Nutné pole na osobě: **typ pěstounské péče** (zprostředkovaná / nezprostředkovaná),
  protože určuje 18 vs 24 h. Může se u jedné osoby v čase změnit (přijetí dalšího dítěte).
- Ukazatel plnění musí umět „18 / 24 h + 3 h převedené = potřeba 15 h“.

**Zastaralý údaj v metodikách:** Metodika doprovázení (2023) i starší materiály uvádějí
24 h pro všechny. To platilo do 31. 12. 2024.

---

## 2. Zásadní korekce — subjekt dohody nejsou jednotlivci

Zadání: `AgreementDoc.fosterPersonUid: string` — jedna dohoda = jeden pěstoun.

**§ 47b odst. 6 a 7 ZSPOD to vylučuje:**

- odst. 6: *„Osoba pečující nebo osoba v evidenci může uzavřít pouze jednu dohodu
  o výkonu pěstounské péče **bez ohledu na počet svěřených dětí**.“*
- odst. 7: *„Jsou-li osobou pečující nebo osobou v evidenci **manželé, uzavírají dohodu
  o výkonu pěstounské péče společně** bez ohledu na počet svěřených dětí a bez ohledu
  na skutečnost, zda některé nebo všechny svěřené děti jsou svěřeny do jejich společné
  péče.“* Totéž obdobně pro **společnou pěstounskou péči 2 osob**.
- Výjimka: děti ve výlučné péči jednoho z manželů, pokud manželé **prokazatelně
  nejméně 3 měsíce nežijí spolu** a ORP na žádost rozhodne, že se ke skutečnosti,
  že oba jsou osobou pečující, nepřihlíží.

**Důsledky pro model:**
- `Agreement` má **stranu tvořenou 1–2 osobami** (`caregiverIds: string[]`), ne jednu.
- Pravidlo „1 pěstoun = max 1 aktivní dohoda“ platí, ale **registr musí být per osoba
  a jedna dohoda do něj zapisuje 1–2 záznamy** — jinak u manželů systém povolí
  duplicitní dohodu na druhého z nich.
- Je třeba modelovat **rozhodnutí ORP o nepřihlížení** (výjimka odst. 7) jako artefakt
  se stavem, jinak nelze legálně vytvořit dvě oddělené dohody manželů.

---

## 3. Zásadní korekce — zánik dohody je vázán na pololetí

Zadání nemá k zániku dohody žádná pravidla; má jen `status: 'terminated' | 'expired'`.

**§ 47c odst. 5 a 6 ZSPOD:**
- Závazek zaniká **jen k poslednímu dni kalendářního pololetí**, ve kterém byl doručen
  projev vůle o výpovědi nebo sjednána dohoda o zániku → tedy **k 30. 6. nebo 31. 12.**
- Výpověď musí být doručena **nejpozději 30 dnů před koncem pololetí**. Při pozdějším
  doručení skončí výpovědní doba **k poslednímu dni následujícího pololetí**.
- Mimo tento režim dohoda zaniká **ex lege** (§ 47c odst. 1): skončením pěstounské péče,
  nejpozději zletilostí posledního svěřeného dítěte, nebo vyřazením z evidence PPPD.
  Tam pololetní pravidlo neplatí.
- Pěstoun může vypovědět **bez udání důvodu** (odst. 3). Doprovázející subjekt **jen
  ze tří zákonných důvodů** (odst. 2).
- Po zániku musí být do **30 dnů** uzavřena nová dohoda, jinak ORP upraví práva
  a povinnosti správním rozhodnutím.

**Důsledky:** `Agreement.status` je **stavový automat s právní datovou aritmetikou**,
ne volné pole. Systém musí datum zániku *dopočítat*, nikoli nechat zadat.

---

## 4. Nová oblast — souhlas OÚ ORP jako podmínka platnosti

Zadání tuto entitu vůbec nemá. Přitom:

- Uzavírá-li pěstoun dohodu s **pověřenou osobou** (tj. typickým uživatelem tohoto
  systému), je nutný **předchozí souhlas místně příslušného OÚ ORP** podle místa
  trvalého pobytu pěstouna. Souhlas má povahu **vyjádření podle § 154 správního řádu**.
- **Bez souhlasu dohoda vůbec nevznikne** a — citace Informace MPSV — *„Na takovou
  dohodu nelze vyplácet státní příspěvek na výkon pěstounské péče.“*
- ORP se musí doručit **úplný text** uvažované dohody. Teprve po vyjádření lze podepsat.
- Po uzavření: **bezodkladně** informovat místně příslušný ORP a zaslat **stejnopis**
  dohody (§ 47b odst. 3). Totéž obdobně **při změně** dohody.
- U **změn** je souhlas nutný jen u **podstatných změn** (ruší se závazek, sjednává se
  nový, mění se rozsah plnění). Nepodstatné změny (jiná hlídací osoba, jiné rozložení
  respitu, změna příjmení) souhlas nevyžadují.

**Důsledek:** potřebujeme entitu **`agreementConsent`** se stavy
`required → requested → granted | refused` a blokádu: dohoda nesmí přejít do `active`,
dokud souhlas není `granted`. A klasifikaci změn na podstatné/nepodstatné.

---

## 5. Nová oblast — SPVPP jako skutečná finanční agenda

Zadání má `grantAmountCzk` a `spvppBudgetCzk` a **žádnou kolekci výdajů**. To je
nedostatečné. Zákonná realita:

### Výše příspěvku (§ 47d odst. 2, 3)
- **66 000 Kč** / kalendářní rok za dohodu s **osobou pečující**
- **72 000 Kč** / kalendářní rok za dohodu s **osobou v evidenci**
- **+ 18 000 Kč** při PP alespoň o **3 děti**, nebo alespoň o **1 dítě závislé** na pomoci
  jiné osoby ve stupni **II, III nebo IV**
- Netrval-li nárok celý rok: **1/12** za každý kalendářní měsíc
- Snížení o 1/12 za každý celý měsíc bez splnění podmínek, netrval-li nárok déle než
  6 měsíců v roce

→ Výše se počítá **automaticky z faktů** (typ osoby, počet dětí, stupeň závislosti,
trvání dohody v měsících), nikoli zadává ručně.

### Povinná pásma čerpání (§ 5c vyhlášky 473/2012)
Procenta z **celkové částky SPVPP na všechny dohody** v daném roce:
- práva podle § 47a odst. 2 **písm. a) + b)** (pomoc s péčí, respity): **5–15 %**
- práva podle **písm. c) až e)** (poradenství, psych./terapie, kontakty): **10–20 %**
- povinnost podle **písm. f)** (vzdělávání): **5–10 %**

Nelze-li prokazatelně vyčerpat, lze prostředky použít jinak v souladu s účelem —
ale **neúčelné použití je přestupek** s pokutou do 50 000 Kč (§ 59f).

→ Systém musí tato pásma **sledovat průběžně a varovat**, ne až při vyúčtování.
Toto je nejsilnější důvod, proč potřebujeme plnohodnotnou kolekci výdajů s klasifikací
na písmena § 47a odst. 2.

### Termíny
| Co | Kdy | Zdroj |
| --- | --- | --- |
| Žádost o SPVPP na další rok | do **15. 1.** | § 47d odst. 5 |
| Výplata při včasné žádosti | do **15. 2.** | § 47d odst. 5 |
| Oznámení skutečností rozhodných pro nárok (zejm. zánik dohody) | do **15 dnů** | § 47d odst. 6 |
| Přehled čerpání SPVPP krajské pobočce ÚP | do **31. 3.** | § 47d odst. 12 |
| Vrácení nevyčerpaných prostředků | do **30. 4.** | § 47d odst. 12 |

Nepředložení přehledu nebo nevrácení prostředků = **přestupek** (§ 59f odst. 1 písm. o),
pokuta do 50 000 Kč.

---

## 6. Nová oblast — respity nejsou jeden denní strop

Zadání: `dailyRespiteCapCzk` default 600 Kč/den jako jediný mechanismus.

**To je záměna zákonného limitu za jeden příklad z doporučující metodiky.**
Skutečná struktura:

### Zákonné limity (ZSPOD, Instrukce 3/2025)
- **Celodenní péče (CPSD)**: alespoň **14 kalendářních dnů v kalendářním roce**, jen
  pokud dítě dosáhlo **věku 2 let**. Ze SPVPP se hradí **14 dní za každé dítě**.
- **Nad 14 dní** lze hradit jen při odůvodnění zdravotním stavem / náročností péče
  a **v souladu s IPOD**, a musí být **písemně odůvodněno**. Jinak z jiných zdrojů.
- **Nepřepočítává se na hodiny**: i několik hodin během jednoho dne = **jeden den péče**.
- **Krátkodobá péče** je jen pro zákonné důvody (PN, ošetřování osoby blízké, narození
  dítěte, vyřizování nezbytných osobních záležitostí — včetně povinného vzdělávání,
  úmrtí osoby blízké). Přes den; přes noc jen výjimečně.
- **Nelze realizovat v ZDVOP.**
- Nelze hradit aktivity nad rámec zajištění péče (permanentky, vstupy do zoo, aquapark).
- Zahraniční pobyty jen do výše ceny obvyklé v ČR.
- Spoluúčast pěstouna na stravě a ubytování: **max. částky podle § 5f vyhlášky
  473/2012** (Instrukce 3/2025 změnila dřívější pravidlo „1/30 příspěvku na úhradu
  potřeb dítěte“ na odkaz na vyhlášku — **je nutné doplnit § 5f**).

### Částky z metodiky = vnitřní pravidla organizace, ne zákon
3 800 / 1 500 / 2 500 / 1 200 Kč za typy pobytů, 600 Kč/den u individuálně vybraného
tábora, 3 000 Kč/dítě/rok na krátkodobou péči, 150–200 Kč/h hlídačky DO,
100–160 Kč/h osoby blízké, max. 6 h/den — to všechno jsou **příklady vnitřních pravidel**
z metodického materiálu, na které dohoda odkazuje (§ 47b odst. 2 výslovně zmiňuje
*„ujednání o dodržování vnitřních pravidel“*).

**Důsledek pro architekturu:** musíme rozlišit **dvě vrstvy parametrů** — zákonnou
(sdílenou, verzovanou centrálně) a **vnitřní pravidla organizace** (per tenant, verzovaná
per organizace, protože dohoda na ně odkazuje a musí být dohledatelné, jaká pravidla
platila v době plnění). Podrobně v dokumentu 02.

---

## 7. Nová oblast — zákaz refundace pěstounovi a tenze mezi zdroji

Metodický materiál MPSV z 10. 2. 2025 zavádí **zákaz refundačního principu**:
doprovázející subjekt **nesmí** postupovat tak, že pěstoun si pomoc sám najde, zaplatí
a subjekt mu ji proplatí. Faktura musí být **vystavena na doprovázející subjekt** jako
odběratele a musí uvádět, **pro které konkrétní dítě** byla služba poskytnuta.

**Ale:** právně závazná Instrukce VŘ2 3/2025 na str. 4 stále uvádí, že *„přichází v úvahu
úhrada jak samotné osobě pečující/v evidenci, která doloží úhradu a využití vyplacených
prostředků na stanovený účel, tak i přímá úhrada“* poskytovateli.

Zápis MPSV–ADaR to řeší explicitně: **jediným právně závazným materiálem je Instrukce
VŘ2 č. 3/2025**, ostatní metodiky jsou **doporučující**.

**Návrh řešení (nehádat, ale modelovat):** neblokovat ani jednu variantu, ale evidovat
u každého výdaje **`paymentRoute`** (`direct_to_provider` | `reimbursed_to_caregiver`)
a **`invoiceIssuedTo`**. Varianta `reimbursed_to_caregiver` se označí jako **rizikový
režim** s viditelným varováním a povinným odůvodněním, aby při kontrole ÚP existovala
auditní stopa a organizace věděla, že se pohybuje v doporučením nedoporučené oblasti.
Poměr obou režimů patří do compliance dashboardu.

To má přímý dopad na M4: OCR modul v zadání předpokládá, že **pěstoun vyfotí účtenku**
— takový doklad je typicky vystavený na pěstouna, tedy v rizikovém režimu. OCR proto
musí **rozpoznat odběratele** a upozornit, pokud to není organizace.

---

## 8. Nová oblast — osoby zajišťující péči a externí poskytovatelé

Zadání tuto celou vrstvu nemá. Vyžaduje ji § 49a ZSPOD a metodiky:

**Fyzická osoba poskytující pomoc podle § 47a odst. 2 písm. a) a b)** musí být
*„plně svéprávná, zdravotně způsobilá, bezúhonná a splňuje další osobnostní předpoklady
pro péči o dítě“*; bezúhonnost a osobnostní předpoklady se posuzují obdobně podle
§ 23d odst. 4 písm. b) a d) a § 23e. Dále z metodik:
- Zdravotní způsobilost se dokládá **čestným prohlášením**; při pochybnostech lze
  vyžádat potvrzení lékaře. Osoba nesmí mít sama nárok na příspěvek na péči.
- DO má povinnost **nahlásit osobu krajskému úřadu**; KÚ si vyžádá opis z rejstříku
  trestů a z evidence přestupků.
- **Odborná kvalifikace se nevyžaduje** (asistent péče).
- **Presumpce bezúhonnosti:** osoba se považuje za bezúhonnou, dokud není prokázán
  opak; prostředky vyplacené do zjištění nebezúhonnosti **jsou uznatelné**.
- Nelze uzavřít vztah s osobou, která **žije s pěstounem a dítětem ve společné
  domácnosti**, ani s druhým z manželů-pěstounů.
- Hlídající osoba **nikdy nesmluvňuje přímo s pěstounem**, vždy s organizací.
- **Výkaz hlídání** (datum, místo, čas, osoba) **musí podepsat pěstoun**.
- Formy: DPP/DPČ, nebo **nepojmenovaná trojstranná smlouva** DO–pěstoun–hlídající.
- **Externí organizátor** (tábor, DDM) se hlásí KÚ **jako celek, jednou**, ne per akce.
- **Storno poplatky** jsou uznatelné, ale je nutné potvrzení o nemoci a prioritně
  uplatnit pojištění storna.
- Za dohled na táboře odpovídá **pořadatel**; DO odpovídá za **schválení** (soulad
  s IPOD, vhodnost pro dítě) a za ověření z dostupných zdrojů.
- **Není přípustné, aby pěstoun zajistil respit bez vědomí DO.**

**Nové entity:** `careProvider` (FO/PO, typ vztahu, stav hlášení na KÚ, stav
bezúhonnosti, čestná prohlášení), `careProviderContract`, `careLog` (výkaz s podpisem
pěstouna).

---

## 9. Další chybějící entity a vazby

| Chybí v zadání | Právní základ | Poznámka |
| --- | --- | --- |
| **IPOD** | § 47b odst. 2 — obsah dohody s ním musí být v souladu | zpracovává OSPOD dítěte; DO ho musí mít k dispozici |
| **Plán průběhu pobytu dítěte v PP** | standard 10c | musí striktně vycházet z IPOD |
| **Plán vzdělávání** | standard 10d | za participace pěstouna |
| **Zpráva o průběhu PP** | § 47b odst. 5 | 1×/6 měsíců + při zániku; **předat do 15 dnů** třem adresátům |
| **OSPOD jako entita** | § 47b odst. 5 | **dva různé úřady**: ORP pěstouna a ORP trvalého pobytu dítěte |
| **Osobní styk (sledování)** | § 47b odst. 4 | min. **1× za 2 měsíce** s pěstounem **i dětmi** |
| **Kontakty dítěte s rodiči** | § 47a odst. 2 písm. e) | celý modul: příprava, místo, asistence, vyhodnocení |
| **Osoba pečující vs osoba v evidenci** | § 2a písm. b), c) | jiná výše SPVPP, jiný režim zániku |
| **Stupeň závislosti dítěte** | § 47d odst. 3 písm. a) | II/III/IV → +18 000 Kč |
| **Právní režim dohody** | Čl. II bod 3 přechodných ust. z. 242/2024 | „staré“ dohody se řídí **dosavadními** předpisy, nedohodnou-li se strany jinak |
| **Výdaje SPVPP** | § 47d, § 5c vyhlášky | viz sekce 5 |
| **Respitní události** | § 47a odst. 2 písm. b) | v zadání zmíněno bez schématu |

### Přechodný právní režim je samostatné pole, ne detail
Čl. II bod 3 přechodných ustanovení zákona 242/2024 Sb.: dohody uzavřené do
31. 12. 2024 **a jejich práva a povinnosti se řídí dosavadními právními předpisy**,
pokud se strany nedohodnou na novém režimu. Systém proto musí u každé dohody
nést **`legalRegime`** a počítat podle **pravidel toho režimu** — jinak spočítá
starým dohodám nesprávné rozsahy vzdělávání a nesprávná pásma čerpání.

---

## 10. Menší korekce

1. **Kapacita klíčového pracovníka.** Zadání: `koCapacityThreshold` default **15**.
   Metodika doprovázení: *„jako ideální rozmezí jeví 18 až 23 rodin na jednoho
   klíčového pracovníka“* **při plném úvazku**. Doporučení, ne zákon. Default nastavit
   na 18–23 jako rozmezí a **vztáhnout k úvazku (FTE)**, ne k osobě.
2. **Přečíslování § 47a odst. 2.** Novela 2024 přestrukturovala písmena **a)–h) → a)–g)**.
   Staré dokumenty odkazují na jiná písmena než platný zákon (např. vzdělávání bylo
   d)+f), dnes je jen f); kontakty byly e)+h), dnes e)). **Nikdy nezadrátovávat odkazy
   na písmena** — musí být součástí verzované sady pravidel.
3. **Odborná pomoc už nemá zákonnou frekvenci.** Staré znění dávalo právo na
   psychologickou/terapeutickou pomoc *„alespoň jednou za 6 měsíců“*. Platné
   § 47a odst. 2 písm. d) **žádnou frekvenci neuvádí**. Zadání a metodiky z let
   2013–2023, které „1× za 6 měsíců“ zmiňují, jsou v tomto bodě zastaralé.
4. **Frekvence návštěv.** Zadání (M2.1) varuje při absenci návštěvy **> 30 dní**.
   Zákon žádá **min. 1× za 2 měsíce**. 30 dní je tedy interní, přísnější metrika —
   v pořádku, ale zákonná lhůta musí být samostatný, tvrdý ukazatel, a její nedodržení
   musí být **odůvodnitelné ve spisu**.
5. **Uzavření dohody do 30 dnů** od právní moci rozhodnutí o svěření prvního dítěte
   nebo o zařazení do evidence PPPD. V zadání chybí.
6. **PPPD a evidence.** Dohoda osoby v evidenci zaniká **vyřazením z evidence**; při
   opětovném zařazení se uzavírá **nová** dohoda. Přerušení vedení v evidenci delší
   než 2 měsíce bez dohody je podle § 27a důvodem k vyřazení.
7. **Vzdělávání zaměstnanců** (nikoli pěstounů) hrazené ze SPVPP: max. **24 h/rok**,
   resp. **48 h / 2 roky** u sociálních pracovníků; **supervize max. 12 h/rok**.
8. **Leasing služebního vozu** ze SPVPP: max. **500 Kč na dohodu měsíčně**
   (Instrukce 3/2025 zvýšila z 300 Kč — ukázkový případ verzovaného parametru).
9. **Ubytování při vzdělávání**: uznatelné jen jako **nocleh mezi dvěma dny, kdy
   v každém pěstoun absolvuje min. 6 hodin**; „přiměřené“ ubytování do **1 500 Kč**
   za dospělou osobu na den (Instrukce 3/2025 zvýšila z 1 000 Kč). **Strava pěstounů
   není uznatelná.**
10. **E-learning** nemůže pokrýt celou časovou dotaci vzdělávání — část musí být osobní
    účast s lektorem.
11. **Oddělení rolí u OSPOD.** Vykonává-li doprovázení sám OÚ ORP, musí být role
    kontrolní a podpůrná rozdělena mezi **dva různé zaměstnance**. Pokud systém budou
    používat i ORP, potřebuje to jako pravidlo přidělování, ne jen doporučení.

---

## 11. Souhrn dopadu na milníky

| Milník v zadání | Dopad |
| --- | --- |
| M1 | Dohoda = strana 1–2 osob; `titleRegistry` per osoba; nový artefakt souhlasu ORP; `legalRegime`; osoba pečující vs v evidenci; typ PP (zprostředkovaná/ne) |
| M2 | Zákonná lhůta osobního styku 2 měsíce jako tvrdý ukazatel; zprávy 1×/6 měsíců se lhůtou 15 dnů a třemi adresáty |
| M3 | **Zcela přepracovat**: 18/24 h, klouzavé 12měsíční období, převod přebytku; kolekce výdajů s klasifikací na písmena; pásma § 5c; automatický výpočet SPVPP; respity 14 dní/dítě/rok s věkovou podmínkou |
| M4 | OCR musí rozpoznat **odběratele** faktury a hlásit rizikový režim; šablony musí být verzované podle právního režimu dohody |
| M5 | Skartace navázaná na zákon 499/2004 Sb.; audit i pro **zobrazení** citlivých údajů |
| **nový** | Modul osob zajišťujících péči a externích poskytovatelů (§ 49a) — bez něj nelze legálně čerpat na respity |
| **nový** | Modul kontaktů dítěte s rodiči (§ 47a odst. 2 písm. e) |
| **nový** | Modul přechodu pěstouna mezi organizacemi — viz dokument 02 |
