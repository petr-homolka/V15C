import { db } from './firebase.js';
import { doc, setDoc } from 'firebase/firestore';
import { generateUid, ENTITY_TYPES } from './identityService.js';

/**
 * Generování oficiálních EAN-13 UID podle specifikace 001-IDENTITY_MODEL.md:
 * Typy:
 * 10 - Pěstoun
 * 20 - Dítě
 * 30 - Klíčová osoba
 * 40 - Zaměstnanec
 * 90 - Dohoda o pěstounské péči / Spis
 */

// Pěstouni (Typ 10)
const fp1Uid = generateUid(ENTITY_TYPES.FOSTER_PARENT, 1); // 1048270000018
const fp2Uid = generateUid(ENTITY_TYPES.FOSTER_PARENT, 2); // 1048270000025
const fp3Uid = generateUid(ENTITY_TYPES.FOSTER_PARENT, 3); // 1048270000032
const fp4Uid = generateUid(ENTITY_TYPES.FOSTER_PARENT, 4); // 1048270000049
const fp5Uid = generateUid(ENTITY_TYPES.FOSTER_PARENT, 5); // 1048270000056
const fp6Uid = generateUid(ENTITY_TYPES.FOSTER_PARENT, 6); // 1048270000063
const fp7Uid = generateUid(ENTITY_TYPES.FOSTER_PARENT, 7); // 1048270000070

// Děti (Typ 20)
const ch1Uid = generateUid(ENTITY_TYPES.CHILD, 1); // 2048270000015
const ch2Uid = generateUid(ENTITY_TYPES.CHILD, 2); // 2048270000022
const ch3Uid = generateUid(ENTITY_TYPES.CHILD, 3); // 2048270000039
const ch4Uid = generateUid(ENTITY_TYPES.CHILD, 4); // 2048270000046
const ch5Uid = generateUid(ENTITY_TYPES.CHILD, 5); // 2048270000053
const ch6Uid = generateUid(ENTITY_TYPES.CHILD, 6); // 2048270000060

// Klíčové osoby (Typ 30) a Zaměstnanci (Typ 40)
const ko1Uid = generateUid(ENTITY_TYPES.KEY_PERSON, 1); // 3048270000012
const ko2Uid = generateUid(ENTITY_TYPES.KEY_PERSON, 2); // 3048270000029
const emp1Uid = generateUid(ENTITY_TYPES.EMPLOYEE, 1);   // 4048270000019
const emp2Uid = generateUid(ENTITY_TYPES.EMPLOYEE, 2);   // 4048270000026
const emp3Uid = generateUid(ENTITY_TYPES.EMPLOYEE, 3);   // 4048270000033

// Dohody / Spisy (Typ 90)
const fam1Uid = generateUid(ENTITY_TYPES.AGREEMENT, 1); // 9048270000014
const fam2Uid = generateUid(ENTITY_TYPES.AGREEMENT, 2); // 9048270000021
const fam3Uid = generateUid(ENTITY_TYPES.AGREEMENT, 3); // 9048270000038
const fam4Uid = generateUid(ENTITY_TYPES.AGREEMENT, 4); // 9048270000045

export const EXTENSIVE_SEED_DATA = {
  fosterParents: [
    {
      uid: fp1Uid,
      name: 'Petr Dvořák',
      rc: '850112/1234',
      phone: '+420 777 111 222',
      email: 'petr.dvorak@seznam.cz',
      city: 'Praha 4 - Nusle',
      familyUid: fam1Uid,
      ko: 'Mgr. Jana Nováková',
      type: 'foster'
    },
    {
      uid: fp2Uid,
      name: 'Anna Dvořáková',
      rc: '885420/5678',
      phone: '+420 777 111 333',
      email: 'anna.dvorakova@seznam.cz',
      city: 'Praha 4 - Nusle',
      familyUid: fam1Uid,
      ko: 'Mgr. Jana Nováková',
      type: 'foster'
    },
    {
      uid: fp3Uid,
      name: 'Marie Svobodová',
      rc: '795810/4321',
      phone: '+420 608 333 444',
      email: 'svobodova.marie@centrum.cz',
      city: 'Praha 8 - Karlín',
      familyUid: fam2Uid,
      ko: 'Mgr. Jana Nováková',
      type: 'foster'
    },
    {
      uid: fp4Uid,
      name: 'Jan Novotný',
      rc: '820315/9876',
      phone: '+420 731 555 666',
      email: 'jan.novotny@gmail.com',
      city: 'Benešov',
      familyUid: fam3Uid,
      ko: 'Bc. Martin Růžička',
      type: 'foster'
    },
    {
      uid: fp5Uid,
      name: 'Kateřina Novotná',
      rc: '845920/1122',
      phone: '+420 731 555 777',
      email: 'katerina.novotna@gmail.com',
      city: 'Benešov',
      familyUid: fam3Uid,
      ko: 'Bc. Martin Růžička',
      type: 'foster'
    },
    {
      uid: fp6Uid,
      name: 'Ing. Jaroslav Černý',
      rc: '770911/3344',
      phone: '+420 724 999 888',
      email: 'jaroslav.cerny@email.cz',
      city: 'Kladno',
      familyUid: fam4Uid,
      ko: 'Mgr. Jana Nováková',
      type: 'foster'
    },
    {
      uid: fp7Uid,
      name: 'Lucie Černá',
      rc: '805405/5566',
      phone: '+420 724 999 999',
      email: 'lucie.cerna@email.cz',
      city: 'Kladno',
      familyUid: fam4Uid,
      ko: 'Mgr. Jana Nováková',
      type: 'foster'
    }
  ],

  families: [
    {
      id: fam1Uid,
      uid: fam1Uid,
      careType: 'joint',
      primaryFosterParent: { uid: fp1Uid, name: 'Petr Dvořák', rc: '850112/1234', phone: '+420 777 111 222', email: 'petr.dvorak@seznam.cz' },
      secondaryFosterParent: { uid: fp2Uid, name: 'Anna Dvořáková', rc: '885420/5678', phone: '+420 777 111 333', email: 'anna.dvorakova@seznam.cz' },
      fosterParentsDisplay: 'Petr Dvořák a Anna Dvořáková (Společná péče)',
      city: 'Praha 4 - Nusle',
      childrenCount: 2,
      lastVisitAt: '2026-06-15',
      nextPlannedVisit: '2026-08-10',
      assignedTo: 'Mgr. Jana Nováková',
      status: 'Aktivní dohlížení',
      warning: false,
      respitHoursUsed: 14,
      respitHoursTotal: 40,
      spvppUsed: 3500,
      spvppTotal: 12000,
      agreementDate: '2022-01-15'
    },
    {
      id: fam2Uid,
      uid: fam2Uid,
      careType: 'sole',
      primaryFosterParent: { uid: fp3Uid, name: 'Marie Svobodová', rc: '795810/4321', phone: '+420 608 333 444', email: 'svobodova.marie@centrum.cz' },
      secondaryFosterParent: null,
      fosterParentsDisplay: 'Marie Svobodová (Výhradní péče)',
      city: 'Praha 8 - Karlín',
      childrenCount: 1,
      lastVisitAt: '2026-05-10',
      nextPlannedVisit: '2026-07-29',
      assignedTo: 'Mgr. Jana Nováková',
      status: 'Čeká na návštěvu',
      warning: true,
      respitHoursUsed: 28,
      respitHoursTotal: 40,
      spvppUsed: 8900,
      spvppTotal: 12000,
      agreementDate: '2021-09-01'
    },
    {
      id: fam3Uid,
      uid: fam3Uid,
      careType: 'joint',
      primaryFosterParent: { uid: fp4Uid, name: 'Jan Novotný', rc: '820315/9876', phone: '+420 731 555 666', email: 'jan.novotny@gmail.com' },
      secondaryFosterParent: { uid: fp5Uid, name: 'Kateřina Novotná', rc: '845920/1122', phone: '+420 731 555 777', email: 'katerina.novotna@gmail.com' },
      fosterParentsDisplay: 'Jan Novotný a Kateřina Novotná (Společná péče)',
      city: 'Benešov',
      childrenCount: 3,
      lastVisitAt: '2026-07-01',
      nextPlannedVisit: '2026-09-01',
      assignedTo: 'Bc. Martin Růžička',
      status: 'Aktivní dohlížení',
      warning: false,
      respitHoursUsed: 8,
      respitHoursTotal: 40,
      spvppUsed: 1200,
      spvppTotal: 12000,
      agreementDate: '2023-03-10'
    },
    {
      id: fam4Uid,
      uid: fam4Uid,
      careType: 'joint',
      primaryFosterParent: { uid: fp6Uid, name: 'Ing. Jaroslav Černý', rc: '770911/3344', phone: '+420 724 999 888', email: 'jaroslav.cerny@email.cz' },
      secondaryFosterParent: { uid: fp7Uid, name: 'Lucie Černá', rc: '805405/5566', phone: '+420 724 999 999', email: 'lucie.cerna@email.cz' },
      fosterParentsDisplay: 'Ing. Jaroslav Černý a Lucie Černá (Společná péče)',
      city: 'Kladno',
      childrenCount: 2,
      lastVisitAt: '2026-06-20',
      nextPlannedVisit: '2026-08-20',
      assignedTo: 'Mgr. Jana Nováková',
      status: 'Aktivní dohlížení',
      warning: false,
      respitHoursUsed: 20,
      respitHoursTotal: 40,
      spvppUsed: 6500,
      spvppTotal: 12000,
      agreementDate: '2020-11-01'
    }
  ],

  children: [
    { id: ch1Uid, uid: ch1Uid, name: 'Tomáš Dvořák', rc: '140512/1234', birthYear: 2014, birthDate: '12.05.2014', familyUid: fam1Uid, fosterParentsText: 'Petr Dvořák a Anna Dvořáková', ospod: 'OSPOD Praha 4', ko: 'Mgr. Jana Nováková', school: 'ZŠ Křesomyslova', type: 'child' },
    { id: ch2Uid, uid: ch2Uid, name: 'Eliška Dvořáková', rc: '175820/5678', birthYear: 2017, birthDate: '20.08.2017', familyUid: fam1Uid, fosterParentsText: 'Petr Dvořák a Anna Dvořáková', ospod: 'OSPOD Praha 4', ko: 'Mgr. Jana Nováková', school: 'MŠ Boleslavova', type: 'child' },
    { id: ch3Uid, uid: ch3Uid, name: 'Jakub Svoboda', rc: '190315/4321', birthYear: 2019, birthDate: '15.03.2019', familyUid: fam2Uid, fosterParentsText: 'Marie Svobodová (Výhradní péče)', ospod: 'OSPOD Praha 8', ko: 'Mgr. Jana Nováková', school: 'MŠ Křižíkova', type: 'child' },
    { id: ch4Uid, uid: ch4Uid, name: 'Klára Novotná', rc: '155210/9876', birthYear: 2015, birthDate: '10.02.2015', familyUid: fam3Uid, fosterParentsText: 'Jan Novotný a Kateřina Novotná', ospod: 'OSPOD Benešov', ko: 'Bc. Martin Růžička', school: 'ZŠ Dukelská Benešov', type: 'child' },
    { id: ch5Uid, uid: ch5Uid, name: 'Filip Novotný', rc: '180904/1122', birthYear: 2018, birthDate: '04.09.2018', familyUid: fam3Uid, fosterParentsText: 'Jan Novotný a Kateřina Novotná', ospod: 'OSPOD Benešov', ko: 'Bc. Martin Růžička', school: 'MŠ Úsměv Benešov', type: 'child' },
    { id: ch6Uid, uid: ch6Uid, name: 'Matěj Černý', rc: '160711/3344', birthYear: 2016, birthDate: '11.07.2016', familyUid: fam4Uid, fosterParentsText: 'Ing. Jaroslav Černý a Lucie Černá', ospod: 'OSPOD Kladno', ko: 'Mgr. Jana Nováková', school: 'ZŠ Norská Kladno', type: 'child' }
  ],

  team: [
    { id: ko1Uid, uid: ko1Uid, name: 'Mgr. Jana Nováková', role: 'Klíčová osoba pěstounské péče', phone: '+420 777 123 456', email: 'jana.novakova@doprovazeni.cz', activeFamilies: 12, type: 'staff' },
    { id: ko2Uid, uid: ko2Uid, name: 'Bc. Martin Růžička', role: 'Klíčový pracovník a metodik', phone: '+420 777 234 567', email: 'martin.ruzicka@doprovazeni.cz', activeFamilies: 10, type: 'staff' },
    { id: emp1Uid, uid: emp1Uid, name: 'PhDr. Alena Procházková', role: 'Psycholožka a terapeutka', phone: '+420 777 345 678', email: 'alena.prochazkova@doprovazeni.cz', activeFamilies: 25, type: 'staff' },
    { id: emp2Uid, uid: emp2Uid, name: 'JUDr. Pavel Horák', role: 'Právní poradce v rodinném právu', phone: '+420 777 456 789', email: 'pavel.horak@doprovazeni.cz', activeFamilies: 40, type: 'staff' },
    { id: emp3Uid, uid: emp3Uid, name: 'Ing. Veronika Malá', role: 'Koordinátorka respitní péče a vzdělávaní', phone: '+420 777 567 890', email: 'veronika.mala@doprovazeni.cz', activeFamilies: 35, type: 'staff' }
  ]
};

export async function seedAllTestData() {
  localStorage.setItem('extensive_foster_parents', JSON.stringify(EXTENSIVE_SEED_DATA.fosterParents));
  localStorage.setItem('extensive_families', JSON.stringify(EXTENSIVE_SEED_DATA.families));
  localStorage.setItem('extensive_children', JSON.stringify(EXTENSIVE_SEED_DATA.children));
  localStorage.setItem('extensive_team', JSON.stringify(EXTENSIVE_SEED_DATA.team));

  try {
    for (const fam of EXTENSIVE_SEED_DATA.families) {
      await setDoc(doc(db, 'families', fam.id), fam);
    }
  } catch (e) {
    console.warn("Firestore write fallback");
  }

  return true;
}
