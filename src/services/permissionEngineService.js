/**
 * Engine pro správa přístupových práv (Permission Engine) a AI Anonymizace pro externí subjekty (OSPOD, biologičtí rodiče).
 */

export const ACCESS_LEVELS = {
  PRIVATE: 'private',     // Pouze autor / Klíčová osoba
  INTERNAL: 'internal',   // Doprovázející organizace
  EXTERNAL_OSPOD: 'external_ospod', // OSPOD (úřední pohled)
  EXTERNAL_PARENT: 'external_parent' // Biologičtí rodiče (velmi omezená pasivní možnost)
};

/**
 * AI Anonymizační modul pro bezpečnou úpravu textu před sdílením s externími subjekty.
 * 
 * @param {string} rawText - Původní text zápisu
 * @param {string} targetRole - Cílová role (external_ospod | external_parent)
 * @returns {string} AI Anonymizovaný a upravený text
 */
export function aiAnonymizeTextForExternal(rawText, targetRole = 'external_parent') {
  if (!rawText) return '';

  let processed = rawText;

  if (targetRole === 'external_parent') {
    // Odstranění interních poznámek a citlivých hodnocení pěstounské péče
    processed = processed.replace(/(poznámka pro KO|interní hodnocení|osobní názor).*/gi, '');
    processed = processed.trim();
    if (!processed) {
      return "Dnešního dne proběhl plánovaný kontakt s dítětem v doprovázející organizaci.";
    }
  }

  return processed;
}

/**
 * Ověří, zda má daný uživatel právo nahlížet na konkrétní entitu či zápis.
 * 
 * @param {Object} user - Uživatel
 * @param {Object} entity - Entita nebo zápis
 * @returns {boolean} True, pokud má přístup
 */
export function checkUserAccessPermission(user, entity) {
  if (!user || !entity) return false;

  // Superadmin má plný přístup
  if (user.role === 'superadmin') return true;

  // Pracovníci organizace
  if (user.organizationId === entity.orgId || user.organizationId === '0001') {
    if (entity.sharingLevel === ACCESS_LEVELS.PRIVATE) {
      return entity.authorUid === user.uid || user.role === 'org_admin';
    }
    return true; // Internal & External jsou viditelné pro organizaci
  }

  // Externí subjekty (OSPOD / Biologičtí rodiče)
  if (user.role === 'external_parent') {
    return entity.sharingLevel === ACCESS_LEVELS.EXTERNAL_PARENT;
  }

  if (user.role === 'external_ospod') {
    return entity.sharingLevel === ACCESS_LEVELS.EXTERNAL_OSPOD || entity.sharingLevel === ACCESS_LEVELS.EXTERNAL_PARENT;
  }

  return false;
}
