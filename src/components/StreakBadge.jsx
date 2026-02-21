import React from 'react';

/**
 * StreakBadge – Duolingo/Kahoot style combo streak indicator
 * Props: streak (number), combo (number)
 */
const StreakBadge = ({ streak = 0, combo = 1 }) => {
    if (streak < 3) return null;

    const isOnFire = streak >= 10;
    const isHot = streak >= 5;

    const emoji = isOnFire ? '🔥🔥🔥' : isHot ? '🔥🔥' : '🔥';
    const label = isOnFire ? 'ON FIRE!' : isHot ? 'HOT STREAK!' : 'COMBO!';
    const color = isOnFire ? '#FF0000' : isHot ? '#FF6600' : '#FFD700';
    const glowColor = isOnFire ? '#ff000080' : '#ff660080';

    return (
        <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold select-none"
            style={{
                background: `linear-gradient(135deg, ${glowColor}, rgba(0,0,0,0.8))`,
                border: `2px solid ${color}`,
                boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`,
                animation: 'fire-pulse 0.8s ease-in-out infinite alternate, pop-in 0.4s ease-out',
                fontFamily: 'Orbitron, sans-serif',
            }}
        >
            <span className="text-2xl">{emoji}</span>
            <div>
                <div style={{ color, fontSize: '0.75rem', letterSpacing: '0.15em' }}>{label}</div>
                <div style={{ color: '#fff', fontSize: '1.2rem' }}>{combo}x COMBO</div>
            </div>
            <span className="text-2xl">{emoji}</span>
        </div>
    );
};

export default StreakBadge;
