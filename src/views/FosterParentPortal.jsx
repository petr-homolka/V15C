import React, { useState } from 'react';

export function FosterParentPortal({ onNavigate }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [requestService, setRequestService] = useState('Hlídání dětí (Respit)');
  const [requestHours, setRequestHours] = useState('4');
  const [requestDate, setRequestDate] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  const fosterParentData = {
    name: 'Petr a Anna Dvořákovi',
    assignedKo: {
      name: 'Mgr. Jana Nováková',
      role: 'Klíčová osoba pěstounské péče',
      phone: '+420 777 123 456',
      email: 'jana.novakova@doprovazeni.cz'
    },
    children: [
      { name: 'Tomáš Dvořák', birthYear: 2014, rc: '140512/1234', status: 'V péči od 2021' },
      { name: 'Eliška Dvořáková', birthYear: 2017, rc: '175820/5678', status: 'V péči od 2022' }
    ],
    respitStats: {
      usedHours: 14,
      totalHours: 40,
      spvppUsed: 3500,
      spvppTotal: 12000
    },
    upcomingEvents: [
      { id: '1', date: '2026-07-30', title: 'Plánovaná návštěva KO v rodině', time: '14:00' },
      { id: '2', date: '2026-08-05', title: 'Seminář: Rozvoj emocí u dětí v NRP', time: '09:00' }
    ]
  };

  const handleSendRequest = (e) => {
    e.preventDefault();
    if (!requestDate) {
      alert("Zadejte prosím požadované datum.");
      return;
    }
    setRequestSuccess(true);
    setTimeout(() => {
      setRequestSuccess(false);
      setRequestDate('');
      setRequestNote('');
    }, 4000);
  };

  return (
    <div className="routine-page-container font-sans">
      {/* Header */}
      <div className="routine-flex-between pb-3 border-b border-[#f0f0f4]">
        <div>
          <h1 className="routine-header-title">
            Klientský Portál Pěstouna
          </h1>
          <p className="routine-header-sub">
            Samoobslužný portál pro přehled služeb, respitu a kontakt na KO | Routine.co Format
          </p>
        </div>

        <div className="routine-flex-center">
          <span className="routine-badge routine-badge-coral font-mono text-xs">
            Pěstounská rodina
          </span>
          <button className="routine-btn-secondary text-xs" onClick={() => onNavigate && onNavigate('signin')}>
            Odhlásit
          </button>
        </div>
      </div>

      {/* Hero Welcome Card */}
      <div className="routine-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="routine-flex-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--routine-coral)] text-white font-bold text-lg flex items-center justify-center">
            P
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--routine-text-primary)]">
              Vítejte, {fosterParentData.name}
            </h2>
            <p className="text-xs text-[var(--routine-text-secondary)] mt-0.5">
              Vaše klíčová osoba: <strong className="text-[var(--routine-text-primary)]">{fosterParentData.assignedKo.name}</strong> ({fosterParentData.assignedKo.phone})
            </p>
          </div>
        </div>

        <button className="routine-btn-primary text-xs" onClick={() => setActiveSection('request')}>
          <i className="las la-plus-circle text-base" />
          Požádat o respit / hlídání
        </button>
      </div>

      {/* Routine Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#f0f0f4]">
        {[
          { id: 'overview', label: 'Přehled mé péče', icon: 'las la-home' },
          { id: 'request', label: 'Žádost o službu / Respit', icon: 'las la-hand-holding-heart' },
          { id: 'events', label: 'Moje návštěvy & Akce', icon: 'las la-calendar-alt' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
              activeSection === tab.id
                ? 'bg-white text-[var(--routine-coral)] border-t-2 border-[var(--routine-coral)] border-x border-[#f0f0f4]'
                : 'text-[var(--routine-text-secondary)] hover:text-[var(--routine-text-primary)] hover:bg-[#f8f8fa]'
            }`}
          >
            <i className={tab.icon} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="routine-grid-2">
            <div className="routine-card p-6 space-y-3">
              <h3 className="text-sm font-bold text-[var(--routine-text-primary)]">
                Čerpání respitní péče (hodiny)
              </h3>
              <div className="text-2xl font-bold font-mono text-[var(--routine-coral)]">
                {fosterParentData.respitStats.usedHours} / {fosterParentData.respitStats.totalHours} hod.
              </div>
              <div className="w-full bg-[#f0f0f4] h-2 rounded-full overflow-hidden">
                <div className="bg-[var(--routine-coral)] h-full w-[35%]" />
              </div>
            </div>

            <div className="routine-card p-6 space-y-3">
              <h3 className="text-sm font-bold text-[var(--routine-text-primary)]">
                Příspěvek na respit (SPVPP)
              </h3>
              <div className="text-2xl font-bold font-mono text-[var(--routine-green)]">
                {fosterParentData.respitStats.spvppUsed.toLocaleString('cs-CZ')} / {fosterParentData.respitStats.spvppTotal.toLocaleString('cs-CZ')} Kč
              </div>
              <div className="w-full bg-[#f0f0f4] h-2 rounded-full overflow-hidden">
                <div className="bg-[var(--routine-green)] h-full w-[30%]" />
              </div>
            </div>
          </div>

          <div className="routine-card p-6 space-y-3">
            <h3 className="text-sm font-bold text-[var(--routine-text-primary)]">
              Svěřené děti v evidenci
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fosterParentData.children.map((child, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-[#e8e8ed] bg-[#f9f9fb] routine-flex-between">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--routine-text-primary)]">{child.name}</h4>
                    <p className="text-[11px] text-[var(--routine-text-secondary)]">Rok narození: {child.birthYear}</p>
                  </div>
                  <span className="routine-badge routine-badge-blue">{child.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Request */}
      {activeSection === 'request' && (
        <div className="routine-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[var(--routine-text-primary)]">
            Podat žádost o čerpání respitu nebo odlehčovací služby
          </h3>

          {requestSuccess && (
            <div className="p-3 rounded-lg bg-[var(--routine-green-light)] border border-[var(--routine-green)] text-[var(--routine-green)] text-xs font-medium routine-flex-center">
              <i className="las la-check-circle text-base" />
              <span>Žádost byla v pořádku odeslána vaší klíčové osobě.</span>
            </div>
          )}

          <form onSubmit={handleSendRequest} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-[var(--routine-text-secondary)] mb-1">
                Požadovaná služba
              </label>
              <select
                className="routine-input"
                value={requestService}
                onChange={(e) => setRequestService(e.target.value)}
              >
                <option value="Hlídání dětí (Respit)">Hlídání dětí (Respit)</option>
                <option value="Doučování">Doučování pro dceru/syna</option>
                <option value="Víkendový pobyt">Víkendový respitní pobyt</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--routine-text-secondary)] mb-1">
                Požadované datum
              </label>
              <input
                type="date"
                className="routine-input"
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--routine-text-secondary)] mb-1">
                Počet hodin / dnů
              </label>
              <input
                type="number"
                className="routine-input"
                value={requestHours}
                onChange={(e) => setRequestHours(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--routine-text-secondary)] mb-1">
                Poznámka pro KO
              </label>
              <textarea
                className="routine-input h-24 resize-none"
                placeholder="Uveďte podrobnosti žádosti..."
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
              />
            </div>

            <button type="submit" className="routine-btn-primary">
              <i className="las la-paper-plane text-base" />
              Odeslat žádost
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Events */}
      {activeSection === 'events' && (
        <div className="routine-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[var(--routine-text-primary)]">
            Nadcházející návštěvy a vzdělávací akce
          </h3>
          <div className="space-y-3">
            {fosterParentData.upcomingEvents.map(evt => (
              <div key={evt.id} className="p-3.5 rounded-lg border border-[#e8e8ed] bg-[#f9f9fb] routine-flex-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--routine-text-primary)]">{evt.title}</h4>
                  <p className="text-[11px] text-[var(--routine-text-secondary)] font-mono">Čas: {evt.time}</p>
                </div>
                <span className="routine-badge routine-badge-coral font-mono">{evt.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FosterParentPortal;
