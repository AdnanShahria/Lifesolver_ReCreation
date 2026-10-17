import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Sparkles, Shield, EyeOff, Timer } from 'lucide-react';

const PopupApp: React.FC = () => {
  const [feedEradicator, setFeedEradicator] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(['feedEradicatorActive'], (res) => {
      if (res.feedEradicatorActive !== undefined) {
        setFeedEradicator(res.feedEradicatorActive);
      }
    });
  }, []);

  const toggleFeedEradicator = () => {
    const next = !feedEradicator;
    setFeedEradicator(next);
    chrome.storage.local.set({ feedEradicatorActive: next });
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={16} color="#ffffff" />
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>LifeSolver Shield</div>
          <div style={{ fontSize: '10px', color: '#a1a1aa' }}>Edge Focus Telemetry Active</div>
        </div>
      </div>

      <div style={{ background: '#18181b', borderRadius: '8px', padding: '12px', border: '1px solid rgba(139, 92, 246, 0.2)', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EyeOff size={16} color="#8b5cf6" />
            <span style={{ fontSize: '12px', fontWeight: '500' }}>Feed Eradicator</span>
          </div>
          <input
            type="checkbox"
            checked={feedEradicator}
            onChange={toggleFeedEradicator}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <div style={{ fontSize: '10px', color: '#71717a', marginTop: '6px' }}>
          Hides algorithmic feeds on YouTube, X, and LinkedIn.
        </div>
      </div>

      <a
        href="http://localhost:5173"
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'block',
          textAlign: 'center',
          padding: '8px 12px',
          background: '#8b5cf6',
          color: '#ffffff',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        Open Command Center
      </a>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('popup-root')!).render(<PopupApp />);
