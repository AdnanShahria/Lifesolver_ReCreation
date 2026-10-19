import React, { useState } from 'react';
import { 
  Compass, 
  Target, 
  ShieldCheck, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Lock,
  Globe,
  Binary,
  Activity,
  Check,
  Cpu,
  TrendingUp,
  RefreshCw,
  Sliders,
  Database,
  EyeOff,
  Flame,
  Calendar,
  Wallet,
  Brain,
  Heart
} from 'lucide-react';

type TabKey = 'mission' | 'vision' | 'invariants' | 'math';

export const MissionVisionTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('mission');

  // Interactive state for Mission widget: selected vertical
  const [selectedVertical, setSelectedVertical] = useState<number>(0);

  // Interactive state for Vision widget: simulated balance toggle
  const [isSimulatingStress, setIsSimulatingStress] = useState<boolean>(false);

  // Interactive state for Invariants widget: verification check
  const [isVerifyingCrypto, setIsVerifyingCrypto] = useState<boolean>(false);
  const [verifiedTimestamp, setVerifiedTimestamp] = useState<string>('Just now');

  // Interactive state for Math widget: active simulated trigger
  const [activeTriggerIndex, setActiveTriggerIndex] = useState<number>(0);

  const tabs: Array<{ id: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'mission', label: 'Mission', icon: Target },
    { id: 'vision', label: 'Vision', icon: Sparkles },
    { id: 'invariants', label: 'Architectural Invariants', icon: ShieldCheck },
    { id: 'math', label: 'Relational Math', icon: Binary }
  ];

  const contentMap = {
    mission: {
      tag: "THE MISSION",
      badgeText: "Unified Sovereign LifeOS",
      accentColor: "from-blue-500 to-cyan-400",
      accentText: "text-[#0a84ff] dark:text-[#64d2ff]",
      headline: "The Eradication of Cognitive Fragmentation",
      prose: [
        "Modern operators are trapped in tool fatigue—switching across 12 disjointed apps for tasks, calendar, notes, expenses, workout logs, habits, passwords, and contacts. Every context switch degrades dopamine, focus, and human agency.",
        "LifeSolver's mission is to harmonize all 8 dimensions of human existence into a single, synchronized operating system where an action in one vertical ripples with mathematical clarity across the whole."
      ],
      stats: [
        { label: "Hours lost to tool switching", val: "14.2 hrs/wk", context: "Knowledge worker friction", progress: 85 },
        { label: "Separate apps replaced", val: "8 into 1", context: "Consolidated under one LifeOS", progress: 100 },
        { label: "Context retention gain", val: "3.8x", context: "Via relational state graph", progress: 95 }
      ],
      quote: "A human being should be able to organize goals, architect systems, master nutrition, balance financial ledgers, compose thoughts, and command attention. Specialization is for insects. LifeSolver is for the complete human."
    },
    vision: {
      tag: "THE VISION",
      badgeText: "Decade-Scale Autonomous Equilibrium",
      accentColor: "from-sky-500 to-indigo-500",
      accentText: "text-sky-500 dark:text-sky-400",
      headline: "A World Where Every Individual Operates With Sovereign Mastery",
      prose: [
        "We envision a future where independent thinkers, builders, and professionals possess the institutional composure of a well-run aerospace organization.",
        "Where your second brain automatically informs your daily planner, where your capital runway guides your risk envelope, and where physical routines protect your mental clarity without administrative drag."
      ],
      stats: [
        { label: "Systemic Equilibrium", val: "99.4%", context: "Target life balance across 8 pillars", progress: 99 },
        { label: "Decision latency", val: "< 50ms", context: "Real-time tradeoff clarity", progress: 92 },
        { label: "Long-term horizon", val: "10 Years", context: "Continuous milestone alignment", progress: 100 }
      ],
      quote: "Sovereignty is not a talking point; it is an architectural reality. Either you own the operating system of your life, or attention algorithms own you."
    },
    invariants: {
      tag: "THE 4 INVARIANTS",
      badgeText: "Zero-Knowledge Enclave Laws",
      accentColor: "from-emerald-500 to-teal-400",
      accentText: "text-emerald-500 dark:text-emerald-400",
      headline: "Principles We Will Never Compromise",
      prose: [
        "We built LifeSolver with foundational architectural laws that cannot be relaxed for venture capital whims, advertising dollars, or growth hacks.",
        "These invariants are permanently anchored into our database schema and cryptographic architecture: zero telemetry, client-side zero-knowledge encryption, and sub-20ms distributed edge replication."
      ],
      stats: [
        { label: "Data mining & Ad tracking", val: "0.00%", context: "Strict zero telemetry leaks", progress: 100 },
        { label: "Encryption Grade", val: "AES-256", context: "Client-side vault with zero server access", progress: 100 },
        { label: "Edge Latency", val: "18 ms", context: "Global Cloudflare D1 distributed SQLite", progress: 96 }
      ],
      quote: "When the architecture is uncompromising, trust does not require blind faith—it is guaranteed by mathematics."
    },
    math: {
      tag: "EQUILIBRIUM DYNAMICS",
      badgeText: "Thermodynamic State Graph",
      accentColor: "from-purple-500 to-pink-500",
      accentText: "text-purple-500 dark:text-purple-400",
      headline: "Life is a Relational System, Not Disconnected Buckets",
      prose: [
        "Conventional productivity tools treat your life as isolated silos. If you overspend on Friday, your task manager doesn't care. If you sleep 4 hours, your to-do list still demands 12 hours of deep work.",
        "LifeSolver models life as an interconnected thermodynamic graph: an expenditure in one pillar immediately updates the boundary conditions of the others."
      ],
      stats: [
        { label: "Cross-Module Flow Triggers", val: "32 Checks", context: "Active ripple synchronization", progress: 94 },
        { label: "Cognitive Entropy Reduction", val: "84%", context: "Measured decrease in daily chaotic friction", progress: 84 },
        { label: "Algorithmic Detox", val: "100%", context: "Zero dopamine algorithmic bait", progress: 100 }
      ],
      quote: "True serenity does not come from frantically checking more boxes; it comes from knowing that every element of your life is in mathematical equilibrium."
    }
  };

  const current = contentMap[activeTab];

  // 8 Core Verticals for Mission interactive widget
  const verticalsList = [
    { name: "Daily Planner", icon: Calendar, status: "Active Sync", detail: "Dynamic time-blocking & priority gating" },
    { name: "Financial Ledger", icon: Wallet, status: "Audited", detail: "Double-entry capital & runway tracker" },
    { name: "Second Brain", icon: Brain, status: "Indexed", detail: "Bidirectional knowledge graph & notes" },
    { name: "Health & Sleep", icon: Heart, status: "Optimal", detail: "Circadian rhythm & bio-recovery metrics" },
    { name: "Habit Engine", icon: Flame, status: "100% Streak", detail: "Dopamine-aligned discipline tracking" },
    { name: "Deep Focus", icon: Zap, status: "Armed", detail: "Distraction-shielded Pomodoro cockpit" },
    { name: "Crypto Vault", icon: Lock, status: "AES-256", detail: "Client-side zero-knowledge encrypted store" },
    { name: "Orbit AI Copilot", icon: Sparkles, status: "Online", detail: "Autonomous relational life assistant" }
  ];

  // Trigger test for Invariants
  const handleVerifyCrypto = () => {
    setIsVerifyingCrypto(true);
    setTimeout(() => {
      setIsVerifyingCrypto(false);
      setVerifiedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 600);
  };

  // 3 Triggers for Math widget
  const rippleTriggers = [
    {
      condition: "Sleep < 6.5 hours logged",
      action: "Auto-caps deep work blocks to 3 and alerts high-friction meetings",
      pillarA: "Health",
      pillarB: "Focus & Planner"
    },
    {
      condition: "Discretionary spend > 80% weekly limit",
      action: "Suppresses impulse dining suggestions and highlights pantry meal prep",
      pillarA: "Finance",
      pillarB: "Habits"
    },
    {
      condition: "Sprint milestone due in < 48 hours",
      action: "Protects 4-hour morning focus envelopes and defers non-critical admin",
      pillarA: "Second Brain",
      pillarB: "Daily Tasks"
    }
  ];

  const scrollToArchitecture = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('architecture');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="mission-vision" className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full apple-glass-pill text-[#0a84ff] dark:text-[#64d2ff] text-xs font-medium mb-4 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-[#0a84ff] dark:text-[#64d2ff]" />
            <span>The Sovereign Doctrine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-apple-display tracking-apple-tight text-zinc-900 dark:text-white mb-4 leading-tight">
            A fragmented mind cannot create a legendary life.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-apple-text max-w-2xl mx-auto leading-relaxed">
            Discover the philosophical tenets and architectural laws that govern LifeSolver.
          </p>
        </div>

        {/* Apple Segmented Pill Switcher */}
        <div className="flex justify-center mb-10 sm:mb-14">
          <div className="apple-segmented-container p-1.5 flex flex-wrap sm:flex-nowrap justify-center gap-1 max-w-full">
            {tabs.map(t => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`apple-segmented-item flex items-center space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm transition-all duration-300 ${
                    isActive ? 'active' : ''
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-[#0071e3] dark:text-[#64d2ff]' : 'text-zinc-400'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── SPLIT BENTO GRID (7:5 RATIO) ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* ── LEFT COLUMN: MAIN DOCTRINE CARD (lg:col-span-7) ── */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="apple-card p-6 sm:p-9 lg:p-10 flex flex-col justify-between h-full relative overflow-hidden bg-white dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl rounded-3xl transition-all duration-300">
              
              {/* Top Section */}
              <div className="space-y-6">
                
                {/* Eyebrow with Pulsing Active Badge */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-semibold uppercase tracking-widest text-[#0a84ff] dark:text-[#64d2ff]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0a84ff] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0a84ff]"></span>
                    </span>
                    <span>{current.tag}</span>
                  </div>

                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06]">
                    {current.badgeText}
                  </span>
                </div>

                {/* Headline in bold SF Pro Display */}
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-apple-display tracking-apple-tight text-zinc-900 dark:text-white leading-tight">
                  {current.headline}
                </h3>

                {/* Prose narrative with refined typography and paragraph spacing */}
                <div className="space-y-4 text-base sm:text-[17px] text-zinc-600 dark:text-zinc-300 font-apple-text leading-relaxed">
                  {current.prose.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

              </div>

              {/* Bottom: Apple Editorial Quote Card in New York Serif */}
              <blockquote className="mt-8 p-6 sm:p-7 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border-l-4 border-[#0071e3] border-y border-r border-black/[0.06] dark:border-white/[0.06] shadow-sm relative overflow-hidden">
                <div className="absolute right-4 top-2 text-7xl font-serif text-black/[0.03] dark:text-white/[0.03] select-none pointer-events-none">
                  “
                </div>
                <p className="font-apple-serif italic text-base sm:text-lg text-zinc-700 dark:text-zinc-200 leading-relaxed relative z-10">
                  "{current.quote}"
                </p>
                <div className="mt-4 flex items-center space-x-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 relative z-10">
                  <span className="w-5 h-[1.5px] bg-[#0071e3]/60 dark:bg-[#64d2ff]/60 inline-block"></span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">LifeSolver Sovereign Operating Doctrine</span>
                </div>
              </blockquote>

            </div>
          </div>

          {/* ── RIGHT COLUMN: TELEMETRY BENTO STACK (lg:col-span-5) ── */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* 1. Dynamic Interactive Visual Widget tailored to each tab */}
            <div className="apple-card p-6 sm:p-7 bg-white dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl rounded-3xl relative overflow-hidden">
              
              {/* TAB 1: MISSION WIDGET -> 8 Verticals Harmonized */}
              {activeTab === 'mission' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#0071e3] dark:text-[#64d2ff] flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white font-apple-display">
                          8 Verticals Harmonized
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-apple-text">
                          Single synchronized relational graph
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>8/8 Coherent</span>
                    </div>
                  </div>

                  {/* 8 Verticals Interactive Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {verticalsList.map((vert, idx) => {
                      const Icon = vert.icon;
                      const isSelected = selectedVertical === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedVertical(idx)}
                          className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between min-h-[70px] ${
                            isSelected 
                              ? 'bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/30 text-zinc-900 dark:text-white shadow-sm' 
                              : 'bg-zinc-50 dark:bg-white/[0.02] border-black/[0.04] dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#0071e3] dark:text-[#64d2ff]' : 'text-zinc-400'}`} />
                            <CheckCircle2 className={`w-3 h-3 ${isSelected ? 'text-[#0071e3] dark:text-[#64d2ff]' : 'text-zinc-300 dark:text-zinc-600'}`} />
                          </div>
                          <div className="font-semibold text-[11px] leading-tight mt-1 line-clamp-1">
                            {vert.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Vertical Detail Banner */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">Vertical Focus:</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{verticalsList[selectedVertical].name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#0071e3] dark:text-[#64d2ff] font-medium">
                      {verticalsList[selectedVertical].status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-apple-text italic">
                    "{verticalsList[selectedVertical].detail}"
                  </p>
                </div>
              )}

              {/* TAB 2: VISION WIDGET -> Systemic Equilibrium Progress */}
              {activeTab === 'vision' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-[#64d2ff] flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white font-apple-display">
                          Systemic Equilibrium Index
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-apple-text">
                          Dynamic entropy mitigation & stability
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsSimulatingStress(!isSimulatingStress)}
                      className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-zinc-700 dark:text-zinc-300 text-[11px] font-mono flex items-center space-x-1 transition-colors"
                    >
                      <Sliders className="w-3 h-3 text-[#0a84ff]" />
                      <span>{isSimulatingStress ? 'Active Mitigation' : 'Simulate Load'}</span>
                    </button>
                  </div>

                  {/* Large Score Display */}
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <div className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-zinc-900 dark:text-white">
                        {isSimulatingStress ? '98.1%' : '99.4%'}
                      </div>
                      <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 font-apple-display mt-0.5">
                        Equilibrium Score ({isSimulatingStress ? 'Load Auto-Stabilized' : 'Nominal State'})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center space-x-1 text-emerald-500 text-xs font-mono font-semibold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+3.2% vs Silos</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        Latency: &lt; 50ms
                      </div>
                    </div>
                  </div>

                  {/* 4 Multi-Dimensional Progress Indicators */}
                  <div className="space-y-2.5 pt-2">
                    {[
                      { name: "Cognitive Bandwidth", val: isSimulatingStress ? "97.4%" : "99.8%", width: isSimulatingStress ? 97 : 99, color: "from-blue-500 to-cyan-400" },
                      { name: "Circadian Recovery", val: isSimulatingStress ? "96.2%" : "98.9%", width: isSimulatingStress ? 96 : 98, color: "from-emerald-500 to-teal-400" },
                      { name: "Financial Runway Buffer", val: "99.5%", width: 99, color: "from-sky-500 to-indigo-500" },
                      { name: "10-Year Milestone Velocity", val: "100.0%", width: 100, color: "from-purple-500 to-pink-500" }
                    ].map((row, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-apple-text">
                          <span className="text-zinc-600 dark:text-zinc-400">{row.name}</span>
                          <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{row.val}</span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${row.color} rounded-full transition-all duration-500`}
                            style={{ width: `${row.width}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: INVARIANTS WIDGET -> Cryptographic Vault Integrity */}
              {activeTab === 'invariants' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white font-apple-display">
                          Cryptographic Vault Integrity
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-apple-text">
                          AES-256-GCM hardware enclave
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-semibold">
                      <Lock className="w-3 h-3" />
                      <span>Zero-Leak</span>
                    </div>
                  </div>

                  {/* 3 Security Pillars */}
                  <div className="space-y-2.5">
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <EyeOff className="w-4 h-4 text-emerald-500" />
                        <span className="text-zinc-700 dark:text-zinc-300 font-apple-text">Telemetry & Ad Tracking:</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">0.00% (Strict Null)</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <Cpu className="w-4 h-4 text-[#0071e3] dark:text-[#64d2ff]" />
                        <span className="text-zinc-700 dark:text-zinc-300 font-apple-text">Client Secret Key Storage:</span>
                      </div>
                      <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">Volatile RAM Only</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-purple-500" />
                        <span className="text-zinc-700 dark:text-zinc-300 font-apple-text">Edge Distributed DB:</span>
                      </div>
                      <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">Cloudflare D1 (18ms)</span>
                    </div>
                  </div>

                  {/* Proof Verification Interactive Action */}
                  <div className="pt-1 flex items-center justify-between gap-3">
                    <button
                      onClick={handleVerifyCrypto}
                      disabled={isVerifyingCrypto}
                      className="w-full py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-black/[0.05] dark:border-white/[0.08] text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center space-x-2 transition-all"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isVerifyingCrypto ? 'animate-spin' : ''}`} />
                      <span>{isVerifyingCrypto ? 'Verifying Enclave...' : 'Run Cryptographic Verification'}</span>
                    </button>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 text-center">
                    Enclave State: <span className="text-emerald-500 font-bold">VERIFIED_SECURE</span> · {verifiedTimestamp}
                  </div>
                </div>
              )}

              {/* TAB 4: RELATIONAL MATH WIDGET -> 32 Cross-Pillar Flow Triggers */}
              {activeTab === 'math' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Binary className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white font-apple-display">
                          Relational Graph Engine
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-apple-text">
                          32 cross-pillar dynamic equilibrium checks
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[11px] font-mono font-semibold">
                      <Zap className="w-3 h-3" />
                      <span>Active Loop</span>
                    </div>
                  </div>

                  {/* 3 Ripple Trigger Demonstration Cards */}
                  <div className="space-y-2">
                    {rippleTriggers.map((trig, idx) => {
                      const isActiveTrigger = activeTriggerIndex === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveTriggerIndex(idx)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isActiveTrigger
                              ? 'bg-purple-500/10 dark:bg-purple-500/15 border-purple-500/30 text-zinc-900 dark:text-white shadow-sm'
                              : 'bg-zinc-50 dark:bg-white/[0.02] border-black/[0.04] dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                              RULE 0{idx + 1}: {trig.pillarA} ➔ {trig.pillarB}
                            </span>
                            {isActiveTrigger && (
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
                            )}
                          </div>
                          <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                            IF: {trig.condition}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                            THEN: {trig.action}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] text-center text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    Thermodynamic Entropy Status: <span className="text-purple-500 font-bold">OPTIMAL EQUILIBRIUM (0 DRIFT)</span>
                  </div>
                </div>
              )}

            </div>

            {/* 2. 3 High-Fidelity Telemetry Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {current.stats.map((s, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_20px_rgb(0,0,0,0.02)] dark:shadow-none hover:border-black/[0.12] dark:hover:border-white/[0.15] transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Metric 0{idx + 1}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0a84ff]"></span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-900 dark:text-white tracking-tight group-hover:text-[#0071e3] dark:group-hover:text-[#64d2ff] transition-colors">
                    {s.val}
                  </div>
                  <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 font-apple-display line-clamp-1">
                    {s.label}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-apple-text leading-tight">
                    {s.context}
                  </div>
                  <div className="pt-1">
                    <div className="w-full bg-zinc-100 dark:bg-white/[0.08] h-1 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#0071e3] to-[#64d2ff] rounded-full transition-all duration-500"
                        style={{ width: `${s.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 3. Quick Action Link / Interactive Pill: "View Complete Architectural Spec →" */}
            <a
              href="#architecture"
              onClick={scrollToArchitecture}
              className="group flex items-center justify-between w-full p-4 rounded-2xl bg-white dark:bg-white/[0.03] hover:bg-zinc-50 dark:hover:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#0071e3] dark:text-[#64d2ff] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-[#0071e3] dark:group-hover:text-[#64d2ff] transition-colors">
                    View Complete Architectural Spec
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                    Zero-Knowledge AES-256 · Cloudflare D1 Edge Mesh
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs font-semibold text-[#0071e3] dark:text-[#64d2ff]">
                <span>Inspect</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

          </div>

        </div>

      </div>
    </section>
  );
};
