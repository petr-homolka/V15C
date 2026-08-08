import { useState, useEffect } from 'react';
import { db, auth } from './services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
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
import RoutineSidebar from './components/navigation/RoutineSidebar.jsx';
import './styles/routineDesign.css';

function App() {
  const [page, setPage] = useState('signin');
  const [dashboardSubView, setDashboardSubView] = useState('agenda');
  const [user, setUser] = useState(null);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [isQuickConsoleOpen, setIsQuickConsoleOpen] = useState(false);
  const [isCommandKOpen, setIsCommandKOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleNavigate = (targetPage, subView = 'agenda') => {
    setPage(targetPage);
    if (subView) setDashboardSubView(subView);
  };

  const handleOpenEntityProfile = (entityData) => {
    setSelectedEntity(entityData);
    setPage('entity-profile');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandKOpen(prev => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsQuickConsoleOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({ uid: authUser.uid, email: authUser.email, ...userData });
          } else {
            setUser({ uid: authUser.uid, email: authUser.email, name: 'Mgr. Jana Nováková', role: 'ko' });
          }
        } catch {
          setUser({ uid: authUser.uid, email: authUser.email, name: 'Mgr. Jana Nováková', role: 'ko' });
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
    } catch {
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
      <div className="routine-layout items-center justify-center h-screen bg-white">
        <div className="flex items-center gap-3 text-sm text-[var(--routine-text-secondary)] font-medium">
          <i className="las la-spinner la-spin text-2xl text-[var(--routine-coral)]" />
          <span>Načítám CRM Doprovázení (Routine.co)...</span>
        </div>
      </div>
    );
  }

  // Sign In Screen in Routine Style
  if (page === 'signin') {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#f8f8fa] font-sans">
        <div className="routine-card w-full max-w-sm p-8 shadow-sm border border-[#e2e4e8]">
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--routine-coral)] text-white font-bold text-lg inline-flex items-center justify-center mb-3">
              D
            </div>
            <h1 className="text-xl font-bold text-[var(--routine-text-primary)]">
              Doprovázení.com
            </h1>
            <p className="text-xs text-[var(--routine-text-secondary)] mt-1">
              CRM systém pěstounské péče v designu Routine.co
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--routine-text-secondary)] mb-1">
                Kód klíčové osoby / E-mail
              </label>
              <input
                type="text"
                className="routine-input"
                placeholder="jana.novakova@doprovazeni.cz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--routine-text-secondary)] mb-1">
                Heslo
              </label>
              <input
                type="password"
                className="routine-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="routine-btn-primary w-full justify-center py-2.5 mt-2">
              <i className="las la-sign-in-alt text-base" />
              Vstoupit do agendy
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#f0f0f4] flex items-center justify-between text-xs text-[var(--routine-text-secondary)]">
            <span>Režim simulace</span>
            <span className="routine-badge routine-badge-coral font-mono font-medium">Routine.co v10G</span>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Main Workspace Layout in 100% Routine.co Style
  return (
    <div className="routine-layout">
      {/* Official Routine Collapsible Left Navigation Sidebar */}
      <RoutineSidebar
        activePage={page}
        activeSubView={dashboardSubView}
        onNavigate={handleNavigate}
        onOpenQuickConsole={() => setIsQuickConsoleOpen(true)}
        user={user}
      />

      {/* Main Canvas Workspace */}
      <div className="routine-main-canvas flex-1 overflow-y-auto">
        {page === 'signup' && (
          <Registration onNavigate={handleNavigate} />
        )}

        {page === 'dashboard' && (
          dashboardSubView === 'agenda' ? (
            <RoutineAgendaView
              user={user}
              onNavigate={handleNavigate}
              onSelectEntity={handleOpenEntityProfile}
              onOpenQuickConsole={() => setIsQuickConsoleOpen(true)}
            />
          ) : (
            <Dashboard
              user={user}
              onNavigate={handleNavigate}
              activeSubView={dashboardSubView}
              onSelectFamily={handleSelectFamily}
              onSelectEntity={handleOpenEntityProfile}
              onOpenQuickConsole={() => setIsQuickConsoleOpen(true)}
            />
          )
        )}

        {page === 'entity-profile' && (
          <EntityProfileView
            entity={selectedEntity}
            user={user}
            onNavigate={handleNavigate}
          />
        )}

        {page === 'family-detail' && selectedFamily && (
          <FamilyFolder
            family={selectedFamily}
            user={user}
            onBack={() => handleNavigate('dashboard', 'families')}
            onNavigate={handleNavigate}
          />
        )}

        {page === 'settings' && (
          <Settings
            user={user}
            onNavigate={handleNavigate}
          />
        )}

        {page === 'import-export' && (
          <ImportExport
            user={user}
            onNavigate={handleNavigate}
          />
        )}

        {page === 'foster-portal' && (
          <FosterParentPortal
            user={user}
            onNavigate={handleNavigate}
          />
        )}

        {page === 'ospod-report' && (
          <OspodReportView
            user={user}
            onNavigate={handleNavigate}
          />
        )}

        {page === 'respit' && (
          <RespitEducationView
            user={user}
            onNavigate={handleNavigate}
          />
        )}

        {page === 'superadmin' && (
          <SuperAdminView
            user={user}
            onNavigate={handleNavigate}
          />
        )}

        {page === 'calendar' && (
          <CalendarView
            user={user}
            onNavigate={handleNavigate}
          />
        )}

        {page === 'messages' && (
          <MessagesView
            user={user}
            onNavigate={handleNavigate}
          />
        )}

        {page === 'contacts' && (
          <RoutineContactsView
            user={user}
            onNavigate={handleNavigate}
            onOpenQuickConsole={() => setIsQuickConsoleOpen(true)}
          />
        )}

        {page === 'notes' && (
          <RoutineNotesView
            user={user}
            onNavigate={handleNavigate}
            onOpenQuickConsole={() => setIsQuickConsoleOpen(true)}
          />
        )}
      </div>

      {/* Routine Quick Capture Console (Ctrl+N / Cmd+N) */}
      <QuickCaptureConsole
        isOpen={isQuickConsoleOpen}
        onClose={() => setIsQuickConsoleOpen(false)}
        onNavigate={handleNavigate}
        onSelectEntity={handleOpenEntityProfile}
      />

      {/* Routine Command Modal (Ctrl+K / Cmd+K) */}
      <RoutineCommandKModal
        isOpen={isCommandKOpen}
        onClose={() => setIsCommandKOpen(false)}
        onSelectAction={(targetPath) => {
          if (targetPath === '/') handleNavigate('dashboard', 'agenda');
          else if (targetPath === '/notes') handleNavigate('notes');
          else if (targetPath === '/contacts') handleNavigate('contacts');
          else if (targetPath === '/fosters') handleNavigate('dashboard', 'foster-parents');
          else if (targetPath === '/children') handleNavigate('dashboard', 'children');
        }}
      />
    </div>
  );
}

export default App;
