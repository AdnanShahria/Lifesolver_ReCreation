import React, { useState, useRef } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Wallet, 
  BookOpen, 
  Flame, 
  Sparkles, 
  Clock, 
  Send, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Check
} from 'lucide-react';

export const HeroWindow: React.FC = () => {
  // 3D Perspective Tilt on Mouse Move
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;

    // Subtle, restrained Apple tilt physics
    setRotateX(-yPct * 8);
    setRotateY(xPct * 10);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  // Interactive Live Metrics
  const [tasksDone, setTasksDone] = useState(18);
  const [tasksTotal, setTasksTotal] = useState(24);
  const [budgetLeft, setBudgetLeft] = useState(14250);
  const [studyHours, setStudyHours] = useState(9.2);
  const [streakDays, setStreakDays] = useState(18);

  // Active view switcher inside window (Apple Segmented Control)
  const [activeTab, setActiveTab] = useState<'cockpit' | 'orbit' | 'focus'>('cockpit');

  // Interactive Tasks List
  const [tasks, setTasks] = useState([
    { id: 1, title: "Review Series B Cap Table & Liquidity", priority: "High", done: true, tag: "Finance" },
    { id: 2, title: "Deep Focus: ML Neural Graph Optimization", priority: "Urgent", done: true, tag: "Mind" },
    { id: 3, title: "Biometric Cardiovascular Protocol (45m)", priority: "Med", done: false, tag: "Health" },
    { id: 4, title: "Rebalance Institutional Crypto Enclave", priority: "High", done: false, tag: "Assets" }
  ]);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.done;
        setTasksDone(d => nextState ? d + 1 : Math.max(0, d - 1));
        return { ...t, done: nextState };
      }
      return t;
    }));
  };

  // Interactive Focus Pomodoro Timer
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [isFocusActive, setIsFocusActive] = useState(false);

  React.useEffect(() => {
    let timer: any = null;
    if (isFocusActive && focusSeconds > 0) {
      timer = setInterval(() => setFocusSeconds(s => s - 1), 1000);
    } else if (focusSeconds === 0) {
      setIsFocusActive(false);
    }
    return () => clearInterval(timer);
  }, [isFocusActive, focusSeconds]);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Orbit AI Interactive Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'orbit'; text: string; details?: any }>>([
    {
      sender: 'user',
      text: "Orbit, what is my runway status if I hire a senior infra engineer next month?"
    },
    {
      sender: 'orbit',
      text: "At an estimated $18,500/mo fully loaded compensation, your personal liquidity runway shifts from 24.2 months to 19.8 months. Your cash reserve remains 210% above safety threshold.",
      details: {
        pill: "Safe Scenario",
        action: "Simulated in Financial Ledger"
      }
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');

  const quickPrompts = [
    "Reschedule workout after deep work",
    "How's my daily dopamine budget?",
    "Summarize SM-2 flashcard backlog"
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query) return;

    setInputPrompt('');
    setChatMessages(prev => [...prev, { sender: 'user', text: query }]);

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'orbit',
          text: `Orbit executed: "${query}". Context reconciled across Planner, Health & Finance tables with zero conflicting state.`
        }
      ]);
    }, 450);
  };

  return (
    <div 
      className="relative w-full mx-auto"
      style={{ perspective: '1400px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Tilted Card Body with Apple Spring Transition & Locked Dimensions */}
      <div 
        ref={cardRef}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="w-full apple-window-frame rounded-[22px] sm:rounded-[26px] p-4 sm:p-5 lg:p-5 xl:p-6 relative overflow-hidden shadow-2xl h-[510px] sm:h-[485px] flex flex-col justify-between"
      >
        {/* Subtle Specular Ambient Top Rim Light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* macOS Window Chrome Header */}
        <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-white/[0.08] mb-3.5 gap-2.5 shrink-0">
          {/* Traffic Lights */}
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f56] border border-black/30 shadow-inner flex items-center justify-center cursor-pointer" title="Close" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffbd2e] border border-black/30 shadow-inner flex items-center justify-center cursor-pointer" title="Minimize" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27c93f] border border-black/30 shadow-inner flex items-center justify-center cursor-pointer" title="Expand" />
            <span className="ml-2.5 text-[12px] sm:text-[13px] font-apple-display font-medium text-white/90 hidden sm:inline">
              LifeSolver Cockpit
            </span>
          </div>

          {/* Apple Segmented Control Tab Switcher */}
          <div className="apple-segmented-container">
            <button
              onClick={() => setActiveTab('cockpit')}
              className={`apple-segmented-item text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1 sm:py-1.5 ${activeTab === 'cockpit' ? 'active' : ''}`}
            >
              Cockpit
            </button>
            <button
              onClick={() => setActiveTab('orbit')}
              className={`apple-segmented-item flex items-center space-x-1 sm:space-x-1.5 text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1 sm:py-1.5 ${activeTab === 'orbit' ? 'active' : ''}`}
            >
              <Sparkles className="w-3 h-3 text-[#64d2ff]" />
              <span>Orbit AI</span>
            </button>
            <button
              onClick={() => setActiveTab('focus')}
              className={`apple-segmented-item text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1 sm:py-1.5 ${activeTab === 'focus' ? 'active' : ''}`}
            >
              Focus
            </button>
          </div>

          {/* Cloudflare Edge Status */}
          <div className="hidden sm:flex items-center space-x-1.5 text-[10px] sm:text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>18ms Edge</span>
          </div>
        </div>

        {/* ── TAB 1: EXECUTIVE COCKPIT ── */}
        {activeTab === 'cockpit' && (
          <div className="flex-1 flex flex-col justify-between min-h-0 space-y-3">
            {/* 4 Apple Modular Metric Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 shrink-0">
              
              {/* Stat 1: Tasks Completion */}
              <div className="apple-card p-3 sm:p-3.5 flex flex-col justify-between group hover:border-[#0a84ff]/40">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#0071e3]/15 border border-[#0071e3]/30 flex items-center justify-center text-[#64d2ff]">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {Math.round((tasksDone / tasksTotal) * 100)}%
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                    {tasksDone} <span className="text-xs font-normal text-zinc-500 font-sans">/ {tasksTotal}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 font-medium truncate">Tasks Executed</div>
                </div>
              </div>

              {/* Stat 2: Capital Runway */}
              <div className="apple-card p-3 sm:p-3.5 flex flex-col justify-between group hover:border-emerald-500/40">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Safe</span>
                </div>
                <div className="mt-2">
                  <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                    ${(budgetLeft / 1000).toFixed(1)}k
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 font-medium truncate">Liquid Buffer</div>
                </div>
              </div>

              {/* Stat 3: Spaced Repetition */}
              <div className="apple-card p-3 sm:p-3.5 flex flex-col justify-between group hover:border-indigo-400/40">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                  </div>
                  <span className="text-[10px] font-mono text-indigo-400">SM-2</span>
                </div>
                <div className="mt-2">
                  <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                    {studyHours}h
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 font-medium truncate">Study Retention</div>
                </div>
              </div>

              {/* Stat 4: Discipline Streak */}
              <div className="apple-card p-3 sm:p-3.5 flex flex-col justify-between group hover:border-amber-400/40">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                  </div>
                  <span className="text-[10px] font-mono text-amber-400">Streak</span>
                </div>
                <div className="mt-2">
                  <div className="text-xl sm:text-2xl font-bold text-white font-mono flex items-baseline space-x-1">
                    <span>{streakDays}</span>
                    <span className="text-[11px] text-amber-400 font-sans font-medium">Days</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 font-medium truncate">Cadence Streak</div>
                </div>
              </div>

            </div>

            {/* Interactive Live Task Subsystem */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-apple-display font-semibold text-zinc-200 uppercase tracking-wider">
                  Today's High-Leverage Tasks (Click to Toggle)
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400">
                  {tasks.filter(t => t.done).length}/{tasks.length} Done
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
                {tasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs select-none ${
                      t.done 
                        ? 'bg-white/[0.03] border-white/[0.06] text-zinc-400' 
                        : 'bg-white/[0.06] border-white/[0.12] text-zinc-100 hover:border-[#0071e3]/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2 overflow-hidden pr-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        t.done 
                          ? 'bg-[#0071e3] border-[#0071e3] text-white' 
                          : 'border-white/30 hover:border-white/60'
                      }`}>
                        {t.done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className={`truncate text-xs ${t.done ? 'line-through text-zinc-500' : 'font-medium'}`}>
                        {t.title}
                      </span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 shrink-0 text-zinc-400">
                      {t.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Apple Activity Rings / Linear Gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5 shrink-0">
              <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium text-[11px] sm:text-xs">Weekly Execution Ratio</span>
                  <span className="font-mono text-[#64d2ff] font-bold text-xs">78%</span>
                </div>
                <div className="w-full bg-white/[0.08] h-1.5 sm:h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: '78%',
                      background: 'linear-gradient(90deg, #0071e3 0%, #64d2ff 100%)'
                    }}
                  />
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium text-[11px] sm:text-xs">Financial Buffer</span>
                  <span className="font-mono text-emerald-400 font-bold text-xs">84%</span>
                </div>
                <div className="w-full bg-white/[0.08] h-1.5 sm:h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: '84%',
                      background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: ORBIT AI INTELLIGENCE ── */}
        {activeTab === 'orbit' && (
          <div className="flex-1 flex flex-col justify-between min-h-0 space-y-3">
            {/* Messages Display (Fills middle area with smooth scroll) */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1.5 space-y-2.5">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'apple-btn-primary text-white rounded-br-sm shadow-md'
                      : 'apple-card text-zinc-200 rounded-bl-sm space-y-2'
                  }`}>
                    <div>{msg.text}</div>

                    {msg.details && (
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-zinc-400">
                        <span className="text-[#64d2ff] font-semibold">{msg.details.pill}</span>
                        <span>{msg.details.action}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Controls Group (Fixed at bottom) */}
            <div className="space-y-2.5 pt-1 shrink-0">
              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p)}
                    className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[10px] sm:text-[11px] text-zinc-300 font-medium transition-colors"
                  >
                    "{p}"
                  </button>
                ))}
              </div>

              {/* Prompt Input Form */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                className="relative flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Ask Orbit to synthesize your day..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#0a84ff] focus:ring-1 focus:ring-[#0a84ff]/40 transition-all font-mono"
                />
                <button
                  type="submit"
                  className="w-9 h-9 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#0071e3]/30 transition-transform active:scale-95"
                  aria-label="Send"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── TAB 3: DEEP WORK ENCLAVE (POMODORO) ── */}
        {activeTab === 'focus' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 my-auto min-h-0">
            <div className="w-36 h-36 rounded-full border-2 border-white/10 flex flex-col items-center justify-center relative shadow-2xl shadow-indigo-950/40 shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0071e3] border-r-[#64d2ff] animate-spin" style={{ animationDuration: '8s' }} />
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                {formatTimer(focusSeconds)}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1 uppercase tracking-wider font-mono">
                {isFocusActive ? "Deep Work Active" : "Session Paused"}
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => setIsFocusActive(!isFocusActive)}
                className="px-5 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-[#0071e3]/30"
              >
                {isFocusActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isFocusActive ? "Pause Flow" : "Initiate Focus"}</span>
              </button>
              <button
                onClick={() => { setIsFocusActive(false); setFocusSeconds(25 * 60); }}
                className="p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-zinc-300 hover:text-white border border-white/10 transition-colors"
                title="Reset Session"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 max-w-xs leading-relaxed shrink-0">
              Shielding blocks dopamine feeds and syncs focus state with your daily planner.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};


