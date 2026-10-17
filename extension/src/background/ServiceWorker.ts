/**
 * LifeSolver Chrome MV3 Service Worker
 * Tracks active domain duration via chrome.storage.session (resilient to service worker sleep)
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('🌌 LifeSolver Focus Shield service worker installed.');
});

let activeDomain = '';
let activeStartTime = Date.now();

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  handleDomainChange(tab.url);
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    handleDomainChange(tab.url);
  }
});

function handleDomainChange(url?: string) {
  if (!url || !url.startsWith('http')) return;
  try {
    const domain = new URL(url).hostname;
    const now = Date.now();

    if (activeDomain && activeDomain !== domain) {
      const durationSeconds = Math.round((now - activeStartTime) / 1000);
      recordUsage(activeDomain, durationSeconds);
    }

    activeDomain = domain;
    activeStartTime = now;
  } catch {
    // Invalid URL format
  }
}

async function recordUsage(domain: string, durationSeconds: number) {
  if (durationSeconds < 2) return;
  const key = `usage_${domain}`;
  const data = await chrome.storage.session.get(key);
  const current = (data[key] as number) || 0;
  await chrome.storage.session.set({ [key]: current + durationSeconds });
}
