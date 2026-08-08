import React, { useState, useEffect, useRef } from 'react';
import { IPodManager } from '../components/family/IPodManager.jsx';
import { SvgIcon } from '../components/common/SvgIcon.jsx';

export function FamilyFolder({ family, user, onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeline, setTimeline] = useState([]);
  const [children, setChildren] = useState([]);
  
  // Stavy pro měření návštěvy
  const [visitActive, setVisitActive] = useState(false);
  const [visitStartTime, setVisitStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  // Stavy pro diktovací a AI zápisník
  const [showRecorderModal, setShowRecorderModal] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [showAiResult, setShowAiResult] = useState(false);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);

  useEffect(() => {
    const storageKey = `family_timeline_${family.id || family.uid}`;
    const cachedTimeline = localStorage.getItem(storageKey);

    let initialTimeline = [
      {
        id: '1',
        title: 'Pravidelná bi-monthly návštěva v rodině',
        body: 'Návštěva v místě bydliště pěstounů proběhla v přátelské atmosféře. Pěstouni vnímavě podporují školní docházku Tomáše. Eliška se bez problémů zapojuje do předškolních aktivit v MŠ Kytička.',
        occurredAt: '2026-06-15T16:30:00Z',
        completed: true,
        location: 'Praha 4 - Nusle',
        durationSeconds: 3600
      },
      {
        id: '2',
        title: 'Příprava podkladů pro roční zprávu OSPOD',
        body: 'Shromáždit zprávy ze školy ZŠ Palackého a MŠ Kytička pro roční hodnocení.',
        occurredAt: '2026-06-30T10:00:00Z',
        completed: false
      },
      {
        id: '3',
        title: 'Založení spisu rodiny a schválení Dohody A1',
        body: 'Spis pěstounské rodiny byl zaevidován pod EAN-13 UID 9048270000017 a Dohoda o doprovázení schválena.',
        occurredAt: '2026-05-01T12:00:00Z',
        completed: true
      }
    ];

    if (cachedTimeline) {
      try {
        const parsed = JSON.parse(cachedTimeline);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialTimeline = parsed;
        }
      } catch {
        // Fallback
      }
    }

    setTimeline(initialTimeline);

    const simulatedChildren = [
      { id: 'dite1', name: 'Tomáš Dvořák', rc: '180512/4321', age: 8, school: 'ZŠ Palackého' },
      { id: 'dite2', name: 'Eliška Dvořáková', rc: '211102/8765', age: 4, school: 'MŠ Kytička' }
    ];

    setChildren(simulatedChildren);

    const savedStart = localStorage.getItem(`active_visit_${family.id || family.uid}`);
    if (savedStart) {
      setVisitStartTime(new Date(savedStart));
      setVisitActive(true);
    }
  }, [family]);

  useEffect(() => {
    if (visitActive && visitStartTime) {
      timerRef.current = setInterval(() => {
        const seconds = Math.floor((new Date() - visitStartTime) / 1000);
        setElapsedTime(seconds);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visitActive, visitStartTime]);

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartVisit = () => {
    const now = new Date();
    setVisitStartTime(now);
    setVisitActive(true);
    setElapsedTime(0);
    localStorage.setItem(`active_visit_${family.id || family.uid}`, now.toISOString());

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setGpsLocation(loc);
        },
        () => {
          const fallbackLoc = { lat: 50.0755, lng: 14.4378 };
          setGpsLocation(fallbackLoc);
        }
      );
    }
  };

  const handleStopVisit = () => {
    setVisitActive(false);
    localStorage.removeItem(`active_visit_${family.id || family.uid}`);
    setShowRecorderModal(true);
  };

  const handleSimulateAiProcessing = () => {
    setIsProcessingAi(true);
    setTimeout(() => {
      setIsProcessingAi(false);
      setAiSummary(`Strukturovaná zpráva z klíčové návštěvy:
- Průběh návštěvy: Návštěva v domácnosti pěstounů proběhla v přátelské atmosféře.
- Posouzení potřeb dětí: Tomáš (8 let) vykazuje dobré školní výsledky. Eliška (4 roky) je adaptovaná v MŠ.
- Plánovaná podpora: Dohodnuto čerpání 4 hodin respitní péče pro pěstouny v příštím měsíci.
- GPS Ověření: Poloha úspěšně potvrzena (${gpsLocation ? `${gpsLocation.lat.toFixed(4)} N, ${gpsLocation.lng.toFixed(4)} E` : '50.0755 N, 14.4378 E'}).`);
      setShowAiResult(true);
    }, 1500);
  };

  const handleSaveVisitRecord = () => {
    const newRecord = {
      id: Date.now().toString(),
      title: 'Klíčová návštěva v rodině',
      body: aiSummary || transcript || 'Návštěva byla zaznamenána.',
      occurredAt: new Date().toISOString(),
      completed: true,
      location: gpsLocation ? `${gpsLocation.lat.toFixed(4)} N, ${gpsLocation.lng.toFixed(4)} E` : 'Praha 4 - Nusle',
      durationSeconds: elapsedTime || 3600
    };

    const updated = [newRecord, ...timeline];
    setTimeline(updated);
    localStorage.setItem(`family_timeline_${family.id || family.uid}`, JSON.stringify(updated));

    setShowRecorderModal(false);
    setShowAiResult(false);
    setTranscript('');
    setAiSummary('');
  };

  const familyNameDisplay = family.fosterParents || family.fosterParentsDisplay || 'Petr a Anna Dvořákovi';

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Center Reading Canvas (Notion / Outline Style) */}
      <div style={{ flex: 1, minWidth: 0, padding: '36px 48px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Navigation Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#6b7280', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SvgIcon name="arrow-left" size={14} />
              <span>Zpět na seznam</span>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#9ca3af' }}>
              UID: {family.uid || family.id || '9048270000017'}
            </span>
          </div>
        </div>

        {/* Title Header Block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
              Doprovázená rodina
            </span>
            <span style={{ backgroundColor: '#d1fae5', color: '#047857', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
              Aktivní dohlížení
            </span>
          </div>

          <h1 style={{ fontSize: '34px', fontWeight: 700, letterSpacing: '-0.02em', color: '#111827', margin: 0 }}>
            {familyNameDisplay}
          </h1>

          <p style={{ fontSize: '15px', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
            Evidovaný spis pěstounské rodiny vedený v souladu se zákonem č. 359/1999 Sb. u OSPOD Praha 4.
          </p>

          <div style={{ display: 'flex', gap: '6px', paddingTop: '4px' }}>
            <span style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>#pestouni</span>
            <span style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>#doprovazeni</span>
            <span style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>#praha4</span>
          </div>
        </div>

        {/* Notion-Style Clean Property Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
            <div style={{ width: '150px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SvgIcon name="user" size={16} style={{ color: '#9ca3af' }} />
              <span>Pracovník</span>
            </div>
            <div style={{ color: '#111827', fontWeight: 500 }}>
              {family.assignedTo || user?.name || 'Mgr. Jana Nováková'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
            <div style={{ width: '150px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SvgIcon name="calendar" size={16} style={{ color: '#9ca3af' }} />
              <span>Platnost Dohody</span>
            </div>
            <div style={{ color: '#111827', fontWeight: 500, fontFamily: 'monospace', fontSize: '13px' }}>
              do 31. 12. 2027
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
            <div style={{ width: '150px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SvgIcon name="clock" size={16} style={{ color: '#9ca3af' }} />
              <span>Respitní péče</span>
            </div>
            <div style={{ color: '#d97706', fontWeight: 600, fontSize: '13px' }}>
              14 / 40 hodin vyčerpáno
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
            <div style={{ width: '150px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SvgIcon name="location" size={16} style={{ color: '#FF4742' }} />
              <span>Terénní návštěva</span>
            </div>
            <div>
              {!visitActive ? (
                <button onClick={handleStartVisit} style={{ backgroundColor: '#FF4742', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <SvgIcon name="play" size={14} />
                  <span>Zahájit terénní návštěvu</span>
                </button>
              ) : (
                <button onClick={handleStopVisit} style={{ backgroundColor: '#f59e0b', color: '#000000', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <SvgIcon name="stop" size={14} />
                  <span>Ukončit návštěvu ({formatDuration(elapsedTime)})</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Horizontal Navigation Pills */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
          {[
            { id: 'overview', label: 'Přehled & Záznamy', icon: 'stream' },
            { id: 'ipod', label: 'IPOD Plán', icon: 'tasks' },
            { id: 'agreements', label: 'Dohoda A1 & Soubory', icon: 'contract' }
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

        {/* Tab 1: Minimalist Checklist / Agenda Rows */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9ca3af', margin: 0 }}>
              Záznamy z klíčových návštěv & Úkoly:
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {timeline.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #f3f4f6',
                    backgroundColor: '#ffffff',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: item.completed ? '1px solid #FF4742' : '1.5px solid #d1d5db',
                      backgroundColor: item.completed ? '#FF4742' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '2px',
                      flexShrink: 0
                    }}
                  >
                    {item.completed && <SvgIcon name="check" size={12} style={{ color: '#ffffff' }} />}
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
                        {item.title}
                      </h4>
                      <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#9ca3af' }}>
                        {new Date(item.occurredAt).toLocaleDateString('cs-CZ')}
                      </span>
                    </div>

                    <p style={{ fontSize: '13px', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>
                      {item.body}
                    </p>

                    {item.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280', paddingTop: '4px', fontFamily: 'monospace' }}>
                        <SvgIcon name="location" size={14} style={{ color: '#ef4444' }} />
                        <span>{item.location}</span>
                        {item.durationSeconds && <span>• {Math.round(item.durationSeconds / 60)} min</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: IPOD Manager */}
        {activeTab === 'ipod' && (
          <div style={{ border: '1px solid #f3f4f6', borderRadius: '8px', padding: '20px' }}>
            <IPodManager family={family} />
          </div>
        )}

        {/* Tab 3: Agreements */}
        {activeTab === 'agreements' && (
          <div style={{ border: '1px solid #f3f4f6', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
                Dohoda o doprovázení A1 (PDF)
              </h3>
              <span style={{ backgroundColor: '#d1fae5', color: '#047857', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>
                Platná do 31.12.2027
              </span>
            </div>

            <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.5, margin: 0 }}>
              Tato dohoda upravuje práva a povinnosti při doprovázení pěstounské rodiny v souladu se zákonem č. 359/1999 Sb. o sociálně-právní ochraně dětí.
            </p>

            <div>
              <button onClick={() => alert("Stahování PDF Dohody...")} style={{ backgroundColor: '#ffffff', color: '#111827', border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <SvgIcon name="download" size={14} />
                <span>Stáhnout PDF Dohody</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar Panel (Outline / Notion Style Fixed 320px Sidebar) */}
      <div style={{ width: '320px', flexShrink: 0, borderLeft: '1px solid #f3f4f6', backgroundColor: '#fafafa', padding: '36px 24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
        
        {/* Avatar & Main Contact Title */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#FF4742', fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
            PD
          </div>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
            {familyNameDisplay}
          </h2>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
            Pěstounská rodina • OSPOD Praha 4
          </p>
        </div>

        {/* Contact Properties */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
            <div>
              <div style={{ fontFamily: 'monospace', color: '#111827', fontWeight: 500 }}>dvorak@seznam.cz</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Primární e-mail</div>
            </div>
            <SvgIcon name="mail" size={16} style={{ color: '#9ca3af' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
            <div>
              <div style={{ fontFamily: 'monospace', color: '#111827', fontWeight: 500 }}>+420 777 111 222</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Telefonní kontakt</div>
            </div>
            <SvgIcon name="phone" size={16} style={{ color: '#9ca3af' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
            <div>
              <div style={{ color: '#111827', fontWeight: 500 }}>Praha 4 - Nusle</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Bydliště rodiny</div>
            </div>
            <SvgIcon name="location" size={16} style={{ color: '#9ca3af' }} />
          </div>

        </div>

        {/* Svěřené děti v péči */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9ca3af', margin: 0 }}>
            Svěřené děti v péči ({children.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {children.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#ffffff', border: '1px solid #f3f4f6' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{c.name}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{c.age} let • {c.school}</div>
                </div>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#FF4742', fontWeight: 700 }}>{c.rc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rychlé dokumenty */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9ca3af', margin: 0 }}>
            Rychlé dokumenty & Akce
          </h3>
          <button onClick={() => onNavigate && onNavigate('ospod-report')} style={{ backgroundColor: '#ffffff', color: '#111827', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
            <SvgIcon name="pdf" size={16} style={{ color: '#ef4444' }} />
            <span>Generovat Zprávu pro OSPOD</span>
          </button>
          <button onClick={() => onNavigate && onNavigate('messages')} style={{ backgroundColor: '#ffffff', color: '#111827', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
            <SvgIcon name="comment" size={16} style={{ color: '#3b82f6' }} />
            <span>Napsat zprávu pěstounům</span>
          </button>
        </div>

      </div>

      {/* Modal for Recording / AI Summary */}
      {showRecorderModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '500px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SvgIcon name="user" size={18} style={{ color: '#ef4444' }} />
                <span>Zápisník z terénní návštěvy</span>
              </h3>
              <button onClick={() => setShowRecorderModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <SvgIcon name="arrow-left" size={16} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
              Zadejte poznámky z návštěvy textem nebo spusťte simulaci AI strukturovaného zápisu.
            </p>

            <textarea
              style={{ width: '100%', height: '100px', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', resize: 'none', outline: 'none' }}
              placeholder="Napište poznámky z návštěvy..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />

            {!showAiResult ? (
              <button onClick={handleSimulateAiProcessing} disabled={isProcessingAi} style={{ backgroundColor: '#f3f4f6', color: '#111827', border: '1px solid #e5e7eb', padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {isProcessingAi ? (
                  <>
                    <SvgIcon name="clock" size={16} className="animate-spin" />
                    <span>Zpracovávám pomocí AI...</span>
                  </>
                ) : (
                  <>
                    <SvgIcon name="user" size={16} style={{ color: '#ef4444' }} />
                    <span>Generovat strukturovaný AI zápis</span>
                  </>
                )}
              </button>
            ) : (
              <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px', fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
                {aiSummary}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
              <button onClick={() => setShowRecorderModal(false)} style={{ backgroundColor: '#ffffff', color: '#4b5563', border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                Zrušit
              </button>
              <button onClick={handleSaveVisitRecord} style={{ backgroundColor: '#FF4742', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Uložit zápis do spisu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FamilyFolder;
