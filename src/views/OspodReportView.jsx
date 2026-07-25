import React, { useState, useEffect } from 'react';
import { generateOspodReport } from '../services/ospodReportService';
import { Sidebar } from '../components/navigation/Sidebar.jsx';
import { TopBar } from '../components/navigation/TopBar.jsx';

export function OspodReportView({ user, onNavigate, isMobileView }) {
  const [report, setReport] = useState(null);
  const [period, setPeriod] = useState('2026-FULL');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    async function loadReport() {
      const res = await generateOspodReport('9900010000013', period);
      setReport(res);
    }
    loadReport();
  }, [period]);

  const handlePrint = () => {
    window.print();
  };

  if (!report) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#F7F9FC',
      fontFamily: 'var(--font-body)',
      overflow: 'hidden'
    }}>
      <Sidebar 
        activePage="dashboard" 
        onNavigate={onNavigate}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isMobile={isMobileView}
      />

      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%', overflow: 'hidden' }}>
        <TopBar 
          user={user} 
          title="Generátor zpráv pro OSPOD" 
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          isMobile={isMobileView}
        />

        <div style={{ padding: isMobileView ? '20px 16px' : '32px 40px', overflowY: 'auto', flexGrow: 1 }}>
          {/* Tlačítka akcí a filtr období */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <label style={{ fontWeight: 700, fontSize: '14px' }}>Období zprávy:</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E0E0E8', fontWeight: 600, fontSize: '14px' }}
              >
                <option value="2026-FULL">Rok 2026 (Celoroční zpráva)</option>
                <option value="2026-H1">Rok 2026 (1. pololetí H1)</option>
                <option value="2025-FULL">Rok 2025 (Celoroční zpráva)</option>
              </select>
            </div>

            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#4A85F6',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="las la-print" style={{ fontSize: '18px' }}></i>
              <span>Vytisknout / Uložit do PDF</span>
            </button>
          </div>

          {/* Vlastní formulář zprávy OSPOD v tiskovém layoutu */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: isMobileView ? '24px' : '48px',
            boxShadow: '0 2px 12px rgba(154,160,185,0.08)',
            maxWidth: '900px',
            margin: '0 auto',
            border: '1px solid #ECECF2'
          }}>
            {/* Hlavička úředního dokumentu */}
            <div style={{ borderBottom: '2px solid #1C1D21', paddingBottom: '20px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#4A85F6', letterSpacing: '0.5px' }}>OFFICIÁLNÍ VÝKAZ PRO OSPOD</span>
                <h1 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#1C1D21', margin: '4px 0 0 0' }}>
                  Zpráva o průběhu výkonu pěstounské péče
                </h1>
                <span style={{ fontSize: '13px', color: '#8181A5' }}>Podle § 47b Zákona č. 359/1999 Sb. o sociálně-právní ochraně dětí</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#8181A5' }}>
                <div>Datum generování: {new Date(report.generatedAt).toLocaleDateString('cs-CZ')}</div>
                <div>ID Zprávy: {report.reportId}</div>
              </div>
            </div>

            {/* Identifikace subjektů */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div style={{ backgroundColor: '#F7F9FC', padding: '16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#8181A5' }}>DOPROVÁZEJÍCÍ ORGANIZACE</span>
                <h3 style={{ margin: '4px 0', fontSize: '15px', fontWeight: 700 }}>{report.organizationName}</h3>
                <div style={{ fontSize: '13px', color: '#8181A5' }}>Klíčová osoba: {report.assignedKoName}</div>
              </div>

              <div style={{ backgroundColor: '#F7F9FC', padding: '16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#8181A5' }}>PĚSTOUNSKÁ RODINA</span>
                <h3 style={{ margin: '4px 0', fontSize: '15px', fontWeight: 700 }}>{report.fosterParents}</h3>
                <div style={{ fontSize: '13px', color: '#8181A5' }}>UID Spisu: {report.familyUid}</div>
              </div>
            </div>

            {/* Přehled dětí v péči */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '12px', color: '#1C1D21' }}>
                Děti v pěstounské péči
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ECECF2', color: '#8181A5', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Jméno a příjmení</th>
                    <th style={{ padding: '8px' }}>Rodné číslo</th>
                    <th style={{ padding: '8px' }}>Datum narození</th>
                    <th style={{ padding: '8px' }}>Příslušný OSPOD</th>
                  </tr>
                </thead>
                <tbody>
                  {report.children.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #ECECF2' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 700 }}>{c.name}</td>
                      <td style={{ padding: '10px 8px' }}>{c.rc}</td>
                      <td style={{ padding: '10px 8px' }}>{c.birthDate}</td>
                      <td style={{ padding: '10px 8px' }}>{c.ospodNode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Plnění zákonných povinností (Bi-monthly návštěvy & Vzdělávání) */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '12px', color: '#1C1D21' }}>
                Vyhodnocení plnění zákonných povinností
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : '1fr 1fr', gap: '16px' }}>
                <div style={{ border: '1px solid #27B973', backgroundColor: 'rgba(124,231,172,0.1)', padding: '16px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#27B973' }}>OSOBNÍ KONTAKT KO S RODINOU</span>
                  <h4 style={{ margin: '4px 0', fontSize: '18px', fontWeight: 800, color: '#1C1D21' }}>
                    {report.statutoryCompliance.completedBiMonthlyVisits} / {report.statutoryCompliance.requiredBiMonthlyVisits} návštěv
                  </h4>
                  <span style={{ fontSize: '12px', color: '#27B973', fontWeight: 700 }}>{report.statutoryCompliance.visitComplianceStatus}</span>
                </div>

                <div style={{ border: '1px solid #27B973', backgroundColor: 'rgba(124,231,172,0.1)', padding: '16px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#27B973' }}>POVINNÉ VZDĚLÁVÁNÍ PĚSTOUNŮ</span>
                  <h4 style={{ margin: '4px 0', fontSize: '18px', fontWeight: 800, color: '#1C1D21' }}>
                    {report.statutoryCompliance.completedEducationHours} / {report.statutoryCompliance.requiredEducationHours} hod.
                  </h4>
                  <span style={{ fontSize: '12px', color: '#27B973', fontWeight: 700 }}>{report.statutoryCompliance.educationComplianceStatus}</span>
                </div>
              </div>
            </div>

            {/* Závěrečné hodnocení klíčové osoby */}
            <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1C1D21', margin: '0 0 6px 0' }}>Slovní hodnocení vývoje dětí</h4>
                <p style={{ fontSize: '13px', color: '#1C1D21', backgroundColor: '#F7F9FC', padding: '12px', borderRadius: '8px', margin: 0, lineHeight: '1.5' }}>
                  {report.assessmentSummary.childDevelopment}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1C1D21', margin: '0 0 6px 0' }}>Spolupráce s pěstouny a využití respitu</h4>
                <p style={{ fontSize: '13px', color: '#1C1D21', backgroundColor: '#F7F9FC', padding: '12px', borderRadius: '8px', margin: 0, lineHeight: '1.5' }}>
                  {report.assessmentSummary.fosterParentsEvaluation}
                </p>
              </div>
            </div>

            {/* Podpisy */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #ECECF2' }}>
              <div>
                <div style={{ borderBottom: '1px solid #1C1D21', width: '200px', marginBottom: '6px' }}></div>
                <span style={{ fontSize: '12px', color: '#8181A5' }}>Podpis Klíčové osoby</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ borderBottom: '1px solid #1C1D21', width: '200px', marginBottom: '6px', marginLeft: 'auto' }}></div>
                <span style={{ fontSize: '12px', color: '#8181A5' }}>Razítko a podpis vedení organizace</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default OspodReportView;
