/**
 * Testy čistých funkcí ze schématu. Pravidla se testují zvlášť
 * (`rules.test.mjs`) proti emulátoru; tohle běží bez něj.
 *
 *   npm run test:schema
 */

import assert from 'node:assert/strict'
import {
  UID_ALPHABET, UID_LENGTH, UID_SPACE, generateUid, isUid,
  normalizeUidInput, formatUidForReading,
  familyPlural, deriveAgreementName, renameAgreement,
  hasProfile, hasService, mergeCodebook, termsForDomain, DOMAIN_RIGHT_CODE,
} from '../schema/src/index.ts'

const results = []
const t = (label, fn) => {
  try { fn(); results.push(['OK  ', label]) }
  catch (e) { results.push(['CHYBA', `${label} — ${e.message}`]) }
}

/* ---------------------------------------------------------------- */
/* UID                                                              */
/* ---------------------------------------------------------------- */

t('abeceda neobsahuje znaky, které se pletou', () => {
  for (const ch of ['o', '0', 'i', 'l', '1']) {
    assert.ok(!UID_ALPHABET.includes(ch), `abeceda obsahuje ${ch}`)
  }
})

t('abeceda je jen malá písmena a číslice', () => {
  assert.match(UID_ALPHABET, /^[a-z2-9]+$/)
})

t('prostor odpovídá 31^6', () => {
  assert.equal(UID_ALPHABET.length, 31)
  assert.equal(UID_SPACE, 31 ** 6)
  assert.equal(UID_LENGTH, 6)
})

t('generovaný UID projde validací', () => {
  let seed = 12345
  const rnd = (max) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % max }
  for (let i = 0; i < 500; i++) {
    const uid = generateUid(rnd)
    assert.equal(uid.length, 6)
    assert.ok(isUid(uid), `neplatný UID: ${uid}`)
  }
})

t('normalizace opraví velká písmena, mezery a pomlčky', () => {
  assert.equal(normalizeUidInput('U6T4F3'), 'u6t4f3')
  assert.equal(normalizeUidInput(' u6 t4 f3 '), 'u6t4f3')
  assert.equal(normalizeUidInput('u6-t4-f3'), 'u6t4f3')
})

t('normalizace NEHÁDÁ záměnu znaku', () => {
  // 'o' a '1' v abecedě nejsou; hádat, co tím člověk myslel, by mohlo
  // vrátit UID někoho jiného — proto null (uid.ts).
  assert.equal(normalizeUidInput('o6t4f3'), null)
  assert.equal(normalizeUidInput('u6t4f1'), null)
  assert.equal(normalizeUidInput('u6t4f'), null)
  assert.equal(normalizeUidInput('u6t4f33'), null)
})

t('formát pro čtení dělí po dvojicích', () => {
  assert.equal(formatUidForReading('u6t4f3'), 'u6 t4 f3')
})

/* ---------------------------------------------------------------- */
/* Čeština — rodinné tvary                                          */
/* ---------------------------------------------------------------- */

t('rodinný tvar vypouští -e- u příjmení na -ek, -ec', () => {
  assert.equal(familyPlural('Blažková'), 'Blažkovi')
  assert.equal(familyPlural('Jelínková'), 'Jelínkovi')
  assert.equal(familyPlural('Marková'), 'Markovi')
  assert.equal(familyPlural('Němcová'), 'Němcovi')
  assert.equal(familyPlural('Šimková'), 'Šimkovi')
})

t('rodinný tvar nechává -e- tam, kde patří', () => {
  assert.equal(familyPlural('Nováková'), 'Novákovi')
  assert.equal(familyPlural('Kadlecová'), 'Kadlecovi')
  assert.equal(familyPlural('Benešová'), 'Benešovi')
})

t('přídavná jména dostanou -í', () => {
  assert.equal(familyPlural('Veselá'), 'Veselí')
  assert.equal(familyPlural('Černá'), 'Černí')
  assert.equal(familyPlural('Malá'), 'Malí')
  assert.equal(familyPlural('Novotná'), 'Novotní')
})

/* ---------------------------------------------------------------- */
/* Název dohody                                                     */
/* ---------------------------------------------------------------- */

const carerA = { uid: 'aaa222', familyName: 'Nováková', familyLabel: 'Novákovi' }
const carerB = { uid: 'bbb333', familyName: 'Novák', familyLabel: 'Novákovi' }
const carerC = { uid: 'ccc444', familyName: 'Dvořák', familyLabel: 'Dvořákovi' }

t('jeden pěstoun → jeho rodinný tvar', () => {
  const n = deriveAgreementName([carerA])
  assert.equal(n.displayName, 'Novákovi')
  assert.equal(n.derivedFromPersonUid, 'aaa222')
})

t('dva pěstouni se stejným příjmením → jeden tvar', () => {
  assert.equal(deriveAgreementName([carerA, carerB]).displayName, 'Novákovi')
})

t('dva pěstouni s různým příjmením → vybere se jedno', () => {
  const n = deriveAgreementName([carerA, carerC], 1)
  assert.ok(['Novákovi', 'Dvořákovi'].includes(n.displayName))
  assert.ok(['aaa222', 'ccc444'].includes(n.derivedFromPersonUid))
})

t('výběr je DETERMINISTICKÝ — jinak by se dohoda přejmenovala sama', () => {
  const first = deriveAgreementName([carerA, carerC], 7)
  for (let i = 0; i < 20; i++) {
    assert.equal(deriveAgreementName([carerA, carerC], 7).displayName, first.displayName)
  }
})

t('bez pěstouna to nespadne', () => {
  assert.equal(deriveAgreementName([]).displayName, 'Bez pečující osoby')
})

t('přejmenování překlopí zdroj a uschová původní název', () => {
  const base = { ...deriveAgreementName([carerA]), renamedByPersonId: null, renamedAt: null, previousNames: [] }
  const r = renameAgreement(base, 'Novákovi — PPPD', 'per1', '2026-08-07T10:00:00Z')
  assert.equal(r.displayName, 'Novákovi — PPPD')
  assert.equal(r.source, 'renamed')
  assert.equal(r.previousNames.length, 1)
  assert.equal(r.previousNames[0].name, 'Novákovi')
})

/* ---------------------------------------------------------------- */
/* Entity a služby                                                  */
/* ---------------------------------------------------------------- */

t('předměty nemají profil, entity ano', () => {
  assert.equal(hasProfile('person'), true)
  assert.equal(hasProfile('agreement'), true)
  assert.equal(hasProfile('document'), false)
  assert.equal(hasProfile('scan'), false)
})

t('kniha života je jen u dítěte', () => {
  assert.equal(hasService('child', 'life_book'), true)
  assert.equal(hasService('person', 'life_book'), false)
  assert.equal(hasService('agreement', 'life_book'), false)
})

t('respit není u zaměstnance', () => {
  assert.equal(hasService('person', 'respite'), false)
  assert.equal(hasService('child', 'respite'), true)
})

/* ---------------------------------------------------------------- */
/* Číselníky a marketplace                                          */
/* ---------------------------------------------------------------- */

const mk = (code, origin, status = 'active') => ({
  id: `${origin}-${code}`, codebookCode: 'expense.category', code,
  label: code, origin, status, order: 1,
})

t('platformní položka vyhrává nad organizační se stejným kódem', () => {
  const merged = mergeCodebook([mk('jizdne', 'platform')], [mk('jizdne', 'organization')])
  assert.equal(merged.length, 1)
  assert.equal(merged[0].origin, 'platform')
})

t('vyřazené položky se nenabízejí', () => {
  const merged = mergeCodebook([], [mk('tabor', 'organization', 'retired')])
  assert.equal(merged.length, 0)
})

t('podmínky domény přebíjejí výchozí', () => {
  const terms = {
    id: 't', effectiveFrom: '2026-01-01', note: null,
    defaults: {
      commissionPct: 5, commissionCap: null, listingFee: null,
      listingFeePeriod: null, listingRequiresVerification: false,
      listingRequiresEligibility: true,
    },
    perDomain: [{ domain: 'respite', listingRequiresEligibility: false }],
    termsDocumentId: null,
  }
  assert.equal(termsForDomain(terms, 'education').listingRequiresEligibility, true)
  assert.equal(termsForDomain(terms, 'respite').listingRequiresEligibility, false)
  assert.equal(termsForDomain(terms, 'respite').commissionPct, 5)
})

t('doména respitu spadá pod písmeno b) § 47a odst. 2', () => {
  assert.equal(DOMAIN_RIGHT_CODE.respite, 'b')
  assert.equal(DOMAIN_RIGHT_CODE.education, 'f')
  assert.equal(DOMAIN_RIGHT_CODE.therapy, 'd')
})

/* ---------------------------------------------------------------- */

for (const [status, label] of results) console.log(status, label)
const failed = results.filter(([s]) => s !== 'OK  ').length
console.log(`\n${results.length - failed} / ${results.length} ${failed === 0 ? '— VŠE PROŠLO' : '— NĚCO SELHALO'}`)
process.exit(failed === 0 ? 0 : 1)
