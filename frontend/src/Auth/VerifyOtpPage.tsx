import React, { useState, useEffect } from 'react';
import { useAuth } from '../_core/AuthContext';
import { AuthShell } from './AuthShell';
import { Mail, RefreshCw, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface VerifyOtpPageProps {
  initialEmail?: string;
  onNavigateLogin?: () => void;
  onSuccess?: () => void;
}

export const VerifyOtpPage: React.FC<VerifyOtpPageProps> = ({
  initialEmail = '',
  onNavigateLogin,
  onSuccess
}) => {
  const { verifyOtp, resendOtp, user } = useAuth();
  const [email, setEmail] = useState(initialEmail || user?.email || '');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setError(null);
    try {
      await resendOtp(email, 'verification');
      setSuccessMessage('A fresh verification code has been dispatched to your email.');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err?.message || 'Failed to resend verification code');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const verified = await verifyOtp(email, otpCode, 'verification');
      if (verified) {
        setSuccessMessage('Account verified successfully!');
        setTimeout(() => {
          onSuccess?.();
        }, 600);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to verify authorization code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Verify Authorization"
      subtitle="Enter the 6-digit confirmation code dispatched to your inbox"
      badge="Identity Challenge"
      footerLink={{
        text: 'Need to use a different email?',
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-zinc-300 font-apple-text">
              6-Digit Code
            </label>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isLoading}
              className="text-xs text-[#64d2ff] hover:text-[#0071e3] disabled:opacity-50 flex items-center space-x-1.5 font-apple-text focus:outline-none hover:underline"
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
            placeholder="000000"
            className="w-full text-center tracking-[0.45em] font-apple-mono font-semibold text-2xl h-13 rounded-xl bg-black/40 border border-white/[0.10] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/25 transition-all shadow-[inset_0_1px_1px_rgba(0,0,0,0.4)]"
          />
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
              <span>Verify & Activate Session</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 flex items-center justify-center space-x-1.5 text-[11px] text-zinc-400 font-apple-text">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 stroke-[1.75]" />
        <span>Time-Sensitive Single Use Token · Encrypted Delivery</span>
      </div>
    </AuthShell>
  );
};
