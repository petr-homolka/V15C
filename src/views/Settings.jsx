import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/navigation/Sidebar.jsx';
import { TopBar } from '../components/navigation/TopBar.jsx';
import { updateOrganizationBranding, updateOrganizationRespitRates, updateOrganizationTerminology } from '../services/orgService';

export function Settings({ user, onNavigate, onUpdateUserBranding, isMobileView }) {
  const [activeSection, setActiveSection] = useState('branding');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Stavy pro Branding
  const [accent, setAccent] = useState(user?.branding?.accentPreset || 'blue');
  const [fontScale, setFontScale] = useState(localStorage.getItem('font_scale') || '1.33');
  
  // Stavy pro Terminologii
  const [spisTerm, setSpisTerm] = useState(user?.terminologyOverrides?.spis || 'Spis');
  const [koTerm, setKoTerm] = useState(user?.terminologyOverrides?.ko || 'Klíčová osoba');

  // Stavy pro Respitní sazebník (dynamický katalog)
  const [respitCatalog, setRespitCatalog] = useState([
    { id: '1', service: 'Hlídání dětí', specification: 'Standard', rate: 150, providerType: 'Klíčová osoba' },
    { id: '2', service: 'Hlídání dětí', specification: 'Noční / Víkend', rate: 200, providerType: 'Externista' },
    { id: '3', service: 'Doučování', specification: 'Matematika (ZŠ)', rate: 250, providerType: 'Student VŠ' },
    { id: '4', service: 'Doučování', specification: 'Anglický jazyk', rate: 300, providerType: 'Lektor' },
    { id: '5', service: 'Terapeutická konzultace', specification: 'Logopedie', rate: 500, providerType: 'Specialista' }
  ]);

  // Stavy pro přidání/editaci sazby
  const [newService, setNewService] = useState('');
  const [newSpecification, setNewSpecification] = useState('');
  const [newRate, setNewRate] = useState('');
  const [newProvider, setNewProvider] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Stavy pro Sledování narozenin a jmenin v kalendáři
  const [birthdayTrackingSettings, setBirthdayTrackingSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('birthday_tracking_settings');
      return saved ? JSON.parse(saved) : { child: true, foster_parent: false, coworker: false, other: false };
    } catch (e) {
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

  // Uložení sekce Branding
  const handleSaveBranding = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orgId = user?.organizationId || '0001';
      const branding = {
        displayName: user?.organizationName || 'Centrum pěstounů',
        logoRef: '',
        accentPreset: accent,
        fontPairing: 'default'
      };
      await updateOrganizationBranding(orgId, branding);
      
      localStorage.setItem('font_scale', fontScale);
      
      // Aplikování font_scale do CSS root
      const root = document.documentElement;
      const baseSizes = { h1: 32, h2: 26, h3: 22, h4: 18, bodyLg: 16, body: 14, caption: 12 };
      const scale = parseFloat(fontScale);
      
      root.style.setProperty('--text-h1', `${Math.round(baseSizes.h1 * scale)}px`);
      root.style.setProperty('--text-h2', `${Math.round(baseSizes.h2 * scale)}px`);
      root.style.setProperty('--text-h3', `${Math.round(baseSizes.h3 * scale)}px`);
      root.style.setProperty('--text-h4', `${Math.round(baseSizes.h4 * scale)}px`);
      root.style.setProperty('--text-body-lg', `${Math.round(baseSizes.bodyLg * scale)}px`);
      root.style.setProperty('--text-body', `${Math.round(baseSizes.body * scale)}px`);
      root.style.setProperty('--text-caption', `${Math.round(baseSizes.caption * scale)}px`);

      if (onUpdateUserBranding) {
        onUpdateUserBranding(branding, user?.respitRates, user?.terminologyOverrides);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      alert("Chyba při ukládání brandingu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Uložení sekce Terminologie
  const handleSaveTerminology = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orgId = user?.organizationId || '0001';
      const terminology = {
        spis: spisTerm,
        ko: koTerm
      };
      await updateOrganizationTerminology(orgId, terminology);

      if (onUpdateUserBranding) {
        onUpdateUserBranding(user?.branding, user?.respitRates, terminology);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      alert("Chyba při ukládání terminologie: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Respit: přidání/editace položky sazebníku
  const handleAddOrEditRate = (e) => {
    e.preventDefault();
    if (!newService || !newRate) return;

    if (editingId) {
      setRespitCatalog(prev => prev.map(item => 
        item.id === editingId 
          ? { ...item, service: newService, specification: newSpecification, rate: parseInt(newRate, 10), providerType: newProvider }
          : item
      ));
      setEditingId(null);
    } else {
      const newItem = {
        id: String(Date.now()),
        service: newService,
        specification: newSpecification,
        rate: parseInt(newRate, 10),
        providerType: newProvider
      };
      setRespitCatalog(prev => [...prev, newItem]);
    }

    setNewService('');
    setNewSpecification('');
    setNewRate('');
    setNewProvider('');
  };

  const handleEditStart = (item) => {
    setEditingId(item.id);
    setNewService(item.service);
    setNewSpecification(item.specification);
    setNewRate(item.rate);
    setNewProvider(item.providerType);
  };

  const handleDeleteRate = (id) => {
    setRespitCatalog(prev => prev.filter(item => item.id !== id));
  };

  const accentColor = accent === 'green' ? 'var(--status-success)' : 'rgb(94,129,244)';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'var(--surface-page)',
      fontFamily: 'var(--font-body)',
      overflow: 'hidden'
    }}>
      {/* 1. PRVNÍ ÚROVEŇ SIDEBAR MENU */}
      <Sidebar 
        activePage="settings" 
        onNavigate={onNavigate}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isMobile={isMobileView}
      />

      {/* 2. DRUHÁ ÚROVEŇ SIDEBAR MENU (Sekce nastavení) */}
      <div style={{
        width: '260px',
        height: '100%',
        backgroundColor: '#fff',
        borderRight: '1px solid rgb(240,240,243)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        <div style={{
          padding: '28px 24px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'rgb(28,29,33)',
            margin: 0
          }}>
            Nastavení
          </h2>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 8px',
          gap: '4px'
        }}>
          {[
            { id: 'branding', label: 'Vzhled a písma', icon: 'las la-palette' },
            { id: 'terminology', label: 'Vlastní terminologie', icon: 'las la-language' },
            { id: 'respit', label: 'Respitní sazebník', icon: 'las la-calculator' },
            { id: 'calendar', label: 'Kalendář a upozornění', icon: 'las la-calendar-check' }
          ].map(sec => {
            const isActive = activeSection === sec.id;
            return (
              <div
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id);
                  setSuccess(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'rgba(94,129,244,0.08)' : 'transparent',
                  color: isActive ? 'rgb(28,29,33)' : 'rgb(129,129,165)',
                  fontWeight: isActive ? 700 : 600,
                  transition: 'background-color 0.2s'
                }}
              >
                <i className={sec.icon} style={{ fontSize: '18px' }}></i>
                <span style={{ fontSize: '15px' }}>{sec.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. HLAVNÍ OBSAHOVÁ ČÁST */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        height: '100%',
        overflow: 'hidden'
      }}>
        <TopBar 
          user={user} 
          title="Konfigurace parametrů platformy" 
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          isMobile={isMobileView}
        />

        <div style={{
          padding: '40px',
          overflowY: 'auto',
          flexGrow: 1
        }}>
          {/* A. SEKCE: VZHLED A PÍSMA */}
          {activeSection === 'branding' && (
            <div style={{
              maxWidth: '800px',
              backgroundColor: 'var(--surface-card)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-card)',
              padding: '36px'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>Vzhled a písma</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: 'var(--text-body)' }}>
                Přizpůsobte si barevné schéma a velikost písem celé doprovázející aplikace.
              </p>

              {success && (
                <div style={{ padding: "12px", backgroundColor: "rgba(124,231,172,0.1)", border: "1px solid var(--status-success)", borderRadius: "8px", color: "var(--status-success)", marginBottom: "20px" }}>
                  Změny brandingu byly úspěšně uloženy.
                </div>
              )}

              <form onSubmit={handleSaveBranding}>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "var(--text-caption)" }}>
                      Hlavní barva platformy (Accent)
                    </label>
                    <select
                      value={accent}
                      onChange={(e) => setAccent(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-strong)',
                        fontSize: '15px'
                      }}
                    >
                      <option value="blue">Modrá (Výchozí)</option>
                      <option value="green">Zelená (Přírodní)</option>
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "var(--text-caption)" }}>
                      Měřítko písma (UI Scale)
                    </label>
                    <select
                      value={fontScale}
                      onChange={(e) => setFontScale(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-strong)',
                        fontSize: '15px'
                      }}
                    >
                      <option value="1.0">Standardní (100 %)</option>
                      <option value="1.15">Střední (+15 %)</option>
                      <option value="1.33">Velké (+33 % - doporučeno)</option>
                      <option value="1.5">Extra velké (+50 %)</option>
                    </select>
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--surface-page)',
                  borderRadius: '8px',
                  marginBottom: '28px',
                  fontSize: 'var(--text-caption)',
                  color: 'var(--text-secondary)',
                  borderLeft: `4px solid ${accentColor}`
                }}>
                  <strong>Vyhlazení písem (Anti-aliasing)</strong> je v systému trvale zapnuté a optimalizuje čitelnost textů na mobilních zařízeních i desktopových monitorech.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: accentColor,
                      color: 'var(--text-on-accent)',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {loading ? 'Ukládám...' : 'Uložit vzhled'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* B. SEKCE: VLASTNÍ TERMINOLOGIE */}
          {activeSection === 'terminology' && (
            <div style={{
              maxWidth: '800px',
              backgroundColor: 'var(--surface-card)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-card)',
              padding: '36px'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>Vlastní terminologie</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: 'var(--text-body)' }}>
                Nastavte si vlastní názvosloví entit pro přizpůsobení legislativním nebo organizačním standardům.
              </p>

              {success && (
                <div style={{ padding: "12px", backgroundColor: "rgba(124,231,172,0.1)", border: "1px solid var(--status-success)", borderRadius: "8px", color: "var(--status-success)", marginBottom: "20px" }}>
                  Terminologie byla úspěšně aktualizována.
                </div>
              )}

              <form onSubmit={handleSaveTerminology}>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '28px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "var(--text-caption)" }}>
                      Název pro „Spis“ (např. Rodina, Případ)
                    </label>
                    <input
                      type="text"
                      value={spisTerm}
                      onChange={(e) => setSpisTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-strong)',
                        fontSize: '15px'
                      }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "var(--text-caption)" }}>
                      Název pro „Klíčová osoba“ (např. Průvodce, Poradce)
                    </label>
                    <input
                      type="text"
                      value={koTerm}
                      onChange={(e) => setKoTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-strong)',
                        fontSize: '15px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: accentColor,
                      color: 'var(--text-on-accent)',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {loading ? 'Ukládám...' : 'Uložit terminologii'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* C. SEKCE: RESPITNÍ SAZEBNÍK */}
          {activeSection === 'respit' && (
            <div style={{
              maxWidth: '900px',
              backgroundColor: 'var(--surface-card)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-card)',
              padding: '36px'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>Respitní sazebník služeb</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: 'var(--text-body)' }}>
                Flexibilní katalog odlehčovacích a rozvojových služeb. Sazby mohou být definovány ad-hoc podle předmětu doučování, úrovně lektora či specifických dohod.
              </p>

              {/* Formulář pro přidání/editaci sazby */}
              <div style={{
                backgroundColor: 'var(--surface-page)',
                padding: '24px',
                borderRadius: '8px',
                marginBottom: '32px',
                border: '1px solid var(--border-strong)'
              }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '16px' }}>
                  {editingId ? 'Upravit sazbu' : 'Přidat novou sazbu do sazebníku'}
                </h4>
                <form onSubmit={handleAddOrEditRate} style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  alignItems: 'flex-end'
                }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Služba</label>
                    <select
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                    >
                      <option value="">-- Vyberte službu --</option>
                      <option value="Hlídání dětí">Hlídání dětí (Respit)</option>
                      <option value="Doučování">Doučování</option>
                      <option value="Terapeutická konzultace">Terapeutická konzultace</option>
                      <option value="Asistence">Osobní asistence</option>
                    </select>
                  </div>

                  <div style={{ flex: '1 1 180px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Specifikace / Předmět</label>
                    <input
                      type="text"
                      value={newSpecification}
                      onChange={(e) => setNewSpecification(e.target.value)}
                      placeholder="Např. Matematika (SŠ), Víkend"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                    />
                  </div>

                  <div style={{ flex: '1 1 150px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Kvalifikace poskytovatele</label>
                    <input
                      type="text"
                      value={newProvider}
                      onChange={(e) => setNewProvider(e.target.value)}
                      placeholder="Např. Student VŠ, Specialista"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                    />
                  </div>

                  <div style={{ flex: '1 1 100px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Sazba (Kč / hod)</label>
                    <input
                      type="number"
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      required
                      placeholder="300"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      backgroundColor: accentColor,
                      color: '#fff',
                      border: 'none',
                      padding: '11px 20px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {editingId ? 'Uložit změny' : 'Přidat sazbu'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setNewService('');
                        setNewSpecification('');
                        setNewRate('');
                        setNewProvider('');
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--text-secondary)',
                        border: 'none',
                        padding: '11px 12px',
                        cursor: 'pointer'
                      }}
                    >
                      Zrušit
                    </button>
                  )}
                </form>
              </div>

              {/* Seznam sazeb */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '15px'
              }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-strong)', color: 'var(--text-secondary)' }}>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Služba</th>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Specifikace / Předmět</th>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Kvalifikace poskytovatele</th>
                    <th style={{ textAlign: 'right', padding: '12px' }}>Hodinová sazba</th>
                    <th style={{ textAlign: 'right', padding: '12px' }}>Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {respitCatalog.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.service}</td>
                      <td style={{ padding: '12px' }}>{item.specification || '—'}</td>
                      <td style={{ padding: '12px' }}>{item.providerType || '—'}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: accentColor }}>
                        {item.rate} Kč / hod
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleEditStart(item)}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', marginRight: '12px', fontWeight: 'bold' }}
                        >
                          Upravit
                        </button>
                        <button
                          onClick={() => handleDeleteRate(item.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--status-error)', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Smazat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SEKCE: KALENDÁŘ A UPOZORNĚNÍ (SLEDOVÁNÍ NAROZENIN A JMENIN SE ZAPÍNACÍMI POSUVNÍKY) */}
          {activeSection === 'calendar' && (
            <div style={{ maxWidth: '640px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0', color: 'rgb(28,29,33)' }}>
                Kalendář a upozornění
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
                Správa zobrazování narozenin, jmenin a notifikací v kalendáři a časové ose.
              </p>

              <div style={{
                backgroundColor: 'var(--surface-card)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: 'rgb(28,29,33)' }}>
                    Sledování narozenin a jmenin
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Zvolte skupiny osob, jejichž narozeniny a jmeniny chcete zobrazovat v kalendáři a časové ose. <strong>Výchozí sledování platí pouze pro Děti v péči.</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { key: 'child', label: 'Děti v péči', desc: 'Narozeniny a jmeniny dětí (Výchozí)', icon: 'las la-smile', color: '#DB2777' },
                    { key: 'foster_parent', label: 'Pěstouni', desc: 'Narozeniny a jmeniny evidovaných pěstounů', icon: 'las la-heart', color: '#059669' },
                    { key: 'coworker', label: 'Klíčové osoby a pracovníci', desc: 'Narozeniny a jmeniny pracovníků organizace', icon: 'las la-user-tie', color: '#7C3AED' },
                    { key: 'other', label: 'Ostatní kontakty s datem narození', desc: 'Ostatní vymezené osoby v databázi', icon: 'las la-users', color: '#2563EB' }
                  ].map(item => (
                    <div 
                      key={item.key} 
                      onClick={() => handleToggleBirthdayTracking(item.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-default)',
                        backgroundColor: birthdayTrackingSettings[item.key] ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '10px',
                          backgroundColor: `${item.color}15`, color: item.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                        }}>
                          <i className={item.icon} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(28,29,33)' }}>{item.label}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.desc}</div>
                        </div>
                      </div>

                      {/* ZAPÍNACÍ POSUVNÍK (TOGGLE SWITCH) */}
                      <div style={{
                        width: '46px',
                        height: '24px',
                        borderRadius: '12px',
                        backgroundColor: birthdayTrackingSettings[item.key] ? '#10B981' : '#D1D5DB',
                        position: 'relative',
                        transition: 'background-color 0.2s ease',
                        flexShrink: 0
                      }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          position: 'absolute',
                          top: '2px',
                          left: birthdayTrackingSettings[item.key] ? '24px' : '2px',
                          transition: 'left 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default Settings;
