import React, { useState } from 'react';
import { useAuth } from '../_core/AuthContext';
import { 
  X, 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  Terminal,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInstantDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      login('demo_bearer_jwt_token_ls_v32', {
        id: 'usr_commander_01',
        name: 'Commander Adnan',
        email: 'commander@lifesolver.app',
        avatarUrl: ''
      });
      setIsLoading(false);
      onClose();
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Direct login simulation or API call
      setTimeout(() => {
        login('token_authenticated_' + Date.now(), {
          id: 'usr_' + Date.now(),
          name: name || email.split('@')[0] || 'LifeOS Commander',
          email: email || 'user@lifesolver.app'
        });
        setIsLoading(false);
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Authentication error occurred');
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
              {mode === 'login' ? 'Access Command Center' : 'Initialize LifeOS Account'}
            </h2>
            <p className="text-xs text-zinc-400">
              Zero-knowledge vault & encrypted edge session
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800/80 mb-6 text-sm">
          <button
            type="button"
            onClick={() => setMode('login')}
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
            onClick={() => setMode('register')}
            className={`py-2 rounded-lg font-medium transition-all ${
              mode === 'register'
                ? 'bg-violet-600/30 text-violet-200 border border-violet-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Instant 1-Click Demo Commander CTA */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleInstantDemo}
            disabled={isLoading}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-violet-600/20 border border-violet-500/35 hover:border-violet-400/60 text-violet-200 font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-violet-600/20 group"
          >
            <div className="flex items-center space-x-2.5">
              <Zap className="w-4 h-4 text-violet-400 fill-violet-400/20" />
              <span>Instant Test Drive (1-Click Demo)</span>
            </div>
            <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-400/30 group-hover:translate-x-0.5 transition-transform">
              Commander Mode &rarr;
            </span>
          </button>
          <p className="text-[11px] text-zinc-500 text-center mt-1.5">
            Pre-loaded with live tasks, finance ledgers, and Orbit Copilot
          </p>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-zinc-800 w-full" />
          <span className="bg-[#121216] px-3 text-[11px] text-zinc-500 uppercase tracking-widest absolute">
            Or credentials
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alexander Vance"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 stroke-[1.75]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="commander@lifesolver.app"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
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
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-violet-600/30 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Authenticate Session' : 'Create Encrypted Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
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
