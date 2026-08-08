import React, { useState } from 'react';
import { SvgIcon } from '../components/common/SvgIcon.jsx';

export function EntityProfileView({ onBack }) {
  const [activeTab, setActiveTab] = useState('ospod');

  const ospodOffices = [
    { id: '1', name: 'OSPOD Praha 4', address: 'Antala Staška 2059/80, 140 00 Praha 4', contactPerson: 'PhDr. Marie Benešová', phone: '+420 261 192 111', email: 'ospod@praha4.cz', activeCases: 12 },
    { id: '2', name: 'OSPOD Praha 10', address: 'Vršovická 1429/68, 101 38 Praha 10', contactPerson: 'Mgr. Tomáš Kučera', phone: '+420 272 651 222', email: 'ospod@praha10.cz', activeCases: 8 },
    { id: '3', name: 'OSPOD Brno-střed', address: 'Dominikánská 2, 601 69 Brno', contactPerson: 'Ing. Eva Svobodová', phone: '+420 542 526 111', email: 'ospod@brno-stred.cz', activeCases: 5 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '36px 48px', fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      
      {/* Navigation & Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <SvgIcon name="arrow-left" size={14} />
            <span>Zpět</span>
          </button>
        </div>

        <h1 style={{ fontSize: '34px', fontWeight: 700, letterSpacing: '-0.02em', color: '#111827', margin: 0 }}>
          OSPOD & Partneri (Subjekty)
        </h1>

        <p style={{ fontSize: '15px', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
          Registr orgánů sociálně-právní ochrany dětí (OSPOD), smluvních odborníků a spolupracujících organizací.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
        {[
          { id: 'ospod', label: 'Úřady OSPOD', icon: 'shield' },
          { id: 'experts', label: 'Odborníci & Psychologové', icon: 'user' },
          { id: 'partners', label: 'Partnerské organizace', icon: 'contract' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              backgroundColor: activeTab === tab.id ? '#111827' : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : '#6b7280',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <SvgIcon name={tab.icon} size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Database Table */}
      <div style={{ width: '100%', border: '1px solid #f3f4f6', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
              <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Název úřadu / Organizace</th>
              <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Adresa sídla</th>
              <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Kontaktní osoba</th>
              <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Telefon / E-mail</th>
              <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', textAlign: 'right' }}>Aktivní spisy</th>
            </tr>
          </thead>
          <tbody>
            {ospodOffices.map((office) => (
              <tr key={office.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SvgIcon name="shield" size={16} style={{ color: '#FF4742' }} />
                    <span>{office.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: '#4b5563' }}>{office.address}</td>
                <td style={{ padding: '12px 16px', color: '#4b5563' }}>{office.contactPerson}</td>
                <td style={{ padding: '12px 16px', color: '#4b5563', fontFamily: 'monospace', fontSize: '12px' }}>
                  {office.email} <br /> {office.phone}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <span style={{ backgroundColor: '#fee2e2', color: '#FF4742', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                    {office.activeCases} spisu
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EntityProfileView;
