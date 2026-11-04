import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  X,
  Pin,
  Trash2,
  Calendar,
  Clock,
  Flag,
  Folder,
  Tag,
  Repeat,
  Wallet,
  Play,
  CheckSquare,
  FileText,
  Plus,
  Circle,
  CheckCircle2,
  Check,
  Sparkles,
  Ban,
  BellRing,
  Sun
} from 'lucide-react';
import type { Task, PriorityLevel, RecurrencePattern, TaskKind } from '../types';
import {
  useTaskLists,
  useUpdateTask,
  useDeleteTask,
  useSetTaskWontDo,
  useAddSubtask,
  useToggleSubtask,
  useDeleteSubtask,
  getIsoDate
} from '../hooks/usePlanner';

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStartFocus?: (task: Task) => void;
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

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onStartFocus
}) => {
  const { data: lists = [] } = useTaskLists();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const setTaskWontDoMutation = useSetTaskWontDo();
  const addSubtaskMutation = useAddSubtask();
  const toggleSubtaskMutation = useToggleSubtask();
  const deleteSubtaskMutation = useDeleteSubtask();

  // Local editable states
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [editorMode, setEditorMode] = useState<'checklist' | 'markdown'>('checklist');
  const [isMarkdownPreview, setIsMarkdownPreview] = useState(false);

  // New subtask input
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Sync state when selected task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setNotes(task.notes || '');
      if (task.subtasks && task.subtasks.length > 0) {
        setEditorMode('checklist');
      } else if (task.notes && task.notes.trim()) {
        setEditorMode('markdown');
      }
    }
  }, [task?.id]);

  if (!isOpen || !task) return null;

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      updateTaskMutation.mutate({
        taskId: task.id,
        data: { title: title.trim() }
      });
    }
  };

  const handleNotesBlur = () => {
    if (notes !== task.notes) {
      updateTaskMutation.mutate({
        taskId: task.id,
        data: { notes }
      });
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    await addSubtaskMutation.mutateAsync({
      taskId: task.id,
      title: newSubtaskTitle.trim()
    });

    setNewSubtaskTitle('');
  };

  const subtasks = task.subtasks || [];
  const completedCount = subtasks.filter((s) => s.completed).length;
  const progressPercent =
    subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const priorityColors = {
    urgent: 'text-[#E03131] bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-900/50',
    high: 'text-[#E03131] bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-900/50',
    medium: 'text-[#D97706] bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/50',
    low: 'text-[#4772FA] bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/50',
    none: 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-zinc-800 dark:border-zinc-700'
  }[task.priority] || 'text-gray-600 bg-gray-50 border-gray-200';

  const prioRingColor = {
    urgent: 'border-[#E03131]',
    high: 'border-[#E03131]',
    medium: 'border-[#FFB000]',
    low: 'border-[#4772FA]',
    none: 'border-gray-300 dark:border-zinc-600'
  }[task.priority] || 'border-gray-300';

  const topStripColor = {
    urgent: 'bg-[#E03131]',
    high: 'bg-[#E03131]',
    medium: 'bg-[#FFB000]',
    low: 'bg-[#4772FA]',
    none: 'bg-gray-300'
  }[task.priority] || 'bg-gray-300';

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40 md:hidden"
      />

      {/* Drawer Container */}
      <aside
        className="fixed top-0 bottom-0 right-0 z-50 w-full sm:w-[440px] bg-white dark:bg-[#1f2024] border-l border-gray-200 dark:border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.12)] flex flex-col transition-transform duration-300 animate-in slide-in-from-right font-sans"
      >
        {/* Priority Top Accent Strip */}
        <div className={`h-1 w-full ${topStripColor}`} />

        {/* ── Top App Bar ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#1f2024]">
          <div className="flex items-center space-x-2">
            {/* TickTick Circular Complete Button */}
            <button
              type="button"
              title={task.completed ? 'Mark incomplete' : 'Mark complete'}
              onClick={() => {
                updateTaskMutation.mutate({
                  taskId: task.id,
                  data: { completed: !task.completed }
                });
              }}
              className="p-1 transition-transform active:scale-90"
            >
              {task.completed ? (
                <div className="w-5 h-5 rounded-full bg-[#4772FA] text-white flex items-center justify-center shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : (
                <div className={`w-5 h-5 rounded-full border-2 ${prioRingColor}`} />
              )}
            </button>

            {/* Won't Do Button (TickTick Abandon/Reopen action) */}
            <button
              type="button"
              title={task.wontDo ? 'Reopen task' : "Mark as Won't Do (Abandon)"}
              onClick={() => {
                setTaskWontDoMutation.mutate({
                  taskId: task.id,
                  wontDo: !task.wontDo
                });
              }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                task.wontDo
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-300 shadow-2xs'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-transparent'
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{task.wontDo ? "Won't Do" : "Won't Do"}</span>
            </button>
          </div>

          <div className="flex items-center space-x-1">
            {/* Start Focus / Pomodoro */}
            <button
              type="button"
              title="Start Focus Session"
              onClick={() => {
                if (onStartFocus) onStartFocus(task);
              }}
              className="p-2 rounded-xl text-[#6e6e73] hover:text-violet-600 hover:bg-violet-50 transition-colors"
            >
              <Play className="w-4 h-4" />
            </button>

            {/* Pin Toggle */}
            <button
              type="button"
              title={task.isPinned ? 'Unpin task' : 'Pin task'}
              onClick={() => {
                updateTaskMutation.mutate({
                  taskId: task.id,
                  data: { isPinned: !task.isPinned }
                });
              }}
              className={`p-2 rounded-xl transition-colors ${
                task.isPinned
                  ? 'text-cyan-600 bg-cyan-50'
                  : 'text-[#8d8d93] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
              }`}
            >
              <Pin className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              type="button"
              title="Delete task"
              onClick={() => {
                if (window.confirm(`Delete task "${task.title}"?`)) {
                  deleteTaskMutation.mutate(task.id);
                  onClose();
                }
              }}
              className="p-2 rounded-xl text-[#8d8d93] hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#8d8d93] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-white/70">
          {/* Editable Title */}
          <div>
            <textarea
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Task Title..."
              className={`w-full bg-transparent text-lg sm:text-xl font-bold tracking-tight text-[#1d1d1f] placeholder:text-[#8d8d93] focus:outline-none resize-none leading-snug ${
                task.completed ? 'line-through text-[#8d8d93]' : ''
              }`}
            />
          </div>

          {/* ── Metadata Matrix (Priority, List, Due Date, Recurrence) ── */}
          <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.06] space-y-3">
            {/* Priority & List Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Priority */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#6e6e73] tracking-wider flex items-center space-x-1">
                  <Flag className="w-3 h-3 text-violet-600" />
                  <span>Priority</span>
                </label>
                <select
                  value={task.priority}
                  onChange={(e) => {
                    updateTaskMutation.mutate({
                      taskId: task.id,
                      data: { priority: e.target.value as PriorityLevel }
                    });
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-semibold capitalize focus:outline-none cursor-pointer ${priorityColors}`}
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="none">None</option>
                </select>
              </div>

              {/* List */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#6e6e73] tracking-wider flex items-center space-x-1">
                  <Folder className="w-3 h-3 text-indigo-600" />
                  <span>List / Project</span>
                </label>
                <select
                  value={task.listId || ''}
                  onChange={(e) => {
                    updateTaskMutation.mutate({
                      taskId: task.id,
                      data: { listId: e.target.value || undefined }
                    });
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-black/[0.08] text-xs font-medium text-[#1d1d1f] focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="">Inbox (No List)</option>
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-black/[0.06]">
              {/* Due Date */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#6e6e73] tracking-wider flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-violet-600" />
                  <span>Due Date</span>
                </label>
                <input
                  type="date"
                  value={task.dueDate || ''}
                  onChange={(e) => {
                    updateTaskMutation.mutate({
                      taskId: task.id,
                      data: { dueDate: e.target.value || undefined }
                    });
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-black/[0.08] text-xs font-medium text-[#1d1d1f] focus:outline-none focus:border-violet-500 cursor-pointer"
                />
              </div>

              {/* Due Time */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#6e6e73] tracking-wider flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Due Time</span>
                </label>
                <input
                  type="time"
                  disabled={Boolean(task.isAllDay)}
                  value={task.isAllDay ? '' : (task.dueTime || '')}
                  onChange={(e) => {
                    updateTaskMutation.mutate({
                      taskId: task.id,
                      data: { dueTime: e.target.value || undefined }
                    });
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-medium text-[#1d1d1f] focus:outline-none focus:border-violet-500 cursor-pointer ${
                    task.isAllDay ? 'bg-black/[0.04] text-[#8d8d93] border-transparent' : 'bg-white border-black/[0.08]'
                  }`}
                />
              </div>
            </div>

            {/* Quick Snooze Pills */}
            {task.dueDate && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-[#8d8d93] font-semibold">Snooze:</span>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    now.setMinutes(now.getMinutes() + 15);
                    const hh = String(now.getHours()).padStart(2, '0');
                    const mm = String(now.getMinutes()).padStart(2, '0');
                    updateTaskMutation.mutate({
                      taskId: task.id,
                      data: { dueDate: getIsoDate(0), dueTime: `${hh}:${mm}` }
                    });
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white border border-black/[0.08] text-[10px] text-[#6e6e73] hover:text-violet-600 hover:border-violet-300 font-medium transition-colors"
                >
                  +15m
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    now.setHours(now.getHours() + 1);
                    const hh = String(now.getHours()).padStart(2, '0');
                    const mm = String(now.getMinutes()).padStart(2, '0');
                    updateTaskMutation.mutate({
                      taskId: task.id,
                      data: { dueDate: getIsoDate(0), dueTime: `${hh}:${mm}` }
                    });
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white border border-black/[0.08] text-[10px] text-[#6e6e73] hover:text-violet-600 hover:border-violet-300 font-medium transition-colors"
                >
                  +1h
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    now.setHours(now.getHours() + 3);
                    const hh = String(now.getHours()).padStart(2, '0');
                    const mm = String(now.getMinutes()).padStart(2, '0');
                    updateTaskMutation.mutate({
                      taskId: task.id,
                      data: { dueDate: getIsoDate(0), dueTime: `${hh}:${mm}` }
                    });
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white border border-black/[0.08] text-[10px] text-[#6e6e73] hover:text-violet-600 hover:border-violet-300 font-medium transition-colors"
                >
                  +3h
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateTaskMutation.mutate({
                      taskId: task.id,
                      data: { dueDate: getIsoDate(1), dueTime: task.dueTime || '09:00' }
                    });
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white border border-black/[0.08] text-[10px] text-[#6e6e73] hover:text-violet-600 hover:border-violet-300 font-medium transition-colors"
                >
                  Tomorrow
                </button>
              </div>
            )}

            {/* All-Day and Annoying Alert Switches */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-black/[0.06]">
              <label className="flex items-center space-x-2 text-xs text-[#1d1d1f] font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(task.isAllDay)}
                  onChange={(e) => {
                    updateTaskMutation.mutate({
                      taskId: task.id,
                      data: { isAllDay: e.target.checked }
                    });
                  }}
                  className="rounded text-violet-600 focus:ring-violet-500"
                />
                <span className="flex items-center space-x-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>All-Day Task</span>
                </span>
              </label>

              <label
                title="When reminded, alarm rings continuously for 1 min and repeats every 2 min until handled"
                className="flex items-center space-x-2 text-xs text-[#1d1d1f] font-medium cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={Boolean(task.annoyingAlert)}
                  onChange={(e) => {
                    updateTaskMutation.mutate({
                      taskId: task.id,
                      data: { annoyingAlert: e.target.checked }
                    });
                  }}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="flex items-center space-x-1">
                  <BellRing
                    className={`w-3.5 h-3.5 ${
                      task.annoyingAlert ? 'text-rose-600 animate-pulse' : 'text-[#8d8d93]'
                    }`}
                  />
                  <span className={task.annoyingAlert ? 'text-rose-700 font-bold' : ''}>
                    Annoying Alert
                  </span>
                </span>
              </label>
            </div>

            {/* Recurrence Pattern */}
            <div className="pt-2 border-t border-black/[0.06] space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-[#6e6e73] tracking-wider flex items-center space-x-1">
                <Repeat className="w-3 h-3 text-violet-600" />
                <span>Recurrence</span>
              </label>
              <select
                value={task.recurrence || 'none'}
                onChange={(e) => {
                  updateTaskMutation.mutate({
                    taskId: task.id,
                    data: { recurrence: e.target.value as RecurrencePattern }
                  });
                }}
                className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-black/[0.08] text-xs font-medium text-[#1d1d1f] focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekdays">Every weekday (Mon - Fri)</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>

              {/* Repeat From Selector (TickTick Feature) */}
              {task.recurrence && task.recurrence !== 'none' && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[10px] uppercase font-bold text-[#6e6e73]">Repeat From:</span>
                  <div className="inline-flex rounded-lg bg-black/[0.04] p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        updateTaskMutation.mutate({
                          taskId: task.id,
                          data: { repeatFrom: 'due_date' }
                        });
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                        task.repeatFrom !== 'completion_date'
                          ? 'bg-white text-[#1d1d1f] shadow-xs'
                          : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                      }`}
                    >
                      Due Date
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateTaskMutation.mutate({
                          taskId: task.id,
                          data: { repeatFrom: 'completion_date' }
                        });
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                        task.repeatFrom === 'completion_date'
                          ? 'bg-white text-[#1d1d1f] shadow-xs'
                          : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                      }`}
                    >
                      Completion Date
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Finance OS Link ── */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-500/20 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Finance OS Integration</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Expected Cost */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-emerald-800">
                  Expected Cost ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={task.expectedCost || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    updateTaskMutation.mutate({
                      taskId: task.id,
                      data: { expectedCost: isNaN(val) ? 0 : val }
                    });
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs font-mono text-[#1d1d1f] focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Budget Category */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-emerald-800">
                  Budget Category
                </label>
                <select
                  value={task.budgetCategory || ''}
                  onChange={(e) => {
                    updateTaskMutation.mutate({
                      taskId: task.id,
                      data: { budgetCategory: e.target.value }
                    });
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs text-[#1d1d1f] focus:outline-none focus:border-emerald-500 cursor-pointer"
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
          </div>

          {/* ── Mode Switcher: Subtasks Checklist vs Markdown Note ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-2">
              <div className="flex items-center space-x-1 bg-[#f5f5f7] p-1 rounded-xl border border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setEditorMode('checklist')}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    editorMode === 'checklist'
                      ? 'bg-white text-[#1d1d1f] shadow-sm'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5 text-violet-600" />
                  <span>Subtasks ({subtasks.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('markdown')}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    editorMode === 'markdown'
                      ? 'bg-white text-[#1d1d1f] shadow-sm'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-violet-600" />
                  <span>Notes</span>
                </button>
              </div>

              {editorMode === 'markdown' && (
                <button
                  type="button"
                  onClick={() => setIsMarkdownPreview(!isMarkdownPreview)}
                  className="text-xs text-violet-600 hover:text-violet-700 font-semibold"
                >
                  {isMarkdownPreview ? 'Edit' : 'Preview'}
                </button>
              )}
            </div>

            {/* Checklist View */}
            {editorMode === 'checklist' && (
              <div className="space-y-3">
                {/* Progress bar */}
                {subtasks.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#6e6e73] font-mono">
                      <span>Progress</span>
                      <span>
                        {completedCount} of {subtasks.length} ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#f5f5f7] rounded-full overflow-hidden border border-black/[0.04]">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-300 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Subtask list */}
                <div className="space-y-1.5">
                  {subtasks.map((st) => (
                    <div
                      key={st.id}
                      className="group flex items-center justify-between p-2.5 rounded-xl bg-[#f5f5f7] border border-black/[0.04] hover:bg-white hover:border-black/[0.08] hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => {
                            toggleSubtaskMutation.mutate({
                              taskId: task.id,
                              subtaskId: st.id
                            });
                          }}
                          className="text-[#8d8d93] hover:text-violet-600 shrink-0 transition-colors"
                        >
                          {st.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-violet-600 fill-violet-600/20" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <span
                          className={`text-xs truncate ${
                            st.completed ? 'line-through text-[#8d8d93]' : 'text-[#1d1d1f] font-medium'
                          }`}
                        >
                          {st.title}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          deleteSubtaskMutation.mutate({
                            taskId: task.id,
                            subtaskId: st.id
                          });
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#8d8d93] hover:text-red-600 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Subtask Form */}
                <form onSubmit={handleAddSubtask} className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add a subtask..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#f5f5f7] border border-black/[0.06] text-xs text-[#1d1d1f] placeholder:text-[#8d8d93] focus:outline-none focus:border-violet-500 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={!newSubtaskTitle.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-xs text-white font-semibold shadow-sm transition-colors"
                  >
                    Add
                  </button>
                </form>
              </div>
            )}

            {/* Markdown Notes View */}
            {editorMode === 'markdown' && (
              <div>
                {isMarkdownPreview ? (
                  <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.06] min-h-[160px] text-xs text-[#1d1d1f] prose prose-sm max-w-none">
                    {notes ? (
                      <ReactMarkdown>{notes}</ReactMarkdown>
                    ) : (
                      <span className="text-[#8d8d93] italic">No notes written yet</span>
                    )}
                  </div>
                ) : (
                  <textarea
                    rows={8}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={handleNotesBlur}
                    placeholder="Type notes here... Supports # headers, - lists, `code`, **bold**"
                    className="w-full p-3.5 rounded-2xl bg-[#f5f5f7] border border-black/[0.06] text-xs text-[#1d1d1f] font-mono placeholder:text-[#8d8d93] focus:outline-none focus:border-violet-500 focus:bg-white resize-y leading-relaxed"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Action Toolbar ── */}
        <div className="p-4 border-t border-black/[0.06] bg-[#f5f5f7]/90 flex items-center justify-between">
          <div className="text-[11px] text-[#8d8d93]">
            Created {new Date(task.createdAt).toLocaleDateString()}
          </div>

          <button
            type="button"
            onClick={() => {
              if (onStartFocus) onStartFocus(task);
            }}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs flex items-center space-x-2 shadow-md shadow-violet-600/20 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Start Focus Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};