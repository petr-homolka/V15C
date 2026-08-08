import React, { useState } from 'react';

export function MessagesView() {
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
    <div className="flex flex-row h-full w-full bg-white overflow-hidden font-sans">
      {/* Levý seznam konverzací (Routine 2-pane) */}
      <div className="w-80 border-r border-[#e8e8ed] p-6 flex flex-col gap-4 bg-white shrink-0">
        <div>
          <span className="text-[11px] font-bold text-[var(--routine-text-secondary)] uppercase tracking-wider">
            ZPRÁVY & KOMUNIKACE
          </span>
          <h1 className="text-xl font-bold text-[var(--routine-text-primary)] mt-1">
            Konverzace
          </h1>
        </div>

        <div className="flex flex-col gap-1">
          {threads.map(t => {
            const isSelected = activeThread === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setActiveThread(t.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[var(--routine-coral-light)] text-[var(--routine-coral)] font-semibold'
                    : 'hover:bg-[#f4f4f6] text-[var(--routine-text-primary)]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold">{t.sender}</span>
                  <span className="text-[11px] text-[var(--routine-text-secondary)] font-mono">{t.time}</span>
                </div>
                <p className="text-[11px] text-[var(--routine-text-secondary)] truncate font-normal">
                  {t.lastMessage}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pravé okno zpráv */}
      {currentThread && (
        <div className="flex-1 p-8 overflow-y-auto bg-[#f9f9fb] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-[#e8e8ed] flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--routine-text-primary)]">
                Konverzace: {currentThread.sender}
              </h2>
              <span className="routine-badge routine-badge-green">Pěstounská rodina</span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {currentThread.messages.map(m => {
                const isMe = m.sender.includes('Nováková');
                return (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl max-w-md text-xs space-y-1 ${
                      isMe
                        ? 'ml-auto bg-[var(--routine-coral)] text-white'
                        : 'bg-white border border-[#e8e8ed] text-[var(--routine-text-primary)]'
                    }`}
                  >
                    <div className={`text-[10px] font-bold ${isMe ? 'text-white/80' : 'text-[var(--routine-text-secondary)]'}`}>
                      {m.sender} • {m.time}
                    </div>
                    <div>{m.text}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t border-[#e8e8ed]">
            <input
              type="text"
              placeholder="Napište zprávu pěstounům..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="routine-input flex-1"
            />
            <button type="submit" className="routine-btn-primary">
              <i className="las la-paper-plane text-base" />
              Odeslat
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default MessagesView;
