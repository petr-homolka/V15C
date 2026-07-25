import React, { useState, useEffect } from 'react';

export function RoutineBlockEditor({ initialTitle = 'Dnes', initialBlocks = [] }) {
  const [title, setTitle] = useState(initialTitle);
  const [blocks, setBlocks] = useState(initialBlocks.length > 0 ? initialBlocks : [
    { id: 'b1', type: 'h1', text: 'Zápis z návštěvy v rodině Dvořákových' },
    { id: 'b2', type: 'text', text: 'Pěstouni vnímavě podporují školní docházku Tomáše. Zvolte styl odstavce napsáním / nebo klikněte pravým tlačítkem pro smazání.' },
    { id: 'b3', type: 'callout-info', text: 'OSPOD doporučuje prodloužený čas na písemné zkoušky pro dítě Tomáše Dvořáka.' },
    { id: 'b4', type: 'check-list', text: 'Zkontrolovat výkaz respitní péče', checked: false },
    { id: 'b5', type: 'bullet-list', text: 'Doporučení z pedagogicko-psychologické poradny' }
  ]);

  const [hoveredBlockId, setHoveredBlockId] = useState(null);
  const [hoveredPlusId, setHoveredPlusId] = useState(null);
  const [slashMenuBlockId, setSlashMenuBlockId] = useState(null);
  const [slashQuery, setSlashQuery] = useState('');
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const [dragOverBlockId, setDragOverBlockId] = useState(null);
  const [isTocExpanded, setIsTocExpanded] = useState(false);
  const [activeTocId, setActiveTocId] = useState('b1');

  // Kontextové menu pravého tlačítka mysi (Context Menu / Delete)
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, blockId: null });

  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu.visible) setContextMenu({ visible: false, x: 0, y: 0, blockId: null });
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [contextMenu.visible]);

  const handleContextMenu = (e, blockId) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      blockId: blockId
    });
  };

  // Zpracování stisku /
  const handleTextChange = (id, newText) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, text: newText } : b));

    if (newText.endsWith('/')) {
      setSlashMenuBlockId(id);
      setSlashQuery('');
    } else if (slashMenuBlockId === id) {
      if (!newText.includes('/')) {
        setSlashMenuBlockId(null);
      } else {
        const afterSlash = newText.split('/').pop();
        setSlashQuery(afterSlash);
      }
    }
  };

  // Přidání nového bloku
  const handleAddBlock = (targetId, position = 'below', type = 'text') => {
    const newBlock = {
      id: `b_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: type,
      text: type === 'h1' ? 'Velký nadpis' : type === 'h2' ? 'Střední nadpis' : type === 'h3' ? 'Malý nadpis' : type === 'check-list' ? 'Úkol / Checkbox' : type === 'stamp-today' ? `Dnes (${new Date().toLocaleDateString('cs-CZ')})` : '',
      checked: false
    };

    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === targetId);
      if (idx === -1) return [...prev, newBlock];
      const next = [...prev];
      const insertIdx = position === 'above' ? idx : idx + 1;
      next.splice(insertIdx, 0, newBlock);
      return next;
    });
    setSlashMenuBlockId(null);
  };

  // Duplikace odstavce
  const handleDuplicateBlock = (blockId) => {
    const targetBlock = blocks.find(b => b.id === blockId);
    if (!targetBlock) return;
    const cloned = {
      ...targetBlock,
      id: `b_${Date.now()}_dup`
    };
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === blockId);
      const next = [...prev];
      next.splice(idx + 1, 0, cloned);
      return next;
    });
    setContextMenu({ visible: false, x: 0, y: 0, blockId: null });
  };

  // Změna typu bloku přes slash menu
  const handleSelectBlockType = (blockId, type) => {
    const nowStr = new Date().toLocaleDateString('cs-CZ');
    const timeStr = new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });

    setBlocks(prev => prev.map(b => {
      if (b.id === blockId) {
        const cleanText = b.text.replace(/\/$/, '').trim();
        let defaultText = cleanText;

        if (type === 'stamp-date') defaultText = defaultText || nowStr;
        if (type === 'stamp-datetime') defaultText = defaultText || `${nowStr} ${timeStr}`;
        if (type === 'stamp-time') defaultText = defaultText || timeStr;
        if (type === 'stamp-today') defaultText = defaultText || `Dnes (${nowStr})`;
        if (type === 'stamp-tomorrow') defaultText = defaultText || 'Zítra';
        if (type === 'stamp-yesterday') defaultText = defaultText || 'Včera';
        if (type === 'stamp-dow') defaultText = defaultText || 'Pátek';
        if (type === 'stamp-week') defaultText = defaultText || 'Týden 30';
        if (type === 'stamp-month') defaultText = defaultText || 'Červenec';
        if (type === 'stamp-quarter') defaultText = defaultText || 'Q3 2026';

        return { ...b, type, text: defaultText || (type === 'divider' ? '' : b.text) };
      }
      return b;
    }));
    setSlashMenuBlockId(null);
  };

  // Smazání bloku (Delete)
  const handleDeleteBlock = (id) => {
    if (blocks.length <= 1) return;
    setBlocks(prev => prev.filter(b => b.id !== id));
    setContextMenu({ visible: false, x: 0, y: 0, blockId: null });
  };

  // Drag & drop odstavců
  const handleDragStart = (e, id) => {
    setDraggedBlockId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (dragOverBlockId !== id) {
      setDragOverBlockId(id);
    }
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedBlockId || draggedBlockId === targetId) {
      setDraggedBlockId(null);
      setDragOverBlockId(null);
      return;
    }

    setBlocks(prev => {
      const srcIdx = prev.findIndex(b => b.id === draggedBlockId);
      const targetIdx = prev.findIndex(b => b.id === targetId);
      if (srcIdx === -1 || targetIdx === -1) return prev;

      const result = [...prev];
      const [removed] = result.splice(srcIdx, 1);
      result.splice(targetIdx, 0, removed);
      return result;
    });

    setDraggedBlockId(null);
    setDragOverBlockId(null);
  };

  // VŠECHNY POLOŽKY ZE ZADANÉHO ROUTINE HTML KÓDU (8 KATEGORIÍ)
  const slashMenuItems = [
    // Content
    { category: 'Content', id: 'text', label: 'Text', shortcut: '', icon: 'las la-font' },
    { category: 'Content', id: 'quote', label: 'Quote', shortcut: '|', icon: 'las la-quote-right' },
    { category: 'Content', id: 'code', label: 'Code', shortcut: '```', icon: 'las la-code' },
    { category: 'Content', id: 'divider', label: 'Divider', shortcut: '---', icon: 'las la-minus' },
    { category: 'Content', id: 'reference', label: 'Reference', shortcut: '[[', icon: 'las la-link' },
    { category: 'Content', id: 'emoji', label: 'Ikona', shortcut: ':', icon: 'las la-icons' },
    
    // Callouts
    { category: 'Callouts', id: 'callout-info', label: 'Info', shortcut: '', icon: 'las la-info-circle' },
    { category: 'Callouts', id: 'callout-idea', label: 'Idea', shortcut: '', icon: 'las la-lightbulb' },
    { category: 'Callouts', id: 'callout-alert', label: 'Alert', shortcut: '', icon: 'las la-exclamation-triangle' },

    // Lists
    { category: 'Lists', id: 'check-list', label: 'Check list', shortcut: '()', icon: 'las la-check-circle' },
    { category: 'Lists', id: 'bullet-list', label: 'Bulleted list', shortcut: '-', icon: 'las la-list-ul' },
    { category: 'Lists', id: 'ordered-list', label: 'Ordered list', shortcut: '1.', icon: 'las la-list-ol' },

    // Headings
    { category: 'Headings', id: 'h1', label: 'Big heading', shortcut: '#', icon: 'las la-heading' },
    { category: 'Headings', id: 'h2', label: 'Medium heading', shortcut: '##', icon: 'las la-heading' },
    { category: 'Headings', id: 'h3', label: 'Small heading', shortcut: '###', icon: 'las la-heading' },

    // Media
    { category: 'Media', id: 'embed', label: 'Embed', shortcut: '', icon: 'las la-globe' },
    { category: 'Media', id: 'image', label: 'Image', shortcut: '', icon: 'las la-image' },
    { category: 'Media', id: 'video', label: 'Video', shortcut: '', icon: 'las la-video' },
    { category: 'Media', id: 'file', label: 'File', shortcut: '', icon: 'las la-file-alt' },

    // Objects
    { category: 'Objects', id: 'task', label: 'Task', shortcut: '[]', icon: 'las la-tasks' },
    { category: 'Objects', id: 'label', label: 'Label', shortcut: '', icon: 'las la-tag' },

    // Views
    { category: 'Views', id: 'view-list', label: 'List view', shortcut: '', icon: 'las la-bars' },
    { category: 'Views', id: 'view-board', label: 'Board view', shortcut: '', icon: 'las la-columns' },
    { category: 'Views', id: 'view-table', label: 'Table view', shortcut: '', icon: 'las la-table' },

    // Stamps
    { category: 'Stamps', id: 'stamp-date', label: 'Date', shortcut: '', icon: 'las la-calendar' },
    { category: 'Stamps', id: 'stamp-datetime', label: 'Date & time', shortcut: '', icon: 'las la-calendar-plus' },
    { category: 'Stamps', id: 'stamp-time', label: 'Time', shortcut: '', icon: 'las la-clock' },
    { category: 'Stamps', id: 'stamp-today', label: 'Today', shortcut: '', icon: 'las la-calendar-day' },
    { category: 'Stamps', id: 'stamp-tomorrow', label: 'Tomorrow', shortcut: '', icon: 'las la-calendar-week' },
    { category: 'Stamps', id: 'stamp-yesterday', label: 'Yesterday', shortcut: '', icon: 'las la-history' },
    { category: 'Stamps', id: 'stamp-dow', label: 'Day of week', shortcut: '', icon: 'las la-calendar-alt' },
    { category: 'Stamps', id: 'stamp-week', label: 'Week number', shortcut: '', icon: 'las la-hashtag' },
    { category: 'Stamps', id: 'stamp-month', label: 'Month', shortcut: '', icon: 'las la-calendar-check' },
    { category: 'Stamps', id: 'stamp-quarter', label: 'Quarter', shortcut: '', icon: 'las la-chart-pie' },
    { category: 'Stamps', id: 'stamp-semester', label: 'Semester', shortcut: '', icon: 'las la-graduation-cap' },
    { category: 'Stamps', id: 'stamp-year', label: 'Year', shortcut: '', icon: 'las la-calendar-times' }
  ];

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '720px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Nadpis dokumentu */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Bez názvu"
        style={{
          width: '100%',
          fontSize: '32px',
          fontWeight: 700,
          color: '#171b1f',
          border: 'none',
          outline: 'none',
          marginBottom: '24px',
          letterSpacing: '-1px',
          backgroundColor: 'transparent'
        }}
      />

      {/* Seznam bloků odstavců */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {blocks.map((b, bIdx) => {
          const isHovered = hoveredBlockId === b.id;
          const isSlashOpen = slashMenuBlockId === b.id;
          const isDragTarget = dragOverBlockId === b.id;

          return (
            <div
              key={b.id}
              onMouseEnter={() => { setHoveredBlockId(b.id); setActiveTocId(b.id); }}
              onMouseLeave={() => { setHoveredBlockId(null); setHoveredPlusId(null); }}
              onContextMenu={(e) => handleContextMenu(e, b.id)}
              onDragOver={(e) => handleDragOver(e, b.id)}
              onDrop={(e) => handleDrop(e, b.id)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                padding: '4px 0',
                borderBottom: isDragTarget ? '2px solid #FF4742' : '2px solid transparent',
                transition: 'border-color 0.1s ease'
              }}
            >
              {/* Levé grip ikony (+ a :::) při hoveru */}
              <div 
                style={{
                  position: 'absolute',
                  left: '-54px',
                  top: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.12s ease',
                  userSelect: 'none'
                }}
              >
                {/* Tlačítko + s vyskakovacím tooltipem */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={(e) => handleAddBlock(b.id, e.altKey ? 'above' : 'below')}
                    onMouseEnter={() => setHoveredPlusId(b.id)}
                    onMouseLeave={() => setHoveredPlusId(null)}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '5px',
                      border: 'none',
                      backgroundColor: '#f2f2f2',
                      color: '#5e6774',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    +
                  </button>

                  {/* Tooltip +: Click to add below / Alt+Click to add above */}
                  {hoveredPlusId === b.id && (
                    <div style={{
                      position: 'absolute',
                      bottom: '28px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#171b1f',
                      color: '#ffffff',
                      fontSize: '11px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 100,
                      pointerEvents: 'none'
                    }}>
                      <div><strong>Click</strong> přidat pod</div>
                      <div style={{ color: '#a0a0b0' }}><strong>Alt+Click</strong> přidat nad</div>
                    </div>
                  )}
                </div>

                {/* Grip ikona ::: pro přetahování a menu po kliku pravým tlačítkem */}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, b.id)}
                  onClick={(e) => handleContextMenu(e, b.id)}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'grab',
                    color: '#747f8f',
                    fontSize: '14px'
                  }}
                  title="Přetáhnout nebo pravé tlačítko pro smazání"
                >
                  ⠿
                </div>
              </div>

              {/* RŮZNÉ TYPY BLOKŮ */}
              <div style={{ flexGrow: 1 }}>
                
                {/* Standardní Text */}
                {b.type === 'text' && (
                  <textarea
                    value={b.text}
                    onChange={(e) => handleTextChange(b.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddBlock(b.id, 'below');
                      } else if (e.key === 'Backspace' && !b.text) {
                        e.preventDefault();
                        handleDeleteBlock(b.id);
                      }
                    }}
                    placeholder="Napište něco nebo stiskněte / pro volbu stylu..."
                    rows={Math.max(1, Math.ceil(b.text.length / 70))}
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      fontSize: '15px',
                      lineHeight: '1.6',
                      color: '#171b1f',
                      backgroundColor: 'transparent',
                      fontFamily: 'Inter, sans-serif',
                      resize: 'none'
                    }}
                  />
                )}

                {/* Big Heading (H1) */}
                {b.type === 'h1' && (
                  <input
                    type="text"
                    value={b.text}
                    onChange={(e) => handleTextChange(b.id, e.target.value)}
                    placeholder="Velký nadpis..."
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '24px', fontWeight: 700, color: '#171b1f', letterSpacing: '-0.5px' }}
                  />
                )}

                {/* Medium Heading (H2) */}
                {b.type === 'h2' && (
                  <input
                    type="text"
                    value={b.text}
                    onChange={(e) => handleTextChange(b.id, e.target.value)}
                    placeholder="Střední nadpis..."
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '19px', fontWeight: 600, color: '#171b1f' }}
                  />
                )}

                {/* Small Heading (H3) */}
                {b.type === 'h3' && (
                  <input
                    type="text"
                    value={b.text}
                    onChange={(e) => handleTextChange(b.id, e.target.value)}
                    placeholder="Malý nadpis..."
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '16px', fontWeight: 600, color: '#47505d' }}
                  />
                )}

                {/* Check list */}
                {b.type === 'check-list' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div 
                      className={`routine-checkbox ${b.checked ? 'checked' : ''}`}
                      onClick={() => setBlocks(prev => prev.map(x => x.id === b.id ? { ...x, checked: !x.checked } : x))}
                    >
                      {b.checked && <i className="las la-check" style={{ fontSize: '10px' }}></i>}
                    </div>
                    <input
                      type="text"
                      value={b.text}
                      onChange={(e) => handleTextChange(b.id, e.target.value)}
                      placeholder="Úkol..."
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '15px', color: b.checked ? '#8896a9' : '#171b1f', textDecoration: b.checked ? 'line-through' : 'none' }}
                    />
                  </div>
                )}

                {/* Bulleted list */}
                {b.type === 'bullet-list' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px', color: '#171b1f', lineHeight: 1 }}>•</span>
                    <input
                      type="text"
                      value={b.text}
                      onChange={(e) => handleTextChange(b.id, e.target.value)}
                      placeholder="Položka seznamu..."
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '15px', color: '#171b1f' }}
                    />
                  </div>
                )}

                {/* Ordered list */}
                {b.type === 'ordered-list' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#747f8f', width: '18px' }}>{bIdx + 1}.</span>
                    <input
                      type="text"
                      value={b.text}
                      onChange={(e) => handleTextChange(b.id, e.target.value)}
                      placeholder="Číslovaná položka..."
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '15px', color: '#171b1f' }}
                    />
                  </div>
                )}

                {/* Citace (Quote) */}
                {b.type === 'quote' && (
                  <div style={{ borderLeft: '3px solid #171b1f', paddingLeft: '14px', margin: '4px 0' }}>
                    <textarea
                      value={b.text}
                      onChange={(e) => handleTextChange(b.id, e.target.value)}
                      rows={2}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '15px', fontStyle: 'italic', color: '#5e6774', backgroundColor: 'transparent', resize: 'none' }}
                    />
                  </div>
                )}

                {/* Kód (Code) */}
                {b.type === 'code' && (
                  <div style={{ backgroundColor: '#f6f6f7', padding: '10px 14px', borderRadius: '7px', fontFamily: 'monospace' }}>
                    <textarea
                      value={b.text}
                      onChange={(e) => handleTextChange(b.id, e.target.value)}
                      rows={2}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', color: '#171b1f', backgroundColor: 'transparent', fontFamily: 'monospace', resize: 'none' }}
                    />
                  </div>
                )}

                {/* Oddělovač (Divider) */}
                {b.type === 'divider' && (
                  <div style={{ padding: '12px 0' }}>
                    <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: 0 }} />
                  </div>
                )}

                {/* Callout Info */}
                {b.type === 'callout-info' && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: '#eef4ff', borderLeft: '4px solid #4a85f6', padding: '12px 14px', borderRadius: '7px' }}>
                    <i className="las la-info-circle" style={{ fontSize: '18px', color: '#4a85f6', marginTop: '2px' }}></i>
                    <textarea
                      value={b.text}
                      onChange={(e) => handleTextChange(b.id, e.target.value)}
                      rows={2}
                      style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#171b1f', resize: 'none' }}
                    />
                  </div>
                )}

                {/* Callout Idea */}
                {b.type === 'callout-idea' && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b', padding: '12px 14px', borderRadius: '7px' }}>
                    <i className="las la-lightbulb" style={{ fontSize: '18px', color: '#f59e0b', marginTop: '2px' }}></i>
                    <textarea
                      value={b.text}
                      onChange={(e) => handleTextChange(b.id, e.target.value)}
                      rows={2}
                      style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#171b1f', resize: 'none' }}
                    />
                  </div>
                )}

                {/* Callout Alert */}
                {b.type === 'callout-alert' && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: '#ffebeb', borderLeft: '4px solid #ff4742', padding: '12px 14px', borderRadius: '7px' }}>
                    <i className="las la-exclamation-triangle" style={{ fontSize: '18px', color: '#ff4742', marginTop: '2px' }}></i>
                    <textarea
                      value={b.text}
                      onChange={(e) => handleTextChange(b.id, e.target.value)}
                      rows={2}
                      style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#171b1f', resize: 'none' }}
                    />
                  </div>
                )}

                {/* Stamps */}
                {b.type.startsWith('stamp-') && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#f2f2f2', padding: '4px 10px', borderRadius: '6px', color: '#171b1f', fontSize: '13px', fontWeight: 600 }}>
                    <i className="las la-clock" style={{ fontSize: '15px', color: '#FF4742' }}></i>
                    <span>{b.text}</span>
                  </div>
                )}

                {/* Media & Objects Placeholder */}
                {(b.type === 'image' || b.type === 'video' || b.type === 'file' || b.type === 'embed') && (
                  <div style={{ border: '1px dashed #d0cbcb', padding: '16px', borderRadius: '8px', textAlign: 'center', color: '#747f8f', fontSize: '13px', backgroundColor: '#fafafa' }}>
                    <i className="las la-cloud-upload-alt" style={{ fontSize: '24px', display: 'block', marginBottom: '4px' }}></i>
                    <span>Připojit {b.type} (Klikněte nebo přetáhněte soubor)</span>
                  </div>
                )}

              </div>

              {/* VYSKAKOVACÍ SLASH MENU MENU SE VŠEMI 36 POLOŽKAMI Z ROUTINE HTML */}
              {isSlashOpen && (
                <div className="suggestion-list" style={{ position: 'absolute', top: '32px', left: '20px' }}>
                  {['Content', 'Callouts', 'Lists', 'Headings', 'Media', 'Objects', 'Views', 'Stamps'].map(cat => {
                    const catItems = slashMenuItems.filter(i => i.category === cat && i.label.toLowerCase().includes(slashQuery.toLowerCase()));
                    if (catItems.length === 0) return null;

                    return (
                      <div key={cat}>
                        <div className="group-header">{cat}</div>
                        {catItems.map(item => (
                          <div
                            key={item.id}
                            className="suggestion-list__item"
                            onClick={() => handleSelectBlockType(b.id, item.id)}
                          >
                            <i className={item.icon} style={{ fontSize: '16px', color: '#79818c' }}></i>
                            <div className="command-content">
                              <span>{item.label}</span>
                              {item.shortcut && <span className="command-help">{item.shortcut}</span>}
                            </div>
                          </div>
                        ))}
                        <div className="separator"></div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* OFICIÁLNÍ KONTEXTOVÉ MENU PRAVÉHO TLAČÍTKA MYSII (ROUTINE CONTEXT MENU / DELETE) */}
      {contextMenu.visible && (
        <div 
          className="integration-edit-popup"
          style={{
            position: 'fixed',
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            zIndex: 99999,
            backgroundColor: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            padding: '4px',
            minWidth: '180px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="base-button isExpanded context-action"
            onClick={() => handleDuplicateBlock(contextMenu.blockId)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '6px 10px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', color: '#171b1f' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f2f2f2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="las la-copy" style={{ color: '#747f8f' }}></i>
              <span>Duplikovat</span>
            </div>
            <span style={{ fontSize: '11px', color: '#a9a9a9' }}>Ctrl+D</span>
          </button>

          <button 
            className="base-button isExpanded context-action"
            onClick={() => { handleAddBlock(contextMenu.blockId, 'above'); setContextMenu({ visible: false, x: 0, y: 0, blockId: null }); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '6px 10px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', color: '#171b1f' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f2f2f2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="las la-arrow-up" style={{ color: '#747f8f' }}></i>
              <span>Přidat nad</span>
            </div>
          </button>

          <button 
            className="base-button isExpanded context-action"
            onClick={() => { handleAddBlock(contextMenu.blockId, 'below'); setContextMenu({ visible: false, x: 0, y: 0, blockId: null }); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '6px 10px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', color: '#171b1f' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f2f2f2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="las la-arrow-down" style={{ color: '#747f8f' }}></i>
              <span>Přidat pod</span>
            </div>
          </button>

          <div style={{ height: '1px', backgroundColor: '#f2f2f2', margin: '4px 0' }}></div>

          {/* Tlačítko Smazat s červeným podbarvením po najetí */}
          <button 
            className="base-button isExpanded context-action red"
            onClick={() => handleDeleteBlock(contextMenu.blockId)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '6px 10px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', color: '#ff4742' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fbefee'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="las la-trash-alt" style={{ color: '#ff4742' }}></i>
              <span style={{ fontWeight: 600 }}>Smazat</span>
            </div>
            <span style={{ fontSize: '11px', color: '#ff4742' }}>Del</span>
          </button>
        </div>
      )}

      {/* BOČNÍ PANEL OSNOVY (TABLE OF CONTENTS) */}
      <div 
        className={`table-of-contents ${isTocExpanded ? 'expanded' : ''}`}
        onMouseEnter={() => setIsTocExpanded(true)}
        onMouseLeave={() => setIsTocExpanded(false)}
      >
        <div className="toc-content">
          {blocks.map((b, idx) => {
            const levelClass = b.type === 'h1' ? 'level-1' : b.type === 'h2' ? 'level-2' : 'level-3';
            const isActive = activeTocId === b.id;

            return (
              <div 
                key={b.id} 
                className={`toc-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTocId(b.id)}
              >
                <div className={`toc-line ${levelClass}`}></div>
                <span className="toc-text">{b.text.substring(0, 22) || `Odstavec ${idx + 1}`}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
export default RoutineBlockEditor;
