import React, { useState, useMemo } from 'react';
import { useTheme } from '../../_core/ThemeContext';
import {
  Inbox,
  CalendarDays,
  Calendar,
  CalendarRange,
  Grid2X2,
  ListCheck,
  Folder,
  ChevronRight,
  ChevronDown,
  Plus,
  Tag,
  ChevronLeft,
  X,
  Trash2,
  FolderPlus,
  Ban,
  CheckCircle2
} from 'lucide-react';
import type { SmartView, TaskList } from '../types';
import {
  useTaskLists,
  useTaskFolders,
  usePlannerStats,
  useTasks,
  useCreateList,
  useDeleteList,
  useCreateFolder,
  useToggleFolderCollapse,
  getIsoDate
} from '../hooks/usePlanner';

interface PlannerSidebarProps {
  activeSmartView: SmartView | null;
  onSelectSmartView: (view: SmartView) => void;
  activeListId: string | null;
  onSelectListId: (listId: string | null) => void;
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenCreateTask?: () => void;
}

const PRESET_COLORS = [
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#ec4899', // Pink
];

export const PlannerSidebar: React.FC<PlannerSidebarProps> = ({
  activeSmartView,
  onSelectSmartView,
  activeListId,
  onSelectListId,
  activeTag,
  onSelectTag,
  selectedDate,
  onSelectDate,
  isMobileOpen = false,
  onCloseMobile,
  onOpenCreateTask
}) => {
  const { isDark } = useTheme();
  const { data: stats } = usePlannerStats();
  const { data: lists = [] } = useTaskLists();
  const { data: folders = [] } = useTaskFolders();
  const { data: allTasks = [] } = useTasks();

  const createListMutation = useCreateList();
  const deleteListMutation = useDeleteList();
  const createFolderMutation = useCreateFolder();
  const toggleFolderMutation = useToggleFolderCollapse();

  // MiniCalendar State
  const [calDate, setCalDate] = useState(() => new Date());

  // New List / Folder Form states
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState(PRESET_COLORS[0]);
  const [newListFolderId, setNewListFolderId] = useState<string>('');

  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Extract unique tags from tasks
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    allTasks.forEach((t) => {
      (t.tags || []).forEach((tg) => tagsSet.add(tg.toLowerCase()));
    });
    return Array.from(tagsSet);
  }, [allTasks]);

  // Set of dates that have tasks due
  const taskDatesMap = useMemo(() => {
    const map = new Map<string, number>();
    allTasks.forEach((t) => {
      if (t.dueDate && !t.completed) {
        map.set(t.dueDate, (map.get(t.dueDate) || 0) + 1);
      }
    });
    return map;
  }, [allTasks]);

  // MiniCalendar calculations
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const monthName = calDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayStr = getIsoDate(0);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 for Sun

  const daysGrid = useMemo(() => {
    const grid: { dayNum: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      grid.push({ dayNum: d, dateStr, isCurrentMonth: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      grid.push({ dayNum: d, dateStr, isCurrentMonth: true });
    }

    // Next month padding
    const remaining = 35 - grid.length > 0 ? 35 - grid.length : 42 - grid.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      grid.push({ dayNum: d, dateStr, isCurrentMonth: false });
    }

    return grid;
  }, [year, month, firstDayIndex, daysInMonth]);

  const handlePrevMonth = () => {
    setCalDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCalDate(new Date(year, month + 1, 1));
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    await createListMutation.mutateAsync({
      name: newListName.trim(),
      color: newListColor,
      folderId: newListFolderId || undefined
    });

    setNewListName('');
    setIsAddingList(false);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    await createFolderMutation.mutateAsync(newFolderName.trim());
    setNewFolderName('');
    setIsAddingFolder(false);
  };

  const renderSmartNavItem = (
    view: SmartView,
    label: string,
    Icon: React.ElementType,
    count?: number,
    iconColor?: string
  ) => {
    const isSelected = activeSmartView === view && !activeListId && !activeTag && !selectedDate;
    return (
      <button
        key={view}
        type="button"
        onClick={() => {
          onSelectSmartView(view);
          onSelectListId(null);
          onSelectTag(null);
          onSelectDate(null);
          if (onCloseMobile) onCloseMobile();
        }}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group select-none ${
          isSelected
            ? isDark
              ? 'bg-white/[0.12] text-white shadow-xs border border-white/[0.14] font-semibold'
              : 'bg-white text-zinc-950 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-gray-200/80 font-semibold'
            : isDark
            ? 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            : 'text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.04]'
        }`}
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <Icon
            className={`w-4 h-4 shrink-0 transition-colors ${
              iconColor || (isSelected ? 'text-[#4772FA]' : 'text-zinc-400')
            }`}
          />
          <span className="truncate">{label}</span>
        </div>
        {count !== undefined && count > 0 && (
          <span
            className={`px-2 py-0.5 text-[10px] font-mono rounded-full font-medium ${
              isSelected
                ? 'bg-blue-100 text-[#4772FA] dark:bg-blue-950 dark:text-blue-300'
                : isDark
                ? 'bg-zinc-800 text-zinc-400'
                : 'bg-black/[0.06] text-zinc-600 group-hover:text-zinc-950'
            }`}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  const renderListRow = (list: TaskList) => {
    const isSelected = activeListId === list.id && !selectedDate && !activeTag;
    return (
      <div
        key={list.id}
        className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all select-none ${
          isSelected
            ? isDark
              ? 'bg-zinc-800 text-white shadow-xs border border-white/[0.08] font-semibold'
              : 'bg-white text-zinc-950 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-black/[0.06] font-semibold'
            : isDark
            ? 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            : 'text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.04]'
        }`}
        onClick={() => {
          onSelectListId(list.id);
          onSelectTag(null);
          onSelectDate(null);
          if (onCloseMobile) onCloseMobile();
        }}
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ring-1 ring-black/[0.08]"
            style={{ backgroundColor: list.color }}
          />
          <span className="truncate">{list.name}</span>
        </div>

        <div className="flex items-center space-x-1">
          {list.taskCount !== undefined && list.taskCount > 0 && (
            <span
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded-full ${
                isSelected ? 'bg-violet-100 text-violet-700' : 'bg-black/[0.06] text-[#6e6e73]'
              }`}
            >
              {list.taskCount}
            </span>
          )}
          <button
            type="button"
            title="Delete List"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Delete list "${list.name}"?`)) {
                deleteListMutation.mutate(list.id);
                if (activeListId === list.id) {
                  onSelectListId(null);
                  onSelectSmartView('today');
                }
              }
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-[#8d8d93] hover:text-red-500 hover:bg-red-50 transition-opacity"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/25 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 shrink-0 flex flex-col transition-transform duration-300 font-sans apple-sidebar-material ${
          isDark ? 'text-zinc-100' : 'text-zinc-900'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header Close */}
        <div className={`lg:hidden flex items-center justify-between p-4 border-b ${
          isDark ? 'bg-[#12131a] border-white/[0.08]' : 'bg-white border-black/[0.06]'
        }`}>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Planner Navigation
          </span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-6 custom-scrollbar">
          {/* ── MiniCalendar (Apple Calendar Style) ── */}
          <div className="rounded-2xl p-3.5 apple-card-glass">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-bold text-zinc-900 dark:text-white tracking-tight">
                {monthName}
              </span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-[#8d8d93] mb-1.5">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {daysGrid.map((cell, idx) => {
                const isToday = cell.dateStr === todayStr;
                const isSelected = selectedDate === cell.dateStr;
                const hasTasks = (taskDatesMap.get(cell.dateStr) || 0) > 0;

                return (
                  <button
                    key={`${cell.dateStr}-${idx}`}
                    type="button"
                    onClick={() => {
                      if (selectedDate === cell.dateStr) {
                        onSelectDate(null);
                      } else {
                        onSelectDate(cell.dateStr);
                        onSelectListId(null);
                        onSelectTag(null);
                      }
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`relative h-7 rounded-xl text-xs font-medium flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-600/30'
                        : isToday
                        ? 'bg-violet-500/15 text-violet-700 dark:text-violet-300 font-bold border border-violet-500/30'
                        : cell.isCurrentMonth
                        ? isDark ? 'text-zinc-200 hover:bg-white/[0.06]' : 'text-[#1d1d1f] hover:bg-black/[0.04]'
                        : 'text-[#c7c7cc] dark:text-zinc-600 hover:text-[#8d8d93]'
                    }`}
                  >
                    <span>{cell.dayNum}</span>
                    {hasTasks && (
                      <span
                        className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-violet-500'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Smart Views Section ── */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-semibold text-[#8d8d93] tracking-widest uppercase">
              Smart Views
            </div>
            {renderSmartNavItem('inbox', 'Inbox', Inbox, stats?.inboxCount, 'text-[#4772FA]')}
            {renderSmartNavItem('today', 'Today', CalendarDays, stats?.todayCount, 'text-[#4772FA]')}
            {renderSmartNavItem('tomorrow', 'Tomorrow', Calendar, stats?.tomorrowCount, 'text-[#FFB000]')}
            {renderSmartNavItem('7days', 'Next 7 Days', CalendarRange, stats?.next7DaysCount, 'text-[#8B5CF6]')}
            {renderSmartNavItem('matrix', 'Eisenhower Matrix', Grid2X2, undefined, 'text-[#10B981]')}
            {renderSmartNavItem('all', 'All Tasks', ListCheck, stats?.allCount, 'text-[#06B6D4]')}
            {renderSmartNavItem('wont_do', "Won't Do", Ban, stats?.wontDoCount, 'text-[#64748B]')}
            {renderSmartNavItem('completed', 'Completed', CheckCircle2, stats?.completedCount, 'text-[#10B981]')}
          </div>

          {/* ── Project Folders & Lists ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <span className="text-[10px] font-semibold text-[#8d8d93] tracking-widest uppercase">
                Projects &amp; Lists
              </span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  title="New Folder"
                  onClick={() => setIsAddingFolder(true)}
                  className="p-1 rounded-lg text-[#8d8d93] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="New List"
                  onClick={() => setIsAddingList(true)}
                  className="p-1 rounded-lg text-[#8d8d93] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Folder creation form */}
            {isAddingFolder && (
              <form
                onSubmit={handleCreateFolder}
                className="p-3 rounded-2xl bg-white border border-black/[0.08] shadow-sm space-y-2 animate-in fade-in"
              >
                <input
                  type="text"
                  autoFocus
                  placeholder="Folder Name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#f5f5f7] border border-black/[0.06] text-xs text-[#1d1d1f] placeholder:text-[#8d8d93] focus:outline-none focus:border-violet-500"
                />
                <div className="flex items-center justify-end space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setIsAddingFolder(false)}
                    className="px-2.5 py-1 text-[11px] text-[#6e6e73] hover:text-[#1d1d1f]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-[11px] bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold shadow-sm"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}

            {/* List creation form */}
            {isAddingList && (
              <form
                onSubmit={handleCreateList}
                className="p-3 rounded-2xl bg-white border border-black/[0.08] shadow-sm space-y-2.5 animate-in fade-in"
              >
                <input
                  type="text"
                  autoFocus
                  placeholder="List Name..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#f5f5f7] border border-black/[0.06] text-xs text-[#1d1d1f] placeholder:text-[#8d8d93] focus:outline-none focus:border-violet-500"
                />

                {/* Color picker */}
                <div className="flex items-center space-x-1.5 pt-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewListColor(c)}
                      className={`w-4 h-4 rounded-full transition-transform ${
                        newListColor === c ? 'scale-125 ring-2 ring-violet-500 ring-offset-1' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                {/* Folder Select */}
                {folders.length > 0 && (
                  <select
                    value={newListFolderId}
                    onChange={(e) => setNewListFolderId(e.target.value)}
                    className="w-full px-2.5 py-1 rounded-xl bg-[#f5f5f7] border border-black/[0.06] text-[11px] text-[#1d1d1f] focus:outline-none cursor-pointer"
                  >
                    <option value="">No Folder (Root)</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex items-center justify-end space-x-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingList(false)}
                    className="px-2.5 py-1 text-[11px] text-[#6e6e73] hover:text-[#1d1d1f]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-[11px] bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold shadow-sm"
                  >
                    Save List
                  </button>
                </div>
              </form>
            )}

            {/* Folders and Lists Tree */}
            <div className="space-y-1">
              {folders.map((folder) => {
                const folderLists = lists.filter((l) => l.folderId === folder.id);
                const isCollapsed = folder.isCollapsed;

                return (
                  <div key={folder.id} className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => toggleFolderMutation.mutate(folder.id)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        {isCollapsed ? (
                          <ChevronRight className="w-3.5 h-3.5 text-[#8d8d93] shrink-0" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-[#8d8d93] shrink-0" />
                        )}
                        <Folder className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{folder.name}</span>
                      </div>
                      <span className="text-[10px] text-[#8d8d93]">{folderLists.length}</span>
                    </button>

                    {!isCollapsed && (
                      <div className="pl-3.5 space-y-0.5 border-l border-black/[0.06] ml-3">
                        {folderLists.map((l) => renderListRow(l))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Unfiled Lists */}
              {lists.filter((l) => !l.folderId).map((l) => renderListRow(l))}
            </div>
          </div>

          {/* ── Tags Filter Chips ── */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3">
                <span className="text-[10px] font-semibold text-[#8d8d93] tracking-widest uppercase">
                  Tags
                </span>
                {activeTag && (
                  <button
                    type="button"
                    onClick={() => onSelectTag(null)}
                    className="text-[10px] text-[#6e6e73] hover:text-[#1d1d1f]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 px-2">
                {availableTags.map((tag) => {
                  const isSelected = activeTag?.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        onSelectTag(isSelected ? null : tag);
                        onSelectDate(null);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-cyan-500/15 text-cyan-800 border border-cyan-500/30 font-semibold shadow-sm'
                          : 'bg-white text-[#6e6e73] border border-black/[0.06] hover:text-[#1d1d1f] hover:border-black/[0.12]'
                      }`}
                    >
                      <Tag className="w-3 h-3 text-cyan-600" />
                      <span>#{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};