import React, { useState } from 'react';

/**
 * RoutineSidebar - Plynule schovávací levé menu Routine se stabilním vykreslením ikon.
 */
export function RoutineSidebar({ activePage, activeSubView, onNavigate, onOpenQuickConsole, user }) {
  const [collapsed, setCollapsed] = useState(false);

  const mainNav = [
    { id: 'agenda', label: 'Agenda & Dnes', icon: 'las la-calendar-check', page: 'dashboard', subView: 'dashboard' },
    { id: 'families', label: 'Rodiny & Spisy', icon: 'las la-folder-open', page: 'dashboard', subView: 'dashboard' },
    { id: 'foster-parents', label: 'Pěstouni', icon: 'las la-user-friends', page: 'dashboard', subView: 'foster-parents' },
    { id: 'children', label: 'Děti', icon: 'las la-baby', page: 'dashboard', subView: 'children' },
    { id: 'team', label: 'Tým & KO', icon: 'las la-user-tie', page: 'dashboard', subView: 'team' },
    { id: 'calendar', label: 'Kalendář', icon: 'las la-clock', page: 'calendar' },
    { id: 'notes', label: 'Poznámky', icon: 'las la-file-alt', page: 'notes' },
    { id: 'contacts', label: 'Kontakty', icon: 'las la-address-book', page: 'contacts' },
    { id: 'ospod-report', label: 'Zprávy OSPOD', icon: 'las la-file-pdf', page: 'ospod-report' },
    { id: 'respit', label: 'Respit & Vzdělávání', icon: 'las la-graduation-cap', page: 'respit' }
  ];

  return (
    <div 
      style={{
        width: collapsed ? '64px' : '220px',
        transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100vh',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #EAEAEA',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
        zIndex: 50
      }}
    >
      <div style={{ padding: '8px' }}>
        {/* Tlačítko Nový */}
        <div
          onClick={onOpenQuickConsole}
          title={collapsed ? 'Nový (Ctrl+N)' : ''}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : '10px',
            padding: collapsed ? '9px 0' : '8px 10px',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: '#FFF5F5',
            color: '#FF4742',
            marginBottom: '6px',
            overflow: 'hidden',
            transition: 'all 0.2s ease'
          }}
        >
          <i 
            className="las la-plus-circle" 
            style={{ 
              fontSize: collapsed ? '24px' : '20px', 
              color: '#FF4742', 
              flexShrink: 0, 
              transition: 'font-size 0.2s ease' 
            }}
          />
          {!collapsed && <span style={{ color: '#FF4742', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}>Nový</span>}
        </div>

        {/* Hledat */}
        <div
          onClick={onOpenQuickConsole}
          title={collapsed ? 'Hledat (Ctrl+K)' : ''}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : '10px',
            padding: collapsed ? '9px 0' : '8px 10px',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#5E6774',
            marginBottom: '12px',
            overflow: 'hidden',
            transition: 'all 0.2s ease'
          }}
        >
          <i 
            className="las la-search" 
            style={{ 
              fontSize: collapsed ? '22px' : '18px', 
              flexShrink: 0, 
              transition: 'font-size 0.2s ease' 
            }}
          />
          {!collapsed && <span style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>Hledat (Ctrl+K)</span>}
        </div>

        {/* Navigační seznam s 100% stabilním vykreslením ikon LineAwesome 'las' */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {mainNav.map((item) => {
            const isActive = (item.page ? activePage === item.page : true) && 
              (item.subView ? activeSubView === item.subView : true);

            return (
              <div
                key={item.id}
                onClick={() => onNavigate(item.page || 'dashboard', item.subView)}
                title={collapsed ? item.label : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: collapsed ? 0 : '12px',
                  padding: collapsed ? '9px 0' : '8px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#F4F4F6' : 'transparent',
                  color: isActive ? '#171B1F' : '#5E6774',
                  fontWeight: isActive ? 500 : 400,
                  overflow: 'hidden',
                  transition: 'all 0.15s ease'
                }}
              >
                <i 
                  className={item.icon} 
                  style={{ 
                    fontSize: collapsed ? '23px' : '18px', 
                    color: isActive ? '#FF4742' : '#8896A9', 
                    opacity: collapsed ? 0.9 : 1,
                    flexShrink: 0,
                    transition: 'font-size 0.15s ease'
                  }} 
                />
                {!collapsed && <span style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Spodní část s tlačítkem Sbalit a Uživatelem */}
      <div style={{ padding: '8px', borderTop: '1px solid #EAEAEA' }}>
        <div
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Rozbalit menu' : 'Sbalit menu'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : '10px',
            padding: collapsed ? '9px 0' : '8px 10px',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#747F8F',
            fontSize: '13px',
            marginBottom: '4px',
            overflow: 'hidden',
            transition: 'all 0.2s ease'
          }}
        >
          <i 
            className={`las ${collapsed ? 'la-angle-double-right' : 'la-angle-double-left'}`} 
            style={{ 
              fontSize: collapsed ? '22px' : '18px', 
              flexShrink: 0, 
              transition: 'font-size 0.2s ease' 
            }}
          />
          {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>Sbalit menu</span>}
        </div>

        <div
          onClick={() => onNavigate('settings')}
          title={collapsed ? (user?.name || 'Jana Nováková') : ''}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : '10px',
            padding: collapsed ? '6px 0' : '6px 8px',
            borderRadius: '8px',
            cursor: 'pointer',
            overflow: 'hidden',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{
            width: collapsed ? '30px' : '28px',
            height: collapsed ? '30px' : '28px',
            borderRadius: '50%',
            backgroundColor: '#FF4742',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: collapsed ? '12px' : '11px',
            flexShrink: 0,
            transition: 'all 0.2s ease'
          }}>
            {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'JN'}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <strong style={{ fontSize: '12px', display: 'block', color: '#171B1F', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontWeight: 500 }}>
                {user?.name || 'Jana Nováková'}
              </strong>
              <span style={{ fontSize: '10px', color: '#747F8F', display: 'block', whiteSpace: 'nowrap' }}>
                Klíčová osoba
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default RoutineSidebar;
