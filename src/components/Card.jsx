import React from 'react';

/**
 * Minimal Card container with optional neon glow border.
 * Props: glow (bool), className (string)
 */
const Card = ({ children, glow = false, className = '' }) => (
    <div
        className={`rounded-xl p-6 ${className}`}
        style={{
            background: '#1a1a2e',
            border: glow ? '1px solid rgba(0,217,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
            boxShadow: glow ? '0 0 20px rgba(0,217,255,0.08)' : 'none',
        }}
    >
        {children}
    </div>
);

export default React.memo(Card);
