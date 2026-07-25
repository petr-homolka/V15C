import React, { useState } from 'react';
import { RoutineSidebar } from '../components/navigation/RoutineSidebar.jsx';

export function RoutineContactsView({ user, onNavigate, onOpenQuickConsole, isMobileView }) {
  const [contacts] = useState([
    { id: 'c1', name: 'OSPOD Praha 4 - Mgr. Hrdličková', role: 'Kurátor OSPOD', phone: '+420 261 192 111', email: 'ospod.praha4@praha4.cz', address: 'Antala Staška 2059/80b, Praha 4' },
    { id: 'c2', name: 'Pedagogicko-psychologická poradna (PPP)', role: 'Poradenské zařízení', phone: '+420 241 771 054', email: 'info@ppp-praha.cz', address: 'Barunčina 11, Praha 4' },
    { id: 'c3', name: 'ZŠ Křesomyslova - PaedDr. Soukupová', role: 'Ředitelka školy', phone: '+420 241 400 123', email: 'skola@kresomyslova.cz', address: 'Křesomyslova 2, Praha 4' },
    { id: 'c4', name: 'PhDr. Alena Procházková', role: 'Terapeutka a psycholožka', phone: '+420 777 345 678', email: 'prochazkova@doprovazeni.cz', address: 'Doprovázení Centrum' }
  ]);

  const [selectedContactId, setSelectedContactId] = useState('c1');
  const selectedContact = contacts.find(c => c.id === selectedContactId);

  return (
    <div className="routine-layout">
      <RoutineSidebar
        activePage="contacts"
        onNavigate={onNavigate}
        onOpenQuickConsole={onOpenQuickConsole}
        user={user}
      />

      <div className="routine-main-canvas" style={{ flexDirection: 'row' }}>
        {/* Levý panel: Seznam kontaktů (Routine 2-pane) */}
        <div style={{ width: '320px', borderRight: '1px solid #ECECF2', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#FFFFFF' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#8181A5', textTransform: 'uppercase' }}>KONTAKTY & SPOLUPRÁCE</span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: 700 }}>Kontakty spisu</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {contacts.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedContactId(c.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: selectedContactId === c.id ? '#EBF2FE' : 'transparent',
                  color: selectedContactId === c.id ? '#4A85F6' : '#1C1D21',
                  cursor: 'pointer',
                  fontWeight: selectedContactId === c.id ? 700 : 500,
                  fontSize: '13px'
                }}
              >
                <div>{c.name}</div>
                <span style={{ fontSize: '11px', color: '#8181A5', fontWeight: 400 }}>{c.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pravý panel: Detail vybraného kontaktu */}
        <div style={{ flexGrow: 1, padding: '36px', overflowY: 'auto', backgroundColor: '#FBFBFC' }}>
          {selectedContact ? (
            <div className="routine-card" style={{ padding: '32px', maxWidth: '640px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#4A85F6', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800 }}>
                  {selectedContact.name[0]}
                </div>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 700 }}>{selectedContact.name}</h2>
                  <span style={{ fontSize: '12px', color: '#4A85F6', fontWeight: 700 }}>{selectedContact.role}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', backgroundColor: '#F7F9FC', padding: '20px', borderRadius: '12px' }}>
                <div><strong>Telefon:</strong> {selectedContact.phone}</div>
                <div><strong>E-mail:</strong> {selectedContact.email}</div>
                <div><strong>Adresa:</strong> {selectedContact.address}</div>
              </div>
            </div>
          ) : (
            <div>Vyberte kontakt vlevo</div>
          )}
        </div>
      </div>
    </div>
  );
}
export default RoutineContactsView;
