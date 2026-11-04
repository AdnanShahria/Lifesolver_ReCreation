import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, asc, sql } from 'drizzle-orm';
import { getDb } from '../_core/db';
import {
  taskSubtasksTable,
  tasksTable,
  type TaskSubtask
} from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { authMiddleware } from '../_core/auth.middleware';
import { subscriptionMiddleware } from '../_core/subscription.middleware';
import type { Env, AppVariables } from '../types';

export const subtasksRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

subtasksRoute.use('*', authMiddleware, subscriptionMiddleware);

// ── Validation Schemas ──────────────────────────────
const createSubtaskSchema = z.object({
  title: z.string().trim().min(1, 'Subtask title is required'),
  dueDate: z.string().optional().nullable(),
  reminderTime: z.string().optional().nullable(),
  snoozeReminderTime: z.string().optional().nullable(),
  timeZone: z.string().optional().nullable(),
  orderIndex: z.number().int().optional()
});

const updateSubtaskSchema = z.object({
  title: z.string().trim().min(1).optional(),
  isCompleted: z.number().int().min(0).max(1).optional(),
  dueDate: z.string().optional().nullable(),
  reminderTime: z.string().optional().nullable(),
  snoozeReminderTime: z.string().optional().nullable(),
  timeZone: z.string().optional().nullable(),
  orderIndex: z.number().int().optional()
});

// Helper to recalculate parent task progress based on subtasks
async function syncParentTaskProgress(db: any, taskId: string) {
  const allSubtasks = await db
    .select()
    .from(taskSubtasksTable)
    .where(eq(taskSubtasksTable.taskId, taskId));

  if (allSubtasks.length > 0) {
    const completedCount = allSubtasks.filter((s: TaskSubtask) => s.isCompleted === 1).length;
    const progress = Math.round((completedCount / allSubtasks.length) * 100);
    await db.update(tasksTable).set({ progress }).where(eq(tasksTable.id, taskId));
  }
}

// ── POST /:taskId/subtasks (Create Subtask) ──────────
async function handleCreateSubtask(c: any, taskId: string) {
  try {
    const userId = c.get('userId')!;
    const body = await c.req.json();
    const parsed = createSubtaskSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid subtask data', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);

    // Verify task exists and belongs to user
    const task = await db
      .select()
      .from(tasksTable)
      .where(and(eq(tasksTable.id, taskId), eq(tasksTable.userId, userId)))
      .get();

    if (!task) {
      return jsonError(c, 'Parent task not found', 'NOT_FOUND', 404);
    }

    // Determine orderIndex if not supplied
    let orderIndex = parsed.data.orderIndex;
    if (orderIndex === undefined) {
      const maxOrderRow = await db
        .select({ maxOrder: sql<number>`max(${taskSubtasksTable.orderIndex})` })
        .from(taskSubtasksTable)
        .where(eq(taskSubtasksTable.taskId, taskId))
        .get();
      orderIndex = (maxOrderRow?.maxOrder ?? -1) + 1;
    }

    const subtaskId = crypto.randomUUID();
    const newSubtask = {
      id: subtaskId,
      taskId,
      title: parsed.data.title,
      isCompleted: 0,
      orderIndex,
      dueDate: parsed.data.dueDate || null,
      reminderTime: parsed.data.reminderTime || null,
      snoozeReminderTime: parsed.data.snoozeReminderTime || null,
      timeZone: parsed.data.timeZone || null
    };

    await db.insert(taskSubtasksTable).values(newSubtask);

    // Recalculate parent task progress
    await syncParentTaskProgress(db, taskId);

    const created = await db
      .select()
      .from(taskSubtasksTable)
      .where(eq(taskSubtasksTable.id, subtaskId))
      .get();

    return jsonOk(c, { subtask: created }, 201);
  } catch (error: any) {
    console.error('Create subtask error:', error);
    return jsonError(c, error?.message || 'Failed to create subtask', 'CREATE_SUBTASK_ERROR', 500);
  }
}

// ── PUT /subtasks/:id (Update / Toggle Subtask) ──────
async function handleUpdateSubtask(c: any, id: string) {
  try {
    const userId = c.get('userId')!;
    const body = await c.req.json();
    const parsed = updateSubtaskSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid subtask update', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);

    // Verify subtask belongs to user's task
    const existing = await db
      .select({
        subtask: taskSubtasksTable,
        task: tasksTable
      })
      .from(taskSubtasksTable)
      .innerJoin(tasksTable, eq(taskSubtasksTable.taskId, tasksTable.id))
      .where(and(eq(taskSubtasksTable.id, id), eq(tasksTable.userId, userId)))
      .get();

    if (!existing) {
      return jsonError(c, 'Subtask not found', 'NOT_FOUND', 404);
    }

    const updates: Partial<typeof taskSubtasksTable.$inferInsert> = {};
    if (parsed.data.title !== undefined) updates.title = parsed.data.title;
    if (parsed.data.isCompleted !== undefined) updates.isCompleted = parsed.data.isCompleted;
    if (parsed.data.dueDate !== undefined) updates.dueDate = parsed.data.dueDate;
    if (parsed.data.reminderTime !== undefined) updates.reminderTime = parsed.data.reminderTime;
    if (parsed.data.snoozeReminderTime !== undefined) updates.snoozeReminderTime = parsed.data.snoozeReminderTime;
    if (parsed.data.timeZone !== undefined) updates.timeZone = parsed.data.timeZone;
    if (parsed.data.orderIndex !== undefined) updates.orderIndex = parsed.data.orderIndex;

    await db.update(taskSubtasksTable).set(updates).where(eq(taskSubtasksTable.id, id));

    // Recalculate parent task progress
    await syncParentTaskProgress(db, existing.task.id);

    const updated = await db
      .select()
      .from(taskSubtasksTable)
      .where(eq(taskSubtasksTable.id, id))
      .get();

    return jsonOk(c, { subtask: updated });
  } catch (error: any) {
    console.error('Update subtask error:', error);
    return jsonError(c, error?.message || 'Failed to update subtask', 'UPDATE_SUBTASK_ERROR', 500);
  }
}

// ── DELETE /subtasks/:id (Delete Subtask) ────────────
async function handleDeleteSubtask(c: any, id: string) {
  try {
    const userId = c.get('userId')!;
    const db = getDb(c.env);

    // Verify subtask belongs to user's task
    const existing = await db
      .select({
        subtask: taskSubtasksTable,
        task: tasksTable
      })
      .from(taskSubtasksTable)
      .innerJoin(tasksTable, eq(taskSubtasksTable.taskId, tasksTable.id))
      .where(and(eq(taskSubtasksTable.id, id), eq(tasksTable.userId, userId)))
      .get();

    if (!existing) {
      return jsonError(c, 'Subtask not found', 'NOT_FOUND', 404);
    }

    const parentTaskId = existing.task.id;

    await db.delete(taskSubtasksTable).where(eq(taskSubtasksTable.id, id));

    // Recalculate parent task progress
    await syncParentTaskProgress(db, parentTaskId);

    return jsonOk(c, { deleted: true, id });
  } catch (error: any) {
    console.error('Delete subtask error:', error);
    return jsonError(c, error?.message || 'Failed to delete subtask', 'DELETE_SUBTASK_ERROR', 500);
  }
}

// Mount handler paths for flexible URL routing
subtasksRoute.post('/:taskId/subtasks', async (c) => {
  return handleCreateSubtask(c, c.req.param('taskId'));
});
subtasksRoute.post('/tasks/:taskId/subtasks', async (c) => {
  return handleCreateSubtask(c, c.req.param('taskId'));
});

subtasksRoute.put('/subtasks/:id', async (c) => {
  return handleUpdateSubtask(c, c.req.param('id'));
});
subtasksRoute.put('/tasks/subtasks/:id', async (c) => {
  return handleUpdateSubtask(c, c.req.param('id'));
});

subtasksRoute.delete('/subtasks/:id', async (c) => {
  return handleDeleteSubtask(c, c.req.param('id'));
});
subtasksRoute.delete('/tasks/subtasks/:id', async (c) => {
  return handleDeleteSubtask(c, c.req.param('id'));
});
