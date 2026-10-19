import React, { useMemo } from 'react';

interface Particle {
  id: number;
  startX: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export const CosmicStarfield: React.FC = () => {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 32 }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      size: Math.random() * 2 + 1, // subtle micro points (1px to 3px)
      duration: Math.random() * 14 + 16, // slow, serene drift
      delay: Math.random() * 12,
      opacity: Math.random() * 0.45 + 0.15
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Apple-grade Atmospheric Ambient Volumetric Lighting */}
      <div 
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[160px] pointer-events-none"
        style={{ 
          background: 'radial-gradient(ellipse at center, rgba(10, 132, 255, 0.12) 0%, rgba(94, 92, 230, 0.06) 50%, transparent 80%)' 
        }}
      />
      <div 
        className="absolute top-[40%] -right-40 w-[600px] h-[600px] rounded-full blur-[170px] pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, rgba(100, 210, 255, 0.07) 0%, rgba(0, 113, 227, 0.04) 50%, transparent 80%)' 
        }}
      />
      <div 
        className="absolute bottom-10 left-[10%] w-[700px] h-[700px] rounded-full blur-[180px] pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, rgba(94, 92, 230, 0.08) 0%, rgba(191, 90, 242, 0.03) 60%, transparent 80%)' 
        }}
      />

      {/* Gentle Micro Luminescence Points */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.startX}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: 'rgba(255, 255, 255, 0.85)',
            boxShadow: `0 0 ${p.size * 2}px rgba(100, 210, 255, 0.5)`,
            animation: `appleCosmicDrift ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity
          }}
        />
      ))}

      <style>{`
        @keyframes appleCosmicDrift {
          0% {
            transform: translateY(-2vh) scale(0.8);
            opacity: 0;
          }
          20% {
            opacity: 0.7;
          }
          80% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(102vh) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
