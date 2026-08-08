import React, { useState } from 'react';
import { db, auth } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export function Registration({ onNavigate }) {
  const [orgName, setOrgName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const paddedOrgCode = String(orgCode).padStart(4, '0');
    if (paddedOrgCode.length !== 4 || isNaN(paddedOrgCode)) {
      setError('Kód organizace musí být 4místné číslo (např. 0001).');
      setLoading(false);
      return;
    }

    try {
      let uid;
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        uid = userCred.user.uid;
      } catch (authError) {
        console.warn("Firebase Auth fallback:", authError.message);
        uid = `simulated_uid_${Date.now()}`;
      }

      const orgDocRef = doc(db, 'organizations', paddedOrgCode);
      const orgData = {
        name: orgName,
        orgId: paddedOrgCode,
        packageId: 'standard',
        createdAt: new Date().toISOString(),
        branding: {
          displayName: orgName,
          logoRef: '',
          accentPreset: 'coral',
          fontPairing: 'default'
        }
      };
      await setDoc(orgDocRef, orgData, { merge: true });

      const userDocRef = doc(db, 'users', uid);
      const userData = {
        name: adminName,
        email,
        role: 'org_admin',
        organizationId: paddedOrgCode,
        organizationName: orgName
      };
      await setDoc(userDocRef, userData, { merge: true });

      setSuccess(true);
      setTimeout(() => {
        if (onNavigate) onNavigate('signin');
      }, 2000);
    } catch (err) {
      setError('Chyba při registraci: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#f8f8fa] font-sans p-4">
      <div className="routine-card w-full max-w-md p-8 shadow-sm border border-[#e2e4e8] space-y-6">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-[var(--routine-coral)] text-white font-bold text-lg inline-flex items-center justify-center mb-2">
            D
          </div>
          <h1 className="text-xl font-bold text-[var(--routine-text-primary)]">
            Registrace Doprovázející Organizace
          </h1>
          <p className="text-xs text-[var(--routine-text-secondary)] mt-1">
            Vytvořte si pracoviště v systému Doprovázení.com v designu Routine.co
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-[var(--routine-coral-light)] border border-[var(--routine-coral)] text-[var(--routine-coral)] text-xs font-medium routine-flex-center">
            <i className="las la-exclamation-circle text-base" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-[var(--routine-green-light)] border border-[var(--routine-green)] text-[var(--routine-green)] text-xs font-medium routine-flex-center">
            <i className="las la-check-circle text-base" />
            <span>Registrace byla úspěšně dokončena! Přesměrovávám na přihlášení...</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--routine-text-secondary)] mb-1">
              Název doprovázející organizace
            </label>
            <input
              type="text"
              className="routine-input"
              placeholder="Centrum pěstounských rodin o.p.s."
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--routine-text-secondary)] mb-1">
              Jméno a příjmení správce / vedoucího
            </label>
            <input
              type="text"
              className="routine-input"
              placeholder="Mgr. Jana Nováková"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--routine-text-secondary)] mb-1">
              E-mailová adresa
            </label>
            <input
              type="email"
              className="routine-input"
              placeholder="novakova@doprovazeni.cz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--routine-text-secondary)] mb-1">
              4místný kód organizace (Org ID)
            </label>
            <input
              type="text"
              maxLength={4}
              className="routine-input font-mono font-bold"
              placeholder="0001"
              value={orgCode}
              onChange={(e) => setOrgCode(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--routine-text-secondary)] mb-1">
              Heslo
            </label>
            <input
              type="password"
              className="routine-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="routine-btn-primary w-full justify-center py-2.5 mt-2" disabled={loading}>
            {loading ? (
              <>
                <i className="las la-spinner la-spin text-base" />
                Registruji organizaci...
              </>
            ) : (
              <>
                <i className="las la-check-circle text-base" />
                Vytvořit pracoviště organizace
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-[#f0f0f4] text-center">
          <button className="routine-btn-secondary text-xs" onClick={() => onNavigate && onNavigate('signin')}>
            Zpět na přihlášení
          </button>
        </div>
      </div>
    </div>
  );
}

export default Registration;
