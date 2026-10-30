import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Users,
  Archive,
  Plus,
  Circle,
  CheckCircle2,
  Clock,
  CheckSquare,
  Tag,
  ArrowRight
} from 'lucide-react';
import type { Task, PriorityLevel } from '../types';
import {
  useToggleTaskComplete,
  useCreateTask,
  formatDueDateLabel
} from '../hooks/usePlanner';

interface EisenhowerMatrixViewProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onStartFocus?: (task: Task) => void;
  onOpenCreateTask?: (defaultPriority?: PriorityLevel) => void;
}

interface QuadrantConfig {
  id: 'q1' | 'q2' | 'q3' | 'q4';
  title: string;
  subtitle: string;
  actionLabel: string;
  priority: PriorityLevel;
  icon: React.ElementType;
  borderColor: string;
  bgColor: string;
  badgeColor: string;
  accentColor: string;
  iconBg: string;
}

const QUADRANTS: QuadrantConfig[] = [
  {
    id: 'q1',
    title: 'Urgent & Important',
    subtitle: 'Crises, deadlines, pressing issues',
    actionLabel: 'Do First',
    priority: 'urgent',
    icon: AlertTriangle,
    borderColor: 'border-red-200/80 hover:border-red-300',
    bgColor: 'bg-red-50/25',
    badgeColor: 'text-red-700 bg-red-100 border-red-200 font-bold',
    accentColor: 'text-red-600',
    iconBg: 'bg-red-100 text-red-600'
  },
  {
    id: 'q2',
    title: 'Not Urgent & Important',
    subtitle: 'Planning, strategy, long-term focus',
    actionLabel: 'Schedule',
    priority: 'high',
    icon: Calendar,
    borderColor: 'border-amber-200/80 hover:border-amber-300',
    bgColor: 'bg-amber-50/25',
    badgeColor: 'text-amber-700 bg-amber-100 border-amber-200 font-bold',
    accentColor: 'text-amber-600',
    iconBg: 'bg-amber-100 text-amber-600'
  },
  {
    id: 'q3',
    title: 'Urgent & Not Important',
    subtitle: 'Interruptions, busywork, delegations',
    actionLabel: 'Delegate',
    priority: 'medium',
    icon: Users,
    borderColor: 'border-violet-200/80 hover:border-violet-300',
    bgColor: 'bg-violet-50/25',
    badgeColor: 'text-violet-700 bg-violet-100 border-violet-200 font-bold',
    accentColor: 'text-violet-600',
    iconBg: 'bg-violet-100 text-violet-600'
  },
  {
    id: 'q4',
    title: 'Not Urgent & Not Important',
    subtitle: 'Distractions, trivial tasks, time wasters',
    actionLabel: 'Eliminate',
    priority: 'low',
    icon: Archive,
    borderColor: 'border-blue-200/80 hover:border-blue-300',
    bgColor: 'bg-blue-50/20',
    badgeColor: 'text-blue-700 bg-blue-100 border-blue-200 font-bold',
    accentColor: 'text-blue-600',
    iconBg: 'bg-blue-100 text-blue-600'
  }
];

export const EisenhowerMatrixView: React.FC<EisenhowerMatrixViewProps> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
  onStartFocus,
  onOpenCreateTask
}) => {
  const toggleCompleteMutation = useToggleTaskComplete();
  const createTaskMutation = useCreateTask();

  const [activeAddQuadrant, setActiveAddQuadrant] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState('');

  const handleCreateInQuadrant = async (priority: PriorityLevel) => {
    if (!quickTitle.trim()) {
      setActiveAddQuadrant(null);
      return;
    }

    await createTaskMutation.mutateAsync({
      title: quickTitle.trim(),
      priority,
      status: 'todo'
    });

    setQuickTitle('');
    setActiveAddQuadrant(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start font-sans">
      {QUADRANTS.map((quad) => {
        const quadTasks = tasks.filter((t) => !t.completed && t.priority === quad.priority);
        const Icon = quad.icon;
        const isAdding = activeAddQuadrant === quad.id;

        return (
          <div
            key={quad.id}
            className={`flex flex-col rounded-3xl p-5 border transition-all min-h-[420px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] ${quad.borderColor} ${quad.bgColor} backdrop-blur-sm`}
          >
            {/* Quadrant Header */}
            <div className="flex items-start justify-between pb-3.5 border-b border-black/[0.06]">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-2xl ${quad.iconBg} shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1d1d1f] flex items-center space-x-2">
                      <span>{quad.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${quad.badgeColor}`}>
                        {quad.actionLabel}
                      </span>
                    </h3>
                  </div>
                </div>
                <p className="text-[11px] text-[#6e6e73] pl-10 font-medium">{quad.subtitle}</p>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-white text-[#1d1d1f] border border-black/[0.06] shadow-xs">
                  {quadTasks.length}
                </span>
                <button
                  type="button"
                  title={`Add to ${quad.actionLabel}`}
                  onClick={() => {
                    if (onOpenCreateTask) {
                      onOpenCreateTask(quad.priority);
                    } else {
                      setActiveAddQuadrant(quad.id);
                      setQuickTitle('');
                    }
                  }}
                  className="p-1.5 rounded-xl bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] border border-black/[0.06] shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Add input in quadrant */}
            {isAdding && (
              <div className="mt-3 p-3 rounded-2xl bg-white border border-violet-300 shadow-md space-y-2 animate-in fade-in">
                <input
                  type="text"
                  autoFocus
                  placeholder={`Add a task to ${quad.actionLabel}...`}
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateInQuadrant(quad.priority);
                    }
                  }}
                  className="w-full bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 py-2 text-xs text-[#1d1d1f] placeholder:text-[#8d8d93] focus:outline-none focus:border-violet-500 focus:bg-white"
                />
                <div className="flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setActiveAddQuadrant(null)}
                    className="px-2.5 py-1 text-xs text-[#6e6e73] hover:text-[#1d1d1f]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateInQuadrant(quad.priority)}
                    className="px-3 py-1 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg shadow-sm flex items-center space-x-1"
                  >
                    <span>Add</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Tasks list */}
            <div className="flex-1 space-y-2 mt-3.5 overflow-y-auto">
              {quadTasks.map((task) => {
                const isSelected = selectedTaskId === task.id;
                const dateMeta = formatDueDateLabel(task.dueDate);
                const completedSubtasks = (task.subtasks || []).filter((s) => s.completed).length;
                const totalSubtasks = (task.subtasks || []).length;

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task.id)}
                    className={`group flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all select-none ${
                      isSelected
                        ? 'bg-violet-50 border-2 border-violet-400 shadow-sm ring-2 ring-violet-500/20'
                        : 'bg-white border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Left: Checkbox + Title */}
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompleteMutation.mutate(task.id);
                        }}
                        className="text-[#8d8d93] hover:text-violet-600 shrink-0 transition-colors"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-violet-600 fill-violet-600/20" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-[#1d1d1f] truncate block group-hover:text-violet-700 transition-colors">
                          {task.title}
                        </span>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px]">
                          {task.dueDate && (
                            <span
                              className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded border ${
                                dateMeta.isOverdue
                                  ? 'bg-red-50 text-red-600 border-red-200 font-semibold'
                                  : 'bg-[#f5f5f7] text-[#6e6e73] border-black/[0.04]'
                              }`}
                            >
                              <Clock className="w-2.5 h-2.5" />
                              <span>{dateMeta.label}</span>
                            </span>
                          )}

                          {totalSubtasks > 0 && (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-[#f5f5f7] text-[#6e6e73] border border-black/[0.04]">
                              <CheckSquare className="w-2.5 h-2.5 text-violet-600" />
                              <span>
                                {completedSubtasks}/{totalSubtasks}
                              </span>
                            </span>
                          )}

                          {(task.tags || []).slice(0, 2).map((tg) => (
                            <span
                              key={tg}
                              className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-full text-[#6e6e73] bg-[#f5f5f7] border border-black/[0.04]"
                            >
                              <Tag className="w-2 h-2 text-cyan-600" />
                              <span>#{tg}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {quadTasks.length === 0 && (
                <div className="py-14 text-center text-xs text-[#8d8d93] border border-dashed border-black/[0.08] rounded-2xl bg-white/40">
                  No active tasks in this quadrant
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};