import React, { useMemo } from 'react';

const COLORS = ['#FF4444', '#FFD700', '#00D9FF', '#00FF41', '#B026FF', '#FF6600', '#FF69B4'];

const Confetti = ({ count = 60 }) => {
    const pieces = useMemo(() =>
        Array.from({ length: count }, (_, i) => ({
            id: i,
            color: COLORS[i % COLORS.length],
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 1.5}s`,
            duration: `${1.5 + Math.random() * 2}s`,
            size: `${8 + Math.random() * 10}px`,
            rotate: `${Math.random() * 360}deg`,
        })),
        [count]
    );

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {pieces.map(p => (
                <div
                    key={p.id}
                    style={{
                        position: 'absolute',
                        left: p.left,
                        top: '-20px',
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        transform: `rotate(${p.rotate})`,
                        animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
                    }}
                />
            ))}
        </div>
    );
};

export default Confetti;
