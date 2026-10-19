import React, { useState, useEffect } from 'react';
import { useAuth } from '../_core/AuthContext';
import { CosmicStarfield } from './components/CosmicStarfield';
import { HeroWindow } from './components/HeroWindow';
import { OrbitFeatureBanner } from './components/OrbitFeatureBanner';
import { MissionVisionTabs } from './components/MissionVisionTabs';
import { VerticalsBento } from './components/VerticalsBento';
import { EquilibriumSimulator } from './components/EquilibriumSimulator';
import { WhyChooseLifeSolver } from './components/WhyChooseLifeSolver';
import { TransformationTable } from './components/TransformationTable';
import { SecurityArchitecture } from './components/SecurityArchitecture';
import { AuthModal } from '../Auth/AuthModal';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Check, 
  Menu, 
  X, 
  Star,
  ChevronDown,
  Layers,
  Compass,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';

interface LandingPageProps {
  onEnterDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDashboard }) => {
  const { user, isAuthenticated, logout, login } = useAuth();
  
  // Theme State: Apple Pro Dark (Default) / Apple Pro White
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('lifesolver_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    localStorage.setItem('lifesolver_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Scroll State & Scroll Progress Indicator
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('features');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);

      const winHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (winHeight > 0) {
        setScrollProgress((scrollY / winHeight) * 100);
      }

      // Active Section Detection
      const sections = ['why', 'simulator', 'mission-vision', 'orbit-ai', 'features'];
      let found = false;
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 250 && rect.bottom >= 120) {
            setActiveSection(section);
            found = true;
            break;
          }
        }
      }
      if (!found && scrollY < 250) {
        setActiveSection('features');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for Apple Scroll Reveal Motion Animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    const revealElements = document.querySelectorAll('.apple-scroll-reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openLogin = () => {
    setAuthMode('login');
    setIsAuthOpen(true);
  };

  const openRegister = () => {
    setAuthMode('register');
    setIsAuthOpen(true);
  };

  const handleInstantDemo = () => {
    login('demo_bearer_jwt_token_ls_v32', {
      id: 'usr_commander_01',
      name: 'Executive Adnan',
      email: 'adnan@orbitsaas.cloud',
      avatarUrl: ''
    });
    if (onEnterDashboard) {
      onEnterDashboard();
    }
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated && onEnterDashboard) {
      onEnterDashboard();
    } else {
      openRegister();
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] selection:bg-[#0071e3]/30 selection:text-[#64d2ff] relative overflow-x-hidden font-apple-text transition-colors duration-300">
      
      {/* ── 0. ULTRA-THIN TOP SCROLL PROGRESS INDICATOR ─────────── */}
      <div 
        className="fixed top-0 left-0 h-[2.5px] bg-gradient-to-r from-[#0071e3] via-[#64d2ff] to-[#bf5af2] z-[60] pointer-events-none transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* ── 1. APPLE ATMOSPHERIC ILLUMINATION ── */}
      <CosmicStarfield />

      {/* ── 2. PREMIUM STICKY LIQUID GLASS NAVBAR (CONSTANT WIDTH, NO SHRINKING) ───────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 pt-3 sm:pt-4 px-4 sm:px-6 pointer-events-none transition-all duration-300">
        <div className="mx-auto pointer-events-auto w-full max-w-5xl transition-all duration-300">
          <nav className={`apple-nav-glass rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'is-scrolled shadow-2xl' : ''
          }`}>
            
            {/* LifeSolver Snowflake Logo */}
            <div 
              className="flex items-center space-x-2.5 cursor-pointer group shrink-0" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0071e3] via-[#00c5ff] to-[#5e5ce6] flex items-center justify-center text-white font-bold text-xs shadow-md shadow-[#00c5ff]/25 group-hover:scale-105 transition-transform duration-300">
                <span className="text-sm select-none">❄️</span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className={`font-bold text-base tracking-tight font-apple-display transition-colors ${
                  theme === 'light' ? 'text-zinc-900' : 'text-white'
                }`}>
                  Life<span className="text-gradient-ice font-semibold">Solver</span>
                </span>
                <span className="text-[10px] text-[#00c5ff] font-mono tracking-wider font-semibold">
                  v3.2
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links with Active Indicator Pill */}
            <div className="hidden md:flex items-center space-x-1 text-xs font-medium">
              <button 
                onClick={() => scrollTo('features')} 
                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                  activeSection === 'features'
                    ? 'bg-[#00c5ff] text-white font-semibold shadow-md shadow-[#00c5ff]/30'
                    : theme === 'light'
                      ? 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.05]'
                      : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                Features
              </button>
              <button 
                onClick={() => scrollTo('orbit-ai')} 
                className={`px-4 py-1.5 rounded-full transition-all duration-200 flex items-center space-x-1.5 ${
                  activeSection === 'orbit-ai'
                    ? 'bg-[#00c5ff] text-white font-semibold shadow-md shadow-[#00c5ff]/30'
                    : theme === 'light'
                      ? 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.05]'
                      : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Sparkles className={`w-3 h-3 ${activeSection === 'orbit-ai' ? 'text-white' : 'text-[#00c5ff]'}`} />
                <span>Orbit AI</span>
              </button>
              <button 
                onClick={() => scrollTo('mission-vision')} 
                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                  activeSection === 'mission-vision'
                    ? 'bg-[#00c5ff] text-white font-semibold shadow-md shadow-[#00c5ff]/30'
                    : theme === 'light'
                      ? 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.05]'
                      : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                Ethos
              </button>
              <button 
                onClick={() => scrollTo('simulator')} 
                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                  activeSection === 'simulator'
                    ? 'bg-[#00c5ff] text-white font-semibold shadow-md shadow-[#00c5ff]/30'
                    : theme === 'light'
                      ? 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.05]'
                      : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                Equilibrium
              </button>
              <button 
                onClick={() => scrollTo('why')} 
                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                  activeSection === 'why'
                    ? 'bg-[#00c5ff] text-white font-semibold shadow-md shadow-[#00c5ff]/30'
                    : theme === 'light'
                      ? 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.05]'
                      : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                Why
              </button>
            </div>

            {/* Header Action Controls */}
            <div className="hidden sm:flex items-center space-x-3">
              
              {/* Apple Theme Switcher (Dark / White Mode) */}
              <button
                onClick={toggleTheme}
                className={`p-1.5 sm:p-2 rounded-full transition-all active:scale-95 flex items-center justify-center ${
                  theme === 'light'
                    ? 'bg-black/[0.05] hover:bg-black/[0.10] text-zinc-700 border border-black/10'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/10'
                }`}
                title={theme === 'dark' ? "Switch to Apple Pro White Theme" : "Switch to Apple Space Dark Theme"}
                aria-label="Toggle theme appearance"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 stroke-[2]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#0071e3] stroke-[2]" />
                )}
              </button>

              {/* Single Crisp Premium Get Started Action Button */}
              <button
                onClick={handleGetStarted}
                className="lifesolver-nav-cta px-5 py-2 text-xs font-semibold flex items-center justify-center tracking-tight shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Get Started</span>
              </button>
            </div>

            {/* Mobile Actions Group */}
            <div className="flex sm:hidden items-center space-x-2">
              <button
                onClick={toggleTheme}
                className={`p-1.5 rounded-full transition-all active:scale-95 ${
                  theme === 'light'
                    ? 'bg-black/[0.05] text-zinc-700 border border-black/10'
                    : 'bg-white/[0.06] text-zinc-300 border border-white/10'
                }`}
                aria-label="Toggle theme appearance"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-[#0071e3]" />
                )}
              </button>

              <button
                onClick={handleGetStarted}
                className="lifesolver-nav-cta px-3 py-1.5 text-xs font-semibold"
              >
                <span>Get Started</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-1.5 rounded-lg focus:outline-none ${
                  theme === 'light' ? 'text-zinc-800' : 'text-zinc-300 hover:text-white'
                }`}
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className={`md:hidden mt-2 p-5 apple-nav-glass rounded-2xl space-y-2 pointer-events-auto shadow-2xl ${
              theme === 'light' ? 'text-zinc-800' : 'text-zinc-200'
            }`}>
              <button 
                onClick={() => scrollTo('features')} 
                className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === 'features'
                    ? 'bg-[#00c5ff] text-white font-semibold shadow-md shadow-[#00c5ff]/25'
                    : 'hover:bg-white/[0.06]'
                }`}
              >
                Features
              </button>
              <button 
                onClick={() => scrollTo('orbit-ai')} 
                className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === 'orbit-ai'
                    ? 'bg-[#00c5ff] text-white font-semibold shadow-md shadow-[#00c5ff]/25'
                    : 'hover:bg-white/[0.06]'
                }`}
              >
                Orbit AI
              </button>
              <button 
                onClick={() => scrollTo('mission-vision')} 
                className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === 'mission-vision'
                    ? 'bg-[#00c5ff] text-white font-semibold shadow-md shadow-[#00c5ff]/25'
                    : 'hover:bg-white/[0.06]'
                }`}
              >
                Ethos
              </button>
              <button 
                onClick={() => scrollTo('simulator')} 
                className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === 'simulator'
                    ? 'bg-[#00c5ff] text-white font-semibold shadow-md shadow-[#00c5ff]/25'
                    : 'hover:bg-white/[0.06]'
                }`}
              >
                Equilibrium
              </button>
              <button 
                onClick={() => scrollTo('why')} 
                className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === 'why'
                    ? 'bg-[#00c5ff] text-white font-semibold shadow-md shadow-[#00c5ff]/25'
                    : 'hover:bg-white/[0.06]'
                }`}
              >
                Why
              </button>
              <div className="pt-3 border-t border-white/10 space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleGetStarted();
                  }}
                  className="w-full py-2.5 rounded-full lifesolver-nav-cta text-xs font-semibold text-center"
                >
                  Get Started
                </button>
                {!isAuthenticated && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openLogin();
                    }}
                    className={`w-full py-2 rounded-full text-xs font-medium text-center ${
                      theme === 'light'
                        ? 'bg-black/[0.05] hover:bg-black/[0.1] text-zinc-700'
                        : 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300'
                    }`}
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── 3. HERO EXPERIENCE (APPLE 2-COLUMN SPLIT KEYNOTE LAYOUT) ─── */}
      <section className="pt-24 sm:pt-32 lg:pt-36 pb-16 lg:pb-24 relative z-10 apple-scroll-reveal in-view">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
            
            {/* ── LEFT COLUMN: APPLE TYPOGRAPHY & CONVERSION ENGINE ── */}
            <div className="lg:col-span-5 w-full min-w-0 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 sm:space-y-7">
              
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full apple-glass-pill text-[#64d2ff] text-xs sm:text-sm font-medium shrink-0">
                <span className="text-sm select-none">❄️</span>
                <span className="text-zinc-200">Personal Operating System</span>
                <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-[#64d2ff] text-[10px] font-mono uppercase tracking-wider border border-white/10 font-semibold">
                  v3.2
                </span>
              </div>

              {/* Monumental Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-apple-tight font-apple-display text-white leading-[1.08] w-full">
                Life<span className="text-gradient-ice">Solver</span>
              </h1>

              {/* Visionary Subtitle */}
              <p className="text-base sm:text-lg text-zinc-300 max-w-xl leading-relaxed font-apple-text w-full">
                Manage your daily tasks, financial ledgers, second brain studies, and habits — all in one interconnected, Apple-grade operating system. Meet Orbit, your personal assistant.
              </p>

              {/* CTA Buttons Cluster */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1 w-full sm:w-auto">
                <button
                  onClick={handleGetStarted}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full apple-btn-primary text-white text-sm sm:text-base font-semibold flex items-center justify-center space-x-2 shadow-xl shadow-[#0071e3]/30 min-h-[48px] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleInstantDemo}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full apple-btn-secondary text-sm sm:text-base font-medium text-zinc-200 hover:text-white min-h-[48px] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Explore Cockpit Demo
                </button>
              </div>

              {/* Reassurance Subtitle */}
              <div className="text-[11px] font-mono text-zinc-400 pt-1 flex items-center justify-center lg:justify-start space-x-2 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>No credit card required · Local-first encrypted · Free to use</span>
              </div>

            </div>

            {/* ── RIGHT COLUMN: INTERACTIVE MACOS SEQUOIA COCKPIT ── */}
            <div className="lg:col-span-7 w-full min-w-0">
              <HeroWindow />
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. KEY METRICS BAND & MEET ORBIT AI BANNER ─────────── */}
      <div className="apple-scroll-reveal">
        <OrbitFeatureBanner />
      </div>

      {/* ── 5. MISSION & VISION TABBED MANIFESTO (THE ETHOS) ──── */}
      <div className="apple-scroll-reveal">
        <MissionVisionTabs />
      </div>

      {/* ── 6. THE 8 CORE VERTICALS BENTO MATRIX (FEATURES) ───── */}
      <div className="apple-scroll-reveal">
        <VerticalsBento />
      </div>

      {/* ── 7. INTERACTIVE LIFE EQUILIBRIUM SIMULATOR ─────────── */}
      <div className="apple-scroll-reveal">
        <EquilibriumSimulator onOpenAuth={openRegister} />
      </div>

      {/* ── 8. WHY CHOOSE LIFESOLVER? ─────────────────────────── */}
      <div className="apple-scroll-reveal">
        <WhyChooseLifeSolver />
      </div>

      {/* ── 9. INSTITUTIONAL SECURITY & EDGE CRYPTO RIGOR ─────── */}
      <div className="apple-scroll-reveal">
        <SecurityArchitecture />
      </div>

      {/* ── 10. THE BEFORE/AFTER TRANSFORMATION MATRIX ────────── */}
      <div className="apple-scroll-reveal">
        <TransformationTable />
      </div>

      {/* ── 11. SOCIAL PROOF & EDITORIAL TESTIMONIALS ────────── */}
      <section className="py-20 relative apple-scroll-reveal">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full apple-glass-pill text-[#64d2ff] text-xs font-medium mb-4">
              <Star className="w-3.5 h-3.5 text-[#64d2ff] fill-[#64d2ff]" />
              <span>Operator Endorsements</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold font-apple-display tracking-apple-tight text-white mb-3">
              Trusted by operators who refuse mental fragmentation.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-apple-text">
              Read how founders, AI researchers, and physicians consolidated their entire stack into LifeSolver.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="apple-card p-6 sm:p-7 space-y-4">
              <p className="font-apple-serif italic text-sm text-zinc-300 leading-relaxed">
                "Before LifeSolver, my calendar was in Google, tasks in Linear, finances in QuickBooks, and gym routines in a notes app. The cognitive drag was staggering. Unifying into LifeSolver restored at least 15 hours of deep clarity each week."
              </p>
              <div className="pt-3 border-t border-white/[0.08] flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                  DR
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-apple-display">David Rao</div>
                  <div className="text-[11px] text-zinc-400 font-mono">Founder & CEO · Series B AI Infra</div>
                </div>
              </div>
            </div>

            <div className="apple-card p-6 sm:p-7 space-y-4">
              <p className="font-apple-serif italic text-sm text-zinc-300 leading-relaxed">
                "The client-side AES-256 vault gave me the security confidence to store sensitive IP and clinical research notes. And the Orbit AI multi-intent copilot actually executes cross-module actions instead of just babbling."
              </p>
              <div className="pt-3 border-t border-white/[0.08] flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center font-bold text-xs text-[#64d2ff]">
                  SL
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-apple-display">Dr. Sarah Lin, MD</div>
                  <div className="text-[11px] text-zinc-400 font-mono">Neurosurgeon & Clinical Researcher</div>
                </div>
              </div>
            </div>

            <div className="apple-card p-6 sm:p-7 space-y-4">
              <p className="font-apple-serif italic text-sm text-zinc-300 leading-relaxed">
                "The offline-first SQLite synchronization is an engineering triumph. I can plan on long-haul flights without Wi-Fi, and every single state change reconciles deterministically when I land. It is genuine Apple-tier craft."
              </p>
              <div className="pt-3 border-t border-white/[0.08] flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center font-bold text-xs text-indigo-400">
                  MV
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-apple-display">Marcus Vance</div>
                  <div className="text-[11px] text-zinc-400 font-mono">Principal Systems Architect</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 12. FINAL LEVEL UP STAGE ─────────────────────────── */}
      <section className="py-20 relative apple-scroll-reveal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="apple-card rounded-[32px] p-8 sm:p-14 text-center relative overflow-hidden border border-white/[0.12]">
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40"
              style={{
                background: 'radial-gradient(circle, rgba(0, 113, 227, 0.3) 0%, transparent 70%)'
              }}
            />

            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-white mx-auto shadow-inner text-xl">
                ❄️
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold font-apple-display tracking-apple-tight text-white">
                Command your life with <span className="text-gradient-ice">serene equilibrium.</span>
              </h2>

              <p className="text-sm sm:text-base text-zinc-300 max-w-lg mx-auto leading-relaxed font-apple-text">
                Join LifeSolver today and reclaim control over your time, attention, and capital.
              </p>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={openRegister}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full apple-btn-primary text-white text-sm sm:text-base font-semibold flex items-center justify-center space-x-2 shadow-xl shadow-[#0071e3]/30 min-h-[48px]"
                >
                  <span>Get Started — It's Free</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleInstantDemo}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full apple-btn-secondary text-zinc-200 hover:text-white font-medium text-sm sm:text-base min-h-[48px]"
                >
                  Instant 1-Click Demo
                </button>
              </div>

              <div className="text-[11px] font-mono text-zinc-500 pt-1">
                Zero telemetry · No credit card required · Works across all devices
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 13. APPLE MINIMALIST HIERARCHICAL FOOTER ─────────── */}
      <footer className="border-t border-white/[0.08] py-14 relative z-10 bg-black/90 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            {/* Col 1: Identity */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#64d2ff] flex items-center justify-center text-white font-bold text-xs">
                  ❄️
                </div>
                <span className="font-bold text-white text-sm font-apple-display">LifeSolver</span>
              </div>
              <p className="text-zinc-400 leading-relaxed font-apple-text">
                The interconnected life operating system and second brain command center.
              </p>
              <div className="font-mono text-[11px] text-zinc-500">
                Crafted with ❄️ and AI.
              </div>
            </div>

            {/* Col 2: Pillars */}
            <div className="space-y-2">
              <div className="font-semibold text-white uppercase tracking-wider text-[11px] font-mono">
                Pillars
              </div>
              <ul className="space-y-2 text-zinc-400 font-apple-text">
                <li><button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">Executive Planner</button></li>
                <li><button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">Sovereign Finance</button></li>
                <li><button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">Mind & Second Brain</button></li>
                <li><button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">Health & Habits</button></li>
                <li><button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">Focus Shield</button></li>
              </ul>
            </div>

            {/* Col 3: Architecture */}
            <div className="space-y-2">
              <div className="font-semibold text-white uppercase tracking-wider text-[11px] font-mono">
                Architecture
              </div>
              <ul className="space-y-2 text-zinc-400 font-apple-text">
                <li><button onClick={() => scrollTo('orbit-ai')} className="hover:text-white transition-colors">Orbit AI Engine</button></li>
                <li><button onClick={() => scrollTo('why')} className="hover:text-white transition-colors">Zero-Knowledge Vault</button></li>
                <li><button onClick={() => scrollTo('why')} className="hover:text-white transition-colors">Offline-First SQLite</button></li>
                <li><button onClick={() => scrollTo('why')} className="hover:text-white transition-colors">Data Export Freedom</button></li>
              </ul>
            </div>

            {/* Col 4: Telemetry & Edge Status */}
            <div className="space-y-2">
              <div className="font-semibold text-white uppercase tracking-wider text-[11px] font-mono">
                System Status
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px] font-apple-text">
                Global Edge Cluster operational. Zero third-party telemetry, zero trackers.
              </p>
              <div className="pt-2 text-emerald-400 font-mono text-[11px] flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cloudflare Distributed D1 Online</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 font-mono gap-4">
            <div>
              &copy; {new Date().getFullYear()} LifeSolver. All rights are preserved by Orbit Saas (orbitsaas.cloud).
            </div>
            <div className="flex items-center space-x-4">
              <span>Local-First</span>
              <span>·</span>
              <span>AES-256 Vault</span>
              <span>·</span>
              <span>Apple HIG Craft</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── 14. AUTHENTICATION DIALOG (LOGIN & REGISTER) ────────── */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};
