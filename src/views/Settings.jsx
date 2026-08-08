import React, { useState } from 'react';
import { updateOrganizationBranding } from '../services/orgService';

export function Settings({ user, onUpdateUserBranding }) {
  const [activeSection, setActiveSection] = useState('branding');
  const [accent, setAccent] = useState(user?.branding?.accentPreset || 'coral');
  const [fontScale, setFontScale] = useState(localStorage.getItem('font_scale') || '1.0');
  const [spisTerm, setSpisTerm] = useState(user?.terminologyOverrides?.spis || 'Spis rodiny');
  const [koTerm, setKoTerm] = useState(user?.terminologyOverrides?.ko || 'Klíčová osoba');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [birthdayTrackingSettings, setBirthdayTrackingSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('birthday_tracking_settings');
      return saved ? JSON.parse(saved) : { child: true, foster_parent: false, coworker: false, other: false };
    } catch {
      return { child: true, foster_parent: false, coworker: false, other: false };
    }
  });

  const handleToggleBirthdayTracking = (key) => {
    const updated = { ...birthdayTrackingSettings, [key]: !birthdayTrackingSettings[key] };
    setBirthdayTrackingSettings(updated);
    localStorage.setItem('birthday_tracking_settings', JSON.stringify(updated));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleSaveBranding = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orgId = user?.organizationId || '0001';
      const branding = {
        displayName: user?.organizationName || 'Nová Rodina o.p.s.',
        logoRef: '',
        accentPreset: accent,
        fontPairing: 'default'
      };
      await updateOrganizationBranding(orgId, branding);
      localStorage.setItem('font_scale', fontScale);

      if (onUpdateUserBranding) {
        onUpdateUserBranding(branding, user?.respitRates, user?.terminologyOverrides);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      alert("Chyba při ukládání: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6 font-sans">
      {success && (
        <div className="p-3 rounded-lg bg-[var(--routine-green-light)] border border-[var(--routine-green)] text-[var(--routine-green)] text-xs font-medium flex items-center gap-2">
          <i className="las la-check-circle text-base" />
          <span>Nastavení bylo úspěšně uloženo.</span>
        </div>
      )}

      {/* Routine Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#f0f0f4]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--routine-text-primary)]">
            Nastavení systému & Organizace
          </h1>
          <p className="text-xs text-[var(--routine-text-secondary)] mt-0.5">
            Konfigurace sledování, výchozího vzhledu a terminologie | Routine.co Format
          </p>
        </div>

        <button className="routine-btn-primary" onClick={handleSaveBranding} disabled={loading}>
          {loading ? (
            <>
              <i className="las la-spinner la-spin text-base" />
              Ukládám...
            </>
          ) : (
            <>
              <i className="las la-save text-base" />
              Uložit všechna nastavení
            </>
          )}
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-1 border-b border-[#f0f0f4]">
        {[
          { id: 'branding', label: 'Vzhled & Akcenty', icon: 'las la-palette' },
          { id: 'birthdays', label: 'Narozeniny & Kalendář', icon: 'las la-birthday-cake' },
          { id: 'terminology', label: 'Terminologie organizace', icon: 'las la-font' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
              activeSection === tab.id
                ? 'bg-white text-[var(--routine-coral)] border-t-2 border-[var(--routine-coral)] border-x border-[#f0f0f4]'
                : 'text-[var(--routine-text-secondary)] hover:text-[var(--routine-text-primary)] hover:bg-[#f8f8fa]'
            }`}
          >
            <i className={tab.icon} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section 1: Branding */}
      {activeSection === 'branding' && (
        <div className="routine-card p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-[var(--routine-text-primary)] mb-1">
              Akcentní barva rozhraní (Routine Coral)
            </h3>
            <p className="text-xs text-[var(--routine-text-secondary)] mb-4">
              Vyberte primární akcentní odstín pro tlačítka, odznaky a indikátory.
            </p>

            <div className="flex items-center gap-3">
              {[
                { id: 'coral', name: 'Routine Coral', hex: '#FF4742' },
                { id: 'blue', name: 'Routine Blue', hex: '#4A85F6' },
                { id: 'green', name: 'Routine Emerald', hex: '#10B981' },
                { id: 'yellow', name: 'Routine Amber', hex: '#F59E0B' }
              ].map(color => (
                <button
                  key={color.id}
                  onClick={() => setAccent(color.id)}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                    accent === color.id
                      ? 'border-[var(--routine-coral)] bg-[var(--routine-coral-light)] text-[var(--routine-coral)]'
                      : 'border-[#e2e4e8] bg-white text-[var(--routine-text-primary)] hover:bg-[#f8f8fa]'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color.hex }} />
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#f0f0f4]">
            <h3 className="text-sm font-bold text-[var(--routine-text-primary)] mb-1">
              Měřítko typografie
            </h3>
            <p className="text-xs text-[var(--routine-text-secondary)] mb-3">
              Úprava velikosti písma pro pohodlné čtení v terénu i kanceláři.
            </p>

            <div className="w-full sm:w-64">
              <select
                value={fontScale}
                onChange={(e) => setFontScale(e.target.value)}
                className="routine-input"
              >
                <option value="1.0">Standardní (100%)</option>
                <option value="1.15">Větší čtení (115%)</option>
                <option value="1.33">Zvětšené písmo (133%)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Birthdays & Namesdays */}
      {activeSection === 'birthdays' && (
        <div className="routine-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[var(--routine-text-primary)] mb-1">
            Sledování narozenin a jmenin v 1denním kalendáři
          </h3>
          <p className="text-xs text-[var(--routine-text-secondary)] mb-4">
            Zvolte, které typy osob mají mít automatické indikátory svátků a narozenin v časové ose.
          </p>

          <div className="space-y-3">
            {[
              { key: 'child', title: 'Svěřené děti v pěstounské péči', desc: 'Zobrazit narozeniny a jmeniny dětí' },
              { key: 'foster_parent', title: 'Pěstouni a zástupci rodin', desc: 'Zobrazit výročí a svátky pěstounů' },
              { key: 'coworker', title: 'Kolegové a sociální pracovníci', desc: 'Zobrazit svátky v týmové agendě' }
            ].map(item => (
              <div
                key={item.key}
                className="p-3 rounded-lg border border-[#e8e8ed] bg-[#f9f9fb] flex items-center justify-between cursor-pointer"
                onClick={() => handleToggleBirthdayTracking(item.key)}
              >
                <div>
                  <h4 className="text-xs font-bold text-[var(--routine-text-primary)]">{item.title}</h4>
                  <p className="text-[11px] text-[var(--routine-text-secondary)] mt-0.5">{item.desc}</p>
                </div>

                <div className={`routine-checkbox ${birthdayTrackingSettings[item.key] ? 'checked' : ''}`}>
                  {birthdayTrackingSettings[item.key] && <i className="las la-check text-xs" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Terminology */}
      {activeSection === 'terminology' && (
        <div className="routine-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[var(--routine-text-primary)] mb-1">
            Vlastní terminologie organizace
          </h3>
          <p className="text-xs text-[var(--routine-text-secondary)] mb-4">
            Přizpůsobte si názvy agend dle interní metodiky vaší doprovázející organizace.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--routine-text-secondary)] mb-1">
                Název pro rodinnou složku / spis
              </label>
              <input
                type="text"
                className="routine-input"
                value={spisTerm}
                onChange={(e) => setSpisTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--routine-text-secondary)] mb-1">
                Název pro sociálního pracovníka
              </label>
              <input
                type="text"
                className="routine-input"
                value={koTerm}
                onChange={(e) => setKoTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
