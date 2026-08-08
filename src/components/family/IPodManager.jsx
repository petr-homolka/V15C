import React, { useState, useEffect } from 'react';
import { parseIpodFromOspod, saveIpodVersion, getStoredIpodHistory } from '../../services/ipodParserService';

export function IPodManager({ family }) {
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
      setUploadSuccessMsg(`Nové vydání IPODu (${saved.version}) bylo úspěšně vytvořeno a zapsáno.`);
      setIpodFileText('');
      setTimeout(() => setUploadSuccessMsg(null), 5000);
    } catch {
      // Fallback
    } finally {
      setIsUploading(false);
    }
  };

  if (!selectedVersion) return null;

  return (
    <div className="space-y-6 font-sans">
      {uploadSuccessMsg && (
        <div className="routine-card p-3 bg-[var(--routine-green-light)] border-[var(--routine-green)] text-[var(--routine-green)] text-xs font-medium routine-flex-center">
          <i className="las la-check-circle text-base" />
          <span>{uploadSuccessMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="routine-flex-between pb-3 border-b border-[#f0f0f4]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[var(--routine-text-primary)]">
              IPOD — Individuální plán ochrany dítěte
            </h2>
            <span className="routine-badge routine-badge-coral font-mono text-xs">
              Verze: {selectedVersion.version}
            </span>
          </div>
          <p className="text-xs text-[var(--routine-text-secondary)] mt-0.5">
            Zákonné požadavky OSPOD a cíle doprovázení | Routine.co Format
          </p>
        </div>

        <div className="routine-flex-center">
          <span className="text-xs font-semibold text-[var(--routine-text-secondary)]">Verze IPODu:</span>
          <select
            value={selectedVersion.version}
            onChange={(e) => {
              const found = history.find(h => h.version === e.target.value);
              if (found) setSelectedVersion(found);
            }}
            className="routine-input text-xs py-1 px-2.5 w-auto"
          >
            {history.map(h => (
              <option key={h.version} value={h.version}>
                Verze {h.version} ({new Date(h.uploadedAt).toLocaleDateString('cs-CZ')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* New IPOD Upload Form */}
      <div className="p-4 rounded-lg bg-[#f9f9fb] border border-[#e8e8ed] space-y-3">
        <h3 className="text-xs font-bold text-[var(--routine-text-primary)]">
          Nahrát novou verzi IPODu od OSPOD
        </h3>
        <form onSubmit={handleSimulateIpodUpload} className="flex gap-2">
          <input
            type="text"
            className="routine-input flex-1"
            placeholder="Vložte text nebo naskenované zadání od OSPOD..."
            value={ipodFileText}
            onChange={(e) => setIpodFileText(e.target.value)}
          />
          <button type="submit" className="routine-btn-primary text-xs" disabled={isUploading}>
            {isUploading ? (
              <>
                <i className="las la-spinner la-spin text-base" />
                Zpracovávám...
              </>
            ) : (
              <>
                <i className="las la-file-upload text-base" />
                Zpracovat novou verzi
              </>
            )}
          </button>
        </form>
      </div>

      {/* IPOD Goals & Requirements List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[var(--routine-text-primary)] uppercase tracking-wider text-[var(--routine-text-secondary)]">
          Cíle a opatření stanovené OSPOD ({selectedVersion.goals ? selectedVersion.goals.length : 0})
        </h3>

        <div className="space-y-3">
          {selectedVersion.goals && selectedVersion.goals.map((goal, idx) => (
            <div key={goal.id || idx} className="routine-card p-4 space-y-2 border-l-4 border-l-[var(--routine-coral)]">
              <div className="routine-flex-between">
                <span className="routine-badge routine-badge-coral font-mono text-[10px]">
                  Cíl #{idx + 1}
                </span>
                <span className="text-xs font-mono text-[var(--routine-text-secondary)]">
                  Lhůta plnění: {goal.targetDate || '2026-12-31'}
                </span>
              </div>

              <h4 className="text-xs font-bold text-[var(--routine-text-primary)]">
                {goal.title || goal.text}
              </h4>

              <p className="text-xs text-[var(--routine-text-body)]">
                {goal.description || 'Průběžná podpora dítěte a vyhodnocování školní docházky.'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IPodManager;
