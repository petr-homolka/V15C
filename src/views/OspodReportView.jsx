import React, { useState, useEffect } from 'react';
import { generateOspodReport } from '../services/ospodReportService';

export function OspodReportView({ user, onNavigate }) {
  const [report, setReport] = useState(null);
  const [period, setPeriod] = useState('2026-FULL');

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

  if (!report) {
    return (
      <div className="p-8 text-center text-xs text-[var(--routine-text-secondary)] font-medium flex items-center justify-center gap-2">
        <i className="las la-spinner la-spin text-xl text-[var(--routine-coral)]" />
        Generuji zprávu pro OSPOD...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6 font-sans">
      {/* Header Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#f0f0f4]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--routine-text-primary)]">
            Generátor zpráv pro OSPOD
          </h1>
          <p className="text-xs text-[var(--routine-text-secondary)] mt-0.5">
            Zákonná agendová zpráva dle zákona č. 359/1999 Sb. | Routine.co Format
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--routine-text-secondary)]">
            <span>Období:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="routine-input text-xs py-1 px-2.5 w-auto font-medium"
            >
              <option value="2026-FULL">Rok 2026 (Celoroční zpráva)</option>
              <option value="2026-H1">Rok 2026 (1. pololetí H1)</option>
              <option value="2025-FULL">Rok 2025 (Celoroční zpráva)</option>
            </select>
          </div>

          <button className="routine-btn-primary" onClick={handlePrint}>
            <i className="las la-print text-base" />
            Tisk / Export PDF
          </button>
        </div>
      </div>

      {/* Official Report Card Container */}
      <div className="routine-card p-8 bg-white border border-[#e2e4e8] shadow-sm space-y-6">
        {/* Document Header */}
        <div className="pb-4 border-b-2 border-[var(--routine-text-primary)] flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--routine-text-primary)]">
              Zpráva o průběhu doprovázení pěstounské rodiny
            </h2>
            <p className="text-xs text-[var(--routine-text-secondary)] mt-1 font-mono">
              Spisová značka UID: <strong className="text-[var(--routine-coral)]">{report.familyUid || '9900010000013'}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="routine-badge routine-badge-coral font-mono">
              OSPOD Určeno
            </span>
            <p className="text-[11px] text-[var(--routine-text-secondary)] mt-1 font-mono">
              Datum vyhotovení: {new Date().toLocaleDateString('cs-CZ')}
            </p>
          </div>
        </div>

        {/* Section 1: Summary Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-[#f9f9fb] border border-[#e8e8ed]">
          <div>
            <span className="text-[11px] font-semibold text-[var(--routine-text-secondary)] uppercase">Doprovázející organizace</span>
            <p className="text-xs font-bold text-[var(--routine-text-primary)] mt-0.5">{report.organizationName || 'Nová Rodina o.p.s.'}</p>
            <p className="text-[11px] text-[var(--routine-text-secondary)]">Klíčový pracovník: {report.workerName || 'Mgr. Jana Nováková'}</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[var(--routine-text-secondary)] uppercase">Pěstounská rodina</span>
            <p className="text-xs font-bold text-[var(--routine-text-primary)] mt-0.5">{report.fosterParents || 'Petr a Anna Dvořákovi'}</p>
            <p className="text-[11px] text-[var(--routine-text-secondary)]">Děti v péči: {report.childrenNames ? report.childrenNames.join(', ') : 'Tomáš Dvořák, Eliška Dvořáková'}</p>
          </div>
        </div>

        {/* Section 2: Contact Log & Visits */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[var(--routine-text-primary)] border-b border-[#f0f0f4] pb-1.5 flex items-center gap-2">
            <i className="las la-calendar-check text-[var(--routine-coral)] text-base" />
            1. Povolení a přehled klíčových návštěv v rodině
          </h3>
          <p className="text-xs text-[var(--routine-text-body)] leading-relaxed">
            V hodnoceném období proběhlo celkem <strong className="font-mono">{report.visitsCount || 6}</strong> osobních kontaktů v místě bydliště pěstounské rodiny. Všechny návštěvy byly řádně zaznamenány s ověřením polohy.
          </p>
        </div>

        {/* Section 3: Fulfillment of IPOD Goals */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[var(--routine-text-primary)] border-b border-[#f0f0f4] pb-1.5 flex items-center gap-2">
            <i className="las la-tasks text-[var(--routine-blue)] text-base" />
            2. Plnění individuálního plánu ochrany dítěte (IPOD)
          </h3>
          <p className="text-xs text-[var(--routine-text-body)] leading-relaxed">
            Cíle stanovené v IPODu jsou průběžně plněny. Děti mají zajištěnou řádnou školní docházku a zdravotní péči. Rodina plně spolupracuje s doprovázející organizací.
          </p>
        </div>

        {/* Section 4: Respite & Education */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[var(--routine-text-primary)] border-b border-[#f0f0f4] pb-1.5 flex items-center gap-2">
            <i className="las la-graduation-cap text-[var(--routine-green)] text-base" />
            3. Vzdělávání a čerpání respitní péče
          </h3>
          <p className="text-xs text-[var(--routine-text-body)] leading-relaxed">
            Pěstouni absolvovali v tomto období <strong className="font-mono">{report.educationHours || 12} hodin</strong> povinného vzdělávání a vyčerpali <strong className="font-mono">{report.respitDays || 4} dny</strong> respitní péče.
          </p>
        </div>

        {/* Signatures Footer */}
        <div className="pt-8 border-t border-[#e2e4e8] grid grid-cols-2 gap-8 text-xs font-mono">
          <div>
            <p className="text-[var(--routine-text-secondary)]">Za doprovázející organizaci:</p>
            <div className="mt-8 border-b border-dashed border-[var(--routine-text-primary)] w-48" />
            <p className="mt-1 font-bold">{report.workerName || 'Mgr. Jana Nováková'}</p>
          </div>

          <div className="text-right">
            <p className="text-[var(--routine-text-secondary)]">Za příslušný orgán OSPOD:</p>
            <div className="mt-8 border-b border-dashed border-[var(--routine-text-primary)] w-48 ml-auto" />
            <p className="mt-1 font-bold">Převzato dne: ....................</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OspodReportView;
