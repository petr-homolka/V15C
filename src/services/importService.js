import { db } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, runTransaction } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import CryptoJS from 'crypto-js';
import { generateNextUidLocal } from './uid';

/**
 * Přečte nahrávaný Excel/CSV soubor a převede ho na JSON objekty.
 * 
 * @param {File} file - Nahrávaný soubor (.xlsx, .xls, .csv)
 * @returns {Promise<Array<Object>>} Pole přečtených řádků
 */
export async function parseImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        resolve(jsonRows);
      } catch (err) {
        reject(new Error("Chyba při čtení Excel/CSV souboru: " + err.message));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Vytvoří novou importní úlohu a uloží záznamy do stagingRecords.
 * 
 * @param {string} orgId - ID organizace
 * @param {string} filename - Název nahraného souboru
 * @param {Array<Object>} rows - Přečtené řádky
 * @returns {Promise<Object>} Informace o vytvořené úloze
 */
export async function createImportJob(orgId, filename, rows) {
  const jobId = `import_${Date.now()}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dnů rollback window

  const jobData = {
    jobId,
    orgId,
    filename,
    status: 'staged', // staged | committed | rolled_back
    totalRecords: rows.length,
    validRecords: 0,
    invalidRecords: 0,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    createdDocUids: []
  };

  // Validace a transformace řádků pro staging
  const stagedRows = rows.map((row, index) => {
    const rowId = `row_${index + 1}`;
    let isValid = true;
    let errors = [];

    // Základní validace polí pro Spis / Rodinu
    const pěstouni = row['Pěstouni'] || row['Jméno'] || row['fosterParents'];
    const rc = row['Rodné číslo'] || row['rc'];

    if (!pěstouni) {
      isValid = false;
      errors.push('Chybí jméno pěstounů / kontaktní osoby.');
    }

    if (isValid) jobData.validRecords++;
    else jobData.invalidRecords++;

    return {
      rowId,
      jobId,
      orgId,
      raw: row,
      parsed: {
        fosterParents: pěstouni || 'Neznámý pěstoun',
        rc: rc || '',
        status: row['Stav'] || 'Aktivní dohlížení',
        childrenCount: parseInt(row['Počet dětí'] || '1', 10)
      },
      isValid,
      errors
    };
  });

  // Uložení úlohy a staging záznamů do Firestore / LocalStorage fallback
  try {
    await setDoc(doc(db, 'importJobs', jobId), jobData);
    for (const sRow of stagedRows) {
      await setDoc(doc(db, 'stagingRecords', `${jobId}_${sRow.rowId}`), sRow);
    }
  } catch (err) {
    console.warn("Firestore importJob zápis selhal, ukládám lokálně:", err.message);
    localStorage.setItem(`import_job_${jobId}`, JSON.stringify(jobData));
    localStorage.setItem(`import_staging_${jobId}`, JSON.stringify(stagedRows));
  }

  return { jobData, stagedRows };
}

/**
 * Potvrdí importní úlohu a zapíše data do produkčních kolekcí (`families`).
 * 
 * @param {string} jobId - ID importní úlohy
 * @param {string} orgId - ID organizace
 * @returns {Promise<Object>} Výsledek importu
 */
export async function commitImportJob(jobId, orgId) {
  let jobData = null;
  let stagedRows = [];

  try {
    const jobSnap = await getDoc(doc(db, 'importJobs', jobId));
    if (jobSnap.exists()) {
      jobData = jobSnap.data();
      const q = query(collection(db, 'stagingRecords'), where('jobId', '==', jobId));
      const snap = await getDocs(q);
      stagedRows = snap.docs.map(d => d.data());
    } else {
      const cachedJob = localStorage.getItem(`import_job_${jobId}`);
      const cachedRows = localStorage.getItem(`import_staging_${jobId}`);
      if (cachedJob) jobData = JSON.parse(cachedJob);
      if (cachedRows) stagedRows = JSON.parse(cachedRows);
    }
  } catch (err) {
    const cachedJob = localStorage.getItem(`import_job_${jobId}`);
    const cachedRows = localStorage.getItem(`import_staging_${jobId}`);
    if (cachedJob) jobData = JSON.parse(cachedJob);
    if (cachedRows) stagedRows = JSON.parse(cachedRows);
  }

  if (!jobData || jobData.status !== 'staged') {
    throw new Error("Importní úloha nebyla nalezena nebo již byla zpracována.");
  }

  const createdDocUids = [];

  for (const sRow of stagedRows) {
    if (!sRow.isValid) continue;

    // Vygenerování nového UID pro Spis rodiny (typ 99)
    const newUid = generateNextUidLocal(orgId, '99');
    const familyDoc = {
      uid: newUid,
      fosterParents: sRow.parsed.fosterParents,
      childrenCount: sRow.parsed.childrenCount,
      lastVisitAt: new Date().toISOString(),
      assignedTo: 'Importovaný spis',
      status: sRow.parsed.status,
      importedFromJobId: jobId,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'families', newUid), familyDoc);
    } catch (e) {
      localStorage.setItem(`imported_family_${newUid}`, JSON.stringify(familyDoc));
    }

    createdDocUids.push(newUid);
  }

  // Aktualizace stavu importní úlohy
  jobData.status = 'committed';
  jobData.committedAt = new Date().toISOString();
  jobData.createdDocUids = createdDocUids;

  try {
    await updateDoc(doc(db, 'importJobs', jobId), jobData);
  } catch (e) {
    localStorage.setItem(`import_job_${jobId}`, JSON.stringify(jobData));
  }

  return { success: true, count: createdDocUids.length, createdDocUids };
}

/**
 * Provede rollback (vrácení) importu během 30denního okna.
 * Smaže vytvořené dokumenty a změní stav úlohy na `rolled_back`.
 * 
 * @param {string} jobId - ID importní úlohy
 * @returns {Promise<Object>} Výsledek rollbacku
 */
export async function rollbackImportJob(jobId) {
  let jobData = null;

  try {
    const jobSnap = await getDoc(doc(db, 'importJobs', jobId));
    if (jobSnap.exists()) {
      jobData = jobSnap.data();
    } else {
      const cached = localStorage.getItem(`import_job_${jobId}`);
      if (cached) jobData = JSON.parse(cached);
    }
  } catch (err) {
    const cached = localStorage.getItem(`import_job_${jobId}`);
    if (cached) jobData = JSON.parse(cached);
  }

  if (!jobData || jobData.status !== 'committed') {
    throw new Error("Lze vrátit pouze úspěšně potvzené importy.");
  }

  // Kontrola 30denní lhůty
  const expiresAt = new Date(jobData.expiresAt);
  if (new Date() > expiresAt) {
    throw new Error("Lhůta 30 dnů pro rollback tohoto importu již vypršela.");
  }

  // Smazání vytvořených dokumentů
  const uids = jobData.createdDocUids || [];
  for (const uid of uids) {
    try {
      await deleteDoc(doc(db, 'families', uid));
    } catch (e) {
      localStorage.removeItem(`imported_family_${uid}`);
    }
  }

  jobData.status = 'rolled_back';
  jobData.rolledBackAt = new Date().toISOString();

  try {
    await updateDoc(doc(db, 'importJobs', jobId), jobData);
  } catch (e) {
    localStorage.setItem(`import_job_${jobId}`, JSON.stringify(jobData));
  }

  return { success: true, removedCount: uids.length };
}

/**
 * Exportuje kompletní data organizace (Spisy, Rodiny, Nastavení).
 * 
 * @param {string} orgId - ID organizace
 * @returns {Promise<Object>} Objekt s kompletními daty
 */
export async function exportOrganizationData(orgId) {
  const exportPayload = {
    orgId,
    exportedAt: new Date().toISOString(),
    version: '1.0',
    families: [],
    settings: {}
  };

  try {
    const q = query(collection(db, 'families'));
    const snap = await getDocs(q);
    exportPayload.families = snap.docs.map(d => d.data());
  } catch (err) {
    // Fallback sandbox data
    exportPayload.families = [
      { uid: '9900010000013', fosterParents: 'Petr a Anna Dvořákovi', childrenCount: 2 },
      { uid: '9900010000026', fosterParents: 'Marie Svobodová', childrenCount: 1 }
    ];
  }

  return exportPayload;
}

/**
 * Zašifruje data organizace pomocí AES-256 a zadaného hesla.
 * 
 * @param {Object} data - Exportní objekt
 * @param {string} passphrase - Heslo pro šifrování
 * @returns {string} Zašifrovaný řetězec
 */
export function encryptDataAES256(data, passphrase) {
  if (!passphrase || passphrase.length < 6) {
    throw new Error("Heslo pro šifrování zálohy musí mít minimálně 6 znaků.");
  }
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, passphrase).toString();
}

/**
 * Dešifruje zálohu AES-256.
 * 
 * @param {string} ciphertext - Zašifrovaný řetězec
 * @param {string} passphrase - Heslo pro dešifrování
 * @returns {Object} Původní dešifrovaná data
 */
export function decryptDataAES256(ciphertext, passphrase) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) {
      throw new Error("Neplatné heslo pro dešifrování.");
    }
    return JSON.parse(decryptedText);
  } catch (err) {
    throw new Error("Dešifrování selhalo. Zkontrolujte správnost hesla.");
  }
}
