import React, { useState, useEffect } from 'react';
import { parseIpodFromOspod, saveIpodVersion, getStoredIpodHistory } from '../../services/ipodParserService';

export function IPodManager({ family, isMobileView }) {
  const [history, setHistory] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState(null);
  const [ipodFileText, setIpodFileText] = useState('');

  useEffect(() => {
    const list = getStoredIpodHistory(family?.uid || '9900010000013');
    setHistory(list);
    if (list.length > 0) {
      setSelectedVersion(list[0]);
    }
  }, [family]);

  const handleSimulateIpodUpload = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const parsed = await parseIpodFromOspod(ipodFileText || 'Nové vydání IPOD 2026-2027 od OSPOD', family?.uid);
      const saved = await saveIpodVersion(family?.uid, parsed);
      const updatedList = getStoredIpodHistory(family?.uid);
      setHistory(updatedList);
      setSelectedVersion(saved);
      setUploadSuccessMsg(`Nové vydání IPODu (${saved.version}) bylo úspěšně nahráno a AI z něj přepsala požadavky OSPODu.`);
      setIpodFileText('');
      setTimeout(() => setUploadSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  if (!selectedVersion) return null;

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      padding: isMobileView ? '20px' : '32px',
      boxShadow: '0 2px 12px rgba(154,160,185,0.08)',
      marginTop: '24px',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Hlavička modulu IPOD */}
      <div style={{
        display: 'flex',
        flexDirection: isMobileView ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobileView ? 'flex-start' : 'center',
        gap: '16px',
        marginBottom: '24px',
        paddingBottom: '20px',
        borderBottom: '2px solid #ECECF2'
      }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#4A85F6', letterSpacing: '0.5px' }}>
            OSPOD REGISTR A AI PARSER
          </span>
          <h2 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#1C1D21', margin: '4px 0 0 0' }}>
            Individuální plán ochrany dítěte (IPOD) vydaný OSPODem
          </h2>
          <span style={{ fontSize: '13px', color: '#8181A5' }}>
            Doprovázející organizace se řídí požadavky OSPODu a přizpůsobuje jim svou činnost.
          </span>
        </div>

        {/* Přepínač verze IPODu v čase */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#8181A5' }}>Verze IPODu od OSPODu:</label>
          <select
            value={selectedVersion.version}
            onChange={(e) => {
              const found = history.find(h => h.version === e.target.value);
              if (found) setSelectedVersion(found);
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #E0E0E8',
              fontWeight: 700,
              fontSize: '13px',
              backgroundColor: '#F7F9FC'
            }}
          >
            {history.map((h) => (
              <option key={h.ipodId} value={h.version}>
                {h.version} ({new Date(h.issueDate).toLocaleDateString('cs-CZ')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {uploadSuccessMsg && (
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(124,231,172,0.15)',
          border: '1px solid #27B973',
          borderRadius: '12px',
          color: '#27B973',
          fontWeight: 700,
          marginBottom: '20px'
        }}>
          {uploadSuccessMsg}
        </div>
      )}

      {/* Formulář pro nahrání nového IPODu od OSPODu */}
      <div style={{
        backgroundColor: '#F7F9FC',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '28px',
        border: '1px dashed #4A85F6'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 800, color: '#1C1D21' }}>
          Nahrát nové/aktualizované vydání IPODu od OSPODu
        </h4>
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#8181A5' }}>
          Vložte text nebo naskenované vydání nového IPODu. AI automaticky přečte cíl a povinnosti a přenastaví doprovázení rodiny.
        </p>

        <form onSubmit={handleSimulateIpodUpload} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <textarea
            rows={2}
            value={ipodFileText}
            onChange={(e) => setIpodFileText(e.target.value)}
            placeholder="Vložte text nebo poznámky z nového rozsudku / IPODu od OSPODu..."
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E0E0E8', fontSize: '13px' }}
          />

          <button
            type="submit"
            disabled={isUploading}
            style={{
              alignSelf: 'flex-start',
              backgroundColor: '#4A85F6',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <i className="las la-file-upload"></i>
            <span>{isUploading ? 'AI Přepisuje IPOD...' : 'Nahrát a AI Přepsat nový IPOD'}</span>
          </button>
        </form>
      </div>

      {/* Detail vybrané verze IPODu */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : '1fr 1fr', gap: '24px' }}>
        {/* Levý blok: Základní náležitosti a AI Shrnutí OSPODu */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECECF2', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#8181A5' }}>VYDANÉ OSPODEM</span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#4A85F6', backgroundColor: '#EBF2FE', padding: '2px 8px', borderRadius: '6px' }}>
              Verze {selectedVersion.version}
            </span>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1C1D21', margin: '0 0 6px 0' }}>
            {selectedVersion.issuedByOspod}
          </h3>
          <div style={{ fontSize: '12px', color: '#8181A5', marginBottom: '16px' }}>
            Platnost: {new Date(selectedVersion.issueDate).toLocaleDateString('cs-CZ')} — {new Date(selectedVersion.validUntil).toLocaleDateString('cs-CZ')}
          </div>

          <div style={{ backgroundColor: '#F7F9FC', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#4A85F6' }}>AI ANOTACE & SHRNUTÍ OSPODU</span>
            <p style={{ fontSize: '13px', color: '#1C1D21', margin: '4px 0 0 0', lineHeight: '1.4' }}>
              {selectedVersion.aiSummaryNote}
            </p>
          </div>

          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1C1D21', margin: '0 0 8px 0' }}>
            Zákonné cíle stanovené OSPODem:
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#1C1D21', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {selectedVersion.statutoryGoals.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>

        {/* Pravý blok: Povinné úkoly a lhůty pro rodinu i KO */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECECF2', borderRadius: '12px', padding: '20px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#8181A5' }}>POVINNÁ OPATŘENÍ K REALIZACI</span>
          <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1C1D21', margin: '4px 0 16px 0' }}>
            Akční plán podle IPODu OSPODu
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {selectedVersion.mandatoryActions.map((act) => (
              <div key={act.id} style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#F7F9FC',
                borderLeft: act.status === 'completed' ? '4px solid #27B973' : '4px solid #4A85F6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#1C1D21' }}>{act.title}</h5>
                  <span style={{ fontSize: '11px', color: '#8181A5' }}>Termín OSPOD: {new Date(act.deadline).toLocaleDateString('cs-CZ')}</span>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: act.status === 'completed' ? '#27B973' : '#4A85F6',
                  backgroundColor: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid #ECECF2'
                }}>
                  {act.status === 'completed' ? 'Splněno' : 'V řešení'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default IPodManager;
