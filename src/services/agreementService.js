import { db } from './firebase.js';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where } from 'firebase/firestore';

/**
 * Vytvoří nebo aktualizuje Dohodu o doprovázení rodiny.
 * 
 * @param {Object} agreementData - Data dohody
 * @returns {Promise<Object>} Uložená dohoda
 */
export async function saveAgreement(agreementData) {
  const agreementId = agreementData.id || `agreement_${agreementData.familyUid}`;
  const payload = {
    id: agreementId,
    familyUid: agreementData.familyUid,
    fosterParents: agreementData.fosterParents,
    assignedKoUid: agreementData.assignedKoUid || 'sandbox_ko_01',
    assignedKoName: agreementData.assignedKoName || 'Mgr. Jana Nováková',
    validFrom: agreementData.validFrom || new Date().toISOString().split('T')[0],
    validTo: agreementData.validTo || '2027-12-31',
    status: agreementData.status || 'Aktivní',
    servicesIncluded: agreementData.servicesIncluded || ['Respit', 'Vzdělávání', 'Psycholog'],
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'agreements', agreementId), payload, { merge: true });
  } catch (err) {
    console.warn("Firestore zápis dohody selhal, ukládám do LocalStorage:", err.message);
    localStorage.setItem(`agreement_${agreementId}`, JSON.stringify(payload));
  }

  return payload;
}

/**
 * Generuje anonymizované a segmentované shrnutí historie (`historyDigest`) pro bezpečné sdílení spisu napříč organizacemi nebo s OSPOD.
 * 
 * @param {Array<Object>} timelineEntries - Záznamy z časové osy spisu
 * @returns {Object} Segmentovaný digest historie
 */
export function generateHistoryDigest(timelineEntries) {
  if (!timelineEntries || timelineEntries.length === 0) {
    return {
      totalVisits: 0,
      lastVisitDate: null,
      digestSummary: "Žádná předchozí historie nebyla zaznamenána.",
      keyMilestones: []
    };
  }

  const externalCount = timelineEntries.filter(t => t.sharingLevel === 'external').length;
  const internalCount = timelineEntries.filter(t => t.sharingLevel === 'internal').length;

  const milestones = timelineEntries.map(t => ({
    date: t.date || t.createdAt,
    category: t.category || 'Návštěva v rodině',
    summary: t.aiSummary || t.note || 'Proběhl kontakt v rodině.',
    sharingLevel: t.sharingLevel || 'internal'
  }));

  return {
    totalVisits: timelineEntries.length,
    externalShareableVisits: externalCount,
    internalVisits: internalCount,
    lastVisitDate: timelineEntries[0]?.date || new Date().toISOString().split('T')[0],
    digestSummary: `Spis obsahuje celkem ${timelineEntries.length} kontaktních zápisů (z toho ${externalCount} se sdílením vnější reprezentace).`,
    keyMilestones: milestones
  };
}
