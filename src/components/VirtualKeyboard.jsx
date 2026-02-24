import React, { useEffect, useState, useCallback } from 'react';

// Keyboard layout rows
const ROWS = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '>Shift'],
    ['Ctrl', 'Alt', ' ', 'Alt', 'Ctrl'],
];

const WIDE_KEYS = new Set(['Backspace', 'Tab', 'Caps', 'Enter', 'Shift', '>Shift', 'Ctrl', 'Alt']);
const SPACEBAR_KEY = ' ';

// Map display label → actual key value (what keydown.key returns)
const KEY_TO_VALUE = {
    'Backspace': 'Backspace', 'Tab': 'Tab', 'Caps': 'CapsLock', 'Enter': 'Enter',
    'Shift': 'Shift', '>Shift': 'Shift', 'Ctrl': 'Control', 'Alt': 'Alt',
    ' ': ' ',
};

const displayLabel = (k) => {
    if (k === '>Shift') return 'Shift';
    if (k === 'Caps') return 'Caps';
    if (k === ' ') return 'Space';
    return k.toUpperCase();
};

// The exact character that needs to be typed → which key to highlight
const charToKey = (ch) => {
    if (!ch) return null;
    const lower = ch.toLowerCase();
    return lower; // keys are stored lowercase; special chars handled below
};

const KEY_ACCENT_COLORS = {
    correct: '#00FF41',
    next: '#FFD700',
    pressed: '#00D9FF',
    error: '#FF4444',
};

/**
 * VirtualKeyboard
 * Props:
 *   nextChar   string   — the next character the user needs to type
 *   lastError  bool     — true for one tick when the last keypress was wrong
 *   compact    bool     — render smaller (for sidebar / mobile)
 */
const VirtualKeyboard = ({ nextChar = '', lastError = false, compact = false }) => {
    const [pressedKeys, setPressedKeys] = useState(new Set());

    const handleKeyDown = useCallback((e) => {
        setPressedKeys(prev => new Set([...prev, e.key.toLowerCase()]));
    }, []);
    const handleKeyUp = useCallback((e) => {
        setPressedKeys(prev => {
            const next = new Set(prev);
            next.delete(e.key.toLowerCase());
            return next;
        });
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    const nextKeyLower = charToKey(nextChar);

    const getKeyStyle = (k) => {
        const keyValue = KEY_TO_VALUE[k] ?? k;
        const keyLower = keyValue.toLowerCase();
        const isNext = nextKeyLower && keyLower === nextKeyLower;
        const isPressed = pressedKeys.has(keyLower);
        const isSpace = k === SPACEBAR_KEY;

        let bg = 'linear-gradient(145deg, #2a2a2a, #1a1a1a)';
        let color = '#c0c0c0';
        let boxShadow = compact
            ? '0 4px 0 rgba(0,0,0,0.5), 0 6px 10px rgba(0,0,0,0.4)'
            : '0 6px 0 rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.5)';
        let transform = 'translateY(0)';
        let border = '1px solid rgba(255,255,255,0.06)';
        let textShadow = 'none';

        if (isNext && !isPressed) {
            const c = lastError ? KEY_ACCENT_COLORS.error : KEY_ACCENT_COLORS.next;
            bg = `linear-gradient(145deg, ${c}40, ${c}20)`;
            color = c;
            border = `1.5px solid ${c}`;
            boxShadow = `0 6px 0 ${c}60, 0 0 16px ${c}60, 0 8px 16px rgba(0,0,0,0.5)`;
            textShadow = `0 0 10px ${c}`;
        }

        if (isPressed) {
            const c = isNext ? KEY_ACCENT_COLORS.correct : KEY_ACCENT_COLORS.pressed;
            bg = `linear-gradient(145deg, ${c}50, ${c}30)`;
            color = c;
            border = `1.5px solid ${c}80`;
            boxShadow = `0 2px 0 ${c}40, inset 0 2px 4px rgba(0,0,0,0.4)`;
            transform = 'translateY(2px)';
            textShadow = `0 0 8px ${c}`;
        }

        // Special key colors (orange accent like original)
        if (['Enter', 'Tab', '>Shift', 'Shift'].includes(k) && !isNext && !isPressed) {
            bg = 'linear-gradient(145deg, #3a2800, #2a1a00)';
            color = '#ff8c00';
            border = '1px solid rgba(255,140,0,0.2)';
        }
        if (['Ctrl', 'Alt', 'Caps'].includes(k) && !isNext && !isPressed) {
            bg = 'linear-gradient(145deg, #252525, #181818)';
            color = '#888';
        }
        if (isSpace && !isNext && !isPressed) {
            bg = 'linear-gradient(145deg, #ff8c0015, #ff6b0010)';
            color = '#ff8c0080';
            border = '1px solid rgba(255,140,0,0.15)';
        }

        const scale = compact ? 0.82 : 1;
        const minWidth = isSpace ? (compact ? 100 : 160)
            : WIDE_KEYS.has(k) ? (compact ? 42 : 56)
                : (compact ? 28 : 38);
        const height = compact ? 28 : 38;

        return {
            minWidth, height: height * (k === SPACEBAR_KEY ? 1 : 1),
            background: bg, color, border, boxShadow, transform,
            textShadow, borderRadius: 6, fontSize: compact ? 8 : 10,
            fontFamily: 'Orbitron, monospace', fontWeight: 600,
            transition: 'all 0.08s ease', cursor: 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            userSelect: 'none', letterSpacing: '0.03em',
        };
    };

    const wrapperStyle = {
        display: 'flex', flexDirection: 'column', gap: compact ? 4 : 5,
        padding: compact ? 10 : 14,
        background: 'linear-gradient(145deg, #181818, #0f0f0f)',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        transform: 'perspective(800px) rotateX(14deg)',
        transformOrigin: 'bottom center',
    };

    return (
        <div style={wrapperStyle}>
            {ROWS.map((row, ri) => (
                <div key={ri} style={{ display: 'flex', gap: compact ? 3 : 4, justifyContent: 'center' }}>
                    {row.map((k, ki) => (
                        <div key={ki} style={getKeyStyle(k)}>
                            {displayLabel(k)}
                        </div>
                    ))}
                </div>
            ))}
            {/* Legend */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', paddingTop: 4 }}>
                {[
                    { color: KEY_ACCENT_COLORS.next, label: 'Next key' },
                    { color: KEY_ACCENT_COLORS.correct, label: 'Correct' },
                    { color: KEY_ACCENT_COLORS.error, label: 'Wrong' },
                ].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: color, boxShadow: `0 0 6px ${color}` }} />
                        <span style={{ fontSize: 8, color: '#555', fontFamily: 'Orbitron, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VirtualKeyboard;
