import React, { useState } from 'react';
import { useAuth } from '../_core/AuthContext';
import { AuthShell } from './AuthShell';
import { Mail, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigateLogin?: () => void;
  onNavigateResetPassword?: (email: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateLogin,
  onNavigateResetPassword
}) => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setSubmitted(true);
      setTimeout(() => {
        onNavigateResetPassword?.(email);
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch reset code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Recover Account"
      subtitle="Enter your verified email to receive an encrypted 6-digit recovery code"
      badge="Access Recovery"
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

      {submitted && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center space-x-2.5 font-apple-text">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>If an account exists with this email, a recovery code has been dispatched.</span>
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

        <button
          type="submit"
          disabled={isLoading}
          className="apple-btn-primary w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all active:scale-[0.985] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Dispatch Recovery Code</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 flex items-center justify-center space-x-1.5 text-[11px] text-zinc-400 font-apple-text">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 stroke-[1.75]" />
        <span>Rate-Limited Cryptographic Challenge</span>
      </div>
    </AuthShell>
  );
};
