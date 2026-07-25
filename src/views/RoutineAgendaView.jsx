import React, { useState, useEffect, useRef } from 'react';
import { RoutineSidebar } from '../components/navigation/RoutineSidebar.jsx';

export function RoutineAgendaView({ user, onNavigate, onSelectEntity, onOpenQuickConsole, isMobileView }) {
  const [currentTimeText, setCurrentTimeText] = useState('10:30');
  const [currentTopPx, setCurrentTopPx] = useState(840);
  const [newTaskText, setNewTaskText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeDatePickerTask, setActiveDatePickerTask] = useState(null);
  const [taskPickerMonth, setTaskPickerMonth] = useState(new Date(2026, 6, 1));
  
  // Drag & Drop live target state s přesným uchopením a trváním události
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [draggedEventId, setDraggedEventId] = useState(null);
  const [dragGrabOffsetHours, setDragGrabOffsetHours] = useState(0);
  const [draggedEventDuration, setDraggedEventDuration] = useState(0.5);
  const [draggedTitle, setDraggedTitle] = useState('');
  const [draggedColor, setDraggedColor] = useState('#FF4742');

  const [dragOverGroup, setDragOverGroup] = useState(null);
  const [dropTargetInfo, setDropTargetInfo] = useState(null);

  // Animované ID právě zaškrtnutého úkolu pro efekt
  const [recentlyCheckedId, setRecentlyCheckedId] = useState(null);

  // Aktuálně zobrazený měsíc a datum v horním přechodu (Gradient fade overlay)
  const [activeVisibleDateStr, setActiveVisibleDateStr] = useState('Pátek 24. Července 2026');

  // DYNAMICKÉ SVISLÉ SCROLOVÁNÍ NAPŘÍČ MĚSÍCI
  const [offsets, setOffsets] = useState(() => {
    return Array.from({ length: 21 }, (_, i) => i - 10);
  });

  const timelineScrollRef = useRef(null);
  const todaySectionRef = useRef(null);
  const isPrependingRef = useRef(false);

  // Modální okno detailu události
  const [activeEventModal, setActiveEventModal] = useState(null);

  const HOUR_HEIGHT = 70;
  const SINGLE_DAY_HEIGHT = 24 * HOUR_HEIGHT + 140;

  // POMOCNÝ ČESKÝ KALENDÁŘ SVÁTKŮ (NAMESDAYS)
  const getCzechNameDay = (dateObj) => {
    const m = dateObj.getMonth() + 1;
    const d = dateObj.getDate();
    const key = `${m}-${d}`;

    const dict = {
      '7-23': 'Libor',
      '7-24': 'Kristýna',
      '7-25': 'Jakub',
      '7-26': 'Anna',
      '7-27': 'Věroslav',
      '7-28': 'Viktor',
      '7-29': 'Marta',
      '7-30': 'Bořivoj',
      '7-31': 'Ignác',
      '8-1': 'Oskar',
      '8-2': 'Gustav',
      '8-3': 'Miluše',
      '8-4': 'Dominik',
      '8-5': 'Kristián',
      '8-6': 'Oldřiška',
      '8-7': 'Lada',
      '8-8': 'Soběslav',
      '8-9': 'Roman',
      '8-10': 'Vavřinec',
      '8-11': 'Zuzana',
      '8-12': 'Klára'
    };

    return dict[key] || 'Všichni svatí';
  };

  // Detail dne bez jakýchkoliv "uší" - 100% čistá typografie Routine.com
  const getDayDetails = (offset) => {
    const baseDate = new Date(2026, 6, 24);
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + offset);

    const daysArr = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
    const monthsArr = ['Června', 'Července', 'Srpna', 'Září', 'Října', 'Listopadu', 'Prosince', 'Ledna', 'Února', 'Března', 'Dubna', 'Května'];
    
    const dayName = daysArr[d.getDay()];
    const dayNum = d.getDate();
    const monthName = monthsArr[(d.getMonth() - 5 + 12) % 12] || 'Července';
    const year = d.getFullYear();

    let subLabel = '';
    let isToday = false;

    if (offset === 0) { subLabel = 'Dnes'; isToday = true; }
    else if (offset === -1) { subLabel = 'Včera'; }
    else if (offset === 1) { subLabel = 'Zítra'; }

    return {
      offset,
      fullDateStr: `${dayName} ${dayNum}. ${monthName} ${year}`,
      subLabel,
      isToday,
      dateObj: d
    };
  };

  // Živý čas 24h
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setCurrentTimeText(formattedTime);
      
      const calculatedPx = (hours * 60 + minutes) * (HOUR_HEIGHT / 60);
      setCurrentTopPx(calculatedPx);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Vycentrování na Dnes při prvním načtení
  useEffect(() => {
    if (todaySectionRef.current && timelineScrollRef.current) {
      const todayTop = todaySectionRef.current.offsetTop;
      const now = new Date();
      const currentMinutesOffset = (now.getHours() * 60 + now.getMinutes()) * (HOUR_HEIGHT / 60);
      timelineScrollRef.current.scrollTop = todayTop + currentMinutesOffset - 200;
    }
  }, []);

  // DONAČÍTÁNÍ DNŮ S ELEVACÍ PRO STICKY CENTROVANÝ DATUM V PŘECHODU
  const handleScrollTimeline = () => {
    const el = timelineScrollRef.current;
    if (!el || isPrependingRef.current) return;

    const scrollPos = el.scrollTop;
    const estimatedOffsetIndex = Math.floor((scrollPos + 100) / SINGLE_DAY_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(offsets.length - 1, estimatedOffsetIndex));
    const currentOffset = offsets[clampedIndex];
    const currentDayObj = getDayDetails(currentOffset);
    if (currentDayObj && currentDayObj.fullDateStr !== activeVisibleDateStr) {
      setActiveVisibleDateStr(currentDayObj.fullDateStr);
    }

    if (el.scrollTop < 600) {
      isPrependingRef.current = true;
      const minOffset = Math.min(...offsets);
      const newPastOffsets = Array.from({ length: 7 }, (_, i) => minOffset - 7 + i);
      const addedHeight = 7 * SINGLE_DAY_HEIGHT;
      setOffsets(prev => [...newPastOffsets, ...prev]);

      requestAnimationFrame(() => {
        el.scrollTop += addedHeight;
        isPrependingRef.current = false;
      });
    }

    if (el.scrollTop + el.clientHeight > el.scrollHeight - 600) {
      const maxOffset = Math.max(...offsets);
      const newFutureOffsets = Array.from({ length: 7 }, (_, i) => maxOffset + 1 + i);
      setOffsets(prev => [...prev, ...newFutureOffsets]);
    }
  };

  // SEED DATA: Události a celodenní akce (včetně Narozenin a Jmenin)
  const [events, setEvents] = useState([
    {
      id: 'e_allday_1',
      dayOffset: 0,
      title: 'Celodenní dovolená klíčového pracovníka',
      category: 'Absence',
      color: '#FF4742',
      bgColor: '#FFF5F5',
      borderColor: '#FECDD3',
      isAllDay: true
    },
    {
      id: 'e_allday_bday',
      dayOffset: 0,
      title: 'Narozeniny: Tomáš Dvořák (pěstoun) - 42 let',
      category: 'Narozeniny',
      iconClass: 'las la-birthday-cake',
      color: '#EC4899',
      bgColor: '#FDF2F8',
      borderColor: '#FBCFE8',
      isAllDay: true
    },
    {
      id: 'e_allday_nameday',
      dayOffset: 0,
      title: 'Jmeniny: Kristýna Nováková (dítě v péči)',
      category: 'Jmeniny',
      iconClass: 'las la-gift',
      color: '#A855F7',
      bgColor: '#F3E8FF',
      borderColor: '#E9D5FF',
      isAllDay: true
    },
    {
      id: 'e_allday_2',
      dayOffset: 0,
      title: 'Vzdělávací seminář OSPOD - Praha 4',
      category: 'Vzdělávání',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      borderColor: '#FDE68A',
      isAllDay: true
    },
    {
      id: 'e1',
      dayOffset: 0,
      title: 'Pravidelná 2M návštěva v rodině Dvořákových',
      category: 'Klíčová návštěva',
      color: '#FF4742',
      bgColor: '#FFFFFF',
      borderColor: '#EAEAEE',
      startHour: 8.5,
      durationHours: 1.5,
      durationText: '1h 30m',
      startTimeStr: '08:30',
      endTimeStr: '10:00',
      isAllDay: false
    },
    {
      id: 'e2',
      dayOffset: 0,
      title: 'Marketing Sync',
      category: 'Tým',
      color: '#FF4742',
      bgColor: '#FFFFFF',
      borderColor: '#EAEAEE',
      startHour: 10.5,
      durationHours: 1.0,
      durationText: '1h',
      startTimeStr: '10:30',
      endTimeStr: '11:30',
      notes: 'Take private notes...',
      isAllDay: false
    },
    {
      id: 'e2_conflict',
      dayOffset: 0,
      title: 'OSPOD Praha 4 - Neplánované jednání',
      category: 'OSPOD',
      color: '#4A85F6',
      bgColor: '#FFFFFF',
      borderColor: '#EAEAEE',
      startHour: 10.5,
      durationHours: 1.0,
      durationText: '1h',
      startTimeStr: '10:30',
      endTimeStr: '11:30',
      notes: 'Přezkoumání dohody Dvořákovi',
      isAllDay: false
    },
    {
      id: 'e3',
      dayOffset: 0,
      title: 'Oběd a osobní přestávka',
      category: 'Osobní',
      color: '#10B981',
      bgColor: '#FFFFFF',
      borderColor: '#EAEAEE',
      startHour: 12.0,
      durationHours: 1.0,
      durationText: '1h',
      startTimeStr: '12:00',
      endTimeStr: '13:00',
      isAllDay: false
    },
    {
      id: 'e4',
      dayOffset: 0,
      title: 'Pravidelná 2M návštěva - Rodina Novákova',
      category: 'Klíčová návštěva',
      color: '#F59E0B',
      bgColor: '#FFFFFF',
      borderColor: '#EAEAEE',
      startHour: 14.0,
      durationHours: 2.0,
      durationText: '2h',
      startTimeStr: '14:00',
      endTimeStr: '16:00',
      isAllDay: false
    }
  ]);

  // Úkoly
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'Tato návštěva je po termínu!', group: 'overdue', completed: false, starred: false, dateRange: '23. 3. – 29. 3.' },
    { id: 't2', title: 'Zablokovat čas pro důležité schůzky IPOD', group: 'overdue', completed: false, starred: false, dateRange: '23. 3. – 29. 3.' },
    { id: 't3', title: 'Odložit vykazování respitní péče na později', group: 'overdue', completed: false, starred: false, dateRange: '23. 3. – 29. 3.' },
    { id: 't4', title: 'Naplánovat tuto návštěva na jiný den', group: 'overdue', completed: false, starred: false, dateRange: '25. března' },
    { id: 't5', title: 'Propojit všechny účty OSPOD a školy', group: 'overdue', completed: false, starred: false, dateRange: '25. března' },
    { id: 't6', title: 'Nainstalovat CRM Doprovázení na další zařízení', group: 'overdue', completed: false, starred: false, dateRange: '25. března' },
    
    { id: 't7', title: 'Pravidelná 2M návštěva v rodině Dvořákových', group: 'today', completed: false, starred: true, badge: 'OSPOD' },
    { id: 't8', title: 'Zkontrolovat plnění cílů IPOD u Tomáše Dvořáka', group: 'today', completed: false, starred: true, badge: 'N' },
    
    { id: 't9', title: 'Nakonfigurovat denní agenda klíčové osoby', group: 'completed', completed: true, starred: false },
    { id: 't10', title: 'Vytvořit nový spis rodiny jednoduše', group: 'completed', completed: true, starred: false }
  ]);

  // ALGORITMUS PRO ŘEŠENÍ KONFLIKTŮ A SOUBĚŽNÝCH UDÁLOSTÍ (Zobrazení VEDLE SEBE)
  const computeEventLayout = (dayEvs) => {
    if (!dayEvs || dayEvs.length === 0) return [];

    const sorted = [...dayEvs].sort((a, b) => a.startHour - b.startHour || b.durationHours - a.durationHours);
    
    const clusters = [];
    let currentCluster = [];
    let clusterEnd = -1;

    sorted.forEach(ev => {
      const evEnd = ev.startHour + (ev.durationHours || 0.5);
      if (currentCluster.length === 0 || ev.startHour < clusterEnd) {
        currentCluster.push(ev);
        clusterEnd = Math.max(clusterEnd, evEnd);
      } else {
        clusters.push(currentCluster);
        currentCluster = [ev];
        clusterEnd = evEnd;
      }
    });
    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    const layoutedEvents = [];
    clusters.forEach(cluster => {
      const columns = [];
      cluster.forEach(ev => {
        let placed = false;
        for (let i = 0; i < columns.length; i++) {
          const lastInCol = columns[i][columns[i].length - 1];
          const lastEnd = lastInCol.startHour + (lastInCol.durationHours || 0.5);
          if (lastEnd <= ev.startHour) {
            columns[i].push(ev);
            ev._colIndex = i;
            placed = true;
            break;
          }
        }
        if (!placed) {
          ev._colIndex = columns.length;
          columns.push([ev]);
        }
      });

      const numCols = columns.length;
      cluster.forEach(ev => {
        ev._numCols = numCols;
        layoutedEvents.push(ev);
      });
    });

    return layoutedEvents;
  };

  const triggerCheckAnimation = (id) => {
    setRecentlyCheckedId(id);
    setTimeout(() => setRecentlyCheckedId(null), 600);
  };

  const toggleTask = (id) => {
    triggerCheckAnimation(id);
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        return { ...t, completed: nextState, group: nextState ? 'completed' : 'today' };
      }
      return t;
    }));

    setEvents(prev => prev.map(ev => {
      if (ev.taskId === id) {
        return { ...ev, completed: !ev.completed };
      }
      return ev;
    }));
  };

  const toggleTaskFromTimeline = (evItem) => {
    triggerCheckAnimation(evItem.id);
    const nextState = !evItem.completed;
    
    setEvents(prev => prev.map(ev => {
      if (ev.id === evItem.id) {
        return { ...ev, completed: nextState };
      }
      return ev;
    }));

    if (evItem.taskId) {
      setTasks(prev => prev.map(t => {
        if (t.id === evItem.taskId) {
          return { ...t, completed: nextState, group: nextState ? 'completed' : 'today' };
        }
        return t;
      }));
    }
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    const newTask = {
      id: `t_${Date.now()}`,
      title: newTaskText.trim(),
      group: 'today',
      completed: false,
      starred: false,
      dateRange: 'Dnes'
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskText('');
  };

  const handleDragStartTask = (e, task) => {
    setDraggedTaskId(task.id);
    setDraggedEventId(null);
    setDragGrabOffsetHours(0);
    setDraggedEventDuration(0.5);
    setDraggedTitle(task.title);
    setDraggedColor('#3B82F6');
    e.dataTransfer.setData('task-id', task.id);
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragOverGroup = (e, groupName) => {
    e.preventDefault();
    if (dragOverGroup !== groupName) {
      setDragOverGroup(groupName);
    }
  };

  const handleDropTask = (e, targetGroup) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('task-id') || e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          const isComp = targetGroup === 'completed';
          return { ...t, group: targetGroup, completed: isComp };
        }
        return t;
      }));
    }
    setDraggedTaskId(null);
    setDragOverGroup(null);
  };

  // ZACHYCENÍ PŘESNÉHO MÍSTA UCHOPENÍ KARTY MYŠÍ
  const handleEventDragStart = (e, ev) => {
    setDraggedEventId(ev.id);
    setDraggedTaskId(null);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const grabOffsetHours = Math.max(0, offsetY / HOUR_HEIGHT);

    setDragGrabOffsetHours(grabOffsetHours);
    setDraggedEventDuration(ev.durationHours || 1.0);
    setDraggedTitle(ev.title);
    setDraggedColor(ev.color || '#FF4742');

    e.dataTransfer.setData('event-id', ev.id);
  };

  // PRESNÝ MĚŘENÝ ŽIVÝ NÁHLED DRAG OVER V MŘÍŽCE ČASOVÉ OSY
  const handleTimelineGridDragOver = (e, dayOffset) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const cursorOffsetY = e.clientY - rect.top;
    
    const rawStartHour = (cursorOffsetY / HOUR_HEIGHT) - dragGrabOffsetHours;
    const startHour = Math.max(0, Math.min(23.75, rawStartHour));
    const roundedHour = Math.round(startHour * 4) / 4;
    
    const startH = Math.floor(roundedHour);
    const startM = Math.round((roundedHour - startH) * 60);
    const timeStr = `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`;
    const topPx = roundedHour * HOUR_HEIGHT;

    const duration = draggedEventDuration || 0.5;
    const durMin = Math.round(duration * 60);
    const durationText = durMin >= 60 ? `${Math.floor(durMin / 60)}h${durMin % 60 ? ` ${durMin % 60}m` : ''}` : `${durMin}m`;

    setDropTargetInfo({
      dayOffset,
      startHour: roundedHour,
      topPx,
      timeStr,
      durationHours: duration,
      durationText,
      title: draggedTitle || 'Vložit sem',
      color: draggedColor || '#FF4742'
    });
  };

  const handleTimelineGridDragLeave = () => {
    setDropTargetInfo(null);
  };

  const handleTimelineGridDrop = (e, dayOffset) => {
    e.preventDefault();
    
    const eventId = e.dataTransfer.getData('event-id') || draggedEventId;
    const taskId = e.dataTransfer.getData('task-id') || e.dataTransfer.getData('text/plain') || draggedTaskId;

    const rect = e.currentTarget.getBoundingClientRect();
    const cursorOffsetY = e.clientY - rect.top;
    const rawStartHour = (cursorOffsetY / HOUR_HEIGHT) - dragGrabOffsetHours;
    const startHour = Math.max(0, Math.min(23.75, rawStartHour));
    const roundedHour = Math.round(startHour * 4) / 4;
    
    const durationHours = draggedEventDuration || 0.5;
    const startH = Math.floor(roundedHour);
    const startM = Math.round((roundedHour - startH) * 60);
    const endH = Math.floor(roundedHour + durationHours);
    const endM = Math.round((roundedHour + durationHours - endH) * 60);

    const startTimeStr = `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`;
    const endTimeStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

    if (taskId && !eventId) {
      const targetTask = tasks.find(t => t.id === taskId);
      if (targetTask) {
        setTasks(prev => prev.map(t => {
          if (t.id === taskId) {
            return { ...t, dateRange: `${startTimeStr}` };
          }
          return t;
        }));

        setEvents(prev => {
          const filtered = prev.filter(ev => ev.taskId !== taskId);
          return [
            ...filtered,
            {
              id: `ev_task_${taskId}`,
              taskId: taskId,
              isTask: true,
              completed: targetTask.completed,
              dayOffset: dayOffset,
              title: targetTask.title,
              category: 'Úkol',
              color: '#3B82F6',
              bgColor: '#FFFFFF',
              borderColor: '#E5E7EB',
              startHour: roundedHour,
              durationHours: durationHours,
              durationText: '30m',
              startTimeStr,
              endTimeStr
            }
          ];
        });
      }
      setDraggedTaskId(null);
      setDropTargetInfo(null);
      return;
    }

    if (eventId) {
      setEvents(prev => prev.map(ev => {
        if (ev.id === eventId) {
          return {
            ...ev,
            dayOffset: dayOffset,
            startHour: roundedHour,
            startTimeStr,
            endTimeStr
          };
        }
        return ev;
      }));
      setDraggedEventId(null);
      setDropTargetInfo(null);
    }
  };

  return (
    <div className="routine-layout" style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      
      {/* ANIMACE ZAŠKRTNUTÍ PRO ZATRHÁVÁTKO */}
      <style>{`
        @keyframes checkPop {
          0% { transform: scale(0.6); opacity: 0.3; }
          50% { transform: scale(1.35); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes checkPulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .anim-check-pop {
          animation: checkPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, checkPulse 0.6s ease-out;
        }
      `}</style>

      {/* 1. Levá schovávací navigace Routine */}
      <RoutineSidebar
        activePage="agenda"
        activeSubView="agenda"
        onNavigate={onNavigate}
        onOpenQuickConsole={onOpenQuickConsole}
        user={user}
      />

      {/* 2. LEVÁ PŮLKA: ÚKOLY (EXAKTNĚ 50% PŮLKA STRÁNKY) */}
      <div style={{
        flex: 1,
        height: '100vh',
        borderRight: '1px solid #EAEAEA',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        overflowY: 'auto'
      }}>
        {/* Hlavička sloupce Úkolů */}
        <div style={{ padding: '24px 28px 16px 28px', borderBottom: '1px solid #F0F0F4' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#171b1f', margin: 0, letterSpacing: '-0.5px' }}>Dnes</h1>
          <div style={{ fontSize: '13px', color: '#747f8f', marginTop: '4px', fontWeight: 400 }}>Červenec 2026</div>

          {/* Vstup pro přidání úkolu */}
          <div style={{
            marginTop: '16px',
            backgroundColor: isInputFocused ? '#FFFFFF' : '#F4F4F6',
            borderRadius: '10px',
            padding: '8px 12px',
            border: isInputFocused ? '1.5px solid #FF4742' : '1px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: isInputFocused ? '0 4px 12px rgba(255,71,66,0.1)' : 'none',
            transition: 'all 0.2s ease'
          }}>
            <span style={{ color: '#8896a9', fontSize: '16px' }}>+</span>
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Přidat nový úkol..."
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px',
                color: '#171b1f',
                width: '100%',
                fontFamily: 'Inter, sans-serif'
              }}
            />
          </div>
        </div>

        {/* Seznam Úkolů s efektem zaškrtnutí */}
        <div style={{ padding: '20px 28px', flexGrow: 1 }}>
          
          {/* SKUPINA: PO TERMÍNU */}
          <div
            onDragOver={(e) => handleDragOverGroup(e, 'overdue')}
            onDrop={(e) => handleDropTask(e, 'overdue')}
            style={{
              marginBottom: '24px',
              backgroundColor: dragOverGroup === 'overdue' ? '#FFF5F5' : 'transparent',
              borderRadius: '8px',
              padding: '4px',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#FF4742', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>PO TERMÍNU</span>
              <span style={{ backgroundColor: '#FFEBEB', padding: '1px 6px', borderRadius: '10px', fontSize: '10px' }}>
                {tasks.filter(t => t.group === 'overdue' && !t.completed).length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {tasks.filter(t => t.group === 'overdue' && !t.completed).map(t => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => handleDragStartTask(e, t)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #F0F0F4',
                    cursor: 'grab',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div 
                      onClick={() => toggleTask(t.id)}
                      className={recentlyCheckedId === t.id ? 'anim-check-pop' : ''}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: t.completed ? 'none' : '1.5px solid #A0A0B0',
                        backgroundColor: t.completed ? '#10B981' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      {t.completed && <i className="las la-check" style={{ color: '#FFFFFF', fontSize: '12px' }}></i>}
                    </div>
                    <span style={{ fontSize: '13px', color: '#171b1f', fontWeight: 400 }}>{t.title}</span>
                  </div>

                  {t.dateRange && (
                    <span 
                      onClick={() => setActiveDatePickerTask(t)}
                      style={{ fontSize: '11px', color: '#747f8f', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      {t.dateRange}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SKUPINA: DNES */}
          <div
            onDragOver={(e) => handleDragOverGroup(e, 'today')}
            onDrop={(e) => handleDropTask(e, 'today')}
            style={{
              marginBottom: '24px',
              backgroundColor: dragOverGroup === 'today' ? '#EEF4FF' : 'transparent',
              borderRadius: '8px',
              padding: '4px',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#171b1f', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>DNES</span>
              <span style={{ backgroundColor: '#F3F4F6', padding: '1px 6px', borderRadius: '10px', fontSize: '10px', color: '#5e6774' }}>
                {tasks.filter(t => t.group === 'today' && !t.completed).length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {tasks.filter(t => t.group === 'today' && !t.completed).map(t => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => handleDragStartTask(e, t)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #F0F0F4',
                    cursor: 'grab',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div 
                      onClick={() => toggleTask(t.id)}
                      className={recentlyCheckedId === t.id ? 'anim-check-pop' : ''}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: t.completed ? 'none' : '1.5px solid #A0A0B0',
                        backgroundColor: t.completed ? '#10B981' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      {t.completed && <i className="las la-check" style={{ color: '#FFFFFF', fontSize: '12px' }}></i>}
                    </div>
                    <span style={{ fontSize: '13px', color: '#171b1f', fontWeight: 400 }}>{t.title}</span>
                  </div>

                  {t.badge && (
                    <span style={{ fontSize: '10px', fontWeight: 500, color: '#4A85F6', backgroundColor: '#EEF4FF', padding: '2px 6px', borderRadius: '4px' }}>
                      {t.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SKUPINA: DOKONČENÉ */}
          <div
            onDragOver={(e) => handleDragOverGroup(e, 'completed')}
            onDrop={(e) => handleDropTask(e, 'completed')}
            style={{
              marginBottom: '24px',
              backgroundColor: dragOverGroup === 'completed' ? '#ECFDF5' : 'transparent',
              borderRadius: '8px',
              padding: '4px',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              DOKONČENÉ
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {tasks.filter(t => t.completed).map(t => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => handleDragStartTask(e, t)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#FAFAFA',
                    opacity: 0.75,
                    cursor: 'grab'
                  }}
                >
                  <div 
                    onClick={() => toggleTask(t.id)}
                    className={recentlyCheckedId === t.id ? 'anim-check-pop' : ''}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <i className="las la-check" style={{ color: '#FFFFFF', fontSize: '12px' }}></i>
                  </div>
                  <span style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'line-through' }}>{t.title}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 3. PRAVÁ PŮLKA: ČASOVÁ OSA AGENDY S HORNÍM PŘECHODEM A DYNAMICKÝM DATUMEM */}
      <div 
        ref={timelineScrollRef}
        onScroll={handleScrollTimeline}
        style={{ flex: 1, height: '100vh', overflowY: 'auto', backgroundColor: '#FFFFFF', position: 'relative' }}
      >
        {/* HORNÍ SVOJE SLOGAN PRECHOD (GRADIENT FADE OVERLAY) S CENTROVANÝM VELKÝM DATUMEM */}
        <div style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          height: '74px',
          background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.94) 65%, rgba(255,255,255,0) 100%)',
          zIndex: 100,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* CENTROVANÝ WHATSAPP-STYLE DATUM S LETOPOČTEM */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.07)',
            border: '1px solid rgba(220, 220, 230, 0.8)',
            borderRadius: '20px',
            padding: '7px 20px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#171B1F',
            pointerEvents: 'auto',
            letterSpacing: '-0.2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{activeVisibleDateStr}</span>
            <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, marginLeft: '4px' }}>● {currentTimeText}</span>
          </div>
        </div>

        {/* DYNAMICKÝ NEKONEČNÝ STREAM DNŮ */}
        <div style={{ marginTop: '-40px' }}>
          {offsets.map(offset => {
            const dayObj = getDayDetails(offset);
            const rawEvents = events.filter(ev => ev.dayOffset === offset && !ev.isAllDay);
            const allDayEvents = events.filter(ev => ev.dayOffset === offset && ev.isAllDay);
            const isTargetDay = dropTargetInfo && dropTargetInfo.dayOffset === offset;
            
            // VÝPOČET SOUBĚŽNÝCH UDÁLOSTÍ PRO ZOBRAZENÍ VEDLE SEBE (KONFLIKTY)
            const layoutedEvents = computeEventLayout(rawEvents);
            const nameDayPerson = getCzechNameDay(dayObj.dateObj);

            return (
              <div 
                key={offset}
                ref={dayObj.isToday ? todaySectionRef : null}
                style={{
                  position: 'relative',
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  marginTop: '16px'
                }}
              >
                {/* CENTROVANÁ HLAVIČKA DNE A SVÁTKU Z ČESKÉHO KALENDÁŘE (MÍSTO NADPISU ALL DAY) */}
                <div style={{
                  paddingLeft: '80px',
                  paddingRight: '32px',
                  marginTop: '20px',
                  marginBottom: '12px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px'
                }}>
                  <h2 style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: dayObj.isToday ? '#FF4742' : '#171B1F',
                    margin: 0,
                    letterSpacing: '-0.3px'
                  }}>
                    {dayObj.subLabel ? `${dayObj.subLabel} – ${dayObj.fullDateStr}` : dayObj.fullDateStr}
                  </h2>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#747F8F',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <i className="las la-calendar-day" style={{ color: '#F59E0B', fontSize: '13px' }}></i>
                    <span>Svátek má: <strong>{nameDayPerson}</strong></span>
                  </div>
                </div>

                {/* CELODENNÍ AKCE (TINT BACKGROUND, BEZ "CELÝ DEN", STEJNĚ ŠIROKÉ POD SEBOU, VČETNĚ NAROZENIN A JMENIN) */}
                {allDayEvents.length > 0 && (
                  <div style={{
                    paddingLeft: '80px',
                    paddingRight: '32px',
                    marginBottom: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    {allDayEvents.map(ev => (
                      <div 
                        key={ev.id}
                        onClick={() => setActiveEventModal({ ...ev })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          backgroundColor: ev.bgColor || '#FFF5F5',
                          border: `1px solid ${ev.borderColor || '#FECDD3'}`,
                          borderRadius: '8px',
                          padding: '9px 14px',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#171B1F',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                          boxSizing: 'border-box',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                          {/* ROUTINE INSET CAPSULE BAR */}
                          <div style={{
                            width: '3.5px',
                            height: '16px',
                            backgroundColor: ev.color || '#FF4742',
                            borderRadius: '4px',
                            flexShrink: 0
                          }} />

                          {/* VEKTOROVÁ IKONA AKCE POKUD EXISTUJE */}
                          {ev.iconClass && (
                            <i className={ev.iconClass} style={{ color: ev.color || '#FF4742', fontSize: '16px', flexShrink: 0 }}></i>
                          )}

                          <span style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontWeight: 500
                          }}>
                            {ev.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ČASOVÁ MŘÍŽKA DNE S PODPOROU ZOBRAZENÍ KONFLIKTŮ VEDLE SEBE A PŘESNÉHO DRAG & DROP */}
                <div 
                  onDragOver={(e) => handleTimelineGridDragOver(e, offset)}
                  onDragLeave={handleTimelineGridDragLeave}
                  onDrop={(e) => handleTimelineGridDrop(e, offset)}
                  style={{ position: 'relative', height: `${24 * HOUR_HEIGHT}px`, paddingLeft: '80px', paddingRight: '32px' }}
                >
                  {/* SVISLÁ LINKA OSY ROUTINE */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: '64px',
                    width: '1px',
                    backgroundColor: '#EAEAEA',
                    pointerEvents: 'none'
                  }} />

                  {/* HOURLY LINES AND CZECH LABELS (BEZ HORIZONTÁLNÍCH HRANATÝCH PROUŽKŮ) */}
                  {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                    <div key={hour} style={{ position: 'absolute', top: `${hour * HOUR_HEIGHT}px`, left: 0, right: 0, height: `${HOUR_HEIGHT}px`, borderTop: '1px dashed #F4F4F6', pointerEvents: 'none' }}>
                      <span style={{
                        position: 'absolute',
                        left: '16px',
                        top: '-8px',
                        fontSize: '11px',
                        color: dayObj.isToday && Math.floor(currentTopPx / HOUR_HEIGHT) === hour ? '#FF4742' : '#8896A9',
                        fontWeight: dayObj.isToday && Math.floor(currentTopPx / HOUR_HEIGHT) === hour ? 600 : 400
                      }}>
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                  ))}

                  {/* RYSKA AKTUÁLNÍHO ČASU S ČERVENÝM ODZNAKEM "10:25" */}
                  {dayObj.isToday && (
                    <div style={{
                      position: 'absolute',
                      top: `${currentTopPx}px`,
                      left: '64px',
                      right: 0,
                      height: '1px',
                      backgroundColor: '#FF4742',
                      zIndex: 25,
                      pointerEvents: 'none'
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: '-48px',
                        top: '-9px',
                        backgroundColor: '#FF4742',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        boxShadow: '0 2px 6px rgba(255,71,66,0.3)',
                        letterSpacing: '-0.2px'
                      }}>
                        {currentTimeText}
                      </div>
                    </div>
                  )}

                  {/* ZVÝRAZNĚNÍ CÍLOVÉHO ČASU PŘI PŘETAHOVÁNÍ */}
                  {isTargetDay && dropTargetInfo && (
                    <div style={{
                      position: 'absolute',
                      top: `${dropTargetInfo.topPx}px`,
                      left: '80px',
                      right: '32px',
                      height: `${Math.max(46, (dropTargetInfo.durationHours || 0.5) * HOUR_HEIGHT)}px`,
                      backgroundColor: 'rgba(255, 71, 66, 0.08)',
                      border: '2px dashed #FF4742',
                      borderRadius: '8px',
                      zIndex: 50,
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      pointerEvents: 'none',
                      boxSizing: 'border-box',
                      transition: 'top 0.04s linear'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                        <div style={{ width: '3.5px', height: '14px', backgroundColor: dropTargetInfo.color || '#FF4742', borderRadius: '4px' }} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#FF4742', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          🎯 {dropTargetInfo.title}: {dropTargetInfo.timeStr}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#FF4742', fontWeight: 600, flexShrink: 0 }}>
                        {dropTargetInfo.durationText}
                      </span>
                    </div>
                  )}

                  {/* KARTY UDÁLOSTÍ S AUTOMATICKÝM ZOBRAZENÍM VEDLE SEBE PŘI KONFLIKTU */}
                  {layoutedEvents.map(ev => {
                    const topPx = ev.startHour * HOUR_HEIGHT;
                    const cardHeightPx = Math.max(46, ev.durationHours * HOUR_HEIGHT);

                    const numCols = ev._numCols || 1;
                    const colIndex = ev._colIndex || 0;
                    const colWidthPercent = 100 / numCols;
                    const colLeftPercent = colIndex * colWidthPercent;
                    const isConflict = numCols > 1;

                    return (
                      <div
                        key={ev.id}
                        draggable
                        onDragStart={(e) => handleEventDragStart(e, ev)}
                        onClick={() => !ev.isTask && setActiveEventModal({ ...ev })}
                        style={{
                          position: 'absolute',
                          top: `${topPx}px`,
                          left: `calc(80px + (100% - 112px) * ${colLeftPercent / 100})`,
                          width: `calc((100% - 112px) * ${colWidthPercent / 100} - ${isConflict ? 6 : 0}px)`,
                          height: `${cardHeightPx}px`,
                          backgroundColor: ev.completed ? '#FAFAFA' : (ev.bgColor || '#FFFFFF'),
                          border: isConflict ? '1.5px solid #FF4742' : '1px solid #EAEAEA',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          boxShadow: isConflict ? '0 2px 10px rgba(255, 71, 66, 0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                          cursor: 'grab',
                          zIndex: 10 + colIndex,
                          boxSizing: 'border-box',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-start',
                          overflow: 'hidden',
                          opacity: ev.completed ? 0.6 : 1
                        }}
                      >
                        {/* VAROVÁNÍ PŘI KONFLIKTU UDÁLOSTÍ */}
                        {isConflict && (
                          <div style={{ fontSize: '10px', fontWeight: 600, color: '#FF4742', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>⚠️ KONFLIKT</span>
                          </div>
                        )}

                        {/* HORNÍ ŘÁDEK: INSET CAPSULE + ZATRHÁVÁTKO + NÁZEV U HORNÍ HRANY + TRVÁNÍ VPRAPO */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', flexGrow: 1 }}>
                            
                            {/* ROUTINE CAPSULE INDICATOR BAR */}
                            <div style={{
                              width: '3.5px',
                              height: '14px',
                              backgroundColor: ev.completed ? '#D1D5DB' : (ev.color || '#FF4742'),
                              borderRadius: '4px',
                              flexShrink: 0
                            }} />

                            {/* ZATRHÁVÁTKO PRO ÚKOLY */}
                            {ev.isTask && (
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTaskFromTimeline(ev);
                                }}
                                className={recentlyCheckedId === ev.id ? 'anim-check-pop' : ''}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '4px',
                                  border: ev.completed ? 'none' : '1.5px solid #A0A0B0',
                                  backgroundColor: ev.completed ? '#10B981' : '#FFFFFF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  flexShrink: 0
                                }}
                              >
                                {ev.completed && <i className="las la-check" style={{ color: '#FFFFFF', fontSize: '11px' }}></i>}
                              </div>
                            )}

                            <span style={{
                              fontSize: isConflict ? '12px' : '14px',
                              fontWeight: 500,
                              color: ev.completed ? '#8C8C9A' : '#171B1F',
                              textDecoration: ev.completed ? 'line-through' : 'none',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: '1.2'
                            }}>
                              {ev.title}
                            </span>
                          </div>

                          {/* DOBA TRVÁNÍ VPRAPO (30m, 1h) */}
                          <span style={{ fontSize: '11px', color: '#8C8C9A', fontWeight: 400, marginLeft: '6px', flexShrink: 0 }}>
                            {ev.durationText || `${Math.round((ev.durationHours || 0.5) * 60)}m`}
                          </span>
                        </div>

                        {/* POZNÁMKY POD NÁZVEM POKUD EXISTUJE */}
                        {ev.notes && !isConflict && (
                          <div style={{ fontSize: '12px', color: '#8C8C9A', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ev.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODÁLNÍ OKNO DETAILU UDÁLOSTI */}
      {activeEventModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setActiveEventModal(null)}
        >
          <div 
            style={{
              width: '440px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
              padding: '24px',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={activeEventModal.title || ''}
              onChange={(e) => setActiveEventModal({ ...activeEventModal, title: e.target.value })}
              placeholder="Název události"
              style={{
                width: '100%',
                fontSize: '18px',
                fontWeight: 500,
                color: '#171b1f',
                border: 'none',
                outline: 'none',
                marginBottom: '16px',
                fontFamily: 'Inter, sans-serif'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #F0F0F4', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setActiveEventModal(null)}
                style={{
                  backgroundColor: '#FDF2F2',
                  color: '#FF4742',
                  border: '1px solid #FCA5A5',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Zrušit
              </button>

              <button
                type="button"
                onClick={() => {
                  setEvents(prev => prev.map(ev => ev.id === activeEventModal.id ? activeEventModal : ev));
                  setActiveEventModal(null);
                }}
                style={{
                  backgroundColor: '#2A2E33',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 22px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Uložit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export default RoutineAgendaView;
