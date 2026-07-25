import { useState, useEffect } from 'react';
import { db, auth } from './services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { SignIn } from './ui_kits/crm-dashboard/screens/SignIn.jsx';
import { Registration } from './views/Registration.jsx';
import { Dashboard } from './views/Dashboard.jsx';
import { FamilyFolder } from './views/FamilyFolder.jsx';
import { Settings } from './views/Settings.jsx';
import { ImportExport } from './views/ImportExport.jsx';
import { FosterParentPortal } from './views/FosterParentPortal.jsx';
import { OspodReportView } from './views/OspodReportView.jsx';
import { RespitEducationView } from './views/RespitEducationView.jsx';
import { SuperAdminView } from './views/SuperAdminView.jsx';
import { CalendarView } from './views/CalendarView.jsx';
import { MessagesView } from './views/MessagesView.jsx';
import { RoutineAgendaView } from './views/RoutineAgendaView.jsx';
import { RoutineContactsView } from './views/RoutineContactsView.jsx';
import { RoutineNotesView } from './views/RoutineNotesView.jsx';
import { EntityProfileView } from './views/EntityProfileView.jsx';
import { QuickCaptureConsole } from './components/common/QuickCaptureConsole.jsx';
import RoutineCommandKModal from './components/navigation/RoutineCommandKModal.jsx';
import './styles/routineDesign.css';

function App() {
  const [page, setPage] = useState('signin');
  const [dashboardSubView, setDashboardSubView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [isQuickConsoleOpen, setIsQuickConsoleOpen] = useState(false);
  const [isCommandKOpen, setIsCommandKOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [viewportMode, setViewportMode] = useState('desktop'); // 'desktop' | 'mobile'

  const handleNavigate = (targetPage, subView = 'dashboard') => {
    setPage(targetPage);
    if (subView) setDashboardSubView(subView);
  };

  const handleOpenEntityProfile = (entityData) => {
    setSelectedEntity(entityData);
    setPage('entity-profile');
  };

  // Globální klávesová zkratka Ctrl+K / Cmd+K pro Routine Quick Capture Console
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickConsoleOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isMobile = viewportMode === 'mobile';

  // Uplatnění uloženého měřítka písma při startu
  useEffect(() => {
    const savedScale = localStorage.getItem('font_scale') || '1.33';
    const root = document.documentElement;
    const baseSizes = { h1: 32, h2: 26, h3: 22, h4: 18, bodyLg: 16, body: 14, caption: 12 };
    const scale = parseFloat(savedScale);
    root.style.setProperty('--text-h1', `${Math.round(baseSizes.h1 * scale)}px`);
    root.style.setProperty('--text-h2', `${Math.round(baseSizes.h2 * scale)}px`);
    root.style.setProperty('--text-h3', `${Math.round(baseSizes.h3 * scale)}px`);
    root.style.setProperty('--text-h4', `${Math.round(baseSizes.h4 * scale)}px`);
    root.style.setProperty('--text-body-lg', `${Math.round(baseSizes.bodyLg * scale)}px`);
    root.style.setProperty('--text-body', `${Math.round(baseSizes.body * scale)}px`);
    root.style.setProperty('--text-caption', `${Math.round(baseSizes.caption * scale)}px`);
  }, []);

  const handleUpdateUserBranding = (branding, rates, terminology) => {
    setUser(prev => {
      const updated = {
        ...prev,
        branding,
        respitRates: rates,
        terminologyOverrides: terminology
      };
      if (localStorage.getItem('sandbox_user')) {
        localStorage.setItem('sandbox_user', JSON.stringify(updated));
      }
      return updated;
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({ uid: authUser.uid, email: authUser.email, ...userData });
          } else {
            setUser({ uid: authUser.uid, email: authUser.email, name: 'Klíčová osoba', role: 'ko' });
          }
        } catch (e) {
          setUser({ uid: authUser.uid, email: authUser.email, name: 'Klíčová osoba', role: 'ko' });
        }
        setPage('dashboard');
      } else {
        const cachedUser = localStorage.getItem('sandbox_user');
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
          setPage('dashboard');
        } else {
          setUser(null);
          setPage('signin');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    try {
      if (email && password) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const mockUser = {
          uid: 'sandbox_ko_01',
          name: 'Mgr. Jana Nováková',
          email: 'jana.novakova@doprovazeni.cz',
          role: 'ko',
          organizationId: '0001',
          organizationName: 'Centrum pěstounských rodin'
        };
        localStorage.setItem('sandbox_user', JSON.stringify(mockUser));
        setUser(mockUser);
        setPage('dashboard');
      }
    } catch (err) {
      const mockUser = {
        uid: 'sandbox_ko_01',
        name: 'Mgr. Jana Nováková',
        email: 'jana.novakova@doprovazeni.cz',
        role: 'ko',
        organizationId: '0001',
        organizationName: 'Centrum pěstounských rodin'
      };
      localStorage.setItem('sandbox_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setPage('dashboard');
    }
  };

  const handleSelectFamily = (family) => {
    setSelectedFamily(family);
    setPage('family-detail');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F7F9FC' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#4A85F6' }}>Načítám portál Doprovázení...</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1C1D21', overflow: 'hidden' }}>
      {/* Horní ovládací lišta prototypu */}
      <div style={{
        height: '44px',
        backgroundColor: '#121316',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        color: '#FFFFFF',
        fontSize: '13px',
        fontWeight: 600,
        zIndex: 10000,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#4A85F6', fontWeight: 800 }}>PROTOTYP CRM WORKROOM</span>
          <span style={{ color: '#8181A5' }}>| Doprovázení.com</span>
        </div>

        {/* Přepínač režimu náhledu */}
        <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '2px' }}>
          <button
            onClick={() => setViewportMode('desktop')}
            style={{
              backgroundColor: viewportMode === 'desktop' ? '#4A85F6' : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="las la-desktop"></i>
            <span>Desktop náhled</span>
          </button>

          <button
            onClick={() => setViewportMode('mobile')}
            style={{
              backgroundColor: viewportMode === 'mobile' ? '#4A85F6' : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="las la-mobile"></i>
            <span>PWA Mobilní náhled</span>
          </button>
        </div>
      </div>

      {/* Rámce aplikace */}
      <div style={{
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: viewportMode === 'mobile' ? '#0F1012' : '#F7F9FC',
        overflow: 'hidden',
        padding: viewportMode === 'mobile' ? '20px' : 0
      }}>
        <div style={{
          width: viewportMode === 'mobile' ? '390px' : '100%',
          height: viewportMode === 'mobile' ? '812px' : '100%',
          maxHeight: '100%',
          backgroundColor: '#F7F9FC',
          borderRadius: viewportMode === 'mobile' ? '32px' : 0,
          boxShadow: viewportMode === 'mobile' ? '0 20px 50px rgba(0,0,0,0.5)' : 'none',
          overflow: 'hidden',
          position: 'relative',
          border: viewportMode === 'mobile' ? '8px solid #1C1D21' : 'none',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {page === 'signin' && (
            <div style={{ padding: "40px", display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <div style={{ width: "360px", padding: "32px", backgroundColor: "#FFFFFF", borderRadius: "16px", boxShadow: "0 2px 12px rgba(154,160,185,0.08)" }}>
                <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px", fontFamily: "var(--font-display)", textAlign: "center" }}>Vstoupit do CRM</h2>
                <p style={{ color: "#8181A5", marginBottom: "24px", fontSize: "14px", textAlign: "center" }}>
                  Přihlášení klíčové osoby / administrátora
                </p>
                <form onSubmit={handleSignIn}>
                  <input
                    type="text"
                    placeholder="Kód klíčové osoby"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #E0E0E8' }}
                  />
                  <input
                    type="password"
                    placeholder="Heslo"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '8px', border: '1px solid #E0E0E8' }}
                  />
                  <button
                    type="submit"
                    style={{ width: '100%', height: '46px', backgroundColor: '#4A85F6', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Vstoupit do CRM
                  </button>
                </form>
              </div>
            </div>
          )}

          {page === 'signup' && (
            <Registration onNavigate={handleNavigate} />
          )}

          {page === 'dashboard' && (
            dashboardSubView === 'dashboard' ? (
              <RoutineAgendaView
                user={user}
                onNavigate={handleNavigate}
                onSelectEntity={handleOpenEntityProfile}
                onOpenQuickConsole={() => setIsQuickConsoleOpen(true)}
                isMobileView={isMobile}
              />
            ) : (
              <Dashboard
                user={user}
                onNavigate={handleNavigate}
                activeSubView={dashboardSubView}
                onSelectFamily={handleSelectFamily}
                onSelectEntity={handleOpenEntityProfile}
                onOpenQuickConsole={() => setIsQuickConsoleOpen(true)}
                isMobileView={isMobile}
              />
            )
          )}

          {page === 'entity-profile' && (
            <EntityProfileView
              entity={selectedEntity}
              user={user}
              onNavigate={handleNavigate}
              isMobileView={isMobile}
            />
          )}

          {page === 'family-detail' && selectedFamily && (
            <FamilyFolder
              family={selectedFamily}
              user={user}
              onBack={() => handleNavigate('dashboard')}
              onNavigate={handleNavigate}
              isMobileView={isMobile}
            />
          )}

          {page === 'settings' && (
            <Settings
              user={user}
              onNavigate={handleNavigate}
              onUpdateUserBranding={handleUpdateUserBranding}
              isMobileView={isMobile}
            />
          )}

          {page === 'import-export' && (
            <ImportExport
              user={user}
              onNavigate={handleNavigate}
              isMobileView={isMobile}
            />
          )}

          {page === 'foster-portal' && (
            <FosterParentPortal
              user={user}
              onNavigate={handleNavigate}
              isMobileView={isMobile}
            />
          )}

          {page === 'ospod-report' && (
            <OspodReportView
              user={user}
              onNavigate={handleNavigate}
              isMobileView={isMobile}
            />
          )}

          {page === 'respit' && (
            <RespitEducationView
              user={user}
              onNavigate={handleNavigate}
              isMobileView={isMobile}
            />
          )}

          {page === 'superadmin' && (
            <SuperAdminView
              user={user}
              onNavigate={handleNavigate}
              isMobileView={isMobile}
            />
          )}

          {page === 'calendar' && (
            <CalendarView
              user={user}
              onNavigate={handleNavigate}
              isMobileView={isMobile}
            />
          )}

          {page === 'messages' && (
            <MessagesView
              user={user}
              onNavigate={handleNavigate}
              isMobileView={isMobile}
            />
          )}

          {page === 'contacts' && (
            <RoutineContactsView
              user={user}
              onNavigate={handleNavigate}
              onOpenQuickConsole={() => setIsQuickConsoleOpen(true)}
              isMobileView={isMobile}
            />
          )}

          {page === 'notes' && (
            <RoutineNotesView
              user={user}
              onNavigate={handleNavigate}
              onOpenQuickConsole={() => setIsQuickConsoleOpen(true)}
              isMobileView={isMobile}
            />
          )}

          <QuickCaptureConsole
            isOpen={isQuickConsoleOpen}
            onClose={() => setIsQuickConsoleOpen(false)}
            onNavigate={handleNavigate}
            onSelectEntity={handleOpenEntityProfile}
          />

          <RoutineCommandKModal
            isOpen={isCommandKOpen}
            onClose={() => setIsCommandKOpen(false)}
            onSelectAction={(targetPath) => {
              if (targetPath === '/') handleNavigate('dashboard', 'dashboard');
              else if (targetPath === '/notes') handleNavigate('notes');
              else if (targetPath === '/contacts') handleNavigate('contacts');
              else if (targetPath === '/fosters') handleNavigate('dashboard', 'foster-parents');
              else if (targetPath === '/children') handleNavigate('dashboard', 'children');
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
