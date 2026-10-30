import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Plus,
  Calendar,
  Flag,
  Folder,
  Tag,
  X,
  Sparkles,
  ArrowRight,
  Clock,
  SlidersHorizontal
} from 'lucide-react';
import type { PriorityLevel, TaskList } from '../types';
import { useTaskLists, useCreateTask, getIsoDate } from '../hooks/usePlanner';

interface QuickAddTaskInputProps {
  defaultListId?: string | null;
  defaultDueDate?: string | null;
  onTaskCreated?: (taskId: string) => void;
  onOpenFullModal?: () => void;
  placeholder?: string;
}

export const QuickAddTaskInput: React.FC<QuickAddTaskInputProps> = ({
  defaultListId,
  defaultDueDate,
  onTaskCreated,
  onOpenFullModal,
  placeholder = "Add a task... Type '!urgent', 'tomorrow', '^Work', '#taxes' for instant detection"
}) => {
  const { data: lists = [] } = useTaskLists();
  const createTaskMutation = useCreateTask();

  const [rawText, setRawText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Explicit overrides if user manually clicks buttons or removes chips
  const [manualPriority, setManualPriority] = useState<PriorityLevel | null>(null);
  const [manualDueDate, setManualDueDate] = useState<string | null>(null);
  const [manualListId, setManualListId] = useState<string | null>(defaultListId || null);
  const [manualTags, setManualTags] = useState<string[]>([]);

  // Dropdown state - only one picker can be open at a time to prevent overlapping
  const [openPicker, setOpenPicker] = useState<'priority' | 'date' | 'list' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close popups on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenPicker(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update defaultListId if prop changes
  useEffect(() => {
    if (defaultListId) setManualListId(defaultListId);
  }, [defaultListId]);

  // Update defaultDueDate if prop changes
  useEffect(() => {
    if (defaultDueDate) setManualDueDate(defaultDueDate);
  }, [defaultDueDate]);

  // ── Real-time NLP Parser ─────────────────────────────────────────
  const parsed = useMemo(() => {
    let text = rawText;
    let priority: PriorityLevel | undefined;
    let dueDate: string | undefined;
    let listId: string | undefined;
    const tags: string[] = [];

    // Match priority: !urgent, !high, !med, !medium, !low
    const priorityMatch = text.match(/!(urgent|high|med(?:ium)?|low)\b/i);
    if (priorityMatch) {
      const p = priorityMatch[1].toLowerCase();
      if (p === 'urgent') priority = 'urgent';
      else if (p === 'high') priority = 'high';
      else if (p === 'med' || p === 'medium') priority = 'medium';
      else if (p === 'low') priority = 'low';
    }

    // Match tags: #tag
    const tagMatches = [...text.matchAll(/#([a-zA-Z0-9_-]+)/g)];
    tagMatches.forEach((m) => {
      tags.push(m[1].toLowerCase());
    });

    // Match list: ^listname
    const listMatch = text.match(/\^([a-zA-Z0-9_-]+)/i);
    if (listMatch) {
      const listQuery = listMatch[1].toLowerCase();
      const foundList = lists.find((l) =>
        l.name.toLowerCase().replace(/\s+/g, '').includes(listQuery)
      );
      if (foundList) {
        listId = foundList.id;
      }
    }

    // Match date: @today, @tomorrow, or words today, tomorrow, etc.
    const todayMatch = text.match(/(?:^|\s)(?:@today\b|today\b)/i);
    const tomorrowMatch = text.match(/(?:^|\s)(?:@tomorrow\b|tomorrow\b)/i);
    const nextDayMatch = text.match(
      /(?:^|\s)(?:@|next\s+)(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i
    );

    if (todayMatch) {
      dueDate = getIsoDate(0);
    } else if (tomorrowMatch) {
      dueDate = getIsoDate(1);
    } else if (nextDayMatch) {
      const dayName = nextDayMatch[1].toLowerCase();
      const dayMap: Record<string, number> = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6
      };
      const targetDay = dayMap[dayName];
      const now = new Date();
      const currentDay = now.getDay();
      let daysUntil = (targetDay + 7 - currentDay) % 7;
      if (daysUntil === 0) daysUntil = 7;
      dueDate = getIsoDate(daysUntil);
    }

    return {
      priority,
      dueDate,
      listId,
      tags
    };
  }, [rawText, lists]);

  // Combine NLP + manual overrides
  const effectivePriority: PriorityLevel = manualPriority || parsed.priority || 'medium';
  const effectiveDueDate =
    manualDueDate !== null ? manualDueDate : parsed.dueDate || defaultDueDate || undefined;
  const effectiveListId =
    manualListId !== null ? manualListId : parsed.listId || defaultListId || undefined;
  const effectiveTags = Array.from(new Set([...parsed.tags, ...manualTags]));

  const selectedList = lists.find((l) => l.id === effectiveListId);

  // Clean title for submission
  const getCleanTitle = () => {
    let t = rawText;
    t = t.replace(/!(urgent|high|med(?:ium)?|low)\b/gi, '');
    t = t.replace(/#([a-zA-Z0-9_-]+)/g, '');
    t = t.replace(/\^([a-zA-Z0-9_-]+)/gi, '');
    t = t.replace(/(?:^|\s)(?:@today\b|today\b)/gi, '');
    t = t.replace(/(?:^|\s)(?:@tomorrow\b|tomorrow\b)/gi, '');
    t = t.replace(
      /(?:^|\s)(?:@|next\s+)(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
      ''
    );
    return t.replace(/\s+/g, ' ').trim();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = getCleanTitle();
    if (!cleanTitle && !rawText.trim()) return;

    const taskTitle = cleanTitle || rawText.trim();

    try {
      const created = await createTaskMutation.mutateAsync({
        title: taskTitle,
        priority: effectivePriority,
        dueDate: effectiveDueDate,
        listId: effectiveListId,
        tags: effectiveTags
      });

      // Clear
      setRawText('');
      setManualPriority(null);
      setManualDueDate(null);
      setManualTags([]);
      if (onTaskCreated) onTaskCreated(created.id);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const priorityColor = {
    urgent: 'text-red-700 bg-red-50 border-red-200',
    high: 'text-amber-700 bg-amber-50 border-amber-200',
    medium: 'text-violet-700 bg-violet-50 border-violet-200',
    low: 'text-blue-700 bg-blue-50 border-blue-200'
  }[effectivePriority];

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl transition-all duration-200 font-sans apple-card-glass ${
        isFocused
          ? 'ring-2 ring-violet-500/30 border-violet-500/40 shadow-[0_12px_36px_rgba(139,92,246,0.12)]'
          : 'hover:border-black/[0.12] dark:hover:border-white/[0.18]'
      }`}
    >
      <form onSubmit={handleFormSubmit} className="p-3 sm:p-3.5">
        {/* Input Row */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 text-violet-600">
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-[#1d1d1f] dark:text-zinc-100 placeholder:text-[#8d8d93] focus:outline-none font-medium"
          />

          {onOpenFullModal && (
            <button
              type="button"
              title="Open full task creator sheet"
              onClick={onOpenFullModal}
              className="p-1.5 rounded-xl text-[#8d8d93] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={!rawText.trim() || createTaskMutation.isPending}
            className="px-4 py-1.5 rounded-full bg-violet-600 hover:bg-violet-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-white shadow-[0_2px_8px_rgba(124,58,237,0.3),inset_0_1px_0.5px_rgba(255,255,255,0.35)] flex items-center space-x-1.5 transition-all active:scale-95"
          >
            <span>Add</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Active Parsed Badges & Quick Action Controls ── */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2 border-t border-black/[0.06] text-xs">
          {/* Left: Active Chips */}
          <div className="flex flex-wrap items-center gap-1.5 min-h-[26px]">
            {/* Priority Chip */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenPicker(openPicker === 'priority' ? null : 'priority')}
                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all shadow-sm ${priorityColor}`}
              >
                <Flag className="w-3 h-3" />
                <span className="capitalize">{effectivePriority}</span>
              </button>

              {/* Priority Dropdown */}
              {openPicker === 'priority' && (
                <div className="absolute top-full mt-2 left-0 z-50 w-36 p-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.12] shadow-[0_12px_36px_rgba(0,0,0,0.15)] space-y-0.5 animate-in fade-in">
                  {(['urgent', 'high', 'medium', 'low'] as PriorityLevel[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setManualPriority(p);
                        setOpenPicker(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#1d1d1f] dark:text-zinc-100 hover:bg-[#f5f5f7] dark:hover:bg-white/[0.06] flex items-center space-x-2 capitalize transition-colors"
                    >
                      <Flag
                        className={`w-3.5 h-3.5 ${
                          p === 'urgent'
                            ? 'text-red-500'
                            : p === 'high'
                            ? 'text-amber-500'
                            : p === 'medium'
                            ? 'text-violet-500'
                            : 'text-blue-500'
                        }`}
                      />
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Due Date Chip */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenPicker(openPicker === 'date' ? null : 'date')}
                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                  effectiveDueDate
                    ? 'bg-violet-50 text-violet-700 border-violet-200 font-semibold shadow-sm'
                    : 'bg-[#f5f5f7] text-[#6e6e73] border-black/[0.04] hover:text-[#1d1d1f]'
                }`}
              >
                <Calendar className="w-3 h-3 text-violet-600" />
                <span>
                  {effectiveDueDate === getIsoDate(0)
                    ? 'Today'
                    : effectiveDueDate === getIsoDate(1)
                    ? 'Tomorrow'
                    : effectiveDueDate || 'Set Date'}
                </span>
                {effectiveDueDate && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setManualDueDate(null);
                    }}
                    className="hover:text-red-600 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
              </button>

              {/* Date Dropdown */}
              {openPicker === 'date' && (
                <div className="absolute top-full mt-2 left-0 z-50 w-40 p-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.12] shadow-[0_12px_36px_rgba(0,0,0,0.15)] space-y-0.5 animate-in fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setManualDueDate(getIsoDate(0));
                      setOpenPicker(null);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#1d1d1f] dark:text-zinc-100 hover:bg-[#f5f5f7] dark:hover:bg-white/[0.06] flex items-center space-x-2"
                  >
                    <Clock className="w-3.5 h-3.5 text-violet-600" />
                    <span>Today</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualDueDate(getIsoDate(1));
                      setOpenPicker(null);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#1d1d1f] dark:text-zinc-100 hover:bg-[#f5f5f7] dark:hover:bg-white/[0.06] flex items-center space-x-2"
                  >
                    <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Tomorrow</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualDueDate(getIsoDate(7));
                      setOpenPicker(null);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#1d1d1f] dark:text-zinc-100 hover:bg-[#f5f5f7] dark:hover:bg-white/[0.06] flex items-center space-x-2"
                  >
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Next Week</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualDueDate(null);
                      setOpenPicker(null);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-[#8d8d93] dark:text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center space-x-2"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>No Date</span>
                  </button>
                </div>
              )}
            </div>

            {/* List Chip */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenPicker(openPicker === 'list' ? null : 'list')}
                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                  selectedList
                    ? 'bg-white text-[#1d1d1f] border-black/[0.08] shadow-sm font-semibold'
                    : 'bg-[#f5f5f7] text-[#6e6e73] border-black/[0.04] hover:text-[#1d1d1f]'
                }`}
              >
                {selectedList ? (
                  <span
                    className="w-2 h-2 rounded-full ring-1 ring-black/[0.1]"
                    style={{ backgroundColor: selectedList.color }}
                  />
                ) : (
                  <Folder className="w-3 h-3 text-[#8d8d93]" />
                )}
                <span>{selectedList ? selectedList.name : 'Select List'}</span>
                {selectedList && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setManualListId(null);
                    }}
                    className="hover:text-red-600 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
              </button>

              {/* List Dropdown */}
              {openPicker === 'list' && (
                <div className="absolute top-full mt-2 left-0 z-50 w-48 max-h-56 overflow-y-auto p-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.12] shadow-[0_12px_36px_rgba(0,0,0,0.15)] space-y-0.5 animate-in fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setManualListId(null);
                      setOpenPicker(null);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-[#6e6e73] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-zinc-100 hover:bg-[#f5f5f7] dark:hover:bg-white/[0.06]"
                  >
                    No List (Inbox)
                  </button>
                  {lists.map((list) => (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => {
                        setManualListId(list.id);
                        setOpenPicker(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-[#1d1d1f] dark:text-zinc-100 hover:bg-[#f5f5f7] dark:hover:bg-white/[0.06] flex items-center space-x-2"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: list.color }}
                      />
                      <span className="truncate">{list.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tags Chips */}
            {effectiveTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-800 border border-cyan-500/30 text-[11px] font-medium"
              >
                <Tag className="w-2.5 h-2.5" />
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => {
                    setManualTags(manualTags.filter((t) => t !== tag));
                  }}
                  className="hover:text-red-600"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>

          {/* Right helper info */}
          <div className="text-[10px] text-[#8d8d93] font-mono hidden md:flex items-center space-x-2">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-violet-500" />
              <span>Smart detection</span>
            </span>
            <kbd className="px-1.5 py-0.5 bg-[#f5f5f7] rounded-md border border-black/[0.06] text-[#6e6e73]">
              ↵ Enter
            </kbd>
          </div>
        </div>
      </form>
    </div>
  );
};