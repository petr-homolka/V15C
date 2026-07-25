import React, { useState, useEffect } from 'react';

export default function RoutineCommandKModal({ isOpen, onClose, onSelectAction }) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { id: 'new_visit', title: 'Přidat klíčovou návštěvu v rodině', category: 'Nové záznamy', icon: 'la-home', path: '/notes' },
    { id: 'new_foster', title: 'Registrovat novou pěstounskou pečovatelku', category: 'Pěstouni', icon: 'la-user-plus', path: '/fosters' },
    { id: 'new_child', title: 'Vložit dítě svěřené do péče', category: 'Děti', icon: 'la-smile', path: '/children' },
    { id: 'agenda_today', title: 'Otevřít Dnes (Time-Blocking Agenda)', category: 'Navigace', icon: 'la-calendar-day', path: '/' },
    { id: 'notes_journal', title: 'Zápisník návštěv KO (Journal)', category: 'Dokumentace', icon: 'la-book-open', path: '/notes' },
    { id: 'contacts_inspect', title: 'Kontakty OSPOD a Školy', category: 'Adresář', icon: 'la-address-book', path: '/contacts' },
  ];

  const filteredActions = quickActions.filter(act =>
    act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '560px',
          maxWidth: '90%',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          border: '1px solid #f2f2f2',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #f2f2f2' }}>
          <i className="las la-search" style={{ fontSize: '18px', color: '#747f8f', marginRight: '12px' }}></i>
          <input
            type="text"
            placeholder="Hledat klienty, úkoly, spisy, schůzky... (Esc pro zavření)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              fontFamily: 'Inter, sans-serif',
              color: '#171b1f',
              backgroundColor: 'transparent',
            }}
          />
        </div>

        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
          {filteredActions.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#747f8f', fontSize: '13px' }}>
              Žádné výsledky pro "{searchQuery}"
            </div>
          ) : (
            filteredActions.map((action) => (
              <div
                key={action.id}
                onClick={() => {
                  onSelectAction(action.path);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f4f4f4'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <i className={`las ${action.icon}`} style={{ fontSize: '18px', color: '#5e6774' }}></i>
                  <span style={{ fontSize: '14px', color: '#171b1f', fontWeight: 500 }}>{action.title}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#747f8f', backgroundColor: '#f2f2f2', padding: '2px 7px', borderRadius: '4px' }}>
                  {action.category}
                </span>
              </div>
            ))
          )}
        </div>

        <div style={{ backgroundColor: '#f9f9f9', padding: '8px 18px', borderTop: '1px solid #f2f2f2', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#747f8f' }}>
          <span>Vyberte kliknutím nebo Enter</span>
          <span>Stiskem <strong>ESC</strong> zavřete</span>
        </div>
      </div>
    </div>
  );
}
