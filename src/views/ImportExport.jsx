import React, { useState } from 'react';
import { parseImportFile, createImportJob, commitImportJob, rollbackImportJob, exportOrganizationData, encryptDataAES256 } from '../services/importService';

export function ImportExport({ user }) {
  const [activeTab, setActiveTab] = useState('import');
  const [selectedFile, setSelectedFile] = useState(null);
  const [stagedJob, setStagedJob] = useState(null);
  const [stagedRows, setStagedRows] = useState([]);
  const [importHistory, setImportHistory] = useState([
    {
      jobId: 'import_1720000000000',
      filename: 'Seznam_rodin_2026.xlsx',
      status: 'committed',
      totalRecords: 12,
      createdAt: '2026-07-01T10:00:00Z',
      expiresAt: '2026-07-31T10:00:00Z',
      createdDocUids: ['9900010000013', '9900010000026']
    }
  ]);
  const [loadingImport, setLoadingImport] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [encryptedOutput, setEncryptedOutput] = useState('');
  const [message, setMessage] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setLoadingImport(true);
    setMessage(null);

    try {
      const parsedData = await parseImportFile(file);
      const job = createImportJob(file.name, parsedData);
      setStagedJob(job);
      setStagedRows(parsedData);
      setMessage({ type: 'success', text: `Soubor načten: ${parsedData.length} záznamů v mezipaměti.` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Chyba při čtení souboru: ' + err.message });
    } finally {
      setLoadingImport(false);
    }
  };

  const handleCommit = () => {
    if (!stagedJob) return;
    const committed = commitImportJob(stagedJob.jobId, stagedRows);
    setImportHistory(prev => [committed, ...prev]);
    setStagedJob(null);
    setStagedRows([]);
    setMessage({ type: 'success', text: 'Importované spisy byly zapsány do databáze.' });
  };

  const handleRollback = (jobId) => {
    rollbackImportJob(jobId);
    setImportHistory(prev => prev.map(item => item.jobId === jobId ? { ...item, status: 'rolled_back' } : item));
    setMessage({ type: 'success', text: 'Import byl odvolán a data byla vrácena do původního stavu.' });
  };

  const handleExportBackup = () => {
    if (!passphrase) {
      alert("Zadejte heslo pro zašifrování zálohy.");
      return;
    }
    const data = exportOrganizationData(user?.organizationId || '0001');
    const encrypted = encryptDataAES256(data, passphrase);
    setEncryptedOutput(encrypted);
    setMessage({ type: 'success', text: 'AES-256 Šifrovaná záloha byla vygenerována.' });
  };

  return (
    <div className="routine-page-container font-sans">
      {message && (
        <div className={`routine-card p-3 text-xs font-medium routine-flex-center ${
          message.type === 'error' ? 'bg-[var(--routine-coral-light)] text-[var(--routine-coral)] border-[var(--routine-coral)]' : 'bg-[var(--routine-green-light)] text-[var(--routine-green)] border-[var(--routine-green)]'
        }`}>
          <i className={message.type === 'error' ? 'las la-exclamation-circle text-base' : 'las la-check-circle text-base'} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Routine Header */}
      <div className="routine-flex-between pb-3 border-b border-[#f0f0f4]">
        <div>
          <h1 className="routine-header-title">
            Import, Export & Šifrované Zálohy
          </h1>
          <p className="routine-header-sub">
            Migrace dat z Excelu/CSV, správa 30denního odvolání a zálohy AES-256 | Routine.co Workspace
          </p>
        </div>

        <span className="routine-badge routine-badge-coral font-mono text-xs">
          Šifrování AES-256
        </span>
      </div>

      {/* Routine Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#f0f0f4]">
        {[
          { id: 'import', label: 'Import z Excelu / CSV', icon: 'las la-file-excel' },
          { id: 'backup', label: 'AES-256 Šifrované zálohy', icon: 'las la-lock' },
          { id: 'history', label: 'Historie & Odvolání (Rollback)', icon: 'las la-history' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-white text-[var(--routine-coral)] border-t-2 border-[var(--routine-coral)] border-x border-[#f0f0f4]'
                : 'text-[var(--routine-text-secondary)] hover:text-[var(--routine-text-primary)] hover:bg-[#f8f8fa]'
            }`}
          >
            <i className={tab.icon} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Import */}
      {activeTab === 'import' && (
        <div className="routine-card p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[var(--routine-text-primary)]">
              Nahrání datového souboru (XLSX, CSV)
            </h3>
            <p className="text-xs text-[var(--routine-text-secondary)]">
              Systém automaticky spáruje sloupce s rodinnými spisy a vytvoří spise v režimu náhledu.
            </p>
          </div>

          <div className="p-8 border-2 border-dashed border-[#e2e4e8] rounded-xl text-center bg-[#f9f9fb] space-y-3">
            <i className="las la-cloud-upload-alt text-3xl text-[var(--routine-coral)]" />
            <div>
              <label className="routine-btn-primary cursor-pointer text-xs">
                <span>Vybrat soubor Excel / CSV</span>
                <input type="file" accept=".xlsx, .csv" onChange={handleFileSelect} className="hidden" />
              </label>
            </div>
            {selectedFile && (
              <p className="text-xs font-mono font-semibold text-[var(--routine-text-primary)]">
                Vybráno: {selectedFile.name}
              </p>
            )}
          </div>

          {stagedJob && stagedRows.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#f0f0f4]">
              <div className="routine-flex-between">
                <h4 className="text-xs font-bold text-[var(--routine-text-primary)]">
                  Náhled dat k importu ({stagedRows.length} řádků)
                </h4>
                <button className="routine-btn-primary" onClick={handleCommit}>
                  Potvrdit a zapsat do databáze
                </button>
              </div>

              <div className="routine-table-container">
                <table className="routine-table">
                  <thead>
                    <tr>
                      <th>Pěstouni</th>
                      <th>Děti</th>
                      <th>Stav</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stagedRows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="font-semibold text-xs">{row.fosterParents || row.name || 'Pěstouni'}</td>
                        <td className="text-xs font-mono">{row.childrenCount || 1} dětí</td>
                        <td><span className="routine-badge routine-badge-green">Připraveno</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Backup */}
      {activeTab === 'backup' && (
        <div className="routine-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[var(--routine-text-primary)]">
            Generování AES-256 Šifrované Zálohy
          </h3>
          <p className="text-xs text-[var(--routine-text-secondary)]">
            Zadejte tajné heslo pro zašifrování kompletní databáze organizace.
          </p>

          <div className="w-full sm:w-96 space-y-3">
            <input
              type="password"
              className="routine-input"
              placeholder="Zadejte tajné heslo zálohy..."
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
            />

            <button className="routine-btn-primary w-full justify-center" onClick={handleExportBackup}>
              <i className="las la-lock text-base" />
              Stáhnout šifrovanou zálohu (.enc)
            </button>
          </div>

          {encryptedOutput && (
            <div className="pt-4 border-t border-[#f0f0f4] space-y-2">
              <span className="text-xs font-bold text-[var(--routine-text-primary)]">Zašifrovaný datový řetězec:</span>
              <textarea className="routine-input font-mono text-[11px] h-32 resize-none" readOnly value={encryptedOutput} />
            </div>
          )}
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div className="routine-table-container">
          <div className="p-4 border-b border-[#e8e8ed] routine-flex-between">
            <h3 className="text-sm font-bold text-[var(--routine-text-primary)]">Historie importů & Režim odvolání (30 dnů)</h3>
          </div>
          <table className="routine-table">
            <thead>
              <tr>
                <th>ID Jobu</th>
                <th>Soubor</th>
                <th>Počet záznamů</th>
                <th>Datum importu</th>
                <th>Stav</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {importHistory.map(item => (
                <tr key={item.jobId}>
                  <td className="font-mono text-xs font-bold text-[var(--routine-coral)]">{item.jobId}</td>
                  <td className="text-xs font-medium">{item.filename}</td>
                  <td className="font-mono text-xs">{item.totalRecords}</td>
                  <td className="font-mono text-xs text-[var(--routine-text-secondary)]">
                    {new Date(item.createdAt).toLocaleDateString('cs-CZ')}
                  </td>
                  <td>
                    <span className={`routine-badge ${item.status === 'committed' ? 'routine-badge-green' : 'routine-badge-yellow'}`}>
                      {item.status === 'committed' ? 'Zapsáno' : 'Odvoláno'}
                    </span>
                  </td>
                  <td>
                    {item.status === 'committed' && (
                      <button className="routine-btn-secondary text-xs py-1 px-2.5" onClick={() => handleRollback(item.jobId)}>
                        Odvolat import
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ImportExport;
