import React, { useState, useEffect, useRef } from 'react';
import { RoutineSidebar } from '../components/navigation/RoutineSidebar.jsx';

export function RoutineAgendaView({ user, onNavigate, onSelectEntity, onOpenQuickConsole, isMobileView }) {
  const [currentTimeText, setCurrentTimeText] = useState('10:30');
  const [currentTopPx, setCurrentTopPx] = useState(840);
  const [newTaskText, setNewTaskText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
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
  const [activeVisibleOffset, setActiveVisibleOffset] = useState(0);

  // Stavy pre interaktivní hover bubliny (onMouse) u kroužků u datumu
  const [hoveredBadgeType, setHoveredBadgeType] = useState(null); // 'allday' | 'birthday' | 'nameday' | null

  const [editingTask, setEditingTask] = useState(null);
  const [isDeletingTaskModal, setIsDeletingTaskModal] = useState(false);
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState('');
  const [assignedEntitiesSearchQuery, setAssignedEntitiesSearchQuery] = useState('');

  // NASTAVENÍ SLEDOVÁNÍ NAROZENIN A JMENIN V KALENDÁŘI (ČTE SE Z SYSTÉMOVÉHO NASTAVENÍ SYSTEM / LOCALSTORAGE)
  const [birthdayTrackingSettings, setBirthdayTrackingSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('birthday_tracking_settings');
      return saved ? JSON.parse(saved) : { child: true, foster_parent: false, coworker: false, other: false };
    } catch (e) {
      return { child: true, foster_parent: false, coworker: false, other: false };
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('birthday_tracking_settings');
        if (saved) setBirthdayTrackingSettings(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  // POSLUCHAČ KLÁVES ESC A ENTER PRO SPOLULAHLIVÉ OVLÁDÁNÍ MODÁLNÍHO OKNA ÚPRAVY ÚKOLU
  useEffect(() => {
    if (!editingTask) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setEditingTask(null);
      } else if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        setTasks(prev => prev.map(t => t.id === editingTask.id ? editingTask : t));
        setEditingTask(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingTask]);

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
      setActiveVisibleOffset(currentOffset);
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

  // SEED DATA: Události a celodenní akce (včetně Narozenin a Jmenin dětí i pěstounů)
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
      id: 'e_allday_child_bday',
      dayOffset: 0,
      title: 'Narozeniny: Adam Novák (dítě v péči) - 8 let',
      category: 'Narozeniny',
      personId: 'ent_adam',
      personName: 'Adam Novák',
      personRole: 'Dítě v péči',
      iconClass: 'las la-birthday-cake',
      color: '#EC4899',
      isAllDay: true
    },
    {
      id: 'e_allday_bday',
      dayOffset: 0,
      title: 'Narozeniny: Tomáš Dvořák (pěstoun) - 42 let',
      category: 'Narozeniny',
      personId: 'ent_dvorak',
      personName: 'Tomáš Dvořák',
      personRole: 'Pěstoun',
      iconClass: 'las la-birthday-cake',
      color: '#EC4899',
      isAllDay: true
    },
    {
      id: 'e_allday_nameday',
      dayOffset: 0,
      title: 'Jmeniny: Kristýna Nováková (dítě v péči)',
      category: 'Jmeniny',
      personId: 'ent_novakova',
      personName: 'Kristýna Nováková',
      personRole: 'Dítě v péči',
      iconClass: 'las la-gift',
      color: '#A855F7',
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

  // Stavy pro segmentaci, vyhľadávanie a filtráciu úkolov podľa konkrétneho subjektu
  const [selectedSegment, setSelectedSegment] = useState('all'); // 'all' | 'family' | 'foster_parent' | 'child' | 'coworker'
  const [groupByEntity, setGroupByEntity] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);
  const [selectedEntityFilter, setSelectedEntityFilter] = useState('all'); // 'all' | entityId
  const [isEntityDropdownOpen, setIsEntityDropdownOpen] = useState(false);
  const [disappearingTaskIds, setDisappearingTaskIds] = useState([]);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showSegmentBar, setShowSegmentBar] = useState(false);

  // Úkoly se přiřazenými subjekty pro přesnou segmentaci
  const [tasks, setTasks] = useState([
    { 
      id: 't1', 
      title: 'Tato návštěva je po termínu!', 
      group: 'overdue', 
      completed: false, 
      starred: false, 
      dateRange: '23. 3. – 29. 3.',
      entityType: 'family',
      entityId: 'fam_dvorak',
      entityName: 'Rodina Dvořákova'
    },
    { 
      id: 't2', 
      title: 'Zablokovat čas pro důležité schůzky IPOD', 
      group: 'overdue', 
      completed: false, 
      starred: false, 
      dateRange: '23. 3. – 29. 3.',
      entityType: 'foster_parent',
      entityId: 'ent_dvorak',
      entityName: 'Tomáš Dvořák'
    },
    { 
      id: 't3', 
      title: 'Odložit vykazování respitní péče na později', 
      group: 'overdue', 
      completed: false, 
      starred: false, 
      dateRange: '23. 3. – 29. 3.',
      entityType: 'child',
      entityId: 'ent_adam',
      entityName: 'Adam Novák'
    },
    { 
      id: 't4', 
      title: 'Naplánovat tuto návštěva na jiný den', 
      group: 'overdue', 
      completed: false, 
      starred: false, 
      dateRange: '25. března',
      entityType: 'coworker',
      entityId: 'ent_kralova',
      entityName: 'Mgr. Alena Králová'
    },
    { 
      id: 't5', 
      title: 'Propojit všechny účty OSPOD a školy', 
      group: 'overdue', 
      completed: false, 
      starred: false, 
      dateRange: '25. března',
      entityType: 'family',
      entityId: 'fam_novak',
      entityName: 'Rodina Novákova'
    },
    { 
      id: 't6', 
      title: 'Nainstalovat CRM Doprovázení na další zařízení', 
      group: 'overdue', 
      completed: false, 
      starred: false, 
      dateRange: '25. března',
      entityType: 'coworker',
      entityId: 'ent_self',
      entityName: 'Jana Nováková'
    },
    { 
      id: 't7', 
      title: 'Pravidelná 2M návštěva v rodině Dvořákových', 
      group: 'today', 
      completed: false, 
      starred: true, 
      badge: 'OSPOD',
      entityType: 'family',
      entityId: 'fam_dvorak',
      entityName: 'Rodina Dvořákova'
    },
    { 
      id: 't8', 
      title: 'Zkontrolovat plnění cílů IPOD u Tomáše Dvořáka', 
      group: 'today', 
      completed: false, 
      starred: true, 
      badge: 'N',
      entityType: 'foster_parent',
      entityId: 'ent_dvorak',
      entityName: 'Tomáš Dvořák'
    },
    { 
      id: 't9', 
      title: 'Nakonfigurovat denní agenda klíčové osoby', 
      group: 'completed', 
      completed: true, 
      starred: false,
      entityType: 'coworker',
      entityId: 'ent_self',
      entityName: 'Jana Nováková'
    },
    { 
      id: 't10', 
      title: 'Vytvořit nový spis rodiny jednoduše', 
      group: 'completed', 
      completed: true, 
      starred: false,
      entityType: 'family',
      entityId: 'fam_novak',
      entityName: 'Rodina Novákova'
    },
    {
      id: 't_unassigned_1',
      title: 'Objednat nové kancelářské potřeby a šanony',
      group: 'today',
      completed: false,
      starred: false,
      dateRange: 'Dnes',
      entityType: null,
      entityId: null,
      entityName: null
    }
  ]);

  // VÝPOČET KROUŽKŮ A BUBLIN PRO PROPLÁVAJÍCÍ HLAVNÍ DATUMOVÝ BANNER
  const activeDayAllDayEvents = events.filter(ev => ev.dayOffset === activeVisibleOffset && ev.isAllDay);

  const isPersonTracked = (ev) => {
    const role = ev.personRole;
    if (role === 'Dítě v péči' || (ev.title && ev.title.toLowerCase().includes('dítě'))) return birthdayTrackingSettings.child;
    if (role === 'Pěstoun' || (ev.title && ev.title.toLowerCase().includes('pěstoun'))) return birthdayTrackingSettings.foster_parent;
    if (role === 'Pracovník' || (ev.title && ev.title.toLowerCase().includes('pracovník'))) return birthdayTrackingSettings.coworker;
    return birthdayTrackingSettings.other;
  };

  const regularAllDayEvents = activeDayAllDayEvents.filter(ev => ev.category !== 'Narozeniny' && ev.category !== 'Jmeniny');
  const childBirthdayEvents = activeDayAllDayEvents.filter(ev => ev.category === 'Narozeniny' && isPersonTracked(ev));
  const childNameDayEvents = activeDayAllDayEvents.filter(ev => ev.category === 'Jmeniny' && isPersonTracked(ev));

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
    const targetTask = tasks.find(t => t.id === id);
    if (!targetTask) return;

    if (!targetTask.completed) {
      // Ak ide o dokončenie (zaškrtnutie nezaškrtnutého úkolu), najprv spustíme plynulú animáciu miznutia
      setDisappearingTaskIds(prev => [...prev, id]);

      setTimeout(() => {
        setTasks(prev => prev.map(t => {
          if (t.id === id) {
            return { ...t, completed: true, group: 'completed' };
          }
          return t;
        }));
        setDisappearingTaskIds(prev => prev.filter(tid => tid !== id));
      }, 420);
    } else {
      // Ak odškrtávame z dokončených späť na aktívne
      setTasks(prev => prev.map(t => {
        if (t.id === id) {
          return { ...t, completed: false, group: 'today' };
        }
        return t;
      }));
    }

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

  // CHYTRÉ ROZPOZNÁVÁNÍ SUBJEKTŮ, EMAILŮ A DATUMOVÝCH ROZSAHŮ Z TEXTU NEBO DIKTÁTU
  const parseSmartTaskInput = (rawText) => {
    if (!rawText) return { cleanTitle: '', entityInfo: { entityType: null, entityId: null, entityName: null }, parsedDateRange: null };

    let text = rawText;
    let entityInfo = { entityType: null, entityId: null, entityName: null };
    let parsedDateRange = null;

    // 1. ROZPOZNÁNÍ SUBJEKTŮ (EMAIL A JMÉNO / ALIAS)
    const entityRules = [
      { regex: /\b(tomasdvorak@gmail\.com|tomáš dvořák|tomaš dvořak|tomášovi dvořákovi|tomas dvorak|@tomasdvorak|@tomas)\b/gi, type: 'foster_parent', id: 'ent_dvorak', name: 'Tomáš Dvořák' },
      { regex: /\b(adamnovak@gmail\.com|adam novák|adamovi novákovi|adam novak|@adamnovak|@adam)\b/gi, type: 'child', id: 'ent_adam', name: 'Adam Novák' },
      { regex: /\b(rodinadvorakova@gmail\.com|rodina dvořákova|dvořákovi|dvořákovým|rodina dvorakova|@dvorakovi)\b/gi, type: 'family', id: 'fam_dvorak', name: 'Rodina Dvořákova' },
      { regex: /\b(rodinanovakova@gmail\.com|rodina novákova|novákovi|novákovým|rodina novakova|@novakovi)\b/gi, type: 'family', id: 'fam_novak', name: 'Rodina Novákova' },
      { regex: /\b(alenakralova@gmail\.com|alena králová|aleno králová|aleně králové|alena kralova|@alenakralova)\b/gi, type: 'coworker', id: 'ent_kralova', name: 'Mgr. Alena Králová' },
      { regex: /\b(jananovakova@gmail\.com|jana nováková|janě novákové|jana novakova|@jananovakova)\b/gi, type: 'coworker', id: 'ent_self', name: 'Jana Nováková' }
    ];

    for (const rule of entityRules) {
      if (rule.regex.test(text)) {
        entityInfo = { entityType: rule.type, entityId: rule.id, entityName: rule.name };
        text = text.replace(rule.regex, '').trim();
        break;
      }
    }

    // 2. ROZPOZNÁNÍ DATUMOVÝCH ROZSAHŮ (např. "24/8 až 2/9", "24.8. - 2.9.", "od 24. srpna do 2. září")
    const dateRangeRegex = /\b(?:od\s+)?(\d{1,2})[\.\/](\d{1,2})\.?(?:\s*(?:až|do|-|–|to)\s*(\d{1,2})[\.\/](\d{1,2})\.?)?\b/i;
    const matchRange = text.match(dateRangeRegex);

    if (matchRange) {
      const d1 = matchRange[1];
      const m1 = matchRange[2];
      const d2 = matchRange[3];
      const m2 = matchRange[4];

      if (d1 && m1 && d2 && m2) {
        parsedDateRange = `${d1}.${m1}. → ${d2}.${m2}.`;
      } else if (d1 && m1) {
        parsedDateRange = `${d1}.${m1}.`;
      }
      text = text.replace(matchRange[0], '').trim();
    } else {
      // Slovní datumy (dnes, zítra)
      if (/\b(dnes|dnešek)\b/i.test(text)) {
        parsedDateRange = 'Dnes';
        text = text.replace(/\b(dnes|dnešek)\b/i, '').trim();
      } else if (/\b(zítra|zajtra)\b/i.test(text)) {
        parsedDateRange = 'Zítra';
        text = text.replace(/\b(zítra|zajtra)\b/i, '').trim();
      }
    }

    // Vyčištění zbytků spojek jako "mezi", "od", "do", "až"
    let cleanTitle = text
      .replace(/\s+(mezi|od|do|až)\s+$/gi, '')
      .replace(/^\s*(mezi|od|do|až)\s+/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (!cleanTitle) cleanTitle = rawText;

    return { cleanTitle, entityInfo, parsedDateRange };
  };

  // HLASOVÉ DIKTOVÁNÍ (WEB SPEECH API)
  const handleStartListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Hlasové diktování není v tomto prohlížeči podporováno. Zkuste Google Chrome nebo Microsoft Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'cs-CZ';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setNewTaskText(transcript);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;

    const parsed = parseSmartTaskInput(newTaskText);

    let entityInfo = parsed.entityInfo;
    if (!entityInfo.entityId) {
      if (selectedEntityFilter === 'fam_dvorak') entityInfo = { entityType: 'family', entityId: 'fam_dvorak', entityName: 'Rodina Dvořákova' };
      else if (selectedEntityFilter === 'fam_novak') entityInfo = { entityType: 'family', entityId: 'fam_novak', entityName: 'Rodina Novákova' };
      else if (selectedEntityFilter === 'ent_dvorak') entityInfo = { entityType: 'foster_parent', entityId: 'ent_dvorak', entityName: 'Tomáš Dvořák' };
      else if (selectedEntityFilter === 'ent_adam') entityInfo = { entityType: 'child', entityId: 'ent_adam', entityName: 'Adam Novák' };
      else if (selectedEntityFilter === 'ent_kralova') entityInfo = { entityType: 'coworker', entityId: 'ent_kralova', entityName: 'Mgr. Alena Králová' };
      else if (selectedEntityFilter === 'ent_self') entityInfo = { entityType: 'coworker', entityId: 'ent_self', entityName: 'Jana Nováková' };
    }

    const newTask = {
      id: `t_${Date.now()}`,
      title: parsed.cleanTitle || newTaskText.trim(),
      group: 'today',
      completed: false,
      starred: false,
      dateRange: parsed.parsedDateRange || 'Dnes',
      ...entityInfo
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

  // KLIKNUTÍ NA CELODENNÍ AKCI (PŘESMĚROVÁNÍ NA PROFIL OSOBY U NAROZENIN A JMENIN)
  const handleAllDayClick = (ev) => {
    if (ev.category === 'Narozeniny' || ev.category === 'Jmeniny') {
      if (onSelectEntity) {
        onSelectEntity({
          id: ev.personId || 'ent_dvorak',
          name: ev.personName || 'Tomáš Dvořák',
          type: 'person',
          role: ev.personRole || (ev.category === 'Narozeniny' ? 'Pěstoun' : 'Dítě v péči')
        });
      } else if (onNavigate) {
        onNavigate('entity-profile');
      }
    } else {
      setActiveEventModal({ ...ev });
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
        @keyframes modalImplode {
          0% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0px);
          }
          40% {
            opacity: 0.7;
            transform: scale(0.65) translateY(-15px) rotate(-3deg);
            filter: blur(2px);
          }
          100% {
            opacity: 0;
            transform: scale(0.02) translateY(-40px) rotate(12deg);
            filter: blur(10px);
          }
        }
        .anim-modal-imploding {
          animation: modalImplode 0.32s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards !important;
        }
        @keyframes taskImplode {
          0% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
            max-height: 60px;
            margin-bottom: 6px;
          }
          40% {
            opacity: 0.85;
            transform: scale(0.85) scaleY(0.7);
            filter: blur(1px);
            background-color: #ECFDF5;
          }
          80% {
            opacity: 0.15;
            transform: scale(0.15) scaleY(0.1);
            filter: blur(5px);
            max-height: 12px;
            margin-bottom: 2px;
          }
          100% {
            opacity: 0;
            transform: scale(0);
            filter: blur(10px);
            max-height: 0px;
            margin-bottom: 0px;
            padding-top: 0px;
            padding-bottom: 0px;
            border-width: 0px;
          }
        }
        .anim-task-disappearing {
          animation: taskImplode 0.4s cubic-bezier(0.6, -0.15, 0.735, 0.045) forwards !important;
          overflow: hidden !important;
          pointer-events: none !important;
          transform-origin: center center !important;
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

      {/* 2. LEVÁ PŮLKA: ÚKOLY (EXAKTNĚ 50% PŮLKA STRÁNKY, FIXNÍ HLAVIČKA A NEZÁVISLÝ SCROLL POUZE V SEZNAMU) */}
      <div style={{
        flex: 1,
        height: '100vh',
        borderRight: 'none',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden'
      }}>
        {/* FIXNÍ HLAVIČKA SLOUPCE ÚKOLŮ S TITULEM, IKONOVOU LIŠTOU BEZ STÍNU, SEGMENTACÍ, VYHLEDÁVAČEM A DROPDOWNEM */}
        <div style={{ padding: '24px 28px 16px 28px', flexShrink: 0, backgroundColor: '#FFFFFF', zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#171b1f', margin: 0, letterSpacing: '-0.5px' }}>Úkoly</h1>
            </div>

            {/* IKONOVÉ NÁSTROJE BEZ STÍNU MÍSTO STARÉHO TLAČÍTKA SESKUPIT */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* 1. HLEDÁNÍ */}
              <button
                type="button"
                onClick={() => setShowSearchInput(!showSearchInput)}
                title="Zobrazit / skrýt vyhledávání"
                style={{
                  border: 'none',
                  boxShadow: 'none',
                  backgroundColor: (showSearchInput || searchQuery) ? '#FFEBEB' : '#F4F4F6',
                  color: (showSearchInput || searchQuery) ? '#FF4742' : '#5E6774',
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'all 0.15s ease'
                }}
              >
                <i className="las la-search" />
              </button>

              {/* 2. FILTROVÁNÍ SUBJEKTU */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsEntityDropdownOpen(!isEntityDropdownOpen)}
                  title="Filtrovat konkrétní subjekt"
                  style={{
                    border: 'none',
                    boxShadow: 'none',
                    backgroundColor: (isEntityDropdownOpen || selectedEntityFilter !== 'all') ? '#EEF4FF' : '#F4F4F6',
                    color: (isEntityDropdownOpen || selectedEntityFilter !== 'all') ? '#2563EB' : '#5E6774',
                    padding: '0 10px',
                    height: '34px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '12px',
                    fontWeight: 600,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <i className="las la-filter" style={{ fontSize: '15px' }} />
                  <span>
                    {selectedEntityFilter === 'all'
                      ? 'Filtrovat'
                      : selectedEntityFilter === 'fam_dvorak' ? 'Rodina Dvořákova'
                      : selectedEntityFilter === 'fam_novak' ? 'Rodina Novákova'
                      : selectedEntityFilter === 'ent_dvorak' ? 'Tomáš Dvořák'
                      : selectedEntityFilter === 'ent_adam' ? 'Adam Novák'
                      : selectedEntityFilter === 'ent_kralova' ? 'Alena Králová'
                      : 'Jana Nováková'
                    }
                  </span>
                  <i className={`las la-angle-${isEntityDropdownOpen ? 'up' : 'down'}`} style={{ fontSize: '11px', marginLeft: '2px' }} />
                </button>

                {/* FLOATING CUSTOM POPOVER PANEL */}
                {isEntityDropdownOpen && (
                  <>
                    <div 
                      onClick={() => setIsEntityDropdownOpen(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      zIndex: 1000,
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      boxShadow: '0 12px 36px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
                      border: '1px solid #EAEAEE',
                      width: '220px',
                      padding: '6px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}>
                      {/* POLOŽKA: VŠECHNY SUBJEKTY */}
                      <div
                        onClick={() => { setSelectedEntityFilter('all'); setIsEntityDropdownOpen(false); }}
                        style={{
                          padding: '8px 14px',
                          fontSize: '12px',
                          fontWeight: selectedEntityFilter === 'all' ? 600 : 400,
                          color: selectedEntityFilter === 'all' ? '#FF4742' : '#171B1F',
                          backgroundColor: selectedEntityFilter === 'all' ? '#FFF5F5' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => selectedEntityFilter !== 'all' && (e.currentTarget.style.backgroundColor = '#F4F4F6')}
                        onMouseLeave={(e) => selectedEntityFilter !== 'all' && (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <i className="las la-list" style={{ fontSize: '15px', color: '#747F8F' }} />
                        <span>Všechny subjekty</span>
                      </div>

                      <div style={{ height: '1px', backgroundColor: '#F0F0F4', margin: '4px 0' }} />

                      {/* SKUPINA: RODINY */}
                      <div style={{ padding: '4px 14px 2px 14px', fontSize: '10px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className="las la-home" style={{ fontSize: '12px' }} />
                        <span>Rodiny</span>
                      </div>
                      {[
                        { id: 'fam_dvorak', label: 'Rodina Dvořákova' },
                        { id: 'fam_novak', label: 'Rodina Novákova' }
                      ].map(item => (
                        <div
                          key={item.id}
                          onClick={() => { setSelectedEntityFilter(item.id); setIsEntityDropdownOpen(false); }}
                          style={{
                            padding: '6px 14px 6px 26px',
                            fontSize: '12px',
                            fontWeight: selectedEntityFilter === item.id ? 600 : 400,
                            color: selectedEntityFilter === item.id ? '#2563EB' : '#171B1F',
                            backgroundColor: selectedEntityFilter === item.id ? '#EFF6FF' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => selectedEntityFilter !== item.id && (e.currentTarget.style.backgroundColor = '#F4F4F6')}
                          onMouseLeave={(e) => selectedEntityFilter !== item.id && (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {item.label}
                        </div>
                      ))}

                      <div style={{ height: '1px', backgroundColor: '#F0F0F4', margin: '4px 0' }} />

                      {/* SKUPINA: PĚSTOUNI */}
                      <div style={{ padding: '4px 14px 2px 14px', fontSize: '10px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className="las la-heart" style={{ fontSize: '12px' }} />
                        <span>Pěstouni</span>
                      </div>
                      {[
                        { id: 'ent_dvorak', label: 'Tomáš Dvořák' }
                      ].map(item => (
                        <div
                          key={item.id}
                          onClick={() => { setSelectedEntityFilter(item.id); setIsEntityDropdownOpen(false); }}
                          style={{
                            padding: '6px 14px 6px 26px',
                            fontSize: '12px',
                            fontWeight: selectedEntityFilter === item.id ? 600 : 400,
                            color: selectedEntityFilter === item.id ? '#059669' : '#171B1F',
                            backgroundColor: selectedEntityFilter === item.id ? '#ECFDF5' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => selectedEntityFilter !== item.id && (e.currentTarget.style.backgroundColor = '#F4F4F6')}
                          onMouseLeave={(e) => selectedEntityFilter !== item.id && (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {item.label}
                        </div>
                      ))}

                      <div style={{ height: '1px', backgroundColor: '#F0F0F4', margin: '4px 0' }} />

                      {/* SKUPINA: DĚTI V PÉČI */}
                      <div style={{ padding: '4px 14px 2px 14px', fontSize: '10px', fontWeight: 700, color: '#DB2777', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className="las la-smile" style={{ fontSize: '12px' }} />
                        <span>Děti v péči</span>
                      </div>
                      {[
                        { id: 'ent_adam', label: 'Adam Novák' }
                      ].map(item => (
                        <div
                          key={item.id}
                          onClick={() => { setSelectedEntityFilter(item.id); setIsEntityDropdownOpen(false); }}
                          style={{
                            padding: '6px 14px 6px 26px',
                            fontSize: '12px',
                            fontWeight: selectedEntityFilter === item.id ? 600 : 400,
                            color: selectedEntityFilter === item.id ? '#DB2777' : '#171B1F',
                            backgroundColor: selectedEntityFilter === item.id ? '#FDF2F8' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => selectedEntityFilter !== item.id && (e.currentTarget.style.backgroundColor = '#F4F4F6')}
                          onMouseLeave={(e) => selectedEntityFilter !== item.id && (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {item.label}
                        </div>
                      ))}

                      <div style={{ height: '1px', backgroundColor: '#F0F0F4', margin: '4px 0' }} />

                      {/* SKUPINA: SPOLUPRACOVNÍCI */}
                      <div style={{ padding: '4px 14px 2px 14px', fontSize: '10px', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className="las la-user-tie" style={{ fontSize: '12px' }} />
                        <span>Spolupracovníci</span>
                      </div>
                      {[
                        { id: 'ent_kralova', label: 'Mgr. Alena Králová' },
                        { id: 'ent_self', label: 'Jana Nováková' }
                      ].map(item => (
                        <div
                          key={item.id}
                          onClick={() => { setSelectedEntityFilter(item.id); setIsEntityDropdownOpen(false); }}
                          style={{
                            padding: '6px 14px 6px 26px',
                            fontSize: '12px',
                            fontWeight: selectedEntityFilter === item.id ? 600 : 400,
                            color: selectedEntityFilter === item.id ? '#7C3AED' : '#171B1F',
                            backgroundColor: selectedEntityFilter === item.id ? '#F3E8FF' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => selectedEntityFilter !== item.id && (e.currentTarget.style.backgroundColor = '#F4F4F6')}
                          onMouseLeave={(e) => selectedEntityFilter !== item.id && (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 3. SESKUPENÍ DLE SUBJEKTU */}
              <button
                type="button"
                onClick={() => setGroupByEntity(!groupByEntity)}
                title={groupByEntity ? "Seskupeno dle subjektu" : "Seskupit dle subjektu"}
                style={{
                  border: 'none',
                  boxShadow: 'none',
                  backgroundColor: groupByEntity ? '#ECFDF5' : '#F4F4F6',
                  color: groupByEntity ? '#059669' : '#5E6774',
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'all 0.15s ease'
                }}
              >
                <i className="las la-layer-group" />
              </button>

              {/* 4. ZOBRAZIT / SKRÝT LIŠTU SEGMENTACE */}
              <button
                type="button"
                onClick={() => setShowSegmentBar(!showSegmentBar)}
                title="Zobrazit / skrýt lištu kategórií"
                style={{
                  border: 'none',
                  boxShadow: 'none',
                  backgroundColor: showSegmentBar ? '#F3E8FF' : '#F4F4F6',
                  color: showSegmentBar ? '#7C3AED' : '#5E6774',
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'all 0.15s ease'
                }}
              >
                <i className="las la-sliders-h" />
              </button>

              {/* 5. NASTAVENÍ SLEDOVÁNÍ NAROZENIN A JMENIN V KALENDÁŘI */}
              <button
                type="button"
                onClick={() => setShowBirthdaySettingsModal(true)}
                title="Nastavení sledování narozenin a jmenin"
                style={{
                  border: 'none',
                  boxShadow: 'none',
                  backgroundColor: showBirthdaySettingsModal ? '#FDF2F8' : '#F4F4F6',
                  color: showBirthdaySettingsModal ? '#DB2777' : '#5E6774',
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'all 0.15s ease'
                }}
              >
                <i className="las la-cog" />
              </button>
            </div>
          </div>

          {/* SEGMENTAČNÍ PŘEPÍNAČ (KAPSLOVÉ TLAČÍTKA FILTERU PODLE TYPU SUBJEKTU + TLAČÍTKO SESKUPIT PŘED "VŠE") */}
          {showSegmentBar && (
            <div style={{
              marginTop: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#F4F4F6',
              padding: '3px',
              borderRadius: '10px',
              overflowX: 'auto'
            }}>
              {/* TLAČÍTKO SESKUPIT UMÍSTĚNÉ V LIŠTĚ PŘED "VŠE" */}
              <button
                type="button"
                onClick={() => setGroupByEntity(!groupByEntity)}
                title="Přepnout seskupení úkolů podle subjektu"
                style={{
                  border: 'none',
                  backgroundColor: groupByEntity ? '#FFFFFF' : 'transparent',
                  color: groupByEntity ? '#059669' : '#747F8F',
                  fontWeight: groupByEntity ? 600 : 500,
                  fontSize: '11px',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  boxShadow: groupByEntity ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <i className="las la-layer-group" style={{ fontSize: '15px', color: groupByEntity ? '#059669' : '#747F8F' }} />
                <span>Seskupit</span>
              </button>

              {[
                { id: 'all', label: 'Vše', icon: 'las la-list', count: tasks.filter(t => !t.completed).length },
                { id: 'family', label: 'Rodiny', icon: 'las la-home', count: tasks.filter(t => t.entityType === 'family' && !t.completed).length },
                { id: 'foster_parent', label: 'Pěstouni', icon: 'las la-heart', count: tasks.filter(t => t.entityType === 'foster_parent' && !t.completed).length },
                { id: 'child', label: 'Děti', icon: 'las la-smile', count: tasks.filter(t => t.entityType === 'child' && !t.completed).length },
                { id: 'coworker', label: 'Spolupracovníci', icon: 'las la-user-tie', count: tasks.filter(t => t.entityType === 'coworker' && !t.completed).length }
              ].map(seg => (
                <button
                  key={seg.id}
                  onClick={() => setSelectedSegment(seg.id)}
                  style={{
                    border: 'none',
                    backgroundColor: selectedSegment === seg.id ? '#FFFFFF' : 'transparent',
                    color: selectedSegment === seg.id ? '#171B1F' : '#747F8F',
                    fontWeight: selectedSegment === seg.id ? 600 : 500,
                    fontSize: '11px',
                    padding: '6px 12px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    boxShadow: selectedSegment === seg.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <i className={seg.icon} style={{ fontSize: '15px', color: selectedSegment === seg.id ? '#FF4742' : '#747F8F' }} />
                  <span>{seg.label}</span>
                  {seg.count > 0 && (
                    <span style={{
                      fontSize: '9px',
                      backgroundColor: selectedSegment === seg.id ? '#FFEBEB' : '#E5E7EB',
                      color: selectedSegment === seg.id ? '#FF4742' : '#5E6774',
                      padding: '1px 5px',
                      borderRadius: '8px',
                      marginLeft: '2px'
                    }}>
                      {seg.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* VYHLEDÁVACÍ POLE (POKUD JE ZOBRAZENO PŘES IKONU NÁSTROJE) */}
          {showSearchInput && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                flex: 1,
                backgroundColor: isSearchInputFocused ? '#FFFFFF' : '#F4F4F6',
                borderRadius: '10px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: isSearchInputFocused ? '1.5px solid #FF4742' : (searchQuery ? '1px solid #3B82F6' : '1px solid transparent'),
                boxShadow: isSearchInputFocused ? '0 4px 12px rgba(255,71,66,0.1)' : (searchQuery ? '0 2px 8px rgba(59,130,246,0.1)' : 'none'),
                transition: 'all 0.2s ease'
              }}>
                <i className="las la-search" style={{ color: isSearchInputFocused ? '#FF4742' : (searchQuery ? '#3B82F6' : '#8896A9'), fontSize: '16px', transition: 'color 0.2s ease' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchInputFocused(true)}
                  onBlur={() => setIsSearchInputFocused(false)}
                  placeholder="Hledat úkol, subjekt..."
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '13px',
                    color: '#171B1F',
                    width: '100%',
                    fontFamily: 'Inter, sans-serif'
                  }}
                />
                {searchQuery && (
                  <i 
                    className="las la-times" 
                    onClick={() => setSearchQuery('')}
                    style={{ color: '#8896A9', fontSize: '15px', cursor: 'pointer' }} 
                    title="Vymazat hledání"
                  />
                )}
              </div>
            </div>
          )}

          {/* CHIP AKTIVNÍHO FILTRU SUBJEKTU BEZ POPISU V ZÁVORCE */}
          {selectedEntityFilter !== 'all' && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#747F8F' }}>Zobrazeny úkoly pro:</span>
              <span style={{
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                border: '1px solid #BFDBFE',
                borderRadius: '12px',
                padding: '3px 10px',
                fontSize: '11px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <i className="las la-user-check" style={{ fontSize: '14px' }} />
                <span>{
                  selectedEntityFilter === 'fam_dvorak' ? 'Rodina Dvořákova' :
                  selectedEntityFilter === 'fam_novak' ? 'Rodina Novákova' :
                  selectedEntityFilter === 'ent_dvorak' ? 'Tomáš Dvořák' :
                  selectedEntityFilter === 'ent_adam' ? 'Adam Novák' :
                  selectedEntityFilter === 'ent_kralova' ? 'Mgr. Alena Králová' : 'Jana Nováková'
                }</span>
                <i 
                  className="las la-times" 
                  onClick={() => setSelectedEntityFilter('all')}
                  style={{ cursor: 'pointer', marginLeft: '3px', fontSize: '13px' }} 
                  title="Zrušit filtr"
                />
              </span>
            </div>
          )}

          {/* Vstup pro přidání úkolu S HLASOVÝM DIKTOVÁNÍM a CHYTRÝM ROZPOZNÁNÍM */}
          {(() => {
            const currentParsed = parseSmartTaskInput(newTaskText);
            const hasSmartDetections = Boolean(currentParsed.entityInfo.entityName || currentParsed.parsedDateRange);

            return (
              <div style={{ marginTop: '14px' }}>
                <div style={{
                  backgroundColor: isInputFocused || isListening ? '#FFFFFF' : '#F4F4F6',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  border: isListening ? '1.5px solid #EF4444' : isInputFocused ? '1.5px solid #FF4742' : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isListening ? '0 0 12px rgba(239,68,68,0.25)' : isInputFocused ? '0 4px 12px rgba(255,71,66,0.1)' : 'none',
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
                    placeholder={isListening ? "Poslouchám... Mluvte prosím" : "Přidat nový úkol (napište nebo nadiktujte)..."}
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

                  {/* TLAČÍTKO PRO HLASOVÉ DIKTOVÁNÍ */}
                  <button
                    type="button"
                    onClick={handleStartListening}
                    title={isListening ? "Poslouchám..." : "Nadiktovat úkol hlasem"}
                    style={{
                      border: 'none',
                      backgroundColor: isListening ? '#EF4444' : 'transparent',
                      color: isListening ? '#FFFFFF' : '#6B7280',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '16px',
                      transition: 'all 0.2s ease',
                      boxShadow: 'none',
                      flexShrink: 0
                    }}
                  >
                    <i className="las la-microphone" style={{ animation: isListening ? 'pulse 1.2s infinite' : 'none' }} />
                  </button>
                </div>

                {/* CHYTRÝ ŽIVÝ NÁHLED DETEKOVANÉHO SUBJEKTU A DATUMU */}
                {hasSmartDetections && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: '#10B981', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Chytrý náhled:</span>
                    <span style={{ color: '#171B1F', fontWeight: 500 }}>"{currentParsed.cleanTitle}"</span>
                    {currentParsed.entityInfo.entityName && (
                      <span style={{
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        border: '1px solid #A7F3D0',
                        padding: '1px 7px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <i className="las la-user" style={{ fontSize: '12px' }} /> [{currentParsed.entityInfo.entityName}]
                      </span>
                    )}
                    {currentParsed.parsedDateRange && (
                      <span style={{
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        border: '1px solid #BFDBFE',
                        padding: '1px 7px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <i className="las la-calendar" style={{ fontSize: '12px' }} /> [{currentParsed.parsedDateRange}]
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Seznam Úkolů s efektem zaškrtnutí, segmentací, vyhledáváním a NEZÁVISLÝM SCROLLOVÁNÍM */}
        <div style={{ padding: '20px 28px', flex: 1, overflowY: 'auto' }}>
          
          {/* POMOCNÁ PŘEDFILTROVANÁ SADA ÚKOLŮ S VYHLEDÁVÁNÍM A FILTREM SUBJEKTU */}
          {(() => {
            const q = searchQuery.toLowerCase().trim();
            const activeFilteredTasks = tasks.filter(t => {
              const matchesSegment = selectedSegment === 'all' || t.entityType === selectedSegment;
              const matchesEntity = selectedEntityFilter === 'all' || t.entityId === selectedEntityFilter;
              const matchesQuery = !q || 
                t.title.toLowerCase().includes(q) || 
                (t.entityName && t.entityName.toLowerCase().includes(q)) ||
                (t.badge && t.badge.toLowerCase().includes(q));

              return matchesSegment && matchesEntity && matchesQuery;
            });

            if (activeFilteredTasks.length === 0) {
              return (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: '#8896A9' }}>
                  <i className="las la-search" style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.6, display: 'block' }} />
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>Nenalezeny žádné odpovídající úkoly.</div>
                  <div style={{ fontSize: '11px', marginTop: '4px' }}>Zkuste upravit vyhledávání nebo filtr subjektu.</div>
                </div>
              );
            }

            return groupByEntity ? (
              /* AK SÚ ÚKOLY SESKUPENÉ PODĽA SUBJEKTU (groupByEntity === true) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {Array.from(new Set(
                  activeFilteredTasks.filter(t => !t.completed).map(t => t.entityName || 'Bez přiřazení')
                )).map(entityName => {
                  const groupTasks = activeFilteredTasks.filter(t => (t.entityName || 'Bez přiřazení') === entityName && !t.completed);
                  if (groupTasks.length === 0) return null;
                  const sampleTask = groupTasks[0];

                  return (
                    <div key={entityName} style={{ marginBottom: '24px' }}>
                      {/* NADPIS ENTITY SUBJEKTU */}
                      <div 
                        onClick={() => {
                          if (sampleTask.entityId && onSelectEntity) {
                            onSelectEntity({ id: sampleTask.entityId, name: sampleTask.entityName, type: sampleTask.entityType, activeTab: 'tasks', initialTab: 'tasks' });
                          }
                        }}
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: sampleTask.entityType === 'family' ? '#2563EB' :
                                 sampleTask.entityType === 'foster_parent' ? '#059669' :
                                 sampleTask.entityType === 'child' ? '#DB2777' :
                                 sampleTask.entityType === 'coworker' ? '#7C3AED' : '#6B7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.4px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: sampleTask.entityId ? 'pointer' : 'default'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <i className={
                            sampleTask.entityType === 'family' ? 'las la-home' :
                            sampleTask.entityType === 'foster_parent' ? 'las la-heart' :
                            sampleTask.entityType === 'child' ? 'las la-smile' :
                            sampleTask.entityType === 'coworker' ? 'las la-user-tie' : 'las la-tasks'
                          } style={{ fontSize: '15px' }} />
                          <span>{entityName}</span>
                        </div>
                        <span style={{ backgroundColor: '#F3F4F6', padding: '1px 7px', borderRadius: '10px', fontSize: '10px', color: '#5E6774' }}>
                          {groupTasks.length}
                        </span>
                      </div>

                      {/* SEZNAM AKTÍVNYCH ÚKOLŮ DANÉHO SUBJEKTU */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {groupTasks.map(t => (
                          <div
                            key={t.id}
                            draggable
                            onDragStart={(e) => handleDragStartTask(e, t)}
                            className={disappearingTaskIds.includes(t.id) ? 'anim-task-disappearing' : ''}
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
                                  border: '1.5px solid #A0A0B0',
                                  backgroundColor: '#FFFFFF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  flexShrink: 0
                                }}
                              >
                              </div>
                              <span 
                                onClick={() => setEditingTask(t)}
                                style={{ fontSize: '13px', color: '#171b1f', cursor: 'pointer' }}
                                title="Klikněte pro úpravu úkolu"
                              >
                                {t.title}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {t.dateRange && (
                                <span style={{ fontSize: '11px', color: '#747f8f', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: '6px' }}>
                                  {t.dateRange}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setEditingTask(t); }}
                                title="Upravit úkol"
                                style={{
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                  color: '#9CA3AF',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  padding: '2px 4px',
                                  borderRadius: '4px',
                                  transition: 'color 0.15s ease'
                                }}
                              >
                                <i className="las la-pen" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* DOKONČENÉ ÚKOLY V SESKUPENÉM REŽIMU */}
                {activeFilteredTasks.filter(t => t.completed).length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '16px', borderTop: '1px solid #F0F0F4' }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                      DOKONČENÉ
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {activeFilteredTasks
                        .filter(t => t.completed)
                        .map(t => (
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
                            backgroundColor: '#FAFAFA',
                            opacity: 0.75,
                            cursor: 'grab'
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

                          {t.entityName && (
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectEntity) {
                                  onSelectEntity({ id: t.entityId, name: t.entityName, type: t.entityType, activeTab: 'tasks', initialTab: 'tasks' });
                                }
                              }}
                              title={`Otevřít profil (${t.entityName})`}
                              style={{
                                fontSize: '11px',
                                fontWeight: 500,
                                color: t.entityType === 'family' ? '#2563EB' :
                                       t.entityType === 'foster_parent' ? '#059669' :
                                       t.entityType === 'child' ? '#DB2777' : '#7C3AED',
                                backgroundColor: t.entityType === 'family' ? '#EFF6FF' :
                                                 t.entityType === 'foster_parent' ? '#ECFDF5' :
                                                 t.entityType === 'child' ? '#FDF2F8' : '#F3E8FF',
                                border: 'none',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <i className={
                                t.entityType === 'family' ? 'las la-home' :
                                t.entityType === 'foster_parent' ? 'las la-heart' :
                                t.entityType === 'child' ? 'las la-smile' : 'las la-user-tie'
                              } style={{ fontSize: '14px' }} />
                              <span>{t.entityName}</span>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* AK SÚ ÚKOLY ZOBRAZENÉ PODĽA TERMÍNU (STANDARD) */
              <>
                {/* SKUPINA: PO TERMÍNU */}
                {activeFilteredTasks.filter(t => t.group === 'overdue' && !t.completed).length > 0 && (
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
                        {activeFilteredTasks.filter(t => t.group === 'overdue' && !t.completed).length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {activeFilteredTasks
                        .filter(t => t.group === 'overdue' && !t.completed)
                        .map(t => (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={(e) => handleDragStartTask(e, t)}
                          className={disappearingTaskIds.includes(t.id) ? 'anim-task-disappearing' : ''}
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
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
                            <span 
                              onClick={() => setEditingTask(t)}
                              style={{ fontSize: '13px', color: '#171b1f', fontWeight: 400, cursor: 'pointer' }}
                              title="Klikněte pro úpravu úkolu"
                            >
                              {t.title}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            {/* ŠTÍTEK OSOBY / ENTITY U ÚKOLU (VĚTŠÍ IKONY, BEZ OUTLINE, PROKLIK NA PROFIL) */}
                            {t.entityName && (
                              <span 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onSelectEntity) {
                                    onSelectEntity({ id: t.entityId, name: t.entityName, type: t.entityType, activeTab: 'tasks', initialTab: 'tasks' });
                                  }
                                }}
                                title={`Otevřít profil (${t.entityName})`}
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: t.entityType === 'family' ? '#2563EB' :
                                         t.entityType === 'foster_parent' ? '#059669' :
                                         t.entityType === 'child' ? '#DB2777' : '#7C3AED',
                                  backgroundColor: t.entityType === 'family' ? '#EFF6FF' :
                                                   t.entityType === 'foster_parent' ? '#ECFDF5' :
                                                   t.entityType === 'child' ? '#FDF2F8' : '#F3E8FF',
                                  border: 'none',
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  whiteSpace: 'nowrap',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <i className={
                                  t.entityType === 'family' ? 'las la-home' :
                                  t.entityType === 'foster_parent' ? 'las la-heart' :
                                  t.entityType === 'child' ? 'las la-smile' : 'las la-user-tie'
                                } style={{ fontSize: '15px' }} />
                                <span>{t.entityName}</span>
                              </span>
                            )}

                            {t.dateRange && (
                              <span 
                                onClick={() => setActiveDatePickerTask(t)}
                                style={{ fontSize: '11px', color: '#747f8f', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: '6px', cursor: 'pointer' }}
                              >
                                {t.dateRange}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setEditingTask(t); }}
                              title="Upravit úkol"
                              style={{
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: '#9CA3AF',
                                cursor: 'pointer',
                                fontSize: '14px',
                                padding: '2px 4px',
                                borderRadius: '4px',
                                transition: 'color 0.15s ease'
                              }}
                            >
                              <i className="las la-pen" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SKUPINA: DNES */}
                {activeFilteredTasks.filter(t => t.group === 'today' && !t.completed).length > 0 && (
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
                        {activeFilteredTasks.filter(t => t.group === 'today' && !t.completed).length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {activeFilteredTasks
                        .filter(t => t.group === 'today' && !t.completed)
                        .map(t => (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={(e) => handleDragStartTask(e, t)}
                          className={disappearingTaskIds.includes(t.id) ? 'anim-task-disappearing' : ''}
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
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

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            {/* ŠTÍTEK OSOBY / ENTITY U ÚKOLU (VĚTŠÍ IKONY, BEZ OUTLINE, PROKLIK NA PROFIL) */}
                            {t.entityName && (
                              <span 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onSelectEntity) {
                                    onSelectEntity({ id: t.entityId, name: t.entityName, type: t.entityType, activeTab: 'tasks', initialTab: 'tasks' });
                                  }
                                }}
                                title={`Otevřít profil (${t.entityName})`}
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: t.entityType === 'family' ? '#2563EB' :
                                         t.entityType === 'foster_parent' ? '#059669' :
                                         t.entityType === 'child' ? '#DB2777' : '#7C3AED',
                                  backgroundColor: t.entityType === 'family' ? '#EFF6FF' :
                                                   t.entityType === 'foster_parent' ? '#ECFDF5' :
                                                   t.entityType === 'child' ? '#FDF2F8' : '#F3E8FF',
                                  border: 'none',
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  whiteSpace: 'nowrap',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <i className={
                                  t.entityType === 'family' ? 'las la-home' :
                                  t.entityType === 'foster_parent' ? 'las la-heart' :
                                  t.entityType === 'child' ? 'las la-smile' : 'las la-user-tie'
                                } style={{ fontSize: '15px' }} />
                                <span>{t.entityName}</span>
                              </span>
                            )}

                            {t.badge && (
                              <span style={{ fontSize: '10px', fontWeight: 500, color: '#4A85F6', backgroundColor: '#EEF4FF', padding: '2px 6px', borderRadius: '4px' }}>
                                {t.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SKUPINA: DOKONČENÉ */}
                {activeFilteredTasks.filter(t => t.completed).length > 0 && (
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
                      {activeFilteredTasks
                        .filter(t => t.completed)
                        .map(t => (
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
                            backgroundColor: '#FAFAFA',
                            opacity: 0.75,
                            cursor: 'grab'
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

                          {t.entityName && (
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectEntity) {
                                  onSelectEntity({ id: t.entityId, name: t.entityName, type: t.entityType, activeTab: 'tasks', initialTab: 'tasks' });
                                }
                              }}
                              title={`Otevřít profil (${t.entityName})`}
                              style={{
                                fontSize: '11px',
                                fontWeight: 500,
                                color: t.entityType === 'family' ? '#2563EB' :
                                       t.entityType === 'foster_parent' ? '#059669' :
                                       t.entityType === 'child' ? '#DB2777' : '#7C3AED',
                                backgroundColor: t.entityType === 'family' ? '#EFF6FF' :
                                                 t.entityType === 'foster_parent' ? '#ECFDF5' :
                                                 t.entityType === 'child' ? '#FDF2F8' : '#F3E8FF',
                                border: 'none',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <i className={
                                t.entityType === 'family' ? 'las la-home' :
                                t.entityType === 'foster_parent' ? 'las la-heart' :
                                t.entityType === 'child' ? 'las la-smile' : 'las la-user-tie'
                              } style={{ fontSize: '14px' }} />
                              <span>{t.entityName}</span>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

        </div>
      </div>

      {/* 3. PRAVÁ PŮLKA: ČASOVÁ OSA AGENDY S HORNÍM PŘECHODEM A DYNAMICKÝM DATUMEM */}
      <div 
        ref={timelineScrollRef}
        onScroll={handleScrollTimeline}
        style={{ flex: 1, height: '100vh', overflowY: 'auto', backgroundColor: '#FFFFFF', position: 'relative' }}
      >
        {/* HORNÍ PŘECHOD (GRADIENT FADE OVERLAY) S CENTROVANÝM DATUMOVÝM BANNEREM A SAMOSTATNÝMI KROUŽKY VPRAVO */}
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
          justifyContent: 'center',
          paddingLeft: '32px',
          paddingRight: '32px'
        }}>
          {/* CENTROVANÝ STICKY DATUM S LETOPOČTEM A ČASEM */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.07)',
            border: '1px solid rgba(220, 220, 230, 0.8)',
            borderRadius: '20px',
            padding: '6px 18px',
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
            <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>● {currentTimeText}</span>
          </div>

          {/* SAMOSTATNÁ STICKY SKUPINA KROUŽKOVÝCH ODZNAKŮ VPRAVO (BEZ STÍNU, BEZ PODTISKU, S PROBARVENÍM) */}
          {(regularAllDayEvents.length > 0 || activeDayAllDayEvents.length > 0 || childBirthdayEvents.length > 0 || childNameDayEvents.length > 0) && (
            <div style={{
              position: 'absolute',
              right: '32px',
              backgroundColor: 'transparent',
              boxShadow: 'none',
              border: 'none',
              borderRadius: '20px',
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              pointerEvents: 'auto'
            }}>
              {/* 1. KROUŽEK: POČET BĚŽNÝCH CELODENNÍCH UDÁLOSTÍ */}
              {(regularAllDayEvents.length > 0 || activeDayAllDayEvents.length > 0) && (
                <span 
                  onMouseEnter={() => setHoveredBadgeType('allday')}
                  onMouseLeave={() => setHoveredBadgeType(null)}
                  style={{
                    backgroundColor: hoveredBadgeType === 'allday' ? '#EFF6FF' : 'transparent',
                    color: hoveredBadgeType === 'allday' ? '#2563EB' : '#171B1F',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'none',
                    flexShrink: 0,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {regularAllDayEvents.length > 0 ? regularAllDayEvents.length : activeDayAllDayEvents.length}

                  {/* INTERAKTIVNÍ BUBLINA NA HOVER SE SOUPISEM CELODENNÍCH UDÁLOSTÍ */}
                  {hoveredBadgeType === 'allday' && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: '32px',
                        right: '-10px',
                        width: '270px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        boxShadow: '0 12px 36px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.06)',
                        border: '1px solid #EAEAEE',
                        padding: '12px 14px',
                        zIndex: 1000,
                        textAlign: 'left',
                        pointerEvents: 'none'
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#171B1F', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Celodenní události</span>
                        <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', padding: '1px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 600 }}>
                          {regularAllDayEvents.length}
                        </span>
                      </div>

                      {regularAllDayEvents.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {regularAllDayEvents.map(ev => (
                            <div key={ev.id} style={{ fontSize: '12px', color: '#171B1F', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '4px', height: '14px', borderRadius: '2px', backgroundColor: ev.color || '#FF4742', flexShrink: 0 }} />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', color: '#747F8F' }}>Žádné běžné celodenní akce.</div>
                      )}
                    </div>
                  )}
                </span>
              )}

            {/* 2. DORT PRO NAROZENINY DÍTĚTE V PÉČI */}
            {childBirthdayEvents.length > 0 && (
              <span 
                onMouseEnter={() => setHoveredBadgeType('birthday')}
                onMouseLeave={() => setHoveredBadgeType(null)}
                style={{
                  backgroundColor: hoveredBadgeType === 'birthday' ? '#FDF2F8' : 'transparent',
                  color: hoveredBadgeType === 'birthday' ? '#DB2777' : '#171B1F',
                  border: 'none',
                  borderRadius: '50%',
                  width: '26px',
                  height: '26px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  boxShadow: 'none',
                  flexShrink: 0,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <i className="las la-birthday-cake"></i>

                {/* BUBLINA PRO NAROZENINY DÍTĚTE NA HOVER */}
                {hoveredBadgeType === 'birthday' && (
                  <div style={{
                    position: 'absolute',
                    top: '32px',
                    right: '-10px',
                    width: '250px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #EAEAEE',
                    padding: '12px 14px',
                    zIndex: 1000,
                    textAlign: 'left',
                    pointerEvents: 'none'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#DB2777', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="las la-birthday-cake" style={{ fontSize: '15px' }}></i>
                      <span>Narozeniny dětí v péči</span>
                    </div>
                    {childBirthdayEvents.map(ev => (
                      <div key={ev.id} style={{ fontSize: '12px', color: '#171B1F', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#DB2777' }}>•</span>
                        <span>{ev.personName || ev.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </span>
            )}

            {/* 3. DÁREK PRO JMENINY DÍTĚTE V PÉČI */}
            {childNameDayEvents.length > 0 && (
              <span 
                onMouseEnter={() => setHoveredBadgeType('nameday')}
                onMouseLeave={() => setHoveredBadgeType(null)}
                style={{
                  backgroundColor: hoveredBadgeType === 'nameday' ? '#F3E8FF' : 'transparent',
                  color: hoveredBadgeType === 'nameday' ? '#7C3AED' : '#171B1F',
                  border: 'none',
                  borderRadius: '50%',
                  width: '26px',
                  height: '26px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  boxShadow: 'none',
                  flexShrink: 0,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <i className="las la-gift"></i>

                {/* BUBLINA PRO JMENINY DÍTĚTE NA HOVER */}
                {hoveredBadgeType === 'nameday' && (
                  <div style={{
                    position: 'absolute',
                    top: '32px',
                    right: '-10px',
                    width: '250px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #EAEAEE',
                    padding: '12px 14px',
                    zIndex: 1000,
                    textAlign: 'left',
                    pointerEvents: 'none'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#7C3AED', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="las la-gift" style={{ fontSize: '15px' }}></i>
                      <span>Jmeniny dětí v péči</span>
                    </div>
                    {childNameDayEvents.map(ev => (
                      <div key={ev.id} style={{ fontSize: '12px', color: '#171B1F', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>•</span>
                        <span>{ev.personName || ev.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </span>
            )}
          </div>
          )}
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

            // DETEKCE NAROZENIN A JMENIN PODLE NASTAVENÍ KALENDÁŘE
            const hasChildBirthday = allDayEvents.some(ev => 
              ev.category === 'Narozeniny' && isPersonTracked(ev)
            );

            const hasChildNameDay = allDayEvents.some(ev => 
              ev.category === 'Jmeniny' && isPersonTracked(ev)
            );

            const visibleAllDayEvents = allDayEvents.filter(ev => {
              if (ev.category === 'Narozeniny' || ev.category === 'Jmeniny') {
                return isPersonTracked(ev);
              }
              return true;
            });

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
                {/* CENTROVANÁ HLAVIČKA DNE + KROUŽEK S POČTEM CELODENNÍCH UDÁLOSTÍ + IKONY DORTU A DÁRKU PRO DĚTI */}
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
                  gap: '4px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <h2 style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: dayObj.isToday ? '#FF4742' : '#171B1F',
                      margin: 0,
                      letterSpacing: '-0.3px'
                    }}>
                      {dayObj.subLabel ? `${dayObj.subLabel} – ${dayObj.fullDateStr}` : dayObj.fullDateStr}
                    </h2>

                    {/* KROUŽEK S POČTEM CELODENNÍCH UDÁLOSTÍ */}
                    {allDayEvents.length > 0 && (
                      <span 
                        title={`${allDayEvents.length} celodenní akce`}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#171B1F',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 700,
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 'none',
                          flexShrink: 0
                        }}
                      >
                        {allDayEvents.length}
                      </span>
                    )}

                    {/* IKONA DORTU PRO NAROZENINY DÍTĚTE V PÉČI */}
                    {hasChildBirthday && (
                      <span 
                        title="Dítě v péči má dnes narozeniny!" 
                        style={{
                          backgroundColor: 'transparent',
                          color: '#171B1F',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '15px',
                          boxShadow: 'none',
                          flexShrink: 0
                        }}
                      >
                        <i className="las la-birthday-cake"></i>
                      </span>
                    )}

                    {/* IKONA DÁRKU PRO JMENINY DÍTĚTE V PÉČI */}
                    {hasChildNameDay && (
                      <span 
                        title="Dítě v péči má dnes jmeniny!" 
                        style={{
                          backgroundColor: 'transparent',
                          color: '#171B1F',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '15px',
                          boxShadow: 'none',
                          flexShrink: 0
                        }}
                      >
                        <i className="las la-gift"></i>
                      </span>
                    )}
                  </div>

                  <div style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#747F8F',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>Svátek má <strong>{nameDayPerson}</strong></span>
                  </div>
                </div>

                {/* CELODENNÍ AKCE (NAROZENINY/JMENINY REŠPEKTUJÚ NASTAVENIE KALENDÁŘE) */}
                {visibleAllDayEvents.length > 0 && (
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
                    {visibleAllDayEvents.map(ev => {
                      const isSpecial = ev.category === 'Narozeniny' || ev.category === 'Jmeniny';

                      return (
                        <div 
                          key={ev.id}
                          onClick={() => handleAllDayClick(ev)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            backgroundColor: isSpecial ? '#FFFFFF' : (ev.bgColor || '#FFF5F5'),
                            border: isSpecial ? '1px solid #FFFFFF' : `1px solid ${ev.borderColor || '#FECDD3'}`,
                            borderRadius: '8px',
                            padding: '9px 14px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#171B1F',
                            boxShadow: isSpecial ? '0 2px 8px rgba(0, 0, 0, 0.05)' : '0 1px 3px rgba(0,0,0,0.03)',
                            boxSizing: 'border-box',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                            {/* ŽÁDNÝ BAREVNÝ ODZNAK PRO NAROZENINY A JMENINY */}
                            {!isSpecial && (
                              <div style={{
                                width: '3.5px',
                                height: '16px',
                                backgroundColor: ev.color || '#FF4742',
                                borderRadius: '4px',
                                flexShrink: 0
                              }} />
                            )}

                            {/* STAČÍ JEN IKONA DORTU NEBO DÁRKU */}
                            {ev.iconClass && (
                              <i className={ev.iconClass} style={{ color: ev.color || '#FF4742', fontSize: '18px', flexShrink: 0 }}></i>
                            )}

                            <span style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontWeight: isSpecial ? 600 : 500,
                              color: '#171B1F'
                            }}>
                              {ev.title}
                            </span>
                          </div>

                          {/* ODHALITELNÝ PROKLIK NA PROFIL DANÉ OSOBY */}
                          {isSpecial && (
                            <span style={{
                              fontSize: '11px',
                              color: '#747F8F',
                              fontWeight: 500,
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#F4F4F6',
                              padding: '3px 8px',
                              borderRadius: '6px'
                            }}>
                              Zobrazit profil ➔
                            </span>
                          )}
                        </div>
                      );
                    })}
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

                  {/* HOURLY LINES AND CZECH LABELS */}
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

                        {/* POZNÁMKY POD NÁZVEM POKUD EXISTUJÍ */}
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

      {/* MODÁLNÍ OKNO PRO ÚPRAVU ÚKOLU (TASK EDIT MODAL - ZAVÍRÁ SE POUZE EXPLICITNĚ) */}
      {editingTask && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div 
            className={isDeletingTaskModal ? 'anim-modal-imploding' : ''}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '520px',
              maxWidth: '92%',
              padding: '24px',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.18)',
              fontFamily: 'Inter, sans-serif',
              transition: 'transform 0.15s ease, opacity 0.15s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HLAVIČKA BEZ MODRÉ IKONY */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#171B1F' }}>Úprava úkolu</h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#747F8F' }}>Upravte název, přiřazené subjekty, vyřizující osobu a termín splnění</p>
              </div>
              <i className="las la-times" onClick={() => setEditingTask(null)} style={{ fontSize: '22px', cursor: 'pointer', color: '#6B7280' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 1. NÁZEV ÚKOLU */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4B5563', marginBottom: '4px' }}>Název úkolu</label>
                <input
                  type="text"
                  value={editingTask.title || ''}
                  onChange={(e) => setEditingTask(prev => ({ ...prev, title: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* 2. PRIŘAZENO (MULTI-SELECT S NAŠEPTÁVAČEM PODLE JMÉNA, EMAILU A TELEFONU) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4B5563', marginBottom: '4px' }}>Přiřazeno (možnost více subjektů)</label>
                
                {/* ZOBRAZENÍ VYBRANÝCH ENTIT (TAGY / PELLKY) */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                  {(editingTask.assignedEntities || (editingTask.entityName ? [{ id: editingTask.entityId, name: editingTask.entityName, type: editingTask.entityType }] : [])).map(ent => (
                    <span key={ent.id || ent.name} style={{
                      backgroundColor: ent.type === 'family' ? '#EFF6FF' : ent.type === 'foster_parent' ? '#ECFDF5' : ent.type === 'child' ? '#FDF2F8' : '#F3E8FF',
                      color: ent.type === 'family' ? '#2563EB' : ent.type === 'foster_parent' ? '#059669' : ent.type === 'child' ? '#DB2777' : '#7C3AED',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <i className={ent.type === 'family' ? 'las la-home' : ent.type === 'foster_parent' ? 'las la-heart' : ent.type === 'child' ? 'las la-smile' : 'las la-user-tie'} />
                      <span>{ent.name}</span>
                      <i 
                        className="las la-times" 
                        style={{ cursor: 'pointer', marginLeft: '3px', fontSize: '12px' }} 
                        onClick={() => {
                          const currentArr = editingTask.assignedEntities || (editingTask.entityName ? [{ id: editingTask.entityId, name: editingTask.entityName, type: editingTask.entityType }] : []);
                          const updated = currentArr.filter(item => item.id !== ent.id);
                          setEditingTask(prev => ({
                            ...prev,
                            assignedEntities: updated,
                            entityName: updated[0] ? updated[0].name : null,
                            entityId: updated[0] ? updated[0].id : null,
                            entityType: updated[0] ? updated[0].type : null
                          }));
                        }} 
                      />
                    </span>
                  ))}
                </div>

                {/* NAŠEPTÁVACÍ VSTUP PRO PŘIŘAZENÍ SUBJEKTŮ */}
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={assignedEntitiesSearchQuery}
                    onChange={(e) => setAssignedEntitiesSearchQuery(e.target.value)}
                    placeholder="Vyhledat jméno, email nebo telefon subjektu..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '12px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {assignedEntitiesSearchQuery.trim() && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0, right: 0,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      zIndex: 100,
                      marginTop: '4px'
                    }}>
                      {[
                        { id: 'fam_dvorak', name: 'Rodina Dvořákova', type: 'family', email: 'rodinadvorakova@gmail.com', phone: '+420 777 111 222' },
                        { id: 'fam_novak', name: 'Rodina Novákova', type: 'family', email: 'rodinanovakova@gmail.com', phone: '+420 777 333 444' },
                        { id: 'ent_dvorak', name: 'Tomáš Dvořák', type: 'foster_parent', email: 'tomasdvorak@gmail.com', phone: '+420 608 123 456' },
                        { id: 'ent_adam', name: 'Adam Novák', type: 'child', email: 'adamnovak@gmail.com', phone: '+420 720 987 654' },
                        { id: 'ent_kralova', name: 'Mgr. Alena Králová', type: 'coworker', email: 'alenakralova@gmail.com', phone: '+420 602 555 888' },
                        { id: 'ent_self', name: 'Jana Nováková', type: 'coworker', email: 'jananovakova@gmail.com', phone: '+420 603 444 333' }
                      ].filter(item => {
                        const q = assignedEntitiesSearchQuery.toLowerCase();
                        return item.name.toLowerCase().includes(q) || item.email.toLowerCase().includes(q) || item.phone.includes(q);
                      }).map(item => (
                        <div
                          key={item.id}
                          onClick={() => {
                            const currentArr = editingTask.assignedEntities || (editingTask.entityName ? [{ id: editingTask.entityId, name: editingTask.entityName, type: editingTask.entityType }] : []);
                            if (!currentArr.some(x => x.id === item.id)) {
                              const updated = [...currentArr, { id: item.id, name: item.name, type: item.type }];
                              setEditingTask(prev => ({
                                ...prev,
                                assignedEntities: updated,
                                entityName: updated[0].name,
                                entityId: updated[0].id,
                                entityType: updated[0].type
                              }));
                            }
                            setAssignedEntitiesSearchQuery('');
                          }}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            borderBottom: '1px solid #F3F4F6',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 600, color: '#171B1F' }}>{item.name}</span>
                            <span style={{ fontSize: '11px', color: '#6B7280', marginLeft: '6px' }}>({item.email})</span>
                          </div>
                          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{item.phone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. VYŘIZUJE (NAŠEPTÁVÁNÍ DLE JMÉNA, EMAILU NEBO TELEFONU) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4B5563', marginBottom: '4px' }}>Vyřizuje (Odpovědná osoba)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={assigneeSearchQuery || editingTask.assignee || 'Jana Nováková'}
                    onChange={(e) => {
                      setAssigneeSearchQuery(e.target.value);
                      setEditingTask(prev => ({ ...prev, assignee: e.target.value }));
                    }}
                    placeholder="Zadejte nebo vyhledejte pracovníka..."
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {assigneeSearchQuery.trim() && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0, right: 0,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                      maxHeight: '160px',
                      overflowY: 'auto',
                      zIndex: 100,
                      marginTop: '4px'
                    }}>
                      {[
                        { id: 'ent_self', name: 'Jana Nováková', email: 'jananovakova@gmail.com', phone: '+420 603 444 333' },
                        { id: 'ent_kralova', name: 'Mgr. Alena Králová', email: 'alenakralova@gmail.com', phone: '+420 602 555 888' },
                        { id: 'ent_dvorak', name: 'Tomáš Dvořák', email: 'tomasdvorak@gmail.com', phone: '+420 608 123 456' }
                      ].filter(item => {
                        const q = assigneeSearchQuery.toLowerCase();
                        return item.name.toLowerCase().includes(q) || item.email.toLowerCase().includes(q) || item.phone.includes(q);
                      }).map(item => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setEditingTask(prev => ({ ...prev, assignee: item.name }));
                            setAssigneeSearchQuery('');
                          }}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            borderBottom: '1px solid #F3F4F6',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 600, color: '#171B1F' }}>{item.name}</span>
                            <span style={{ fontSize: '11px', color: '#6B7280', marginLeft: '6px' }}>({item.email})</span>
                          </div>
                          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{item.phone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. TERMÍN SPLNĚNÍ (DVĚ POLE: OD A DO) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4B5563', marginBottom: '4px' }}>
                  Termín splnění
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Od (Datum)</span>
                    <input
                      type="date"
                      value={editingTask.startDate || ''}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        const newEnd = editingTask.endDate;
                        
                        let formattedRange = 'Dnes';
                        if (newStart && newEnd) {
                          const [y1, m1, d1] = newStart.split('-');
                          const [y2, m2, d2] = newEnd.split('-');
                          formattedRange = `${parseInt(d1,10)}.${parseInt(m1,10)}. → ${parseInt(d2,10)}.${parseInt(m2,10)}.`;
                        } else if (newStart) {
                          const [y1, m1, d1] = newStart.split('-');
                          formattedRange = `${parseInt(d1,10)}.${parseInt(m1,10)}.`;
                        }

                        setEditingTask(prev => ({
                          ...prev,
                          startDate: newStart,
                          dateRange: formattedRange
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        fontSize: '12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Do (Datum - volitelné)</span>
                    <input
                      type="date"
                      value={editingTask.endDate || ''}
                      onChange={(e) => {
                        const newEnd = e.target.value;
                        const newStart = editingTask.startDate || '2026-08-24';
                        
                        let formattedRange = 'Dnes';
                        if (newStart && newEnd) {
                          const [y1, m1, d1] = newStart.split('-');
                          const [y2, m2, d2] = newEnd.split('-');
                          formattedRange = `${parseInt(d1,10)}.${parseInt(m1,10)}. → ${parseInt(d2,10)}.${parseInt(m2,10)}.`;
                        } else if (newStart) {
                          const [y1, m1, d1] = newStart.split('-');
                          formattedRange = `${parseInt(d1,10)}.${parseInt(m1,10)}.`;
                        }

                        setEditingTask(prev => ({
                          ...prev,
                          startDate: newStart,
                          endDate: newEnd,
                          dateRange: formattedRange
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        fontSize: '12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* TLAČÍTKA NA SPODU (S ANIMACÍ IMPLOZE PŘI SMAZÁNÍ) */}
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => {
                  setIsDeletingTaskModal(true);
                  setTimeout(() => {
                    setTasks(prev => prev.filter(t => t.id !== editingTask.id));
                    setEditingTask(null);
                    setIsDeletingTaskModal(false);
                  }, 320);
                }}
                style={{
                  backgroundColor: '#FFEBEB',
                  color: '#EF4444',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Smazat úkol
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  style={{
                    backgroundColor: '#F3F4F6',
                    color: '#4B5563',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontWeight: 500,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Zrušit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTasks(prev => prev.map(t => t.id === editingTask.id ? editingTask : t));
                    setEditingTask(null);
                  }}
                  style={{
                    backgroundColor: '#FF4742',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Uložit změny
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODÁLNÍ OKNO PRO NASTAVENÍ SLEDOVÁNÍ NAROZENIN A JMENIN */}
      {showBirthdaySettingsModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setShowBirthdaySettingsModal(false)}
        >
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '440px',
              maxWidth: '90%',
              padding: '24px',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.18)',
              fontFamily: 'Inter, sans-serif'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FDF2F8', color: '#DB2777', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  <i className="las la-birthday-cake" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#171B1F' }}>Sledování narozenin a jmenin</h3>
                  <p style={{ margin: 0, fontSize: '11px', color: '#747F8F' }}>Nastavení zobrazování v kalendáři</p>
                </div>
              </div>
              <i className="las la-times" onClick={() => setShowBirthdaySettingsModal(false)} style={{ fontSize: '20px', cursor: 'pointer', color: '#6B7280' }} />
            </div>

            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '12px', color: '#4B5563', lineHeight: 1.5 }}>
              Zvolte skupiny osob, jejichž narozeniny a jmeniny se budou zobrazovat v kalendáři. <strong>Výchozí sledování platí pouze pro Děti v péči.</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { key: 'child', label: 'Děti v péči', desc: 'Narozeniny a jmeniny dětí (Výchozí)', icon: 'las la-smile', color: '#DB2777' },
                { key: 'foster_parent', label: 'Pěstouni', desc: 'Narozeniny a jmeniny evidovaných pěstounů', icon: 'las la-heart', color: '#059669' },
                { key: 'coworker', label: 'Klíčové osoby a pracovníci', desc: 'Narozeniny a jmeniny pracovníků organizace', icon: 'las la-user-tie', color: '#7C3AED' },
                { key: 'other', label: 'Ostatní kontakty s datem narození', desc: 'Ostatní vymezené osoby v databázi', icon: 'las la-users', color: '#2563EB' }
              ].map(item => (
                <label key={item.key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: birthdayTrackingSettings[item.key] ? '#FFFFFF' : '#FAFAFA',
                  cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className={item.icon} style={{ fontSize: '18px', color: item.color }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#171B1F' }}>{item.label}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{item.desc}</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={birthdayTrackingSettings[item.key]}
                    onChange={(e) => setBirthdayTrackingSettings(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
                  />
                </label>
              ))}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowBirthdaySettingsModal(false)}
                style={{
                  backgroundColor: '#FF4742',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Uložit nastavení
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export default RoutineAgendaView;
