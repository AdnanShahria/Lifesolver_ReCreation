import React, { useState } from 'react';
import { useAuth } from '../_core/AuthContext';
import { AuthShell } from './AuthShell';
import { Mail, KeyRound, ArrowRight, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ResetPasswordPageProps {
  initialEmail?: string;
  onNavigateLogin?: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  initialEmail = '',
  onNavigateLogin
}) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      await resetPassword(email, otpCode, newPassword);
      setSuccessMessage('Password reset successfully! Redirecting to sign in...');
      setTimeout(() => {
        onNavigateLogin?.();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create New Password"
      subtitle="Enter the 6-digit recovery code and configure your new vault password"
      badge="Vault Rekeying"
      footerLink={{
        text: 'Remember your password?',
        actionText: 'Return to sign in',
        onClick: () => onNavigateLogin?.()
      }}
    >
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2.5 font-apple-text">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center space-x-2.5 font-apple-text">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-apple-text">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 stroke-[1.75]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full pl-10 pr-4 h-11 rounded-xl bg-black/40 border border-white/[0.10] text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/25 transition-all font-apple-text shadow-[inset_0_1px_1px_rgba(0,0,0,0.4)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-apple-text">
            6-Digit Recovery Code
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full text-center tracking-[0.45em] font-apple-mono font-semibold text-xl h-11 rounded-xl bg-black/40 border border-white/[0.10] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/25 transition-all shadow-[inset_0_1px_1px_rgba(0,0,0,0.4)]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-apple-text">
            New Vault Password
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 stroke-[1.75]" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full pl-10 pr-11 h-11 rounded-xl bg-black/40 border border-white/[0.10] text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/25 transition-all font-apple-text shadow-[inset_0_1px_1px_rgba(0,0,0,0.4)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-200 focus:outline-none p-0.5"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || otpCode.length !== 6}
          className="apple-btn-primary w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all active:scale-[0.985] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Update Password</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 flex items-center justify-center space-x-1.5 text-[11px] text-zinc-400 font-apple-text">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 stroke-[1.75]" />
        <span>Cryptographically Verified Password Rekeying</span>
      </div>
    </AuthShell>
  );
};
