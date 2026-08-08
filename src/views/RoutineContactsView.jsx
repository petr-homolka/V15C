import React, { useState } from 'react';

export function RoutineContactsView() {
  const [contacts] = useState([
    { id: 'c1', name: 'OSPOD Praha 4 - Mgr. Hrdličková', role: 'Kurátor OSPOD', phone: '+420 261 192 111', email: 'ospod.praha4@praha4.cz', address: 'Antala Staška 2059/80b, Praha 4' },
    { id: 'c2', name: 'Pedagogicko-psychologická poradna (PPP)', role: 'Poradenské zařízení', phone: '+420 241 771 054', email: 'info@ppp-praha.cz', address: 'Barunčina 11, Praha 4' },
    { id: 'c3', name: 'ZŠ Křesomyslova - PaedDr. Soukupová', role: 'Ředitelka školy', phone: '+420 241 400 123', email: 'skola@kresomyslova.cz', address: 'Křesomyslova 2, Praha 4' },
    { id: 'c4', name: 'PhDr. Alena Procházková', role: 'Terapeutka a psycholožka', phone: '+420 777 345 678', email: 'prochazkova@doprovazeni.cz', address: 'Doprovázení Centrum' }
  ]);

  const [selectedContactId, setSelectedContactId] = useState('c1');
  const selectedContact = contacts.find(c => c.id === selectedContactId);

  return (
    <div className="flex flex-row h-full w-full bg-white overflow-hidden">
      {/* Levý panel: Seznam kontaktů (Routine 2-pane) */}
      <div className="w-80 border-r border-[#e8e8ed] p-6 flex flex-col gap-4 bg-white shrink-0">
        <div>
          <span className="text-[11px] font-bold text-[var(--routine-text-secondary)] uppercase tracking-wider">
            KONTAKTY & SPOLUPRÁCE
          </span>
          <h1 className="text-xl font-bold text-[var(--routine-text-primary)] mt-1">
            Adresář agendy
          </h1>
        </div>

        <div className="flex flex-col gap-1">
          {contacts.map(c => {
            const isSelected = selectedContactId === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedContactId(c.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[var(--routine-coral-light)] text-[var(--routine-coral)] font-semibold'
                    : 'hover:bg-[#f4f4f6] text-[var(--routine-text-primary)]'
                }`}
              >
                <div className="text-xs">{c.name}</div>
                <span className="text-[11px] text-[var(--routine-text-secondary)] font-normal">{c.role}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pravý panel: Detail vybraného kontaktu */}
      <div className="flex-1 p-8 overflow-y-auto bg-[#f9f9fb]">
        {selectedContact && (
          <div className="routine-card p-6 max-w-xl space-y-6">
            <div className="flex items-center gap-4 border-b border-[#f0f0f4] pb-4">
              <div className="w-12 h-12 rounded-full bg-[var(--routine-coral)] text-white font-bold text-lg flex items-center justify-center">
                {selectedContact.name[0]}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--routine-text-primary)]">{selectedContact.name}</h2>
                <span className="routine-badge routine-badge-coral font-mono text-xs">{selectedContact.role}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[var(--routine-text-primary)]">
              <div className="flex items-center justify-between p-2.5 rounded bg-[#f0f0f4]">
                <span className="font-semibold text-[var(--routine-text-secondary)]">Telefon:</span>
                <span className="font-mono font-bold text-[var(--routine-coral)]">{selectedContact.phone}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-[#f0f0f4]">
                <span className="font-semibold text-[var(--routine-text-secondary)]">E-mail:</span>
                <span className="font-mono">{selectedContact.email}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-[#f0f0f4]">
                <span className="font-semibold text-[var(--routine-text-secondary)]">Adresa:</span>
                <span>{selectedContact.address}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoutineContactsView;
