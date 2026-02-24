import React from 'react';

const ROWS = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/',],
];

const HEAT_COLORS = [
    [0, '#1a1a2e'],   // 0% — cold
    [0.1, '#0a1628'],   // tiny usage
    [0.25, '#003366'],   // slight
    [0.45, '#0066aa'],   // moderate
    [0.65, '#00D9FF'],   // hot
    [0.80, '#00FF41'],   // very hot
    [1.0, '#FFD700'],   // max
];

/** Interpolate a heat value 0–1 into a hex colour */
function heatColor(t) {
    let lo = HEAT_COLORS[0], hi = HEAT_COLORS[HEAT_COLORS.length - 1];
    for (let i = 0; i < HEAT_COLORS.length - 1; i++) {
        if (t >= HEAT_COLORS[i][0] && t <= HEAT_COLORS[i + 1][0]) {
            lo = HEAT_COLORS[i]; hi = HEAT_COLORS[i + 1]; break;
        }
    }
    const f = (t - lo[0]) / (hi[0] - lo[0] || 1);
    const hex = (c) => {
        const r = parseInt(lo[1].slice(1, 3), 16), nr = parseInt(hi[1].slice(1, 3), 16);
        const g = parseInt(lo[1].slice(3, 5), 16), ng = parseInt(hi[1].slice(3, 5), 16);
        const b = parseInt(lo[1].slice(5, 7), 16), nb = parseInt(hi[1].slice(5, 7), 16);
        const lr = Math.round(r + (nr - r) * f).toString(16).padStart(2, '0');
        const lg = Math.round(g + (ng - g) * f).toString(16).padStart(2, '0');
        const lb = Math.round(b + (nb - b) * f).toString(16).padStart(2, '0');
        return `#${lr}${lg}${lb}`;
    };
    return hex();
}

/**
 * KeyboardHeatmap
 * Props:
 *   heatmap  — { [char]: count }  e.g. { 'a': 42, 's': 19, ... }
 *   title    — optional section title
 */
const KeyboardHeatmap = ({ heatmap = {}, title = 'Key Heatmap' }) => {
    const max = Math.max(1, ...Object.values(heatmap));

    const keyStyle = (k) => {
        const count = heatmap[k.toLowerCase()] || 0;
        const t = count / max;
        const bg = heatColor(t);
        const glow = count > 0 ? `0 0 ${8 + t * 20}px ${bg}` : 'none';
        return {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32, height: 32, flexShrink: 0,
            background: bg,
            borderRadius: 5,
            border: `1px solid ${count > 0 ? bg + '80' : '#ffffff08'}`,
            boxShadow: glow,
            color: t > 0.5 ? '#000' : t > 0.2 ? '#fff' : '#444',
            fontFamily: "'Orbitron', monospace",
            fontSize: 9, fontWeight: 700,
            position: 'relative',
            transition: 'all 0.3s ease',
        };
    };

    const countStyle = (k) => {
        const count = heatmap[k.toLowerCase()] || 0;
        if (!count) return null;
        return (
            <div style={{
                position: 'absolute', top: 2, right: 3,
                fontSize: 6, color: 'rgba(255,255,255,0.5)', lineHeight: 1
            }}>
                {count > 99 ? '99+' : count}
            </div>
        );
    };

    return (
        <div style={{
            background: 'linear-gradient(160deg,#12121e,#0a0a14)',
            border: '1px solid #ffffff08',
            borderRadius: 12, padding: 16,
            boxShadow: '0 12px 40px #00000060',
        }}>
            {/* Title + legend */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</div>
                <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {HEAT_COLORS.map(([, c], i) => (
                        <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                    ))}
                    <span style={{ fontSize: 7, color: '#444', marginLeft: 4, fontFamily: 'Orbitron,sans-serif' }}>Low → High</span>
                </div>
            </div>

            {/* Key grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {ROWS.map((row, ri) => (
                    <div key={ri} style={{ display: 'flex', gap: 3, paddingLeft: ri * 8 }}>
                        {row.map(k => (
                            <div key={k} style={{ ...keyStyle(k), position: 'relative' }}>
                                {k.toUpperCase()}
                                {countStyle(k)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Top 5 keys */}
            {Object.keys(heatmap).length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 9, color: '#444', fontFamily: 'Orbitron,sans-serif', textTransform: 'uppercase', marginRight: 4 }}>Top keys:</span>
                    {Object.entries(heatmap)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([k, count]) => (
                            <div key={k} style={{
                                display: 'flex', alignItems: 'center', gap: 3,
                                background: '#1a1a2e', borderRadius: 6, padding: '3px 8px',
                                border: '1px solid #ffffff10',
                            }}>
                                <span style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 11, color: '#fff', fontWeight: 700 }}>{k.toUpperCase()}</span>
                                <span style={{ fontSize: 8, color: '#555' }}>{count}×</span>
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    );
};

export default KeyboardHeatmap;
