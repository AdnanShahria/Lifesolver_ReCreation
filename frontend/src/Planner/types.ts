export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';

export type ViewMode = 'list' | 'kanban' | 'matrix';

export type SmartView = 'inbox' | 'today' | 'tomorrow' | '7days' | 'matrix' | 'all';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type RecurrencePattern = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  completed: boolean;
  priority: PriorityLevel;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  listId?: string;
  tags: string[];
  isPinned?: boolean;
  status: TaskStatus;
  columnId?: string;
  subtasks: Subtask[];
  recurrence?: RecurrencePattern;
  expectedCost?: number;
  budgetCategory?: string;
  createdAt: string;
  updatedAt?: string;
  quadrant?: 'q1' | 'q2' | 'q3' | 'q4';
}

export interface TaskList {
  id: string;
  name: string;
  color: string;
  icon?: string;
  folderId?: string;
  taskCount?: number;
}

export interface TaskFolder {
  id: string;
  name: string;
  isCollapsed?: boolean;
}

export interface TaskColumn {
  id: string;
  title: string;
  status: TaskStatus;
}

export interface PlannerStats {
  inboxCount: number;
  todayCount: number;
  tomorrowCount: number;
  next7DaysCount: number;
  allCount: number;
  overdueCount: number;
  completedCount: number;
}

export interface CreateTaskInput {
  title: string;
  priority?: PriorityLevel;
  dueDate?: string;
  dueTime?: string;
  listId?: string;
  tags?: string[];
  notes?: string;
  status?: TaskStatus;
  completed?: boolean;
  expectedCost?: number;
  budgetCategory?: string;
  recurrence?: RecurrencePattern;
  subtasks?: Array<{ title: string; completed?: boolean; dueDate?: string } | string>;
}

export interface BatchTaskActionInput {
  taskIds: string[];
  action: 'complete' | 'uncomplete' | 'delete' | 'reschedule' | 'set_priority' | 'move_list';
  data?: {
    dueDate?: string;
    listId?: string;
    priority?: PriorityLevel;
  };
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  completed?: boolean;
  isPinned?: boolean;
}
