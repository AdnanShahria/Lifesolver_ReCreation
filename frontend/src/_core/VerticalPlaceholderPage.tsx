import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { Sidebar } from './Sidebar';
import {
  BrainCircuit,
  Activity,
  Timer,
  PackageCheck,
  Users,
  Sparkles,
  Settings,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  CalendarClock,
  WalletCards
} from 'lucide-react';

interface VerticalMeta {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  color: string;
  features: string[];
}

const VERTICAL_METADATA: Record<string, VerticalMeta> = {
  mind: {
    id: 'mind',
    name: 'Mind OS',
    tagline: 'Cognitive retention, second brain & psychological reflection',
    description:
      'Markdown Knowledge Base, SM-2 Spaced Repetition Flashcards, PDF text extraction, and Daily Mood & Reflection Journal.',
    icon: BrainCircuit,
    color: 'from-violet-500 to-indigo-600',
    features: [
      '12-Color Masonry Notes Grid',
      'SuperMemo SM-2 Flashcards with review intervals',
      'Second Brain URL Bookmarks & PDF RAG search',
      'Daily Micro-Journal & Mood Tracker'
    ]
  },
  health: {
    id: 'health',
    name: 'Health OS',
    tagline: 'Frictionless wellness, workouts & habit telemetry',
    description:
      'Behavioral habit streaks with server-computed validation, Gym workout routines with set/rep tracking, and minimalist daily vitals scorecards.',
    icon: Activity,
    color: 'from-emerald-500 to-teal-600',
    features: [
      'Daily & Frequency Habit Streaks (Server-Side)',
      'Custom Gym Routines & Exercise PR Logging',
      'Minimalist Vitals: Water, Protein, Sleep & Readiness',
      '30-Day Interactive Heatmaps'
    ]
  },
  focus: {
    id: 'focus',
    name: 'Focus OS',
    tagline: 'Deep work telemetry, dopamine detox & digital mindfulness',
    description:
      'Pomodoro interval timers, Chrome Extension edge screen time sync, distraction blocker, and emergency dopamine detox gates.',
    icon: Timer,
    color: 'from-cyan-500 to-blue-600',
    features: [
      'Configurable 25/5 & 50/10 Pomodoro Timers',
      'Edge-Synced Website Blacklists via Chrome MV3',
      'Feed Eradicator (YouTube, Twitter, LinkedIn)',
      'Checkout Gate (E-commerce Cooling-Off Period)'
    ]
  },
  assets: {
    id: 'assets',
    name: 'Assets OS',
    tagline: 'Physical equipment lifecycle & zero-knowledge document vault',
    description:
      'Track valuable gadgets, servicing records, warranty countdowns, and client-side AES-GCM-256 encrypted personal records.',
    icon: PackageCheck,
    color: 'from-amber-500 to-orange-600',
    features: [
      'Physical Inventory & Servicing History',
      'Warranty Expiry Reminders (30-day & 7-day triggers)',
      'Client-Side AES-GCM-256 Document Vault',
      'Purchase & Sold Financial Integration'
    ]
  },
  network: {
    id: 'network',
    name: 'Network OS',
    tagline: 'Personal relationship management with complete privacy',
    description:
      'Personal CRM: track important personal commitments, birthdays, anniversaries, and automated outreach cadence reminders.',
    icon: Users,
    color: 'from-pink-500 to-rose-600',
    features: [
      'Personal CRM & Important Dates (Birthdays, Anniversaries)',
      'Cadence-Based Outreach Reminders',
      'Personal Commitments & Notes',
      'Privacy-First Isolated Storage'
    ]
  },
  copilot: {
    id: 'copilot',
    name: 'Orbit AI Copilot',
    tagline: 'Omniscient multi-intent engine orchestrating all 8 verticals',
    description:
      'Natural language command execution, multi-intent structured tool calling, and action preview cards with zero destructive auto-writes.',
    icon: Sparkles,
    color: 'from-violet-600 to-fuchsia-600',
    features: [
      'Orbit AI Omnibar (Ctrl+K Command Palette)',
      'Multi-Intent Tool Calling (e.g. Expense + Task created together)',
      'Interactive Action Preview & Confirmation Cards',
      'Daily Morning Briefings & Proactive Focus Insights'
    ]
  },
  admin: {
    id: 'admin',
    name: 'SysAdmin & Telemetry Matrix',
    tagline: 'Cloudflare edge observability, bindings inspector & user control',
    description:
      'Real-time edge health probes, D1 database inspection, Vectorize status, Cloudflare Queues, and user administration.',
    icon: ShieldCheck,
    color: 'from-slate-700 to-zinc-900',
    features: [
      'Edge Telemetry & 0ms Cold Start Benchmarks',
      'Cloudflare D1, R2, KV & Vectorize Status Grid',
      'User Administration & Plan Tier Enforcement',
      'Service Provider Abstraction Layer Inspection'
    ]
  },
  settings: {
    id: 'settings',
    name: 'System Settings',
    tagline: 'Personalization, theme, currency & dock preferences',
    description:
      'Manage profile credentials, appearance, preferred currency (BDT, USD, EUR, INR), language (English / Bengali), and notification preferences.',
    icon: Settings,
    color: 'from-zinc-600 to-slate-800',
    features: [
      'Theme & Apple Design Preferences',
      'Multi-Currency & Regional Settings',
      'Bilingual Support (English / Bengali)',
      'Cloud Backup & Storage Sync'
    ]
  },
  support: {
    id: 'support',
    name: 'Help & Documentation',
    tagline: 'Guides, API reference & feature-per-file architecture',
    description:
      'Comprehensive documentation covering the 8 Core Verticals, Cloudflare architecture, Flutter mobile setup, and keyboard shortcuts.',
    icon: HelpCircle,
    color: 'from-sky-500 to-indigo-600',
    features: [
      '8 Core Verticals User Manual',
      'Keyboard Shortcuts (⌘K, N, ⌘1-8)',
      'Cloudflare Architecture & D1 Setup',
      'Contact Support & Feature Feedback'
    ]
  }
};

export const VerticalPlaceholderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, isDark, toggleTheme } = useTheme();

  // Extract vertical key from path (e.g. '/mind' -> 'mind')
  const pathKey = location.pathname.replace(/^\//, '').split('/')[0] || 'mind';
  const meta = VERTICAL_METADATA[pathKey] || VERTICAL_METADATA.mind;
  const Icon = meta.icon;

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-200 selection:bg-violet-500/20 selection:text-violet-900 ${
      isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#f5f5f7] text-zinc-900'
    }`}>
      {/* ── Global Apple HIG Sidebar ── */}
      <Sidebar currentVertical={meta.id as any} theme={theme} onToggleTheme={toggleTheme} />

      {/* ── Main Canvas ── */}
      <main className={`flex-1 flex flex-col min-w-0 overflow-y-auto transition-colors duration-200 ${
        isDark ? 'bg-[#09090b]' : 'bg-[#fafafa]'
      }`}>
        {/* Header */}
        <header className={`h-16 px-8 border-b flex items-center justify-between shrink-0 backdrop-blur-xl sticky top-0 z-10 transition-colors ${
          isDark
            ? 'bg-[#0c0d12]/80 border-white/[0.08] text-white shadow-xs'
            : 'bg-white/80 border-black/[0.06] text-zinc-900 shadow-xs'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-white shadow-sm`}>
              <Icon className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">{meta.name}</h1>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{meta.tagline}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => navigate('/planner')}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5 ${
                isDark
                  ? 'bg-zinc-800/80 border-white/[0.08] hover:bg-zinc-700 text-zinc-200'
                  : 'bg-white border-black/[0.08] hover:bg-[#f5f5f7] text-zinc-900'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5 text-violet-500" />
              <span>Go to Tasks</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/finance')}
              className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs font-semibold text-white shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <WalletCards className="w-3.5 h-3.5" />
              <span>Open Finance</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="max-w-4xl mx-auto w-full p-8 space-y-8">
          {/* Hero Banner Card */}
          <div className={`p-8 rounded-3xl border shadow-sm space-y-4 transition-colors ${
            isDark
              ? 'bg-[#12131a] border-white/[0.08]'
              : 'bg-white border-black/[0.06]'
          }`}>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LifeSolver v3.2 Core Vertical</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {meta.name}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                {meta.description}
              </p>
            </div>
          </div>

          {/* Core Feature Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Module Architecture &amp; Capabilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {meta.features.map((feat, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all flex items-start space-x-3 ${
                    isDark
                      ? 'bg-[#12131a] border-white/[0.08] hover:border-white/[0.14]'
                      : 'bg-white border-black/[0.06] hover:shadow-md'
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{feat}</h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Fully integrated with D1, R2, and Orbit AI Copilot.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts Card */}
          <div className={`p-6 rounded-3xl border flex items-center justify-between transition-colors ${
            isDark
              ? 'bg-[#12131a] border-white/[0.08]'
              : 'bg-[#f5f5f7] border-black/[0.06]'
          }`}>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Active Verticals</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Jump straight to Planner (Tasks &amp; Calendar) or Finance (Dual Cash Ledgers).
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => navigate('/planner')}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition-all"
              >
                <span>Open Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
