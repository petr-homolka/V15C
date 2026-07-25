import React, { useState } from 'react';
import { Sidebar } from '../components/navigation/Sidebar.jsx';
import { TopBar } from '../components/navigation/TopBar.jsx';
import { formatUid, validateUid, getDocumentQrVerificationUrl } from '../services/identityService.js';

export function EntityProfileView({ entity, user, onNavigate, isMobileView }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!entity) {
    return (
      <div style={{ padding: '40px', fontFamily: 'var(--font-body)' }}>
        <h2>Entita nebyla nalezena</h2>
        <button onClick={() => onNavigate('dashboard')} style={{ padding: '10px 20px', borderRadius: '8px' }}>
          Zpět na Dashboard
        </button>
      </div>
    );
  }

  const formattedUid = formatUid(entity.uid);
  const isValidUid = validateUid(entity.uid);

  // Seznam kapitol / záložek podle typu entity
  const tabs = [
    { id: 'overview', label: 'Přehled & Údaje', icon: 'las la-user' },
    { id: 'timeline', label: 'Časová osa událostí', icon: 'las la-history' },
    { id: 'documents', label: 'Dokumenty & QR Ověření', icon: 'las la-qrcode' },
    { id: 'calendar', label: 'Kalendář & Plánované návštěvy', icon: 'las la-calendar' },
    { id: 'map', label: 'Mapa & Lokace bydliště', icon: 'las la-map-marked-alt' }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#F7F9FC',
      fontFamily: 'var(--font-body)',
      overflow: 'hidden'
    }}>
      <Sidebar 
        activePage="dashboard" 
        onNavigate={onNavigate}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isMobile={isMobileView}
      />

      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%', overflow: 'hidden' }}>
        <TopBar 
          user={user} 
          title={`Samostatný profil: ${entity.name || entity.fosterParents || 'Profil entity'}`}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          isMobile={isMobileView}
        />

        {/* Hlavní scrollable rozhraní profilu */}
        <div style={{ padding: isMobileView ? '20px 16px' : '32px 40px', overflowY: 'auto', flexGrow: 1 }}>
          
          {/* Tlačítko Návrat zpět a Hlavička profilu */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <button
              onClick={() => onNavigate('dashboard')}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0E0E8',
                padding: '8px 16px',
                borderRadius: '10px',
                color: '#1C1D21',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="las la-arrow-left"></i>
              <span>Zpět na přehled</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#1C1D21', fontFamily: 'monospace', backgroundColor: '#ECECF2', padding: '4px 10px', borderRadius: '6px' }}>
                UID: {formattedUid}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                color: isValidUid ? '#27B973' : '#FF808B',
                backgroundColor: isValidUid ? 'rgba(39,185,115,0.12)' : 'rgba(255,128,139,0.12)',
                padding: '4px 8px',
                borderRadius: '6px'
              }}>
                {isValidUid ? 'EAN-13 Platný' : 'Standardní UID'}
              </span>
            </div>
          </div>

          {/* Karta hlavičky profilu entity */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 2px 12px rgba(154,160,185,0.08)',
            marginBottom: '28px',
            display: 'flex',
            flexDirection: isMobileView ? 'column' : 'row',
            alignItems: isMobileView ? 'flex-start' : 'center',
            gap: '24px',
            borderLeft: entity.type === 'child' ? '6px solid #4A85F6' : entity.type === 'foster' ? '6px solid #27B973' : '6px solid #8E44AD'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: entity.type === 'child' ? 'rgba(74,133,246,0.12)' : entity.type === 'foster' ? 'rgba(39,185,115,0.12)' : '#4A85F6',
              color: entity.type === 'child' ? '#4A85F6' : entity.type === 'foster' ? '#27B973' : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 800,
              flexShrink: 0
            }}>
              <i className={entity.type === 'child' ? 'las la-child' : entity.type === 'foster' ? 'las la-user-friends' : 'las la-user-tie'}></i>
            </div>

            <div style={{ flexGrow: 1 }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#8181A5', textTransform: 'uppercase' }}>
                {entity.type === 'child' ? 'SAMOSTATNÝ PROFIL DÍTĚTE' : entity.type === 'foster' ? 'SAMOSTATNÝ PROFIL PĚSTOUNA' : 'PROFIL ZAMĚSTNANCE / KO'}
              </span>
              <h1 style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#1C1D21', margin: '4px 0 6px 0' }}>
                {entity.name || entity.fosterParents}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#8181A5' }}>
                {entity.rc && <span>Rodné číslo: <strong>{entity.rc}</strong></span>}
                {entity.phone && <span>Telefon: <strong>{entity.phone}</strong></span>}
                {entity.email && <span>E-mail: <strong>{entity.email}</strong></span>}
                {entity.city && <span>Lokalita: <strong>{entity.city}</strong></span>}
              </div>
            </div>
          </div>

          {/* Navigační menu kapitol profilu */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px 16px 0 0',
            padding: '0 32px',
            borderBottom: '1px solid #ECECF2',
            display: 'flex',
            gap: '24px',
            overflowX: 'auto'
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '16px 0',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid #4A85F6' : '3px solid transparent',
                  color: activeTab === tab.id ? '#4A85F6' : '#8181A5',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                <i className={tab.icon} style={{ fontSize: '18px' }}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* OBSAH ZVOLENÉ KAPITOLY */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '0 0 16px 16px',
            padding: '32px',
            boxShadow: '0 2px 12px rgba(154,160,185,0.08)'
          }}>

            {/* KAPITOLA 1: Přehled & Údaje */}
            {activeTab === 'overview' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1D21', marginBottom: '20px' }}>
                  Základní identifikace a osobní složka
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : '1fr 1fr', gap: '24px' }}>
                  <div style={{ backgroundColor: '#F7F9FC', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 800, color: '#1C1D21' }}>Osobní údaje</h4>
                    <div><strong>Jméno a příjmení:</strong> {entity.name || entity.fosterParents}</div>
                    <div><strong>Identifikační UID:</strong> {entity.uid || entity.rc || 'UID_88492'}</div>
                    <div><strong>Rodné číslo:</strong> {entity.rc || '850112/1234'}</div>
                    <div><strong>Kontaktní telefon:</strong> {entity.phone || '+420 777 111 222'}</div>
                    <div><strong>Zabezpečený e-mail:</strong> {entity.email || 'kontakt@doprovazeni.cz'}</div>
                  </div>

                  <div style={{ backgroundColor: '#F7F9FC', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 800, color: '#1C1D21' }}>Příslušnost a vazby spisu</h4>
                    <div><strong>Klíčová osoba (KO):</strong> {entity.ko || entity.assignedTo || 'Mgr. Jana Nováková'}</div>
                    <div><strong>Příslušný OSPOD:</strong> {entity.ospod || 'OSPOD Praha 4'}</div>
                    <div><strong>Stav doprovázení:</strong> Aktivní péče podle § 47b</div>
                    <div><strong>Právní forma:</strong> {entity.type === 'foster' ? 'Pěstounská péče' : entity.type === 'child' ? 'Dítě v náhradní rodinné péči' : 'Klíčový pracovník'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* KAPITOLA 2: Časová osa událostí */}
            {activeTab === 'timeline' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1D21', marginBottom: '20px' }}>
                  Historická časová osa událostí entity (Nejnovější nahoře)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F7F9FC', borderLeft: '4px solid #4A85F6' }}>
                    <span style={{ fontSize: '11px', color: '#4A85F6', fontWeight: 800 }}>15. 06. 2026 v 14:30</span>
                    <h4 style={{ margin: '4px 0', fontSize: '15px', fontWeight: 800 }}>Bi-monthly návštěva v rodině</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#1C1D21' }}>Návštěva proběhla bez závad. Vyhodnoceno plnění Dohody A1 a IPODu OSPODu.</p>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F7F9FC', borderLeft: '4px solid #8181A5' }}>
                    <span style={{ fontSize: '11px', color: '#8181A5', fontWeight: 800 }}>01. 05. 2026 v 10:00</span>
                    <h4 style={{ margin: '4px 0', fontSize: '15px', fontWeight: 800 }}>Schválení Dohody A1 a registrace nového vydání IPODu</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#1C1D21' }}>Registrována verze v2.0 vydaná OSPODem.</p>
                  </div>
                </div>
              </div>
            )}

            {/* KAPITOLA 3: Dokumenty & Dohody */}
            {activeTab === 'documents' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1D21', marginBottom: '20px' }}>
                  Archiv schválených dokumentů, Dohody A1 a IPOD od OSPODu
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
                  <div style={{ border: '1px solid #ECECF2', padding: '20px', borderRadius: '12px', backgroundColor: '#F7F9FC' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#4A85F6' }}>SCHVÁLENÁ DOHODA A1</span>
                    <h4 style={{ margin: '4px 0', fontSize: '15px', fontWeight: 800 }}>Dohoda o doprovázení (§ 47b)</h4>
                    <div style={{ fontSize: '12px', color: '#8181A5', marginBottom: '12px' }}>SHA-256 Otisk: 8f9b2c41... • QR Ověřeno</div>
                    <button style={{ backgroundColor: '#4A85F6', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      Zobrazit PDF s QR kódem
                    </button>
                  </div>

                  <div style={{ border: '1px solid #ECECF2', padding: '20px', borderRadius: '12px', backgroundColor: '#F7F9FC' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#27B973' }}>ÚŘEDNÍ SPIS OSPOD</span>
                    <h4 style={{ margin: '4px 0', fontSize: '15px', fontWeight: 800 }}>Individuální plán ochrany dítěte (IPOD v2.0)</h4>
                    <div style={{ fontSize: '12px', color: '#8181A5', marginBottom: '12px' }}>Platnost do 30.06.2027 • Vydal OSPOD Praha 4</div>
                    <button style={{ backgroundColor: '#27B973', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      Otevřít AI přepis IPODu
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* KAPITOLA 4: Kalendář & Plánované návštěvy */}
            {activeTab === 'calendar' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1D21', marginBottom: '20px' }}>
                  Kalendář návštěv a událostí entity
                </h3>
                <div style={{ padding: '16px', backgroundColor: '#F7F9FC', borderRadius: '12px', borderLeft: '4px solid #4A85F6' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#4A85F6' }}>ÚTERÝ 28. ČERVENCE 2026 v 14:00</span>
                  <h4 style={{ margin: '4px 0', fontSize: '15px', fontWeight: 800 }}>Plánovaná bi-monthly návštěva KO</h4>
                  <span style={{ fontSize: '12px', color: '#8181A5' }}>Klíčová osoba: Mgr. Jana Nováková</span>
                </div>
              </div>
            )}

            {/* KAPITOLA 5: Mapa & Lokace */}
            {activeTab === 'map' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1D21', marginBottom: '20px' }}>
                  Geografická lokace a mapa bydliště (GPS)
                </h3>
                <div style={{ backgroundColor: '#F7F9FC', height: '240px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #ECECF2' }}>
                  <i className="las la-map-marked-alt" style={{ fontSize: '48px', color: '#4A85F6', marginBottom: '12px' }}></i>
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>Lokace: {entity.city || 'Praha 4 - Nusle'}</span>
                  <span style={{ fontSize: '12px', color: '#8181A5' }}>GPS Souřadnice: 50.0755° N, 14.4378° E</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
export default EntityProfileView;
