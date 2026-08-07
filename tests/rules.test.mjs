// Ověření, že pravidla platí to, co mají: token bez role nic nevidí,
// účetní vidí metadata spisu ale ne obsah, nikdo nesmí mazat.
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { readFileSync } from 'node:fs'

const env = await initializeTestEnvironment({
  projectId: 'demo-rules',
  firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
})

await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore()
  await setDoc(doc(db, 'orgs/o1'), { displayName: 'Test' })
  await setDoc(doc(db, 'orgs/o1/caseFiles/cf1'), { reference: 'ROD-1' })
  await setDoc(doc(db, 'orgs/o1/caseFiles/cf1/entries/e1'), { kind: 'note', text: 'obsah' })
  await setDoc(doc(db, 'orgs/o1/persons/p1'), { displayName: 'Jan Novák' })
  await setDoc(doc(db, 'orgs/o1/persons/p1/private/contact'), { phone: '+420 601 000 111' })

  // diktát s otevřeným a zavřeným oknem na úpravu přepisu
  const open = Date.now() + 3 * 86400000
  const closed = Date.now() - 86400000
  await setDoc(doc(db, 'orgs/o1/caseFiles/cf1/dictations/d-open'), {
    recordedByPersonId: 'p-kw', status: 'ready',
    transcript: { text: 'původní', editableUntilMs: open, editWindowDays: 3 },
    summary: { proposedPlainText: 'souhrn' },
  })
  await setDoc(doc(db, 'orgs/o1/caseFiles/cf1/dictations/d-closed'), {
    recordedByPersonId: 'p-kw', status: 'ready',
    transcript: { text: 'původní', editableUntilMs: closed, editWindowDays: 3 },
    summary: { proposedPlainText: 'souhrn' },
  })
  // marketplace
  await setDoc(doc(db, 'providers/prov1'), { slug: 'akademie', displayName: 'Akademie NRP' })
  await setDoc(doc(db, 'providers/prov1/courses/c-listed'), { title: 'Attachment', status: 'listed', hours: 8 })
  await setDoc(doc(db, 'providers/prov1/courses/c-draft'), { title: 'Rozpracovaný', status: 'draft', hours: 4 })
  await setDoc(doc(db, 'listings/l1'), { courseId: 'c-listed', providerId: 'prov1', visibility: 'public', title: 'Attachment', hours: 8 })
  await setDoc(doc(db, 'listings/l2'), { courseId: 'c-x', providerId: 'prov1', visibility: 'system_only', title: 'Jen v systému', hours: 4 })
  await setDoc(doc(db, 'orders/ord1'), {
    providerId: 'prov1', courseId: 'c-listed',
    buyer: { kind: 'organization', organizationId: 'o1', organizationName: 'Test' },
    status: 'approved',
  })
  await setDoc(doc(db, 'orders/ord2'), {
    providerId: 'prov9', courseId: 'c-y',
    buyer: { kind: 'organization', organizationId: 'o9', organizationName: 'Cizí' },
    status: 'approved',
  })
  await setDoc(doc(db, 'certificates/cert1'), { orderId: 'ord1', hours: 8, participantName: 'Eva Nováková' })
  await setDoc(doc(db, 'orgs/o1/caseFiles/cf1/documents/d1'), { category: 'receipt', title: 'Účtenka' })
  await setDoc(doc(db, 'orgs/o1/caseFiles/cf1/documents/d1/transcript/1'), {
    documentId: 'd1', documentVersionNo: 1, ocrText: 'Celkem 340 Kč',
    plainText: 'Celkem 340 Kč', createdByPersonId: 'p-kw',
  })

  await setDoc(doc(db, 'verifications/tok-abc'), {
    documentId: 'doc1', organizationId: 'o1',
    publicFacts: { issuerName: 'Test o.p.s.', ourReference: 'ZPR-2026/0042', contentHash: 'abc' },
  })
  await setDoc(doc(db, 'orgs/o1/branding/current'), { logo: { printHeightMm: 14 } })
  await setDoc(doc(db, 'orgs/o1/referenceSeries/zprava'), { prefix: 'ZPR', year: 2026, lastSequence: 42 })
  await setDoc(doc(db, 'orgs/o1/codebookItems/ci-used'), {
    codebookCode: 'expense.category', code: 'jizdne', label: 'Jízdné',
    createdByPersonId: 'p-kw', status: 'active',
  })
})

const outsider = env.authenticatedContext('u-out', { pid: 'p-out', orgs: {} }).firestore()
const accountant = env.authenticatedContext('u-acc', { pid: 'p-acc', orgs: { o1: 'accountant' } }).firestore()
const worker = env.authenticatedContext('u-kw', { pid: 'p-kw', orgs: { o1: 'key_worker' } }).firestore()
const admin = env.authenticatedContext('u-ad', { pid: 'p-ad', orgs: { o1: 'org_admin' } }).firestore()

const t = []
const check = async (label, p) => { try { await p; t.push(['OK  ', label]) } catch (e) { t.push(['CHYBA', label + ' — ' + e.message]) } }

await check('cizí člověk nevidí organizaci',        assertFails(getDoc(doc(outsider, 'orgs/o1'))))
await check('cizí člověk nevidí spis',              assertFails(getDoc(doc(outsider, 'orgs/o1/caseFiles/cf1'))))
await check('účetní VIDÍ metadata spisu',           assertSucceeds(getDoc(doc(accountant, 'orgs/o1/caseFiles/cf1'))))
await check('účetní NEVIDÍ obsah spisu',            assertFails(getDoc(doc(accountant, 'orgs/o1/caseFiles/cf1/entries/e1'))))
await check('klíčová osoba vidí obsah spisu',       assertSucceeds(getDoc(doc(worker, 'orgs/o1/caseFiles/cf1/entries/e1'))))
await check('účetní NEVIDÍ kontakty osoby',         assertFails(getDoc(doc(accountant, 'orgs/o1/persons/p1/private/contact'))))
await check('klíčová osoba vidí kontakty osoby',    assertSucceeds(getDoc(doc(worker, 'orgs/o1/persons/p1/private/contact'))))
await check('nikdo nesmí mazat záznam (kl. osoba)', assertFails(deleteDoc(doc(worker, 'orgs/o1/caseFiles/cf1/entries/e1'))))
await check('nikdo nesmí mazat záznam (admin)',     assertFails(deleteDoc(doc(admin, 'orgs/o1/caseFiles/cf1/entries/e1'))))
await check('nikdo nesmí mazat spis (admin)',       assertFails(deleteDoc(doc(admin, 'orgs/o1/caseFiles/cf1'))))
await check('nikdo nesmí mazat osobu (admin)',      assertFails(deleteDoc(doc(admin, 'orgs/o1/persons/p1'))))
await check('lhůty klient nezapisuje',              assertFails(setDoc(doc(worker, 'orgs/o1/obligations/x'), { kind: 'personal_contact' })))
await check('autor zápisu musí být volající',       assertFails(setDoc(doc(worker, 'orgs/o1/caseFiles/cf1/entries/e2'), { kind: 'note', createdByPersonId: 'nekdo-jiny' })))
await check('audit se nedá přepsat',                assertFails(setDoc(doc(worker, 'orgs/o1/audit/a1'), { personId: 'p-jiny', kind: 'case_file_view' })))
await check('účetní nemění nastavení',              assertFails(setDoc(doc(accountant, 'orgs/o1/settings/general'), { scope: 'general' })))
await check('admin mění nastavení',                 assertSucceeds(setDoc(doc(admin, 'orgs/o1/settings/general'), { scope: 'general' })))

// číselníky: přidat smí každý člen, vyřadit vedení, mazat nikdo z klienta
await check('klíčová osoba PŘIDÁ položku číselníku', assertSucceeds(setDoc(doc(worker, 'orgs/o1/codebookItems/ci-new'), {
  codebookCode: 'expense.category', code: 'tabor', label: 'Tábor', createdByPersonId: 'p-kw', status: 'active' })))
await check('cizí člověk položku nepřidá', assertFails(setDoc(doc(outsider, 'orgs/o1/codebookItems/ci-x'), {
  codebookCode: 'expense.category', code: 'x', label: 'X', createdByPersonId: 'p-out', status: 'active' })))
await check('vedení položku vyřadí', assertSucceeds(setDoc(doc(admin, 'orgs/o1/codebookItems/ci-used'), {
  codebookCode: 'expense.category', code: 'jizdne', label: 'Jízdné',
  createdByPersonId: 'p-kw', status: 'retired' })))
await check('položku číselníku nemaže ani admin', assertFails(deleteDoc(doc(admin, 'orgs/o1/codebookItems/ci-used'))))

// marketplace: veřejná nabídka bez přihlášení, objednávky jen svým
const anonMk = env.unauthenticatedContext().firestore()
const provider = env.authenticatedContext('u-prov', { pid: 'p-prov', providers: { prov1: 'provider_admin' } }).firestore()
await check('profil pořadatele je veřejný', assertSucceeds(getDoc(doc(anonMk, 'providers/prov1'))))
await check('vylistovaný kurz je veřejný', assertSucceeds(getDoc(doc(anonMk, 'providers/prov1/courses/c-listed'))))
await check('rozpracovaný kurz veřejný NENÍ', assertFails(getDoc(doc(anonMk, 'providers/prov1/courses/c-draft'))))
await check('veřejná nabídka jde číst bez přihlášení', assertSucceeds(getDoc(doc(anonMk, 'listings/l1'))))
await check('nabídka jen pro systém veřejná není', assertFails(getDoc(doc(anonMk, 'listings/l2'))))
await check('nabídku nezapíše ani pořadatel', assertFails(setDoc(doc(provider, 'listings/l3'), { visibility: 'public' })))
await check('pořadatel upraví svůj kurz', assertSucceeds(setDoc(doc(provider, 'providers/prov1/courses/c-listed'), { title: 'Attachment II', status: 'listed', hours: 8 })))
await check('cizí kurz pořadatel neupraví', assertFails(setDoc(doc(worker, 'providers/prov1/courses/c-listed'), { title: 'Hack', status: 'listed', hours: 8 })))
await check('organizace vidí svou objednávku', assertSucceeds(getDoc(doc(worker, 'orders/ord1'))))
await check('cizí objednávku organizace nevidí', assertFails(getDoc(doc(worker, 'orders/ord2'))))
await check('pořadatel vidí objednávku na svůj kurz', assertSucceeds(getDoc(doc(provider, 'orders/ord1'))))
await check('objednávku nezaloží klient', assertFails(setDoc(doc(worker, 'orders/ord3'), { providerId: 'prov1' })))
await check('certifikát se nedá upravit z klienta', assertFails(setDoc(doc(provider, 'certificates/cert1'), { hours: 40 })))

// přepis dokladu: opravitelný kdykoli, ale ocrText se nepřepisuje
await check('přepis dokladu lze opravit kdykoli', assertSucceeds(setDoc(doc(worker, 'orgs/o1/caseFiles/cf1/documents/d1/transcript/1'), {
  documentId: 'd1', documentVersionNo: 1, ocrText: 'Celkem 340 Kč',
  plainText: 'Celkem 340,00 Kč', createdByPersonId: 'p-kw' })))
await check('surový OCR text se nepřepisuje', assertFails(setDoc(doc(worker, 'orgs/o1/caseFiles/cf1/documents/d1/transcript/1'), {
  documentId: 'd1', documentVersionNo: 1, ocrText: 'Celkem 3400 Kč',
  plainText: 'Celkem 3400 Kč', createdByPersonId: 'p-kw' })))
await check('účetní přepis dokladu nevidí', assertFails(getDoc(doc(accountant, 'orgs/o1/caseFiles/cf1/documents/d1/transcript/1'))))

// QR ověření: veřejně čitelné po tokenu, ale nevypsatelné
const anon = env.unauthenticatedContext().firestore()
await check('ověření dokumentu čte i nepřihlášený', assertSucceeds(getDoc(doc(anon, 'verifications/tok-abc'))))
await check('ověření se nedá přepsat', assertFails(setDoc(doc(anon, 'verifications/tok-abc'), { documentId: 'x' })))
await check('ověření nezapíše ani admin', assertFails(setDoc(doc(admin, 'verifications/tok-xyz'), { documentId: 'x' })))

// branding a číselné řady
await check('branding čte každý člen', assertSucceeds(getDoc(doc(worker, 'orgs/o1/branding/current'))))
await check('branding mění jen vedení', assertFails(setDoc(doc(accountant, 'orgs/o1/branding/current'), { logo: { printHeightMm: 20 } })))
await check('jednací číslo nezvyšuje klient', assertFails(setDoc(doc(admin, 'orgs/o1/referenceSeries/zprava'), { prefix: 'ZPR', year: 2026, lastSequence: 43 })))

// diktát: přepis jen v okně, souhrn vždy
await check('přepis lze upravit v okně', assertSucceeds(setDoc(doc(worker, 'orgs/o1/caseFiles/cf1/dictations/d-open'), {
  recordedByPersonId: 'p-kw', status: 'ready',
  transcript: { text: 'opraveno', editableUntilMs: Date.now() + 3 * 86400000, editWindowDays: 3 },
  summary: { proposedPlainText: 'souhrn' } })))
await check('přepis NELZE upravit po okně', assertFails(setDoc(doc(worker, 'orgs/o1/caseFiles/cf1/dictations/d-closed'), {
  recordedByPersonId: 'p-kw', status: 'ready',
  transcript: { text: 'opraveno', editableUntilMs: Date.now() - 86400000, editWindowDays: 3 },
  summary: { proposedPlainText: 'souhrn' } })))
await check('souhrn lze upravit i po okně', assertSucceeds(setDoc(doc(worker, 'orgs/o1/caseFiles/cf1/dictations/d-closed'), {
  recordedByPersonId: 'p-kw', status: 'ready',
  transcript: { text: 'původní', editableUntilMs: Date.now() - 86400000, editWindowDays: 3 },
  summary: { proposedPlainText: 'souhrn', editedText: 'jiný souhrn' } })))
await check('diktát nemaže nikdo', assertFails(deleteDoc(doc(admin, 'orgs/o1/caseFiles/cf1/dictations/d-open'))))
await check('účetní diktát nevidí', assertFails(getDoc(doc(accountant, 'orgs/o1/caseFiles/cf1/dictations/d-open'))))

for (const [s, l] of t) console.log(s, l)
console.log('\n' + (t.every(([s]) => s === 'OK  ') ? 'VŠE PROŠLO' : 'NĚCO SELHALO'))
await env.cleanup()
