import React, { useState, useEffect } from 'react';
import { getAiCourseRecommendations, generateAiDevelopmentPlan } from '../services/aiRecommendationService';
import { Sidebar } from '../components/navigation/Sidebar.jsx';
import { TopBar } from '../components/navigation/TopBar.jsx';

export function RespitEducationView({ user, onNavigate, isMobileView }) {
  const [activeTab, setActiveTab] = useState('courses');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [orderedCourses, setOrderedCourses] = useState([]);
  const [orderMessage, setOrderMessage] = useState(null);

  // Výchozí katalog kurzů
  const catalogCourses = [
    {
      id: 'c1',
      title: 'Trauma a attachment u dětí v náhradní rodinné péči',
      hours: 8,
      category: 'Psychologie',
      lecturer: 'PhDr. Alena Procházková',
      price: 1800,
      format: 'Prezenčně (Praha)',
      coveredBySpvpp: true
    },
    {
      id: 'c2',
      title: 'Rozvoj finanční gramotnosti u dospívajících',
      hours: 4,
      category: 'Praktické dovednosti',
      lecturer: 'Ing. Karel Svoboda',
      price: 900,
      format: 'Online webinar',
      coveredBySpvpp: true
    },
    {
      id: 'c3',
      title: 'Práce se vztekem a emociálně náročným chováním',
      hours: 6,
      category: 'Výchova a emoce',
      lecturer: 'Mgr. Jan Dvořák',
      price: 1400,
      format: 'Prezenčně (Brno)',
      coveredBySpvpp: true
    }
  ];

  const handleRunAiAnalysis = async () => {
    setLoadingAi(true);
    try {
      const mockProfile = { uid: '9900010000013', children: [{ birthYear: 2014 }, { birthYear: 2017 }] };
      const res = await getAiCourseRecommendations(mockProfile);
      setAiRecommendations(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleOrderCourse = (course) => {
    setOrderedCourses(prev => [...prev, course.id]);
    setOrderMessage(`Kurz "${course.title}" byl úspěšně objednán a zarezervován přes SPVPP.`);
    setTimeout(() => setOrderMessage(null), 4000);
  };

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
        activePage="respit" 
        onNavigate={onNavigate}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isMobile={isMobileView}
      />

      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%', overflow: 'hidden' }}>
        <TopBar 
          user={user} 
          title="Vzdělávání, Respit & AI Doporučovač" 
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          isMobile={isMobileView}
        />

        <div style={{ padding: isMobileView ? '20px 16px' : '32px 40px', overflowY: 'auto', flexGrow: 1 }}>
          {/* Uvítací lišta a tlačítko AI Doporučovače */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px 32px',
            boxShadow: '0 2px 12px rgba(154,160,185,0.08)',
            marginBottom: '32px',
            display: 'flex',
            flexDirection: isMobileView ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobileView ? 'flex-start' : 'center',
            gap: '20px',
            borderLeft: '6px solid #4A85F6'
          }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#4A85F6', letterSpacing: '0.5px' }}>
                INTELIGENTNÍ ASISTENT PORTÁLU
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#1C1D21', margin: '4px 0 0 0' }}>
                AI Analýza a doporučení kurzů pro rodinu
              </h2>
              <p style={{ color: '#8181A5', fontSize: '14px', margin: '4px 0 0 0' }}>
                AI vyhodnocuje věk dětí, záznamy z návštěv a doporučuje kurzy i respitní péči na míru.
              </p>
            </div>

            <button
              onClick={handleRunAiAnalysis}
              disabled={loadingAi}
              style={{
                backgroundColor: '#4A85F6',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(74,133,246,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0
              }}
            >
              <i className="las la-robot" style={{ fontSize: '20px' }}></i>
              <span>{loadingAi ? 'AI Analýza probíhá...' : 'Spustit AI analýzu potřeb'}</span>
            </button>
          </div>

          {orderMessage && (
            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(124,231,172,0.15)',
              border: '1px solid #27B973',
              borderRadius: '12px',
              color: '#27B973',
              fontWeight: 700,
              marginBottom: '24px'
            }}>
              {orderMessage}
            </div>
          )}

          {/* Výsledky AI Doporučení */}
          {aiRecommendations && (
            <div style={{
              backgroundColor: '#EBF2FE',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
              border: '1px solid #4A85F6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <i className="las la-brain" style={{ fontSize: '24px', color: '#4A85F6' }}></i>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1D21', margin: 0 }}>
                  Výsledky AI Doporučení pro spis Petr a Anna Dvořákovi
                </h3>
              </div>
              <p style={{ color: '#1C1D21', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>
                {aiRecommendations.aiAnalysisSummary}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
                {aiRecommendations.recommendedCourses.map((c) => (
                  <div key={c.id} style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#4A85F6', textTransform: 'uppercase' }}>
                        {c.category} • {c.hours} hod.
                      </span>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1C1D21', margin: '6px 0' }}>{c.title}</h4>
                      <p style={{ fontSize: '12px', color: '#8181A5', fontStyle: 'italic', marginBottom: '12px' }}>{c.aiReason}</p>
                    </div>

                    <button
                      onClick={() => handleOrderCourse(c)}
                      disabled={orderedCourses.includes(c.id)}
                      style={{
                        backgroundColor: orderedCourses.includes(c.id) ? '#27B973' : '#4A85F6',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '10px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        marginTop: '12px'
                      }}
                    >
                      {orderedCourses.includes(c.id) ? 'Objednáno (SPVPP)' : 'Objednat kurz přes SPVPP'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Katalog standardních kurzů a služeb */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 2px 12px rgba(154,160,185,0.08)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#1C1D21', marginBottom: '20px' }}>
              Katalog akreditovaných kurzů a služeb
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {catalogCourses.map((c) => (
                <div key={c.id} style={{
                  border: '1px solid #ECECF2',
                  borderRadius: '14px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: '#F7F9FC'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#4A85F6' }}>{c.category}</span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#1C1D21', backgroundColor: '#FFFFFF', padding: '2px 8px', borderRadius: '6px', border: '1px solid #ECECF2' }}>
                        {c.hours} hodin
                      </span>
                    </div>

                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1C1D21', margin: '0 0 8px 0' }}>{c.title}</h4>
                    <div style={{ fontSize: '13px', color: '#8181A5', marginBottom: '4px' }}>Lektor: {c.lecturer}</div>
                    <div style={{ fontSize: '13px', color: '#8181A5', marginBottom: '16px' }}>Forma: {c.format}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #ECECF2' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#1C1D21' }}>{c.price.toLocaleString('cs-CZ')} Kč</span>
                    <button
                      onClick={() => handleOrderCourse(c)}
                      disabled={orderedCourses.includes(c.id)}
                      style={{
                        backgroundColor: orderedCourses.includes(c.id) ? '#27B973' : '#4A85F6',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      {orderedCourses.includes(c.id) ? 'Objednáno' : 'Objednat'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default RespitEducationView;
