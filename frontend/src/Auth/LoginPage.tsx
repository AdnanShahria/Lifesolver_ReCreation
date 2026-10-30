import React, { useState } from 'react';
import { useAuth } from '../_core/AuthContext';
import { useTheme } from '../_core/ThemeContext';
import { AuthShell } from './AuthShell';
import { Mail, KeyRound, ArrowRight, Eye, EyeOff, Zap, ShieldCheck, Check } from 'lucide-react';

interface LoginPageProps {
  onNavigateRegister?: () => void;
  onNavigateForgotPassword?: () => void;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateRegister,
  onNavigateForgotPassword,
  onSuccess
}) => {
  const { loginWithCredentials } = useAuth();
  const { isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await loginWithCredentials(email, password);
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevQuickSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await loginWithCredentials('adnan@orbit.dev', 'Password123!');
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || 'Quick sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to your private LifeSolver session and encrypted vault"
      badge="Persistent Hard Session"
      footerLink={{
        text: "Don't have an account yet?",
        actionText: 'Create account',
        onClick: () => onNavigateRegister?.()
      }}
    >
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-300 text-xs flex items-center space-x-2.5 font-apple-text">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field Optimized for Mobile & Touch */}
        <div>
          <label className={`block text-xs font-semibold mb-1.5 font-apple-text ${
            isDark ? 'text-zinc-300' : 'text-zinc-700'
          }`}>
            Email Address
          </label>
          <div className="relative">
            <Mail className={`w-4 h-4 absolute left-3.5 top-4 stroke-[1.75] ${
              isDark ? 'text-zinc-400' : 'text-zinc-500'
            }`} />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className={`w-full pl-10 pr-4 h-12 rounded-2xl text-base sm:text-sm font-apple-text transition-all focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 border ${
                isDark 
                  ? 'bg-black/50 border-white/[0.12] text-zinc-100 placeholder:text-zinc-500 focus:border-[#0071e3]' 
                  : 'bg-zinc-50 border-zinc-300/80 text-zinc-950 placeholder:text-zinc-400 focus:bg-white focus:border-[#0071e3]'
              }`}
            />
          </div>
        </div>

        {/* Password Field Optimized for Mobile & Touch */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={`block text-xs font-semibold font-apple-text ${
              isDark ? 'text-zinc-300' : 'text-zinc-700'
            }`}>
              Password
            </label>
            <button
              type="button"
              onClick={() => onNavigateForgotPassword?.()}
              className="text-xs text-[#0071e3] hover:text-[#005bb5] dark:text-[#64d2ff] dark:hover:text-[#0a84ff] transition-colors font-apple-text focus:outline-none hover:underline"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <KeyRound className={`w-4 h-4 absolute left-3.5 top-4 stroke-[1.75] ${
              isDark ? 'text-zinc-400' : 'text-zinc-500'
            }`} />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your vault password"
              className={`w-full pl-10 pr-12 h-12 rounded-2xl text-base sm:text-sm font-apple-text transition-all focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 border ${
                isDark 
                  ? 'bg-black/50 border-white/[0.12] text-zinc-100 placeholder:text-zinc-500 focus:border-[#0071e3]' 
                  : 'bg-zinc-50 border-zinc-300/80 text-zinc-950 placeholder:text-zinc-400 focus:bg-white focus:border-[#0071e3]'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 focus:outline-none"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Hard Login Persistent Session Toggle */}
        <div className="flex items-center justify-between py-1">
          <label 
            onClick={() => setKeepLoggedIn(!keepLoggedIn)}
            className="flex items-center space-x-2.5 cursor-pointer select-none text-xs font-apple-text"
          >
            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
              keepLoggedIn 
                ? 'bg-[#0071e3] border-[#0071e3] text-white shadow-sm' 
                : isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-300 bg-white'
            }`}>
              {keepLoggedIn && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>
              Keep me logged in indefinitely
            </span>
          </label>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.985] text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#0071e3]/25 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In to LifeSolver</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Developer / Demo Sign In */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleDevQuickSignIn}
          disabled={isLoading}
          className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-2xl border text-xs transition-all cursor-pointer ${
            isDark 
              ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-zinc-300 hover:text-white' 
              : 'bg-zinc-100/80 hover:bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-zinc-950 shadow-sm'
          }`}
        >
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Zap className="w-3.5 h-3.5 fill-cyan-400/20" />
            </div>
            <span className="font-semibold">Quick Sign In (adnan@orbit.dev)</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
            1-Click &rarr;
          </span>
        </button>
      </div>

      <div className="pt-2 flex items-center justify-center space-x-1.5 text-[11px] text-zinc-500 font-apple-text">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 stroke-[2]" />
        <span>Hardware-Accelerated Web Crypto · PBKDF2 SHA-256</span>
      </div>
    </AuthShell>
  );
};
