import React, { useState } from 'react';
import { Sidebar } from '../components/navigation/Sidebar.jsx';
import { TopBar } from '../components/navigation/TopBar.jsx';

export function SuperAdminView({ user, onNavigate, isMobileView }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [packages, setPackages] = useState([
    {
      id: 'pkg_basic',
      name: 'Balíček BASIC',
      price: 1490,
      period: 'měsíčně / org',
      features: ['Správa spisů rodin a dětí', 'Bi-monthly návštěvy', 'Základní AI zápisník']
    },
    {
      id: 'pkg_standard',
      name: 'Balíček STANDARD',
      price: 2990,
      period: 'měsíčně / org',
      features: ['Vše z BASIC', 'Klientský portál pěstounů', 'Generátor OSPOD reportů', 'AI Doporučovač kurzů']
    },
    {
      id: 'pkg_premium',
      name: 'Balíček PREMIUM UNLIMITED',
      price: 4990,
      period: 'měsíčně / org',
      features: ['Vše ze STANDARD', 'Exit Transfer se SMS 2FA', 'AES-256 Šifrované zálohy', 'PWA Offline synchronizace', 'Účetní exporty SPVPP']
    }
  ]);

  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgPrice, setNewPkgPrice] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);

  const handleCreatePackage = (e) => {
    e.preventDefault();
    if (!newPkgName || !newPkgPrice) return;
    const newPkg = {
      id: `pkg_${Date.now()}`,
      name: newPkgName,
      price: parseInt(newPkgPrice, 10),
      period: 'měsíčně / org',
      features: ['Vlastní kombinace služeb', 'AI Asistent']
    };
    setPackages(prev => [...prev, newPkg]);
    setNewPkgName('');
    setNewPkgPrice('');
    setSuccessMsg("Nový placený balíček byl úspěšně vytvořen a uložen.");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

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
        activePage="settings" 
        onNavigate={onNavigate}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isMobile={isMobileView}
      />

      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%', overflow: 'hidden' }}>
        <TopBar 
          user={user} 
          title="Superadmin — Správa balíčků a licencí" 
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          isMobile={isMobileView}
        />

        <div style={{ padding: isMobileView ? '20px 16px' : '32px 40px', overflowY: 'auto', flexGrow: 1 }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 2px 12px rgba(154,160,185,0.08)',
            marginBottom: '32px'
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#1C1D21', marginBottom: '8px' }}>
              Vytvořit nový placený balíček služeb
            </h2>
            <p style={{ color: '#8181A5', fontSize: '14px', marginBottom: '24px' }}>
              Superadmin může flexibilně definovat balíčky kombinuje různé služby, práva a limity pro doprovázející organizace.
            </p>

            {successMsg && (
              <div style={{ padding: '16px', backgroundColor: 'rgba(124,231,172,0.15)', border: '1px solid #27B973', borderRadius: '10px', color: '#27B973', fontWeight: 700, marginBottom: '20px' }}>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleCreatePackage} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 250px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Název balíčku</label>
                <input
                  type="text"
                  placeholder="Např. Balíček SPECIAL OSPOD"
                  value={newPkgName}
                  onChange={(e) => setNewPkgName(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E0E0E8', fontSize: '14px' }}
                />
              </div>

              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Cena (Kč / měsíc)</label>
                <input
                  type="number"
                  placeholder="3490"
                  value={newPkgPrice}
                  onChange={(e) => setNewPkgPrice(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E0E0E8', fontSize: '14px' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#4A85F6',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Vytvořit balíček
              </button>
            </form>
          </div>

          {/* Přehled stávajících balíčků */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
            {packages.map((pkg) => (
              <div key={pkg.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 2px 12px rgba(154,160,185,0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: '6px solid #4A85F6'
              }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#8181A5', textTransform: 'uppercase' }}>GLOBÁLNÍ BALÍČEK</span>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1D21', margin: '4px 0 12px 0' }}>{pkg.name}</h3>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#4A85F6', marginBottom: '16px' }}>
                    {pkg.price.toLocaleString('cs-CZ')} Kč <span style={{ fontSize: '13px', color: '#8181A5', fontWeight: 600 }}>/ {pkg.period}</span>
                  </div>

                  <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px', color: '#1C1D21', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pkg.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => alert(`Aktivace balíčku ${pkg.name} pro doprovázející organizaci`)}
                  style={{
                    backgroundColor: '#F7F9FC',
                    border: '1px solid #4A85F6',
                    color: '#4A85F6',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginTop: '24px'
                  }}
                >
                  Upravit balíček
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default SuperAdminView;
