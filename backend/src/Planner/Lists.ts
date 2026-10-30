import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, asc, sql, ne, inArray } from 'drizzle-orm';
import { getDb } from '../_core/db';
import {
  taskListsTable,
  taskFoldersTable,
  taskColumnsTable,
  tasksTable,
  type TaskList,
  type TaskFolder,
  type TaskColumn
} from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { authMiddleware } from '../_core/auth.middleware';
import { subscriptionMiddleware } from '../_core/subscription.middleware';
import type { Env, AppVariables } from '../types';

export const listsRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

listsRoute.use('*', authMiddleware, subscriptionMiddleware);

// ── Validation Schemas ──────────────────────────────
const createListSchema = z.object({
  name: z.string().trim().min(1, 'List name is required'),
  color: z.string().trim().optional().default('#8b5cf6'),
  icon: z.string().trim().optional().default('list'),
  folderId: z.string().optional().nullable(),
  isInbox: z.number().int().min(0).max(1).default(0),
  viewMode: z.enum(['list', 'kanban', 'matrix', 'calendar']).default('list'),
  orderIndex: z.number().int().optional()
});

const updateListSchema = z.object({
  name: z.string().trim().min(1).optional(),
  color: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  folderId: z.string().optional().nullable(),
  viewMode: z.enum(['list', 'kanban', 'matrix', 'calendar']).optional(),
  orderIndex: z.number().int().optional(),
  isArchived: z.number().int().min(0).max(1).optional()
});

const createFolderSchema = z.object({
  name: z.string().trim().min(1, 'Folder name is required'),
  orderIndex: z.number().int().optional()
});

const updateFolderSchema = z.object({
  name: z.string().trim().min(1).optional(),
  orderIndex: z.number().int().optional(),
  isCollapsed: z.number().int().min(0).max(1).optional()
});

const createColumnSchema = z.object({
  name: z.string().trim().min(1, 'Column name is required'),
  orderIndex: z.number().int().optional()
});

const updateColumnSchema = z.object({
  name: z.string().trim().min(1).optional(),
  orderIndex: z.number().int().optional()
});

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

// ── GET / (List User Lists + Folders + Counts) ──────
listsRoute.get('/', async (c) => {
  try {
    const userId = c.get('userId')!;
    const db = getDb(c.env);

    // 1. Fetch Folders
    const folders = await db
      .select()
      .from(taskFoldersTable)
      .where(eq(taskFoldersTable.userId, userId))
      .orderBy(asc(taskFoldersTable.orderIndex), asc(taskFoldersTable.createdAt));

    // 2. Fetch Lists
    let lists = await db
      .select()
      .from(taskListsTable)
      .where(eq(taskListsTable.userId, userId))
      .orderBy(asc(taskListsTable.orderIndex), asc(taskListsTable.createdAt));

    // 3. Ensure Default Inbox Exists
    let inboxList = lists.find((l) => l.isInbox === 1);
    if (!inboxList) {
      const inboxId = crypto.randomUUID();
      const defaultInbox = {
        id: inboxId,
        userId,
        name: 'Inbox',
        color: '#8b5cf6',
        icon: 'inbox',
        folderId: null,
        isInbox: 1,
        viewMode: 'list',
        orderIndex: 0,
        isArchived: 0
      };
      await db.insert(taskListsTable).values(defaultInbox);
      inboxList = await db.select().from(taskListsTable).where(eq(taskListsTable.id, inboxId)).get();
      if (inboxList) {
        lists = [inboxList, ...lists];
      }
    }

    // 4. Fetch Columns for All User Lists
    const listIds = lists.map((l) => l.id);
    let columns: TaskColumn[] = [];
    if (listIds.length > 0) {
      columns = await db
        .select()
        .from(taskColumnsTable)
        .where(inArray(taskColumnsTable.listId, listIds))
        .orderBy(asc(taskColumnsTable.orderIndex));
    }

    const columnsMap = new Map<string, TaskColumn[]>();
    for (const col of columns) {
      if (!columnsMap.has(col.listId)) {
        columnsMap.set(col.listId, []);
      }
      columnsMap.get(col.listId)!.push(col);
    }

    // 5. Aggregate Task Counts Per List
    const taskCounts = await db
      .select({
        listId: tasksTable.listId,
        activeCount: sql<number>`SUM(CASE WHEN ${tasksTable.status} != 'done' THEN 1 ELSE 0 END)`,
        totalCount: sql<number>`count(*)`
      })
      .from(tasksTable)
      .where(eq(tasksTable.userId, userId))
      .groupBy(tasksTable.listId);

    const countsMap = new Map<string, { activeCount: number; totalCount: number }>();
    for (const row of taskCounts) {
      if (row.listId) {
        countsMap.set(row.listId, {
          activeCount: Number(row.activeCount || 0),
          totalCount: Number(row.totalCount || 0)
        });
      }
    }

    const enrichedLists = lists.map((l) => {
      const counts = countsMap.get(l.id) || { activeCount: 0, totalCount: 0 };
      return {
        ...l,
        columns: columnsMap.get(l.id) || [],
        activeCount: counts.activeCount,
        totalCount: counts.totalCount
      };
    });

    // 6. Compute Smart View Counts
    const todayStr = getTodayIso();
    const tomorrowStr = getTomorrowIso();
    const next7DaysStr = getNext7DaysIso();

    const [todayCountRow, tomorrowCountRow, next7DaysCountRow, allActiveCountRow, completedCountRow] =
      await Promise.all([
        db
          .select({ count: sql<number>`count(*)` })
          .from(tasksTable)
          .where(
            and(
              eq(tasksTable.userId, userId),
              sql`${tasksTable.dueDate} IS NOT NULL`,
              sql`substr(${tasksTable.dueDate}, 1, 10) <= ${todayStr}`,
              ne(tasksTable.status, 'done')
            )
          )
          .get(),
        db
          .select({ count: sql<number>`count(*)` })
          .from(tasksTable)
          .where(
            and(
              eq(tasksTable.userId, userId),
              sql`substr(${tasksTable.dueDate}, 1, 10) = ${tomorrowStr}`,
              ne(tasksTable.status, 'done')
            )
          )
          .get(),
        db
          .select({ count: sql<number>`count(*)` })
          .from(tasksTable)
          .where(
            and(
              eq(tasksTable.userId, userId),
              sql`${tasksTable.dueDate} IS NOT NULL`,
              sql`substr(${tasksTable.dueDate}, 1, 10) >= ${todayStr}`,
              sql`substr(${tasksTable.dueDate}, 1, 10) <= ${next7DaysStr}`,
              ne(tasksTable.status, 'done')
            )
          )
          .get(),
        db
          .select({ count: sql<number>`count(*)` })
          .from(tasksTable)
          .where(and(eq(tasksTable.userId, userId), ne(tasksTable.status, 'done')))
          .get(),
        db
          .select({ count: sql<number>`count(*)` })
          .from(tasksTable)
          .where(and(eq(tasksTable.userId, userId), eq(tasksTable.status, 'done')))
          .get()
      ]);

    const smartCounts = {
      today: Number(todayCountRow?.count || 0),
      tomorrow: Number(tomorrowCountRow?.count || 0),
      next7Days: Number(next7DaysCountRow?.count || 0),
      all: Number(allActiveCountRow?.count || 0),
      inbox: inboxList ? (countsMap.get(inboxList.id)?.activeCount || 0) : 0,
      completed: Number(completedCountRow?.count || 0)
    };

    return jsonOk(c, {
      lists: enrichedLists,
      folders,
      smartCounts,
      inboxId: inboxList?.id || null
    });
  } catch (error: any) {
    console.error('Fetch lists error:', error);
    return jsonError(c, error?.message || 'Failed to fetch task lists', 'FETCH_LISTS_ERROR', 500);
  }
});

// ── POST / (Create List) ────────────────────────────
listsRoute.post('/', async (c) => {
  try {
    const userId = c.get('userId')!;
    const body = await c.req.json();
    const parsed = createListSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid list data', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);

    // Compute orderIndex if not supplied
    let orderIndex = parsed.data.orderIndex;
    if (orderIndex === undefined) {
      const maxOrderRow = await db
        .select({ maxOrder: sql<number>`max(${taskListsTable.orderIndex})` })
        .from(taskListsTable)
        .where(eq(taskListsTable.userId, userId))
        .get();
      orderIndex = (maxOrderRow?.maxOrder ?? -1) + 1;
    }

    const listId = crypto.randomUUID();
    const newList = {
      id: listId,
      userId,
      name: parsed.data.name,
      color: parsed.data.color || '#8b5cf6',
      icon: parsed.data.icon || 'list',
      folderId: parsed.data.folderId || null,
      isInbox: parsed.data.isInbox ?? 0,
      viewMode: parsed.data.viewMode || 'list',
      orderIndex,
      isArchived: 0
    };

    await db.insert(taskListsTable).values(newList);

    // If kanban viewMode, create default columns: To Do, In Progress, Done
    if (parsed.data.viewMode === 'kanban') {
      await db.insert(taskColumnsTable).values([
        { id: crypto.randomUUID(), listId, name: 'To Do', orderIndex: 0 },
        { id: crypto.randomUUID(), listId, name: 'In Progress', orderIndex: 1 },
        { id: crypto.randomUUID(), listId, name: 'Done', orderIndex: 2 }
      ]);
    }

    const created = await db.select().from(taskListsTable).where(eq(taskListsTable.id, listId)).get();
    const columns = await db
      .select()
      .from(taskColumnsTable)
      .where(eq(taskColumnsTable.listId, listId))
      .orderBy(asc(taskColumnsTable.orderIndex));

    return jsonOk(
      c,
      {
        list: {
          ...created,
          columns,
          activeCount: 0,
          totalCount: 0
        }
      },
      201
    );
  } catch (error: any) {
    console.error('Create list error:', error);
    return jsonError(c, error?.message || 'Failed to create list', 'CREATE_LIST_ERROR', 500);
  }
});

// ── PUT /:id (Update List) ──────────────────────────
listsRoute.put('/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateListSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid update data', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);

    const existing = await db
      .select()
      .from(taskListsTable)
      .where(and(eq(taskListsTable.id, id), eq(taskListsTable.userId, userId)))
      .get();

    if (!existing) {
      return jsonError(c, 'List not found', 'NOT_FOUND', 404);
    }

    const updates: Partial<typeof taskListsTable.$inferInsert> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.color !== undefined) updates.color = parsed.data.color;
    if (parsed.data.icon !== undefined) updates.icon = parsed.data.icon;
    if (parsed.data.folderId !== undefined) updates.folderId = parsed.data.folderId;
    if (parsed.data.viewMode !== undefined) updates.viewMode = parsed.data.viewMode;
    if (parsed.data.orderIndex !== undefined) updates.orderIndex = parsed.data.orderIndex;
    if (parsed.data.isArchived !== undefined) updates.isArchived = parsed.data.isArchived;

    await db.update(taskListsTable).set(updates).where(eq(taskListsTable.id, id));

    const updated = await db.select().from(taskListsTable).where(eq(taskListsTable.id, id)).get();
    const columns = await db
      .select()
      .from(taskColumnsTable)
      .where(eq(taskColumnsTable.listId, id))
      .orderBy(asc(taskColumnsTable.orderIndex));

    return jsonOk(c, { list: { ...updated, columns } });
  } catch (error: any) {
    console.error('Update list error:', error);
    return jsonError(c, error?.message || 'Failed to update list', 'UPDATE_LIST_ERROR', 500);
  }
});

// ── DELETE /:id (Delete List) ───────────────────────
listsRoute.delete('/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const db = getDb(c.env);

    const existing = await db
      .select()
      .from(taskListsTable)
      .where(and(eq(taskListsTable.id, id), eq(taskListsTable.userId, userId)))
      .get();

    if (!existing) {
      return jsonError(c, 'List not found', 'NOT_FOUND', 404);
    }

    if (existing.isInbox === 1) {
      return jsonError(c, 'The default Inbox list cannot be deleted', 'FORBIDDEN', 400);
    }

    // 1. Move tasks in this list to the Inbox list or unassign
    const inbox = await db
      .select()
      .from(taskListsTable)
      .where(and(eq(taskListsTable.userId, userId), eq(taskListsTable.isInbox, 1)))
      .get();

    await db
      .update(tasksTable)
      .set({ listId: inbox ? inbox.id : null, columnId: null })
      .where(and(eq(tasksTable.userId, userId), eq(tasksTable.listId, id)));

    // 2. Delete columns
    await db.delete(taskColumnsTable).where(eq(taskColumnsTable.listId, id));

    // 3. Delete list
    await db.delete(taskListsTable).where(eq(taskListsTable.id, id));

    return jsonOk(c, { deleted: true, id });
  } catch (error: any) {
    console.error('Delete list error:', error);
    return jsonError(c, error?.message || 'Failed to delete list', 'DELETE_LIST_ERROR', 500);
  }
});

// ── FOLDER CRUD ─────────────────────────────────────

// POST /folders (Create Folder)
listsRoute.post('/folders', async (c) => {
  try {
    const userId = c.get('userId')!;
    const body = await c.req.json();
    const parsed = createFolderSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid folder data', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    let orderIndex = parsed.data.orderIndex;
    if (orderIndex === undefined) {
      const maxOrderRow = await db
        .select({ maxOrder: sql<number>`max(${taskFoldersTable.orderIndex})` })
        .from(taskFoldersTable)
        .where(eq(taskFoldersTable.userId, userId))
        .get();
      orderIndex = (maxOrderRow?.maxOrder ?? -1) + 1;
    }

    const folderId = crypto.randomUUID();
    const newFolder = {
      id: folderId,
      userId,
      name: parsed.data.name,
      orderIndex,
      isCollapsed: 0
    };

    await db.insert(taskFoldersTable).values(newFolder);
    const created = await db.select().from(taskFoldersTable).where(eq(taskFoldersTable.id, folderId)).get();

    return jsonOk(c, { folder: created }, 201);
  } catch (error: any) {
    console.error('Create folder error:', error);
    return jsonError(c, error?.message || 'Failed to create folder', 'CREATE_FOLDER_ERROR', 500);
  }
});

// PUT /folders/:id (Update Folder)
listsRoute.put('/folders/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateFolderSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid folder updates', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    const existing = await db
      .select()
      .from(taskFoldersTable)
      .where(and(eq(taskFoldersTable.id, id), eq(taskFoldersTable.userId, userId)))
      .get();

    if (!existing) {
      return jsonError(c, 'Folder not found', 'NOT_FOUND', 404);
    }

    const updates: Partial<typeof taskFoldersTable.$inferInsert> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.orderIndex !== undefined) updates.orderIndex = parsed.data.orderIndex;
    if (parsed.data.isCollapsed !== undefined) updates.isCollapsed = parsed.data.isCollapsed;

    await db.update(taskFoldersTable).set(updates).where(eq(taskFoldersTable.id, id));
    const updated = await db.select().from(taskFoldersTable).where(eq(taskFoldersTable.id, id)).get();

    return jsonOk(c, { folder: updated });
  } catch (error: any) {
    console.error('Update folder error:', error);
    return jsonError(c, error?.message || 'Failed to update folder', 'UPDATE_FOLDER_ERROR', 500);
  }
});

// DELETE /folders/:id (Delete Folder)
listsRoute.delete('/folders/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const db = getDb(c.env);

    const existing = await db
      .select()
      .from(taskFoldersTable)
      .where(and(eq(taskFoldersTable.id, id), eq(taskFoldersTable.userId, userId)))
      .get();

    if (!existing) {
      return jsonError(c, 'Folder not found', 'NOT_FOUND', 404);
    }

    // Unassign lists in this folder
    await db
      .update(taskListsTable)
      .set({ folderId: null })
      .where(and(eq(taskListsTable.userId, userId), eq(taskListsTable.folderId, id)));

    // Delete folder
    await db.delete(taskFoldersTable).where(eq(taskFoldersTable.id, id));

    return jsonOk(c, { deleted: true, id });
  } catch (error: any) {
    console.error('Delete folder error:', error);
    return jsonError(c, error?.message || 'Failed to delete folder', 'DELETE_FOLDER_ERROR', 500);
  }
});

// ── COLUMN CRUD ─────────────────────────────────────

// POST /:listId/columns (Create Column in List)
listsRoute.post('/:listId/columns', async (c) => {
  try {
    const userId = c.get('userId')!;
    const listId = c.req.param('listId');
    const body = await c.req.json();
    const parsed = createColumnSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid column data', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    const list = await db
      .select()
      .from(taskListsTable)
      .where(and(eq(taskListsTable.id, listId), eq(taskListsTable.userId, userId)))
      .get();

    if (!list) {
      return jsonError(c, 'List not found', 'NOT_FOUND', 404);
    }

    let orderIndex = parsed.data.orderIndex;
    if (orderIndex === undefined) {
      const maxColRow = await db
        .select({ maxOrder: sql<number>`max(${taskColumnsTable.orderIndex})` })
        .from(taskColumnsTable)
        .where(eq(taskColumnsTable.listId, listId))
        .get();
      orderIndex = (maxColRow?.maxOrder ?? -1) + 1;
    }

    const columnId = crypto.randomUUID();
    const newCol = {
      id: columnId,
      listId,
      name: parsed.data.name,
      orderIndex
    };

    await db.insert(taskColumnsTable).values(newCol);
    const created = await db.select().from(taskColumnsTable).where(eq(taskColumnsTable.id, columnId)).get();

    return jsonOk(c, { column: created }, 201);
  } catch (error: any) {
    console.error('Create column error:', error);
    return jsonError(c, error?.message || 'Failed to create column', 'CREATE_COLUMN_ERROR', 500);
  }
});

// PUT /columns/:id (Update Column)
listsRoute.put('/columns/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateColumnSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid column updates', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);

    // Verify ownership via taskListsTable
    const column = await db
      .select({
        column: taskColumnsTable,
        list: taskListsTable
      })
      .from(taskColumnsTable)
      .innerJoin(taskListsTable, eq(taskColumnsTable.listId, taskListsTable.id))
      .where(and(eq(taskColumnsTable.id, id), eq(taskListsTable.userId, userId)))
      .get();

    if (!column) {
      return jsonError(c, 'Column not found', 'NOT_FOUND', 404);
    }

    const updates: Partial<typeof taskColumnsTable.$inferInsert> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.orderIndex !== undefined) updates.orderIndex = parsed.data.orderIndex;

    await db.update(taskColumnsTable).set(updates).where(eq(taskColumnsTable.id, id));
    const updated = await db.select().from(taskColumnsTable).where(eq(taskColumnsTable.id, id)).get();

    return jsonOk(c, { column: updated });
  } catch (error: any) {
    console.error('Update column error:', error);
    return jsonError(c, error?.message || 'Failed to update column', 'UPDATE_COLUMN_ERROR', 500);
  }
});

// DELETE /columns/:id (Delete Column)
listsRoute.delete('/columns/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const db = getDb(c.env);

    const column = await db
      .select({
        column: taskColumnsTable,
        list: taskListsTable
      })
      .from(taskColumnsTable)
      .innerJoin(taskListsTable, eq(taskColumnsTable.listId, taskListsTable.id))
      .where(and(eq(taskColumnsTable.id, id), eq(taskListsTable.userId, userId)))
      .get();

    if (!column) {
      return jsonError(c, 'Column not found', 'NOT_FOUND', 404);
    }

    // Unassign tasks in this column
    await db
      .update(tasksTable)
      .set({ columnId: null })
      .where(eq(tasksTable.columnId, id));

    // Delete column
    await db.delete(taskColumnsTable).where(eq(taskColumnsTable.id, id));

    return jsonOk(c, { deleted: true, id });
  } catch (error: any) {
    console.error('Delete column error:', error);
    return jsonError(c, error?.message || 'Failed to delete column', 'DELETE_COLUMN_ERROR', 500);
  }
});
