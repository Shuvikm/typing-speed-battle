import React, { useEffect, useState, useCallback } from 'react';

/* ─── Layout ──────────────────────────────────────────────────────────────── */
const ROWS = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '>Shift'],
    ['Ctrl', 'Alt', ' ', 'Alt', 'Ctrl'],
];
const WIDE = new Set(['Backspace', 'Tab', 'Caps', 'Enter', 'Shift', '>Shift', 'Ctrl', 'Alt']);

const LABEL = (k) => {
    if (k === '>Shift') return 'Shift';
    if (k === ' ') return 'Space';
    return k.length === 1 ? k.toUpperCase() : k;
};
const VALUE = (k) => ({ '>Shift': 'Shift', 'Caps': 'CapsLock' })[k] ?? k;

/* ─── Neon palette ────────────────────────────────────────────────────────── */
const C = {
    next: '#00D9FF',   // cyan   — next key to press
    correct: '#00FF41',   // green  — key just pressed correctly
    error: '#FF4444',   // red    — wrong key
    pressed: '#B026FF',   // purple — any other live keypress
    accent: '#FFD700',   // gold   — modifiers / special keys
    bg: '#1a1a2e',
    keyBg: '#0e0e1a',
    keyBg2: '#181828',
};

/**
 * VirtualKeyboard
 *  nextChar  — next character the user must type
 *  lastError — true for ~400 ms when a wrong key was pressed
 *  compact   — render smaller (default true)
 */
const VirtualKeyboard = ({ nextChar = '', lastError = false, compact = true }) => {
    const [pressed, setPressed] = useState(new Set());

    const down = useCallback((e) => {
        setPressed(p => new Set([...p, e.key.toLowerCase()]));
    }, []);
    const up = useCallback((e) => {
        setPressed(p => { const n = new Set(p); n.delete(e.key.toLowerCase()); return n; });
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
    }, [down, up]);

    const nextLower = nextChar ? nextChar.toLowerCase() : '';

    const keyStyle = (k) => {
        const val = VALUE(k).toLowerCase();
        const isNext = !!nextLower && val === nextLower;
        const isLive = pressed.has(val);
        const isSpace = k === ' ';
        const isWide = WIDE.has(k);
        const isMod = ['Ctrl', 'Alt', 'Caps', 'Tab', 'Shift', '>Shift'].includes(k);

        const minWidth = isSpace ? (compact ? 96 : 140)
            : isWide ? (compact ? 40 : 54)
                : compact ? 26 : 36;
        const height = k === ' ' ? (compact ? 26 : 36) : compact ? 26 : 36;

        /* colour logic */
        let bg = `linear-gradient(160deg, ${C.keyBg2}, ${C.keyBg})`;
        let color = '#555';
        let border = `1px solid #ffffff08`;
        let shadow = `0 3px 0 #00000080, 0 5px 10px #00000060`;
        let glow = 'none';
        let ty = '0px';
        let textShadow = 'none';

        if (isMod) { color = C.accent + '80'; border = `1px solid ${C.accent}15`; }
        if (isSpace) { bg = `linear-gradient(160deg, #1e1e32, #16162a)`; color = '#2a2a4a'; }

        if (isNext && !isLive) {
            const nc = lastError ? C.error : C.next;
            bg = `linear-gradient(160deg, ${nc}25, ${nc}10)`;
            color = nc;
            border = `1.5px solid ${nc}90`;
            shadow = `0 4px 0 ${nc}50, 0 0 18px ${nc}50, 0 5px 14px #00000080`;
            glow = `0 0 24px ${nc}60`;
            textShadow = `0 0 12px ${nc}`;
        }

        if (isLive) {
            const lc = isNext ? C.correct : C.pressed;
            bg = `linear-gradient(160deg, ${lc}35, ${lc}18)`;
            color = lc;
            border = `1.5px solid ${lc}70`;
            shadow = `0 1px 0 ${lc}40, inset 0 2px 5px #00000060`;
            glow = `0 0 14px ${lc}50`;
            ty = '2px';
            textShadow = `0 0 8px ${lc}`;
        }

        return {
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minWidth, height, flexShrink: 0,
            background: bg, color, border, textShadow,
            borderRadius: 5,
            boxShadow: shadow,
            filter: glow !== 'none' ? `drop-shadow(${glow})` : undefined,
            transform: `translateY(${ty})`,
            transition: 'all 0.07s ease',
            fontFamily: "'Orbitron', 'monospace'",
            fontSize: compact ? 7 : 9,
            fontWeight: 700,
            letterSpacing: '0.03em',
            userSelect: 'none',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden',
        };
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: compact ? 3 : 4,
            padding: compact ? 10 : 14,
            background: 'linear-gradient(160deg, #12121e, #0a0a14)',
            borderRadius: 12,
            border: '1px solid #ffffff08',
            boxShadow: '0 24px 48px #00000080, inset 0 1px 0 #ffffff0a',
            transform: 'perspective(600px) rotateX(10deg)',
            transformOrigin: 'bottom center',
        }}>
            {ROWS.map((row, ri) => (
                <div key={ri} style={{ display: 'flex', gap: compact ? 3 : 4, justifyContent: 'center' }}>
                    {row.map((k, ki) => (
                        <div key={ki} style={keyStyle(k)}>
                            {/* shimmer top highlight */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
                                background: 'linear-gradient(180deg,rgba(255,255,255,0.04),transparent)',
                                borderRadius: '4px 4px 0 0', pointerEvents: 'none',
                            }} />
                            {LABEL(k)}
                        </div>
                    ))}
                </div>
            ))}

            {/* Legend */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', paddingTop: 3 }}>
                {[
                    { c: C.next, t: 'Next' },
                    { c: C.correct, t: 'Correct' },
                    { c: C.error, t: 'Wrong' },
                    { c: C.pressed, t: 'Pressed' },
                ].map(({ c, t }) => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <div style={{ width: 6, height: 6, borderRadius: 2, background: c, boxShadow: `0 0 6px ${c}` }} />
                        <span style={{ fontSize: 7, color: '#444', fontFamily: 'Orbitron,sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VirtualKeyboard;
