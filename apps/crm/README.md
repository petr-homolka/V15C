# CRM — kostra aplikace

Mobilní aplikace pro Klíčovou osobu (doprovazeni.com). Zatím kostra: pohledy,
data a několik obrazovek. Slouží k tomu, aby se dalo klikat, ne k provozu.

```bash
npm run install:app     # jednou
npm run dev             # http://localhost:5273
npm run build           # tsc + vite build → apps/crm/dist
```

## Tři věci, které jsou tu schválně

**1. Data se negenerují ze serveru, ale v prohlížeči.** `src/demo/store.ts`
volá `build()` z `tools/seed` — tentýž generátor, který sype data do emulátoru.
Důvod: přihlášení zatím není a pravidla nepřihlášenému čtení nic nepovolí (a to
je správně), takže cesta přes Firestore by teď znamenala buď vypnutá pravidla,
nebo přihlášení. Navíc se sada a obrazovky nemohou rozejít.

Až bude přihlášení, vymění se `store.ts` za dotazy do Firestore. `demo/data.ts`
je proto úzké a cesty skládá výhradně přes `schema/src/paths.ts`.

**2. Přihlášení nahrazuje přepínač pohledů.** `src/persona.tsx` staví seznam
person z dat, ne z pevného seznamu — vedení, Klíčové osoby, pečující osoba a
dítě z každé organizace, plus správce systému. Persona drží přesně to, co bude
po přihlášení v tokenu: kdo, v jaké organizaci, s jakou rolí.

**3. Motiv vlastní `theme.js` z PWA vrstvy.** Je importovaný přes bundler
(`main.tsx`), ne vlastním `<script>` — jinak by v aplikaci běžely dvě kopie
modulu, každá s vlastním stavem. Skript proti probliknutí v `index.html`
naopak vložený **zůstat musí**; externí se načte až po prvním vykreslení.

## Obrazovky

| Cesta | Co je |
| --- | --- |
| `#/` | **Eli** — chat je hlavní obrazovka |
| `#/dnes` | schůzky a úkoly dne |
| `#/rodiny` | seznam rodin s hledáním |
| `#/rodina/{uid}` | karta rodiny: přehled, záznamy, lhůty, dokumenty |
| `#/spis/{uid}` | totéž přes spis — schůzky a úkoly odkazují na spis |
| `#/ja` | pohled, vzhled, stav dat |

Směrování je přes hash, bez knihovny. Až bude soupis obrazovek, přibude router.

## Proč to vypadá takhle

První pokus byl přenesená agenda z prototypu V10G — úkoly nad hodinovou mřížkou.
Vypadalo to jako tabulka v prohlížeči, ne jako aplikace v telefonu, a zahodil
jsem to. Tady je, čím se řídí ta druhá verze:

**Eli je první obrazovka, ne pomocník v rohu.** Chat má být ústřední nástroj
(dok. 15). Když je hlavní, musí být první — jinak se otevře třikrát a zapomene.

**Den je seznam, ne mřížka.** Na 24hodinové ose zabírá tři čtvrtiny plochy
prázdná noc a schůzky se čtou hůř než v pěti řádcích pod sebou.

**Jedna karta, vlasové linky, žádné rámečky kolem každého řádku.** Předtím měl
každý úkol vlastní obrys a barevnou bublinu — z deseti řádků se stala mozaika.
Stav se teď píše textem v barvě a nejvýš jeden na řádek.

**Velký nadpis a vzduch.** Písmo 32 px nahoře, obsah v jednom sloupci, dotyková
plocha 44 px, ovládání dole u palce.

Odpovědi Eli jsou zatím **pravidlové nad skutečnými daty** (`src/eli/answer.ts`),
ne jazykový model: termíny, co je po termínu, co je dnes, otevři rodinu a zapiš
schůzku do kalendáře. Až přijde model, zůstane tenhle soubor jako záchranná síť
pro dotazy s jednoznačnou odpovědí.

Schůzka zapsaná v chatu a odškrtnutý úkol žijí jen v paměti záložky
(`src/local.tsx`) — kostra do databáze nezapisuje.

## Co tu ještě není

| Chybí | Proč |
| --- | --- |
| service worker | `design-system/pwa/sw.js` má seznam souborů k předcachování; Vite jména hashuje, takže se musí generovat při buildu |
| Firestore a přihlášení | dok. 19 — až po prvních testech |
| editor, diktování, Eli | dok. 15, 17, 20 |
| zápis čehokoli | kostra jen čte |
