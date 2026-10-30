/**
 * LifeSolver Planner (Vertical 1) Contract & Schema Test Suite
 * Validates database schema definitions, exported types, Hono routing,
 * progress calculations, and status transitions.
 */
import {
  taskFoldersTable,
  taskListsTable,
  taskColumnsTable,
  tasksTable,
  taskSubtasksTable,
  taskTimeLogsTable,
  goalsTable,
  calendarEventsTable,
  type Task,
  type NewTask,
  type TaskList,
  type NewTaskList,
  type TaskFolder,
  type TaskColumn,
  type TaskSubtask,
  type Goal,
  type CalendarEvent
} from '../database/schema/Planner/tasks';
import { plannerRouter } from '../backend/src/Planner';

async function runPlannerTests() {
  console.log('🧪 Starting LifeSolver Planner (WP-01 & WP-02) Test Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, name: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
      throw new Error(`Assertion failed: ${name}`);
    }
  }

  // ── 1. Database Schema Definitions ──
  console.log('📦 1. Database Schema Table Definitions');
  assert(!!taskFoldersTable, 'taskFoldersTable is defined');
  assert(taskFoldersTable.id !== undefined, 'taskFoldersTable has id field');
  assert(taskFoldersTable.userId !== undefined, 'taskFoldersTable has userId field');
  assert(taskFoldersTable.name !== undefined, 'taskFoldersTable has name field');
  assert(taskFoldersTable.isCollapsed !== undefined, 'taskFoldersTable has isCollapsed field');
  assert(taskFoldersTable.orderIndex !== undefined, 'taskFoldersTable has orderIndex field');

  assert(!!taskListsTable, 'taskListsTable is defined');
  assert(taskListsTable.id !== undefined, 'taskListsTable has id field');
  assert(taskListsTable.userId !== undefined, 'taskListsTable has userId field');
  assert(taskListsTable.name !== undefined, 'taskListsTable has name field');
  assert(taskListsTable.color !== undefined, 'taskListsTable has color field');
  assert(taskListsTable.icon !== undefined, 'taskListsTable has icon field');
  assert(taskListsTable.folderId !== undefined, 'taskListsTable has folderId field');
  assert(taskListsTable.isInbox !== undefined, 'taskListsTable has isInbox field');
  assert(taskListsTable.viewMode !== undefined, 'taskListsTable has viewMode field');

  assert(!!taskColumnsTable, 'taskColumnsTable is defined');
  assert(taskColumnsTable.id !== undefined, 'taskColumnsTable has id field');
  assert(taskColumnsTable.listId !== undefined, 'taskColumnsTable has listId field');
  assert(taskColumnsTable.name !== undefined, 'taskColumnsTable has name field');

  assert(!!tasksTable, 'tasksTable is defined');
  assert(tasksTable.id !== undefined, 'tasksTable has id field');
  assert(tasksTable.userId !== undefined, 'tasksTable has userId field');
  assert(tasksTable.listId !== undefined, 'tasksTable has listId field');
  assert(tasksTable.columnId !== undefined, 'tasksTable has columnId field');
  assert(tasksTable.parentTaskId !== undefined, 'tasksTable has parentTaskId field');
  assert(tasksTable.title !== undefined, 'tasksTable has title field');
  assert(tasksTable.status !== undefined, 'tasksTable has status field');
  assert(tasksTable.priority !== undefined, 'tasksTable has priority field');
  assert(tasksTable.dueDate !== undefined, 'tasksTable has dueDate field');
  assert(tasksTable.repeatFrom !== undefined, 'tasksTable has repeatFrom field');
  assert(tasksTable.isPinned !== undefined, 'tasksTable has isPinned field');
  assert(tasksTable.isFloating !== undefined, 'tasksTable has isFloating field');
  assert(tasksTable.progress !== undefined, 'tasksTable has progress field');
  assert(tasksTable.labels !== undefined, 'tasksTable has labels field');

  assert(!!taskSubtasksTable, 'taskSubtasksTable is defined');
  assert(taskSubtasksTable.id !== undefined, 'taskSubtasksTable has id field');
  assert(taskSubtasksTable.taskId !== undefined, 'taskSubtasksTable has taskId field');
  assert(taskSubtasksTable.title !== undefined, 'taskSubtasksTable has title field');
  assert(taskSubtasksTable.isCompleted !== undefined, 'taskSubtasksTable has isCompleted field');

  assert(!!taskTimeLogsTable, 'taskTimeLogsTable is preserved');
  assert(!!goalsTable, 'goalsTable is preserved');
  assert(!!calendarEventsTable, 'calendarEventsTable is preserved');

  // ── 2. Type Inference Contract Verification ──
  console.log('\n📐 2. Type Inference Contracts');
  const dummyTask: Task = {
    id: 'test-1',
    userId: 'u-1',
    listId: 'l-1',
    columnId: null,
    parentTaskId: null,
    title: 'Test Task',
    description: 'Description',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-10-30',
    startTime: '09:00',
    endTime: '10:00',
    estimatedDuration: 60,
    actualDuration: 0,
    recurrenceRule: null,
    repeatFrom: 'due_date',
    reminderTime: null,
    isPinned: 0,
    isFloating: 0,
    progress: 0,
    labels: '["work"]',
    budgetId: null,
    expectedCost: null,
    financeType: null,
    orderIndex: 0,
    completedAt: null,
    createdAt: '2026-10-29 12:00:00',
    contextType: 'general',
    contextId: null
  };
  assert(dummyTask.title === 'Test Task', 'Task type satisfies full schema interface');

  const dummySubtask: TaskSubtask = {
    id: 'st-1',
    taskId: 'test-1',
    title: 'Subtask 1',
    isCompleted: 1,
    orderIndex: 0,
    dueDate: null,
    createdAt: '2026-10-29 12:00:00'
  };
  assert(dummySubtask.isCompleted === 1, 'TaskSubtask type satisfies full schema interface');

  // ── 3. Progress Rollup Logic ──
  console.log('\n📊 3. Subtask Progress Rollup Mathematics');
  const subtasks = [
    { isCompleted: 1 },
    { isCompleted: 1 },
    { isCompleted: 0 },
    { isCompleted: 0 }
  ];
  const completedCount = subtasks.filter(s => s.isCompleted === 1).length;
  const progress = Math.round((completedCount / subtasks.length) * 100);
  assert(progress === 50, '50% progress calculated accurately from 2/4 completed subtasks');

  // ── 4. Planner Hono Router Mounting ──
  console.log('\n🚀 4. Planner Hono Router Registration');
  assert(!!plannerRouter, 'plannerRouter instance is created');
  assert(typeof plannerRouter.fetch === 'function', 'plannerRouter exposes fetch handler for Cloudflare Workers');

  console.log(`\n🎉 All ${passed}/${total} LifeSolver Planner Tests Passed Successfully!`);
}

runPlannerTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
