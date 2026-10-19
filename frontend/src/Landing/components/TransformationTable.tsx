import React from 'react';
import { 
  Check, 
  X, 
  Zap, 
  Layers, 
  Split, 
  ShieldAlert, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const TransformationTable: React.FC = () => {
  const comparisons = [
    {
      domain: "Daily Execution",
      chaos: "Tasks isolated in Todoist/Notion. Calendar unaware of workout times. Constant context-switching.",
      sovereign: "Planner, Health, and Calendar synchronized in one unified grid with automatic ripple adaptation."
    },
    {
      domain: "Second Brain & Knowledge",
      chaos: "Articles bookmarked and never read. Notes scattered across 3 apps with zero active recall.",
      sovereign: "Integrated Markdown Second Brain with algorithmic SM-2 spaced repetition for permanent retention."
    },
    {
      domain: "Financial Awareness",
      chaos: "Check banking apps in dread once a week. Budgeting spreadsheets forgotten after 12 days.",
      sovereign: "Dual-ledger cash tracking (Standard vs Discretionary) with live runway countdown & burn rates."
    },
    {
      domain: "Focus & Attention Shield",
      chaos: "Algorithmic social feeds hijack your willpower. Screen time averages 5+ hours of administrative chaos.",
      sovereign: "Chrome MV3 screen time sync, Feed Eradicator, and strict Pomodoro deep-work enforcement."
    },
    {
      domain: "Personal Assets & Vault",
      chaos: "Warranties lost in emails, passwords in insecure notes, device maintenance neglected.",
      sovereign: "Zero-knowledge AES-256 vault with warranty countdowns, equipment logs, and title deeds."
    },
    {
      domain: "AI Copilot Experience",
      chaos: "Isolated chatbot with zero memory of your goals, bank accounts, calendar, or health stats.",
      sovereign: "Orbit AI Omniscient Copilot with full context across all 8 verticals, action preview cards & consent gates."
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full apple-glass-pill text-[#64d2ff] text-xs font-medium mb-4">
            <Split className="w-3.5 h-3.5 text-[#64d2ff]" />
            <span>The Transformation</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-apple-display tracking-apple-tight text-white mb-4">
            Compare the architectures.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 font-apple-text">
            See how LifeSolver replaces fragmented cognitive drag with mathematical harmony.
          </p>
        </div>

        {/* Apple Comparison Matrix Table */}
        <div className="rounded-[28px] apple-card border border-white/[0.10] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03] text-xs font-apple-display uppercase tracking-wider text-zinc-400">
                  <th className="py-5 px-6 w-1/4">Life Dimension</th>
                  <th className="py-5 px-6 w-3/8 text-zinc-400 bg-white/[0.01]">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-zinc-400">
                        <X className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span>Conventional Fragmented Stack</span>
                    </div>
                  </th>
                  <th className="py-5 px-6 w-3/8 text-white bg-[#0071e3]/10 font-bold">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-[#0071e3] flex items-center justify-center text-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-[#64d2ff]">LifeSolver Omniscient OS</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs sm:text-sm">
                {comparisons.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-5 px-6 font-apple-display font-semibold text-white">
                      {row.domain}
                    </td>
                    <td className="py-5 px-6 text-zinc-400 bg-white/[0.01] leading-relaxed font-apple-text">
                      {row.chaos}
                    </td>
                    <td className="py-5 px-6 text-zinc-100 bg-[#0071e3]/[0.04] font-medium leading-relaxed font-apple-text">
                      {row.sovereign}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
