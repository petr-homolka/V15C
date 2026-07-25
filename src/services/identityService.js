/**
 * Služba pro správa a generování oficiálních 13-místných UID podle specifikace 001-IDENTITY_MODEL.md
 * 
 * Struktura: TT OOOO SSSSSS C (celkem 13 číslic)
 * TT (2 číslice): Typ entity
 * OOOO (4 číslice): Identifikátor doprovázející organizace
 * SSSSSS (6 číslic): Pořadové číslo
 * C (1 číslice): Kontrolní číslice (EAN-13 algoritmus)
 */

export const ENTITY_TYPES = {
  FOSTER_PARENT: '10',  // Pěstoun
  CHILD: '20',          // Dítě svěřené do pěstounské péče
  KEY_PERSON: '30',     // Klíčová osoba
  EMPLOYEE: '40',       // Zaměstnanec doprovázející organizace
  EXT_WORKER: '50',     // Externí spolupracovník
  EXT_ORG: '60',        // Externí organizace
  EDUCATION: '70',      // Poskytovatel vzdělávání
  RESPITE: '80',        // Poskytovatel respitní péče
  AGREEMENT: '90'       // Dohoda o výkonu pěstounské péče / Doklad
};

export const DEFAULT_ORG_ID = '4827';

/**
 * Výpočet EAN-13 kontrolní číslice pro 12-místný řetězec
 */
export function calculateEan13CheckDigit(first12Digits) {
  const digits = String(first12Digits).padStart(12, '0').split('').map(Number);
  if (digits.length !== 12) {
    throw new Error('Pro výpočet kontrolní číslice EAN-13 je vyžadováno přesně 12 číslic.');
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    // Sudé pozice (1-indexed: 2, 4, 6, 8, 10, 12 -> 0-indexed: 1, 3, 5, 7, 9, 11) mají váhu 3
    // Liché pozice mají váhu 1
    const weight = i % 2 === 1 ? 3 : 1;
    sum += digits[i] * weight;
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Generování nového oficiálního 13-místného UID podle specifikace
 * @param {string} entityType - Kód typu entity (z ENTITY_TYPES)
 * @param {number|string} sequenceNumber - Pořadové číslo v rámci organizace
 * @param {string} orgId - 4-místný kód organizace (výchozí: '4827')
 */
export function generateUid(entityType, sequenceNumber = 1, orgId = DEFAULT_ORG_ID) {
  const tt = String(entityType).padStart(2, '0');
  const oooo = String(orgId).padStart(4, '0');
  const ssssss = String(sequenceNumber).padStart(6, '0');
  
  const base12 = `${tt}${oooo}${ssssss}`;
  const checkDigit = calculateEan13CheckDigit(base12);
  
  return `${base12}${checkDigit}`;
}

/**
 * Validace 13-místného UID podle algoritmu EAN-13
 */
export function validateUid(uid) {
  if (!uid || typeof uid !== 'string') return false;
  const cleanUid = uid.trim();
  
  if (!/^\d{13}$/.test(cleanUid)) return false;
  if (cleanUid.startsWith('0')) return false; // Nespočívá na nule

  const base12 = cleanUid.slice(0, 12);
  const expectedCheckDigit = calculateEan13CheckDigit(base12);
  const actualCheckDigit = Number(cleanUid.slice(12));

  return expectedCheckDigit === actualCheckDigit;
}

/**
 * Formátování UID pro čitelný tisk: "TT OOOO SSSSSS C"
 */
export function formatUid(uid) {
  if (!uid || uid.length !== 13) return uid;
  return `${uid.slice(0,2)} ${uid.slice(2,6)} ${uid.slice(6,12)} ${uid.slice(12)}`;
}

/**
 * Generuje ověřovací URL pro QR kód dokumentu podle specifikace sekce 8
 */
export function getDocumentQrVerificationUrl(documentUid) {
  return `https://crm.doprovazeni.cz/d/${documentUid}`;
}
