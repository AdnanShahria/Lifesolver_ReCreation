import React, { useState } from 'react';
import {
  Circle,
  CheckCircle2,
  Check,
  Calendar,
  Clock,
  CheckSquare,
  Tag,
  Pin,
  Trash2,
  Play,
  ChevronDown,
  ChevronRight,
  Flag,
  Wallet,
  AlertCircle,
  Sparkles,
  Ban,
  BellRing,
  Sun,
  Repeat
} from 'lucide-react';
import type { Task, PriorityLevel } from '../types';
import {
  useToggleTaskComplete,
  useDeleteTask,
  useUpdateTask,
  useSetTaskWontDo,
  useTaskLists,
  formatDueDateLabel,
  getIsoDate
} from '../hooks/usePlanner';

interface TaskListViewProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onStartFocus?: (task: Task) => void;
  onOpenCreateTask?: () => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
  onStartFocus,
  onOpenCreateTask
}) => {
  const { data: lists = [] } = useTaskLists();
  const toggleCompleteMutation = useToggleTaskComplete();
  const deleteTaskMutation = useDeleteTask();
  const updateTaskMutation = useUpdateTask();
  const setWontDoMutation = useSetTaskWontDo();

  const [completedCollapsed, setCompletedCollapsed] = useState(true);
  const [wontDoCollapsed, setWontDoCollapsed] = useState(true);

  const todayStr = getIsoDate(0);
  const tomorrowStr = getIsoDate(1);

  // Group tasks into sections
  const overdueTasks: Task[] = [];
  const todayTasks: Task[] = [];
  const tomorrowTasks: Task[] = [];
  const upcomingTasks: Task[] = [];
  const completedTasks: Task[] = [];
  const wontDoTasks: Task[] = [];

  tasks.forEach((task) => {
    if (task.wontDo || task.status === 'wont_do') {
      wontDoTasks.push(task);
      return;
    }

    if (task.completed) {
      completedTasks.push(task);
      return;
    }

    if (!task.dueDate) {
      upcomingTasks.push(task);
    } else if (task.dueDate < todayStr) {
      overdueTasks.push(task);
    } else if (task.dueDate === todayStr) {
      todayTasks.push(task);
    } else if (task.dueDate === tomorrowStr) {
      tomorrowTasks.push(task);
    } else {
      upcomingTasks.push(task);
    }
  });

  const getPriorityStyle = (priority: PriorityLevel) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return {
          leftBar: 'border-l-[#E03131]',
          badge: 'text-[#E03131] bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50',
          circleRing: 'border-[#E03131] hover:bg-red-50/40',
          completedBg: 'bg-[#E03131]',
          dot: 'bg-[#E03131]'
        };
      case 'medium':
        return {
          leftBar: 'border-l-[#FFB000]',
          badge: 'text-[#D97706] bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50',
          circleRing: 'border-[#FFB000] hover:bg-amber-50/40',
          completedBg: 'bg-[#FFB000]',
          dot: 'bg-[#FFB000]'
        };
      case 'low':
        return {
          leftBar: 'border-l-[#4772FA]',
          badge: 'text-[#4772FA] bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50',
          circleRing: 'border-[#4772FA] hover:bg-blue-50/40',
          completedBg: 'bg-[#4772FA]',
          dot: 'bg-[#4772FA]'
        };
      case 'none':
      default:
        return {
          leftBar: 'border-l-transparent',
          badge: 'text-gray-500 bg-gray-50 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
          circleRing: 'border-gray-300 dark:border-zinc-600 hover:border-gray-400',
          completedBg: 'bg-[#4772FA]',
          dot: 'bg-gray-400'
        };
    }
  };

  const renderTaskCard = (task: Task) => {
    const isSelected = selectedTaskId === task.id;
    const isWontDo = task.wontDo || task.status === 'wont_do';
    const prioStyle = getPriorityStyle(task.priority);
    const dateMeta = formatDueDateLabel(task.dueDate);
    const completedSubtasks = (task.subtasks || []).filter((s) => s.completed).length;
    const totalSubtasks = (task.subtasks || []).length;
    const taskList = lists.find((l) => l.id === task.listId);

    return (
      <div
        key={task.id}
        onClick={() => onSelectTask(task.id)}
        className={`group relative flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer transition-all duration-150 select-none border-l-[3.5px] font-sans ${prioStyle.leftBar} ${
          isSelected
            ? 'bg-blue-50/70 dark:bg-blue-950/30 border-t border-r border-b border-[#4772FA]/30 shadow-sm ring-1 ring-[#4772FA]/30'
            : isWontDo
            ? 'bg-slate-50/60 dark:bg-zinc-900/40 border-t border-r border-b border-black/[0.04] opacity-50 hover:opacity-85'
            : task.completed
            ? 'bg-white/60 dark:bg-zinc-900/30 border-t border-r border-b border-black/[0.04] dark:border-white/[0.04] opacity-60 hover:opacity-90'
            : 'bg-white dark:bg-zinc-900 border-t border-r border-b border-black/[0.05] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-black/[0.1] dark:hover:border-white/[0.12]'
        }`}
      >
        {/* Left: Circular Priority Checkbox + Title + Metadata */}
        <div className="flex items-start space-x-3 min-w-0 flex-1 pr-3">
          {/* TickTick Circular Priority Checkbox */}
          <button
            type="button"
            title={
              isWontDo
                ? "Won't Do (Click to Re-open)"
                : task.completed
                ? 'Mark incomplete'
                : 'Mark complete'
            }
            onClick={(e) => {
              e.stopPropagation();
              if (isWontDo) {
                setWontDoMutation.mutate({ taskId: task.id, wontDo: false });
              } else {
                toggleCompleteMutation.mutate(task.id);
              }
            }}
            className="mt-0.5 w-5 h-5 flex items-center justify-center shrink-0 transition-transform active:scale-90"
          >
            {isWontDo ? (
              <div className="w-[18px] h-[18px] rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-slate-500">
                <Ban className="w-2.5 h-2.5" />
              </div>
            ) : task.completed ? (
              <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center ${prioStyle.completedBg} text-white shadow-xs`}>
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            ) : (
              <div
                className={`w-[18px] h-[18px] rounded-full border-[1.8px] transition-colors ${prioStyle.circleRing}`}
              />
            )}
          </button>

          {/* Details */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center space-x-2">
              <span
                className={`text-[14px] leading-snug font-medium tracking-tight truncate ${
                  isWontDo
                    ? 'line-through italic text-slate-400 dark:text-zinc-500'
                    : task.completed
                    ? 'line-through text-gray-400 dark:text-zinc-500'
                    : 'text-gray-900 dark:text-gray-100 group-hover:text-[#4772FA] transition-colors'
                }`}
              >
                {task.title}
              </span>

              {task.isPinned && (
                <Pin className="w-3 h-3 text-[#4772FA] fill-[#4772FA]/30 shrink-0" />
              )}
            </div>

            {/* Note description snippet if exists */}
            {task.notes && !task.completed && !isWontDo && (
              <p className="text-xs text-gray-500 dark:text-zinc-400 truncate line-clamp-1">
                {task.notes}
              </p>
            )}

            {/* Badges / Chips Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
              {/* Won't Do Badge */}
              {isWontDo && (
                <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-zinc-700">
                  <Ban className="w-2.5 h-2.5 text-slate-500" />
                  <span>Won&apos;t Do</span>
                </span>
              )}

              {/* Annoying Alert Badge */}
              {task.annoyingAlert && (
                <span
                  title="Persistent Annoying Alert enabled"
                  className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/40 text-[#E03131] border border-red-200 dark:border-red-900/50 animate-pulse"
                >
                  <BellRing className="w-2.5 h-2.5 text-[#E03131]" />
                  <span>Persistent</span>
                </span>
              )}

              {/* All-Day Task Badge */}
              {task.isAllDay && (
                <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                  <Sun className="w-2.5 h-2.5 text-amber-600" />
                  <span>All-day</span>
                </span>
              )}

              {/* Due Date chip (TickTick color-coded) */}
              {task.dueDate && (
                <span
                  className={`inline-flex items-center space-x-1 text-[11px] font-medium ${
                    dateMeta.isOverdue
                      ? 'text-[#E03131] font-semibold'
                      : dateMeta.isToday
                      ? 'text-[#4772FA] font-semibold'
                      : 'text-gray-500 dark:text-zinc-400'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>{dateMeta.label}</span>
                  {task.dueTime && (
                    <span className="flex items-center space-x-0.5 ml-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{task.dueTime}</span>
                    </span>
                  )}
                </span>
              )}

              {/* Recurrence repeat loop icon */}
              {task.recurrence && task.recurrence !== 'none' && (
                <span
                  title={`Repeats: ${task.recurrence}`}
                  className="text-[#4772FA] inline-flex items-center"
                >
                  <Repeat className="w-3 h-3" />
                </span>
              )}

              {/* Subtask count */}
              {totalSubtasks > 0 && (
                <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[11px] font-mono text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800">
                  <CheckSquare className="w-3 h-3 text-[#4772FA]" />
                  <span>
                    {completedSubtasks}/{totalSubtasks}
                  </span>
                </span>
              )}

              {/* Tags */}
              {(task.tags || []).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center text-[11px] text-[#4772FA] hover:underline"
                >
                  #{t}
                </span>
              ))}

              {/* Project / List indicator on the right */}
              {taskList && (
                <span className="inline-flex items-center space-x-1.5 text-[11px] text-gray-400 dark:text-zinc-500 ml-auto">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: taskList.color }}
                  />
                  <span>{taskList.name}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Action buttons (TickTick hover action bar) */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Won't Do Toggle (TickTick Abandon) */}
          <button
            type="button"
            title={isWontDo ? "Re-open task" : "Won't Do (Abandon)"}
            onClick={(e) => {
              e.stopPropagation();
              setWontDoMutation.mutate({
                taskId: task.id,
                wontDo: !isWontDo
              });
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              isWontDo
                ? 'text-slate-600 bg-slate-100 dark:bg-zinc-800'
                : 'text-gray-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
          </button>

          {/* Focus Timer trigger */}
          <button
            type="button"
            title="Start Focus Session"
            onClick={(e) => {
              e.stopPropagation();
              if (onStartFocus) onStartFocus(task);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#4772FA] hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Pin */}
          <button
            type="button"
            title={task.isPinned ? 'Unpin task' : 'Pin task'}
            onClick={(e) => {
              e.stopPropagation();
              updateTaskMutation.mutate({
                taskId: task.id,
                data: { isPinned: !task.isPinned }
              });
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              task.isPinned
                ? 'text-[#4772FA] bg-blue-50 dark:bg-blue-950/40'
                : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.04]'
            }`}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>

          {/* Delete Task */}
          <button
            type="button"
            title="Delete task"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Delete task "${task.title}"?`)) {
                deleteTaskMutation.mutate(task.id);
              }
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#E03131] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  const renderSection = (
    title: string,
    taskList: Task[],
    headerIcon?: React.ReactNode,
    badgeColor = 'bg-[#f5f5f7] text-[#6e6e73]'
  ) => {
    if (taskList.length === 0) return null;

    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#6e6e73]">
            {headerIcon}
            <span>{title}</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${badgeColor}`}>
            {taskList.length}
          </span>
        </div>

        <div className="space-y-2">{taskList.map(renderTaskCard)}</div>
      </div>
    );
  };

  const totalActive =
    overdueTasks.length + todayTasks.length + tomorrowTasks.length + upcomingTasks.length;

  return (
    <div className="space-y-6">
      {/* ── Empty State ── */}
      {totalActive === 0 && completedTasks.length === 0 && (
        <div className="text-center py-20 px-6 apple-card-glass rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-violet-500/10 border border-violet-500/20 mx-auto flex items-center justify-center text-violet-600 shadow-sm ring-4 ring-violet-500/5">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="text-base font-bold text-[#1d1d1f] dark:text-zinc-100">All Clear in this View</div>
            <p className="text-xs text-[#8d8d93] max-w-sm mx-auto">
              You are completely caught up! Add a new task above or launch the fast-creation modal.
            </p>
          </div>
          {onOpenCreateTask && (
            <button
              type="button"
              onClick={onOpenCreateTask}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-[0_4px_14px_rgba(124,58,237,0.35),inset_0_1px_1px_rgba(255,255,255,0.35)] transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create New Task</span>
            </button>
          )}
        </div>
      )}

      {/* ── Overdue Section ── */}
      {renderSection(
        'Overdue',
        overdueTasks,
        <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
        'bg-red-100 text-red-700 border border-red-200'
      )}

      {/* ── Today Section ── */}
      {renderSection(
        'Today',
        todayTasks,
        <Calendar className="w-3.5 h-3.5 text-violet-600" />,
        'bg-violet-100 text-violet-700 border border-violet-200'
      )}

      {/* ── Tomorrow Section ── */}
      {renderSection(
        'Tomorrow',
        tomorrowTasks,
        <Clock className="w-3.5 h-3.5 text-cyan-600" />
      )}

      {/* ── Upcoming & Someday Section ── */}
      {renderSection(
        'Upcoming',
        upcomingTasks,
        <Clock className="w-3.5 h-3.5 text-[#8d8d93]" />
      )}

      {/* ── Collapsible Completed Section ── */}
      {completedTasks.length > 0 && (
        <div className="pt-4 border-t border-black/[0.06] space-y-3">
          <button
            type="button"
            onClick={() => setCompletedCollapsed(!completedCollapsed)}
            className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#8d8d93] hover:text-[#1d1d1f] transition-colors"
          >
            {completedCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span>Completed</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#f5f5f7] text-[#6e6e73]">
              {completedTasks.length}
            </span>
          </button>

          {!completedCollapsed && (
            <div className="space-y-2">{completedTasks.map(renderTaskCard)}</div>
          )}
        </div>
      )}

      {/* ── Collapsible Won't Do Section (TickTick Abandoned) ── */}
      {wontDoTasks.length > 0 && (
        <div className="pt-4 border-t border-black/[0.06] space-y-3">
          <button
            type="button"
            onClick={() => setWontDoCollapsed(!wontDoCollapsed)}
            className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
          >
            {wontDoCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <Ban className="w-3.5 h-3.5 text-slate-500" />
            <span>Won&apos;t Do</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-600">
              {wontDoTasks.length}
            </span>
          </button>

          {!wontDoCollapsed && (
            <div className="space-y-2">{wontDoTasks.map(renderTaskCard)}</div>
          )}
        </div>
      )}
    </div>
  );
};