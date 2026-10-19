import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Brain, 
  Wallet, 
  Activity, 
  Flame, 
  Shield, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Play, 
  Pause, 
  RotateCcw, 
  Lock, 
  Unlock, 
  ArrowRight, 
  Clock, 
  FileText, 
  Zap, 
  Heart, 
  ShieldCheck, 
  Eye, 
  TrendingUp,
  Droplet,
  Check
} from 'lucide-react';

export const VerticalsBento: React.FC = () => {
  // 1. Planner State
  const [plannerChecked, setPlannerChecked] = useState(false);

  // 2. Mind State: Flashcard flip
  const [isFlipped, setIsFlipped] = useState(false);

  // 3. Finance State: Ledger toggle
  const [ledgerType, setLedgerType] = useState<'standard' | 'special'>('standard');

  // 4. Health State: Habits
  const [habit1, setHabit1] = useState(true);
  const [habit2, setHabit2] = useState(false);

  // 5. Focus State: Playable Pomodoro Timer
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isFocusRunning && focusSeconds > 0) {
      interval = setInterval(() => {
        setFocusSeconds(s => s - 1);
      }, 1000);
    } else if (focusSeconds === 0) {
      setIsFocusRunning(false);
    }
    return () => clearInterval(interval);
  }, [isFocusRunning, focusSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 6. Assets State: Vault lock
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);

  // 7. Network State: Follow-up logged
  const [networkAlertSent, setNetworkAlertSent] = useState(false);

  // 8. Copilot State: Input
  const [copilotQuery, setCopilotQuery] = useState("Reconcile runway with next quarter hire");
  const [copilotExecuted, setCopilotExecuted] = useState(false);

  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full apple-glass-pill text-[#64d2ff] text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#64d2ff]" />
            <span>The 8 Core Verticals</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-apple-display tracking-apple-tight text-white mb-4">
            Every dimension of life. Unified by design.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 font-apple-text">
            Interactive, responsive, and synchronized. Explore any module below to experience its live capabilities.
          </p>
        </div>

        {/* Apple Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* 1. PLANNER */}
          <div className="apple-card p-5 sm:p-6 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#64d2ff]">
                  <Calendar className="w-5 h-5 stroke-[1.75]" />
                </div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  01 · Daily Flow
                </span>
              </div>
              <h3 className="text-lg font-bold font-apple-display text-white mb-2">
                Executive Planner
              </h3>
              <p className="text-xs text-zinc-400 font-apple-text leading-relaxed mb-4">
                Eisenhower matrix and adaptive time-blocking that reschedules automatically.
              </p>
            </div>

            {/* Micro-Interactive Widget */}
            <div 
              onClick={() => setPlannerChecked(!plannerChecked)}
              className="p-3 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between cursor-pointer hover:border-[#0071e3]/40 transition-all select-none"
            >
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  plannerChecked ? 'bg-[#0071e3] border-[#0071e3] text-white' : 'border-white/30'
                }`}>
                  {plannerChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className={`text-xs truncate ${plannerChecked ? 'line-through text-zinc-500' : 'text-zinc-200 font-medium'}`}>
                  Review Board Materials
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#64d2ff] shrink-0">
                {plannerChecked ? "Done" : "Tap"}
              </span>
            </div>
          </div>

          {/* 2. MIND (SECOND BRAIN) */}
          <div className="apple-card p-5 sm:p-6 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-indigo-400">
                  <Brain className="w-5 h-5 stroke-[1.75]" />
                </div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  02 · Intellect
                </span>
              </div>
              <h3 className="text-lg font-bold font-apple-display text-white mb-2">
                Mind & Second Brain
              </h3>
              <p className="text-xs text-zinc-400 font-apple-text leading-relaxed mb-4">
                Bidirectional notes with algorithmic SuperMemo SM-2 spaced repetition.
              </p>
            </div>

            {/* Micro-Interactive Flip Card */}
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] cursor-pointer hover:border-indigo-500/40 transition-all select-none min-h-[58px] flex flex-col justify-center"
            >
              <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                <span>SM-2 Card</span>
                <span className="text-zinc-500">Click to Flip</span>
              </div>
              <div className="text-xs font-medium text-zinc-200 mt-1">
                {isFlipped 
                  ? "A: Spaced intervals compound retention up to 340%." 
                  : "Q: What is the spacing effect in long-term memory?"}
              </div>
            </div>
          </div>

          {/* 3. FINANCE */}
          <div className="apple-card p-5 sm:p-6 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-5 h-5 stroke-[1.75]" />
                </div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  03 · Capital
                </span>
              </div>
              <h3 className="text-lg font-bold font-apple-display text-white mb-2">
                Sovereign Finance
              </h3>
              <p className="text-xs text-zinc-400 font-apple-text leading-relaxed mb-4">
                Dual-ledger accounting with live runway countdowns and zero banking data leaks.
              </p>
            </div>

            {/* Micro-Interactive Ledger Switch */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setLedgerType('standard')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors ${
                      ledgerType === 'standard' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setLedgerType('special')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors ${
                      ledgerType === 'special' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Runway
                  </button>
                </div>
                <span className="text-xs font-mono font-bold text-white">
                  {ledgerType === 'standard' ? '$14,250' : '24.2 Mo'}
                </span>
              </div>
            </div>
          </div>

          {/* 4. HEALTH & BIOMETRICS */}
          <div className="apple-card p-5 sm:p-6 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-rose-400">
                  <Activity className="w-5 h-5 stroke-[1.75]" />
                </div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  04 · Vitality
                </span>
              </div>
              <h3 className="text-lg font-bold font-apple-display text-white mb-2">
                Health & Habits
              </h3>
              <p className="text-xs text-zinc-400 font-apple-text leading-relaxed mb-4">
                Circadian alignment, atomic habit streaks, and restorative sleep metrics.
              </p>
            </div>

            {/* Micro-Interactive Habit Toggles */}
            <div className="space-y-1.5 p-2 rounded-xl bg-black/40 border border-white/[0.08]">
              <div 
                onClick={() => setHabit1(!habit1)}
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer text-xs select-none"
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    habit1 ? 'bg-rose-500 border-rose-500 text-white' : 'border-white/30'
                  }`}>
                    {habit1 && <Check className="w-2 h-2 stroke-[3]" />}
                  </div>
                  <span className={habit1 ? 'text-zinc-200 font-medium' : 'text-zinc-400'}>Cardio Protocol</span>
                </div>
                <span className="text-[10px] font-mono text-rose-400">18d</span>
              </div>

              <div 
                onClick={() => setHabit2(!habit2)}
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer text-xs select-none"
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    habit2 ? 'bg-rose-500 border-rose-500 text-white' : 'border-white/30'
                  }`}>
                    {habit2 && <Check className="w-2 h-2 stroke-[3]" />}
                  </div>
                  <span className={habit2 ? 'text-zinc-200 font-medium' : 'text-zinc-400'}>Cold Plunge</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">0d</span>
              </div>
            </div>
          </div>

          {/* 5. FOCUS & POMODORO */}
          <div className="apple-card p-5 sm:p-6 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-400">
                  <Clock className="w-5 h-5 stroke-[1.75]" />
                </div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  05 · Attention
                </span>
              </div>
              <h3 className="text-lg font-bold font-apple-display text-white mb-2">
                Focus Shield
              </h3>
              <p className="text-xs text-zinc-400 font-apple-text leading-relaxed mb-4">
                Chrome MV3 extension with Feed Eradicator and strict deep-work timer.
              </p>
            </div>

            {/* Micro-Interactive Timer Widget */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between">
              <div>
                <div className="text-base font-bold font-mono text-white">
                  {formatTime(focusSeconds)}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  {isFocusRunning ? "FLOW ACTIVE" : "25M INTERVAL"}
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setIsFocusRunning(!isFocusRunning)}
                  className="p-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-amber-400 border border-white/10 transition-colors"
                  aria-label="Toggle focus timer"
                >
                  {isFocusRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setIsFocusRunning(false); setFocusSeconds(25 * 60); }}
                  className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 transition-colors"
                  title="Reset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 6. ASSETS & VAULT */}
          <div className="apple-card p-5 sm:p-6 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
                </div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  06 · Sovereign
                </span>
              </div>
              <h3 className="text-lg font-bold font-apple-display text-white mb-2">
                Assets & AES-256 Vault
              </h3>
              <p className="text-xs text-zinc-400 font-apple-text leading-relaxed mb-4">
                Client-side encrypted inventory for warranties, hardware keys, and titles.
              </p>
            </div>

            {/* Micro-Interactive Lock Toggle */}
            <div 
              onClick={() => setIsVaultUnlocked(!isVaultUnlocked)}
              className="p-3 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition-all select-none"
            >
              <div className="flex items-center space-x-2">
                {isVaultUnlocked ? (
                  <Unlock className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-4 h-4 text-cyan-400" />
                )}
                <span className="text-xs font-mono font-medium text-zinc-200">
                  {isVaultUnlocked ? "Vault Decrypted" : "Enclave Sealed"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                {isVaultUnlocked ? "AES OK" : "PBKDF2"}
              </span>
            </div>
          </div>

          {/* 7. NETWORK & RELATIONSHIPS */}
          <div className="apple-card p-5 sm:p-6 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-purple-400">
                  <Users className="w-5 h-5 stroke-[1.75]" />
                </div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  07 · Alliances
                </span>
              </div>
              <h3 className="text-lg font-bold font-apple-display text-white mb-2">
                Network Intelligence
              </h3>
              <p className="text-xs text-zinc-400 font-apple-text leading-relaxed mb-4">
                Relational touchpoint logs, high-value cadence cadences, and zero stale ties.
              </p>
            </div>

            {/* Micro-Interactive Follow-Up Button */}
            <div 
              onClick={() => setNetworkAlertSent(true)}
              className="p-3 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between cursor-pointer hover:border-purple-500/40 transition-all select-none"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-xs text-zinc-200 font-medium">
                  {networkAlertSent ? "Touchpoint Queued" : "Lead Investor Follow-up"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-purple-400">
                {networkAlertSent ? "Logged" : "Queue"}
              </span>
            </div>
          </div>

          {/* 8. ORBIT AI COPILOT */}
          <div className="apple-card p-5 sm:p-6 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/15 border border-[#0071e3]/30 flex items-center justify-center text-[#64d2ff]">
                  <Sparkles className="w-5 h-5 stroke-[1.75]" />
                </div>
                <span className="text-[11px] font-mono text-[#64d2ff] uppercase tracking-wider font-semibold">
                  08 · Copilot
                </span>
              </div>
              <h3 className="text-lg font-bold font-apple-display text-white mb-2">
                Orbit Cross-Module AI
              </h3>
              <p className="text-xs text-zinc-400 font-apple-text leading-relaxed mb-4">
                Multi-intent reasoning engine with action approval cards and zero halluncinations.
              </p>
            </div>

            {/* Micro-Interactive Execution Test */}
            <div 
              onClick={() => setCopilotExecuted(!copilotExecuted)}
              className="p-3 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/25 flex items-center justify-between cursor-pointer hover:bg-[#0071e3]/20 transition-all select-none"
            >
              <div className="flex items-center space-x-2 overflow-hidden pr-1">
                <span className="w-2 h-2 rounded-full bg-[#64d2ff] shrink-0" />
                <span className="text-xs text-zinc-200 font-medium truncate">
                  {copilotExecuted ? "Runway model updated" : "Run cross-domain check"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#64d2ff] shrink-0 font-bold">
                {copilotExecuted ? "OK" : "Exec"}
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
