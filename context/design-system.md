# 🎨 LifeSolver Design System Specification

## 1. Palette: Cyber-Violet & Deep Indigo
- **Primary Violet**: `#8b5cf6` (`violet-500`)
- **Deep Violet**: `#7c3aed` (`violet-600`)
- **Dark Violet**: `#6d28d9` (`violet-700`)
- **Indigo Accent**: `#6366f1` (`indigo-500`)
- **Deep Indigo**: `#4f46e5` (`indigo-600`)
- **Success Emerald**: `#10b981` (`emerald-500`)
- **Warning Amber**: `#f59e0b` (`amber-500`)
- **Danger Rose**: `#f43f5e` (`rose-500`)

## 2. Modes
- **Obsidian Dark**: Background `#09090b` (`zinc-950`), surface `rgba(24, 24, 27, 0.70)` + `backdrop-blur-md`, border `rgba(139, 92, 246, 0.15)`.
- **Snow Slate Light**: Background `#f8fafc` (`slate-50`), surface `#ffffff`, border `#e2e8f0`.

## 3. Zero Emojis Policy & Lucide Icons
- Strictly zero emojis in buttons, tabs, status pills, or headers.
- Exclusively Lucide React / Lucide Icons with consistent 16px/18px stroke widths (1.5px/1.75px).

## 4. Apple Human Interface Typography System
- **UI & System Controls (Sans-Serif)**:
  - System font: `San Francisco (SF Pro Text & SF Pro Display)` via `-apple-system, BlinkMacSystemFont`.
  - Cross-platform fallbacks: `"OPPOSans", "OPPO Sans", "Plus Jakarta Sans", system-ui, sans-serif`.
  - Tracking: `-0.025em` on Large Display titles (`tracking-apple-tight`), `-0.01em` on Body/Subhead (`tracking-apple-subhead`).
  - Hierarchy: Navigation, controls, buttons, toolbars, and forms strictly use sans-serif to preserve platform feel and legibility.
- **Editorial & Brand Accents (Serif)**:
  - System font: `New York (NY)` via `"New York", -apple-system-ui-serif`.
  - Cross-platform fallbacks: `"Source Serif 4", "Playfair Display", "Charter", Georgia, serif`.
  - Usage: Reserved for quotes, doctrine cards, manifesto callouts, and key brand moments. Never on buttons or primary navigation.
- **Financial, Code & Data Numerals (Monospace)**:
  - System font: `SF Mono` via `"SF Mono", ui-monospace, Menlo, Monaco, Consolas`.
  - Cross-platform fallback: `"JetBrains Mono", monospace`.
  - Features: Monospaced figures with `font-feature-settings: "tnum" 1, "cv01" 1` and `tabular-nums` so numeric amounts (balances, timers, currency) never cause layout jitter.
- **Accessibility & Contrast**:
  - Minimum 11pt on mobile, 10pt on desktop. Avoid thin/ultralight weights for body text.
  - Contrast ratio strictly >= 4.5:1 for body copy and >= 3:1 for large/bold headlines.
