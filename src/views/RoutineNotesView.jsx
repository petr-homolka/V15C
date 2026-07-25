import React, { useState } from 'react';
import { RoutineSidebar } from '../components/navigation/RoutineSidebar.jsx';
import { RoutineBlockEditor } from '../components/common/RoutineBlockEditor.jsx';

export function RoutineNotesView({ user, onNavigate, onOpenQuickConsole, isMobileView }) {
  const [notes, setNotes] = useState([
    { 
      id: 'n1', 
      title: 'Zápis z návštěvy u Dvořákových', 
      date: '15.06.2026',
      blocks: [
        { id: 'b1', type: 'text', text: 'Pěstouni vnímavě podporují školní docházku Tomáše. Eliška se zapojuje do předškolních aktivit. Bez rizik.' },
        { id: 'b2', type: 'callout-info', text: 'Zkontrolovat plnění cílů IPOD na příštím setkání s OSPOD.' },
        { id: 'b3', type: 'text', text: 'Napište / pro výběr dalších stylů (Citace, Kód, Odkaz, Upozornění...)' }
      ]
    },
    { 
      id: 'n2', 
      title: 'Anotace z posudku PPP pro Tomáše', 
      date: '02.05.2026',
      blocks: [
        { id: 'b1', type: 'text', text: 'Doporučeno individuální tempo výuky a prodloužený čas na písemné zkoušky.' },
        { id: 'b2', type: 'callout-idea', text: 'Doporučení konzultovat s třídní učitelkou na ZŠ Nuselská.' }
      ]
    }
  ]);

  const [selectedNoteId, setSelectedNoteId] = useState('n1');
  const selectedNote = notes.find(n => n.id === selectedNoteId);

  return (
    <div className="routine-layout">
      <RoutineSidebar
        activePage="notes"
        onNavigate={onNavigate}
        onOpenQuickConsole={onOpenQuickConsole}
        user={user}
      />

      <div className="routine-main-canvas" style={{ flexDirection: 'row' }}>
        {/* Levý strom poznámek */}
        <div style={{ width: '280px', borderRight: '1px solid #ECECF2', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#FFFFFF', flexShrink: 0 }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#747f8f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ROUTINE BLOCK EDITOR</span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 700, color: '#171b1f' }}>Poznámky & Zápisy</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {notes.map(n => (
              <div
                key={n.id}
                onClick={() => setSelectedNoteId(n.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: selectedNoteId === n.id ? '#f2f2f2' : 'transparent',
                  color: selectedNoteId === n.id ? '#171b1f' : '#747f8f',
                  cursor: 'pointer',
                  fontWeight: selectedNoteId === n.id ? 600 : 400,
                  fontSize: '13.5px',
                  transition: 'background 0.1s'
                }}
              >
                <div>{n.title}</div>
                <span style={{ fontSize: '11px', color: '#8896a9' }}>{n.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pravá část: Interaktivní Routine Block Editor s `/` menu a přesouváním odstavců */}
        <div style={{ flexGrow: 1, padding: '40px 60px', overflowY: 'auto', backgroundColor: '#FFFFFF' }}>
          {selectedNote ? (
            <RoutineBlockEditor
              key={selectedNote.id}
              initialTitle={selectedNote.title}
              initialBlocks={selectedNote.blocks}
            />
          ) : (
            <div>Vyberte zápis</div>
          )}
        </div>
      </div>
    </div>
  );
}
export default RoutineNotesView;
