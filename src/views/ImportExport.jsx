import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/navigation/Sidebar.jsx';
import { TopBar } from '../components/navigation/TopBar.jsx';
import { parseImportFile, createImportJob, commitImportJob, rollbackImportJob, exportOrganizationData, encryptDataAES256, decryptDataAES256 } from '../services/importService';

export function ImportExport({ user, onNavigate, isMobileView }) {
  const [activeTab, setActiveTab] = useState('import');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Stavy pro Import
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

  // Stavy pro Šifrované Zálohy (AES-256)
  const [passphrase, setPassphrase] = useState('');
  const [encryptedOutput, setEncryptedOutput] = useState('');
  const [decryptInput, setDecryptInput] = useState('');
  const [decryptPassphrase, setDecryptPassphrase] = useState('');
  const [decryptedResult, setDecryptedResult] = useState(null);

  // Stavy pro Exit Transfer & Účetní přístup
  const [targetOrgCode, setTargetOrgCode] = useState('');
  const [transferFamilyUid, setTransferFamilyUid] = useState('9900010000013');
  const [smsCode, setSmsCode] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const [message, setMessage] = useState(null);

  // Handlery pro Import
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setLoadingImport(true);
    setMessage(null);

    try {
      const rows = await parseImportFile(file);
      const orgId = user?.organizationId || '0001';
      const { jobData, stagedRows: rowsResult } = await createImportJob(orgId, file.name, rows);
      
      setStagedJob(jobData);
      setStagedRows(rowsResult);
    } catch (err) {
      setMessage({ type: 'error', text: 'Chyba při čtení souboru: ' + err.message });
    } finally {
      setLoadingImport(false);
    }
  };

  const handleCommitImport = async () => {
    if (!stagedJob) return;
    setLoadingImport(true);
    try {
      const orgId = user?.organizationId || '0001';
      const res = await commitImportJob(stagedJob.jobId, orgId);
      
      setMessage({ type: 'success', text: `Import byl úspěšně dokončen. Vytvořeno ${res.count} nových spisů.` });
      
      // Aktualizace historie
      setImportHistory(prev => [
        { ...stagedJob, status: 'committed', createdDocUids: res.createdDocUids },
        ...prev
      ]);

      setStagedJob(null);
      setStagedRows([]);
      setSelectedFile(null);
    } catch (err) {
      setMessage({ type: 'error', text: 'Chyba při zapisování importu: ' + err.message });
    } finally {
      setLoadingImport(false);
    }
  };

  const handleRollback = async (jobId) => {
    if (!window.confirm("Opravdu si přejete vrátit tento import? Záznamy vytvořené z této úlohy budou smazány.")) return;
    try {
      const res = await rollbackImportJob(jobId);
      setMessage({ type: 'success', text: `Import byl vrácen. Smazáno ${res.removedCount} spisů.` });
      
      setImportHistory(prev => prev.map(item => 
        item.jobId === jobId ? { ...item, status: 'rolled_back' } : item
      ));
    } catch (err) {
      setMessage({ type: 'error', text: 'Rollback selhal: ' + err.message });
    }
  };

  // Handlery pro Šifrované Zálohy
  const handleGenerateBackup = async () => {
    if (!passphrase || passphrase.length < 6) {
      alert("Zadejte šifrovací heslo (minimálně 6 znaků).");
      return;
    }
    try {
      const orgId = user?.organizationId || '0001';
      const data = await exportOrganizationData(orgId);
      const enc = encryptDataAES256(data, passphrase);
      setEncryptedOutput(enc);
      setMessage({ type: 'success', text: 'AES-256 šifrovaná záloha byla úspěšně vygenerována.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Generování zálohy selhalo: ' + err.message });
    }
  };

  const handleDownloadBackupFile = () => {
    if (!encryptedOutput) return;
    const blob = new Blob([encryptedOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_org_${user?.organizationId || '0001'}_${Date.now()}.aes`;
    a.click();
  };

  const handleDecryptBackup = () => {
    try {
      const res = decryptDataAES256(decryptInput, decryptPassphrase);
      setDecryptedResult(res);
      setMessage({ type: 'success', text: 'Záloha byla úspěšně dešifrována.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Handlery pro Exit Transfer
  const handleSendSMS2FA = () => {
    if (!targetOrgCode || targetOrgCode.length !== 4) {
      alert("Zadejte platný 4místný kód cílové organizace.");
      return;
    }
    setSmsSent(true);
    setMessage({ type: 'success', text: 'Simulovaný 2FA kód byl zaslán na váš telefon: 849201' });
  };

  const handleConfirmExitTransfer = () => {
    if (smsCode !== '849201') {
      alert("Neplatný SMS ověřovací kód.");
      return;
    }
    setTransferSuccess(true);
    setMessage({ type: 'success', text: `Spis ${transferFamilyUid} byl bezpečně převeden na organizaci ${targetOrgCode}. Vytvořeno podepsané potvrzení.` });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'var(--surface-page)',
      fontFamily: 'var(--font-body)',
      overflow: 'hidden'
    }}>
      {/* 1. Sidebar */}
      <Sidebar 
        activePage="import-export" 
        onNavigate={onNavigate}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isMobile={isMobileView}
      />

      {/* 2. Druhá úroveň navigačního menu pro správy dat */}
      <div style={{
        width: '260px',
        height: '100%',
        backgroundColor: '#fff',
        borderRight: '1px solid rgb(240,240,243)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        <div style={{ padding: '28px 24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'rgb(28,29,33)', margin: 0 }}>
            Správa dat
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 8px', gap: '4px' }}>
          {[
            { id: 'import', label: 'Import dat a Staging', icon: 'las la-file-import' },
            { id: 'backup', label: 'Šifrované zálohy (AES-256)', icon: 'las la-shield-alt' },
            { id: 'transfer', label: 'Exit Transfer a Účetnictví', icon: 'las la-exchange-alt' }
          ].map(sec => {
            const isActive = activeTab === sec.id;
            return (
              <div
                key={sec.id}
                onClick={() => {
                  setActiveTab(sec.id);
                  setMessage(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'rgba(94,129,244,0.08)' : 'transparent',
                  color: isActive ? 'rgb(28,29,33)' : 'rgb(129,129,165)',
                  fontWeight: isActive ? 700 : 600,
                  transition: 'background-color 0.2s'
                }}
              >
                <i className={sec.icon} style={{ fontSize: '18px' }}></i>
                <span style={{ fontSize: '15px' }}>{sec.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Hlavní obsahová část */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        height: '100%',
        overflow: 'hidden'
      }}>
        <TopBar 
          user={user} 
          title="Import, Export a Zálohy" 
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          isMobile={isMobileView}
        />

        <div style={{ padding: '40px', overflowY: 'auto', flexGrow: 1 }}>
          {message && (
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              backgroundColor: message.type === 'error' ? 'rgba(255,128,139,0.1)' : 'rgba(124,231,172,0.1)',
              border: `1px solid ${message.type === 'error' ? 'var(--status-error)' : 'var(--status-success)'}`,
              color: message.type === 'error' ? 'var(--status-error)' : 'var(--status-success)',
              fontWeight: 'bold'
            }}>
              {message.text}
            </div>
          )}

          {/* TAB 1: IMPORT A STAGING */}
          {activeTab === 'import' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px' }}>
              <div style={{
                backgroundColor: 'var(--surface-card)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '36px'
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
                  Hromadný import z Excel / CSV
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: 'var(--text-body)' }}>
                  Nahrajte tabulku se spisy a rodinami. Před zápisem do produkční databáze proběhne automatická validace v mezikroku (Staging). Každý import lze během 30 dnů vrátit (Rollback).
                </p>

                {/* Drag and Drop Upload Box */}
                <div style={{
                  border: '2px dashed var(--border-strong)',
                  borderRadius: '12px',
                  padding: '40px',
                  textAlign: 'center',
                  backgroundColor: 'var(--surface-page)',
                  cursor: 'pointer',
                  marginBottom: '28px'
                }}>
                  <i className="las la-cloud-upload-alt" style={{ fontSize: '48px', color: 'var(--accent-primary)', marginBottom: '12px' }}></i>
                  <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    {selectedFile ? selectedFile.name : 'Vyberte nebo přetáhněte soubor Excel (.xlsx) nebo CSV'}
                  </p>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="excel-file-input"
                  />
                  <label
                    htmlFor="excel-file-input"
                    style={{
                      display: 'inline-block',
                      backgroundColor: 'var(--accent-primary)',
                      color: '#fff',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Procházet počítač
                  </label>
                </div>

                {/* Náhled staging dat */}
                {stagedJob && (
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                      Staging náhled úlohy: {stagedJob.filename} (Platných: {stagedJob.validRecords} / Neplatných: {stagedJob.invalidRecords})
                    </h3>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-strong)', color: 'var(--text-secondary)' }}>
                          <th style={{ textAlign: 'left', padding: '10px' }}>Pěstouni / Kontakt</th>
                          <th style={{ textAlign: 'left', padding: '10px' }}>Rodné číslo</th>
                          <th style={{ textAlign: 'left', padding: '10px' }}>Stav</th>
                          <th style={{ textAlign: 'center', padding: '10px' }}>Počet dětí</th>
                          <th style={{ textAlign: 'left', padding: '10px' }}>Validace</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stagedRows.map((r) => (
                          <tr key={r.rowId} style={{ borderBottom: '1px solid var(--border-default)' }}>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{r.parsed.fosterParents}</td>
                            <td style={{ padding: '10px' }}>{r.parsed.rc || '—'}</td>
                            <td style={{ padding: '10px' }}>{r.parsed.status}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>{r.parsed.childrenCount}</td>
                            <td style={{ padding: '10px' }}>
                              {r.isValid ? (
                                <span style={{ color: 'var(--status-success)', fontWeight: 'bold' }}>OK (Připraveno)</span>
                              ) : (
                                <span style={{ color: 'var(--status-error)', fontWeight: 'bold' }}>Chyba: {r.errors.join(', ')}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                      <button
                        onClick={() => setStagedJob(null)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Zrušit
                      </button>
                      <button
                        onClick={handleCommitImport}
                        disabled={loadingImport || stagedJob.validRecords === 0}
                        style={{
                          backgroundColor: 'var(--accent-primary)',
                          color: '#fff',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Potvrdit a zapsat do databáze
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Přehled minulých importů a 30denní rollback */}
              <div style={{
                backgroundColor: 'var(--surface-card)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '36px'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                  Historie importů a 30denní okno pro navrácení (Rollback)
                </h3>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-strong)', color: 'var(--text-secondary)' }}>
                      <th style={{ textAlign: 'left', padding: '12px' }}>Název souboru</th>
                      <th style={{ textAlign: 'left', padding: '12px' }}>Datum importu</th>
                      <th style={{ textAlign: 'center', padding: '12px' }}>Počet záznamů</th>
                      <th style={{ textAlign: 'left', padding: '12px' }}>Stav</th>
                      <th style={{ textAlign: 'right', padding: '12px' }}>Akce</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importHistory.map((item) => (
                      <tr key={item.jobId} style={{ borderBottom: '1px solid var(--border-default)' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.filename}</td>
                        <td style={{ padding: '12px' }}>{new Date(item.createdAt).toLocaleString('cs-CZ')}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{item.totalRecords}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor: item.status === 'committed' ? 'rgba(124,231,172,0.15)' : 'rgba(255,128,139,0.15)',
                            color: item.status === 'committed' ? 'var(--status-success)' : 'var(--status-error)'
                          }}>
                            {item.status === 'committed' ? 'Zapsáno' : 'Vraceno (Rollback)'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {item.status === 'committed' && (
                            <button
                              onClick={() => handleRollback(item.jobId)}
                              style={{
                                backgroundColor: 'transparent',
                                color: 'var(--status-error)',
                                border: '1px solid var(--status-error)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                              }}
                            >
                              Vrátit import (Rollback)
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ŠIFROVANÉ ZÁLOHY (AES-256) */}
          {activeTab === 'backup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '900px' }}>
              <div style={{
                backgroundColor: 'var(--surface-card)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '36px'
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
                  Generátor šifrovaných záloh (AES-256)
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: 'var(--text-body)' }}>
                  Vygenerujte si kompletní zálohu všech dat vaší organizace. Data jsou před stažením zašifrována symetrickou šifrou AES-256 na základě vašeho hesla.
                </p>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: 'var(--text-caption)', marginBottom: '8px' }}>
                    Šifrovací heslo zálohy (min. 6 znaků)
                  </label>
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-strong)',
                      fontSize: '15px'
                    }}
                  />
                </div>

                <button
                  onClick={handleGenerateBackup}
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginBottom: '20px'
                  }}
                >
                  Vygenerovat AES-256 zálohu
                </button>

                {encryptedOutput && (
                  <div style={{
                    marginTop: '20px',
                    padding: '20px',
                    backgroundColor: 'var(--surface-page)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-strong)'
                  }}>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Zašifrovaný datový balíček připraven</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', wordBreak: 'break-all', marginBottom: '16px' }}>
                      {encryptedOutput.substring(0, 100)}...
                    </p>
                    <button
                      onClick={handleDownloadBackupFile}
                      style={{
                        backgroundColor: 'var(--status-success)',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Stáhnout šifrovaný soubor (.aes)
                    </button>
                  </div>
                )}
              </div>

              {/* Dešifrování zálohy */}
              <div style={{
                backgroundColor: 'var(--surface-card)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '36px'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                  Kontrola a dešifrování záložního souboru
                </h3>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '12px', marginBottom: '6px' }}>Zašifrovaný text zálohy (AES-256)</label>
                  <textarea
                    value={decryptInput}
                    onChange={(e) => setDecryptInput(e.target.value)}
                    placeholder="Vložte zašifrovaný obsah souboru..."
                    rows={4}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '12px', marginBottom: '6px' }}>Heslo pro dešifrování</label>
                  <input
                    type="password"
                    value={decryptPassphrase}
                    onChange={(e) => setDecryptPassphrase(e.target.value)}
                    placeholder="••••••••••••"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <button
                  onClick={handleDecryptBackup}
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Dešifrovat a zkontrolovat
                </button>

                {decryptedResult && (
                  <pre style={{
                    marginTop: '20px',
                    padding: '16px',
                    backgroundColor: 'var(--surface-page)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    {JSON.stringify(decryptedResult, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: EXIT TRANSFER A ÚČETNICTVÍ */}
          {activeTab === 'transfer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '900px' }}>
              <div style={{
                backgroundColor: 'var(--surface-card)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '36px'
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
                  Exit Transfer (Bezplatné předání spisu s SMS 2FA)
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: 'var(--text-body)' }}>
                  Protokol pro bezpečné předání spisu rodiny a dítěte jiné doprovázející organizaci v případě ukončení dohody. Převod vyžaduje 2FA dvoufaktorové potvrzení přes SMS.
                </p>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '12px', marginBottom: '6px' }}>UID Předávaného spisu</label>
                    <input
                      type="text"
                      value={transferFamilyUid}
                      onChange={(e) => setTransferFamilyUid(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '12px', marginBottom: '6px' }}>4místný kód nové organizace</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={targetOrgCode}
                      onChange={(e) => setTargetOrgCode(e.target.value)}
                      placeholder="Např. 0042"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                    />
                  </div>
                </div>

                {!smsSent ? (
                  <button
                    onClick={handleSendSMS2FA}
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Odeslat SMS 2FA ověřovací kód
                  </button>
                ) : (
                  <div style={{
                    padding: '20px',
                    backgroundColor: 'var(--surface-page)',
                    borderRadius: '8px',
                    border: '1px solid var(--accent-primary)'
                  }}>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>
                      Zadejte 6místný SMS kód (Zadejte testovací kód: 849201)
                    </label>
                    <input
                      type="text"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                      placeholder="849201"
                      style={{ width: '200px', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-strong)', marginRight: '16px' }}
                    />
                    <button
                      onClick={handleConfirmExitTransfer}
                      style={{
                        backgroundColor: 'var(--status-success)',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Potvrdit a předat spis
                    </button>
                  </div>
                )}
              </div>

              {/* Přístup pro externí účetní */}
              <div style={{
                backgroundColor: 'var(--surface-card)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '36px'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
                  Zjednodušený přístup pro externí účetní
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: 'var(--text-body)' }}>
                  Generujte zjednodušený export podkladů pro státní příspěvek (SPVPP) a respitní výdaje pro potřeby externího účetního.
                </p>

                <button
                  onClick={() => alert("Stahuji přehled výdajů SPVPP pro účetní (Excel)...")}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--accent-primary)',
                    border: '1px solid var(--accent-primary)',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Stáhnout účetní výkaz SPVPP (Excel)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default ImportExport;
