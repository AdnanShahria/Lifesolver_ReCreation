import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  Globe, 
  Cpu, 
  Key, 
  Binary, 
  Layers, 
  CheckCircle2, 
  WifiOff 
} from 'lucide-react';

export const SecurityArchitecture: React.FC = () => {
  const specs = [
    {
      icon: Lock,
      title: "Client-Side Zero-Knowledge Enclave",
      tech: "AES-GCM-256 · PBKDF2 (100k Iterations)",
      desc: "Your assets vault, confidential journal, and private credentials are encrypted in local memory before sync. We hold zero keys and have mathematically zero ability to decrypt your data."
    },
    {
      icon: Globe,
      title: "Sub-20ms Cloudflare Distributed Edge",
      tech: "Cloudflare Workers · D1 Distributed SQLite",
      desc: "Deployed across 300+ edge locations worldwide. Your personal operating system executes closer to you than light takes to traverse an ocean. Zero central bottlenecks."
    },
    {
      icon: Database,
      title: "Relational Cascade Integrity",
      tech: "24 Normalized Relational Tables · Strict Foreign Keys",
      desc: "Unlike chaotic NoSQL documents that suffer silent schema corruption, every task, habit, and ledger row is bound by mathematical foreign keys. Your life graph never rots."
    },
    {
      icon: WifiOff,
      title: "Offline-First Deterministic Outbox",
      tech: "Local-First IndexedDB · Drift SQLite Engine",
      desc: "Full execution remains instant whether offline or in transit. All mutations queue locally and reconcile deterministically when network connectivity resumes."
    }
  ];

  return (
    <section id="architecture" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full apple-glass-pill text-emerald-400 text-xs font-medium mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographic & Edge Rigor</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-apple-display tracking-apple-tight text-white mb-4">
            Security Enclave Standards. Mathematically verified.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 font-apple-text">
            We don't ask for blind trust; we guarantee it through client-side encryption, local-first execution, and zero telemetry.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {specs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="apple-card p-6 sm:p-8 space-y-4 hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-emerald-400 shadow-inner">
                    <Icon className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
                    Standard 0{idx + 1}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-apple-display text-white tracking-tight mb-1">
                    {item.title}
                  </h3>
                  <div className="text-xs font-mono text-emerald-400 font-semibold mb-3">
                    {item.tech}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 font-apple-text leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Policy Bar */}
        <div className="mt-8 p-5 rounded-2xl apple-card border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-300">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-apple-text">
              <strong className="text-white font-semibold">Zero-Telemetry Mandate:</strong> We do not track keystrokes, sell customer profiles, or load third-party ad scripts.
            </span>
          </div>
          <span className="font-mono text-zinc-400 shrink-0">SHA-256 Verified · Cloudflare Edge</span>
        </div>
      </div>
    </section>
  );
};
