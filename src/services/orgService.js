import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

/**
 * Získá kompletní konfiguraci organizace včetně zděděného balíčku služeb.
 * Merguje globální balíček s lokálními nastaveními a přepínači.
 * 
 * @param {string} orgId - 4místné ID organizace (např. '0001')
 * @returns {Promise<Object>} Kompletní konfigurace organizace
 */
export async function getOrganizationConfig(orgId) {
  const paddedOrgId = String(orgId).padStart(4, '0');
  const orgDocRef = doc(db, 'organizations', paddedOrgId);
  const orgSnap = await getDoc(orgDocRef);
  
  if (!orgSnap.exists()) {
    // Fallback/Výchozí konfigurace pro sandbox nebo neregistrované DO
    return {
      orgId: paddedOrgId,
      name: `Organizace ${paddedOrgId}`,
      packageId: 'standard',
      features: {
        aiAssistedImport: false,
        scanExtraction: false,
        serviceCatalog: false,
        checklistFramework: false,
        customTerminology: false,
        accountingExport: false
      },
      limits: {
        maxFamilies: 25,
        scanTokenLimit: 0
      },
      respitRates: {
        hlidaniZaHodinu: 150,
        doucovaniZaHodinu: 200
      },
      branding: {
        displayName: '',
        logoRef: '',
        accentPreset: 'blue',
        fontPairing: 'default'
      },
      terminologyOverrides: {}
    };
  }
  
  const orgData = orgSnap.data();
  let packageFeatures = {};
  let packageLimits = {};
  
  // Načtení vlastností z balíčku, pokud existuje
  if (orgData.packageId) {
    const pkgDocRef = doc(db, 'global_packages', orgData.packageId);
    const pkgSnap = await getDoc(pkgDocRef);
    if (pkgSnap.exists()) {
      const pkgData = pkgSnap.data();
      packageFeatures = pkgData.features || {};
      packageLimits = pkgData.limits || {};
    }
  }
  
  // Sloučení (package < org-features-overrides)
  const mergedFeatures = {
    ...packageFeatures,
    ...(orgData.features || {})
  };
  
  const mergedLimits = {
    ...packageLimits,
    ...(orgData.limits || {})
  };
  
  return {
    orgId: paddedOrgId,
    name: orgData.name || '',
    packageId: orgData.packageId || 'standard',
    features: mergedFeatures,
    limits: mergedLimits,
    respitRates: orgData.respitRates || { hlidaniZaHodinu: 150, doucovaniZaHodinu: 200 },
    branding: orgData.branding || { displayName: '', logoRef: '', accentPreset: 'blue', fontPairing: 'default' },
    terminologyOverrides: orgData.terminologyOverrides || {}
  };
}

/**
 * Zkontroluje, zda má organizace aktivovanou konkrétní funkci.
 * 
 * @param {string} orgId - ID organizace
 * @param {string} featureName - Název funkce (např. 'checklistFramework')
 * @returns {Promise<boolean>} True, pokud je funkce aktivní
 */
export async function checkFeatureEnabled(orgId, featureName) {
  const config = await getOrganizationConfig(orgId);
  return !!config.features[featureName];
}

/**
 * Aktualizuje branding organizace (barvy, logo, písma).
 */
export async function updateOrganizationBranding(orgId, branding) {
  const paddedOrgId = String(orgId).padStart(4, '0');
  const orgDocRef = doc(db, 'organizations', paddedOrgId);
  await updateDoc(orgDocRef, { branding });
}

/**
 * Aktualizuje terminologické překlady organizace.
 */
export async function updateOrganizationTerminology(orgId, terminologyOverrides) {
  const paddedOrgId = String(orgId).padStart(4, '0');
  const orgDocRef = doc(db, 'organizations', paddedOrgId);
  await updateDoc(orgDocRef, { terminologyOverrides });
}

/**
 * Aktualizuje základní sazby za respit.
 */
export async function updateOrganizationRespitRates(orgId, respitRates) {
  const paddedOrgId = String(orgId).padStart(4, '0');
  const orgDocRef = doc(db, 'organizations', paddedOrgId);
  await updateDoc(orgDocRef, { respitRates });
}

/**
 * Správa balíčků služeb superadminem.
 */
export async function saveGlobalPackage(packageId, packageData) {
  const pkgDocRef = doc(db, 'global_packages', packageId);
  await setDoc(pkgDocRef, packageData, { merge: true });
}
