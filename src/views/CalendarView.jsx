import React, { useState, useEffect } from 'react';
import { RoutineSidebar } from '../components/navigation/RoutineSidebar.jsx';

export function CalendarView({ user, onNavigate, onOpenQuickConsole, isMobileView }) {
  // 1. Náhledy kalendáře: '3-day' | '5-day' | 'Week' | 'Month'
  const [viewMode, setViewMode] = useState('Month');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 24)); // Červenec 2026

  // 2. Šířka levého panelu + Resizer
  const [drawerWidth, setDrawerWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  // 3. Aktivní událost v levém detailu (Formulář)
  const [isEventDrawerOpen, setIsEventDrawerOpen] = useState(true);
  const [activeEventId, setActiveEventId] = useState('c3');
  const [eventTitle, setEventTitle] = useState('Testovací událost');
  const [startDate, setStartDate] = useState('Jul, 24');
  const [startTime, setStartTime] = useState('10:00');
  const [duration, setDuration] = useState('30m');
  const [endDate, setEndDate] = useState('Jul, 24');
  const [endTime, setEndTime] = useState('10:30');
  const [isAllDay, setIsAllDay] = useState(false);
  const [recurrence, setRecurrence] = useState('No repeat');
  const [location, setLocation] = useState('Teplice, Čelak');
  const [calendarOwner, setCalendarOwner] = useState('Petr (Hlavní)');
  const [statusState, setStatusState] = useState('Active'); // Active | Passive
  const [busyState, setBusyState] = useState('Busy'); // Busy | Free
  const [description, setDescription] = useState('sem něco můžu napsat');

  // 4. Stavy popoverů
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false);
  const [isLocationAutocompleteOpen, setIsLocationAutocompleteOpen] = useState(false);
  const [isParticipantPickerOpen, setIsParticipantPickerOpen] = useState(false);
  const [participantInput, setParticipantInput] = useState('');
  const [isLabelPickerOpen, setIsLabelPickerOpen] = useState(false);
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);
  const [isQuickRecurrenceOpen, setIsQuickRecurrenceOpen] = useState(false);
  const [isCustomRecurrenceModalOpen, setIsCustomRecurrenceModalOpen] = useState(false);

  // Drag State pro kalendář
  const [draggedCalendarEventId, setDraggedCalendarEventId] = useState(null);

  // 5. Štítky (Screenshot 2: Home, Work, test, + New)
  const [customLabels, setCustomLabels] = useState(() => {
    const saved = localStorage.getItem('doprovazeni_labels_list');
    return saved ? JSON.parse(saved) : ['Home', 'Work', 'test', 'OSPOD', 'Klíčová návštěva', 'Vzdělávání'];
  });
  const [selectedLabels, setSelectedLabels] = useState(['Work']);
  const [labelSearchQuery, setLabelSearchQuery] = useState('');

  // 6. Účastníci
  const [participants, setParticipants] = useState(['petr.homolka@gmail.com']);
  const participantSuggestions = [
    { name: 'Petr Homolka (Gmail)', email: 'petr.homolka@gmail.com', avatar: '👤', color: '#171b1f' },
    { name: 'Petr Homolka (Outlook)', email: 'petr.homolka@outlook.com', avatar: 'P', color: '#4A85F6' },
    { name: 'Petr Homolka (ECCE Group)', email: 'petr.homolka@eccegroup.cz', avatar: '👤', color: '#10B981' },
    { name: 'Petr Homolka (BAU)', email: 'petr.homolka@bau.cz', avatar: 'P', color: '#8B5CF6' },
    { name: 'Petr Homolka (Evernote)', email: 'petrhomolka.2facb@m.evernote.com', avatar: 'E', color: '#6B7280' }
  ];

  // 7. Našeptávač lokalit
  const czechAddressDatabase = [
    'Čelakovského, Teplice 1, Teplice, Česko',
    'Česká Lékařská Komora - Okresní Sdružení Teplice, Školní, Teplice',
    'OSPOD Praha 4 - Antala Staška 2059/80, Praha',
    'Klubovna Doprovázení - Na Pankráci 45, Praha 4',
    'Václavské náměstí 1, Praha 1',
    'Nádražní 12, Brno - Střed'
  ];

  // Custom Recurrence State
  const [recurrenceQuery, setRecurrenceQuery] = useState('every week');
  const [recurrenceEveryCount, setRecurrenceEveryCount] = useState(1);
  const [recurrenceUnit, setRecurrenceUnit] = useState('Week');
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Wed']);
  const [endCondition, setEndCondition] = useState('Forever');

  // Události kalendáře
  const [calendarEvents, setCalendarEvents] = useState([
    {
      id: 'c1',
      title: 'Stay at Avena',
      dayNum: 29,
      monthOffset: -1,
      startHour: 9,
      durationHours: 2,
      startTimeStr: '09:00',
      endTimeStr: '11:00',
      isAllDay: false,
      color: '#F3F4F6',
      textColor: '#374151',
      location: 'Avena Hotel'
    },
    {
      id: 'c2',
      title: 'NÁSTUP K HÁROŠOVI :-)',
      dayNum: 7,
      monthOffset: 0,
      startHour: 10,
      durationHours: 2,
      startTimeStr: '10:00',
      endTimeStr: '12:00',
      isAllDay: false,
      color: '#F3F4F6',
      textColor: '#374151',
      location: 'Praha'
    },
    {
      id: 'c3',
      title: 'Testovací událost',
      dayNum: 24,
      monthOffset: 0,
      startHour: 10,
      durationHours: 0.5,
      startTimeStr: '10:00',
      endTimeStr: '10:30',
      isAllDay: false,
      color: '#9CA3AF',
      textColor: '#ffffff',
      location: 'Teplice, Čelak'
    },
    {
      id: 'c4',
      title: 'Klíčová návštěva u Dvořákových',
      dayNum: 14,
      monthOffset: 0,
      startHour: 13,
      durationHours: 1.5,
      startTimeStr: '13:00',
      endTimeStr: '14:30',
      isAllDay: false,
      color: '#3B82F6',
      textColor: '#ffffff',
      location: 'Praha 4 - Nusle'
    },
    {
      id: 'c5',
      title: 'OSPOD antala Staška - Jednání IPOD',
      dayNum: 18,
      monthOffset: 0,
      startHour: 11,
      durationHours: 1.0,
      startTimeStr: '11:00',
      endTimeStr: '12:00',
      isAllDay: false,
      color: '#10B981',
      textColor: '#ffffff',
      location: 'OSPOD Praha 4'
    }
  ]);

  // Drag Resizer logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = Math.max(260, Math.min(550, e.clientX - 220));
      setDrawerWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Posun měsíce (‹ / ›)
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Název měsíce
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedMonthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  // Vytvoření nové události
  const handleCreateNewEvent = (dayNumber = 24) => {
    const newId = `c_${Date.now()}`;
    const newEv = {
      id: newId,
      title: 'Nová událost',
      dayNum: dayNumber,
      monthOffset: 0,
      startHour: 10,
      durationHours: 1,
      startTimeStr: '10:00',
      endTimeStr: '11:00',
      isAllDay: false,
      color: '#9CA3AF',
      textColor: '#ffffff',
      location: ''
    };
    setCalendarEvents(prev => [...prev, newEv]);
    setActiveEventId(newId);
    setEventTitle('Nová událost');
    setStartDate(`Jul, ${dayNumber}`);
    setStartTime('10:00');
    setEndTime('11:00');
    setLocation('');
    setDescription('');
    setIsEventDrawerOpen(true);
  };

  // DRAG & DROP LOGIKA UDÁLOSTÍ V MĚSÍČNÍM POHLEDU A ČASOVÉ MŘÍŽCE
  const handleCalendarEventDragStart = (e, evId) => {
    setDraggedCalendarEventId(evId);
    e.dataTransfer.setData('text/calendar-event-id', evId);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDayCellDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDayCellDrop = (e, targetDayNum) => {
    e.preventDefault();
    const evId = e.dataTransfer.getData('text/calendar-event-id') || draggedCalendarEventId;
    if (evId) {
      setCalendarEvents(prev => prev.map(ev => {
        if (ev.id === evId) {
          return { ...ev, dayNum: targetDayNum };
        }
        return ev;
      }));
    }
    setDraggedCalendarEventId(null);
  };

  const handleTimeSlotDrop = (e, targetDayNum, targetHour) => {
    e.preventDefault();
    const evId = e.dataTransfer.getData('text/calendar-event-id') || draggedCalendarEventId;
    if (evId) {
      setCalendarEvents(prev => prev.map(ev => {
        if (ev.id === evId) {
          const startH = Math.floor(targetHour);
          const endH = startH + Math.ceil(ev.durationHours || 1);
          return {
            ...ev,
            dayNum: targetDayNum,
            startHour: targetHour,
            startTimeStr: `${startH.toString().padStart(2, '0')}:00`,
            endTimeStr: `${endH.toString().padStart(2, '0')}:00`
          };
        }
        return ev;
      }));
    }
    setDraggedCalendarEventId(null);
  };

  const timeSteps = [
    '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15',
    '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15',
    '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15'
  ];

  const handleAddNewLabel = () => {
    if (!labelSearchQuery.trim()) return;
    const cleaned = labelSearchQuery.trim();
    if (!customLabels.includes(cleaned)) {
      const updated = [...customLabels, cleaned];
      setCustomLabels(updated);
      localStorage.setItem('doprovazeni_labels_list', JSON.stringify(updated));
    }
    if (!selectedLabels.includes(cleaned)) {
      setSelectedLabels([...selectedLabels, cleaned]);
    }
    setLabelSearchQuery('');
  };

  const toggleSelectLabel = (lbl) => {
    setSelectedLabels(prev => 
      prev.includes(lbl) ? prev.filter(l => l !== lbl) : [...prev, lbl]
    );
  };

  const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const allDayEvents = calendarEvents.filter(e => e.isAllDay);
  const timedEvents = calendarEvents.filter(e => !e.isAllDay);

  return (
    <div className="routine-layout" style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      {/* 1. Levé hlavní menu Routine */}
      <RoutineSidebar
        activePage="calendar"
        activeSubView="calendar"
        onNavigate={onNavigate}
        onOpenQuickConsole={onOpenQuickConsole}
        user={user}
      />

      {/* 2. Hlavní Plátno Kalendáře */}
      <div style={{ flexGrow: 1, display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#FFFFFF', position: 'relative' }}>
        
        {/* LEVÝ RESIZABLE PANEL DETAILU */}
        {isEventDrawerOpen && (
          <div style={{
            width: `${drawerWidth}px`,
            height: '100vh',
            borderRight: '1px solid #EAEAEA',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px 20px 16px 20px',
            backgroundColor: '#FFFFFF',
            boxSizing: 'border-box',
            flexShrink: 0,
            overflowY: 'auto',
            position: 'relative'
          }}>
            <div>
              {/* Bezrámečkový nadpis události */}
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => {
                  setEventTitle(e.target.value);
                  setCalendarEvents(prev => prev.map(ev => ev.id === activeEventId ? { ...ev, title: e.target.value } : ev));
                }}
                placeholder="Bez názvu"
                style={{
                  width: '100%',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#171b1f',
                  border: 'none',
                  outline: 'none',
                  marginBottom: '20px',
                  backgroundColor: 'transparent',
                  fontFamily: 'Inter, sans-serif'
                }}
              />

              {/* Rytmus vlastností */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                
                {/* 1. ŘÁDEK START DATE */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                  <i className="las la-clock" style={{ fontSize: '16px', color: '#8896a9', width: '18px' }}></i>
                  
                  {/* Pilulka pro Datum Start */}
                  <span 
                    style={{
                      color: '#171b1f',
                      fontWeight: 500,
                      backgroundColor: '#F3F4F6',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  >
                    {startDate}
                  </span>

                  {!isAllDay && (
                    <>
                      <span 
                        style={{
                          color: '#171b1f',
                          fontWeight: 500,
                          backgroundColor: '#F3F4F6',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        onClick={() => setIsStartTimePickerOpen(!isStartTimePickerOpen)}
                      >
                        {startTime}
                      </span>

                      <span style={{ color: '#8896a9', fontSize: '11px', backgroundColor: '#F3F4F6', padding: '2px 6px', borderRadius: '4px' }}>
                        {duration}
                      </span>
                    </>
                  )}

                  {isDatePickerOpen && (
                    <div className="plan-date-picker" style={{ display: 'block', top: '32px', left: '24px', position: 'absolute', zIndex: 1000 }}>
                      <div className="date-input">
                        <input type="text" placeholder="Tomorrow, in 3 days, on Aug 8..." className="natural-date-input" />
                      </div>
                      <div className="header">
                        <span className="month-year">{formattedMonthYear}</span>
                        <div className="nav-right">
                          <button className="nav-button" onClick={handlePrevMonth}>‹</button>
                          <button className="nav-button" onClick={handleNextMonth}>›</button>
                        </div>
                      </div>
                      <div className="days-header">
                        <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
                      </div>
                      <div className="days-grid">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <button 
                            key={day}
                            className={`day-button ${day === 25 ? 'today' : ''}`}
                            onClick={() => {
                              setStartDate(`Jul, ${day}`);
                              setIsDatePickerOpen(false);
                            }}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isStartTimePickerOpen && !isAllDay && (
                    <div style={{
                      position: 'absolute',
                      top: '32px',
                      left: '80px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.16)',
                      borderRadius: '10px',
                      border: '1px solid #EAEAEA',
                      padding: '6px',
                      zIndex: 1000,
                      width: '110px',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {timeSteps.map(t => (
                        <div
                          key={t}
                          onClick={() => {
                            setStartTime(t);
                            setIsStartTimePickerOpen(false);
                          }}
                          style={{
                            padding: '6px 10px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            backgroundColor: startTime === t ? '#F4F4F6' : 'transparent',
                            color: '#171b1f',
                            fontWeight: startTime === t ? 600 : 400
                          }}
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. ŘÁDEK END DATE */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                  <i className="las la-clock" style={{ fontSize: '16px', color: '#8896a9', width: '18px', opacity: 0 }}></i>
                  <span style={{ color: '#171b1f', fontWeight: 500 }}>{endDate}</span>
                  
                  {!isAllDay && (
                    <span 
                      style={{
                        color: '#171b1f',
                        fontWeight: 500,
                        backgroundColor: '#F3F4F6',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      onClick={() => setIsEndTimePickerOpen(!isEndTimePickerOpen)}
                    >
                      {endTime}
                    </span>
                  )}

                  {isEndTimePickerOpen && !isAllDay && (
                    <div style={{
                      position: 'absolute',
                      top: '28px',
                      left: '80px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.16)',
                      borderRadius: '10px',
                      border: '1px solid #EAEAEA',
                      padding: '6px',
                      zIndex: 1000,
                      width: '110px',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {timeSteps.map(t => (
                        <div
                          key={t}
                          onClick={() => {
                            setEndTime(t);
                            setIsEndTimePickerOpen(false);
                          }}
                          style={{
                            padding: '6px 10px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            backgroundColor: endTime === t ? '#F4F4F6' : 'transparent',
                            color: '#171b1f',
                            fontWeight: endTime === t ? 600 : 400
                          }}
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. CELÝ DEN */}
                <div 
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#5e6774', cursor: 'pointer' }}
                  onClick={() => {
                    const nextVal = !isAllDay;
                    setIsAllDay(nextVal);
                    setCalendarEvents(prev => prev.map(ev => ev.id === activeEventId ? { ...ev, isAllDay: nextVal } : ev));
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: isAllDay ? '#D1D5DB' : 'transparent',
                    border: isAllDay ? 'none' : '1.5px solid #9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isAllDay && <i className="las la-check" style={{ fontSize: '11px', color: '#ffffff' }}></i>}
                  </div>
                  <span style={{ color: '#171b1f', fontWeight: isAllDay ? 600 : 400 }}>All day</span>
                </div>

                {/* 4. OPAKOVÁNÍ */}
                <div style={{ position: 'relative' }}>
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#5e6774', cursor: 'pointer' }}
                    onClick={() => setIsQuickRecurrenceOpen(!isQuickRecurrenceOpen)}
                  >
                    <i className="las la-redo-alt" style={{ fontSize: '16px', color: '#8896a9', width: '18px' }}></i>
                    <span style={{ color: '#5e6774' }}>{recurrence}</span>
                  </div>

                  {isQuickRecurrenceOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '28px',
                      left: '28px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                      borderRadius: '8px',
                      border: '1px solid #EAEAEA',
                      zIndex: 1000,
                      width: '160px',
                      padding: '4px',
                      fontSize: '12px'
                    }}>
                      {['Every day', 'Every workday', 'Every Friday', 'Monthly on the 24th', 'Annually on Jul 24th'].map(opt => (
                        <div
                          key={opt}
                          onClick={() => {
                            setRecurrence(opt);
                            setIsQuickRecurrenceOpen(false);
                          }}
                          style={{ padding: '6px 10px', cursor: 'pointer', borderRadius: '4px', color: '#171b1f' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F4F6'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {opt}
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid #F0F0F4', margin: '4px 0' }}></div>
                      <div
                        onClick={() => {
                          setIsQuickRecurrenceOpen(false);
                          setIsCustomRecurrenceModalOpen(true);
                        }}
                        style={{ padding: '6px 10px', cursor: 'pointer', borderRadius: '4px', color: '#4A85F6', fontWeight: 600 }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F4F6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Custom...
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. MÍSTO KONÁNÍ */}
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#5e6774' }}>
                    <i className="las la-map-marker-alt" style={{ fontSize: '16px', color: '#8896a9', width: '18px' }}></i>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setIsLocationAutocompleteOpen(true);
                      }}
                      onFocus={() => setIsLocationAutocompleteOpen(true)}
                      placeholder="Teplice, Čelak..."
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#171b1f', width: '100%' }}
                    />
                  </div>

                  {isLocationAutocompleteOpen && location.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '28px',
                      left: '28px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                      borderRadius: '8px',
                      border: '1px solid #EAEAEA',
                      zIndex: 1000,
                      width: '280px',
                      padding: '4px'
                    }}>
                      {czechAddressDatabase.filter(a => a.toLowerCase().includes(location.toLowerCase())).map(addr => (
                        <div
                          key={addr}
                          onClick={() => {
                            setLocation(addr);
                            setIsLocationAutocompleteOpen(false);
                          }}
                          style={{ padding: '8px 10px', fontSize: '12px', color: '#171b1f', cursor: 'pointer', borderRadius: '6px', marginBottom: '2px' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F4F6'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {addr}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 6. VLASTNÍK KALENDÁŘE */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6B7280', marginLeft: '5px' }}></div>
                  <span style={{ fontSize: '13px', color: '#171b1f', fontWeight: 500 }}>{calendarOwner}</span>
                </div>

                {/* 7. STATUS ACTIVE / PASSIVE */}
                <div style={{ position: 'relative' }}>
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#5e6774', cursor: 'pointer' }}
                    onClick={() => setIsStatusPickerOpen(!isStatusPickerOpen)}
                  >
                    <i className="las la-eye" style={{ fontSize: '16px', color: '#8896a9', width: '18px' }}></i>
                    <span style={{ color: '#171b1f', fontWeight: 500 }}>{statusState}</span>
                  </div>

                  {isStatusPickerOpen && (
                    <div style={{ position: 'absolute', top: '28px', left: 0, zIndex: 1000, width: '320px' }}>
                      <div style={{
                        backgroundColor: '#2A2E33',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        marginBottom: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}>
                        Active events are displayed in the Agenda's timeline
                      </div>

                      <div style={{
                        backgroundColor: '#ffffff',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                        borderRadius: '10px',
                        border: '1px solid #EAEAEA',
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}>
                        <div
                          onClick={() => {
                            setStatusState('Active');
                            setIsStatusPickerOpen(false);
                          }}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            backgroundColor: statusState === 'Active' ? '#F4F4F6' : 'transparent',
                            color: statusState === 'Active' ? '#4A85F6' : '#171b1f',
                            fontWeight: 600,
                            fontSize: '13px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <span>Active</span>
                          <i className="las la-info-circle" style={{ color: '#8896a9' }}></i>
                        </div>

                        <div
                          onClick={() => {
                            setStatusState('Passive');
                            setIsStatusPickerOpen(false);
                          }}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            backgroundColor: statusState === 'Passive' ? '#F4F4F6' : 'transparent',
                            color: statusState === 'Passive' ? '#4A85F6' : '#171b1f',
                            fontWeight: 500,
                            fontSize: '13px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <span>Passive</span>
                          <i className="las la-info-circle" style={{ color: '#8896a9' }}></i>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 8. BUSY / FREE */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#5e6774', cursor: 'pointer' }} onClick={() => setBusyState(busyState === 'Busy' ? 'Free' : 'Busy')}>
                  <i className="las la-briefcase" style={{ fontSize: '16px', color: '#8896a9', width: '18px' }}></i>
                  <span style={{ color: '#171b1f', fontWeight: 500 }}>{busyState}</span>
                </div>

                {/* 9. LABELS POPUP */}
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#5e6774' }}>
                      <i className="las la-tag" style={{ fontSize: '16px', color: '#8896a9', width: '18px' }}></i>
                      <span style={{ color: '#171b1f', fontWeight: 500 }}>Labels</span>
                    </div>
                    <span 
                      style={{ fontSize: '12px', color: '#4A85F6', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => setIsLabelPickerOpen(!isLabelPickerOpen)}
                    >
                      Select
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginLeft: '28px', marginTop: '6px' }}>
                    {selectedLabels.map(lbl => (
                      <span
                        key={lbl}
                        style={{
                          fontSize: '12px',
                          backgroundColor: '#FFF5F5',
                          color: '#FF4742',
                          border: '1px solid #FF808B',
                          padding: '3px 10px',
                          borderRadius: '16px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {lbl}
                        <span style={{ cursor: 'pointer', color: '#747f8f' }} onClick={() => toggleSelectLabel(lbl)}>✕</span>
                      </span>
                    ))}
                  </div>

                  {isLabelPickerOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '28px',
                      left: '28px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.16)',
                      borderRadius: '12px',
                      border: '1px solid #EAEAEA',
                      zIndex: 1000,
                      width: '260px',
                      padding: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F4F4F6', padding: '6px 10px', borderRadius: '6px', marginBottom: '8px' }}>
                        <i className="las la-search" style={{ color: '#8896a9', fontSize: '14px' }}></i>
                        <input
                          type="text"
                          value={labelSearchQuery}
                          onChange={(e) => setLabelSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddNewLabel()}
                          placeholder="Search..."
                          style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', flexGrow: 1, color: '#171b1f' }}
                        />
                        <span style={{ fontSize: '10px', color: '#8896a9', fontWeight: 600 }}>in 🏷️ Labels</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '140px', overflowY: 'auto' }}>
                        {customLabels.filter(l => l.toLowerCase().includes(labelSearchQuery.toLowerCase())).map(lbl => (
                          <div
                            key={lbl}
                            onClick={() => toggleSelectLabel(lbl)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              backgroundColor: selectedLabels.includes(lbl) ? '#F4F4F6' : 'transparent',
                              color: '#171b1f',
                              fontSize: '12px',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            <span style={{ backgroundColor: '#FFFBEB', color: '#D97706', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>🏷️</span>
                            <span>{lbl}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ borderTop: '1px solid #F0F0F4', margin: '6px 0' }}></div>
                      <div onClick={handleAddNewLabel} style={{ padding: '6px 10px', fontSize: '12px', color: '#747f8f', cursor: 'pointer', fontWeight: 500 }}>
                        + New
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <div style={{ height: '1px', backgroundColor: '#F0F0F4', margin: '16px 0' }}></div>

              {/* 10. PŘIDAT ÚČASTNÍKA */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={participantInput}
                  onChange={(e) => {
                    setParticipantInput(e.target.value);
                    setIsParticipantPickerOpen(true);
                  }}
                  onFocus={() => setIsParticipantPickerOpen(true)}
                  placeholder="Add participant"
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '13px',
                    color: '#171b1f',
                    marginBottom: '8px',
                    fontFamily: 'Inter, sans-serif'
                  }}
                />

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {participants.map(p => (
                    <span 
                      key={p}
                      style={{
                        fontSize: '12px',
                        backgroundColor: '#F3F4F6',
                        color: '#171b1f',
                        padding: '3px 10px',
                        borderRadius: '16px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {p}
                      <span style={{ cursor: 'pointer', color: '#8896a9' }} onClick={() => setParticipants(participants.filter(item => item !== p))}>✕</span>
                    </span>
                  ))}
                </div>

                {isParticipantPickerOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '28px',
                    left: 0,
                    backgroundColor: '#ffffff',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.16)',
                    borderRadius: '12px',
                    border: '1px solid #EAEAEA',
                    zIndex: 1000,
                    width: '280px',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    {participantSuggestions
                      .filter(p => p.name.toLowerCase().includes(participantInput.toLowerCase()) || p.email.toLowerCase().includes(participantInput.toLowerCase()))
                      .map(p => (
                        <div
                          key={p.email}
                          onClick={() => {
                            if (!participants.includes(p.email)) setParticipants([...participants, p.email]);
                            setParticipantInput('');
                            setIsParticipantPickerOpen(false);
                          }}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F4F6'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: p.color,
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 700
                          }}>
                            {p.avatar}
                          </div>
                          <span style={{ fontSize: '13px', color: '#171b1f', fontWeight: 500 }}>{p.email}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div style={{ height: '1px', backgroundColor: '#F0F0F4', margin: '16px 0' }}></div>

              {/* POPIS */}
              <div style={{
                backgroundColor: '#F4F4F6',
                borderRadius: '12px',
                padding: '12px 14px',
                marginTop: '8px'
              }}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="sem něco můžu napsat..."
                  rows={4}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '13px',
                    color: '#171b1f',
                    resize: 'none',
                    fontFamily: 'Inter, sans-serif'
                  }}
                />
              </div>

            </div>

            {/* DOLNÍ TLAČÍTKA AKCÍ */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid #F0F0F4',
              marginTop: '16px'
            }}>
              <button
                type="button"
                onClick={() => setIsEventDrawerOpen(false)}
                style={{
                  backgroundColor: '#FDF2F2',
                  color: '#FF4742',
                  border: '1px solid #FCA5A5',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  alert('Událost byla úspěšně vytvořena a uložena!');
                  setIsEventDrawerOpen(false);
                }}
                style={{
                  backgroundColor: '#2A2E33',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 22px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                Create
              </button>
            </div>

            {/* RESIZER DRAG HANDLE */}
            <div 
              onMouseDown={() => setIsResizing(true)}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '6px',
                height: '100%',
                cursor: 'col-resize',
                backgroundColor: isResizing ? '#FF4742' : 'transparent',
                zIndex: 10
              }}
            />
          </div>
        )}

        {/* PRAVÉ PLÁTNO KALENDÁŘE */}
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          
          {/* Horní lišta navigace */}
          <div style={{
            height: '48px',
            borderBottom: '1px solid #EAEAEA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#171b1f' }}>{formattedMonthYear}</span>
              <span style={{ cursor: 'pointer', fontSize: '16px', color: '#747f8f', fontWeight: 700, padding: '2px 8px' }} onClick={handlePrevMonth}>‹</span>
              <span style={{ cursor: 'pointer', fontSize: '16px', color: '#747f8f', fontWeight: 700, padding: '2px 8px' }} onClick={handleNextMonth}>›</span>
              
              {/* Tlačítko + New pro novou událost */}
              <button
                onClick={() => handleCreateNewEvent(24)}
                style={{
                  backgroundColor: '#171b1f',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginLeft: '12px'
                }}
              >
                + New
              </button>
            </div>

            {/* PŘEPÍNAČ NÁHLEDŮ (3-day | 5-day | Week | Month) */}
            <div className="right-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="baseButtonGroup">
                <div className="buttonGroup">
                  {['3-day', '5-day', 'Week', 'Month'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`base-button main secondary text-only ${viewMode === mode ? 'active' : 'default'} none`}
                    >
                      <span className="left">
                        <span className="text">{mode}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMICKÝ OBSAH PODLE VYBRANÉHO NÁHLEDU */}
          {viewMode === 'Month' ? (
            /* POHLED MONTH: PŘESNĚ 7 ROVNOCENNÝCH SLOUPCŮ S PLNOU PODPOROU DRAG & DROP */
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', borderBottom: '1px solid #EAEAEA', backgroundColor: '#FFFFFF' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} style={{ fontSize: '12px', fontWeight: 600, color: '#747f8f', textAlign: 'left', padding: '8px 12px', borderRight: '1px solid #EAEAEA' }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* 5 Týdnů v měsíci s událostmi NA SPODU BUŇKY */}
              <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gridTemplateRows: 'repeat(5, minmax(0, 1fr))' }}>
                {Array.from({ length: 35 }, (_, i) => i + 1).map(cellIndex => {
                  const dayNumber = cellIndex <= 31 ? cellIndex : cellIndex - 31;
                  const isCurrentMonth = cellIndex <= 31;
                  const isToday = cellIndex === 25;
                  const dayEvents = calendarEvents.filter(e => e.dayNum === cellIndex);

                  return (
                    <div
                      key={cellIndex}
                      onDragOver={handleDayCellDragOver}
                      onDrop={(e) => handleDayCellDrop(e, cellIndex)}
                      onClick={() => handleCreateNewEvent(dayNumber)}
                      style={{
                        borderRight: '1px solid #EAEAEA',
                        borderBottom: '1px solid #EAEAEA',
                        padding: '6px 8px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                    >
                      {/* Číslo dne vlevo nahoře */}
                      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: isToday ? 700 : 400,
                          color: isToday ? '#ffffff' : isCurrentMonth ? '#171b1f' : '#C0C4CC',
                          backgroundColor: isToday ? '#FF4742' : 'transparent',
                          borderRadius: isToday ? '50%' : 'none',
                          width: isToday ? '20px' : 'auto',
                          height: isToday ? '20px' : 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {dayNumber}
                        </span>
                      </div>

                      {/* UDÁLOSTI PŘETATELNÉ MYŠÍ */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflow: 'hidden' }}>
                        {dayEvents.map(ev => (
                          <div
                            key={ev.id}
                            draggable
                            onDragStart={(e) => handleCalendarEventDragStart(e, ev.id)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveEventId(ev.id);
                              setEventTitle(ev.title);
                              setLocation(ev.location);
                              setStartTime(ev.startTimeStr);
                              setEndTime(ev.endTimeStr);
                              setIsAllDay(ev.isAllDay);
                              setIsEventDrawerOpen(true);
                            }}
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor: ev.color,
                              color: ev.textColor || '#ffffff',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              cursor: 'grab',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <span>{ev.title}</span>
                            <span style={{ fontSize: '10px', opacity: 0.85 }}>{ev.startTimeStr}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ČASOVÁ MŘÍŽKA PRO 3-DAY / 5-DAY / WEEK VIEW S PLNOU PODPOROU DRAG & DROP */
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              
              {/* HORNÍ BANNER CELODENNÍCH UDÁLOSTÍ */}
              {allDayEvents.length > 0 && (
                <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #EAEAEA', padding: '12px 16px 12px 68px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', marginBottom: '6px' }}>
                    CELODENNÍ UDÁLOSTI
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {allDayEvents.map(ev => (
                      <div
                        key={ev.id}
                        draggable
                        onDragStart={(e) => handleCalendarEventDragStart(e, ev.id)}
                        style={{
                          backgroundColor: '#10B981',
                          color: '#ffffff',
                          borderRadius: '8px',
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'grab'
                        }}
                        onClick={() => {
                          setActiveEventId(ev.id);
                          setEventTitle(ev.title);
                          setLocation(ev.location);
                          setIsAllDay(true);
                          setIsEventDrawerOpen(true);
                        }}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dny v hlavičce (Fri 24) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `60px repeat(3, 1fr)`,
                borderBottom: '1px solid #EAEAEA',
                backgroundColor: '#FFFFFF',
                textAlign: 'center',
                fontSize: '12px'
              }}>
                <div style={{ padding: '10px 0', borderRight: '1px solid #EAEAEA' }}></div>
                <div style={{ padding: '10px 0', borderRight: '1px solid #EAEAEA', color: '#FF4742', fontWeight: 600 }}>Fri 24</div>
                <div style={{ padding: '10px 0', borderRight: '1px solid #EAEAEA', color: '#747f8f' }}>Sat 25</div>
                <div style={{ padding: '10px 0', color: '#747f8f' }}>Sun 26</div>
              </div>

              {/* Časová mřížka */}
              <div style={{ flexGrow: 1, overflowY: 'auto', position: 'relative' }}>
                {hours.map(h => (
                  <div key={h} style={{ display: 'grid', gridTemplateColumns: `60px repeat(3, 1fr)`, height: '60px', borderBottom: '1px solid #F4F4F6' }}>
                    <div style={{ fontSize: '11px', color: '#a0a0b0', textAlign: 'right', paddingRight: '12px', marginTop: '-6px' }}>
                      {h.toString().padStart(2, '0')}:00
                    </div>
                    <div 
                      onDragOver={handleDayCellDragOver}
                      onDrop={(e) => handleTimeSlotDrop(e, 24, h)}
                      style={{ borderRight: '1px solid #F4F4F6', cursor: 'pointer' }} 
                      onClick={() => handleCreateNewEvent(24)}
                    />
                    <div 
                      onDragOver={handleDayCellDragOver}
                      onDrop={(e) => handleTimeSlotDrop(e, 25, h)}
                      style={{ borderRight: '1px solid #F4F4F6', cursor: 'pointer' }} 
                      onClick={() => handleCreateNewEvent(25)}
                    />
                    <div 
                      onDragOver={handleDayCellDragOver}
                      onDrop={(e) => handleTimeSlotDrop(e, 26, h)}
                      style={{ cursor: 'pointer' }} 
                      onClick={() => handleCreateNewEvent(26)}
                    />
                  </div>
                ))}

                {/* Časované Události v mřížce (PŘETATELNÉ MYŠÍ) */}
                {timedEvents.map(ev => {
                  const topPx = (ev.startHour - 7) * 60;
                  const heightPx = ev.durationHours * 60;

                  return (
                    <div
                      key={ev.id}
                      draggable
                      onDragStart={(e) => handleCalendarEventDragStart(e, ev.id)}
                      style={{
                        position: 'absolute',
                        top: `${topPx}px`,
                        left: ev.dayNum === 25 ? '38%' : ev.dayNum === 26 ? '70%' : '60px',
                        width: '30%',
                        height: `${heightPx}px`,
                        backgroundColor: ev.color,
                        color: ev.textColor || '#ffffff',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        cursor: 'grab',
                        boxSizing: 'border-box'
                      }}
                      onClick={() => {
                        setActiveEventId(ev.id);
                        setEventTitle(ev.title);
                        setLocation(ev.location);
                        setStartTime(ev.startTimeStr);
                        setEndTime(ev.endTimeStr);
                        setIsAllDay(false);
                        setIsEventDrawerOpen(true);
                      }}
                    >
                      {ev.title}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* OFICIÁLNÍ ROUTINE RECURRENCE MODAL */}
      {isCustomRecurrenceModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.2)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setIsCustomRecurrenceModalOpen(false)}
        >
          <div className="recurrence-picker" style={{ display: 'block', position: 'relative', top: 'auto', left: 'auto', transform: 'none' }} onClick={(e) => e.stopPropagation()}>
            <div className="recurrence-input">
              <input
                type="text"
                value={recurrenceQuery}
                onChange={(e) => setRecurrenceQuery(e.target.value)}
                placeholder="day, workday, month until 2032..."
                className="natural-date-input"
              />
            </div>

            <div className="every-section">
              <div className="section-title">Every</div>
              <div className="every-controls">
                <select
                  value={recurrenceEveryCount}
                  onChange={(e) => setRecurrenceEveryCount(parseInt(e.target.value))}
                  className="number-select"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </select>

                <select
                  value={recurrenceUnit}
                  onChange={(e) => setRecurrenceUnit(e.target.value)}
                  className="frequency-select"
                >
                  <option value="Week">Week</option>
                  <option value="Month">Month</option>
                  <option value="Year">Year</option>
                </select>
              </div>
            </div>

            <div className="on-section">
              <div className="section-title">On</div>
              <div className="days-checkboxes">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
                    }}
                    className={`day-button ${selectedDays.includes(day) ? 'active' : ''}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="ends-section">
              <div className="section-title">End</div>
              <div className="ends-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="endCond"
                    checked={endCondition === 'Forever'}
                    onChange={() => setEndCondition('Forever')}
                    className="radio-input"
                  />
                  <span className="radio-label">Forever</span>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="endCond"
                    checked={endCondition === 'Until'}
                    onChange={() => setEndCondition('Until')}
                    className="radio-input"
                  />
                  <span className="radio-label">Until</span>
                </label>
              </div>
            </div>

            <div className="actions">
              <button
                type="button"
                onClick={() => setIsCustomRecurrenceModalOpen(false)}
                className="base-button auxiliary primary text-only default none cancel-button"
              >
                <span className="left"><span className="text">Cancel</span></span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRecurrence(`Každý ${recurrenceEveryCount}. týden`);
                  setIsCustomRecurrenceModalOpen(false);
                }}
                className="base-button main primary text-only default none create-button"
              >
                <span className="left"><span className="text">Create</span></span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export default CalendarView;
