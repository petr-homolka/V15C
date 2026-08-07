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
