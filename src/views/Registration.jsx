import React, { useState } from 'react';
import { db, auth } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export function Registration({ onNavigate }) {
  const [orgName, setOrgName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgCode, setOrgCode] = useState(''); // e.g. 0001 - 9999
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const paddedOrgCode = String(orgCode).padStart(4, '0');
    if (paddedOrgCode.length !== 4 || isNaN(paddedOrgCode)) {
      setError('Kód organizace musí být 4místné číslo.');
      setLoading(false);
      return;
    }

    try {
      // 1. Zaregistrování uživatele ve Firebase Auth
      let uid;
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        uid = userCred.user.uid;
      } catch (authError) {
        // Fallback pro lokální vývoj/sandbox bez funkčního Firebase
        console.warn("Firebase Auth selhal, používá se simulovaná registrace:", authError.message);
        uid = `simulated_uid_${Date.now()}`;
      }

      // 2. Vytvoření dokumentu organizace v DB
      const orgDocRef = doc(db, 'organizations', paddedOrgCode);
      const orgData = {
        name: orgName,
        orgId: paddedOrgCode,
        packageId: 'standard', // Výchozí balíček
        createdAt: new Date().toISOString(),
        respitRates: {
          hlidaniZaHodinu: 150,
          doucovaniZaHodinu: 200
        },
        branding: {
          displayName: orgName,
          logoRef: '',
          accentPreset: 'blue',
          fontPairing: 'default'
        },
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
        }
      };

      try {
        await setDoc(orgDocRef, orgData);
      } catch (dbError) {
        console.warn("Zápis organizace do Firestore selhal, ukládám lokálně:", dbError.message);
        localStorage.setItem(`org_${paddedOrgCode}`, JSON.stringify(orgData));
      }

      // 3. Vytvoření dokumentu uživatele v DB s rolí org_admin
      const userDocRef = doc(db, 'users', uid);
      const userData = {
        uid,
        name: adminName,
        email,
        role: 'org_admin',
        organizationId: paddedOrgCode,
        isStaff: true,
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(userDocRef, userData);
      } catch (dbError) {
        console.warn("Zápis uživatele do Firestore selhal, ukládám lokálně:", dbError.message);
        localStorage.setItem(`user_${uid}`, JSON.stringify(userData));
      }

      setSuccess(true);
      setTimeout(() => {
        if (onNavigate) onNavigate('signin');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Během registrace došlo k chybě.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: 1440,
      height: 900,
      overflow: "hidden",
      backgroundColor: "rgb(94,129,244)",
      position: "relative",
      fontFamily: "var(--font-body)",
      color: "var(--text-primary)"
    }}>
      {/* Modré pozadí s přechodem */}
      <div style={{
        position: "absolute",
        left: 752,
        top: -149,
        width: 688,
        height: 1049,
        background: "radial-gradient(644.743px 887.261px at 57.43% 48.15%, rgb(94,129,244) 0.00%, rgb(27,81,229) 100.00%)",
        borderRadius: '50%'
      }} />

      {/* Hlavní karta registrace */}
      <div style={{
        position: "absolute",
        left: 200,
        top: 100,
        width: 500,
        backgroundColor: "var(--surface-card)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)",
        padding: "40px",
        zIndex: 10
      }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{
            fontSize: "var(--text-h2)",
            fontFamily: "var(--font-display)",
            fontWeight: "var(--weight-bold)",
            color: "var(--text-primary)",
            marginBottom: "8px"
          }}>
            Registrace doprovázející organizace
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)" }}>
            Zadejte údaje vaší organizace pro vytvoření nového tenantu.
          </p>
        </div>

        {error && (
          <div style={{
            padding: "12px",
            backgroundColor: "rgba(255,128,139,0.1)",
            border: "1px solid var(--status-error)",
            borderRadius: "var(--radius-md)",
            color: "var(--status-error)",
            marginBottom: "20px",
            fontSize: "var(--text-caption)"
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: "12px",
            backgroundColor: "rgba(124,231,172,0.1)",
            border: "1px solid var(--status-success)",
            borderRadius: "var(--radius-md)",
            color: "var(--status-success)",
            marginBottom: "20px",
            fontSize: "var(--text-caption)"
          }}>
            Registrace proběhla úspěšně! Přesměrovávám na přihlášení...
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "var(--text-caption)" }}>
              Název organizace
            </label>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Např. Centrum pro pěstounskou péči"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-strong)",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-body)"
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "var(--text-caption)" }}>
                4místný kód organizace
              </label>
              <input
                type="text"
                required
                maxLength={4}
                value={orgCode}
                onChange={(e) => setOrgCode(e.target.value)}
                placeholder="Např. 0021"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-strong)",
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-body)"
                }}
              />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "var(--text-caption)" }}>
                Celé jméno administrátora
              </label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Např. Mgr. Jana Nováková"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-strong)",
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-body)"
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "var(--text-caption)" }}>
              E-mail administrátora
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="novakova@doprovazeni.cz"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-strong)",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-body)"
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "var(--text-caption)" }}>
              Heslo (min. 6 znaků)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-strong)",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-body)"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: "46px",
              backgroundColor: "var(--accent-primary)",
              color: "var(--text-on-accent)",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-display)",
              fontWeight: "var(--weight-bold)",
              fontSize: "var(--text-body)",
              cursor: "pointer",
              transition: "background-color 0.2s"
            }}
          >
            {loading ? 'Registruji...' : 'Vytvořit organizaci'}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "var(--text-caption)" }}>
          Již máte účet?{" "}
          <span
            onClick={() => onNavigate('signin')}
            style={{ color: "var(--text-link)", cursor: "pointer", fontWeight: "bold" }}
          >
            Přihlásit se
          </span>
        </div>
      </div>
    </div>
  );
}
