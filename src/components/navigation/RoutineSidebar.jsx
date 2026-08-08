import React from 'react';
import { SvgIcon } from '../common/SvgIcon.jsx';

export function RoutineSidebar({ currentView, subView, onViewChange, isCollapsed, onToggleCollapse, user, onLogout }) {
  const mainNavItems = [
    { id: 'agenda', label: 'Agenda & Dnes', icon: 'clock' },
    { id: 'families', label: 'Rodiny & Spisy', icon: 'user' },
    { id: 'foster-parents', label: 'Pěstouni', icon: 'shield' },
    { id: 'children', label: 'Děti', icon: 'user' },
    { id: 'team', label: 'Tým & KO', icon: 'user' },
    { id: 'calendar', label: 'Kalendář', icon: 'calendar' },
    { id: 'notes', label: 'Poznámky', icon: 'stream' },
    { id: 'contacts', label: 'Kontakty', icon: 'mail' },
    { id: 'ospod-report', label: 'Zprávy OSPOD', icon: 'pdf' },
    { id: 'respit', label: 'Respit & Vzdělávání', icon: 'tasks' }
  ];

  const handleNavClick = (itemId) => {
    onViewChange(itemId);
  };

  const isItemActive = (itemId) => {
    if (currentView === itemId) return true;
    if (currentView === 'dashboard') {
      if (itemId === 'families' && (!subView || subView === 'families' || subView === 'overview')) return true;
      if (itemId === 'foster-parents' && subView === 'foster-parents') return true;
      if (itemId === 'children' && subView === 'children') return true;
      if (itemId === 'team' && subView === 'team') return true;
      if (itemId === 'agenda' && subView === 'agenda') return true;
    }
    return false;
  };

  return (
    <aside style={{
      width: isCollapsed ? '64px' : '240px',
      height: '100vh',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #f3f4f6',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      flexShrink: 0,
      transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      userSelect: 'none',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Top Workspace Header */}
      <div style={{ padding: '16px 12px 8px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', width: '100%' }}>
          {!isCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '4px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '6px', backgroundColor: '#FF4742', color: '#ffffff', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                D
              </div>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#111827', letterSpacing: '-0.01em' }}>
                Doprovázení.com
              </span>
            </div>
          ) : (
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#FF4742', color: '#ffffff', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              D
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={() => handleNavClick('agenda')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            borderRadius: '6px',
            backgroundColor: '#fee2e2',
            color: '#FF4742',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            justifyContent: isCollapsed ? 'center' : 'flex-start'
          }}
        >
          <SvgIcon name="play" size={14} style={{ color: '#FF4742' }} />
          {!isCollapsed && <span>Nový záznam</span>}
        </button>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '4px' }}>
          {mainNavItems.map((item) => {
            const active = isItemActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  backgroundColor: active ? '#f3f4f6' : 'transparent',
                  color: active ? '#111827' : '#6b7280',
                  fontWeight: active ? 600 : 400,
                  border: 'none',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.12s ease',
                  justifyContent: isCollapsed ? 'center' : 'flex-start'
                }}
              >
                <SvgIcon name={item.icon} size={16} style={{ color: active ? '#111827' : '#9ca3af' }} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Info & Settings Section */}
      <div style={{ padding: '12px', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button
          onClick={() => handleNavClick('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '7px 10px',
            borderRadius: '6px',
            backgroundColor: currentView === 'settings' ? '#f3f4f6' : 'transparent',
            color: currentView === 'settings' ? '#111827' : '#6b7280',
            border: 'none',
            fontSize: '13.5px',
            cursor: 'pointer',
            justifyContent: isCollapsed ? 'center' : 'flex-start'
          }}
        >
          <SvgIcon name="pin" size={16} style={{ color: '#9ca3af' }} />
          {!isCollapsed && <span>Nastavení</span>}
        </button>

        <button
          onClick={onToggleCollapse}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '7px 10px',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: 'none',
            fontSize: '13.5px',
            cursor: 'pointer',
            justifyContent: isCollapsed ? 'center' : 'flex-start'
          }}
        >
          <SvgIcon name={isCollapsed ? "arrow-right" : "arrow-left"} size={14} style={{ color: '#9ca3af' }} />
          {!isCollapsed && <span>Sbalit menu</span>}
        </button>

        {/* User Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', marginTop: '4px', borderRadius: '6px', backgroundColor: '#fafafa', border: '1px solid #f3f4f6' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#FF4742', color: '#ffffff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'JN'}
          </div>
          {!isCollapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Mgr. Jana Nováková'}
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>Klíčová osoba</div>
            </div>
          )}
          {!isCollapsed && onLogout && (
            <button onClick={onLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '2px' }} title="Odhlásit se">
              <SvgIcon name="arrow-right" size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

export default RoutineSidebar;
