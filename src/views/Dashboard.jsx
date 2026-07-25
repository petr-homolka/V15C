import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Sidebar } from '../components/navigation/Sidebar.jsx';
import { RoutineSidebar } from '../components/navigation/RoutineSidebar.jsx';
import { TopBar } from '../components/navigation/TopBar.jsx';
import { EntityLink } from '../components/common/EntityLink.jsx';
import { EntityProfileModal } from '../components/common/EntityProfileModal.jsx';

import { EXTENSIVE_SEED_DATA, seedAllTestData } from '../services/seedDataService';

export function Dashboard({ user, onNavigate, activeSubView = 'dashboard', onSelectFamily, onSelectEntity, onOpenQuickConsole, isMobileView }) {
  const [families, setFamilies] = useState([]);
  const [fosterParentsList, setFosterParentsList] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const handleEntityClick = (entityData) => {
    if (onSelectEntity) {
      onSelectEntity(entityData);
    } else {
      setActiveModalEntity(entityData);
    }
  };

  useEffect(() => {
    seedAllTestData();
    setFamilies(EXTENSIVE_SEED_DATA.families);
    setFosterParentsList(EXTENSIVE_SEED_DATA.fosterParents);
    setChildrenList(EXTENSIVE_SEED_DATA.children);
    setTeamList(EXTENSIVE_SEED_DATA.team);
    setLoading(false);
  }, []);

  const handleResetData = async () => {
    await seedAllTestData();
    setFamilies(EXTENSIVE_SEED_DATA.families);
    setChildrenList(EXTENSIVE_SEED_DATA.children);
    setTeamList(EXTENSIVE_SEED_DATA.team);
    setSeedSuccessMsg("Systém byl úspěšně naplněn rozsáhlými testovacími daty rodin, dětí, pěstounů a týmu!");
    setTimeout(() => setSeedSuccessMsg(null), 4000);
  };

  // Načtení rodin
  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      const simulatedFamilies = [
        {
          id: '9900010000013',
          uid: '9900010000013',
          fosterParents: 'Petr a Anna Dvořákovi',
          childrenCount: 2,
          lastVisitAt: '2026-06-15',
          assignedTo: user?.name || 'Jana Nováková',
          status: 'Aktivní dohlížení',
          warning: false
        },
        {
          id: '9900010000026',
          uid: '9900010000026',
          fosterParents: 'Marie Svobodová',
          childrenCount: 1,
          lastVisitAt: '2026-05-10',
          assignedTo: user?.name || 'Jana Nováková',
          status: 'Čeká na návštěvu',
          warning: true
        },
        {
          id: '9900010000039',
          uid: '9900010000039',
          fosterParents: 'Jan a Kateřina Novotní',
          childrenCount: 3,
          lastVisitAt: '2026-07-01',
          assignedTo: user?.name || 'Jana Nováková',
          status: 'Aktivní dohlížení',
          warning: false
        }
      ];

      try {
        const q = query(
          collection(db, 'families'),
          where('assignedTo', '==', user?.uid || '')
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setFamilies(docs);
        } else {
          setFamilies(simulatedFamilies);
        }
      } catch (err) {
        setFamilies(simulatedFamilies);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  // Vypočtení titulku podle pod-pohledu
  const getHeaderTitle = () => {
    switch (activeSubView) {
      case 'family-list': return 'Seznam doprovázených rodin';
      case 'foster-parents': return 'Seznam pěstounů ve správě';
      case 'children': return 'Seznam svěřených dětí';
      case 'team': return 'Tým a spolupracovníci organizace';
      default: return 'Přehled agendy klíčové osoby';
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      height: '100vh',
      backgroundColor: '#F7F9FC',
      fontFamily: 'var(--font-body)',
      overflow: 'hidden'
    }}>
      {/* 1. Navigační Routine Sidebar */}
      <RoutineSidebar 
        activePage="dashboard" 
        activeSubView={activeSubView}
        onNavigate={onNavigate}
        onOpenQuickConsole={onOpenQuickConsole}
        user={user}
      />

      {/* 2. Hlavní obsahová oblast */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        height: '100%',
        overflow: 'hidden'
      }}>
        <TopBar 
          user={user} 
          title={getHeaderTitle()}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenQuickConsole={onOpenQuickConsole}
          isMobile={isMobileView}
        />

        <div style={{
          padding: isMobileView ? '20px 16px' : '32px 40px',
          overflowY: 'auto',
          flexGrow: 1
        }}>
          {/* Uvítací hlavička a akční tlačítko */}
          <div style={{
            display: 'flex',
            flexDirection: isMobileView ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobileView ? 'flex-start' : 'center',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div>
              <span style={{ fontSize: '13px', color: '#8181A5', fontWeight: 600 }}>Doprovázení.com</span>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: isMobileView ? '24px' : '30px',
                fontWeight: 800,
                color: '#1C1D21',
                margin: '4px 0 0 0'
              }}>
                {getHeaderTitle()}
              </h1>
            </div>

            <button
              onClick={() => alert("Formulář nového spisu se otevírá...")}
              style={{
                height: '46px',
                padding: '0 24px',
                backgroundColor: '#4A85F6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(74,133,246,0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="las la-plus" style={{ fontSize: '18px' }}></i>
              <span>Nový záznam / Spis</span>
            </button>
          </div>

          {/* Vykreslení podle záložky: 1. PĚSTOUNI */}
          {activeSubView === 'foster-parents' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 12px rgba(154,160,185,0.08)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', color: '#1C1D21' }}>
                Seznam evidovaných pěstounů ve správě organizace ({fosterParentsList.length})
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ECECF2', color: '#8181A5', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px' }}>Jméno pěstouna</th>
                    <th style={{ padding: '12px 8px' }}>Rodné číslo</th>
                    <th style={{ padding: '12px 8px' }}>Telefon</th>
                    <th style={{ padding: '12px 8px' }}>E-mail</th>
                    <th style={{ padding: '12px 8px' }}>Lokalita</th>
                    <th style={{ padding: '12px 8px' }}>Klíčová osoba</th>
                  </tr>
                </thead>
                <tbody>
                  {fosterParentsList.map((fp) => (
                    <tr key={fp.uid} style={{ borderBottom: '1px solid #ECECF2' }}>
                      <td style={{ padding: '14px 8px', fontWeight: 700, color: '#1C1D21' }}>
                        <EntityLink name={fp.name} type="foster" entityData={fp} onClick={handleEntityClick} />
                      </td>
                      <td style={{ padding: '14px 8px' }}>{fp.rc}</td>
                      <td style={{ padding: '14px 8px' }}>{fp.phone}</td>
                      <td style={{ padding: '14px 8px' }}>{fp.email}</td>
                      <td style={{ padding: '14px 8px' }}>{fp.city}</td>
                      <td style={{ padding: '14px 8px' }}>
                        <EntityLink name={fp.ko} type="staff" entityData={{ name: fp.ko, role: 'Klíčová osoba' }} onClick={handleEntityClick} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Vykreslení podle záložky: 2. DĚTI */}
          {activeSubView === 'children' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 12px rgba(154,160,185,0.08)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', color: '#1C1D21' }}>
                Seznam dětí svěřených do pěstounské péče ({childrenList.length})
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ECECF2', color: '#8181A5', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px' }}>Jméno a příjmení dítěte</th>
                    <th style={{ padding: '12px 8px' }}>Rodné číslo</th>
                    <th style={{ padding: '12px 8px' }}>Rok narození</th>
                    <th style={{ padding: '12px 8px' }}>Pěstounská rodina</th>
                    <th style={{ padding: '12px 8px' }}>Příslušný OSPOD</th>
                    <th style={{ padding: '12px 8px' }}>Klíčová osoba</th>
                  </tr>
                </thead>
                <tbody>
                  {childrenList.map((ch) => (
                    <tr key={ch.id} style={{ borderBottom: '1px solid #ECECF2' }}>
                      <td style={{ padding: '14px 8px', fontWeight: 700, color: '#1C1D21' }}>
                        <EntityLink name={ch.name} type="child" entityData={ch} onClick={handleEntityClick} />
                      </td>
                      <td style={{ padding: '14px 8px' }}>{ch.rc}</td>
                      <td style={{ padding: '14px 8px' }}>{ch.birthYear}</td>
                      <td style={{ padding: '14px 8px', fontWeight: 600 }}>
                        <EntityLink name={ch.familyName || ch.family} type="foster" entityData={{ name: ch.familyName || ch.family }} onClick={handleEntityClick} />
                      </td>
                      <td style={{ padding: '14px 8px' }}>{ch.ospod}</td>
                      <td style={{ padding: '14px 8px' }}>
                        <EntityLink name={ch.ko} type="staff" entityData={{ name: ch.ko, role: 'Klíčová osoba' }} onClick={handleEntityClick} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Vykreslení podle záložky: 3. TÝM */}
          {activeSubView === 'team' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 12px rgba(154,160,185,0.08)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', color: '#1C1D21' }}>
                Kontakty na tým a spolupracovníky doprovázející organizace ({teamList.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}>
                {teamList.map((t) => (
                  <div key={t.id} style={{
                    border: '1px solid #ECECF2',
                    borderRadius: '14px',
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    backgroundColor: '#F7F9FC'
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#4A85F6',
                      color: '#FFFFFF',
                      fontSize: '22px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {t.name.split(' ').map(n => n[0]).slice(-2).join('')}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1C1D21' }}>
                        <EntityLink name={t.name} type="staff" entityData={t} onClick={handleEntityClick} />
                      </h4>
                      <span style={{ fontSize: '12px', color: '#4A85F6', fontWeight: 700, display: 'block', marginBottom: '8px' }}>{t.role}</span>
                      <div style={{ fontSize: '13px', color: '#8181A5', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div><i className="las la-phone"></i> {t.phone}</div>
                        <div><i className="las la-envelope"></i> {t.email}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vykreslení výchozího DASHBOARD / RODINY */}
          {(activeSubView === 'dashboard' || activeSubView === 'family-list') && (
            <>
              {/* Sekce Workload (Karty svěřených rodin) */}
              <div style={{ marginBottom: '36px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#1C1D21', margin: 0 }}>
                    Kapacita a svěřené rodiny ({families.length})
                  </h2>
                  <span style={{ color: '#4A85F6', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Zobrazit vše</span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobileView ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '20px'
                }}>
                  {families.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => onSelectFamily(f)}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: '0 2px 12px rgba(154,160,185,0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        border: f.warning ? '1px solid #FF808B' : '1px solid transparent'
                      }}
                    >
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: f.warning ? 'rgba(255,128,139,0.1)' : '#EBF2FE',
                        color: f.warning ? '#FF808B' : '#4A85F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '26px',
                        marginBottom: '12px'
                      }}>
                        <i className="las la-users"></i>
                      </div>

                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1C1D21', margin: '0 0 4px 0' }}>
                        {f.primaryFosterParent ? (
                          <>
                            <EntityLink name={f.primaryFosterParent.name} type="foster" entityData={f.primaryFosterParent} onClick={handleEntityClick} />
                            {f.secondaryFosterParent && (
                              <>
                                {' a '}
                                <EntityLink name={f.secondaryFosterParent.name} type="foster" entityData={f.secondaryFosterParent} onClick={handleEntityClick} />
                              </>
                            )}
                          </>
                        ) : (
                          f.fosterParentsDisplay || f.fosterParents
                        )}
                      </h3>
                      <span style={{ fontSize: '12px', color: '#8181A5', marginBottom: '12px' }}>
                        UID Spisu: {f.uid} ({f.careType === 'joint' ? 'Společná péče' : 'Výhradní péče'})
                      </span>

                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: f.warning ? 'rgba(255,128,139,0.12)' : 'rgba(124,231,172,0.15)',
                        color: f.warning ? '#FF808B' : '#27B973'
                      }}>
                        {f.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dvou-sloupcový layout: Tabulka rodin + Bi-monthly lhůty */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobileView ? '1fr' : '2fr 1fr',
                gap: '24px'
              }}>
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 2px 12px rgba(154,160,185,0.08)'
                }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#1C1D21', marginBottom: '20px' }}>
                    Seznam doprovázených rodin
                  </h2>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #ECECF2', color: '#8181A5' }}>
                        <th style={{ textAlign: 'left', padding: '12px 8px' }}>PĚSTOUNI</th>
                        <th style={{ textAlign: 'center', padding: '12px 8px' }}>DĚTI</th>
                        <th style={{ textAlign: 'left', padding: '12px 8px' }}>POSLEDNÍ NÁVŠTĚVA</th>
                        <th style={{ textAlign: 'right', padding: '12px 8px' }}>AKCE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {families.map((f) => (
                        <tr
                          key={f.id}
                          onClick={() => onSelectFamily(f)}
                          style={{ borderBottom: '1px solid #ECECF2', cursor: 'pointer' }}
                        >
                          <td style={{ padding: '14px 8px', fontWeight: 700, color: '#1C1D21' }}>
                            {f.primaryFosterParent ? (
                              <>
                                <EntityLink name={f.primaryFosterParent.name} type="foster" entityData={f.primaryFosterParent} onClick={handleEntityClick} />
                                {f.secondaryFosterParent ? (
                                  <>
                                    {' a '}
                                    <EntityLink name={f.secondaryFosterParent.name} type="foster" entityData={f.secondaryFosterParent} onClick={handleEntityClick} />
                                  </>
                                ) : (
                                  <span style={{ fontSize: '12px', color: '#8181A5', marginLeft: '6px' }}>(Výhradní péče)</span>
                                )}
                              </>
                            ) : (
                              f.fosterParentsDisplay || f.fosterParents
                            )}
                          </td>
                          <td style={{ padding: '14px 8px', textAlign: 'center', fontWeight: 700 }}>
                            {f.childrenCount}
                          </td>
                          <td style={{ padding: '14px 8px', color: '#8181A5' }}>
                            {new Date(f.lastVisitAt).toLocaleDateString('cs-CZ')}
                          </td>
                          <td style={{ padding: '14px 8px', textAlign: 'right', color: '#4A85F6', fontWeight: 700 }}>
                            Otevřít spis <i className="las la-angle-right"></i>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 2px 12px rgba(154,160,185,0.08)'
                }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#1C1D21', marginBottom: '20px' }}>
                    Plánované návštěvy
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{
                      padding: '14px',
                      borderRadius: '12px',
                      backgroundColor: '#F7F9FC',
                      borderLeft: '4px solid #FF808B'
                    }}>
                      <span style={{ fontSize: '12px', color: '#FF808B', fontWeight: 800 }}>VYŽADOVÁNA NÁVŠTĚVA</span>
                      <h4 style={{ margin: '4px 0', fontSize: '14px', fontWeight: 700 }}>Marie Svobodová</h4>
                      <span style={{ fontSize: '12px', color: '#8181A5' }}>Lhůta vyprší za 5 dní</span>
                    </div>

                    <div style={{
                      padding: '14px',
                      borderRadius: '12px',
                      backgroundColor: '#F7F9FC',
                      borderLeft: '4px solid #4A85F6'
                    }}>
                      <span style={{ fontSize: '12px', color: '#4A85F6', fontWeight: 800 }}>PLÁNOVANÁ NÁVŠTĚVA</span>
                      <h4 style={{ margin: '4px 0', fontSize: '14px', fontWeight: 700 }}>Petr a Anna Dvořákovi</h4>
                      <span style={{ fontSize: '12px', color: '#8181A5' }}>Příští týden (Úterý 14:00)</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Plovoucí akční tlačítko FAB pro PWA verzi */}
        {isMobileView && (
          <button
            onClick={() => alert("Spouštím rychlý zápis...")}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#4A85F6',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(74,133,246,0.4)',
              cursor: 'pointer',
              zIndex: 9999
            }}
          >
            <i className="las la-plus"></i>
          </button>
        )}

        <EntityProfileModal
          entity={activeModalEntity}
          onClose={() => setActiveModalEntity(null)}
        />
      </div>
    </div>
  );
}
export default Dashboard;
