import React, { useState } from 'react';

export function FosterParentPortal({ user, onNavigate, isMobileView }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [requestService, setRequestService] = useState('Hlídání dětí (Respit)');
  const [requestHours, setRequestHours] = useState('4');
  const [requestDate, setRequestDate] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Ukázková data pěstouna
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      backgroundColor: '#F7F9FC',
      fontFamily: 'var(--font-body)',
      overflowY: 'auto'
    }}>
      {/* Horní hlavička portálu pěstouna */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #ECECF2',
        padding: isMobileView ? '16px' : '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4A85F6 0%, #1B51E5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '22px'
          }}>
            <i className="las la-heart"></i>
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#1C1D21', margin: 0 }}>
              Klientský portál pěstouna
            </h1>
            <span style={{ fontSize: '12px', color: '#8181A5' }}>
              Vítáme vás, {fosterParentData.name}
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          style={{
            backgroundColor: '#F7F9FC',
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
          <span>Návrat do CRM</span>
        </button>
      </div>

      {/* Hlavní obsahové centrum */}
      <div style={{ padding: isMobileView ? '20px 16px' : '32px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Široký přehledný banner s kapacitou respitu */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobileView ? '1fr' : 'repeat(3, 1fr)',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {/* Karta 1: Moje Klíčová Osoba */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(154,160,185,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <span style={{ fontSize: '12px', color: '#8181A5', fontWeight: 700 }}>MOJE KLÍČOVÁ OSOBA</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#4A85F6',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                JN
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1C1D21', margin: 0 }}>
                  {fosterParentData.assignedKo.name}
                </h3>
                <span style={{ fontSize: '12px', color: '#8181A5' }}>
                  {fosterParentData.assignedKo.role}
                </span>
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#1C1D21', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
              <div><i className="las la-phone" style={{ color: '#4A85F6' }}></i> {fosterParentData.assignedKo.phone}</div>
              <div><i className="las la-envelope" style={{ color: '#4A85F6' }}></i> {fosterParentData.assignedKo.email}</div>
            </div>
          </div>

          {/* Karta 2: Čerpání Respitní péče */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(154,160,185,0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '12px', color: '#8181A5', fontWeight: 700 }}>ČERPÁNÍ RESPITNÍ PÉČE (2026)</span>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#1C1D21', margin: '8px 0 4px 0' }}>
                {fosterParentData.respitStats.usedHours} / {fosterParentData.respitStats.totalHours} hod.
              </h3>
              <span style={{ fontSize: '12px', color: '#27B973', fontWeight: 700 }}>
                Zbývá {fosterParentData.respitStats.totalHours - fosterParentData.respitStats.usedHours} hodin odlehčovacích služeb
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ width: '100%', height: '8px', backgroundColor: '#ECECF2', borderRadius: '4px', marginTop: '16px', overflow: 'hidden' }}>
              <div style={{
                width: `${(fosterParentData.respitStats.usedHours / fosterParentData.respitStats.totalHours) * 100}%`,
                height: '100%',
                backgroundColor: '#4A85F6',
                borderRadius: '4px'
              }} />
            </div>
          </div>

          {/* Karta 3: Čerpání SPVPP příspěvku */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(154,160,185,0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '12px', color: '#8181A5', fontWeight: 700 }}>PŘÍSPĚVEK SPVPP / VZDĚLÁVÁNÍ</span>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#1C1D21', margin: '8px 0 4px 0' }}>
                {fosterParentData.respitStats.spvppUsed.toLocaleString('cs-CZ')} Kč
              </h3>
              <span style={{ fontSize: '12px', color: '#8181A5' }}>
                z ročního limitu {fosterParentData.respitStats.spvppTotal.toLocaleString('cs-CZ')} Kč
              </span>
            </div>

            <div style={{ width: '100%', height: '8px', backgroundColor: '#ECECF2', borderRadius: '4px', marginTop: '16px', overflow: 'hidden' }}>
              <div style={{
                width: `${(fosterParentData.respitStats.spvppUsed / fosterParentData.respitStats.spvppTotal) * 100}%`,
                height: '100%',
                backgroundColor: '#27B973',
                borderRadius: '4px'
              }} />
            </div>
          </div>
        </div>

        {/* Dvou-sloupcový layout: Formulář žádosti o službu + Děti a Události */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobileView ? '1fr' : '2fr 1fr',
          gap: '24px'
        }}>
          {/* Levý blok: Formulář Žádosti o respit / doučování */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 2px 12px rgba(154,160,185,0.08)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#1C1D21', marginBottom: '8px' }}>
              Podat žádost o službu (Respit / Doučování / Terapie)
            </h2>
            <p style={{ color: '#8181A5', fontSize: '14px', marginBottom: '24px' }}>
              Zašlete požadavek vaší Klíčové osobě na zajištění hlídání dětí, odlehčovací služby nebo doučování.
            </p>

            {requestSuccess && (
              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(124,231,172,0.15)',
                border: '1px solid #27B973',
                borderRadius: '10px',
                color: '#27B973',
                fontWeight: 700,
                marginBottom: '20px'
              }}>
                Vaše žádost byla úspěšně předána klíčové osobě! Budeme vás kontaktovat pro potvrzení termínu.
              </div>
            )}

            <form onSubmit={handleSendRequest}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1C1D21', marginBottom: '6px' }}>Typ požadované služby</label>
                  <select
                    value={requestService}
                    onChange={(e) => setRequestService(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E0E0E8', fontSize: '14px' }}
                  >
                    <option value="Hlídání dětí (Respit)">Hlídání dětí (Respitní péče)</option>
                    <option value="Doučování předmětů">Doučování předmětů ZŠ/SŠ</option>
                    <option value="Psychologická konzultace">Psychologická podpora / Terapie</option>
                    <option value="Vzdělávací seminář">Vzdělávací akce pro pěstouny</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1C1D21', marginBottom: '6px' }}>Odhadovaný počet hodin</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={requestHours}
                    onChange={(e) => setRequestHours(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E0E0E8', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1C1D21', marginBottom: '6px' }}>Požadovaný termín</label>
                <input
                  type="date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E0E0E8', fontSize: '14px' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1C1D21', marginBottom: '6px' }}>Poznámka / Upřesnění</label>
                <textarea
                  rows={3}
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                  placeholder="Doplňte podrobnosti (např. vnímané potřeby dítěte, časové okno)..."
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E0E0E8', fontSize: '14px' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#4A85F6',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(74,133,246,0.25)'
                }}
              >
                Odeslat žádost Klíčové osobě
              </button>
            </form>
          </div>

          {/* Pravý blok: Přehled dětí a Plánované události */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Děti v péči */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(154,160,185,0.08)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#1C1D21', marginBottom: '16px' }}>
                Děti v péči ({fosterParentData.children.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {fosterParentData.children.map((child, idx) => (
                  <div key={idx} style={{
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: '#F7F9FC',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(74,133,246,0.1)',
                      color: '#4A85F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800
                    }}>
                      {child.name.substring(0, 1)}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1C1D21' }}>{child.name}</h4>
                      <span style={{ fontSize: '12px', color: '#8181A5' }}>RČ: {child.rc} ({child.status})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plánované události */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(154,160,185,0.08)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#1C1D21', marginBottom: '16px' }}>
                Plánované události
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {fosterParentData.upcomingEvents.map((ev) => (
                  <div key={ev.id} style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: '#F7F9FC',
                    borderLeft: '4px solid #4A85F6'
                  }}>
                    <span style={{ fontSize: '11px', color: '#4A85F6', fontWeight: 800 }}>{new Date(ev.date).toLocaleDateString('cs-CZ')} v {ev.time}</span>
                    <h4 style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: 700, color: '#1C1D21' }}>{ev.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default FosterParentPortal;
