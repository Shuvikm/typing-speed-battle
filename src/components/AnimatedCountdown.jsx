import React, { useState, useEffect } from 'react';

/**
 * AnimatedCountdown — full-screen 3-2-1-GO! overlay.
 * Props:
 *   from     {number}   starting number (default 3)
 *   onDone   {function} called when countdown finishes
 */
const AnimatedCountdown = ({ from = 3, onDone }) => {
    const [count, setCount] = useState(from);
    const [phase, setPhase] = useState('counting'); // 'counting' | 'go'

    useEffect(() => {
        if (count <= 0) {
            setPhase('go');
            const t = setTimeout(() => onDone && onDone(), 700);
            return () => clearTimeout(t);
        }
        const t = setTimeout(() => setCount((c) => c - 1), 900);
        return () => clearTimeout(t);
    }, [count, onDone]);

    const isGo = phase === 'go';
    const color = isGo ? '#00FF41' : count === 1 ? '#FF4444' : count === 2 ? '#FFD700' : '#00D9FF';

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(10,10,15,0.96)',
                fontFamily: 'Orbitron, sans-serif',
            }}
        >
            <div
                key={isGo ? 'go' : count}
                style={{
                    fontSize: isGo ? '8rem' : '12rem',
                    fontWeight: 900,
                    color,
                    textShadow: `0 0 40px ${color}, 0 0 80px ${color}60`,
                    animation: 'bounce-in 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                    lineHeight: 1,
                }}
            >
                {isGo ? 'GO!' : count}
            </div>
            {!isGo && (
                <div style={{ color: '#888', fontSize: '1.2rem', marginTop: '1.5rem', letterSpacing: '0.3em' }}>
                    GET READY
                </div>
            )}
        </div>
    );
};

export default React.memo(AnimatedCountdown);
