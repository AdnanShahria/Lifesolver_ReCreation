import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Zap, 
  WifiOff, 
  Download,
  ArrowRight
} from 'lucide-react';

export const WhyChooseLifeSolver: React.FC = () => {
  const cards = [
    {
      icon: ShieldCheck,
      title: "Privacy as an Invariant",
      desc: "Your data is yours alone. Local-first architecture and client-side AES-256 mean zero third-party telemetry, zero ad tracking, and mathematical privacy.",
      status: "Zero-Knowledge"
    },
    {
      icon: Layers,
      title: "Harmonious Unification",
      desc: "Eliminate context switching. LifeSolver unifies tasks, finances, notes, study cards, and habits into a single, synchronized relational graph.",
      status: "Relational Sync"
    },
    {
      icon: Sparkles,
      title: "Autonomous Orbit AI",
      desc: "Orbit anticipates bottlenecks across domains. From auto-adjusting schedules to testing cash flow runway, it acts as an intelligent executive copilot.",
      status: "Multi-Domain"
    },
    {
      icon: Zap,
      title: "Instant Edge Architecture",
      desc: "Zero loading spinners. Built on Cloudflare distributed D1 SQLite at 300+ global edge nodes, ensuring sub-20ms responsiveness across any device.",
      status: "Sub-20ms Latency"
    },
    {
      icon: WifiOff,
      title: "Deterministic Offline Operation",
      desc: "Offline-first IndexedDB and Drift SQLite engine mean full capability at 35,000 feet. Changes queue safely and reconcile deterministically upon reconnect.",
      status: "Local-First"
    },
    {
      icon: Download,
      title: "True Data Sovereignty",
      desc: "Zero vendor lock-in. Export your full relational graph to clean JSON, CSV, or formatted PDF dossiers at any instant with one click.",
      status: "Open Export"
    }
  ];

  return (
    <section id="why" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full apple-glass-pill text-[#64d2ff] text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#64d2ff]" />
            <span>Architectural Integrity</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-apple-display tracking-apple-tight text-white mb-4">
            Engineered for uncompromising trust.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 font-apple-text">
            Every layer was architected from first principles to deliver speed, privacy, and systemic peace of mind.
          </p>
        </div>

        {/* 6 Apple Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="apple-card p-6 sm:p-7 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#64d2ff] mb-5 shadow-inner group-hover:scale-105 transition-transform duration-300">
                    <Icon className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <h3 className="text-lg font-bold font-apple-display text-white mb-2 tracking-tight group-hover:text-[#64d2ff] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 font-apple-text leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500">
                  <span className="uppercase tracking-wider">Status</span>
                  <span className="text-[#64d2ff] font-medium">{card.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
