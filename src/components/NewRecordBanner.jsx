import React, { useEffect, useState } from 'react';

/**
 * NewRecordBanner
 * Shows a full-screen animated overlay for ~2.5 s when a personal best is beaten.
 * Props:
 *   wpm       number  — the new PB WPM
 *   prevBest  number  — old personal best (0 = first ever)
 *   onDone    fn      — called when animation finishes
 */
const NewRecordBanner = ({ wpm, prevBest, onDone }) => {
    const [phase, setPhase] = useState('in'); // 'in' | 'hold' | 'out'
    const delta = wpm - prevBest;

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('hold'), 600);
        const t2 = setTimeout(() => setPhase('out'), 2200);
        const t3 = setTimeout(() => onDone?.(), 2700);
        return () => [t1, t2, t3].forEach(clearTimeout);
    }, [onDone]);

    const opacity = phase === 'out' ? 0 : 1;
    const scale = phase === 'in' ? 0.6 : phase === 'hold' ? 1 : 1.08;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.82)',
                backdropFilter: 'blur(6px)',
                opacity, transition: 'opacity 0.5s ease',
                pointerEvents: phase === 'out' ? 'none' : 'all',
            }}
        >
            {/* Rings */}
            {[1, 2, 3].map(i => (
                <div key={i} style={{
                    position: 'absolute',
                    width: `${i * 200 + 100}px`, height: `${i * 200 + 100}px`,
                    borderRadius: '50%',
                    border: `${4 - i}px solid rgba(0,255,65,${0.25 / i})`,
                    animation: `pulse ${1 + i * 0.3}s ease-out infinite`,
                    pointerEvents: 'none',
                }} />
            ))}

            {/* Card */}
            <div style={{
                textAlign: 'center',
                transform: `scale(${scale})`,
                transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
                {/* Emoji burst */}
                <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 8, filter: 'drop-shadow(0 0 20px #00FF41)' }}>
                    🏆
                </div>

                {/* Title */}
                <div style={{
                    fontFamily: 'Audiowide, sans-serif',
                    fontSize: 38, fontWeight: 900,
                    background: 'linear-gradient(135deg, #FFD700, #FF6600)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    letterSpacing: '0.04em', lineHeight: 1.1,
                    textShadow: 'none',
                    marginBottom: 8,
                }}>
                    NEW RECORD!
                </div>

                {/* WPM */}
                <div style={{
                    fontFamily: 'Orbitron, monospace',
                    fontSize: 80, fontWeight: 900,
                    color: '#00FF41',
                    filter: 'drop-shadow(0 0 30px #00FF41)',
                    lineHeight: 1,
                }}>
                    {wpm}
                    <span style={{ fontSize: 28, color: '#00FF4180', marginLeft: 4 }}>WPM</span>
                </div>

                {/* Delta */}
                {prevBest > 0 && (
                    <div style={{
                        marginTop: 12,
                        fontFamily: 'Orbitron, monospace',
                        fontSize: 20,
                        color: '#00D9FF',
                        filter: 'drop-shadow(0 0 10px #00D9FF)',
                    }}>
                        +{delta} WPM better than your last best ✨
                    </div>
                )}
                {prevBest === 0 && (
                    <div style={{ marginTop: 12, fontSize: 18, color: '#00D9FF', fontFamily: 'Orbitron,monospace' }}>
                        Your first record! Keep it up 🚀
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewRecordBanner;
