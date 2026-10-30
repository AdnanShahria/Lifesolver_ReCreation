import React from 'react';
import { useTheme } from '../_core/ThemeContext';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerLink?: {
    text: string;
    actionText: string;
    onClick: () => void;
  };
  badge?: string;
}

export const AuthShell: React.FC<AuthShellProps> = ({
  title,
  subtitle,
  children,
  footerLink,
  badge
}) => {
  const { isDark } = useTheme();

  return (
    <div className={`w-full rounded-3xl p-6 sm:p-8 relative shadow-2xl overflow-hidden backdrop-blur-2xl transition-colors duration-200 border ${
      isDark 
        ? 'bg-[#0f111a]/85 border-white/[0.10] text-zinc-100 shadow-black/40' 
        : 'bg-white/95 border-zinc-200/90 text-zinc-900 shadow-zinc-200/60'
    }`}>
      {/* Specular hairline top reflection */}
      <div className={`absolute top-0 inset-x-0 h-px pointer-events-none ${
        isDark 
          ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent' 
          : 'bg-gradient-to-r from-transparent via-[#0071e3]/20 to-transparent'
      }`} />

      {/* Header section */}
      <div className="mb-6">
        {badge && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/10 border border-[#0071e3]/20 text-[#0071e3] dark:text-[#64d2ff] text-[11px] font-semibold mb-3">
            {badge}
          </div>
        )}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white font-apple-display">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 font-apple-text leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Form content */}
      <div className="space-y-4">
        {children}
      </div>

      {/* Switcher footer link */}
      {footerLink && (
        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-white/[0.08] text-center text-xs text-zinc-500 dark:text-zinc-400 font-apple-text">
          {footerLink.text}{' '}
          <button
            type="button"
            onClick={footerLink.onClick}
            className="font-semibold text-[#0071e3] hover:text-[#005bb5] dark:text-[#64d2ff] dark:hover:text-[#0a84ff] transition-colors focus:outline-none hover:underline"
          >
            {footerLink.actionText}
          </button>
        </div>
      )}
    </div>
  );
};
