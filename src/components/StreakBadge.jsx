import React from 'react';
import PropTypes from 'prop-types';

/**
 * StreakBadge – Duolingo/Kahoot style combo streak indicator
 * Props: streak (number), combo (number), className (string)
 */
const StreakBadge = ({ streak = 0, combo = 1, className = '' }) => {
    if (streak < 3) return null;

    const isOnFire = streak >= 10;
    const isHot = streak >= 5;
    const isCold = streak < 5;

    const emoji = isOnFire ? '🔥🔥🔥' : isHot ? '🔥🔥' : '🔥';
    const label = isOnFire ? 'ON FIRE!' : isHot ? 'HOT STREAK!' : 'COMBO!';
    const color = isOnFire ? '#FF0000' : isHot ? '#FF6600' : '#FFD700';
    const glowColor = isOnFire ? '#ff000080' : isHot ? '#ff660080' : '#ffd70050';
    const pulse = isOnFire ? '0.5s' : isHot ? '0.7s' : '0.9s';

    return (
        <div
            role="status"
            aria-label={`${label} ${combo}x combo, ${streak} streak`}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold select-none ${className}`}
            style={{
                background: `linear-gradient(135deg, ${glowColor}, rgba(0,0,0,0.8))`,
                border: `2px solid ${color}`,
                boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`,
                animation: `fire-pulse ${pulse} ease-in-out infinite alternate, pop-in 0.4s ease-out`,
                fontFamily: 'Orbitron, sans-serif',
            }}
        >
            <span className="text-2xl" aria-hidden="true">{emoji}</span>
            <div>
                <div style={{ color, fontSize: '0.75rem', letterSpacing: '0.15em' }}>{label}</div>
                <div style={{ color: '#fff', fontSize: '1.2rem' }}>
                    {combo}x COMBO
                    {isOnFire && (
                        <span style={{ fontSize: '0.7rem', color: '#FF6600', marginLeft: 6 }}>
                            ({streak} streak)
                        </span>
                    )}
                </div>
            </div>
            <span className="text-2xl" aria-hidden="true">{emoji}</span>
        </div>
    );
};

StreakBadge.propTypes = {
    streak: PropTypes.number,
    combo: PropTypes.number,
    className: PropTypes.string,
};

export default React.memo(StreakBadge);
