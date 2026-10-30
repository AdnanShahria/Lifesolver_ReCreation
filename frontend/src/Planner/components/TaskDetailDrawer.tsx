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
  Sparkles
} from 'lucide-react';
import type { Task, PriorityLevel, RecurrencePattern } from '../types';
import {
  useTaskLists,
  useUpdateTask,
  useDeleteTask,
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
    urgent: 'text-red-700 bg-red-50 border-red-200',
    high: 'text-amber-700 bg-amber-50 border-amber-200',
    medium: 'text-violet-700 bg-violet-50 border-violet-200',
    low: 'text-blue-700 bg-blue-50 border-blue-200'
  }[task.priority];

  const topStripColor = {
    urgent: 'bg-gradient-to-r from-red-500 to-rose-400',
    high: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    medium: 'bg-gradient-to-r from-violet-600 to-indigo-500',
    low: 'bg-gradient-to-r from-blue-500 to-cyan-400'
  }[task.priority];

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40 md:hidden"
      />

      {/* Drawer Container */}
      <aside
        className="fixed top-0 bottom-0 right-0 z-50 w-full sm:w-[440px] bg-white border-l border-black/[0.08] shadow-[0_0_50px_rgba(0,0,0,0.12)] flex flex-col transition-transform duration-300 animate-in slide-in-from-right font-sans"
      >
        {/* Priority Top Accent Strip */}
        <div className={`h-1 w-full ${topStripColor}`} />

        {/* ── Top App Bar ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.06] bg-white/80 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            {/* Circular Complete Button */}
            <button
              type="button"
              title={task.completed ? 'Mark incomplete' : 'Mark complete'}
              onClick={() => {
                updateTaskMutation.mutate({
                  taskId: task.id,
                  data: { completed: !task.completed }
                });
              }}
              className="text-[#8d8d93] hover:text-violet-600 p-1 transition-colors"
            >
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-violet-600 fill-violet-600/20" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-[#8d8d93]">
              Task Details
            </span>
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
                  value={task.dueTime || ''}
                  onChange={(e) => {
                    updateTaskMutation.mutate({
                      taskId: task.id,
                      data: { dueTime: e.target.value || undefined }
                    });
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-black/[0.08] text-xs font-medium text-[#1d1d1f] focus:outline-none focus:border-violet-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Recurrence Pattern */}
            <div className="pt-2 border-t border-black/[0.06] space-y-1">
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