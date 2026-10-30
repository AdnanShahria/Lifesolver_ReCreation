import { Hono } from 'hono';
import { tasksRoute } from './Tasks';
import { listsRoute } from './Lists';
import { subtasksRoute } from './Subtasks';
import type { Env, AppVariables } from '../types';

export const plannerRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// ── Mount Sub-Routers ───────────────────────────────
// Tasks: /api/planner/tasks/*
plannerRouter.route('/tasks', tasksRoute);

// Lists: /api/planner/lists/*
plannerRouter.route('/lists', listsRoute);

// Subtasks: /api/planner/subtasks/* and /api/planner/tasks/:taskId/subtasks
plannerRouter.route('/', subtasksRoute);

export * from './Tasks';
export * from './Lists';
export * from './Subtasks';
