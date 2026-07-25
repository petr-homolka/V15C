import { db } from './firebase';
import { doc, runTransaction } from 'firebase/firestore';

/**
 * Vypočítá kontrolní číslici EAN-13 pro 12místný číselný řetězec.
 * @param {string} payload12 - 12místný číselný řetězec.
 * @returns {number} Kontrolní číslice (0-9).
 */
export function calculateEan13CheckDigit(payload12) {
  if (typeof payload12 !== 'string' || payload12.length !== 12 || !/^\d+$/.test(payload12)) {
    throw new Error("Payload pro výpočet kontrolní číslice musí být přesně 12místný číselný řetězec.");
  }
  
  let sumEven = 0;
  let sumOdd = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(payload12[i], 10);
    // Pozice v EAN-13 jsou 1-indexed: 1. odd, 2. even, atd.
    if ((i + 1) % 2 === 0) {
      sumEven += digit;
    } else {
      sumOdd += digit;
    }
  }
  
  const total = (sumEven * 3) + sumOdd;
  const mod = total % 10;
  return mod === 0 ? 0 : 10 - mod;
}

/**
 * Ověří, zda je 13místné UID platné dle formátu TT OOOO SSSSSS C.
 * @param {string} uid - 13místný číselný řetězec.
 * @returns {boolean} True, pokud je UID platné.
 */
export function isValidUid(uid) {
  if (typeof uid !== 'string' || uid.length !== 13 || !/^\d+$/.test(uid)) {
    return false;
  }
  if (uid.startsWith('0')) {
    return false; // UID nesmí začínat nulou
  }
  const payload = uid.substring(0, 12);
  const checkDigit = parseInt(uid.substring(12), 10);
  try {
    return calculateEan13CheckDigit(payload) === checkDigit;
  } catch (e) {
    return false;
  }
}

/**
 * Generuje a přiděluje UID pro daný typ entity a organizaci.
 * Využívá Firestore transakci pro zajištění sekvenčního a unikátního číslování.
 * 
 * @param {string} orgId - 4místné ID organizace (např. '0021')
 * @param {string} entityType - 2místný typ entity TT (např. '20' pro dítě)
 * @returns {Promise<string>} 13místné vygenerované UID
 */
export async function generateNextUid(orgId, entityType) {
  const paddedOrgId = String(orgId).padStart(4, '0');
  const paddedEntityType = String(entityType).padStart(2, '0');
  
  if (paddedOrgId.length !== 4 || paddedEntityType.length !== 2) {
    throw new Error("Neplatná délka parametrů. orgId must be 4místné a entityType 2místné.");
  }
  
  const counterDocRef = doc(db, 'counters', `${paddedOrgId}_${paddedEntityType}`);
  
  return await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterDocRef);
    let nextSeq = 1;
    
    if (counterSnap.exists()) {
      nextSeq = (counterSnap.data().seq || 0) + 1;
    }
    
    if (nextSeq > 999999) {
      throw new Error(`Byl vyčerpán sekvenční limit pro typ ${paddedEntityType} v organizaci ${paddedOrgId}.`);
    }
    
    transaction.set(counterDocRef, { seq: nextSeq }, { merge: true });
    
    const seqStr = String(nextSeq).padStart(6, '0');
    const payload12 = `${paddedEntityType}${paddedOrgId}${seqStr}`;
    const checkDigit = calculateEan13CheckDigit(payload12);
    
    return `${payload12}${checkDigit}`;
  });
}

/**
 * Lokální záložní verze generátoru UID pro vývojářské účely bez připojení k Firestore.
 * Ukládá čítače do LocalStorage.
 * 
 * @param {string} orgId - 4místné ID organizace (např. '0021')
 * @param {string} entityType - 2místný typ entity TT (např. '20')
 * @returns {string} 13místné vygenerované UID
 */
export function generateNextUidLocal(orgId, entityType) {
  const paddedOrgId = String(orgId).padStart(4, '0');
  const paddedEntityType = String(entityType).padStart(2, '0');
  
  const key = `counter_${paddedOrgId}_${paddedEntityType}`;
  let seq = parseInt(localStorage.getItem(key) || '0', 10) + 1;
  localStorage.setItem(key, String(seq));
  
  const seqStr = String(seq).padStart(6, '0');
  const payload12 = `${paddedEntityType}${paddedOrgId}${seqStr}`;
  const checkDigit = calculateEan13CheckDigit(payload12);
  
  return `${payload12}${checkDigit}`;
}
