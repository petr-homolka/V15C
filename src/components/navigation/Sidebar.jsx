import React from 'react';

export function Sidebar({ activePage, onNavigate, isMobileOpen, onCloseMobile, isMobile }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'las la-chart-pie' },
    { id: 'family-list', label: 'Rodiny', icon: 'las la-users' },
    { id: 'foster-parents', label: 'Pěstouni', icon: 'las la-user-friends' },
    { id: 'children', label: 'Děti', icon: 'las la-smile' },
    { id: 'team', label: 'Tým', icon: 'las la-id-badge' },
    { id: 'calendar', label: 'Kalendář', icon: 'las la-calendar-alt' },
    { id: 'respit', label: 'Respit & SPVPP', icon: 'las la-calculator' },
    { id: 'messages', label: 'Zprávy', icon: 'las la-comments', badge: '3' },
    { id: 'import-export', label: 'Správa dat', icon: 'las la-database' },
    { id: 'foster-portal', label: 'Portál pěstounů', icon: 'las la-heart' },
    { id: 'ospod-report', label: 'Zprávy OSPOD', icon: 'las la-file-alt' },
    { id: 'superadmin', label: 'Superadmin Balíčky', icon: 'las la-user-shield' },
    { id: 'settings', label: 'Nastavení', icon: 'las la-cog' }
  ];

  const handleItemClick = (id) => {
    if (onNavigate) {
      if (id === 'family-list' || id === 'foster-parents' || id === 'children' || id === 'team' || id === 'dashboard') {
        onNavigate('dashboard', id);
      } else {
        onNavigate(id);
      }
    }
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  const containerStyle = isMobile ? {
    position: 'fixed',
    top: 0,
    left: isMobileOpen ? 0 : '-280px',
    width: '280px',
    height: '100vh',
    backgroundColor: '#FFFFFF',
    boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
    zIndex: 9999,
    transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px 16px',
    boxSizing: 'border-box'
  } : {
    width: '260px',
    height: '100vh',
    backgroundColor: '#FFFFFF',
    borderRight: '1px solid #ECECF2',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '32px 20px',
    boxSizing: 'border-box',
    flexShrink: 0
  };

  return (
    <>
      {/* Mobilní ověřovací overlay */}
      {isMobile && isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(28,29,33,0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 9998
          }}
        />
      )}

      <div style={containerStyle}>
        {/* Horní sekce: Logo a Navigace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Logo Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4A85F6 0%, #1B51E5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(74,133,246,0.3)'
            }}>
              <i className="las la-hands-helping"></i>
            </div>
            <div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '18px',
                color: '#1C1D21',
                letterSpacing: '-0.3px',
                display: 'block',
                lineHeight: '1.2'
              }}>
                Doprovázení
              </span>
              <span style={{ fontSize: '11px', color: '#8181A5', fontWeight: 600 }}>
                PORTÁL PĚSTOUNŮ
              </span>
            </div>
          </div>

          {/* Seznam položek menu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {menuItems.map((item) => {
              const isActive = activePage === item.id || (activePage === 'family-detail' && item.id === 'family-list');
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    backgroundColor: isActive ? '#EBF2FE' : 'transparent',
                    color: isActive ? '#4A85F6' : '#8181A5',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '15px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <i className={item.icon} style={{ fontSize: '20px', color: isActive ? '#4A85F6' : '#8181A5' }}></i>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span style={{
                      backgroundColor: isActive ? '#4A85F6' : '#FF808B',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Spodní sekce: Podpora a Odhlášení */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            backgroundColor: '#F7F9FC',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(74,133,246,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4A85F6',
              fontSize: '18px'
            }}>
              <i className="las la-headset"></i>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1C1D21' }}>Podpora metodika</span>
              <span style={{ fontSize: '11px', color: '#8181A5' }}>Po-Pá 8:00 - 16:00</span>
            </div>
          </div>

          <div 
            onClick={() => onNavigate && onNavigate('signin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              color: '#8181A5',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            <i className="las la-sign-out-alt" style={{ fontSize: '18px' }}></i>
            <span>Odhlásit se</span>
          </div>
        </div>
      </div>
    </>
  );
}
export default Sidebar;
