import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Sidebar } from '../components/navigation/Sidebar.jsx';
import { TopBar } from '../components/navigation/TopBar.jsx';
import { IPodManager } from '../components/family/IPodManager.jsx';

export function FamilyFolder({ family, user, onBack, onNavigate, isMobileView }) {
  const [activeTab, setActiveTab] = useState('timeline');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [children, setChildren] = useState([]);
  
  // Stavy pro měření návštěvy
  const [visitActive, setVisitActive] = useState(false);
  const [visitStartTime, setVisitStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  // Stavy pro diktovací a AI zápisník
  const [showRecorderModal, setShowRecorderModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [showAiResult, setShowAiResult] = useState(false);
  const [sharingLevel, setSharingLevel] = useState('internal');
  const [presentMembers, setPresentMembers] = useState([]);
  const [isProcessingAi, setIsProcessingAi] = useState(false);

  // Simulovaná GPS
  const [gpsLocation, setGpsLocation] = useState(null);

  // Načtení dat spisu s trvalým ukládáním v localStorage
  useEffect(() => {
    const storageKey = `family_timeline_${family.id}`;
    const cachedTimeline = localStorage.getItem(storageKey);

    let initialTimeline = [
      {
        id: '2',
        type: 'visit',
        title: 'Pravidelná bi-monthly návštěva v rodině',
        body: 'Návštěva proběhla v pořádku. Pěstouni řeší kroužky pro děti na příští školní rok. Vše bez zjevných rizik.',
        occurredAt: '2026-06-15T14:30:00Z',
        location: '50.0755° N, 14.4378° E',
        durationSeconds: 3600,
        sharingLevel: 'internal',
        presentMembers: ['dite1', 'pestoun1']
      },
      {
        id: '1',
        type: 'system',
        title: 'Založení spisu a schválení Dohody A1',
        body: 'Spis rodiny byl úspěšně vytvořen a Dohoda o doprovázení schválena.',
        occurredAt: '2026-05-01T10:00:00Z',
        sharingLevel: 'internal'
      }
    ];

    if (cachedTimeline) {
      try {
        const parsed = JSON.parse(cachedTimeline);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialTimeline = parsed;
        }
      } catch (e) {
        console.warn("Timeline parse error");
      }
    }

    // Vždy seřadit podle data nejnovější nahoře
    const sorted = [...initialTimeline].sort((a, b) => new Date(b.occurredAt || b.date) - new Date(a.occurredAt || a.date));
    setTimeline(sorted);

    const simulatedChildren = [
      { id: 'dite1', name: 'Tomáš Dvořák', rc: '180512/4321', age: 8, school: 'ZŠ Palackého' },
      { id: 'dite2', name: 'Eliška Dvořáková', rc: '211102/8765', age: 4, school: 'MŠ Kytička' }
    ];

    setChildren(simulatedChildren);
    setPresentMembers(simulatedChildren.map(c => c.id));
    
    // Obnovení běžící návštěvy z localStorage, pokud existuje
    const savedStart = localStorage.getItem(`active_visit_${family.id}`);
    if (savedStart) {
      setVisitStartTime(new Date(savedStart));
      setVisitActive(true);
      const savedGps = localStorage.getItem(`active_visit_gps_${family.id}`);
      if (savedGps) setGpsLocation(JSON.parse(savedGps));
    }
  }, [family]);

  // Běh časovače návštěvy
  useEffect(() => {
    if (visitActive && visitStartTime) {
      timerRef.current = setInterval(() => {
        const seconds = Math.floor((new Date() - visitStartTime) / 1000);
        setElapsedTime(seconds);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [visitActive, visitStartTime]);

  // Spuštění návštěvy
  const handleStartVisit = () => {
    const startTime = new Date();
    const mockGps = { lat: 50.0755, lng: 14.4378 }; // Zjednodušená Nominatim / GPS simulace
    
    setVisitStartTime(startTime);
    setVisitActive(true);
    setGpsLocation(mockGps);

    localStorage.setItem(`active_visit_${family.id}`, startTime.toISOString());
    localStorage.setItem(`active_visit_gps_${family.id}`, JSON.stringify(mockGps));
  };

  // Ukončení návštěvy -> Otevření diktovacího modálu
  const handleStopVisit = () => {
    setVisitActive(false);
    localStorage.removeItem(`active_visit_${family.id}`);
    localStorage.removeItem(`active_visit_gps_${family.id}`);
    
    // Otevřít modal pro zápis z návštěvy a nastavit výchozí diktát
    setTranscript('Pravidelná návštěva pěstounské rodiny. Pěstouni sdělují, že děti prospívají dobře. ');
    setShowRecorderModal(true);
  };

  // Funkce simulovaného diktování (live přepis)
  const handleSimulateDiktat = () => {
    setIsRecording(true);
    let dictationParts = [
      "Děti mají radost z prázdnin. ",
      "Starší syn Tomáš navštěvuje fotbalový tábor. ",
      "Mladší Eliška půjde od září do školky. ",
      "Vzdělávání pěstounů je plně splněno."
    ];
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < dictationParts.length) {
        setTranscript(prev => prev + dictationParts[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsRecording(false);
      }
    }, 1500);
  };

  // Spuštění AI transformace
  const handleTriggerAi = () => {
    setIsProcessingAi(true);
    setTimeout(() => {
      // Simulované AI zpřehlednění a formátování textu
      const formattedSummary = `**Zápis z návštěvy v rodině (AI Souhrn):**\n\n` +
        `• **Tomáš (8 let):** Aktuálně navštěvuje fotbalový tábor, prázdniny zvládá výborně.\n` +
        `• **Eliška (4 roky):** Od září nastupuje do mateřské školy, adaptace probíhá bez potíží.\n` +
        `• **Pěstouni:** Povinné vzdělávání (compliance hodin) je pro tento rok plně splněno.\n` +
        `• **Závěr:** Rodina stabilní, bez indikace jakýchkoliv rizik.`;
      
      setAiSummary(formattedSummary);
      setShowAiResult(true);
      setIsProcessingAi(false);
    }, 2000);
  };

  // Uložení zápisu do časové osy spisu
  const handleSaveTimelineEntry = (useAi = false) => {
    const finalBody = useAi ? aiSummary : transcript;
    const newEntry = {
      id: `entry_${Date.now()}`,
      type: 'visit',
      title: 'Záznam z návštěvy v rodině',
      body: finalBody,
      occurredAt: new Date().toISOString(),
      location: gpsLocation ? `${gpsLocation.lat.toFixed(4)}° N, ${gpsLocation.lng.toFixed(4)}° E` : 'Neuvedena',
      durationSeconds: elapsedTime || 3600,
      sharingLevel,
      presentMembers,
      originalTranscript: useAi ? transcript : null
    };

    setTimeline(prev => {
      const updated = [newEntry, ...prev];
      const sorted = [...updated].sort((a, b) => new Date(b.occurredAt || b.date) - new Date(a.occurredAt || a.date));
      localStorage.setItem(`family_timeline_${family.id}`, JSON.stringify(sorted));
      return sorted;
    });

    setShowRecorderModal(false);
    setTranscript('');
    setAiSummary('');
    setShowAiResult(false);
    setElapsedTime(0);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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
        activePage="family-list" 
        onNavigate={onNavigate}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isMobile={isMobileView}
      />

      {/* 2. Obsahová část */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        height: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Banner probíhající návštěvy */}
        {visitActive && (
          <div style={{
            backgroundColor: 'var(--accent-primary-active)',
            color: 'var(--text-on-accent)',
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 100,
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className="pulse-dot" style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-success)',
                display: 'inline-block'
              }} />
              <span style={{ fontWeight: 'bold', fontFamily: 'var(--font-display)' }}>
                NÁVŠTĚVA PROBÍHÁ: {family.fosterParents}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 'bold' }}>
                ({formatTime(elapsedTime)})
              </span>
            </div>
            <button
              onClick={handleStopVisit}
              style={{
                backgroundColor: 'var(--status-error)',
                color: 'var(--text-on-accent)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Ukončit návštěvu
            </button>
          </div>
        )}

        <TopBar 
          user={user} 
          title={family?.fosterParents || 'Detail spisu'} 
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          isMobile={isMobileView}
        />

        {/* Hlavička detailu spisu */}
        <div style={{
          backgroundColor: 'var(--white)',
          padding: '24px 40px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span
                onClick={onBack}
                style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold' }}
              >
                <i className="las la-arrow-left"></i> Zpět na přehled
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>/</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-caption)' }}>Spis rodiny</span>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-h2)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              Spis rodiny: {family.fosterParents}
            </h1>
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', color: 'var(--text-secondary)', fontSize: 'var(--text-caption)' }}>
              <span>UID Spisu: <strong>{family.uid}</strong></span>
              <span>•</span>
              <span>Doprovází: <strong>{family.assignedTo}</strong></span>
            </div>
          </div>

          {!visitActive && (
            <button
              onClick={handleStartVisit}
              style={{
                height: '46px',
                padding: '0 24px',
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-on-accent)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-display)',
                fontWeight: 'var(--weight-bold)',
                fontSize: 'var(--text-body)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-card)',
                transition: 'background-color 0.2s'
              }}
            >
              <i className="las la-clock"></i> Zahájit návštěvu v rodině
            </button>
          )}
        </div>

        {/* Výběr záložek */}
        <div style={{
          backgroundColor: 'var(--white)',
          padding: '0 40px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          gap: '24px'
        }}>
          <button
            onClick={() => setActiveTab('timeline')}
            style={{
              padding: '16px 0',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'timeline' ? '3px solid var(--accent-primary)' : '3px solid transparent',
              color: activeTab === 'timeline' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Časová osa
          </button>
          <button
            onClick={() => setActiveTab('members')}
            style={{
              padding: '16px 0',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'members' ? '3px solid var(--accent-primary)' : '3px solid transparent',
              color: activeTab === 'members' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Svěřené děti
          </button>
          <button
            onClick={() => setActiveTab('ipod')}
            style={{
              padding: '16px 0',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'ipod' ? '3px solid var(--accent-primary)' : '3px solid transparent',
              color: activeTab === 'ipod' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            IPOD od OSPODu
          </button>
        </div>

        {/* Obsah vybrané záložky */}
        <div style={{
          padding: '40px',
          overflowY: 'auto',
          flexGrow: 1
        }}>
          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {timeline.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    backgroundColor: 'var(--surface-card)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px',
                    boxShadow: 'var(--shadow-soft)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: 'var(--text-caption)',
                        fontWeight: 'bold',
                        backgroundColor: entry.type === 'visit' ? 'rgba(94,129,244,0.1)' : 'rgba(128,128,128,0.1)',
                        color: entry.type === 'visit' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                      }}>
                        {entry.type === 'visit' ? 'Návštěva' : 'Systémový záznam'}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-caption)' }}>
                        {new Date(entry.occurredAt).toLocaleString('cs-CZ')}
                      </span>
                    </div>

                    <span style={{
                      fontSize: 'var(--text-caption)',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic'
                    }}>
                      Sdílení: {entry.sharingLevel}
                    </span>
                  </div>

                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-h4)',
                    color: 'var(--text-primary)',
                    marginBottom: '8px'
                  }}>
                    {entry.title}
                  </h3>
                  
                  <p style={{
                    color: 'var(--text-primary)',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-line'
                  }}>
                    {entry.body}
                  </p>

                  {entry.location && (
                    <div style={{
                      marginTop: '16px',
                      fontSize: 'var(--text-caption)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      gap: '16px'
                    }}>
                      <span><i className="las la-map-marker"></i> GPS: {entry.location}</span>
                      <span><i className="las la-stopwatch"></i> Doba: {Math.round(entry.durationSeconds / 60)} min</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'members' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {children.map((c) => (
                <div
                  key={c.id}
                  style={{
                    backgroundColor: 'var(--surface-card)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px',
                    boxShadow: 'var(--shadow-soft)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--text-h3)',
                      color: 'var(--text-primary)',
                      marginBottom: '4px'
                    }}>
                      {c.name}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-body)' }}>
                      Rodné číslo: <strong>{c.rc}</strong> (Věk: {c.age} let)
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-caption)', marginTop: '4px' }}>
                      Škola/školka: {c.school}
                    </p>
                  </div>

                  <button
                    onClick={() => alert('Detail dítěte')}
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--accent-primary)',
                      border: '1px solid var(--accent-primary)',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Zobrazit kartu dítěte
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ipod' && (
            <IPodManager family={family} isMobileView={isMobileView} />
          )}
        </div>
      </div>

      {/* Diktovací a hlasový modál s AI přepisem */}
      {showRecorderModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(28,29,33,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999999
        }}>
          <div style={{
            backgroundColor: 'var(--surface-card)',
            borderRadius: 'var(--radius-lg)',
            width: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-h2)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              marginBottom: '16px'
            }}>
              Zápis z návštěvy v rodině
            </h2>

            {/* Diktovací textové pole (Literal a editovatelný přepis) */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontWeight: 'bold', fontSize: 'var(--text-caption)' }}>
                  Doslovný přepis diktování (lze přímo upravit):
                </label>
                <button
                  type="button"
                  onClick={handleSimulateDiktat}
                  disabled={isRecording}
                  style={{
                    backgroundColor: isRecording ? 'var(--status-error)' : 'var(--accent-primary-tint)',
                    color: isRecording ? 'var(--text-on-accent)' : 'var(--accent-primary)',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  <i className="las la-microphone"></i> {isRecording ? 'Diktuji live...' : 'Simulovat diktování'}
                </button>
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Zde se bude živě zapisovat nadiktovaný text..."
                rows={5}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-strong)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-body)',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* AI Výsledek (pokud byl vyvolán) */}
            {showAiResult && (
              <div style={{
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: 'rgba(94,129,244,0.05)',
                border: '1px solid var(--accent-primary)',
                borderRadius: 'var(--radius-md)'
              }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: 'var(--text-caption)', marginBottom: '8px', color: 'var(--accent-primary)' }}>
                  Zpřehledněný text vytvořený pomocí AI:
                </label>
                <textarea
                  value={aiSummary}
                  onChange={(e) => setAiSummary(e.target.value)}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--accent-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-body)',
                    backgroundColor: 'var(--white)',
                    resize: 'vertical'
                  }}
                />
              </div>
            )}

            {/* Metadata zápisu (sdílení, přítomní členové) */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: 'var(--text-caption)', marginBottom: '6px' }}>
                  Úroveň sdílení
                </label>
                <select
                  value={sharingLevel}
                  onChange={(e) => setSharingLevel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)'
                  }}
                >
                  <option value="private">Soukromé (Pouze já)</option>
                  <option value="internal">Interní (Doprovázející organizace)</option>
                  <option value="external">Externí (Pěstouni / OSPOD dle grantů)</option>
                </select>
              </div>
            </div>

            {/* Akční tlačítka */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => {
                  setShowRecorderModal(false);
                  setTranscript('');
                  setAiSummary('');
                  setShowAiResult(false);
                }}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Zrušit
              </button>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleTriggerAi}
                  disabled={isProcessingAi || !transcript}
                  style={{
                    backgroundColor: 'var(--accent-primary-tint)',
                    color: 'var(--accent-primary)',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {isProcessingAi ? 'AI zpracování...' : 'AI Souhrn'}
                </button>

                <button
                  onClick={() => handleSaveTimelineEntry(showAiResult)}
                  disabled={!transcript && !aiSummary}
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--text-on-accent)',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Uložit zápis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default FamilyFolder;
