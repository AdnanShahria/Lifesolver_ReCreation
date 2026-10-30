import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import {
  LayoutGrid,
  CalendarClock,
  BrainCircuit,
  WalletCards,
  Activity,
  Timer,
  PackageCheck,
  Users,
  Sparkles,
  Settings,
  ShieldCheck,
  HelpCircle,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  ChevronsUpDown,
  Search,
  LogOut,
  User as UserIcon,
  Check,
  ExternalLink,
  Laptop
} from 'lucide-react';
import logoImg from '../assets/logo-192.png';

interface SidebarProps {
  currentVertical?:
    | 'dashboard'
    | 'planner'
    | 'mind'
    | 'finance'
    | 'health'
    | 'focus'
    | 'assets'
    | 'network'
    | 'copilot'
    | 'admin'
    | 'sysadmin'
    | 'settings'
    | 'support'
    | string;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentVertical = 'dashboard',
  theme: propTheme,
  onToggleTheme: propToggleTheme
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const globalTheme = useTheme();

  const theme = propTheme || globalTheme.theme;
  const onToggleTheme = propToggleTheme || globalTheme.toggleTheme;
  const isDark = theme === 'dark';

  // Sidebar expanded / collapsed state (persisted)
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('lifesolver_sidebar_expanded');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleSidebarExpanded = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('lifesolver_sidebar_expanded', String(next));
      return next;
    });
  };

  // Popover menus
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(e.target as Node)) {
        setWorkspaceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener (Alt/Option + 1-9 for core verticals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.altKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            navigate('/dashboard');
            break;
          case '2':
            e.preventDefault();
            navigate('/planner');
            break;
          case '3':
            e.preventDefault();
            navigate('/mind');
            break;
          case '4':
            e.preventDefault();
            navigate('/finance');
            break;
          case '5':
            e.preventDefault();
            navigate('/health');
            break;
          case '6':
            e.preventDefault();
            navigate('/focus');
            break;
          case '7':
            e.preventDefault();
            navigate('/assets');
            break;
          case '8':
            e.preventDefault();
            navigate('/network');
            break;
          case '9':
            e.preventDefault();
            navigate('/copilot');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // ── 8 Core Verticals strictly mapped per lifesolver-recreation.md Section 22 ──
  const coreVerticals = [
    {
      id: 'planner',
      label: 'Planner',
      subtitle: 'Tasks, Calendar & Goals',
      icon: CalendarClock,
      path: '/planner',
      badge: 'Active',
      shortcutKey: 'Alt+2',
      accentColor: 'text-violet-600 dark:text-violet-400',
      activeBg: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20'
    },
    {
      id: 'mind',
      label: 'Mind',
      subtitle: 'Second Brain & SM-2',
      icon: BrainCircuit,
      path: '/mind',
      badge: null,
      shortcutKey: 'Alt+3',
      accentColor: 'text-indigo-600 dark:text-indigo-400',
      activeBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20'
    },
    {
      id: 'finance',
      label: 'Finance',
      subtitle: 'Cash Ledgers & Budgets',
      icon: WalletCards,
      path: '/finance',
      badge: null,
      shortcutKey: 'Alt+4',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      activeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
    },
    {
      id: 'health',
      label: 'Health',
      subtitle: 'Habits, Gym & Vitals',
      icon: Activity,
      path: '/health',
      badge: null,
      shortcutKey: 'Alt+5',
      accentColor: 'text-rose-600 dark:text-rose-400',
      activeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
    },
    {
      id: 'focus',
      label: 'Focus',
      subtitle: 'Pomodoro & Edge Shield',
      icon: Timer,
      path: '/focus',
      badge: null,
      shortcutKey: 'Alt+6',
      accentColor: 'text-cyan-600 dark:text-cyan-400',
      activeBg: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20'
    },
    {
      id: 'assets',
      label: 'Assets',
      subtitle: 'Inventory & Encrypted Vault',
      icon: PackageCheck,
      path: '/assets',
      badge: null,
      shortcutKey: 'Alt+7',
      accentColor: 'text-amber-600 dark:text-amber-400',
      activeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
    },
    {
      id: 'network',
      label: 'Network',
      subtitle: 'Personal CRM & Dates',
      icon: Users,
      path: '/network',
      badge: null,
      shortcutKey: 'Alt+8',
      accentColor: 'text-pink-600 dark:text-pink-400',
      activeBg: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20'
    },
    {
      id: 'copilot',
      label: 'Copilot',
      subtitle: 'Orbit AI Engine',
      icon: Sparkles,
      path: '/copilot',
      badge: 'AI',
      shortcutKey: 'Alt+9',
      accentColor: 'text-fuchsia-600 dark:text-fuchsia-400',
      activeBg: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/20'
    }
  ];

  // ── System & Utilities ──
  const systemItems = [
    { id: 'admin', label: 'SysAdmin', icon: ShieldCheck, path: '/admin' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    { id: 'support', label: 'Support & Docs', icon: HelpCircle, path: '/support' }
  ];

  const isItemActive = (id: string, path: string) => {
    return id === currentVertical || location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <>
      <aside
        className={`hidden md:flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 select-none font-sans overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-64' : 'w-[72px]'
        } ${
          isDark
            ? 'bg-[#0c0d12] border-r border-white/[0.08] text-zinc-100'
            : 'bg-[#f5f5f7] border-r border-black/[0.08] text-zinc-900'
        }`}
      >
        {/* ── Fixed Top Header Section ── */}
        <div className="p-3 shrink-0 space-y-2.5">
          {/* Workspace Switcher & Brand Header */}
          <div className="relative" ref={workspaceMenuRef}>
            <div
              onClick={() => {
                if (isExpanded) {
                  setWorkspaceMenuOpen(!workspaceMenuOpen);
                } else {
                  toggleSidebarExpanded();
                }
              }}
              className={`flex items-center rounded-2xl p-2 cursor-pointer transition-all ${
                isDark
                  ? 'hover:bg-white/[0.06] border border-white/[0.08]'
                  : 'hover:bg-white border border-black/[0.06] bg-white/70 shadow-xs'
              } ${isExpanded ? 'justify-between space-x-2.5' : 'justify-center'}`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                {/* Fixed Image Logo from Assets */}
                <img
                  src={logoImg}
                  alt="LifeSolver"
                  className="w-9 h-9 rounded-2xl object-cover shrink-0 shadow-xs ring-1 ring-black/[0.08] dark:ring-white/[0.12]"
                />

                {isExpanded && (
                  <div className="min-w-0 text-left animate-in fade-in duration-200">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white truncate">
                        LifeSolver
                      </span>
                      <span className="px-1.5 py-0.2 rounded-md bg-violet-500/15 text-violet-700 dark:text-violet-300 text-[9px] font-mono font-bold border border-violet-500/30">
                        v3.2
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-medium">
                      AI Command Center
                    </div>
                  </div>
                )}
              </div>

              {isExpanded && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSidebarExpanded();
                  }}
                  title="Collapse Sidebar"
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Workspace Dropdown Popover */}
            {workspaceMenuOpen && isExpanded && (
              <div
                className={`absolute top-full left-0 mt-2 w-60 rounded-2xl p-2 shadow-2xl border z-50 animate-in fade-in zoom-in-95 ${
                  isDark
                    ? 'bg-[#18181b]/95 backdrop-blur-xl border-white/10 text-zinc-100 shadow-black/50'
                    : 'bg-white/95 backdrop-blur-xl border-black/[0.08] text-zinc-900 shadow-xl'
                }`}
              >
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Workspaces &amp; Plans
                </div>
                <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-violet-600" />
                    <span className="text-xs font-semibold">Personal Life OS</span>
                  </div>
                  <Check className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <div className="px-2.5 py-2 text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-black/[0.04] dark:border-white/[0.06] mt-1 flex items-center justify-between">
                  <span>Cloudflare D1 Native</span>
                  <span className="font-mono text-[10px] text-emerald-600 font-semibold">Online</span>
                </div>
              </div>
            )}
          </div>

          {/* Search Trigger / Command Bar (Apple HIG) */}
          {isExpanded ? (
            <button
              type="button"
              onClick={() => navigate('/copilot')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all border ${
                isDark
                  ? 'bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.14]'
                  : 'bg-white border-black/[0.06] text-zinc-600 hover:text-zinc-950 hover:border-black/[0.12] shadow-xs'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Search className="w-3.5 h-3.5 text-violet-500" />
                <span className="font-medium">Command Palette...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded-md bg-[#f5f5f7] dark:bg-zinc-800 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 border border-black/[0.06] dark:border-white/[0.08]">
                ⌘K
              </kbd>
            </button>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={toggleSidebarExpanded}
                title="Expand Sidebar"
                className="w-10 h-8 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── Scrollable Middle Navigation Section (Custom Scrollbar, No Overlap) ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-1 space-y-3 custom-scrollbar">
          {/* Section 1: Dashboard Home */}
          <div className="space-y-0.5">
            {(() => {
              const active = isItemActive('dashboard', '/dashboard');
              return (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    onMouseEnter={() => setHoveredItemId('dashboard')}
                    onMouseLeave={() => setHoveredItemId(null)}
                    className={`w-full min-h-[40px] flex items-center rounded-2xl px-3 py-2 text-xs transition-all relative group ${
                      active
                        ? isDark
                          ? 'bg-white/[0.1] text-white font-bold shadow-xs border border-white/[0.12]'
                          : 'bg-white text-zinc-950 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-black/[0.08]'
                        : isDark
                        ? 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                        : 'text-zinc-700 hover:text-zinc-950 hover:bg-black/[0.04] font-medium'
                    } ${isExpanded ? 'justify-start space-x-3' : 'justify-center'}`}
                  >
                    <LayoutGrid
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        active
                          ? 'text-violet-600 dark:text-violet-400'
                          : 'text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white'
                      }`}
                    />
                    {isExpanded && <span className="truncate">Command Center</span>}
                  </button>

                  {/* Tooltip when collapsed */}
                  {!isExpanded && hoveredItemId === 'dashboard' && (
                    <div className="absolute left-[72px] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl shadow-2xl z-50 whitespace-nowrap animate-in fade-in slide-in-from-left-2 pointer-events-none flex items-center space-x-2 border border-white/10">
                      <span>Command Center</span>
                      <span className="text-[10px] text-zinc-400 font-mono">(Alt+1)</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Section 2: The 8 Core Verticals */}
          <div className="space-y-0.5">
            {isExpanded && (
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Core Verticals
              </div>
            )}

            {coreVerticals.map((v) => {
              const Icon = v.icon;
              const active = isItemActive(v.id, v.path);

              return (
                <div key={v.id} className="relative">
                  <button
                    type="button"
                    onClick={() => navigate(v.path)}
                    onMouseEnter={() => setHoveredItemId(v.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    className={`w-full min-h-[40px] flex items-center rounded-2xl px-3 py-2 text-xs transition-all relative group ${
                      active
                        ? isDark
                          ? 'bg-white/[0.1] text-white font-bold shadow-xs border border-white/[0.12]'
                          : 'bg-white text-zinc-950 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-black/[0.08]'
                        : isDark
                        ? 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                        : 'text-zinc-700 hover:text-zinc-950 hover:bg-black/[0.04] font-medium'
                    } ${isExpanded ? 'justify-between' : 'justify-center'}`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          active
                            ? v.accentColor
                            : 'text-zinc-500 group-hover:scale-105 group-hover:text-zinc-900 dark:group-hover:text-white'
                        }`}
                      />
                      {isExpanded && (
                        <div className="text-left min-w-0">
                          <span className="truncate block font-semibold leading-tight">{v.label}</span>
                        </div>
                      )}
                    </div>

                    {/* Clean Badges (NO numbers on the tab rows) */}
                    {isExpanded && v.badge && (
                      <span className="px-1.5 py-0.2 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 text-[10px] font-mono font-bold shrink-0">
                        {v.badge}
                      </span>
                    )}
                  </button>

                  {/* Tooltip when collapsed */}
                  {!isExpanded && hoveredItemId === v.id && (
                    <div className="absolute left-[72px] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl shadow-2xl z-50 whitespace-nowrap animate-in fade-in slide-in-from-left-2 pointer-events-none flex items-center space-x-2 border border-white/10">
                      <span>{v.label}</span>
                      <span className="text-[10px] text-zinc-400 font-normal">· {v.subtitle}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">({v.shortcutKey})</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Section 3: System & Utilities */}
          <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] space-y-0.5">
            {isExpanded && (
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                System
              </div>
            )}

            {systemItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.id, item.path);

              return (
                <div key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={() => navigate(item.path)}
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    className={`w-full min-h-[38px] flex items-center rounded-2xl px-3 py-1.5 text-xs transition-colors ${
                      active
                        ? isDark
                          ? 'bg-white/[0.08] text-white font-semibold'
                          : 'bg-white text-zinc-950 font-bold shadow-xs border border-black/[0.08]'
                        : isDark
                        ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.04] font-medium'
                    } ${isExpanded ? 'space-x-3 justify-start' : 'justify-center'}`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white" />
                    {isExpanded && <span>{item.label}</span>}
                  </button>

                  {!isExpanded && hoveredItemId === item.id && (
                    <div className="absolute left-[72px] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl shadow-2xl z-50 whitespace-nowrap animate-in fade-in slide-in-from-left-2 pointer-events-none border border-white/10">
                      <span>{item.label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Fixed Bottom Section: Theme & User Profile (Never cut off) ── */}
        <div
          className={`p-3 shrink-0 border-t space-y-2.5 ${
            isDark ? 'border-white/[0.08] bg-[#0c0d12]' : 'border-black/[0.06] bg-[#f5f5f7]'
          }`}
        >
          {/* Segmented Light / Dark Toggle Pill */}
          <div
            className={`flex items-center rounded-2xl p-1 transition-all ${
              isDark
                ? 'bg-zinc-900 border border-white/[0.08]'
                : 'bg-white border border-black/[0.06] shadow-xs'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                if (isDark) onToggleTheme();
              }}
              title="Switch to Light Mode"
              className={`flex-1 min-h-[30px] flex items-center justify-center space-x-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                !isDark
                  ? 'bg-violet-50 text-violet-800 shadow-xs border border-violet-200'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              {isExpanded && <span>Light</span>}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isDark) onToggleTheme();
              }}
              title="Switch to Dark Mode"
              className={`flex-1 min-h-[30px] flex items-center justify-center space-x-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                isDark
                  ? 'bg-zinc-800 text-violet-300 shadow-xs border border-zinc-700'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              {isExpanded && <span>Dark</span>}
            </button>
          </div>

          {/* User Profile Card with Popover */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`w-full min-h-[44px] flex items-center rounded-2xl p-2 transition-all cursor-pointer ${
                isDark
                  ? 'hover:bg-white/[0.06] border border-transparent'
                  : 'hover:bg-white border border-black/[0.04] bg-white/70 shadow-xs'
              } ${isExpanded ? 'justify-between space-x-2.5' : 'justify-center'}`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm ring-2 ring-violet-500/20">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AS'}
                </div>

                {isExpanded && (
                  <div className="text-left min-w-0">
                    <div className="text-xs font-bold truncate text-zinc-900 dark:text-white">
                      {user?.name || 'Adnan'}
                    </div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-medium">
                      {user?.email || 'adnan@lifesolver.app'}
                    </div>
                  </div>
                )}
              </div>

              {isExpanded && <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-400" />}
            </button>

            {/* Apple Floating Popover Menu */}
            {userMenuOpen && (
              <div
                className={`absolute bottom-full left-0 mb-2 w-64 rounded-3xl p-2.5 shadow-2xl border z-50 animate-in fade-in zoom-in-95 font-sans ${
                  isDark
                    ? 'bg-[#18181b]/95 backdrop-blur-2xl border-white/10 text-zinc-100 shadow-black/50'
                    : 'bg-white/95 backdrop-blur-2xl border-black/[0.08] text-zinc-900 shadow-2xl'
                }`}
              >
                {/* User Info Header */}
                <div className="px-3 py-2 border-b border-black/[0.06] dark:border-white/[0.08] mb-1.5">
                  <div className="text-xs font-bold text-zinc-900 dark:text-white">
                    {user?.name || 'Adnan Shahria'}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {user?.email || 'adnan@lifesolver.app'}
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/20">
                    Pro Plan · Unlimited
                  </span>
                </div>

                {/* Popover Actions */}
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-black/[0.04] dark:hover:bg-white/[0.06] flex items-center space-x-2 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/support');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-black/[0.04] dark:hover:bg-white/[0.06] flex items-center space-x-2 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Help &amp; Documentation</span>
                  </button>

                  <div className="h-px my-1 bg-black/[0.06] dark:border-white/[0.08]" />

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center space-x-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
