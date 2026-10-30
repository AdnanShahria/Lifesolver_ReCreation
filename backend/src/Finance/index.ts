import { Hono } from 'hono';
import { accountsRoute } from './Accounts';
import { transfersRoute } from './Transfers';
import { ledgerRoute } from './Ledger';
import { budgetsRoute } from './Budgets';
import { savingsRoute } from './Savings';
import { billsRoute } from './Bills';
import { loansRoute } from './Loans';
import { analyticsRoute } from './Analytics';
import type { Env, AppVariables } from '../types';

export const financeRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

financeRouter.route('/', accountsRoute);
financeRouter.route('/', transfersRoute);
financeRouter.route('/', ledgerRoute);
financeRouter.route('/', budgetsRoute);
financeRouter.route('/', savingsRoute);
financeRouter.route('/', billsRoute);
financeRouter.route('/', loansRoute);
financeRouter.route('/', analyticsRoute);

export * from './Accounts';
export * from './Transfers';
export * from './Ledger';
export * from './Budgets';
export * from './Savings';
export * from './Bills';
export * from './Loans';
export * from './Analytics';
