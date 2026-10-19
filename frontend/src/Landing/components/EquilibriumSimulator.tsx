import React, { useState } from 'react';
import { 
  Sliders, 
  Activity, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Flame, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

interface SimulatorProps {
  onOpenAuth: () => void;
}

export const EquilibriumSimulator: React.FC<SimulatorProps> = ({ onOpenAuth }) => {
  const [planning, setPlanning] = useState(68);
  const [focus, setFocus] = useState(55);
  const [retention, setRetention] = useState(48);
  const [finance, setFinance] = useState(72);

  // Computed Life Equilibrium Score
  const equilibriumScore = Math.round(
    planning * 0.3 + focus * 0.3 + retention * 0.2 + finance * 0.2
  );

  const getDiagnosis = (score: number) => {
    if (score < 45) {
      return {
        level: "High Cognitive Entropy",
        desc: "Fragmented tools and constant context switches are leaking dopamine, focus, and capital.",
        color: "text-[#ff453a]",
        badgeBg: "bg-[#ff453a]/10 border-[#ff453a]/25 text-[#ff453a]"
      };
    } else if (score < 70) {
      return {
        level: "Fragmented Cadence",
        desc: "Individual tasks are being completed, but cross-module data isolation prevents long-term compounding.",
        color: "text-[#ff9f0a]",
        badgeBg: "bg-[#ff9f0a]/10 border-[#ff9f0a]/25 text-[#ff9f0a]"
      };
    } else if (score < 88) {
      return {
        level: "Strong Operating Velocity",
        desc: "Disciplined personal habits. Unifying into LifeSolver will eliminate the remaining 12% of administrative drag.",
        color: "text-[#0a84ff]",
        badgeBg: "bg-[#0071e3]/10 border-[#0071e3]/25 text-[#64d2ff]"
      };
    } else {
      return {
        level: "Sovereign Institutional Mastery",
        desc: "Peak equilibrium. Full mathematical alignment across planning, intellect, focus, and financial sovereignty.",
        color: "text-[#30d158]",
        badgeBg: "bg-[#30d158]/10 border-[#30d158]/25 text-[#30d158]"
      };
    }
  };

  const diagnosis = getDiagnosis(equilibriumScore);

  // SVG Circular Activity Ring
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (equilibriumScore / 100) * circumference;

  const hoursLost = Math.max(2, Math.round(18 - (equilibriumScore * 0.16)));
  const hoursReclaimed = Math.round((equilibriumScore * 0.15) + 6);

  return (
    <section id="simulator" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full apple-glass-pill text-[#64d2ff] text-xs font-medium mb-4">
            <Activity className="w-3.5 h-3.5 text-[#64d2ff]" />
            <span>Diagnostic Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-apple-display tracking-apple-tight text-white mb-4">
            Simulate your systemic Life Equilibrium.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 font-apple-text">
            Calibrate your current operational state across 4 pillars to quantify cognitive leakage and projected LifeSolver recovery.
          </p>
        </div>

        {/* Simulator Grid */}
        <div className="rounded-[32px] apple-card p-6 sm:p-10 border border-white/[0.12] relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: 4 Apple Sliders */}
            <div className="lg:col-span-7 space-y-6">
              {/* Slider 1 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-zinc-200 font-apple-display font-medium">
                    1. Daily Time-Blocking & Task Discipline
                  </span>
                  <span className="font-mono text-[#64d2ff] font-bold">{planning}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={planning}
                  onChange={(e) => setPlanning(Number(e.target.value))}
                  className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-[#0071e3]"
                />
              </div>

              {/* Slider 2 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-zinc-200 font-apple-display font-medium">
                    2. Deep Work & Distraction Immunity
                  </span>
                  <span className="font-mono text-amber-400 font-bold">{focus}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={focus}
                  onChange={(e) => setFocus(Number(e.target.value))}
                  className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Slider 3 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-zinc-200 font-apple-display font-medium">
                    3. Second Brain Retention (SM-2 Spaced Recall)
                  </span>
                  <span className="font-mono text-indigo-400 font-bold">{retention}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={retention}
                  onChange={(e) => setRetention(Number(e.target.value))}
                  className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
              </div>

              {/* Slider 4 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-zinc-200 font-apple-display font-medium">
                    4. Financial Runway & Cash Flow Clarity
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{finance}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={finance}
                  onChange={(e) => setFinance(Number(e.target.value))}
                  className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Metric Impact Summary */}
              <div className="pt-2 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                  <span className="text-zinc-400 font-apple-text">Cognitive Leak Drag</span>
                  <div className="text-lg font-bold font-mono text-[#ff453a]">~{hoursLost} hrs/week</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                  <span className="text-zinc-400 font-apple-text">Potential Recovery</span>
                  <div className="text-lg font-bold font-mono text-emerald-400">+{hoursReclaimed} hrs/week</div>
                </div>
              </div>
            </div>

            {/* Right Column: Apple Activity Circular Ring & Diagnostic Badge */}
            <div className="lg:col-span-5 flex flex-col items-center text-center p-6 rounded-2xl bg-black/40 border border-white/[0.08] space-y-5">
              
              {/* Apple Activity Circular Ring */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  {/* Track Background */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Animated Active Ring */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#0071e3"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    fill="transparent"
                    style={{ transition: 'stroke-dashoffset 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                </svg>

                {/* Score in Center */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
                    {equilibriumScore}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                    Out of 100
                  </span>
                </div>
              </div>

              {/* Diagnostic Label */}
              <div className="space-y-2">
                <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider border ${diagnosis.badgeBg}`}>
                  <span>{diagnosis.level}</span>
                </div>
                <p className="text-xs text-zinc-300 font-apple-text leading-relaxed max-w-xs">
                  {diagnosis.desc}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={onOpenAuth}
                className="w-full py-3.5 rounded-full apple-btn-primary flex items-center justify-center space-x-2 text-xs font-semibold"
              >
                <span>Calibrate on LifeSolver</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
