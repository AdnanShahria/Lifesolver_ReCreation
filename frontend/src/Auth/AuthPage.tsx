import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../_core/AuthContext';
import { useTheme } from '../_core/ThemeContext';
import logoImg from '../assets/logo-192.png';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { VerifyOtpPage } from './VerifyOtpPage';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { ResetPasswordPage } from './ResetPasswordPage';
import { 
  Orbit, 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  Check, 
  TrendingUp, 
  Brain, 
  Lock, 
  Sun,
  Moon,
  ArrowRight,
  LogOut,
  Wallet,
  Activity,
  Layers
} from 'lucide-react';

export type AuthMode = 'login' | 'register' | 'verify-otp' | 'forgot-password' | 'reset-password';

export const AuthPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  
  // Read current mode from URL ?mode=... or default to 'login'
  const currentMode = (searchParams.get('mode') as AuthMode) || 'login';
  const targetEmail = searchParams.get('email') || user?.email || '';

  // Allows already logged in users to explicitly view the login form if they wish to switch accounts
  const [showSwitchForm, setShowSwitchForm] = useState(false);

  // Interactive showcase state
  const [taskCompleted, setTaskCompleted] = useState(false);

  const setMode = (mode: AuthMode, extraParams: Record<string, string> = {}) => {
    const params = new URLSearchParams(searchParams);
    params.set('mode', mode);
    Object.entries(extraParams).forEach(([k, v]) => params.set(k, v));
    setSearchParams(params);
  };

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between selection:bg-[#0071e3]/20 selection:text-[#0071e3] relative overflow-x-hidden font-apple-text transition-colors duration-200 ${
      isDark ? 'bg-[#000000] text-zinc-100' : 'bg-[#fbfbfd] text-zinc-900'
    }`}>
      {/* ── Apple Ambient Illumination ── */}
      <div 
        className={`fixed top-0 left-1/4 -translate-x-1/2 w-[720px] h-[520px] rounded-full blur-[160px] pointer-events-none transition-opacity ${
          isDark ? 'bg-[#0071e3]/10 opacity-100' : 'bg-[#0071e3]/5 opacity-80'
        }`} 
        aria-hidden="true" 
      />
      <div 
        className={`fixed bottom-0 right-1/4 translate-x-1/3 w-[640px] h-[540px] rounded-full blur-[180px] pointer-events-none transition-opacity ${
          isDark ? 'bg-[#5e5ce6]/8 opacity-100' : 'bg-[#5e5ce6]/4 opacity-80'
        }`} 
        aria-hidden="true" 
      />

      {/* ── Top Navigation Bar ── */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40 rounded-xl p-1 -m-1 transition-transform active:scale-[0.98]"
          aria-label="Return to LifeSolver home"
        >
          <img
            src={logoImg}
            alt="LifeSolver"
            className="w-10 h-10 rounded-2xl object-cover shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-500/40"
          />
          <div className="flex items-center space-x-2">
            <span className={`font-bold text-lg tracking-tight font-apple-display group-hover:text-[#0071e3] transition-colors ${
              isDark ? 'text-white' : 'text-zinc-950'
            }`}>
              LifeSolver
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-mono font-bold tracking-wide rounded-full border ${
              isDark ? 'bg-white/[0.08] text-zinc-300 border-white/[0.12]' : 'bg-zinc-100 text-zinc-700 border-zinc-200'
            }`}>
              OS 3.2
            </span>
          </div>
        </Link>

        {/* Right utility: Theme Switcher Pill & Return Link */}
        <div className="flex items-center space-x-3">
          {/* 1-Click Universal Light / Dark Mode Toggle Pill */}
          <button
            onClick={toggleTheme}
            className={`min-h-[38px] px-3 py-1.5 rounded-full flex items-center space-x-1.5 text-xs font-semibold border transition-all ${
              isDark 
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800' 
                : 'bg-white border-zinc-300 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 shadow-sm'
            }`}
            title={`Switch to ${isDark ? 'White / Light' : 'Dark'} mode`}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#0071e3]" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>

          <Link
            to="/"
            className={`flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
              isDark
                ? 'text-zinc-400 hover:text-white hover:bg-white/[0.06] border-transparent'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 border-zinc-200 shadow-sm'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </Link>
        </div>
      </header>

      {/* ── Main Canvas (Mobile-First: Form on Top on Small Screens) ── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 xl:gap-20 items-center">
          
          {/* ══════════════════════════════════════════════════════════════════
              RIGHT COLUMN: Authentication Card (Mobile: Rendered First!)
              ══════════════════════════════════════════════════════════════════ */}
          <div className="order-1 lg:order-2 lg:col-span-5 flex flex-col items-center w-full max-w-md mx-auto">
            
            {/* ── HARD LOGIN: Active Session Card (If User is Already Authenticated) ── */}
            {isAuthenticated && user && !showSwitchForm ? (
              <div className={`w-full rounded-3xl p-6 sm:p-8 border shadow-2xl backdrop-blur-2xl transition-all ${
                isDark 
                  ? 'bg-[#0f111a]/90 border-white/[0.12] text-zinc-100' 
                  : 'bg-white/95 border-zinc-200/90 text-zinc-900 shadow-zinc-200/60'
              }`}>
                <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-500 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Hard Session Active · Currently Signed In</span>
                </div>

                <div className="flex items-center space-x-3.5 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/15 border border-[#0071e3]/30 flex items-center justify-center font-bold text-base text-[#0071e3] shrink-0">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'AS'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-base text-zinc-950 dark:text-white truncate">
                      {user.name}
                    </div>
                    <div className="text-xs text-zinc-500 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  You are permanently logged in with an unexpired cryptographic session until you explicitly sign out.
                </p>

                {/* Primary Action Buttons */}
                <div className="mt-5 space-y-2.5">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full min-h-[46px] rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-[#0071e3]/20"
                  >
                    <span>Enter Command Cockpit</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => navigate('/finance')}
                    className={`w-full min-h-[46px] rounded-2xl border font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all ${
                      isDark 
                        ? 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-200' 
                        : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800'
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-cyan-500" />
                    <span>Open Finance OS</span>
                  </button>

                  <button
                    onClick={() => navigate('/sysadmin')}
                    className={`w-full min-h-[44px] rounded-2xl border font-medium text-xs flex items-center justify-center space-x-2 transition-all ${
                      isDark 
                        ? 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' 
                        : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <span>SysAdmin Telemetry & Monitoring</span>
                  </button>
                </div>

                {/* Session Management */}
                <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setShowSwitchForm(true)}
                    className="text-[#0071e3] hover:underline font-semibold"
                  >
                    Switch Account
                  </button>

                  <button
                    type="button"
                    onClick={logout}
                    className="text-rose-500 hover:text-rose-600 font-semibold flex items-center space-x-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Segmented Control Pill (Touch targets >= 44px on mobile) */}
                <div 
                  className={`w-full mb-5 p-1 rounded-full border flex shadow-sm ${
                    isDark 
                      ? 'bg-zinc-900/90 border-zinc-800 text-zinc-400' 
                      : 'bg-zinc-200/80 border-zinc-300 text-zinc-600'
                  }`}
                  role="tablist"
                  aria-label="Authentication modes"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={currentMode === 'login'}
                    onClick={() => setMode('login')}
                    className={`flex-1 min-h-[40px] py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      currentMode === 'login'
                        ? isDark 
                          ? 'bg-zinc-800 text-white shadow-md' 
                          : 'bg-white text-zinc-950 shadow-md'
                        : isDark ? 'hover:text-white' : 'hover:text-zinc-950'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={currentMode === 'register'}
                    onClick={() => setMode('register')}
                    className={`flex-1 min-h-[40px] py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      currentMode === 'register'
                        ? isDark 
                          ? 'bg-zinc-800 text-white shadow-md' 
                          : 'bg-white text-zinc-950 shadow-md'
                        : isDark ? 'hover:text-white' : 'hover:text-zinc-950'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Account</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={currentMode === 'forgot-password' || currentMode === 'reset-password'}
                    onClick={() => setMode('forgot-password')}
                    className={`flex-1 min-h-[40px] py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      currentMode === 'forgot-password' || currentMode === 'reset-password'
                        ? isDark 
                          ? 'bg-zinc-800 text-white shadow-md' 
                          : 'bg-white text-zinc-950 shadow-md'
                        : isDark ? 'hover:text-white' : 'hover:text-zinc-950'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Recovery</span>
                  </button>
                </div>

                {/* Active Subpage Component */}
                <div className="w-full">
                  {currentMode === 'login' && (
                    <LoginPage
                      onNavigateRegister={() => setMode('register')}
                      onNavigateForgotPassword={() => setMode('forgot-password')}
                      onSuccess={handleAuthSuccess}
                    />
                  )}

                  {currentMode === 'register' && (
                    <RegisterPage
                      onNavigateLogin={() => setMode('login')}
                      onNavigateVerifyOtp={(email) => setMode('verify-otp', { email })}
                      onSuccess={handleAuthSuccess}
                    />
                  )}

                  {currentMode === 'verify-otp' && (
                    <VerifyOtpPage
                      initialEmail={targetEmail}
                      onNavigateLogin={() => setMode('login')}
                      onSuccess={handleAuthSuccess}
                    />
                  )}

                  {currentMode === 'forgot-password' && (
                    <ForgotPasswordPage
                      onNavigateLogin={() => setMode('login')}
                      onNavigateResetPassword={(email) => setMode('reset-password', { email })}
                    />
                  )}

                  {currentMode === 'reset-password' && (
                    <ResetPasswordPage
                      initialEmail={targetEmail}
                      onNavigateLogin={() => setMode('login')}
                    />
                  )}
                </div>

                {/* Back to session button if user was already authenticated */}
                {isAuthenticated && showSwitchForm && (
                  <button
                    type="button"
                    onClick={() => setShowSwitchForm(false)}
                    className="mt-4 text-xs text-[#0071e3] hover:underline font-semibold"
                  >
                    &larr; Return to active session ({user?.email})
                  </button>
                )}
              </>
            )}

          </div>

          {/* ══════════════════════════════════════════════════════════════════
              LEFT COLUMN: LifeOS Showcase (Below on Mobile, Left Wing on Desktop)
              ══════════════════════════════════════════════════════════════════ */}
          <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col justify-center space-y-6 pt-6 lg:pt-0">
            
            {/* Editorial Title & Apple Headline */}
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0071e3]/10 border border-[#0071e3]/20 text-[#0071e3] dark:text-[#64d2ff] text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Omniscient Personal Life Operating System</span>
              </div>
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-apple-display leading-[1.12] ${
                isDark ? 'text-white' : 'text-zinc-950'
              }`}>
                Everything aligned. <br />
                <span className="text-[#0071e3] dark:text-[#64d2ff]">One omniscient system.</span>
              </h1>
              <p className={`mt-3 text-sm sm:text-base font-apple-text max-w-xl leading-relaxed ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                LifeSolver continuously synchronizes your autonomous daily planner, encrypted wealth ledger, and cognitive readiness into a unified personal enclave.
              </p>
            </div>

            {/* Dynamic Bento Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              
              {/* Card 1: Eisenhower Matrix & Deep Sprint Planner */}
              <div className={`p-5 rounded-3xl border transition-all ${
                isDark ? 'bg-[#0f111a]/80 border-white/[0.08] text-white' : 'bg-white border-zinc-200/90 text-zinc-900 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-xl bg-[#0071e3]/15 border border-[#0071e3]/30 flex items-center justify-center text-[#0071e3] dark:text-[#64d2ff]">
                      <Orbit className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">Planner Matrix</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    Quad 1 Urgent
                  </span>
                </div>
                
                <p className={`text-xs font-medium line-clamp-1 mb-2.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  Q4 Security & Cloudflare Architecture Review
                </p>

                <button
                  type="button"
                  onClick={() => setTaskCompleted(!taskCompleted)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                    taskCompleted 
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300' 
                      : isDark 
                        ? 'bg-black/30 border border-white/[0.08] text-zinc-400 hover:text-zinc-200' 
                        : 'bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                      taskCompleted ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-zinc-400'
                    }`}>
                      {taskCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={taskCompleted ? 'line-through text-zinc-400' : ''}>
                      {taskCompleted ? 'Sprint Completed' : 'Deep Work Sprint'}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500">
                    {taskCompleted ? '100%' : '45m left'}
                  </span>
                </button>
              </div>

              {/* Card 2: Encrypted Wealth & Finance Ledger */}
              <div className={`p-5 rounded-3xl border transition-all ${
                isDark ? 'bg-[#0f111a]/80 border-white/[0.08] text-white' : 'bg-white border-zinc-200/90 text-zinc-900 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">Wealth Engine</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-500 font-bold">
                    +18.4% YTD
                  </span>
                </div>

                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-xl font-bold font-apple-display tracking-tight">৳ 284,520</span>
                  <span className="text-[11px] text-zinc-500">Liquid Reserves</span>
                </div>

                <div className={`w-full h-1.5 rounded-full overflow-hidden flex ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                  <div className="h-full bg-[#0071e3] w-[45%]" />
                  <div className="h-full bg-emerald-500 w-[35%]" />
                  <div className="h-full bg-purple-500 w-[20%]" />
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-2 font-mono">
                  <span>Liquid: 45%</span>
                  <span>Growth: 35%</span>
                  <span>Vault: 20%</span>
                </div>
              </div>

              {/* Card 3: Cognitive Focus */}
              <div className={`p-5 rounded-3xl border transition-all ${
                isDark ? 'bg-[#0f111a]/80 border-white/[0.08] text-white' : 'bg-white border-zinc-200/90 text-zinc-900 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500">
                      <Brain className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">Cognitive Focus</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-500 font-bold">
                    Prime Cadence
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1">
                  <div>
                    <div className="text-lg font-bold font-apple-display">96 / 100</div>
                    <div className="text-[11px] text-zinc-500">Readiness Score</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono">2h 15m</div>
                    <div className="text-[11px] text-zinc-500">Undisturbed Flow</div>
                  </div>
                </div>
              </div>

              {/* Card 4: Security Vault */}
              <div className={`p-5 rounded-3xl border transition-all ${
                isDark ? 'bg-[#0f111a]/80 border-white/[0.08] text-white' : 'bg-white border-zinc-200/90 text-zinc-900 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-[#0071e3]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">Security Vault</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-500 font-bold">
                    Edge Enclave
                  </span>
                </div>

                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  PBKDF2 SHA-256 client derivation. Your credentials never touch cloud infrastructure unencrypted.
                </p>
              </div>

            </div>

            {/* Apple Trust Markers */}
            <div className={`pt-3 flex flex-wrap items-center gap-6 text-xs font-medium border-t ${
              isDark ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-600'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Cloudflare D1 Local-First Sync</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
                <span>Zero Third-Party Trackers</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Zero-Knowledge Hard Session</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className={`relative z-10 w-full border-t py-4 px-4 sm:px-6 lg:px-8 mt-8 text-xs font-apple-text ${
        isDark ? 'border-zinc-800/80 text-zinc-500' : 'border-zinc-200 text-zinc-500'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <img src={logoImg} alt="LifeSolver" className="w-5 h-5 rounded-lg object-cover ring-1 ring-cyan-500/30 shadow-xs" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cloudflare Edge Enclave Active · Zero-Knowledge Cryptography</span>
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
              LifeSolver Home
            </Link>
            <span>&bull;</span>
            <Link to="/sysadmin" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
              SysAdmin Cockpit
            </Link>
            <span>&bull;</span>
            <span>&copy; {new Date().getFullYear()} LifeSolver. All rights reserved by Orbit SaaS.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
