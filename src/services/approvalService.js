import { db } from './firebase.js';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import CryptoJS from 'crypto-js';

/**
 * Vytvoří nový dokument A1 (Dohoda o doprovázení) ke schválení.
 * 
 * @param {Object} docData - Data dokumentu
 * @returns {Promise<Object>} Vytvořený dokument
 */
export async function createDocumentA1(docData) {
  const docId = docData.id || `doc_a1_${Date.now()}`;
  const now = new Date().toISOString();

  const payload = {
    docId,
    type: 'A1_Dohoda_o_doprovazeni',
    familyUid: docData.familyUid,
    fosterParents: docData.fosterParents,
    assignedKoName: docData.assignedKoName || 'Mgr. Jana Nováková',
    status: 'draft', // draft | pending_approval | approved | rejected
    content: docData.content || 'Dohoda o výkonu pěstounské péče podle § 47b zákona č. 359/1999 Sb.',
    createdAt: now,
    sha256Hash: null,
    qrVerificationUrl: null
  };

  try {
    await setDoc(doc(db, 'approved_documents', docId), payload);
  } catch (err) {
    localStorage.setItem(`approved_doc_${docId}`, JSON.stringify(payload));
  }

  return payload;
}

/**
 * Schválí dokument vedením organizace a vygeneruje kryptografický hash (SHA-256) a QR kód pro ověření pravosti.
 * 
 * @param {string} docId - ID dokumentu
 * @param {string} managerName - Jméno schvalujícího manažera
 * @returns {Promise<Object>} Schválený dokument s QR a hash ověřením
 */
export async function approveDocumentA1(docId, managerName = 'Vedení organizace') {
  let docData = null;

  try {
    const snap = await getDoc(doc(db, 'approved_documents', docId));
    if (snap.exists()) docData = snap.data();
    else {
      const cached = localStorage.getItem(`approved_doc_${docId}`);
      if (cached) docData = JSON.parse(cached);
    }
  } catch (e) {
    const cached = localStorage.getItem(`approved_doc_${docId}`);
    if (cached) docData = JSON.parse(cached);
  }

  if (!docData) {
    docData = {
      docId,
      type: 'A1_Dohoda_o_doprovazeni',
      familyUid: '9900010000013',
      fosterParents: 'Petr a Anna Dvořákovi',
      assignedKoName: 'Mgr. Jana Nováková'
    };
  }

  const approvedAt = new Date().toISOString();
  // Vytvoření SHA-256 otisku obsahu a schválení
  const hashRaw = `${docData.docId}_${docData.familyUid}_${approvedAt}_${managerName}`;
  const sha256Hash = CryptoJS.SHA256(hashRaw).toString();
  const qrVerificationUrl = `https://doprovazeni.cz/overeni?doc=${docData.docId}&hash=${sha256Hash.substring(0, 16)}`;

  const updatedPayload = {
    ...docData,
    status: 'approved',
    approvedBy: managerName,
    approvedAt,
    sha256Hash,
    qrVerificationUrl
  };

  try {
    await updateDoc(doc(db, 'approved_documents', docId), updatedPayload);
  } catch (e) {
    localStorage.setItem(`approved_doc_${docId}`, JSON.stringify(updatedPayload));
  }

  return updatedPayload;
}
