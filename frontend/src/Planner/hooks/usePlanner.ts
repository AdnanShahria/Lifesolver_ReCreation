import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../_core/api';
import type {
  Task,
  TaskList,
  TaskFolder,
  Subtask,
  SmartView,
  CreateTaskInput,
  UpdateTaskInput,
  PlannerStats
} from '../types';

// ── Date Helpers ─────────────────────────────────────────────────
export function getIsoDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export function formatDueDateLabel(dateStr?: string): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
} {
  if (!dateStr) return { label: 'No date', isOverdue: false, isToday: false, isTomorrow: false };

  const today = getIsoDate(0);
  const tomorrow = getIsoDate(1);
  const yesterday = getIsoDate(-1);

  if (dateStr === today) {
    return { label: 'Today', isOverdue: false, isToday: true, isTomorrow: false };
  }
  if (dateStr === tomorrow) {
    return { label: 'Tomorrow', isOverdue: false, isToday: false, isTomorrow: true };
  }
  if (dateStr === yesterday) {
    return { label: 'Yesterday', isOverdue: true, isToday: false, isTomorrow: false };
  }
  if (dateStr < today) {
    return { label: dateStr, isOverdue: true, isToday: false, isTomorrow: false };
  }

  // Format month and day (e.g. Nov 4)
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return {
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isOverdue: false,
        isToday: false,
        isTomorrow: false
      };
    }
  } catch {
    // fallback
  }

  return { label: dateStr, isOverdue: false, isToday: false, isTomorrow: false };
}

// ── Data Normalizers ─────────────────────────────────────────────
export function normalizeTask(t: any): Task {
  let parsedTags: string[] = [];
  if (Array.isArray(t.tags)) {
    parsedTags = t.tags;
  } else if (typeof t.labels === 'string') {
    try {
      parsedTags = JSON.parse(t.labels);
    } catch {
      parsedTags = t.labels.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  const rawSubtasks = Array.isArray(t.subtasks) ? t.subtasks : [];
  const normalizedSubtasks: Subtask[] = rawSubtasks.map((st: any) => ({
    id: st.id,
    taskId: st.taskId || t.id,
    title: st.title || '',
    completed: st.completed !== undefined ? Boolean(st.completed) : st.isCompleted === 1,
    dueDate: st.dueDate || undefined,
    createdAt: st.createdAt || new Date().toISOString()
  }));

  const isCompleted = t.completed !== undefined ? Boolean(t.completed) : t.status === 'done';

  return {
    id: t.id,
    title: t.title || '',
    description: t.description || t.notes || '',
    notes: t.notes || t.description || '',
    completed: isCompleted,
    status: t.status || (isCompleted ? 'done' : 'todo'),
    priority: t.priority || 'medium',
    dueDate: t.dueDate ? String(t.dueDate).slice(0, 10) : undefined,
    dueTime: t.dueTime || t.startTime || undefined,
    listId: t.listId || undefined,
    columnId: t.columnId || undefined,
    tags: parsedTags,
    isPinned: Boolean(t.isPinned),
    subtasks: normalizedSubtasks,
    recurrence: t.recurrence || t.recurrenceRule || 'none',
    expectedCost: typeof t.expectedCost === 'number' ? t.expectedCost : 0,
    budgetCategory: t.budgetCategory || t.financeType || undefined,
    createdAt: t.createdAt || new Date().toISOString(),
    updatedAt: t.updatedAt || undefined
  };
}

// ── Planner Stats Calculation ────────────────────────────────────
export function calculatePlannerStats(tasks: Task[]): PlannerStats {
  const today = getIsoDate(0);
  const tomorrow = getIsoDate(1);
  const in7Days = getIsoDate(7);

  let inboxCount = 0;
  let todayCount = 0;
  let tomorrowCount = 0;
  let next7DaysCount = 0;
  let overdueCount = 0;
  let completedCount = 0;

  for (const t of tasks) {
    if (t.completed) {
      completedCount++;
      continue;
    }

    if (!t.listId && !t.dueDate) {
      inboxCount++;
    }

    if (t.dueDate) {
      if (t.dueDate < today) {
        overdueCount++;
      } else if (t.dueDate === today) {
        todayCount++;
      } else if (t.dueDate === tomorrow) {
        tomorrowCount++;
      }

      if (t.dueDate >= today && t.dueDate <= in7Days) {
        next7DaysCount++;
      }
    }
  }

  return {
    inboxCount,
    todayCount,
    tomorrowCount,
    next7DaysCount,
    allCount: tasks.filter((t) => !t.completed).length,
    overdueCount,
    completedCount
  };
}

// ── Query Hooks (Backed by Cloudflare D1 & Hono) ──────────────────

export function useTasks(filter?: {
  smartView?: SmartView;
  listId?: string;
  tag?: string;
  search?: string;
  quadrant?: 'q1' | 'q2' | 'q3' | 'q4';
}) {
  return useQuery({
    queryKey: ['planner', 'tasks', filter],
    queryFn: async (): Promise<Task[]> => {
      const params = new URLSearchParams();

      if (filter?.search && filter.search.trim()) {
        params.set('search', filter.search.trim());
      }

      if (filter?.listId) {
        params.set('listId', filter.listId);
      }

      if (filter?.smartView) {
        switch (filter.smartView) {
          case 'inbox':
            params.set('listId', 'inbox');
            break;
          case 'today':
            params.set('dueDate', 'today');
            break;
          case 'tomorrow':
            params.set('dueDate', 'tomorrow');
            break;
          case '7days':
            params.set('dueDate', '7days');
            break;
          case 'all':
          case 'matrix':
          default:
            break;
        }
      }

      const qs = params.toString();
      const endpoint = `/api/planner/tasks${qs ? `?${qs}` : ''}`;
      const res = await api.get<{ tasks?: any[]; total?: number }>(endpoint);
      const rawTasks = Array.isArray(res?.tasks) ? res.tasks : [];
      let tasks = rawTasks.map(normalizeTask);

      // Client-side tag filtering
      if (filter?.tag) {
        const cleanTag = filter.tag.replace(/^#/, '').toLowerCase();
        tasks = tasks.filter((t) => t.tags.some((tg) => tg.toLowerCase() === cleanTag));
      }

      // Client-side quadrant filtering for Eisenhower matrix
      if (filter?.quadrant) {
        tasks = tasks.filter((t) => {
          if (filter.quadrant === 'q1') return t.priority === 'urgent';
          if (filter.quadrant === 'q2') return t.priority === 'high';
          if (filter.quadrant === 'q3') return t.priority === 'medium';
          if (filter.quadrant === 'q4') return t.priority === 'low';
          return true;
        });
      }

      return tasks;
    },
    staleTime: 1000 * 5
  });
}

export function useTaskLists() {
  return useQuery({
    queryKey: ['planner', 'lists'],
    queryFn: async (): Promise<TaskList[]> => {
      const res = await api.get<{
        lists?: any[];
        folders?: any[];
        smartCounts?: any;
        inboxId?: string | null;
      }>('/api/planner/lists');

      const rawLists = Array.isArray(res?.lists) ? res.lists : [];
      return rawLists.map((l: any) => ({
        id: l.id,
        name: l.name,
        color: l.color || '#8b5cf6',
        icon: l.icon || 'List',
        folderId: l.folderId || undefined,
        taskCount: l.activeCount ?? l.totalCount ?? 0
      }));
    },
    staleTime: 1000 * 10
  });
}

export function useTaskFolders() {
  return useQuery({
    queryKey: ['planner', 'folders'],
    queryFn: async (): Promise<TaskFolder[]> => {
      const res = await api.get<{
        lists?: any[];
        folders?: any[];
        smartCounts?: any;
      }>('/api/planner/lists');

      const rawFolders = Array.isArray(res?.folders) ? res.folders : [];
      return rawFolders.map((f: any) => ({
        id: f.id,
        name: f.name,
        isCollapsed: Boolean(f.isCollapsed)
      }));
    },
    staleTime: 1000 * 10
  });
}

export function usePlannerStats() {
  return useQuery({
    queryKey: ['planner', 'stats'],
    queryFn: async (): Promise<PlannerStats> => {
      const res = await api.get<{
        smartCounts?: {
          today?: number;
          tomorrow?: number;
          next7Days?: number;
          all?: number;
          inbox?: number;
          completed?: number;
        };
      }>('/api/planner/lists');

      const sc = res?.smartCounts;
      if (sc) {
        return {
          inboxCount: Number(sc.inbox || 0),
          todayCount: Number(sc.today || 0),
          tomorrowCount: Number(sc.tomorrow || 0),
          next7DaysCount: Number(sc.next7Days || 0),
          allCount: Number(sc.all || 0),
          overdueCount: 0,
          completedCount: Number(sc.completed || 0)
        };
      }

      return {
        inboxCount: 0,
        todayCount: 0,
        tomorrowCount: 0,
        next7DaysCount: 0,
        allCount: 0,
        overdueCount: 0,
        completedCount: 0
      };
    },
    staleTime: 1000 * 5
  });
}

// ── Task Mutations (Real D1 Database Persistence) ─────────────────

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput): Promise<Task> => {
      const payload: any = {
        title: input.title,
        priority: input.priority || 'medium',
        dueDate: input.dueDate || null,
        dueTime: input.dueTime || null,
        listId: input.listId || null,
        tags: input.tags || [],
        notes: input.notes || '',
        status: input.status || (input.completed ? 'done' : 'todo'),
        recurrence: input.recurrence || 'none',
        expectedCost: input.expectedCost || 0,
        budgetCategory: input.budgetCategory || null,
        subtasks: input.subtasks || []
      };

      const res = await api.post<{ task: any }>('/api/planner/tasks', payload);
      return normalizeTask(res.task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner'] });
    }
  });
}

export function useBatchTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      taskIds: string[];
      action: 'complete' | 'uncomplete' | 'delete' | 'reschedule' | 'set_priority' | 'move_list';
      data?: { dueDate?: string; listId?: string; priority?: string };
    }) => {
      return await api.post<{ success: boolean; count: number }>('/api/planner/tasks/batch', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner'] });
    }
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: UpdateTaskInput }): Promise<Task> => {
      const payload: any = { ...data };
      if (data.status === 'done' || data.completed === true) {
        payload.status = 'done';
        payload.completed = true;
      } else if (data.status === 'todo' || data.status === 'in_progress' || data.completed === false) {
        payload.status = data.status || 'todo';
        payload.completed = false;
      }

      const res = await api.put<{ task: any }>(`/api/planner/tasks/${taskId}`, payload);
      return normalizeTask(res.task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner'] });
    }
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string): Promise<string> => {
      await api.delete(`/api/planner/tasks/${taskId}`);
      return taskId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner'] });
    }
  });
}

export function useToggleTaskComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string): Promise<Task> => {
      const res = await api.patch<{ task: any }>(`/api/planner/tasks/${taskId}/status`, {});
      return normalizeTask(res.task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner'] });
    }
  });
}

// ── Subtask Mutations ─────────────────────────────────────────────

export function useAddSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      title,
      dueDate
    }: {
      taskId: string;
      title: string;
      dueDate?: string;
    }): Promise<Subtask> => {
      const res = await api.post<{ subtask: any }>(`/api/planner/tasks/${taskId}/subtasks`, {
        title,
        dueDate: dueDate || null
      });

      const st = res.subtask;
      return {
        id: st.id,
        taskId: st.taskId || taskId,
        title: st.title,
        completed: st.isCompleted === 1 || Boolean(st.completed),
        dueDate: st.dueDate || undefined,
        createdAt: st.createdAt || new Date().toISOString()
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner'] });
    }
  });
}

export function useToggleSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      subtaskId,
      completed
    }: {
      taskId: string;
      subtaskId: string;
      completed?: boolean;
    }): Promise<void> => {
      const isCompletedVal = completed !== undefined ? (completed ? 1 : 0) : 1;
      await api.put(`/api/planner/tasks/subtasks/${subtaskId}`, {
        isCompleted: isCompletedVal
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner'] });
    }
  });
}

export function useDeleteSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      subtaskId
    }: {
      taskId: string;
      subtaskId: string;
    }): Promise<void> => {
      await api.delete(`/api/planner/tasks/subtasks/${subtaskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner'] });
    }
  });
}

// ── List & Folder Mutations ───────────────────────────────────────

export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      color,
      folderId
    }: {
      name: string;
      color: string;
      folderId?: string;
    }): Promise<TaskList> => {
      const res = await api.post<{ list: any }>('/api/planner/lists', {
        name,
        color: color || '#8b5cf6',
        folderId: folderId || null
      });

      const l = res.list;
      return {
        id: l.id,
        name: l.name,
        color: l.color,
        icon: l.icon || 'List',
        folderId: l.folderId || undefined,
        taskCount: 0
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'lists'] });
    }
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listId: string): Promise<string> => {
      await api.delete(`/api/planner/lists/${listId}`);
      return listId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner'] });
    }
  });
}

export function useToggleFolderCollapse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (folderId: string): Promise<void> => {
      // Toggle folder locally and in state
      queryClient.setQueryData<TaskFolder[]>(['planner', 'folders'], (old) => {
        if (!old) return [];
        return old.map((f) => (f.id === folderId ? { ...f, isCollapsed: !f.isCollapsed } : f));
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'folders'] });
    }
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string): Promise<TaskFolder> => {
      const res = await api.post<{ folder: any }>('/api/planner/lists/folders', {
        name,
        isCollapsed: 0
      });

      const f = res.folder;
      return {
        id: f.id,
        name: f.name,
        isCollapsed: Boolean(f.isCollapsed)
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'folders'] });
    }
  });
}
