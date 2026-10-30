import React, { useState } from 'react';
import {
  Circle,
  CheckCircle2,
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
  Sparkles
} from 'lucide-react';
import type { Task, PriorityLevel } from '../types';
import {
  useToggleTaskComplete,
  useDeleteTask,
  useUpdateTask,
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
  const toggleCompleteMutation = useToggleTaskComplete();
  const deleteTaskMutation = useDeleteTask();
  const updateTaskMutation = useUpdateTask();

  const [completedCollapsed, setCompletedCollapsed] = useState(true);

  const todayStr = getIsoDate(0);
  const tomorrowStr = getIsoDate(1);

  // Group tasks into sections
  const overdueTasks: Task[] = [];
  const todayTasks: Task[] = [];
  const tomorrowTasks: Task[] = [];
  const upcomingTasks: Task[] = [];
  const completedTasks: Task[] = [];

  tasks.forEach((task) => {
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
        return {
          leftBar: 'border-l-red-500',
          badge: 'text-red-700 bg-red-50 border-red-200',
          circleRing: 'border-red-400 text-red-500',
          dot: 'bg-red-500'
        };
      case 'high':
        return {
          leftBar: 'border-l-amber-500',
          badge: 'text-amber-700 bg-amber-50 border-amber-200',
          circleRing: 'border-amber-400 text-amber-500',
          dot: 'bg-amber-500'
        };
      case 'medium':
        return {
          leftBar: 'border-l-violet-500',
          badge: 'text-violet-700 bg-violet-50 border-violet-200',
          circleRing: 'border-violet-400 text-violet-500',
          dot: 'bg-violet-500'
        };
      case 'low':
      default:
        return {
          leftBar: 'border-l-blue-400',
          badge: 'text-blue-700 bg-blue-50 border-blue-200',
          circleRing: 'border-blue-300 text-blue-500',
          dot: 'bg-blue-400'
        };
    }
  };

  const renderTaskCard = (task: Task) => {
    const isSelected = selectedTaskId === task.id;
    const prioStyle = getPriorityStyle(task.priority);
    const dateMeta = formatDueDateLabel(task.dueDate);
    const completedSubtasks = (task.subtasks || []).filter((s) => s.completed).length;
    const totalSubtasks = (task.subtasks || []).length;

    return (
      <div
        key={task.id}
        onClick={() => onSelectTask(task.id)}
        className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 select-none border-l-4 font-sans ${prioStyle.leftBar} ${
          isSelected
            ? 'bg-violet-50/70 border-t border-r border-b border-violet-300 shadow-md shadow-violet-500/10 ring-2 ring-violet-500/20'
            : task.completed
            ? 'bg-[#fbfbfd] border-t border-r border-b border-black/[0.04] opacity-60 hover:opacity-90'
            : 'bg-white border-t border-r border-b border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5'
        }`}
      >
        {/* Left: Checkbox + Title + Metadata */}
        <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-3">
          {/* Circular completion button */}
          <button
            type="button"
            title={task.completed ? 'Mark incomplete' : 'Mark complete'}
            onClick={(e) => {
              e.stopPropagation();
              toggleCompleteMutation.mutate(task.id);
            }}
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90"
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-violet-600 fill-violet-600/20" />
            ) : (
              <Circle
                className={`w-5 h-5 transition-colors border-2 rounded-full ${prioStyle.circleRing}`}
              />
            )}
          </button>

          {/* Details */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center space-x-2">
              <span
                className={`text-sm font-semibold tracking-tight truncate ${
                  task.completed
                    ? 'line-through text-[#8d8d93]'
                    : 'text-[#1d1d1f] group-hover:text-violet-700 transition-colors'
                }`}
              >
                {task.title}
              </span>

              {task.isPinned && (
                <Pin className="w-3.5 h-3.5 text-cyan-600 fill-cyan-600/30 shrink-0" />
              )}
            </div>

            {/* Badges / Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {/* Priority flag badge */}
              <span
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${prioStyle.badge}`}
              >
                <Flag className="w-2.5 h-2.5" />
                <span>{task.priority}</span>
              </span>

              {/* Due Date badge */}
              {task.dueDate && (
                <span
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[11px] font-medium border ${
                    dateMeta.isOverdue
                      ? 'bg-red-50 text-red-600 border-red-200 font-semibold'
                      : dateMeta.isToday
                      ? 'bg-violet-50 text-violet-700 border-violet-200 font-semibold'
                      : 'bg-[#f5f5f7] text-[#6e6e73] border-black/[0.04]'
                  }`}
                >
                  <Calendar className="w-3 h-3 text-violet-600" />
                  <span>{dateMeta.label}</span>
                  {task.dueTime && (
                    <span className="flex items-center space-x-0.5 text-[#8d8d93] ml-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{task.dueTime}</span>
                    </span>
                  )}
                </span>
              )}

              {/* Subtask count */}
              {totalSubtasks > 0 && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[11px] font-mono bg-[#f5f5f7] text-[#6e6e73] border border-black/[0.04]">
                  <CheckSquare className="w-3 h-3 text-violet-600" />
                  <span>
                    {completedSubtasks}/{totalSubtasks}
                  </span>
                </span>
              )}

              {/* Expected Cost / Finance link */}
              {task.expectedCost !== undefined && task.expectedCost > 0 && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Wallet className="w-3 h-3 text-emerald-600" />
                  <span>${task.expectedCost}</span>
                </span>
              )}

              {/* Tags */}
              {(task.tags || []).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full text-[10px] text-[#6e6e73] bg-[#f5f5f7] border border-black/[0.04]"
                >
                  <Tag className="w-2.5 h-2.5 text-cyan-600" />
                  <span>#{t}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Focus Timer trigger */}
          <button
            type="button"
            title="Start Focus Session"
            onClick={(e) => {
              e.stopPropagation();
              if (onStartFocus) onStartFocus(task);
            }}
            className="p-2 rounded-xl text-[#6e6e73] hover:text-violet-600 hover:bg-violet-50 transition-colors"
          >
            <Play className="w-4 h-4" />
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
            className={`p-2 rounded-xl transition-colors ${
              task.isPinned
                ? 'text-cyan-600 bg-cyan-50'
                : 'text-[#8d8d93] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
            }`}
          >
            <Pin className="w-4 h-4" />
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
            className="p-2 rounded-xl text-[#8d8d93] hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
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
        <div className="text-center py-20 px-6 bg-white rounded-3xl border border-dashed border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-violet-500/10 border border-violet-500/20 mx-auto flex items-center justify-center text-violet-600 shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="text-base font-bold text-[#1d1d1f]">All Clear in this View</div>
            <p className="text-xs text-[#8d8d93] max-w-sm mx-auto">
              You are completely caught up! Add a new task above or launch the fast-creation modal.
            </p>
          </div>
          {onOpenCreateTask && (
            <button
              type="button"
              onClick={onOpenCreateTask}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/20 transition-all active:scale-95"
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
    </div>
  );
};