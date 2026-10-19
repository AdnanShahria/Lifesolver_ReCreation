import React, { useState } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  Check, 
  Cpu, 
  Terminal, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Lock, 
  Compass, 
  Activity,
  CornerDownLeft,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface PromptScenario {
  id: string;
  pillLabel: string;
  icon: React.ElementType;
  userPrompt: string;
  badge: string;
  badgeColor: 'emerald' | 'amber' | 'cyan';
  response: string;
  telemetry: { label: string; value: string; badgeClass: string }[];
}

export const OrbitFeatureBanner: React.FC = () => {
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>('');
  const [customResponse, setCustomResponse] = useState<{
    prompt: string;
    text: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const scenarios: PromptScenario[] = [
    {
      id: 'runway',
      pillLabel: 'Runway & Equilibrium',
      icon: Compass,
      userPrompt: 'Analyze my runway if I increase deep work hours and reduce consulting next quarter.',
      badge: 'Synthesis Complete · 3 Modules Queried (Finance, Time, Brain)',
      badgeColor: 'cyan',
      response: 'With your current $42.8k cash reserve and $3,200/mo baseline burn, shifting 15 hrs/wk from client consulting to core software development extends your self-funding runway by 4.2 months while keeping your Equilibrium Score at 91/100.',
      telemetry: [
        { label: 'Runway Delta', value: '+4.2 Months', badgeClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20' },
        { label: 'Equilibrium', value: '91 / 100', badgeClass: 'text-[#0071e3] dark:text-[#64d2ff] bg-blue-500/10 dark:bg-[#64d2ff]/15 border-blue-500/20' },
        { label: 'Monthly Burn', value: '-$820 / mo', badgeClass: 'text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500/20' }
      ]
    },
    {
      id: 'burnout',
      pillLabel: 'Burnout Guardrail',
      icon: Activity,
      userPrompt: 'My sleep dropped to 5.4h for 3 consecutive nights. What should I reschedule?',
      badge: 'Guardrail Alert · Biometric Threshold Breached',
      badgeColor: 'amber',
      response: 'Cognitive recovery is down to 48%. Autonomously deferred 2 non-critical design reviews to Thursday morning and protected a 90-minute restorative downtime block today at 2:00 PM to prevent executive fatigue.',
      telemetry: [
        { label: 'Recovery Score', value: '48% (Deficit)', badgeClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/20' },
        { label: 'Auto-Deferred', value: '2 Review Tasks', badgeClass: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/20' },
        { label: 'Protected Slot', value: '14:00 - 15:30', badgeClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20' }
      ]
    },
    {
      id: 'deepwork',
      pillLabel: 'Deep Work Reschedule',
      icon: Clock,
      userPrompt: 'Stakeholder demo ran 45 minutes over. Optimize my remaining evening blocks.',
      badge: 'Schedule Rebalanced · 0 Deadlines Missed',
      badgeColor: 'cyan',
      response: "Shifted 'Q3 Systems Refactor' to tomorrow's 09:30 AM peak cognitive energy window. Compacted your evening reading habit to 20 minutes and preserved your 6:30 PM zone-2 workout without cortisol disruption.",
      telemetry: [
        { label: 'Rescheduled Slot', value: 'Tomorrow 09:30', badgeClass: 'text-[#0071e3] dark:text-[#64d2ff] bg-blue-500/10 dark:bg-[#64d2ff]/15 border-blue-500/20' },
        { label: 'Habit Buffer', value: '20m Compacted', badgeClass: 'text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500/20' },
        { label: 'Workout Integrity', value: '100% Preserved', badgeClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20' }
      ]
    }
  ];

  const activeScenario = scenarios[activeScenarioIndex];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsProcessing(true);
    const userQuery = inputValue.trim();

    setTimeout(() => {
      setCustomResponse({
        prompt: userQuery,
        text: `Orbit synthesized context across all 8 pillars for "${userQuery}": All financial runway parameters, active milestones, and biometric recovery schedules are aligned with zero detected scheduling conflicts.`
      });
      setIsProcessing(false);
      setInputValue('');
    }, 350);
  };

  const handleSelectScenario = (index: number) => {
    setActiveScenarioIndex(index);
    setCustomResponse(null);
  };

  const pillarsList = [
    'Tasks',
    'Finance',
    'Brain',
    'Habits',
    'Health',
    'Vault',
    'Time',
    'Journal'
  ];

  return (
    <section id="orbit-ai" className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background Apple Intelligence Ambient Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-40 dark:opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(100, 210, 255, 0.22) 0%, rgba(94, 92, 230, 0.16) 45%, rgba(191, 90, 242, 0.1) 75%, transparent 100%)'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Unified Apple Intelligence Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          
          {/* ── LEFT HERO BENTO CARD (lg:col-span-7) ── */}
          <div className="lg:col-span-7 rounded-[28px] sm:rounded-[32px] apple-card p-6 sm:p-8 lg:p-10 relative overflow-hidden flex flex-col justify-between border border-black/[0.06] dark:border-white/[0.12] bg-white/70 dark:bg-[#16171d]/75 backdrop-blur-2xl shadow-xl dark:shadow-none">
            
            {/* Iridescent Corner Aura */}
            <div 
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[90px] pointer-events-none opacity-60 dark:opacity-40"
              style={{
                background: 'radial-gradient(circle, rgba(100, 210, 255, 0.35) 0%, rgba(94, 92, 230, 0.25) 50%, transparent 80%)'
              }}
            />

            <div className="relative z-10 space-y-6">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full apple-glass-pill text-[#0071e3] dark:text-[#64d2ff] text-xs font-medium border border-[#0071e3]/20 dark:border-[#64d2ff]/25 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#64d2ff] animate-pulse shrink-0" />
                <span>Apple Intelligence Tier Integration</span>
              </div>

              {/* Headline */}
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-apple-display tracking-apple-tight text-zinc-900 dark:text-white leading-[1.12]">
                Meet Orbit AI. An intelligence that{' '}
                <span className="text-gradient-aurora">understands your entire life.</span>
              </h2>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-apple-text leading-relaxed max-w-2xl">
                Conventional chatbots forget your context the second you close the window. Orbit stays deeply connected to your tasks, ledger balances, study schedules, and biometric goals to offer actionable synthesis.
              </p>

              {/* Interactive Live Copilot Simulation Container */}
              <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.10] bg-black/[0.02] dark:bg-black/35 p-4 sm:p-5 space-y-4 backdrop-blur-md">
                
                {/* Scenario Selection Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold mr-1 select-none">
                    Simulate:
                  </span>
                  {scenarios.map((scenario, idx) => {
                    const IconComponent = scenario.icon;
                    const isActive = activeScenarioIndex === idx && !customResponse;
                    return (
                      <button
                        key={scenario.id}
                        type="button"
                        onClick={() => handleSelectScenario(idx)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-[#0071e3] text-white shadow-md shadow-[#0071e3]/25 border-transparent'
                            : 'bg-white/80 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.10] border border-black/[0.06] dark:border-white/[0.08]'
                        }`}
                      >
                        <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#0071e3] dark:text-[#64d2ff]'}`} />
                        <span>{scenario.pillLabel}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Copilot Response Terminal Card */}
                <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/95 dark:bg-[#181920]/90 p-4 sm:p-4.5 space-y-3 shadow-sm">
                  
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.06] pb-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#bf5af2] flex items-center justify-center p-0.5 shadow-sm">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-semibold font-apple-display text-zinc-900 dark:text-white">
                        Orbit Copilot
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/10 dark:bg-[#64d2ff]/15 text-[#0071e3] dark:text-[#64d2ff] font-medium border border-blue-500/20">
                        v3.2 Edge
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>18ms · Local Enclave</span>
                    </div>
                  </div>

                  {/* User Query Preview */}
                  <div className="text-xs font-apple-text text-zinc-500 dark:text-zinc-400 italic flex items-start space-x-2">
                    <span className="font-mono text-zinc-400 select-none">Q:</span>
                    <span>{customResponse ? customResponse.prompt : activeScenario.userPrompt}</span>
                  </div>

                  {/* Orbit Synthesis Output */}
                  <div className="text-xs sm:text-sm font-apple-text text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal">
                    {isProcessing ? (
                      <div className="flex items-center space-x-2 py-1 text-zinc-500">
                        <div className="w-2 h-2 rounded-full bg-[#0071e3] animate-ping" />
                        <span className="font-mono text-xs">Synthesizing relational telemetry across 8 pillars...</span>
                      </div>
                    ) : customResponse ? (
                      customResponse.text
                    ) : (
                      activeScenario.response
                    )}
                  </div>

                  {/* Telemetry Indicator Tags */}
                  {!customResponse && !isProcessing && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                      {activeScenario.telemetry.map((item, tIdx) => (
                        <div 
                          key={tIdx}
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-medium border ${item.badgeClass}`}
                        >
                          <span className="opacity-70">{item.label}:</span>
                          <span className="font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sleek macOS/iOS-styled Interactive Input Bar */}
                <form onSubmit={handleCustomSubmit} className="relative flex items-center">
                  <div className="absolute left-3.5 text-zinc-400 dark:text-zinc-500 pointer-events-none">
                    <Sparkles className="w-4 h-4 text-[#0071e3] dark:text-[#64d2ff]" />
                  </div>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask Orbit anything across your 8 pillars..."
                    className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-white dark:bg-black/50 border border-black/[0.1] dark:border-white/[0.12] text-xs font-apple-text text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40 focus:border-[#0071e3] transition-all shadow-inner"
                  />
                  <div className="absolute right-2 flex items-center space-x-1">
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isProcessing}
                      className="px-2.5 py-1 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-30 disabled:hover:bg-[#0071e3] text-white text-[11px] font-medium flex items-center space-x-1 transition-all cursor-pointer shadow-sm"
                    >
                      <span>Ask</span>
                      <CornerDownLeft className="w-3 h-3" />
                    </button>
                  </div>
                </form>

              </div>

              {/* 2 Capability Highlight Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
                <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5 hover:border-[#0071e3]/30 transition-colors">
                  <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-apple-display font-semibold text-xs sm:text-sm">
                    <BrainCircuit className="w-4 h-4 text-[#0071e3] dark:text-[#64d2ff] shrink-0" />
                    <span>Contextual Relational Graph</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-apple-text leading-relaxed">
                    Connects ledger transactions, task dependencies, and circadian patterns into a unified neural graph.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5 hover:border-[#bf5af2]/30 transition-colors">
                  <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-apple-display font-semibold text-xs sm:text-sm">
                    <Zap className="w-4 h-4 text-purple-600 dark:text-[#bf5af2] shrink-0" />
                    <span>Autonomous Time-Blocking</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-apple-text leading-relaxed">
                    Self-adjusting scheduling engine that rebalances time blocks whenever meetings run long or recovery dips.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* ── RIGHT BENTO STACK (lg:col-span-5) ── */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5 h-full">
            
            {/* Tile 1: 8 Pillars Unified */}
            <div className="apple-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-[#16171d]/75 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:border-[#0071e3]/30 dark:hover:border-[#64d2ff]/30 hover:scale-[1.01] group shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                    ARCHITECTURE
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 dark:bg-[#64d2ff]/15 flex items-center justify-center text-[#0071e3] dark:text-[#64d2ff] border border-blue-500/20">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl font-bold font-mono text-zinc-900 dark:text-white tracking-tight">
                    8 <span className="text-sm font-sans font-normal text-zinc-500 dark:text-zinc-400">Pillars</span>
                  </div>
                  <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-1 font-apple-display">
                    Unified Life Operating System
                  </div>
                </div>

                {/* Verticals Micro-Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {pillarsList.map((pillar) => (
                    <span 
                      key={pillar}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-black/[0.04] dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 border border-black/[0.04] dark:border-white/[0.06]"
                    >
                      {pillar}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] text-[11px] text-zinc-500 dark:text-zinc-400 font-apple-text">
                Zero siloed databases. Instant relational queries across domains.
              </div>
            </div>

            {/* Tile 2: Orbit AI Cross-Domain (< 20ms) */}
            <div className="apple-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-[#16171d]/75 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:border-cyan-500/30 hover:scale-[1.01] group shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                    EDGE CLOUD
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/15 flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl font-bold font-mono text-[#0071e3] dark:text-[#64d2ff] tracking-tight">
                    &lt; 20ms
                  </div>
                  <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-1 font-apple-display">
                    Cloudflare D1 Edge Network
                  </div>
                </div>

                {/* Live Green Pulse Badge */}
                <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-mono font-medium w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>D1 Edge Active</span>
                </div>
              </div>

              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] text-[11px] text-zinc-500 dark:text-zinc-400 font-apple-text">
                Sub-frame latency deployed across 300+ edge locations worldwide.
              </div>
            </div>

            {/* Tile 3: 100% Local-First Sovereignty */}
            <div className="apple-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-[#16171d]/75 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/30 hover:scale-[1.01] group shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                    SOVEREIGNTY
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                    100%
                  </div>
                  <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-1 font-apple-display">
                    Local-First Cryptographic Vault
                  </div>
                </div>

                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 text-[11px] font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Client AES-256-GCM</span>
                </div>
              </div>

              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] text-[11px] text-zinc-500 dark:text-zinc-400 font-apple-text">
                Private keys stay in your hardware enclave. Zero cloud key exposure.
              </div>
            </div>

            {/* Tile 4: Zero-Knowledge Shield & Guardrails */}
            <div className="apple-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-[#16171d]/75 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:border-purple-500/30 hover:scale-[1.01] group shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                    PRIVACY SHIELD
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 dark:bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-[#bf5af2] border border-purple-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl font-bold font-mono text-purple-600 dark:text-[#bf5af2] tracking-tight">
                    Zero <span className="text-sm font-sans font-normal text-zinc-500 dark:text-zinc-400">Telemetry</span>
                  </div>
                  <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-1 font-apple-display">
                    Proactive Guardrail Engines
                  </div>
                </div>

                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-[11px] font-mono">
                  <Check className="w-3 h-3 text-purple-500 shrink-0" />
                  <span>No Public Model Training</span>
                </div>
              </div>

              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] text-[11px] text-zinc-500 dark:text-zinc-400 font-apple-text">
                Local consent gates safeguard your data. Preempts burnout and cash depletion.
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
