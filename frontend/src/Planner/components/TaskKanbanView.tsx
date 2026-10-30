import React, { useState } from 'react';
import {
  Plus,
  Circle,
  CheckCircle2,
  Calendar,
  Clock,
  CheckSquare,
  Tag,
  Flag,
  Wallet,
  Play
} from 'lucide-react';
import type { Task, TaskStatus, PriorityLevel } from '../types';
import {
  useUpdateTask,
  useCreateTask,
  useToggleTaskComplete,
  formatDueDateLabel
} from '../hooks/usePlanner';

interface TaskKanbanViewProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onStartFocus?: (task: Task) => void;
  onOpenCreateTask?: (defaultStatus?: TaskStatus) => void;
}

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  dotColor: string;
}

const COLUMNS: ColumnConfig[] = [
  { id: 'todo', title: 'To Do', dotColor: 'bg-slate-400' },
  { id: 'in_progress', title: 'In Progress', dotColor: 'bg-sky-500' },
  { id: 'done', title: 'Done', dotColor: 'bg-emerald-500' }
];

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
  onStartFocus,
  onOpenCreateTask
}) => {
  const updateTaskMutation = useUpdateTask();
  const createTaskMutation = useCreateTask();
  const toggleCompleteMutation = useToggleTaskComplete();

  // Inline quick add per column
  const [addingInColumn, setAddingInColumn] = useState<TaskStatus | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const getPriorityStyle = (priority: PriorityLevel) => {
    switch (priority) {
      case 'urgent':
        return {
          border: 'border-l-red-500',
          badge: 'text-red-700 bg-red-50 border-red-200'
        };
      case 'high':
        return {
          border: 'border-l-amber-500',
          badge: 'text-amber-700 bg-amber-50 border-amber-200'
        };
      case 'medium':
        return {
          border: 'border-l-violet-500',
          badge: 'text-violet-700 bg-violet-50 border-violet-200'
        };
      case 'low':
      default:
        return {
          border: 'border-l-blue-400',
          badge: 'text-blue-700 bg-blue-50 border-blue-200'
        };
    }
  };

  const handleCreateInColumn = async (status: TaskStatus) => {
    if (!newCardTitle.trim()) {
      setAddingInColumn(null);
      return;
    }

    await createTaskMutation.mutateAsync({
      title: newCardTitle.trim(),
      status,
      completed: status === 'done',
      priority: 'medium'
    });

    setNewCardTitle('');
    setAddingInColumn(null);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDragOverColumn(null);
    setDraggedTaskId(null);

    if (taskId) {
      updateTaskMutation.mutate({
        taskId,
        data: {
          status: targetStatus,
          completed: targetStatus === 'done'
        }
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start font-sans">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => {
          if (col.id === 'done') return t.completed || t.status === 'done';
          if (col.id === 'in_progress') return !t.completed && t.status === 'in_progress';
          return !t.completed && (t.status === 'todo' || !t.status);
        });

        const isOver = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col rounded-3xl p-4 transition-all min-h-[550px] ${
              isOver
                ? 'bg-violet-50/60 border-2 border-dashed border-violet-400 shadow-lg'
                : 'bg-[#f5f5f7] border border-black/[0.06]'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 py-1.5 mb-3">
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor} ring-1 ring-black/[0.08]`} />
                <h3 className="text-xs font-bold tracking-wider uppercase text-[#1d1d1f]">
                  {col.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white text-[#6e6e73] shadow-xs border border-black/[0.04]">
                  {columnTasks.length}
                </span>
              </div>

              <button
                type="button"
                title={`Add card to ${col.title}`}
                onClick={() => {
                  if (onOpenCreateTask) {
                    onOpenCreateTask(col.id);
                  } else {
                    setAddingInColumn(col.id);
                    setNewCardTitle('');
                  }
                }}
                className="p-1 rounded-lg text-[#8d8d93] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Add Form in Column */}
            {addingInColumn === col.id && (
              <div className="mb-3 p-3 rounded-2xl bg-white border border-violet-300 shadow-md space-y-2 animate-in fade-in">
                <textarea
                  autoFocus
                  rows={2}
                  placeholder={`What needs to be done in ${col.title}?`}
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCreateInColumn(col.id);
                    }
                  }}
                  className="w-full bg-[#f5f5f7] border border-black/[0.06] rounded-xl p-2.5 text-xs text-[#1d1d1f] placeholder:text-[#8d8d93] focus:outline-none focus:border-violet-500 focus:bg-white resize-none"
                />
                <div className="flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setAddingInColumn(null)}
                    className="px-2.5 py-1 text-xs text-[#6e6e73] hover:text-[#1d1d1f]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateInColumn(col.id)}
                    className="px-3 py-1 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg shadow-sm"
                  >
                    Add Card
                  </button>
                </div>
              </div>
            )}

            {/* Task Cards */}
            <div className="flex-1 space-y-2.5 overflow-y-auto">
              {columnTasks.map((task) => {
                const isSelected = selectedTaskId === task.id;
                const prioStyle = getPriorityStyle(task.priority);
                const dateMeta = formatDueDateLabel(task.dueDate);
                const completedSubtasks = (task.subtasks || []).filter((s) => s.completed).length;
                const totalSubtasks = (task.subtasks || []).length;

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onSelectTask(task.id)}
                    className={`group relative p-3.5 rounded-2xl border-l-4 cursor-grab active:cursor-grabbing transition-all select-none ${prioStyle.border} ${
                      isSelected
                        ? 'bg-violet-50/70 border-t border-r border-b border-violet-300 shadow-md ring-2 ring-violet-500/20'
                        : task.completed
                        ? 'bg-white/60 border-t border-r border-b border-black/[0.04] opacity-70 hover:opacity-100'
                        : 'bg-white border-t border-r border-b border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Header: Title + Check */}
                    <div className="flex items-start space-x-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompleteMutation.mutate(task.id);
                        }}
                        className="mt-0.5 text-[#8d8d93] hover:text-violet-600 shrink-0 transition-colors"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-violet-600 fill-violet-600/20" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-xs font-semibold leading-snug line-clamp-2 ${
                            task.completed ? 'line-through text-[#8d8d93]' : 'text-[#1d1d1f]'
                          }`}
                        >
                          {task.title}
                        </h4>
                      </div>
                    </div>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-black/[0.04] text-[10px]">
                      {/* Priority */}
                      <span className={`px-1.5 py-0.5 rounded font-bold uppercase border ${prioStyle.badge}`}>
                        {task.priority}
                      </span>

                      {/* Due date */}
                      {task.dueDate && (
                        <span
                          className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded border ${
                            dateMeta.isOverdue
                              ? 'bg-red-50 text-red-600 border-red-200 font-semibold'
                              : 'bg-[#f5f5f7] text-[#6e6e73] border-black/[0.04]'
                          }`}
                        >
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{dateMeta.label}</span>
                        </span>
                      )}

                      {/* Subtasks */}
                      {totalSubtasks > 0 && (
                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-[#f5f5f7] text-[#6e6e73] border border-black/[0.04]">
                          <CheckSquare className="w-2.5 h-2.5 text-violet-600" />
                          <span>
                            {completedSubtasks}/{totalSubtasks}
                          </span>
                        </span>
                      )}

                      {/* Expected Cost */}
                      {task.expectedCost !== undefined && task.expectedCost > 0 && (
                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Wallet className="w-2.5 h-2.5" />
                          <span>${task.expectedCost}</span>
                        </span>
                      )}

                      {/* Tags */}
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

                    {/* Status quick mover bar */}
                    <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-[#8d8d93]">
                      <div className="flex items-center space-x-1">
                        {col.id !== 'todo' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskMutation.mutate({
                                taskId: task.id,
                                data: { status: 'todo', completed: false }
                              });
                            }}
                            className="px-1.5 py-0.5 rounded-md hover:bg-black/[0.04] hover:text-[#1d1d1f] font-medium"
                          >
                            To Do
                          </button>
                        )}
                        {col.id !== 'in_progress' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskMutation.mutate({
                                taskId: task.id,
                                data: { status: 'in_progress', completed: false }
                              });
                            }}
                            className="px-1.5 py-0.5 rounded-md hover:bg-sky-50 hover:text-sky-700 font-medium"
                          >
                            In Progress
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskMutation.mutate({
                                taskId: task.id,
                                data: { status: 'done', completed: true }
                              });
                            }}
                            className="px-1.5 py-0.5 rounded-md hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                          >
                            Done
                          </button>
                        )}
                      </div>

                      {onStartFocus && !task.completed && (
                        <button
                          type="button"
                          title="Start Focus"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartFocus(task);
                          }}
                          className="p-1 rounded-lg text-[#8d8d93] hover:text-violet-600 hover:bg-violet-50 transition-colors"
                        >
                          <Play className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {columnTasks.length === 0 && (
                <div className="py-12 text-center text-xs text-[#8d8d93] border border-dashed border-black/[0.08] rounded-2xl bg-white/40">
                  Drop cards here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};