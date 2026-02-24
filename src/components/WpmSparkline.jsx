import React, { useRef, useEffect } from 'react';

/**
 * SVG line-chart sparkline for live WPM history.
 * Props:
 *   history: number[]   — ordered WPM samples (oldest first)
 *   max:     number     — maximum y value (defaults to Math.max(...history, 1))
 *   color:   string     — stroke colour (defaults to '#00D9FF')
 *   height:  number     — SVG height in px (defaults to 56)
 */
const WpmSparkline = ({
    history = [],
    max: maxProp,
    color = '#00D9FF',
    height = 56,
}) => {
    const pathRef = useRef(null);

    const padded = [...Array(Math.max(10 - history.length, 0)).fill(0), ...history].slice(-10);
    const max = maxProp ?? Math.max(...padded, 1);
    const W = 300;
    const H = height;
    const PAD = 6;

    const pts = padded.map((v, i) => {
        const x = PAD + (i / (padded.length - 1)) * (W - PAD * 2);
        const y = H - PAD - (v / max) * (H - PAD * 2);
        return [x, y];
    });

    const polyline = pts.map(([x, y]) => `${x},${y}`).join(' ');
    const areaPath =
        `M${pts[0][0]},${H - PAD} ` +
        pts.map(([x, y]) => `L${x},${y}`).join(' ') +
        ` L${pts[pts.length - 1][0]},${H - PAD} Z`;

    // Animate path draw on mount / history change
    useEffect(() => {
        const el = pathRef.current;
        if (!el) return;
        const length = el.getTotalLength ? el.getTotalLength() : 500;
        el.style.strokeDasharray = length;
        el.style.strokeDashoffset = length;
        el.getBoundingClientRect(); // force reflow
        el.style.transition = 'stroke-dashoffset 0.8s ease';
        el.style.strokeDashoffset = 0;
    }, [history.length]);

    const latest = pts[pts.length - 1];

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                style={{ width: '100%', height, display: 'block' }}
            >
                {/* Area fill */}
                <defs>
                    <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                    </linearGradient>
                    <filter id="glow-spark">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <path d={areaPath} fill="url(#spark-grad)" />

                {/* Line */}
                <polyline
                    ref={pathRef}
                    points={polyline}
                    fill="none"
                    stroke={color}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    filter="url(#glow-spark)"
                />

                {/* Latest dot */}
                {latest && (
                    <>
                        <circle cx={latest[0]} cy={latest[1]} r="5" fill={color} filter="url(#glow-spark)" />
                        <circle cx={latest[0]} cy={latest[1]} r="9" fill="none" stroke={color} strokeWidth="1.5" opacity="0.4">
                            <animate attributeName="r" values="5;12;5" dur="1.6s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.5;0;0.5" dur="1.6s" repeatCount="indefinite" />
                        </circle>
                    </>
                )}
            </svg>

            {/* Y-axis labels */}
            <div style={{
                position: 'absolute', top: 0, right: 0,
                height: '100%', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', pointerEvents: 'none',
                paddingBlock: PAD,
            }}>
                <span style={{ fontSize: 9, color: '#444', fontFamily: 'Orbitron, sans-serif' }}>{max}</span>
                <span style={{ fontSize: 9, color: '#444', fontFamily: 'Orbitron, sans-serif' }}>0</span>
            </div>
        </div>
    );
};

export default WpmSparkline;
