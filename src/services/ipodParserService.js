import { db } from './firebase.js';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

/**
 * AI Parser & Registr IPODu (Individuálního plánu ochrany dítěte) vydaného OSPODem.
 */

/**
 * Simuluje AI čtení a sémantický přepis nahraného IPODu od OSPODu.
 * 
 * @param {string} rawTextOrFileName - Obsah nebo název nahraného IPODu
 * @param {string} familyUid - UID spisu rodiny
 * @returns {Promise<Object>} Analýza IPODu od AI
 */
export async function parseIpodFromOspod(rawTextOrFileName, familyUid = '9900010000013') {
  const now = new Date().toISOString();

  // Inteligentní AI analýza požadavků OSPODu
  const parsedData = {
    ipodId: `ipod_${Date.now()}`,
    familyUid,
    version: 'v1.0',
    issuedByOspod: 'OSPOD Praha 4 (PhDr. Helena Kolářová)',
    issueDate: '2026-07-01',
    validUntil: '2027-06-30',
    requiredVisitFrequencyDays: 60, // Standardní bi-monthly (60 dní)
    statutoryGoals: [
      'Zajistit pravidelné doučování matematiky a českého jazyka pro Tomáše.',
      'Podpořit pěstouny v kurzu práce s emocemi a traumatem.',
      'Umožnit bezpečný kontakt s biologickou matkou 1x za 2 měsíce v prostředí organizace.'
    ],
    mandatoryActions: [
      { id: 'act_1', title: 'Psychologické vyšetření Tomáše v PPP', deadline: '2026-09-15', status: 'pending' },
      { id: 'act_2', title: 'Absolvování 24 hod. vzdělávání pěstounů', deadline: '2026-12-31', status: 'in_progress' },
      { id: 'act_3', title: 'Podání půlroční zprávy o průběhu pěstounské péče na OSPOD', deadline: '2026-12-15', status: 'pending' }
    ],
    aiSummaryNote: 'OSPOD vyžaduje zvýšený dohled nad školní docházkou a dodržování dohodnutých kontaktů s biologickou matkou.'
  };

  return parsedData;
}

/**
 * Uloží novou verzi IPODu od OSPODu pro danou rodinu.
 * 
 * @param {string} familyUid - UID spisu rodiny
 * @param {Object} ipodPayload - Analýza a data IPODu
 * @returns {Promise<Object>} Uložená verze
 */
export async function saveIpodVersion(familyUid, ipodPayload) {
  const existingHistory = getStoredIpodHistory(familyUid);
  const versionNumber = `v${existingHistory.length + 1}.0`;

  const finalPayload = {
    ...ipodPayload,
    familyUid,
    version: versionNumber,
    uploadedAt: new Date().toISOString()
  };

  const updatedHistory = [finalPayload, ...existingHistory];
  localStorage.setItem(`ipod_history_${familyUid}`, JSON.stringify(updatedHistory));

  try {
    await setDoc(doc(db, 'ipod_records', finalPayload.ipodId), finalPayload);
  } catch (e) {
    console.warn("Firestore fallback to local storage for IPOD history");
  }

  return finalPayload;
}

/**
 * Vrací historii všech verze IPODu od OSPODu pro danou rodinu.
 * 
 * @param {string} familyUid - UID spisu rodiny
 * @returns {Array<Object>} Seznam verze IPODu
 */
export function getStoredIpodHistory(familyUid = '9900010000013') {
  const cached = localStorage.getItem(`ipod_history_${familyUid}`);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      return [];
    }
  }

  // Výchozí archivní verze pro testování
  const defaultHistory = [
    {
      ipodId: 'ipod_v2_default',
      familyUid,
      version: 'v2.0',
      issuedByOspod: 'OSPOD Praha 4 (PhDr. Helena Kolářová)',
      issueDate: '2026-07-01',
      validUntil: '2027-06-30',
      requiredVisitFrequencyDays: 60,
      statutoryGoals: [
        'Zajistit pravidelné doučování matematiky pro Tomáše.',
        'Podpořit pěstouny v rozvoji emocí dětí.',
        'Kontakt s biologickou matkou 1x za 2 měsíce v doprovázející organizaci.'
      ],
      mandatoryActions: [
        { id: 'act_1', title: 'Psychologické vyšetření Tomáše v PPP', deadline: '2026-09-15', status: 'pending' },
        { id: 'act_2', title: 'Absolvování 24 hod. vzdělávání pěstounů', deadline: '2026-12-31', status: 'in_progress' }
      ],
      aiSummaryNote: 'Nové vydání IPODu od OSPODu. Přidán požadavek na psychologické vyšetření v PPP.'
    },
    {
      ipodId: 'ipod_v1_default',
      familyUid,
      version: 'v1.0',
      issuedByOspod: 'OSPOD Praha 4 (Mgr. Pavel Veleba)',
      issueDate: '2025-06-15',
      validUntil: '2026-06-30',
      requiredVisitFrequencyDays: 60,
      statutoryGoals: [
        'Adaptace dětí v pěstounské rodině.',
        'Zavedení pravidelného doprovázení Klíčovou osobou.'
      ],
      mandatoryActions: [
        { id: 'act_old1', title: 'Uzavření Dohody o doprovázení A1', deadline: '2025-07-15', status: 'completed' }
      ],
      aiSummaryNote: 'Původní schválený IPOD při převzetí spisu.'
    }
  ];

  localStorage.setItem(`ipod_history_${familyUid}`, JSON.stringify(defaultHistory));
  return defaultHistory;
}
