import React, { useState } from 'react';
import { Sidebar } from '../components/navigation/Sidebar.jsx';
import { TopBar } from '../components/navigation/TopBar.jsx';

export function MessagesView({ user, onNavigate, isMobileView }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeThread, setActiveThread] = useState('1');
  const [newMessage, setNewMessage] = useState('');

  const [threads, setThreads] = useState([
    {
      id: '1',
      sender: 'Petr a Anna Dvořákovi',
      unread: true,
      lastMessage: 'Dobrý den, posílali jsme žádost o 4 hodiny hlídání dětí na příští pátek.',
      time: 'Dnes 14:20',
      messages: [
        { id: 'm1', sender: 'Petr Dvořák', text: 'Dobrý den, posílali jsme žádost o 4 hodiny hlídání dětí na příští pátek.', time: '14:20' }
      ]
    },
    {
      id: '2',
      sender: 'Marie Svobodová',
      unread: false,
      lastMessage: 'Potvrzuji termín návštěvy KO v úterý v 10:00.',
      time: 'Včera',
      messages: [
        { id: 'm2', sender: 'Marie Svobodová', text: 'Potvrzuji termín návštěvy KO v úterý v 10:00.', time: 'Včera' },
        { id: 'm3', sender: 'Mgr. Jana Nováková', text: 'Děkuji, budu přesně v 10:00 u vás.', time: 'Včera' }
      ]
    }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setThreads(prev => prev.map(t => {
      if (t.id === activeThread) {
        return {
          ...t,
          lastMessage: newMessage,
          messages: [...t.messages, { id: `m_${Date.now()}`, sender: 'Mgr. Jana Nováková', text: newMessage, time: 'Právě teď' }]
        };
      }
      return t;
    }));

    setNewMessage('');
  };

  const currentThread = threads.find(t => t.id === activeThread);

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
        activePage="messages" 
        onNavigate={onNavigate}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isMobile={isMobileView}
      />

      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%', overflow: 'hidden' }}>
        <TopBar 
          user={user} 
          title="Zprávy a komunikace s pěstouny" 
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          isMobile={isMobileView}
        />

        <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden', padding: isMobileView ? '16px' : '24px 40px', gap: '24px' }}>
          {/* Levý seznam konverzací */}
          <div style={{
            width: isMobileView ? '100%' : '320px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 12px rgba(154,160,185,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 800, color: '#1C1D21' }}>Konverzace s pěstouny</h3>
            {threads.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveThread(t.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: activeThread === t.id ? '#EBF2FE' : '#F7F9FC',
                  border: activeThread === t.id ? '1px solid #4A85F6' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1C1D21' }}>{t.sender}</h4>
                  <span style={{ fontSize: '11px', color: '#8181A5' }}>{t.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#8181A5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.lastMessage}
                </p>
              </div>
            ))}
          </div>

          {/* Pravé okno zpráv */}
          {(!isMobileView || activeThread) && currentThread && (
            <div style={{
              flexGrow: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(154,160,185,0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 800, borderBottom: '1px solid #ECECF2', paddingBottom: '16px', color: '#1C1D21' }}>
                  Konverzace: {currentThread.sender}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                  {currentThread.messages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: m.sender.includes('Nováková') ? 'flex-end' : 'flex-start',
                        backgroundColor: m.sender.includes('Nováková') ? '#4A85F6' : '#F7F9FC',
                        color: m.sender.includes('Nováková') ? '#FFFFFF' : '#1C1D21',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        maxWidth: '75%'
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '4px', opacity: 0.8 }}>{m.sender} • {m.time}</div>
                      <div style={{ fontSize: '13px' }}>{m.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <input
                  type="text"
                  placeholder="Napište zprávu pěstounům..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{ flexGrow: 1, padding: '12px', borderRadius: '10px', border: '1px solid #E0E0E8', fontSize: '14px' }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#4A85F6',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0 24px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Odeslat
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default MessagesView;
