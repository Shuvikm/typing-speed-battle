import React, { useEffect, useState, useRef } from 'react';

const EMOJIS = ['🔥', '⚡', '✨', '💥', '🌟', '💫', '🎯', '🏆', '👑', '🚀'];
const COLORS = ['#FFD700', '#00FF41', '#00D9FF', '#B026FF', '#FF6600', '#FF4444'];

/**
 * ComboBurst
 * Fires a particle explosion of emojis/glyphs when `trigger` changes to truthy.
 * Particles fly out in all directions and fade over 900ms.
 *
 * Props:
 *   trigger   — any truthy value change fires a burst (pass combo level or streak)
 *   x / y     — optional pixel position (defaults to viewport center)
 *   count     — number of particles (default 14)
 */
const ComboBurst = ({ trigger, x, y, count = 14 }) => {
    const [particles, setParticles] = useState([]);
    const idRef = useRef(0);

    useEffect(() => {
        if (!trigger) return;
        const cx = x ?? window.innerWidth / 2;
        const cy = y ?? window.innerHeight / 2;

        const newParticles = Array.from({ length: count }, (_, i) => {
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
            const speed = 80 + Math.random() * 120;
            const id = ++idRef.current;
            return {
                id,
                emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 18 + Math.random() * 16,
                life: 1,
            };
        });

        setParticles(prev => [...prev, ...newParticles]);

        // Animate — RAF loop
        let start = null;
        const DURATION = 900;
        const loop = (ts) => {
            if (!start) start = ts;
            const pct = (ts - start) / DURATION;
            if (pct >= 1) {
                setParticles(prev => prev.filter(p => !newParticles.some(n => n.id === p.id)));
                return;
            }
            setParticles(prev =>
                prev.map(p => {
                    if (!newParticles.some(n => n.id === p.id)) return p;
                    return {
                        ...p,
                        x: p.x + p.vx * (1 / 60),
                        y: p.y + p.vy * (1 / 60) + 30 * pct,   // gravity
                        life: 1 - pct,
                    };
                })
            );
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger]);

    if (!particles.length) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9000 }}>
            {particles.map(p => (
                <div
                    key={p.id}
                    style={{
                        position: 'absolute',
                        left: p.x,
                        top: p.y,
                        fontSize: p.size,
                        opacity: p.life,
                        color: p.color,
                        transform: `translate(-50%, -50%) scale(${0.5 + p.life * 0.7})`,
                        filter: `drop-shadow(0 0 6px ${p.color})`,
                        userSelect: 'none',
                    }}
                >
                    {p.emoji}
                </div>
            ))}
        </div>
    );
};

export default ComboBurst;
