import React, { useState } from 'react';
import { soundManager } from '../utils/sounds';

/**
 * Fixed-position sound toggle button (🔊 / 🔇).
 * Reads initial state from soundManager (which loads from localStorage).
 */
const SoundToggle = () => {
    const [enabled, setEnabled] = useState(soundManager.enabled);

    const handleToggle = () => {
        const next = soundManager.toggle();
        setEnabled(next);
        // Play a short click to confirm re-enable
        if (next) soundManager.playSound('click');
    };

    return (
        <button
            onClick={handleToggle}
            title={enabled ? 'Mute sounds' : 'Enable sounds'}
            style={{
                position: 'fixed',
                top: '14px',
                right: '16px',
                zIndex: 9999,
                background: enabled
                    ? 'linear-gradient(135deg, rgba(0,217,255,0.15), rgba(176,38,255,0.15))'
                    : 'rgba(30,30,40,0.8)',
                border: enabled ? '1px solid #00D9FF50' : '1px solid #55555580',
                borderRadius: '10px',
                padding: '6px 10px',
                fontSize: '1.2rem',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
                lineHeight: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
            {enabled ? '🔊' : '🔇'}
        </button>
    );
};

export default SoundToggle;
