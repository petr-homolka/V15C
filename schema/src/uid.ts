/**
 * UID — sedmimístný kód, který dostane každá věc v systému.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ SEDM ZNAKŮ, A JEN S KONTROLOU PŘI VZNIKU                            │
 * │                                                                     │
 * │ Kolize se neřídí velikostí prostoru, nýbrž **narozeninovým          │
 * │ paradoxem**. Proto sedm znaků, ne šest:                             │
 * │                                                                     │
 * │            kombinací   šance na střet při 10 mil. záznamů           │
 * │   6 znaků   887 mil.   1,13 %   → jeden z 89                        │
 * │   7 znaků  27,5 mld.   0,04 %   → jeden z 2 750                     │
 * │                                                                     │
 * │ Deset milionů záznamů dosáhneme, protože UID dostává i každý        │
 * │ dokument a sken — 300 organizací × 40 dohod × 30 dokumentů ročně    │
 * │ je ~360 tisíc za rok a nic se nemaže (dok. 10).                     │
 * │                                                                     │
 * │ Kontrola při vzniku je nutná v obou případech a je zdarma: registr  │
 * │ entit už existuje, takže **zápis se dělá `create`, ne `set`** — a   │
 * │ `create` na existující dokument selže sám. Kolize se nehledá, ona   │
 * │ se ohlásí.                                                          │
 * │                                                                     │
 * │ Sedmý znak je tu ale proto, že **správnost té kontroly závisí na    │
 * │ disciplíně v celém kódu**. Kdo někdy přiřadí UID bez zápisu do      │
 * │ registru, obejde jedinou pojistku, kterou máme — a při šesti        │
 * │ znacích by z toho vznikl skutečný duplikát, protože střety se dějí  │
 * │ běžně. Při sedmi je stejná chyba o dva řády méně škodlivá.          │
 * │ Jeden znak navíc je za to nízká cena.                               │
 * └─────────────────────────────────────────────────────────────────────┘
 */

/**
 * Abeceda. Malá písmena a číslice **bez znaků, které se pletou**:
 *
 *   – vynechané `o` a `0` (zadání),
 *   – vynechané `i`, `l` a `1` ze stejného důvodu — v běžném fontu jsou
 *     k nerozeznání a UID se diktuje po telefonu a opisuje z papíru.
 *
 * Zůstává 31 znaků. Jen malá písmena, takže nevzniká ani otázka, jestli
 * se v UID rozlišují velká a malá.
 */
export const UID_ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz'

export const UID_LENGTH = 7

/** 31^7 = 27 512 614 111 */
export const UID_SPACE = UID_ALPHABET.length ** UID_LENGTH

/**
 * Vygeneruje kód. `randomInt(max)` dodá volající — v aplikaci
 * `crypto.getRandomValues`, v testech deterministický generátor.
 *
 * **Nekontroluje jedinečnost.** To dělá zápis do registru (viz hlavička).
 */
export function generateUid(randomInt: (maxExclusive: number) => number): string {
  let out = ''
  for (let i = 0; i < UID_LENGTH; i++) {
    out += UID_ALPHABET[randomInt(UID_ALPHABET.length)]
  }
  return out
}

/** V prohlížeči a v Cloud Functions: kryptograficky náhodné. */
export function generateUidSecure(): string {
  const bytes = new Uint8Array(UID_LENGTH * 2)
  crypto.getRandomValues(bytes)
  let out = ''
  let i = 0
  while (out.length < UID_LENGTH) {
    // Odmítnutí hodnot nad nejvyšším násobkem abecedy — jinak by nižší
    // znaky vycházely častěji a prostor by se zúžil.
    const limit = 256 - (256 % UID_ALPHABET.length)
    const b = bytes[i++]!
    if (b < limit) out += UID_ALPHABET[b % UID_ALPHABET.length]
    if (i >= bytes.length) {
      crypto.getRandomValues(bytes)
      i = 0
    }
  }
  return out
}

const UID_RE = new RegExp(`^[${UID_ALPHABET}]{${UID_LENGTH}}$`)

export function isUid(value: string): boolean {
  return UID_RE.test(value)
}

/**
 * Srovnání toho, co člověk opsal nebo nadiktoval.
 *
 * Vynechané znaky se mapují na ty, které v abecedě zůstaly, protože právě
 * ty si lidé zaměňují: kdo napíše `O`, myslel `0` — ale `0` v abecedě
 * není, takže `o`/`O` nemá kam mapovat a je to chyba. Naopak `1`, `I`
 * a `l` mají zjevného kandidáta jen tehdy, když se dohodneme; nedohadujeme
 * se a hlásíme to jako neplatné.
 *
 * Jediné, co se normalizuje, jsou **velká písmena, mezery a pomlčky** —
 * to jsou chyby opisu, ne záměny znaku.
 */
export function normalizeUidInput(input: string): string | null {
  const cleaned = input.trim().toLowerCase().replace(/[\s-]/g, '')
  return isUid(cleaned) ? cleaned : null
}

/**
 * Rozdělení pro čtení a diktování: `u6t4f3k` → `u6t 4f3k`.
 *
 * Tři a čtyři, jako u telefonního čísla — sedm znaků na dvojice nejde
 * rozdělit a `u6 t4 f3 k` s osamoceným znakem na konci se čte hůř.
 * Používá se jen při zobrazení, nikdy při ukládání.
 */
export function formatUidForReading(uid: string): string {
  if (uid.length !== UID_LENGTH) return uid
  return `${uid.slice(0, 3)} ${uid.slice(3)}`
}

/* ------------------------------------------------------------------ */
/* Kde krátký kód NESTAČÍ                                              */
/* ------------------------------------------------------------------ */

/**
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ OVĚŘOVACÍ TOKEN QR KÓDU MUSÍ ZŮSTAT DLOUHÝ.                         │
 * │                                                                     │
 * │ UID je bezpečné mít krátké, protože **samo o sobě nic neotevírá** — │
 * │ přístup rozhoduje token přihlášeného a pravidla. Kdo uhodne cizí    │
 * │ UID, nedozví se nic.                                                │
 * │                                                                     │
 * │ Ověřovací stránka QR kódu (dok. 21) je ale **čitelná bez            │
 * │ přihlášení** a ukazuje vydavatele, druh dokumentu a jednací číslo.  │
 * │ Sedmimístný token by šel zkoušet hrubou silou a z odpovědí by se    │
 * │ dal sestavit přehled, kdo komu co posílá.                           │
 * │                                                                     │
 * │ Ověřovací tokeny proto zůstávají dlouhé a náhodné.                  │
 * └─────────────────────────────────────────────────────────────────────┘
 */
export const VERIFICATION_TOKEN_LENGTH = 24

export function generateVerificationToken(): string {
  const bytes = new Uint8Array(VERIFICATION_TOKEN_LENGTH * 2)
  crypto.getRandomValues(bytes)
  let out = ''
  let i = 0
  while (out.length < VERIFICATION_TOKEN_LENGTH) {
    const limit = 256 - (256 % UID_ALPHABET.length)
    const b = bytes[i++]!
    if (b < limit) out += UID_ALPHABET[b % UID_ALPHABET.length]
    if (i >= bytes.length) {
      crypto.getRandomValues(bytes)
      i = 0
    }
  }
  return out
}

/**
 * Totéž platí pro **Předávací kód** (dok. 02) a pro **kód organizace**
 * k ověření pěstouna (dok. 24): obojí je klíč, ne identifikátor, a klíč
 * se nesmí dát uhodnout. Krátký je jen UID.
 */
export const KEYS_ARE_NOT_UIDS = [
  'verificationToken',
  'transferCode',
  'organizationCarerCode',
] as const
