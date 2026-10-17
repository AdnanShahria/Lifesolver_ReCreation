/**
 * LifeSolver Content Script — Focus Gate & Feed Eradicator
 */
console.log('🌌 LifeSolver Focus Gate Active on:', window.location.hostname);

const DISTRACTING_DOMAINS = ['youtube.com', 'twitter.com', 'x.com', 'linkedin.com', 'facebook.com', 'instagram.com'];

function checkAndApplyFeedEradicator() {
  const host = window.location.hostname;
  const isTarget = DISTRACTING_DOMAINS.some(d => host.includes(d));

  if (isTarget) {
    // Check if feed eradication is enabled
    chrome.storage.local.get(['feedEradicatorActive'], (res) => {
      if (res.feedEradicatorActive !== false) {
        // Feed eradication CSS injection
        const style = document.createElement('style');
        style.id = 'lifesolver-feed-eradicator';
        style.textContent = `
          /* YouTube Home & Shorts */
          ytd-browse[page-subtype="home"], ytd-reel-shelf-renderer, #shorts-container { display: none !important; }
          /* Twitter / X Feed */
          div[data-testid="primaryColumn"] section { display: none !important; }
          /* LinkedIn Feed */
          .scaffold-finite-scroll { display: none !important; }
        `;
        if (!document.getElementById('lifesolver-feed-eradicator')) {
          document.head.appendChild(style);
        }
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndApplyFeedEradicator);
} else {
  checkAndApplyFeedEradicator();
}
