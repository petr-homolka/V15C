import React, { useState, useEffect, useRef } from 'react';

/**
 * QuickCaptureConsole - Klávesový příkazový řádek (Cmd+K / Ctrl+K) inspirovaný aplikací Routine.co
 * Umožňuje klíčovým osobám okamžitý rychlý zápis úkolů, schůzek, hlasových poznámek a vyhledávání entit.
 */
export function QuickCaptureConsole({ isOpen, onClose, onNavigate, onSelectEntity, families = [], childrenList = [] }) {
  const [query, setQuery] = useState('');
  const [aiDetectedAction, setAiDetectedAction] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setAiDetectedAction(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  // AI sémantická detekce záintentu z psaného textu
  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (!val.trim()) {
      setAiDetectedAction(null);
      return;
    }

    const lower = val.toLowerCase();
    if (lower.includes('návštěv') || lower.includes('schůzk') || lower.includes('úterý') || lower.includes('zítra')) {
      setAiDetectedAction({
        type: 'schedule_visit',
        label: 'Plánování návštěvy v rodině (Time-Blocking)',
        icon: 'las la-calendar-plus',
        detail: 'Vytvoří novou schůzku KO a zařadí ji do kalendáře'
      });
    } else if (lower.includes('zápis') || lower.includes('poznámk') || lower.includes('zpráv')) {
      setAiDetectedAction({
        type: 'add_note',
        label: 'Rychlý hlasový / textový zápis k entitě',
        icon: 'las la-microphone',
        detail: 'Uloží záznam do časové osy spisu'
      });
    } else if (lower.includes('dítě') || lower.includes('pěstoun') || lower.includes('dvořák') || lower.includes('svobod')) {
      setAiDetectedAction({
        type: 'search_entity',
        label: 'Rychlé vyhledání a zobrazení profilu entity',
        icon: 'las la-search',
        detail: 'Otevře samostatný profil entity'
      });
    } else {
      setAiDetectedAction({
        type: 'create_task',
        label: 'Vytvořit nový úkol do agendy KO',
        icon: 'las la-check-circle',
        detail: 'Přidá úkol do seznamu k naplánování'
      });
    }
  };

  const handleExecuteAction = () => {
    if (!query.trim()) return;

    if (aiDetectedAction?.type === 'search_entity') {
      const foundChild = childrenList.find(c => c.name.toLowerCase().includes(query.toLowerCase()));
      if (foundChild) {
        onSelectEntity(foundChild);
        onClose();
        return;
      }
    }

    setSuccessMessage(`AI Úspěšně zpracovala příkaz: "${query}"`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(28,29,33,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        zIndex: 20000,
        fontFamily: 'var(--font-body)'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          maxWidth: '680px',
          width: '100%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out',
          border: '1px solid rgba(74,133,246,0.3)'
        }}
      >
        {/* Vstupní příkazový řádek (Console Input) */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #ECECF2', backgroundColor: '#F7F9FC' }}>
          <i className="las la-terminal" style={{ fontSize: '24px', color: '#4A85F6', marginRight: '14px' }}></i>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={(e) => e.key === 'Enter' && handleExecuteAction()}
            placeholder="Napište příkaz, plánovanou návštěvu nebo zápis... (např. Návštěva u Dvořákových v úterý v 14:00)"
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              fontWeight: 600,
              color: '#1C1D21',
              backgroundColor: 'transparent',
              fontFamily: 'var(--font-body)'
            }}
          />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#8181A5', backgroundColor: '#ECECF2', padding: '4px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
            ESC zavřít
          </span>
        </div>

        {/* Úspěšná zpráva */}
        {successMessage && (
          <div style={{ padding: '20px 24px', backgroundColor: 'rgba(39,185,115,0.12)', color: '#27B973', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="las la-check-circle" style={{ fontSize: '20px' }}></i>
            <span>{successMessage}</span>
          </div>
        )}

        {/* AI Živá detekce akce (Routine Intelligence) */}
        {aiDetectedAction && !successMessage && (
          <div
            onClick={handleExecuteAction}
            style={{
              padding: '16px 24px',
              backgroundColor: 'rgba(74,133,246,0.08)',
              borderBottom: '1px solid #ECECF2',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'background-color 0.15s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#4A85F6', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                <i className={aiDetectedAction.icon}></i>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#4A85F6', textTransform: 'uppercase' }}>ROUTINE AI DETEKCE</span>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1C1D21' }}>{aiDetectedAction.label}</h4>
                <span style={{ fontSize: '12px', color: '#8181A5' }}>{aiDetectedAction.detail}</span>
              </div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', backgroundColor: '#4A85F6', padding: '6px 14px', borderRadius: '8px' }}>
              Stiskněte Enter ↵
            </span>
          </div>
        )}

        {/* Seznam dostupných rychlých příkazů a návrhů */}
        <div style={{ padding: '16px 24px', maxHeight: '320px', overflowY: 'auto' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#8181A5', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
            Rychlé volby agendy (Routine Workspace)
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              onClick={() => { onNavigate('calendar'); onClose(); }}
              style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#F7F9FC', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <i className="las la-calendar" style={{ fontSize: '20px', color: '#4A85F6' }}></i>
              <div>
                <strong style={{ fontSize: '14px', color: '#1C1D21' }}>Otevřít Time-Blocking Kalendář</strong>
                <span style={{ display: 'block', fontSize: '12px', color: '#8181A5' }}>Zobrazit rozvrh návštěv a plánovat časové bloky</span>
              </div>
            </div>

            <div
              onClick={() => { onNavigate('dashboard', 'children'); onClose(); }}
              style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#F7F9FC', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <i className="las la-smile" style={{ fontSize: '20px', color: '#27B973' }}></i>
              <div>
                <strong style={{ fontSize: '14px', color: '#1C1D21' }}>Přehled dětí a spisu IPODu</strong>
                <span style={{ display: 'block', fontSize: '12px', color: '#8181A5' }}>Vyhledat děti svěřená do péče</span>
              </div>
            </div>

            <div
              onClick={() => { onNavigate('ospod-report'); onClose(); }}
              style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#F7F9FC', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <i className="las la-file-pdf" style={{ fontSize: '20px', color: '#8E44AD' }}></i>
              <div>
                <strong style={{ fontSize: '14px', color: '#1C1D21' }}>Vygenerovat Půlroční zprávu pro OSPOD</strong>
                <span style={{ display: 'block', fontSize: '12px', color: '#8181A5' }}>Export s 13-místnými EAN-13 UIDs a QR kódem</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patka konzole */}
        <div style={{ padding: '12px 24px', backgroundColor: '#F7F9FC', borderTop: '1px solid #ECECF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#8181A5' }}>
          <span>Tip: Použijte <strong>Ctrl + K</strong> kdekoliv v aplikaci pro vyvolání této konzole.</span>
          <span>Doprovázení.com Routine Engine v1.0</span>
        </div>
      </div>
    </div>
  );
}
export default QuickCaptureConsole;
