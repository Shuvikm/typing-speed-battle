import React, { useState, useEffect } from 'react';

/**
 * AnimatedCountdown – Full-screen Kahoot-style 3-2-1-GO! countdown
 * Props: from (number, default 3), onDone (fn called when done)
 */
const AnimatedCountdown = ({ from = 3, onDone }) => {
    const [current, setCurrent] = useState(from);
    const [key, setKey] = useState(0); // used to re-trigger animation each tick

    useEffect(() => {
        if (current === 0) {
            // Show GO! then call onDone
            const t = setTimeout(() => onDone?.(), 800);
            return () => clearTimeout(t);
        }
        const t = setTimeout(() => {
            setCurrent(prev => prev - 1);
            setKey(k => k + 1);
        }, 900);
        return () => clearTimeout(t);
    }, [current, onDone]);

    const colors = ['#FF4444', '#FFD700', '#00D9FF', '#00FF41'];
    const color = current === 0 ? colors[3] : colors[(from - current) % colors.length];

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-bg bg-opacity-95">
            {/* Background pulse rings */}
            <div
                key={`ring-${key}`}
                style={{
                    position: 'absolute',
                    width: '300px', height: '300px',
                    borderRadius: '50%',
                    border: `6px solid ${color}`,
                    opacity: 0,
                    animation: 'ring-expand 0.9s ease-out forwards',
                }}
            />
            <div
                key={`num-${key}`}
                style={{
                    color,
                    fontSize: 'clamp(8rem, 20vw, 16rem)',
                    fontFamily: 'Audiowide, Orbitron, sans-serif',
                    fontWeight: 900,
                    textShadow: `0 0 30px ${color}, 0 0 60px ${color}`,
                    animation: 'countdown-pop 0.85s cubic-bezier(0.34,1.56,0.64,1) forwards',
                    lineHeight: 1,
                }}
            >
                {current === 0 ? 'GO!' : current}
            </div>
            <p
                className="mt-8 text-2xl text-gray-400 animate-pulse"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
                {current === 0 ? 'Start Typing!' : 'Get Ready, Pirate!'}
            </p>

            <style>{`
        @keyframes ring-expand {
          0%   { transform: scale(0.3); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
        </div>
    );
};

export default AnimatedCountdown;
