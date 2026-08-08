/**
 * České popisky kódů.
 *
 * Popisek je **jen popisek** — párovat, filtrovat ani ukládat se podle něj nic
 * nesmí (dok. 25). Neznámý kód se ukáže tak, jak je, místo aby zmizel: chybějící
 * překlad má být vidět.
 */

const dict = <T extends Record<string, string>>(map: T) =>
  (code: string): string => map[code] ?? code

export const obligationKind = dict({
  personal_contact: 'Osobní styk',
  report_6m: 'Zpráva o průběhu',
  education: 'Vzdělávání',
  respite: 'Odlehčení',
  plan_10c: 'Individuální plán',
})

export const entryKind = dict({
  monitoring_contact: 'Návštěva',
  note: 'Poznámka',
  dictation: 'Diktát',
  expense: 'Výdaj',
  education_record: 'Vzdělávání',
  care_episode: 'Odlehčení',
  contact_event: 'Kontakt s rodinou',
  checklist_run: 'Kontrolní list',
})

export const documentCategory = dict({
  agreement: 'Dohoda',
  agreement_consent: 'Souhlas ORP',
  report_6m: 'Zpráva o průběhu',
  court_decision: 'Rozhodnutí soudu',
  plan_10c: 'Individuální plán',
  certificate: 'Osvědčení',
  receipt: 'Účtenka',
  incoming_authority_letter: 'Dopis od úřadu',
})

export const agreementStatus = dict({
  active: 'Aktivní',
  awaiting_orp_consent: 'Čeká na souhlas ORP',
  ended: 'Ukončená',
  draft: 'Rozpracovaná',
})

export const custodyBasis = dict({
  foster: 'Pěstounská péče',
  foster_temporary: 'Přechodná pěstounská péče',
  guardian_caring: 'Poručník s osobní péčí',
  care_953: 'Péče jiné osoby (§ 953)',
  pre_adoption: 'Předadopční péče',
  entrusted_relative: 'Svěření příbuznému',
})

export const carerKind = dict({
  pecujici: 'Osoba pečující',
  v_evidenci: 'Osoba v evidenci',
})

export const memberRole = dict({
  org_admin: 'Vedení',
  key_worker: 'Klíčová osoba',
  accountant: 'Účetní',
  assistant: 'Asistent',
})
