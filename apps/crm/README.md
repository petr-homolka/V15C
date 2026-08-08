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
| `#/` | **agenda** u pracovníka (úkoly + den), u pěstouna vlastní rodina, u dítěte profil, u správce seznam organizací |
| `#/rodiny` | rodiny ve správě a nejbližší lhůty |
| `#/dohoda/{uid}` | karta dohody: přehled, záznamy, lhůty, dokumenty |
| `#/spis/{uid}` | totéž přes spis — úkoly a schůzky odkazují na spis |
| `#/prepnout` | výběr pohledu a motivu |

Směrování je přes hash, bez knihovny. Až bude soupis obrazovek, přibude router.

## Co je převzaté z prototypu V10G

Výchozí obrazovka pracovníka je **denní agenda** podle `RoutineAgendaView`
z prototypu: úkoly ve skupinách (po termínu / dnes / tento týden / později /
hotové) s vazbou na rodinu, rychlé přidání řádkem, 24hodinová osa s čarou
aktuálního času, celodenní pás s narozeninami a zvýrazněný překryv schůzek.

Postaveno znovu, ne zkopírováno: uspořádání a chování se přebírá, vzhled jede
na tokenech Geistu a data jsou skutečná z `schema` + `tools/seed` — prototyp
měl schůzky i úkoly jako pole přímo v komponentě.

Nepřevzato: přetahování myší (v terénu na mobilu k ničemu a bez zápisu do
databáze by jen předstíralo uložení) a diktování — to má vlastní návrh a patří
k Eli (dok. 15, 20).

Zaškrtnutí a přidání úkolu žijí jen v paměti záložky.

## Co tu ještě není

| Chybí | Proč |
| --- | --- |
| service worker | `design-system/pwa/sw.js` má seznam souborů k předcachování; Vite jména hashuje, takže se musí generovat při buildu |
| Firestore a přihlášení | dok. 19 — až po prvních testech |
| editor, diktování, Eli | dok. 15, 17, 20 |
| zápis čehokoli | kostra jen čte |
