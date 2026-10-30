import React, { useState } from 'react';
import { useAuth } from '../_core/AuthContext';
import { 
  X, 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
  User as UserIcon,
  HelpCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'verify-otp' | 'forgot-password' | 'reset-password';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  onSuccess 
}) => {
  const { 
    login, 
    loginWithCredentials, 
    register, 
    verifyOtp, 
    resendOtp, 
    forgotPassword, 
    resetPassword 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'verify-otp' | 'forgot-password' | 'reset-password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  if (!isOpen) return null;

  const handleDevQuickSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithCredentials('adnan@orbit.dev', 'Password123!');
      onClose();
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || 'Quick sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setError(null);
    try {
      const purpose = mode === 'reset-password' ? 'reset_password' : 'verification';
      await resendOtp(email, purpose);
      setSuccessMessage('A fresh 6-digit authorization code has been dispatched.');
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await loginWithCredentials(email, password);
        onClose();
        onSuccess?.();
      } else if (mode === 'register') {
        const result = await register(name, email, password);
        if (result.requiresVerification) {
          setSuccessMessage('Account registered! Enter the 6-digit code sent to your email.');
          setMode('verify-otp');
        } else {
          onClose();
          onSuccess?.();
        }
      } else if (mode === 'verify-otp') {
        const verified = await verifyOtp(email, otpCode, 'verification');
        if (verified) {
          setSuccessMessage('Account verified successfully!');
          setTimeout(() => {
            onClose();
            onSuccess?.();
          }, 600);
        }
      } else if (mode === 'forgot-password') {
        await forgotPassword(email);
        setSuccessMessage('If an account exists, a 6-digit recovery code has been sent.');
        setMode('reset-password');
      } else if (mode === 'reset-password') {
        await resetPassword(email, otpCode, newPassword);
        setSuccessMessage('Password reset successfully! You can now log in.');
        setTimeout(() => {
          setMode('login');
          setPassword('');
          setOtpCode('');
        }, 1200);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Liquid Glass Backdrop with smooth blur */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-xl transition-opacity animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-md rounded-2xl apple-glass border border-violet-500/20 shadow-2xl shadow-violet-950/40 p-6 sm:p-8 z-10 text-zinc-100 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-inner">
            <Lock className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h2 id="auth-modal-title" className="text-xl font-semibold tracking-tight text-white">
              {mode === 'login' && 'Access Command Center'}
              {mode === 'register' && 'Initialize LifeOS Account'}
              {mode === 'verify-otp' && 'Verify Email Address'}
              {mode === 'forgot-password' && 'Recover Account'}
              {mode === 'reset-password' && 'Set New Password'}
            </h2>
            <p className="text-xs text-zinc-400">
              Zero-knowledge vault & encrypted edge session
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs (only shown on login / register) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="grid grid-cols-2 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800/80 mb-6 text-sm">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
              className={`py-2 rounded-lg font-medium transition-all ${
                mode === 'login'
                  ? 'bg-violet-600/30 text-violet-200 border border-violet-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); setSuccessMessage(null); }}
              className={`py-2 rounded-lg font-medium transition-all ${
                mode === 'register'
                  ? 'bg-violet-600/30 text-violet-200 border border-violet-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Quick Developer Sign In (Real Database PBKDF2 Auth) */}
        {mode === 'login' && (
          <div className="mb-6">
            <button
              type="button"
              onClick={handleDevQuickSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-violet-600/20 border border-violet-500/35 hover:border-violet-400/60 text-violet-200 font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-violet-600/20 group cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Zap className="w-4 h-4 text-violet-400 fill-violet-400/20" />
                <span>Quick Sign In (adnan@orbit.dev)</span>
              </div>
              <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-400/30 group-hover:translate-x-0.5 transition-transform">
                Sign In &rarr;
              </span>
            </button>
            <p className="text-[11px] text-zinc-500 text-center mt-1.5 font-apple-text">
              Direct PBKDF2 Web Crypto authentication with Cloudflare D1
            </p>
          </div>
        )}

        {(mode === 'login' || mode === 'register') && (
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-[#121216] px-3 text-[11px] text-zinc-500 uppercase tracking-widest absolute">
              Or edge credentials
            </span>
          </div>
        )}

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 stroke-[1.75]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alexander Vance"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'forgot-password' || mode === 'verify-otp' || mode === 'reset-password') && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 stroke-[1.75]" />
                <input
                  type="email"
                  required
                  value={email}
                  disabled={mode === 'verify-otp' || mode === 'reset-password'}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="commander@lifesolver.app"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all disabled:opacity-60"
                />
              </div>
            </div>
          )}

          {(mode === 'verify-otp' || mode === 'reset-password') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-300">6-Digit Code</label>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isLoading}
                  className="text-xs text-violet-400 hover:text-violet-300 disabled:opacity-50 flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                </button>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.4em] font-mono text-lg py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
              />
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot-password'); setError(null); setSuccessMessage(null); }}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 stroke-[1.75]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'reset-password' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">New Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 stroke-[1.75]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-violet-600/30 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Authenticate Session'}
                  {mode === 'register' && 'Create Encrypted Account'}
                  {mode === 'verify-otp' && 'Verify Code & Enter'}
                  {mode === 'forgot-password' && 'Send Recovery Code'}
                  {mode === 'reset-password' && 'Set New Password'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {mode !== 'login' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                &larr; Return to Sign In
              </button>
            </div>
          )}
        </form>

        {/* Security Assurance Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-center space-x-2 text-[11px] text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 stroke-[1.75]" />
          <span>PBKDF2 SHA-256 Auth · AES-GCM-256 Vault Encryption</span>
        </div>
      </div>
    </div>
  );
};
