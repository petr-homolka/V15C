import React from 'react';

export function TopBar({ user, title, onToggleMobileSidebar, isMobile, searchQuery = '', onSearchChange, onOpenQuickConsole }) {
  return (
    <div style={{
      width: '100%',
      height: '74px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #ECECF2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0 16px' : '0 32px',
      boxSizing: 'border-box',
      flexShrink: 0
    }}>
      {/* Levá část: Tlačítko pro mobilní sidebar / Titulek / Vyhledávání */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isMobile && (
          <button
            onClick={onToggleMobileSidebar}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#F7F9FC',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1C1D21',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            <i className="las la-bars"></i>
          </button>
        )}

        {!isMobile ? (
          <div style={{
            position: 'relative',
            width: '320px'
          }}>
            <i className="las la-search" style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8181A5',
              fontSize: '18px'
            }}></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Živé vyhledávání v rodinách, dětech..."
              style={{
                width: '100%',
                height: '42px',
                paddingLeft: '42px',
                paddingRight: '16px',
                borderRadius: '10px',
                backgroundColor: '#F7F9FC',
                border: '1px solid transparent',
                fontSize: '14px',
                color: '#1C1D21',
                outline: 'none',
                fontFamily: 'var(--font-body)'
              }}
            />
          </div>
        ) : (
          <span style={{
            fontSize: '18px',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            color: '#1C1D21'
          }}>
            {title || 'Doprovázení'}
          </span>
        )}
      </div>

      {/* Pravá část: Routine Quick Capture + Notifikace a Profil */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Routine Quick Capture Console Trigger */}
        <button
          onClick={onOpenQuickConsole}
          title="Rychlý příkazový řádek (Ctrl+K / Cmd+K)"
          style={{
            height: '42px',
            padding: '0 16px',
            borderRadius: '10px',
            backgroundColor: 'rgba(74,133,246,0.1)',
            color: '#4A85F6',
            border: 'none',
            fontWeight: 800,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.15s'
          }}
        >
          <i className="las la-bolt" style={{ fontSize: '18px' }}></i>
          <span>Rychlý zápis (Ctrl+K)</span>
        </button>
        {/* Notifikační zvonek */}
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          backgroundColor: '#F7F9FC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8181A5',
          fontSize: '20px',
          cursor: 'pointer',
          position: 'relative'
        }}>
          <i className="las la-bell"></i>
          <span style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#FF808B',
            border: '2px solid #FFFFFF'
          }} />
        </div>

        {/* Profil uživatele */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '4px 8px',
          borderRadius: '10px',
          cursor: 'pointer'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#4A85F6',
            color: '#FFFFFF',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px'
          }}>
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'JN'}
          </div>

          {!isMobile && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1C1D21', lineHeight: '1.2' }}>
                {user?.name || 'Jana Nováková'}
              </span>
              <span style={{ fontSize: '11px', color: '#8181A5' }}>
                {user?.role === 'org_admin' ? 'Správce organizace' : 'Klíčová osoba'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default TopBar;
