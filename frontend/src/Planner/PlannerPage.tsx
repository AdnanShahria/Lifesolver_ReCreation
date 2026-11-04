import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../_core/ThemeContext';
import {
  List,
  Columns3,
  Grid2X2,
  Search,
  Plus,
  Menu,
  Sparkles,
  Inbox,
  CalendarDays,
  Calendar,
  CalendarRange,
  ListCheck,
  Tag,
  X,
  Filter,
  Play,
  Pause,
  RotateCcw,
  Ban,
  CheckCircle2
} from 'lucide-react';
import { Sidebar } from '../_core/Sidebar';
import { PlannerSidebar } from './components/PlannerSidebar';
import { QuickAddTaskInput } from './components/QuickAddTaskInput';
import { TaskListView } from './components/TaskListView';
import { TaskKanbanView } from './components/TaskKanbanView';
import { EisenhowerMatrixView } from './components/EisenhowerMatrixView';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { CreateTaskModal } from './components/CreateTaskModal';

import type { SmartView, ViewMode, Task, PriorityLevel, TaskStatus } from './types';
import { useTasks, useTaskLists } from './hooks/usePlanner';

export const PlannerPage: React.FC = () => {
  // Global theme synchronization (Light mode primary)
  const { theme, isDark, toggleTheme } = useTheme();

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeSmartView, setActiveSmartView] = useState<SmartView | null>('today');
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Task for Detail Drawer
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Mobile sidebar toggle
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Dedicated Add Card / Task Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalDefaultPriority, setCreateModalDefaultPriority] = useState<PriorityLevel>('medium');
  const [createModalDefaultStatus, setCreateModalDefaultStatus] = useState<TaskStatus>('todo');

  // Focus modal notification simulation
  const [focusActiveTask, setFocusActiveTask] = useState<Task | null>(null);
  const [focusSecondsRemaining, setFocusSecondsRemaining] = useState(25 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState(true);

  // Keyboard shortcut: Press 'N' to open Create Task Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsCreateModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pomodoro countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (focusActiveTask && isFocusRunning && focusSecondsRemaining > 0) {
      interval = setInterval(() => {
        setFocusSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusActiveTask, isFocusRunning, focusSecondsRemaining]);

  // Fetch tasks with active filters
  const { data: tasks = [], isLoading } = useTasks({
    smartView:
      !activeListId && !activeTag && !selectedDate && activeSmartView
        ? activeSmartView
        : undefined,
    listId: activeListId || undefined,
    tag: activeTag || undefined,
    search: searchQuery
  });

  const { data: lists = [] } = useTaskLists();

  // If a specific date is selected from MiniCalendar, filter tasks for that date
  const filteredTasks = useMemo(() => {
    if (selectedDate) {
      return tasks.filter((t) => t.dueDate === selectedDate);
    }
    return tasks;
  }, [tasks, selectedDate]);

  const selectedTask = useMemo(() => {
    return tasks.find((t) => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // Derive page title & icon
  const pageHeader = useMemo(() => {
    if (selectedDate) {
      return {
        title: `Date: ${selectedDate}`,
        icon: Calendar,
        badge: 'Calendar Selection'
      };
    }
    if (activeTag) {
      return {
        title: `#${activeTag}`,
        icon: Tag,
        badge: 'Tag Filter'
      };
    }
    if (activeListId) {
      const list = lists.find((l) => l.id === activeListId);
      return {
        title: list ? list.name : 'Project List',
        icon: Filter,
        badge: 'Project'
      };
    }

    switch (activeSmartView) {
      case 'inbox':
        return { title: 'Inbox', icon: Inbox, badge: 'Smart View' };
      case 'tomorrow':
        return { title: 'Tomorrow', icon: Calendar, badge: 'Smart View' };
      case '7days':
        return { title: 'Next 7 Days', icon: CalendarRange, badge: 'Smart View' };
      case 'matrix':
        return { title: 'Eisenhower Matrix', icon: Grid2X2, badge: 'Priority Matrix' };
      case 'all':
        return { title: 'All Tasks', icon: ListCheck, badge: 'Master View' };
      case 'wont_do':
        return { title: "Won't Do", icon: Ban, badge: 'TickTick Abandon' };
      case 'completed':
        return { title: 'Completed', icon: CheckCircle2, badge: 'Archived Tasks' };
      case 'today':
      default:
        return { title: 'Today', icon: CalendarDays, badge: 'Smart View' };
    }
  }, [selectedDate, activeTag, activeListId, activeSmartView, lists]);

  const HeaderIcon = pageHeader.icon;

  const completedCount = filteredTasks.filter((t) => t.completed).length;
  const activeCount = filteredTasks.filter((t) => !t.completed).length;

  const formatTimerDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartFocusSession = (task: Task) => {
    setFocusActiveTask(task);
    setFocusSecondsRemaining(25 * 60);
    setIsFocusRunning(true);
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-200 selection:bg-violet-500/20 selection:text-violet-900 ${
      isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#f5f5f7] text-zinc-900'
    }`}>
      {/* ── Column 1: Global LifeSolver App Rail ── */}
      <Sidebar currentVertical="planner" theme={theme} onToggleTheme={toggleTheme} />

      {/* ── Column 2: Planner Secondary Sidebar ── */}
      <PlannerSidebar
        activeSmartView={activeSmartView}
        onSelectSmartView={(v) => {
          setActiveSmartView(v);
          if (v === 'matrix') {
            setViewMode('matrix');
          } else if (viewMode === 'matrix') {
            setViewMode('list');
          }
        }}
        activeListId={activeListId}
        onSelectListId={setActiveListId}
        activeTag={activeTag}
        onSelectTag={setActiveTag}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenCreateTask={() => {
          setCreateModalDefaultPriority('medium');
          setIsCreateModalOpen(true);
        }}
      />

      {/* ── Column 3: Center Workspace ── */}
      <main className={`relative flex-1 flex flex-col min-w-0 overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-[#090a0f]' : 'bg-[#fbfbfd]'
      }`}>
        {/* Apple Atmospheric Mesh Glows (Provides backdrop light for authentic glass refraction) */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-violet-400/10 dark:bg-violet-600/15 blur-[120px]" />
          <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[130px]" />
          <div className="absolute -bottom-20 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-300/10 dark:bg-indigo-500/10 blur-[140px]" />
        </div>

        {/* Workspace Top Header Bar */}
        <header className={`h-16 px-6 flex items-center justify-between shrink-0 z-10 transition-colors apple-navbar-material ${
          isDark ? 'text-white' : 'text-zinc-900'
        }`}>
          {/* Left Title & Mobile Menu */}
          <div className="flex items-center space-x-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center text-[#4772FA] shrink-0 shadow-2xs">
                <HeaderIcon className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h1 className="text-base font-bold text-zinc-900 dark:text-white truncate tracking-tight">
                    {pageHeader.title}
                  </h1>
                  <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#f5f5f7] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-black/[0.06] dark:border-white/[0.08]">
                    {activeCount} active · {completedCount} done
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center/Right: Search + View Switcher + New Task Button */}
          <div className="flex items-center space-x-2.5">
            {/* Search Input */}
            <div className="relative hidden md:block w-44 lg:w-60">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-7 py-1.5 rounded-xl border text-xs focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all font-medium ${
                  isDark
                    ? 'bg-zinc-800/80 border-white/[0.08] text-white placeholder-zinc-500'
                    : 'bg-white/70 border-black/[0.06] text-zinc-900 placeholder-zinc-400 focus:bg-white shadow-[inset_0_1px_1px_rgba(0,0,0,0.03)]'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* View Mode Switcher (Apple Segmented Tray) */}
            <div className="apple-segmented-tray">
              <button
                type="button"
                title="List View"
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs transition-all ${
                  viewMode === 'list'
                    ? 'apple-segmented-thumb'
                    : isDark
                    ? 'text-zinc-400 hover:text-white'
                    : 'text-zinc-600 hover:text-zinc-950 font-medium'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>

              <button
                type="button"
                title="Kanban Board View"
                onClick={() => setViewMode('kanban')}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs transition-all ${
                  viewMode === 'kanban'
                    ? 'apple-segmented-thumb'
                    : isDark
                    ? 'text-zinc-400 hover:text-white'
                    : 'text-zinc-600 hover:text-zinc-950 font-medium'
                }`}
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Board</span>
              </button>

              <button
                type="button"
                title="Eisenhower Matrix View"
                onClick={() => setViewMode('matrix')}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs transition-all ${
                  viewMode === 'matrix'
                    ? 'apple-segmented-thumb'
                    : isDark
                    ? 'text-zinc-400 hover:text-white'
                    : 'text-zinc-600 hover:text-zinc-950 font-medium'
                }`}
              >
                <Grid2X2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Matrix</span>
              </button>
            </div>

            {/* Prominent "+ New Task" Button (TickTick Primary Blue CTA) */}
            <button
              type="button"
              onClick={() => {
                setCreateModalDefaultPriority('medium');
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-1.5 rounded-full bg-[#4772FA] hover:bg-blue-600 text-white text-xs font-semibold shadow-[0_4px_14px_rgba(71,114,250,0.35)] active:scale-95 flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </header>

        {/* Scrollable Workspace Body */}
        <div className="relative z-1 flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 custom-scrollbar">
          {/* ── Quick Add Input (NLP Powered) ── */}
          <div className="max-w-4xl mx-auto">
            <QuickAddTaskInput
              defaultListId={activeListId}
              defaultDueDate={
                selectedDate || (activeSmartView === 'tomorrow' ? 'tomorrow' : undefined)
              }
              onTaskCreated={(id) => setSelectedTaskId(id)}
              onOpenFullModal={() => setIsCreateModalOpen(true)}
            />
          </div>

          {/* ── View Rendering (List, Board, Matrix) ── */}
          <div className="max-w-5xl mx-auto pb-12">
            {viewMode === 'list' && (
              <TaskListView
                tasks={filteredTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={(id) => setSelectedTaskId(id)}
                onStartFocus={handleStartFocusSession}
                onOpenCreateTask={() => setIsCreateModalOpen(true)}
              />
            )}

            {viewMode === 'kanban' && (
              <TaskKanbanView
                tasks={filteredTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={(id) => setSelectedTaskId(id)}
                onStartFocus={handleStartFocusSession}
                onOpenCreateTask={(defaultStatus) => {
                  setCreateModalDefaultStatus(defaultStatus || 'todo');
                  setIsCreateModalOpen(true);
                }}
              />
            )}

            {viewMode === 'matrix' && (
              <EisenhowerMatrixView
                tasks={filteredTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={(id) => setSelectedTaskId(id)}
                onStartFocus={handleStartFocusSession}
                onOpenCreateTask={(prio) => {
                  setCreateModalDefaultPriority(prio || 'medium');
                  setIsCreateModalOpen(true);
                }}
              />
            )}
          </div>
        </div>
      </main>

      {/* ── Column 4: Task Detail Slide-in Drawer ── */}
      <TaskDetailDrawer
        task={selectedTask}
        isOpen={Boolean(selectedTaskId && selectedTask)}
        onClose={() => setSelectedTaskId(null)}
        onStartFocus={handleStartFocusSession}
      />

      {/* ── Dedicated Create Task / Add Card Modal ── */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultListId={activeListId}
        defaultDueDate={
          selectedDate || (activeSmartView === 'tomorrow' ? 'tomorrow' : undefined)
        }
        defaultPriority={createModalDefaultPriority}
        onTaskCreated={(id) => setSelectedTaskId(id)}
      />

      {/* ── Apple HIG Pomodoro Focus Session Modal ── */}
      {focusActiveTask && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl border border-black/[0.08] rounded-3xl p-7 shadow-[0_25px_70px_rgba(0,0,0,0.18)] space-y-6 text-center animate-in zoom-in-95 font-sans">
            <div className="w-16 h-16 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 mx-auto shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-violet-600">
                Focus Session Mode
              </span>
              <h2 className="text-lg font-bold text-[#1d1d1f] line-clamp-2 px-2">
                {focusActiveTask.title}
              </h2>
              <p className="text-xs text-[#6e6e73]">
                Pomodoro interval active. Distractions silenced.
              </p>
            </div>

            {/* Large Circular Timer Display */}
            <div className="relative py-4 flex items-center justify-center">
              <div className="w-44 h-44 rounded-full border-4 border-violet-100 flex items-center justify-center relative shadow-inner">
                {isFocusRunning && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-10" />
                )}
                <div className="text-4xl font-mono font-bold text-[#1d1d1f] tracking-tight">
                  {formatTimerDisplay(focusSecondsRemaining)}
                </div>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setIsFocusRunning(!isFocusRunning)}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/20 flex items-center space-x-1.5 transition-all"
              >
                {isFocusRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Resume</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFocusSecondsRemaining(25 * 60)}
                className="p-2 rounded-xl bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
                title="Reset to 25:00"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setFocusActiveTask(null)}
                className="px-4 py-2 rounded-xl bg-[#f5f5f7] hover:bg-[#e8e8ed] text-xs font-semibold text-[#1d1d1f] transition-colors"
              >
                Close Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};