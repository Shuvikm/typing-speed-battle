import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * AnimatedCountdown — full-screen 3-2-1-GO! overlay.
 * Props:
 *   from     {number}   starting number (default 3)
 *   onDone   {function} called when countdown finishes
 *   label    {string}   optional subtitle (default 'GET READY')
 */
const AnimatedCountdown = ({ from = 3, onDone, label = 'GET READY' }) => {
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
    const color = isGo
        ? '#00FF41'
        : count === 1 ? '#FF4444'
            : count === 2 ? '#FFD700'
                : '#00D9FF';

    // Background radial sweep that grows as countdown progresses  
    const progress = ((from - count) / from) * 100;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={isGo ? 'Go!' : `Starting in ${count}`}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(10,10,15,0.96)',
                fontFamily: 'Orbitron, sans-serif',
            }}
        >
            {/* Radial progress ring */}
            {!isGo && (
                <svg
                    width="220" height="220"
                    style={{ position: 'absolute', opacity: 0.25 }}
                    aria-hidden="true"
                >
                    <circle cx="110" cy="110" r="100" fill="none" stroke="#333" strokeWidth="6" />
                    <circle
                        cx="110" cy="110" r="100"
                        fill="none" stroke={color} strokeWidth="6"
                        strokeDasharray={`${2 * Math.PI * 100}`}
                        strokeDashoffset={`${2 * Math.PI * 100 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                        transform="rotate(-90 110 110)"
                        style={{ transition: 'stroke-dashoffset 0.8s linear, stroke 0.3s ease' }}
                    />
                </svg>
            )}

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
                    {label}
                </div>
            )}
        </div>
    );
};

AnimatedCountdown.propTypes = {
    from: PropTypes.number,
    onDone: PropTypes.func,
    label: PropTypes.string,
};

export default React.memo(AnimatedCountdown);
