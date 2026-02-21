import React, { useState, useEffect } from 'react';

/**
 * FloatingScore – Kahoot/Duolingo style floating "+100 pts" text
 * Props: text (string), color (string), onDone (fn)
 */
const FloatingScore = ({ text = '+100', color = '#FFD700', duration = 1200, onDone }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => {
            setVisible(false);
            onDone?.();
        }, duration);
        return () => clearTimeout(t);
    }, [duration, onDone]);

    if (!visible) return null;

    return (
        <div
            className="float-score select-none"
            style={{ color, fontSize: '1.8rem', fontFamily: 'Orbitron, sans-serif', fontWeight: 900 }}
        >
            {text}
        </div>
    );
};

export default FloatingScore;
