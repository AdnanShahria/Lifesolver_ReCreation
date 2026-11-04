import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc, asc, sql, ne, inArray, like } from 'drizzle-orm';
import { getDb } from '../_core/db';
import {
  tasksTable,
  taskListsTable,
  taskSubtasksTable,
  type Task,
  type TaskSubtask
} from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { authMiddleware } from '../_core/auth.middleware';
import { subscriptionMiddleware } from '../_core/subscription.middleware';
import type { Env, AppVariables } from '../types';

export const tasksRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

tasksRoute.use('*', authMiddleware, subscriptionMiddleware);

// ── Validation Schemas ──────────────────────────────
const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required'),
  description: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(), // Alias for description
  listId: z.string().optional().nullable(),
  columnId: z.string().optional().nullable(),
  parentTaskId: z.string().optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'done', 'wont_do', 'archived']).default('todo'),
  completed: z.boolean().optional(), // Alias for status
  priority: z.enum(['urgent', 'high', 'medium', 'low', 'none']).default('medium'),
  kind: z.enum(['TEXT', 'CHECKLIST', 'NOTE']).default('TEXT'),
  dueDate: z.string().optional().nullable(),
  startTime: z.string().optional().nullable(),
  dueTime: z.string().optional().nullable(), // Alias for startTime
  endTime: z.string().optional().nullable(),
  isAllDay: z.union([z.number().int().min(0).max(1), z.boolean()]).default(0),
  timeZone: z.string().optional().nullable(),
  annoyingAlert: z.union([z.number().int().min(0).max(1), z.boolean()]).default(0),
  estimatedDuration: z.number().int().min(0).optional().nullable(),
  actualDuration: z.number().int().min(0).optional().nullable(),
  recurrenceRule: z.string().optional().nullable(),
  recurrence: z.string().optional().nullable(), // Alias for recurrenceRule
  repeatFrom: z.enum(['due_date', 'completion_date']).default('due_date'),
  reminderTime: z.string().optional().nullable(),
  isPinned: z.union([z.number().int().min(0).max(1), z.boolean()]).default(0),
  isFloating: z.union([z.number().int().min(0).max(1), z.boolean()]).default(0),
  progress: z.number().int().min(0).max(100).default(0),
  labels: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(), // Alias for labels
  budgetId: z.string().optional().nullable(),
  expectedCost: z.number().optional().nullable(),
  financeType: z.string().optional().nullable(),
  budgetCategory: z.string().optional().nullable(), // Alias for financeType
  orderIndex: z.number().int().optional(),
  subtasks: z.array(z.union([
    z.string(),
    z.object({
      title: z.string().trim().min(1),
      isCompleted: z.union([z.boolean(), z.number()]).optional(),
      dueDate: z.string().optional().nullable(),
      reminderTime: z.string().optional().nullable(),
      snoozeReminderTime: z.string().optional().nullable(),
      timeZone: z.string().optional().nullable()
    })
  ])).optional().nullable()
});

const updateTaskSchema = createTaskSchema.partial();

const reorderTaskSchema = z.object({
  orderIndex: z.number().int(),
  columnId: z.string().optional().nullable(),
  listId: z.string().optional().nullable()
});

const statusUpdateSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done', 'wont_do', 'archived']).optional(),
  completed: z.boolean().optional()
});

// Helper for date calculations
function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function getTomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function getNext7DaysIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

// Format task for consistent API response
function formatTaskResponse(task: Task, subtasks: TaskSubtask[] = []) {
  const completedCount = subtasks.filter((s) => s.isCompleted === 1).length;
  let parsedTags: string[] = [];
  if (task.labels) {
    try {
      parsedTags = JSON.parse(task.labels);
    } catch {
      parsedTags = task.labels.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  const enrichedSubtasks = subtasks.map((st) => ({
    ...st,
    completed: st.isCompleted === 1
  }));

  return {
    ...task,
    completed: task.status === 'done',
    wontDo: task.status === 'wont_do',
    isAllDay: task.isAllDay === 1,
    annoyingAlert: task.annoyingAlert === 1,
    timeZone: task.timeZone || '',
    kind: task.kind || 'TEXT',
    notes: task.description || '',
    dueTime: task.startTime || '',
    tags: parsedTags,
    subtasks: enrichedSubtasks,
    subtaskCount: {
      total: subtasks.length,
      completed: completedCount
    }
  };
}

// ── GET / (List User Tasks with Filters) ────────────
tasksRoute.get('/', async (c) => {
  try {
    const userId = c.get('userId')!;
    const db = getDb(c.env);

    const listIdParam = c.req.query('listId');
    const statusParam = c.req.query('status'); // 'todo' | 'in_progress' | 'done' | 'all'
    const priorityParam = c.req.query('priority'); // 'urgent' | 'high' | 'medium' | 'low'
    const dueDateParam = c.req.query('dueDate'); // 'today' | 'tomorrow' | '7days' | 'overdue' | YYYY-MM-DD
    const columnIdParam = c.req.query('columnId');
    const searchParam = c.req.query('search');
    const isPinnedParam = c.req.query('isPinned');
    const parentTaskIdParam = c.req.query('parentTaskId');
    const limit = Math.min(parseInt(c.req.query('limit') || '100', 10), 200);

    const filters = [eq(tasksTable.userId, userId)];

    if (listIdParam) {
      if (listIdParam === 'inbox' || listIdParam === 'null') {
        filters.push(sql`(${tasksTable.listId} IS NULL OR ${tasksTable.listId} = 'inbox')`);
      } else {
        filters.push(eq(tasksTable.listId, listIdParam));
      }
    }

    if (statusParam && statusParam !== 'all') {
      filters.push(eq(tasksTable.status, statusParam));
    }

    if (priorityParam) {
      filters.push(eq(tasksTable.priority, priorityParam));
    }

    if (columnIdParam) {
      filters.push(eq(tasksTable.columnId, columnIdParam));
    }

    if (parentTaskIdParam !== undefined) {
      if (parentTaskIdParam === 'null' || parentTaskIdParam === '') {
        filters.push(sql`${tasksTable.parentTaskId} IS NULL`);
      } else {
        filters.push(eq(tasksTable.parentTaskId, parentTaskIdParam));
      }
    }

    if (isPinnedParam !== undefined) {
      const pinVal = isPinnedParam === 'true' || isPinnedParam === '1' ? 1 : 0;
      filters.push(eq(tasksTable.isPinned, pinVal));
    }

    if (searchParam) {
      filters.push(like(tasksTable.title, `%${searchParam}%`));
    }

    // Due date filter logic
    const todayStr = getTodayIso();
    if (dueDateParam) {
      if (dueDateParam === 'today') {
        filters.push(
          and(
            sql`${tasksTable.dueDate} IS NOT NULL`,
            sql`substr(${tasksTable.dueDate}, 1, 10) <= ${todayStr}`,
            ne(tasksTable.status, 'done'),
            ne(tasksTable.status, 'wont_do')
          )!
        );
      } else if (dueDateParam === 'tomorrow') {
        const tomorrowStr = getTomorrowIso();
        filters.push(sql`substr(${tasksTable.dueDate}, 1, 10) = ${tomorrowStr}`);
      } else if (dueDateParam === '7days' || dueDateParam === 'next7days') {
        const next7DaysStr = getNext7DaysIso();
        filters.push(
          and(
            sql`${tasksTable.dueDate} IS NOT NULL`,
            sql`substr(${tasksTable.dueDate}, 1, 10) >= ${todayStr}`,
            sql`substr(${tasksTable.dueDate}, 1, 10) <= ${next7DaysStr}`,
            ne(tasksTable.status, 'done'),
            ne(tasksTable.status, 'wont_do')
          )!
        );
      } else if (dueDateParam === 'overdue') {
        filters.push(
          and(
            sql`${tasksTable.dueDate} IS NOT NULL`,
            sql`substr(${tasksTable.dueDate}, 1, 10) < ${todayStr}`,
            ne(tasksTable.status, 'done'),
            ne(tasksTable.status, 'wont_do')
          )!
        );
      } else {
        // Specific date string
        filters.push(sql`substr(${tasksTable.dueDate}, 1, 10) = ${dueDateParam}`);
      }
    }

    const tasks = await db
      .select()
      .from(tasksTable)
      .where(and(...filters))
      .orderBy(
        desc(tasksTable.isPinned),
        asc(tasksTable.orderIndex),
        desc(tasksTable.createdAt)
      )
      .limit(limit);

    // Fetch and attach subtasks in one batch query
    let enrichedTasks: ReturnType<typeof formatTaskResponse>[] = [];
    if (tasks.length > 0) {
      const taskIds = tasks.map((t) => t.id);
      const subtasks = await db
        .select()
        .from(taskSubtasksTable)
        .where(inArray(taskSubtasksTable.taskId, taskIds))
        .orderBy(asc(taskSubtasksTable.orderIndex), asc(taskSubtasksTable.createdAt));

      const subtasksMap = new Map<string, TaskSubtask[]>();
      for (const st of subtasks) {
        if (!subtasksMap.has(st.taskId)) {
          subtasksMap.set(st.taskId, []);
        }
        subtasksMap.get(st.taskId)!.push(st);
      }

      enrichedTasks = tasks.map((t) => formatTaskResponse(t, subtasksMap.get(t.id) || []));
    }

    return jsonOk(c, {
      tasks: enrichedTasks,
      total: enrichedTasks.length
    });
  } catch (error: any) {
    console.error('Fetch tasks error:', error);
    return jsonError(c, error?.message || 'Failed to fetch tasks', 'FETCH_TASKS_ERROR', 500);
  }
});

// ── GET /:id (Get Single Task by ID) ────────────────
tasksRoute.get('/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const db = getDb(c.env);

    const task = await db
      .select()
      .from(tasksTable)
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
      .get();

    if (!task) {
      return jsonError(c, 'Task not found', 'NOT_FOUND', 404);
    }

    const subtasks = await db
      .select()
      .from(taskSubtasksTable)
      .where(eq(taskSubtasksTable.taskId, id))
      .orderBy(asc(taskSubtasksTable.orderIndex), asc(taskSubtasksTable.createdAt));

    return jsonOk(c, {
      task: formatTaskResponse(task, subtasks)
    });
  } catch (error: any) {
    console.error('Get task error:', error);
    return jsonError(c, error?.message || 'Failed to retrieve task', 'TASK_ERROR', 500);
  }
});

// ── POST / (Create Task) ────────────────────────────
tasksRoute.post('/', async (c) => {
  try {
    const userId = c.get('userId')!;
    const body = await c.req.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        c,
        parsed.error.issues[0]?.message || 'Invalid task input',
        'VALIDATION_ERROR',
        400
      );
    }

    const db = getDb(c.env);

    // 1. Subscription Tier Limit Check
    const userPlan = c.get('userPlan');
    if (userPlan && userPlan.limits.tasks !== -1) {
      const activeCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(tasksTable)
        .where(and(eq(tasksTable.userId, userId), ne(tasksTable.status, 'done')))
        .get();

      const activeCount = Number(activeCountResult?.count || 0);
      if (activeCount >= userPlan.limits.tasks) {
        return jsonError(
          c,
          `Task limit of ${userPlan.limits.tasks} reached for your ${userPlan.plan} plan. Please upgrade to create more tasks.`,
          'UPGRADE_REQUIRED',
          402
        );
      }
    }

    // 2. Resolve default list (Inbox) if not provided
    let listId = parsed.data.listId;
    if (!listId) {
      const inboxList = await db
        .select()
        .from(taskListsTable)
        .where(and(eq(taskListsTable.userId, userId), eq(taskListsTable.isInbox, 1)))
        .get();

      if (!inboxList) {
        const inboxId = crypto.randomUUID();
        await db.insert(taskListsTable).values({
          id: inboxId,
          userId,
          name: 'Inbox',
          color: '#8b5cf6',
          icon: 'inbox',
          isInbox: 1,
          viewMode: 'list',
          orderIndex: 0
        });
        listId = inboxId;
      } else {
        listId = inboxList.id;
      }
    }

    // 3. Compute orderIndex if not explicitly provided
    let orderIndex = parsed.data.orderIndex;
    if (orderIndex === undefined) {
      const maxOrderResult = await db
        .select({ maxOrder: sql<number>`max(${tasksTable.orderIndex})` })
        .from(tasksTable)
        .where(and(eq(tasksTable.userId, userId), listId ? eq(tasksTable.listId, listId) : sql`1=1`))
        .get();
      orderIndex = (maxOrderResult?.maxOrder ?? -1) + 1;
    }

    // 4. Resolve field aliases
    const description = parsed.data.description ?? parsed.data.notes ?? null;
    const startTime = parsed.data.startTime ?? parsed.data.dueTime ?? null;
    const recurrenceRule = parsed.data.recurrenceRule ?? parsed.data.recurrence ?? null;
    const financeType = parsed.data.financeType ?? parsed.data.budgetCategory ?? null;

    let initialStatus = parsed.data.status;
    if (parsed.data.completed !== undefined) {
      initialStatus = parsed.data.completed ? 'done' : 'todo';
    }

    const rawLabels = parsed.data.labels ?? parsed.data.tags;
    const labelsStr = Array.isArray(rawLabels)
      ? JSON.stringify(rawLabels)
      : rawLabels || null;

    const isPinnedVal = typeof parsed.data.isPinned === 'boolean'
      ? (parsed.data.isPinned ? 1 : 0)
      : (parsed.data.isPinned ?? 0);

    const isFloatingVal = typeof parsed.data.isFloating === 'boolean'
      ? (parsed.data.isFloating ? 1 : 0)
      : (parsed.data.isFloating ?? 0);

    const isAllDayVal = typeof parsed.data.isAllDay === 'boolean'
      ? (parsed.data.isAllDay ? 1 : 0)
      : (parsed.data.isAllDay ?? 0);

    const annoyingAlertVal = typeof parsed.data.annoyingAlert === 'boolean'
      ? (parsed.data.annoyingAlert ? 1 : 0)
      : (parsed.data.annoyingAlert ?? 0);

    const taskId = crypto.randomUUID();
    const isDone = initialStatus === 'done';
    const nowIso = new Date().toISOString();

    const newTask = {
      id: taskId,
      userId,
      listId: listId || null,
      columnId: parsed.data.columnId || null,
      parentTaskId: parsed.data.parentTaskId || null,
      title: parsed.data.title,
      description,
      status: initialStatus,
      priority: parsed.data.priority,
      kind: parsed.data.kind || 'TEXT',
      dueDate: parsed.data.dueDate || null,
      startTime,
      endTime: parsed.data.endTime || null,
      isAllDay: isAllDayVal,
      timeZone: parsed.data.timeZone || null,
      annoyingAlert: annoyingAlertVal,
      estimatedDuration: parsed.data.estimatedDuration ?? null,
      actualDuration: parsed.data.actualDuration ?? null,
      recurrenceRule,
      repeatFrom: parsed.data.repeatFrom || 'due_date',
      reminderTime: parsed.data.reminderTime || null,
      isPinned: isPinnedVal,
      isFloating: isFloatingVal,
      progress: parsed.data.progress ?? (isDone ? 100 : 0),
      labels: labelsStr,
      budgetId: parsed.data.budgetId || null,
      expectedCost: parsed.data.expectedCost ?? null,
      financeType,
      orderIndex,
      completedAt: isDone ? nowIso : null
    };

    await db.insert(tasksTable).values(newTask);

    // Insert initial subtasks if supplied
    const rawSubtasks = parsed.data.subtasks;
    const createdSubtasks: TaskSubtask[] = [];
    if (Array.isArray(rawSubtasks) && rawSubtasks.length > 0) {
      for (let i = 0; i < rawSubtasks.length; i++) {
        const item = rawSubtasks[i];
        const subtaskTitle = typeof item === 'string' ? item.trim() : item.title?.trim();
        if (!subtaskTitle) continue;
        const subtaskId = crypto.randomUUID();
        const isComp = typeof item === 'object' && (item.isCompleted === true || item.isCompleted === 1) ? 1 : 0;
        const subDueDate = typeof item === 'object' ? item.dueDate || null : null;
        const subReminderTime = typeof item === 'object' ? item.reminderTime || null : null;
        const subSnoozeReminderTime = typeof item === 'object' ? item.snoozeReminderTime || null : null;
        const subTimeZone = typeof item === 'object' ? item.timeZone || null : null;
        const stRecord = {
          id: subtaskId,
          taskId,
          title: subtaskTitle,
          isCompleted: isComp,
          orderIndex: i,
          dueDate: subDueDate,
          reminderTime: subReminderTime,
          snoozeReminderTime: subSnoozeReminderTime,
          timeZone: subTimeZone
        };
        await db.insert(taskSubtasksTable).values(stRecord);
        createdSubtasks.push(stRecord as any);
      }
    }

    const created = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.id, taskId))
      .get();

    return jsonOk(
      c,
      {
        task: formatTaskResponse(created!, createdSubtasks)
      },
      201
    );
  } catch (error: any) {
    console.error('Create task error:', error);
    return jsonError(c, error?.message || 'Failed to create task', 'CREATE_TASK_ERROR', 500);
  }
});

// ── POST /batch (Bulk Operations) ───────────────────
tasksRoute.post('/batch', async (c) => {
  try {
    const userId = c.get('userId')!;
    const body = await c.req.json();
    const { taskIds, action, data } = body as {
      taskIds: string[];
      action: 'complete' | 'uncomplete' | 'delete' | 'reschedule' | 'set_priority' | 'move_list';
      data?: { dueDate?: string; listId?: string; priority?: 'urgent' | 'high' | 'medium' | 'low' };
    };

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return jsonError(c, 'taskIds array is required', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    const nowIso = new Date().toISOString();

    if (action === 'delete') {
      await db
        .delete(tasksTable)
        .where(and(eq(tasksTable.userId, userId), inArray(tasksTable.id, taskIds)));
      return jsonOk(c, { success: true, count: taskIds.length, action });
    }

    const updates: Partial<typeof tasksTable.$inferInsert> = {};
    if (action === 'complete') {
      updates.status = 'done';
      updates.completedAt = nowIso;
      updates.progress = 100;
    } else if (action === 'uncomplete') {
      updates.status = 'todo';
      updates.completedAt = null;
      updates.progress = 0;
    } else if (action === 'reschedule' && data?.dueDate !== undefined) {
      updates.dueDate = data.dueDate || null;
    } else if (action === 'set_priority' && data?.priority) {
      updates.priority = data.priority;
    } else if (action === 'move_list' && data?.listId !== undefined) {
      updates.listId = data.listId || null;
    }

    if (Object.keys(updates).length > 0) {
      await db
        .update(tasksTable)
        .set(updates)
        .where(and(eq(tasksTable.userId, userId), inArray(tasksTable.id, taskIds)));
    }

    return jsonOk(c, { success: true, count: taskIds.length, action });
  } catch (error: any) {
    console.error('Batch task error:', error);
    return jsonError(c, error?.message || 'Failed to execute batch operation', 'BATCH_ERROR', 500);
  }
});

// ── PUT /:id (Update Task) ──────────────────────────
tasksRoute.put('/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        c,
        parsed.error.issues[0]?.message || 'Invalid update payload',
        'VALIDATION_ERROR',
        400
      );
    }

    const db = getDb(c.env);

    const existing = await db
      .select()
      .from(tasksTable)
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
      .get();

    if (!existing) {
      return jsonError(c, 'Task not found', 'NOT_FOUND', 404);
    }

    const updates: Partial<typeof tasksTable.$inferInsert> = {};

    if (parsed.data.title !== undefined) updates.title = parsed.data.title;
    if (parsed.data.description !== undefined || parsed.data.notes !== undefined) {
      updates.description = parsed.data.description ?? parsed.data.notes;
    }
    if (parsed.data.listId !== undefined) updates.listId = parsed.data.listId;
    if (parsed.data.columnId !== undefined) updates.columnId = parsed.data.columnId;
    if (parsed.data.parentTaskId !== undefined) updates.parentTaskId = parsed.data.parentTaskId;
    if (parsed.data.priority !== undefined) updates.priority = parsed.data.priority;
    if (parsed.data.dueDate !== undefined) updates.dueDate = parsed.data.dueDate;
    if (parsed.data.startTime !== undefined || parsed.data.dueTime !== undefined) {
      updates.startTime = parsed.data.startTime ?? parsed.data.dueTime;
    }
    if (parsed.data.endTime !== undefined) updates.endTime = parsed.data.endTime;
    if (parsed.data.estimatedDuration !== undefined) updates.estimatedDuration = parsed.data.estimatedDuration;
    if (parsed.data.actualDuration !== undefined) updates.actualDuration = parsed.data.actualDuration;
    if (parsed.data.recurrenceRule !== undefined || parsed.data.recurrence !== undefined) {
      updates.recurrenceRule = parsed.data.recurrenceRule ?? parsed.data.recurrence;
    }
    if (parsed.data.repeatFrom !== undefined) updates.repeatFrom = parsed.data.repeatFrom;
    if (parsed.data.reminderTime !== undefined) updates.reminderTime = parsed.data.reminderTime;
    if (parsed.data.kind !== undefined) updates.kind = parsed.data.kind;
    if (parsed.data.timeZone !== undefined) updates.timeZone = parsed.data.timeZone;
    if (parsed.data.isAllDay !== undefined) {
      updates.isAllDay = typeof parsed.data.isAllDay === 'boolean'
        ? (parsed.data.isAllDay ? 1 : 0)
        : parsed.data.isAllDay;
    }
    if (parsed.data.annoyingAlert !== undefined) {
      updates.annoyingAlert = typeof parsed.data.annoyingAlert === 'boolean'
        ? (parsed.data.annoyingAlert ? 1 : 0)
        : parsed.data.annoyingAlert;
    }
    if (parsed.data.isPinned !== undefined) {
      updates.isPinned = typeof parsed.data.isPinned === 'boolean'
        ? (parsed.data.isPinned ? 1 : 0)
        : parsed.data.isPinned;
    }
    if (parsed.data.isFloating !== undefined) {
      updates.isFloating = typeof parsed.data.isFloating === 'boolean'
        ? (parsed.data.isFloating ? 1 : 0)
        : parsed.data.isFloating;
    }
    if (parsed.data.progress !== undefined) updates.progress = parsed.data.progress;
    if (parsed.data.budgetId !== undefined) updates.budgetId = parsed.data.budgetId;
    if (parsed.data.expectedCost !== undefined) updates.expectedCost = parsed.data.expectedCost;
    if (parsed.data.financeType !== undefined || parsed.data.budgetCategory !== undefined) {
      updates.financeType = parsed.data.financeType ?? parsed.data.budgetCategory;
    }
    if (parsed.data.orderIndex !== undefined) updates.orderIndex = parsed.data.orderIndex;

    const rawLabels = parsed.data.labels ?? parsed.data.tags;
    if (rawLabels !== undefined) {
      updates.labels = Array.isArray(rawLabels)
        ? JSON.stringify(rawLabels)
        : rawLabels;
    }

    // Status & completedAt handling
    let targetStatus = parsed.data.status;
    if (parsed.data.completed !== undefined) {
      targetStatus = parsed.data.completed ? 'done' : 'todo';
    }

    if (targetStatus !== undefined) {
      updates.status = targetStatus;
      if (targetStatus === 'done' && existing.status !== 'done') {
        updates.completedAt = new Date().toISOString();
        if (parsed.data.progress === undefined) {
          updates.progress = 100;
        }
      } else if (targetStatus !== 'done' && existing.status === 'done') {
        updates.completedAt = null;
        if (parsed.data.progress === undefined) {
          updates.progress = 0;
        }
      }
    }

    await db.update(tasksTable).set(updates).where(eq(tasksTable.id, id));

    const updatedTask = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.id, id))
      .get();

    const subtasks = await db
      .select()
      .from(taskSubtasksTable)
      .where(eq(taskSubtasksTable.taskId, id))
      .orderBy(asc(taskSubtasksTable.orderIndex), asc(taskSubtasksTable.createdAt));

    return jsonOk(c, {
      task: formatTaskResponse(updatedTask!, subtasks)
    });
  } catch (error: any) {
    console.error('Update task error:', error);
    return jsonError(c, error?.message || 'Failed to update task', 'UPDATE_TASK_ERROR', 500);
  }
});

// ── DELETE /:id (Delete Task) ───────────────────────
tasksRoute.delete('/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const db = getDb(c.env);

    const existing = await db
      .select()
      .from(tasksTable)
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
      .get();

    if (!existing) {
      return jsonError(c, 'Task not found', 'NOT_FOUND', 404);
    }

    // Delete associated subtasks first
    await db.delete(taskSubtasksTable).where(eq(taskSubtasksTable.taskId, id));

    // Delete task
    await db.delete(tasksTable).where(eq(tasksTable.id, id));

    return jsonOk(c, { deleted: true, id });
  } catch (error: any) {
    console.error('Delete task error:', error);
    return jsonError(c, error?.message || 'Failed to delete task', 'DELETE_TASK_ERROR', 500);
  }
});

// ── PATCH /:id/status (Toggle / Update Status) ───────
tasksRoute.patch('/:id/status', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const db = getDb(c.env);

    const existing = await db
      .select()
      .from(tasksTable)
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
      .get();

    if (!existing) {
      return jsonError(c, 'Task not found', 'NOT_FOUND', 404);
    }

    let nextStatus: 'todo' | 'in_progress' | 'done' | 'wont_do' | 'archived';

    // Check if body provides status or completed
    let body: any = null;
    try {
      body = await c.req.json();
    } catch {
      // Empty or non-JSON body: toggle status
    }

    if (body && (body.status || body.completed !== undefined)) {
      const parsed = statusUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return jsonError(c, 'Invalid status update', 'VALIDATION_ERROR', 400);
      }
      if (parsed.data.status) {
        nextStatus = parsed.data.status;
      } else if (parsed.data.completed !== undefined) {
        nextStatus = parsed.data.completed ? 'done' : 'todo';
      } else {
        nextStatus = (existing.status === 'done' || existing.status === 'wont_do') ? 'todo' : 'done';
      }
    } else {
      // Toggle logic: done or wont_do -> todo, otherwise -> done
      nextStatus = (existing.status === 'done' || existing.status === 'wont_do') ? 'todo' : 'done';
    }

    const isDone = nextStatus === 'done';
    const isWontDo = nextStatus === 'wont_do';
    const nowIso = new Date().toISOString();

    const updates: Partial<typeof tasksTable.$inferInsert> = {
      status: nextStatus,
      completedAt: isDone ? nowIso : null,
      progress: isDone ? 100 : (isWontDo ? existing.progress : (existing.progress === 100 ? 0 : existing.progress))
    };

    await db.update(tasksTable).set(updates).where(eq(tasksTable.id, id));

    const updated = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.id, id))
      .get();

    const subtasks = await db
      .select()
      .from(taskSubtasksTable)
      .where(eq(taskSubtasksTable.taskId, id))
      .orderBy(asc(taskSubtasksTable.orderIndex), asc(taskSubtasksTable.createdAt));

    return jsonOk(c, {
      task: formatTaskResponse(updated!, subtasks)
    });
  } catch (error: any) {
    console.error('Patch task status error:', error);
    return jsonError(c, error?.message || 'Failed to update task status', 'STATUS_UPDATE_ERROR', 500);
  }
});

// ── POST /:id/reorder (Update Order Index / Column) ──
tasksRoute.post('/:id/reorder', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = reorderTaskSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        c,
        parsed.error.issues[0]?.message || 'Invalid reorder parameters',
        'VALIDATION_ERROR',
        400
      );
    }

    const db = getDb(c.env);

    const existing = await db
      .select()
      .from(tasksTable)
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
      .get();

    if (!existing) {
      return jsonError(c, 'Task not found', 'NOT_FOUND', 404);
    }

    const updates: Partial<typeof tasksTable.$inferInsert> = {
      orderIndex: parsed.data.orderIndex
    };

    if (parsed.data.columnId !== undefined) {
      updates.columnId = parsed.data.columnId;
    }
    if (parsed.data.listId !== undefined) {
      updates.listId = parsed.data.listId;
    }

    await db.update(tasksTable).set(updates).where(eq(tasksTable.id, id));

    const updated = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.id, id))
      .get();

    return jsonOk(c, { task: formatTaskResponse(updated!, []) });
  } catch (error: any) {
    console.error('Reorder task error:', error);
    return jsonError(c, error?.message || 'Failed to reorder task', 'REORDER_ERROR', 500);
  }
});
