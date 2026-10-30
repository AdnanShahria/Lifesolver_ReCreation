import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDays, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  Layers,
  Sparkles
} from 'lucide-react';
import { useTasks, usePlannerStats } from '../Planner/hooks/usePlanner';

interface ExecutivePlannerWidgetProps {
  theme?: 'dark' | 'light';
}

export const ExecutivePlannerWidget: React.FC<ExecutivePlannerWidgetProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { data: stats } = usePlannerStats();
  const { data: tasks = [] } = useTasks({ smartView: 'today' });

  const activeCount = stats?.allCount ?? tasks.length;
  const overdueCount = stats?.overdueCount ?? 0;
  const completedCount = stats?.completedCount ?? 0;
  const todayCount = stats?.todayCount ?? tasks.length;

  return (
    <div className={`rounded-2xl p-6 border relative overflow-hidden transition-all ${
      isDark
        ? 'apple-glass border-violet-500/25 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-[#0c0d12] shadow-xl text-zinc-100'
        : 'bg-white border-violet-500/20 shadow-md shadow-violet-500/5 text-zinc-900'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title & Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
            <CalendarDays className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Vertical 1: Planner & Task OS</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 flex items-center space-x-1">
                <Sparkles className="w-2.5 h-2.5 text-violet-400" />
                <span>TickTick Engine</span>
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'} mt-0.5`}>
              Multi-column task continuum: Lists, Kanban boards, Eisenhower Matrix, and time blocking.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/planner')}
            className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
              isDark
                ? 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 shadow-sm'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-violet-400" />
            <span>+ Add Task</span>
          </button>

          <button
            onClick={() => navigate('/planner')}
            className="min-h-[44px] min-w-[44px] px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
          >
            <span>Open Planner OS</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t ${isDark ? 'border-zinc-800/80' : 'border-zinc-200'}`}>
        <div>
          <div className={`text-[11px] font-mono uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'} flex items-center space-x-1`}>
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Today's Queue</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 mt-1">
            {todayCount} Tasks
          </div>
          <div className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mt-0.5`}>Scheduled for today</div>
        </div>

        <div>
          <div className={`text-[11px] font-mono uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'} flex items-center space-x-1`}>
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span>Overdue Alerts</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-rose-400 mt-1">
            {overdueCount} Tasks
          </div>
          <div className="text-[10px] text-rose-400/80 mt-0.5">Needs immediate attention</div>
        </div>

        <div>
          <div className={`text-[11px] font-mono uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'} flex items-center space-x-1`}>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Completed</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1">
            {completedCount}
          </div>
          <div className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mt-0.5`}>Resolved in database</div>
        </div>

        <div>
          <div className={`text-[11px] font-mono uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'} flex items-center space-x-1`}>
            <Layers className="w-3 h-3 text-violet-400" />
            <span>View Modes</span>
          </div>
          <div className="text-sm font-semibold mt-1.5 flex items-center space-x-1.5">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700 border border-zinc-200'}`}>List</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700 border border-zinc-200'}`}>Board</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700 border border-zinc-200'}`}>Matrix</span>
          </div>
          <div className="text-[10px] text-violet-400 mt-1">NLP Smart Input Enabled</div>
        </div>
      </div>
    </div>
  );
};
