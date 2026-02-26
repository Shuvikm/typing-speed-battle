import React, { useEffect, useState } from 'react';

/**
 * FloatingScore — animates a score value floating upward then fades.
 * Props: text (string), color (string), onDone (function)
 */
const FloatingScore = ({ text, color = '#00FF41', onDone }) => {
    const [style, setStyle] = useState({
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '2rem',
        fontWeight: 900,
        color,
        fontFamily: 'Orbitron, sans-serif',
        textShadow: `0 0 20px ${color}`,
        pointerEvents: 'none',
        zIndex: 100,
        opacity: 1,
        transition: 'all 0.8s ease-out',
    });

    useEffect(() => {
        // Animate upward + fade
        const raf = requestAnimationFrame(() => {
            setStyle((s) => ({ ...s, top: 'calc(50% - 60px)', opacity: 0 }));
        });
        const timer = setTimeout(() => onDone && onDone(), 900);
        return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
    }, [onDone]);

    return <div style={style}>{text}</div>;
};

export default React.memo(FloatingScore);
