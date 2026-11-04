import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Plus,
  Calendar,
  Clock,
  Flag,
  Folder,
  Tag,
  Repeat,
  Wallet,
  CheckSquare,
  Sparkles,
  AlignLeft,
  Trash2,
  CornerDownLeft,
  ArrowRight,
  BellRing,
  Sun
} from 'lucide-react';
import type { PriorityLevel, RecurrencePattern, TaskStatus, TaskList } from '../types';
import { useTaskLists, useCreateTask, getIsoDate } from '../hooks/usePlanner';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultListId?: string | null;
  defaultDueDate?: string | null;
  defaultPriority?: PriorityLevel;
  onTaskCreated?: (taskId: string) => void;
}

const BUDGET_CATEGORIES = [
  'Infrastructure',
  'Software',
  'Design & UI',
  'Marketing',
  'Legal & Tax',
  'Health & Fitness',
  'Education',
  'Personal',
  'Miscellaneous'
];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  defaultListId,
  defaultDueDate,
  defaultPriority = 'medium',
  onTaskCreated
}) => {
  const { data: lists = [] } = useTaskLists();
  const createTaskMutation = useCreateTask();

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>(defaultPriority);
  const [dueDate, setDueDate] = useState<string>(defaultDueDate || '');
  const [dueTime, setDueTime] = useState<string>('');
  const [listId, setListId] = useState<string>(defaultListId || '');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [recurrence, setRecurrence] = useState<RecurrencePattern>('none');
  const [repeatFrom, setRepeatFrom] = useState<'due_date' | 'completion_date'>('due_date');
  const [isAllDay, setIsAllDay] = useState(false);
  const [annoyingAlert, setAnnoyingAlert] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [expectedCost, setExpectedCost] = useState<number | ''>('');
  const [budgetCategory, setBudgetCategory] = useState<string>('');

  // Subtasks checklist state
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // UI accordion toggles
  const [showNotes, setShowNotes] = useState(false);
  const [showFinance, setShowFinance] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(true);

  // Sync defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setNotes('');
      setPriority(defaultPriority);
      setDueDate(defaultDueDate || '');
      setDueTime('');
      setIsAllDay(false);
      setAnnoyingAlert(false);
      setRepeatFrom('due_date');
      setListId(defaultListId || '');
      setStatus('todo');
      setRecurrence('none');
      setTags([]);
      setTagInput('');
      setExpectedCost('');
      setBudgetCategory('');
      setSubtasks([]);
      setNewSubtaskInput('');
      setShowNotes(false);
      setShowFinance(false);

      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, defaultListId, defaultDueDate, defaultPriority]);

  // Keyboard shortcut listener (Cmd/Ctrl + Enter to submit, Esc to close)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    title,
    priority,
    dueDate,
    dueTime,
    isAllDay,
    annoyingAlert,
    repeatFrom,
    listId,
    tags,
    notes,
    status,
    recurrence,
    expectedCost,
    budgetCategory,
    subtasks
  ]);

  // Real-time NLP parser from Title input
  const nlpPreview = useMemo(() => {
    if (!title) return null;

    let detectedPriority: PriorityLevel | null = null;
    let detectedDueDate: string | null = null;
    const detectedTags: string[] = [];

    // Priority
    const pMatch = title.match(/!(urgent|high|med(?:ium)?|low|none)\b/i);
    if (pMatch) {
      const p = pMatch[1].toLowerCase();
      if (p === 'urgent') detectedPriority = 'urgent';
      else if (p === 'high') detectedPriority = 'high';
      else if (p === 'med' || p === 'medium') detectedPriority = 'medium';
      else if (p === 'low') detectedPriority = 'low';
      else if (p === 'none') detectedPriority = 'none';
    }

    // Tags
    const tMatches = [...title.matchAll(/#([a-zA-Z0-9_-]+)/g)];
    tMatches.forEach((m) => detectedTags.push(m[1].toLowerCase()));

    // Date
    if (/(?:^|\s)(?:@today\b|today\b)/i.test(title)) {
      detectedDueDate = getIsoDate(0);
    } else if (/(?:^|\s)(?:@tomorrow\b|tomorrow\b)/i.test(title)) {
      detectedDueDate = getIsoDate(1);
    }

    if (!detectedPriority && !detectedDueDate && detectedTags.length === 0) {
      return null;
    }

    return {
      priority: detectedPriority,
      dueDate: detectedDueDate,
      tags: detectedTags
    };
  }, [title]);

  if (!isOpen) return null;

  const handleAddSubtask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubtaskInput.trim()) return;
    setSubtasks((prev) => [...prev, newSubtaskInput.trim()]);
    setNewSubtaskInput('');
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    // Apply NLP overrides if detected
    let effectiveTitle = title;
    let effectivePriority = priority;
    let effectiveDueDate = dueDate;
    const effectiveTags = [...tags];

    if (nlpPreview?.priority) effectivePriority = nlpPreview.priority;
    if (nlpPreview?.dueDate) effectiveDueDate = nlpPreview.dueDate;
    if (nlpPreview?.tags) {
      nlpPreview.tags.forEach((t) => {
        if (!effectiveTags.includes(t)) effectiveTags.push(t);
      });
    }

    // Clean title string of NLP keywords
    effectiveTitle = effectiveTitle
      .replace(/!(urgent|high|med(?:ium)?|low|none)\b/gi, '')
      .replace(/#([a-zA-Z0-9_-]+)/g, '')
      .replace(/(?:^|\s)(?:@today\b|today\b)/gi, '')
      .replace(/(?:^|\s)(?:@tomorrow\b|tomorrow\b)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    try {
      const created = await createTaskMutation.mutateAsync({
        title: effectiveTitle || title.trim(),
        priority: effectivePriority,
        dueDate: effectiveDueDate || undefined,
        dueTime: isAllDay ? undefined : dueTime || undefined,
        isAllDay,
        annoyingAlert,
        listId: listId || undefined,
        status,
        completed: status === 'done',
        tags: effectiveTags,
        notes: notes.trim() || undefined,
        recurrence,
        repeatFrom: recurrence !== 'none' ? repeatFrom : undefined,
        expectedCost: typeof expectedCost === 'number' ? expectedCost : undefined,
        budgetCategory: budgetCategory || undefined,
        subtasks: subtasks.map((st) => ({ title: st, isCompleted: 0 }))
      });

      if (onTaskCreated) {
        onTaskCreated(created.id);
      }
      onClose();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const todayStr = getIsoDate(0);
  const tomorrowStr = getIsoDate(1);
  const in3DaysStr = getIsoDate(3);
  const nextWeekStr = getIsoDate(7);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* ── Apple Frosted Backdrop ── */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/25 backdrop-blur-xl saturate-150 transition-opacity animate-in fade-in duration-200"
      />

      {/* ── Apple Sheet Modal Card (Apple Modal Glass) ── */}
      <div
        className="relative w-full max-w-2xl apple-modal-glass rounded-3xl flex flex-col max-h-[90vh] overflow-hidden transition-all animate-in zoom-in-95 duration-200 z-10 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.03] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1d1d1f] dark:text-zinc-100 tracking-tight">Create New Task</h2>
              <p className="text-[11px] text-[#8d8d93]">Apple HIG fast-capture &amp; smart scheduling</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* List Selector Pill */}
            <div className="relative">
              <select
                value={listId}
                onChange={(e) => setListId(e.target.value)}
                className="appearance-none pl-7 pr-7 py-1.5 rounded-xl bg-white/70 dark:bg-zinc-800 border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1d1d1f] dark:text-zinc-100 hover:bg-white transition-colors focus:outline-none cursor-pointer shadow-xs"
              >
                <option value="">Inbox (Default)</option>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <Folder className="w-3.5 h-3.5 text-violet-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8d8d93] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-transparent">
          {/* Title Input */}
          <div className="space-y-1.5">
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be accomplished? Try 'Review contract tomorrow !urgent #legal'"
              className="w-full text-base sm:text-lg font-semibold text-[#1d1d1f] placeholder:text-[#8d8d93] bg-transparent border-0 border-b border-black/[0.08] pb-2.5 focus:outline-none focus:border-violet-500 transition-colors"
            />

            {/* Live NLP Indicator Badge */}
            {nlpPreview && (
              <div className="flex items-center space-x-2 pt-1 text-[11px] text-violet-700 bg-violet-50/80 px-3 py-1.5 rounded-xl border border-violet-200/70 animate-in fade-in">
                <Sparkles className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                <span className="font-medium">Detected:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {nlpPreview.priority && (
                    <span className="px-1.5 py-0.5 rounded-md bg-white border border-violet-200 text-[10px] font-semibold uppercase">
                      Priority: {nlpPreview.priority}
                    </span>
                  )}
                  {nlpPreview.dueDate && (
                    <span className="px-1.5 py-0.5 rounded-md bg-white border border-violet-200 text-[10px] font-medium">
                      Date: {nlpPreview.dueDate}
                    </span>
                  )}
                  {nlpPreview.tags.map((tg) => (
                    <span key={tg} className="px-1.5 py-0.5 rounded-md bg-white border border-violet-200 text-[10px]">
                      #{tg}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Segmented Control: Priority ── */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] flex items-center space-x-1.5">
              <Flag className="w-3.5 h-3.5 text-violet-600" />
              <span>Priority Level</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5 p-1 bg-[#f5f5f7] rounded-2xl border border-black/[0.06]">
              {(
                [
                  { id: 'none', label: 'None', color: 'text-gray-600 bg-white shadow-sm border border-gray-200' },
                  { id: 'low', label: 'Low', color: 'text-blue-600 bg-white shadow-sm border border-blue-200' },
                  { id: 'medium', label: 'Medium', color: 'text-violet-600 bg-white shadow-sm border border-violet-200' },
                  { id: 'high', label: 'High', color: 'text-amber-600 bg-white shadow-sm border border-amber-200' },
                  { id: 'urgent', label: 'Urgent', color: 'text-red-600 bg-white shadow-sm border border-red-200' }
                ] as const
              ).map((p) => {
                const isSelected = priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                      isSelected ? p.color : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.02]'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        p.id === 'urgent'
                          ? 'bg-red-500'
                          : p.id === 'high'
                          ? 'bg-amber-500'
                          : p.id === 'medium'
                          ? 'bg-violet-500'
                          : p.id === 'low'
                          ? 'bg-blue-500'
                          : 'bg-gray-400'
                      }`}
                    />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Due Date, Time & TickTick Options ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-violet-600" />
                <span>Scheduling &amp; Due Date</span>
              </label>

              {/* All-Day & Annoying Alert toggles */}
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-1 text-xs text-[#6e6e73] cursor-pointer hover:text-[#1d1d1f]">
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  <Sun className="w-3 h-3 text-amber-500" />
                  <span>All-day</span>
                </label>

                <label className="flex items-center space-x-1 text-xs text-[#6e6e73] cursor-pointer hover:text-red-600">
                  <input
                    type="checkbox"
                    checked={annoyingAlert}
                    onChange={(e) => setAnnoyingAlert(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-400"
                  />
                  <BellRing className="w-3 h-3 text-red-500" />
                  <span>Annoying Alert</span>
                </label>
              </div>
            </div>

            {/* Quick Date Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDueDate(todayStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  dueDate === todayStr
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-[#f5f5f7] text-[#6e6e73] hover:text-[#1d1d1f] border border-black/[0.04]'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDueDate(tomorrowStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  dueDate === tomorrowStr
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-[#f5f5f7] text-[#6e6e73] hover:text-[#1d1d1f] border border-black/[0.04]'
                }`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setDueDate(in3DaysStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  dueDate === in3DaysStr
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-[#f5f5f7] text-[#6e6e73] hover:text-[#1d1d1f] border border-black/[0.04]'
                }`}
              >
                In 3 Days
              </button>
              <button
                type="button"
                onClick={() => setDueDate(nextWeekStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  dueDate === nextWeekStr
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-[#f5f5f7] text-[#6e6e73] hover:text-[#1d1d1f] border border-black/[0.04]'
                }`}
              >
                Next Week
              </button>
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate('')}
                  className="px-2 py-1 text-xs text-[#8d8d93] hover:text-red-500 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Custom Date & Time Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06] text-xs font-medium text-[#1d1d1f] focus:outline-none focus:border-violet-500 focus:bg-white transition-all cursor-pointer"
                />
              </div>

              {!isAllDay ? (
                <div className="relative">
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    placeholder="Set time"
                    className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06] text-xs font-medium text-[#1d1d1f] focus:outline-none focus:border-violet-500 focus:bg-white transition-all cursor-pointer"
                  />
                </div>
              ) : (
                <div className="flex items-center px-3 py-2 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-700">
                  <Sun className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                  <span>All-day task (no specific time)</span>
                </div>
              )}
            </div>

            {/* Recurrence & Repeat From */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="relative">
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as RecurrencePattern)}
                  className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06] text-xs font-medium text-[#1d1d1f] focus:outline-none focus:border-violet-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="none">No Repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekdays">Every Weekday (Mon-Fri)</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {recurrence !== 'none' && (
                <div className="relative">
                  <select
                    value={repeatFrom}
                    onChange={(e) => setRepeatFrom(e.target.value as 'due_date' | 'completion_date')}
                    className="w-full px-3 py-2 rounded-xl bg-violet-50 border border-violet-200 text-xs font-medium text-violet-800 focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
                  >
                    <option value="due_date">Repeat from: Due Date</option>
                    <option value="completion_date">Repeat from: Completion Date</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* ── Subtasks / Checklist Builder ── */}
          <div className="p-4 rounded-2xl bg-[#fbfbfd] border border-black/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] flex items-center space-x-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-violet-600" />
                <span>Checklist &amp; Subtasks ({subtasks.length})</span>
              </label>
              <span className="text-[10px] text-[#8d8d93]">Press Enter to add multiple</span>
            </div>

            {/* Subtask list */}
            {subtasks.length > 0 && (
              <div className="space-y-1.5">
                {subtasks.map((st, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white border border-black/[0.06] text-xs text-[#1d1d1f] shadow-sm animate-in fade-in"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      <span className="truncate">{st}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(index)}
                      className="text-[#8d8d93] hover:text-red-500 p-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input to add subtask */}
            <form onSubmit={handleAddSubtask} className="flex items-center space-x-2">
              <input
                type="text"
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                placeholder="Add checklist item..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] text-xs text-[#1d1d1f] placeholder:text-[#8d8d93] focus:outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                disabled={!newSubtaskInput.trim()}
                className="px-3 py-1.5 rounded-xl bg-[#f5f5f7] hover:bg-violet-600 hover:text-white disabled:opacity-40 text-xs font-semibold text-[#1d1d1f] border border-black/[0.06] transition-colors"
              >
                Add
              </button>
            </form>
          </div>

          {/* ── Tags Input ── */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-600" />
              <span>Tags</span>
            </label>

            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-[#f5f5f7] border border-black/[0.06]">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-800 border border-cyan-500/30 text-[11px] font-medium"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-red-600 ml-1"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? "Type tag name and press Enter..." : "Add tag..."}
                className="flex-1 min-w-[120px] bg-transparent text-xs text-[#1d1d1f] placeholder:text-[#8d8d93] focus:outline-none px-1"
              />
            </div>
          </div>

          {/* ── Collapsible: Notes & Markdown ── */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center space-x-2 text-xs font-semibold text-violet-600 hover:text-violet-700"
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>{showNotes ? 'Hide Description & Notes' : '+ Add Description / Markdown Notes'}</span>
            </button>

            {showNotes && (
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write additional details, instructions or markdown..."
                className="w-full p-3 rounded-2xl bg-[#f5f5f7] border border-black/[0.06] text-xs text-[#1d1d1f] placeholder:text-[#8d8d93] focus:outline-none focus:border-violet-500 focus:bg-white resize-y font-mono animate-in fade-in"
              />
            )}
          </div>

          {/* ── Collapsible: Finance OS Linkage ── */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowFinance(!showFinance)}
              className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{showFinance ? 'Hide Finance OS Link' : '+ Link with Finance OS (Expected Cost & Budget)'}</span>
            </button>

            {showFinance && (
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-500/20 animate-in fade-in">
                <div>
                  <label className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
                    Expected Cost ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={expectedCost}
                    onChange={(e) => setExpectedCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-emerald-300/80 text-xs text-[#1d1d1f] font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
                    Budget Category
                  </label>
                  <select
                    value={budgetCategory}
                    onChange={(e) => setBudgetCategory(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-emerald-300/80 text-xs text-[#1d1d1f] focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Unassigned</option>
                    {BUDGET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Action Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.02] shrink-0">
          <div className="hidden sm:flex items-center space-x-2 text-[11px] text-[#8d8d93]">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.08] text-[10px] font-mono shadow-sm">
                ⌘/Ctrl + ↵
              </kbd>
              <span>to save</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!title.trim() || createTaskMutation.isPending}
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-full bg-[#4772FA] hover:bg-blue-600 disabled:opacity-40 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(71,114,250,0.35)] active:scale-95 transition-all flex items-center space-x-1.5"
            >
              <span>{createTaskMutation.isPending ? 'Creating...' : 'Create Task'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
