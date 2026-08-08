import React, { useState, useEffect } from 'react';
import { getSeedFamilies, getSeedFosterParents, getSeedChildren, getSeedTeamMembers } from '../services/seedDataService.js';
import { SvgIcon } from '../components/common/SvgIcon.jsx';

export function Dashboard({ onSelectFamily, onNavigate, subView = 'families' }) {
  const [activeTab, setActiveTab] = useState(subView || 'families');
  const [families, setFamilies] = useState([]);
  const [fosterParents, setFosterParents] = useState([]);
  const [children, setChildren] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setFamilies(getSeedFamilies());
    setFosterParents(getSeedFosterParents());
    setChildren(getSeedChildren());
    setTeamMembers(getSeedTeamMembers());
  }, []);

  useEffect(() => {
    if (subView) {
      setActiveTab(subView);
    }
  }, [subView]);

  const filteredFamilies = families.filter(fam => {
    const term = searchTerm.toLowerCase();
    const name = (fam.fosterParents || fam.fosterParentsDisplay || (fam.primaryFosterParent ? fam.primaryFosterParent.name : '') || '').toLowerCase();
    const uid = (fam.uid || fam.id || '').toLowerCase();
    return name.includes(term) || uid.includes(term);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '36px 48px', fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      
      {/* Header Block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ backgroundColor: '#fee2e2', color: '#FF4742', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
            CRM Doprovázení.com
          </span>
          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#9ca3af' }}>
            Evidenční portál 2026
          </span>
        </div>

        <h1 style={{ fontSize: '34px', fontWeight: 700, letterSpacing: '-0.02em', color: '#111827', margin: 0 }}>
          Rodiny & Spisy v evidenci
        </h1>

        <p style={{ fontSize: '15px', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
          Přehled spisu doprovázených pěstounských rodin, svěřených dětí, klíčových pracovníků a výkazů pro OSPOD.
        </p>

        {/* Notion KPI Summary Pills */}
        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
            <SvgIcon name="user" size={16} style={{ color: '#FF4742' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Spisy rodin</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{families.length} rodin</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
            <SvgIcon name="shield" size={16} style={{ color: '#059669' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dohody A1</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>22 platných</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
            <SvgIcon name="user" size={16} style={{ color: '#2563eb' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dětí v péči</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{children.length} dětí</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
            <SvgIcon name="clock" size={16} style={{ color: '#d97706' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Respitní péče</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>340 / 480 hod.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notion Filter & Navigation Tabs Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'families', label: 'Rodiny & Spisy', icon: 'user' },
            { id: 'foster-parents', label: 'Pěstouni', icon: 'shield' },
            { id: 'children', label: 'Děti', icon: 'user' },
            { id: 'team', label: 'Tým & KO', icon: 'user' }
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
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <SvgIcon name={tab.icon} size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 10px' }}>
          <SvgIcon name="pin" size={14} style={{ color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Hledat podle jména nebo UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#111827', width: '200px' }}
          />
        </div>
      </div>

      {/* Tab 1: Notion Database Table of Families */}
      {activeTab === 'families' && (
        <div style={{ width: '100%', overflowX: 'auto', border: '1px solid #f3f4f6', borderRadius: '8px', backgroundColor: '#ffffff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Název spisu</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Kód UID</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Pěstouni</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Děti v péči</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Klíčová osoba</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Stav dohlížení</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', textAlign: 'right' }}>Akce</th>
              </tr>
            </thead>
            <tbody>
              {filteredFamilies.map((fam) => {
                const fosterParentsName = fam.fosterParents || fam.fosterParentsDisplay || (fam.primaryFosterParent ? fam.primaryFosterParent.name : 'Pěstounská rodina');
                return (
                  <tr
                    key={fam.id || fam.uid}
                    style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background-color 0.12s ease' }}
                    onClick={() => onSelectFamily && onSelectFamily(fam)}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF4742' }} />
                        <span>{fosterParentsName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' }}>
                      {fam.uid || fam.id || '9048270000017'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4b5563' }}>
                      {fosterParentsName}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4b5563' }}>
                      <span style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                        2 děti (Tomáš, Eliška)
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4b5563' }}>
                      {fam.assignedTo || 'Mgr. Jana Nováková'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ backgroundColor: '#d1fae5', color: '#047857', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>
                        Aktivní dohlížení
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFamily && onSelectFamily(fam);
                        }}
                        style={{ backgroundColor: '#ffffff', color: '#111827', border: '1px solid #d1d5db', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
                      >
                        Otevřít spis
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Foster Parents Database */}
      {activeTab === 'foster-parents' && (
        <div style={{ width: '100%', overflowX: 'auto', border: '1px solid #f3f4f6', borderRadius: '8px', backgroundColor: '#ffffff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Pěstoun</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Role</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Kontakt</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Spis Rodiny</th>
              </tr>
            </thead>
            <tbody>
              {fosterParents.map((fp, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>{fp.name}</td>
                  <td style={{ padding: '12px 16px', color: '#4b5563' }}>{fp.role || 'Pěstoun'}</td>
                  <td style={{ padding: '12px 16px', color: '#4b5563', fontFamily: 'monospace', fontSize: '12px' }}>{fp.email || 'dvorak@seznam.cz'}</td>
                  <td style={{ padding: '12px 16px', color: '#4b5563' }}>{fp.familyName || 'Dvořákovi'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Children Database */}
      {activeTab === 'children' && (
        <div style={{ width: '100%', overflowX: 'auto', border: '1px solid #f3f4f6', borderRadius: '8px', backgroundColor: '#ffffff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Jméno dítěte</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Rodné číslo</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Věk</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Škola / Školka</th>
              </tr>
            </thead>
            <tbody>
              {children.map((ch, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>{ch.name}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#FF4742', fontWeight: 700 }}>{ch.rc || '180512/4321'}</td>
                  <td style={{ padding: '12px 16px', color: '#4b5563' }}>{ch.age || 8} let</td>
                  <td style={{ padding: '12px 16px', color: '#4b5563' }}>{ch.school || 'ZŠ Palackého'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Team Members Database */}
      {activeTab === 'team' && (
        <div style={{ width: '100%', overflowX: 'auto', border: '1px solid #f3f4f6', borderRadius: '8px', backgroundColor: '#ffffff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Jméno pracovníka</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Pozice</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>E-mail</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Přířazených rodin</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((tm, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>{tm.name}</td>
                  <td style={{ padding: '12px 16px', color: '#4b5563' }}>{tm.role || 'Klíčový pracovník'}</td>
                  <td style={{ padding: '12px 16px', color: '#4b5563', fontFamily: 'monospace', fontSize: '12px' }}>{tm.email || 'novakova@doprovazeni.cz'}</td>
                  <td style={{ padding: '12px 16px', color: '#4b5563' }}>{tm.assignedCount || 6} rodin</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
