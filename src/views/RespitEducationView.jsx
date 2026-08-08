import React, { useState } from 'react';
import { getAiCourseRecommendations } from '../services/aiRecommendationService';

export function RespitEducationView({ user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('courses');
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [orderedCourses, setOrderedCourses] = useState([]);
  const [orderMessage, setOrderMessage] = useState(null);

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
    } catch {
      // Fallback
    } finally {
      setLoadingAi(false);
    }
  };

  const handleOrderCourse = (course) => {
    setOrderedCourses(prev => [...prev, course.id]);
    setOrderMessage(`Kurz "${course.title}" byl úspěšně rezervován přes SPVPP.`);
    setTimeout(() => setOrderMessage(null), 4000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6 font-sans">
      {orderMessage && (
        <div className="p-3 rounded-lg bg-[var(--routine-green-light)] border border-[var(--routine-green)] text-[var(--routine-green)] text-xs font-medium flex items-center gap-2">
          <i className="las la-check-circle text-base" />
          <span>{orderMessage}</span>
        </div>
      )}

      {/* Routine Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#f0f0f4]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--routine-text-primary)]">
            Vzdělávání & Respitní Péče
          </h1>
          <p className="text-xs text-[var(--routine-text-secondary)] mt-0.5">
            Plnění povinných hodin a e-shop kurzů pro pěstouny | Routine.co Format
          </p>
        </div>

        <button className="routine-btn-primary" onClick={handleRunAiAnalysis} disabled={loadingAi}>
          {loadingAi ? (
            <>
              <i className="las la-spinner la-spin text-base" />
              Analyzuji potřeby...
            </>
          ) : (
            <>
              <i className="las la-magic text-base text-white" />
              Spustit AI Doporučovač kurzů
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#f0f0f4]">
        {[
          { id: 'courses', label: 'Katalog kurzů', icon: 'las la-book' },
          { id: 'respit', label: 'Respitní péče & Hlídání', icon: 'las la-user-clock' },
          { id: 'my-plan', label: 'Můj plán vzdělávání', icon: 'las la-graduation-cap' }
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

      {/* AI Recommendation Result Alert */}
      {aiRecommendations && (
        <div className="routine-card p-4 bg-[#f9f9fb] border-l-4 border-l-[var(--routine-coral)] space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--routine-text-primary)] flex items-center gap-2">
              <i className="las la-brain text-[var(--routine-coral)] text-lg" />
              AI Doporučené kurzy pro rodinu
            </h3>
            <span className="routine-badge routine-badge-coral font-mono text-[11px]">Personalizovaný výběr</span>
          </div>

          <p className="text-xs text-[var(--routine-text-body)]">
            Na základě věku svěřených dětí (8 a 4 roky) a historie zápisů AI doporučuje zaměřit se na emociální stabilitu a zvládání předškolní adaptace.
          </p>
        </div>
      )}

      {/* Tab 1: Courses Catalog */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {catalogCourses.map(course => {
            const isOrdered = orderedCourses.includes(course.id);
            return (
              <div key={course.id} className="routine-card p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="routine-badge routine-badge-blue">{course.category}</span>
                    <span className="font-mono text-xs font-bold text-[var(--routine-coral)]">{course.hours} hod.</span>
                  </div>

                  <h3 className="text-sm font-bold text-[var(--routine-text-primary)] leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-xs text-[var(--routine-text-secondary)]">
                    Lektor: {course.lecturer} | {course.format}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#f0f0f4] flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[var(--routine-text-primary)]">
                    {course.price} Kč
                  </span>

                  <button
                    className={`routine-btn-${isOrdered ? 'secondary' : 'primary'} text-xs py-1.5 px-3`}
                    onClick={() => handleOrderCourse(course)}
                    disabled={isOrdered}
                  >
                    {isOrdered ? (
                      <>
                        <i className="las la-check text-base text-[var(--routine-green)]" />
                        Rezervováno
                      </>
                    ) : (
                      <>
                        <i className="las la-cart-plus text-base" />
                        Rezervovat kurz
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Respite Care */}
      {activeTab === 'respit' && (
        <div className="routine-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#f0f0f4] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--routine-text-primary)]">
                Čerpání respitní péče
              </h3>
              <p className="text-xs text-[var(--routine-text-secondary)] mt-0.5">
                Nárok: 14 kalendářních dnů celodenní respitní péče za rok
              </p>
            </div>
            <span className="routine-badge routine-badge-green font-mono text-xs">Vyčerpáno: 4 / 14 dnů</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#f9f9fb] border border-[#e8e8ed] space-y-2">
              <h4 className="text-xs font-bold text-[var(--routine-text-primary)]">Víkendový respitní pobyt dětí</h4>
              <p className="text-xs text-[var(--routine-text-secondary)]">Termín: 12. 6. - 14. 6. 2026 (2 dny)</p>
              <span className="routine-badge routine-badge-green">Schváleno & Čerpáno</span>
            </div>

            <div className="p-4 rounded-lg bg-[#f9f9fb] border border-[#e8e8ed] space-y-2">
              <h4 className="text-xs font-bold text-[var(--routine-text-primary)]">Letní tábor pro děti</h4>
              <p className="text-xs text-[var(--routine-text-secondary)]">Termín: 10. 7. - 17. 7. 2026 (7 dnů)</p>
              <span className="routine-badge routine-badge-yellow">Schváleno v plánu</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: My Education Plan */}
      {activeTab === 'my-plan' && (
        <div className="routine-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#f0f0f4] pb-3">
            <h3 className="text-sm font-bold text-[var(--routine-text-primary)]">
              Přehled plnění povinného vzdělávání pěstounů
            </h3>
            <span className="routine-badge routine-badge-blue font-mono">Splněno 12 / 24 hodin</span>
          </div>

          <div className="w-full bg-[#f0f0f4] h-2.5 rounded-full overflow-hidden">
            <div className="bg-[var(--routine-coral)] h-full w-1/2 transition-all duration-500" />
          </div>

          <p className="text-xs text-[var(--routine-text-secondary)]">
            Zbývá absolvovat 12 hodin vzdělávání v probíhajícím dvouletém období.
          </p>
        </div>
      )}
    </div>
  );
}

export default RespitEducationView;
