# 🧩 Chrome Extension (MV3) Architecture & Focus Shield

1. **Manifest V3 Compliance**:
   - Background service worker uses `chrome.storage.session` for active domain timers (survives worker sleep).
   - Rules engine utilizes `declarativeNetRequest` for instant URL blocking.

2. **Core Modules**:
   - **Focus Gate**: Enforces cool-down periods on distracting sites.
   - **Feed Eradicator**: CSS injection hiding recommendation feeds on YouTube, X, and LinkedIn.
   - **Checkout Gate**: Intercepts e-commerce payment pages and evaluates current category budget before purchase.
   - **Dopamine Detox**: Emergency 30-minute lock with OTP verification to unlock.
