export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export type ViewMode = 'list' | 'kanban' | 'matrix';

export type SmartView = 'inbox' | 'today' | 'tomorrow' | '7days' | 'matrix' | 'wont_do' | 'completed' | 'all';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'wont_do' | 'archived';

export type TaskKind = 'TEXT' | 'CHECKLIST' | 'NOTE';

export type RecurrencePattern = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom';

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  reminderTime?: string;
  snoozeReminderTime?: string;
  timeZone?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  completed: boolean;
  wontDo?: boolean;
  priority: PriorityLevel;
  kind?: TaskKind;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  isAllDay?: boolean;
  timeZone?: string;
  annoyingAlert?: boolean;
  listId?: string;
  tags: string[];
  isPinned?: boolean;
  isFloating?: boolean;
  progress?: number;
  status: TaskStatus;
  columnId?: string;
  parentTaskId?: string;
  subtasks: Subtask[];
  recurrence?: RecurrencePattern;
  recurrenceRule?: string;
  repeatFrom?: 'due_date' | 'completion_date';
  reminderTime?: string;
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
  wontDoCount?: number;
}

export interface CreateTaskInput {
  title: string;
  priority?: PriorityLevel;
  kind?: TaskKind;
  dueDate?: string;
  dueTime?: string;
  isAllDay?: boolean;
  timeZone?: string;
  annoyingAlert?: boolean;
  listId?: string;
  columnId?: string;
  parentTaskId?: string;
  tags?: string[];
  notes?: string;
  status?: TaskStatus;
  completed?: boolean;
  expectedCost?: number;
  budgetCategory?: string;
  recurrence?: RecurrencePattern;
  recurrenceRule?: string;
  repeatFrom?: 'due_date' | 'completion_date';
  reminderTime?: string;
  isPinned?: boolean;
  subtasks?: Array<{
    title: string;
    completed?: boolean;
    dueDate?: string;
    reminderTime?: string;
    snoozeReminderTime?: string;
    timeZone?: string;
  } | string>;
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
