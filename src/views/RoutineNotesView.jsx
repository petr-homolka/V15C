import React, { useState } from 'react';
import { RoutineBlockEditor } from '../components/common/RoutineBlockEditor.jsx';

export function RoutineNotesView() {
  const [notes] = useState([
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
    <div className="flex flex-row h-full w-full bg-white overflow-hidden">
      {/* Levý strom poznámek */}
      <div className="w-72 border-r border-[#e8e8ed] p-6 flex flex-col gap-4 bg-white shrink-0">
        <div>
          <span className="text-[11px] font-bold text-[var(--routine-text-secondary)] uppercase tracking-wider">
            ROUTINE BLOCK EDITOR
          </span>
          <h1 className="text-xl font-bold text-[var(--routine-text-primary)] mt-1">
            Poznámky & Zápisy
          </h1>
        </div>

        <div className="flex flex-col gap-1">
          {notes.map(n => {
            const isSelected = selectedNoteId === n.id;
            return (
              <div
                key={n.id}
                onClick={() => setSelectedNoteId(n.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#f4f4f6] text-[var(--routine-text-primary)] font-semibold'
                    : 'hover:bg-[#f8f8fa] text-[var(--routine-text-secondary)]'
                }`}
              >
                <div className="text-xs truncate">{n.title}</div>
                <span className="text-[11px] text-[var(--routine-text-muted)] font-mono">{n.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pravá část: Interaktivní Routine Block Editor s `/` menu a přesouváním odstavců */}
      <div className="flex-1 p-10 overflow-y-auto bg-white">
        {selectedNote ? (
          <RoutineBlockEditor
            key={selectedNote.id}
            initialTitle={selectedNote.title}
            initialBlocks={selectedNote.blocks}
          />
        ) : (
          <div className="text-xs text-[var(--routine-text-secondary)]">Vyberte zápis</div>
        )}
      </div>
    </div>
  );
}

export default RoutineNotesView;
