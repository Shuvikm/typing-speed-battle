import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBestWpm, getLeaderboard } from '../utils/gameLogic';
import WpmSparkline from '../components/WpmSparkline';

const DURATIONS = [15, 30, 60, 120];
const DURATION_LABELS = { 15: '15s Sprint', 30: '30s Run', 60: '1 Min', 120: '2 Min' };
const DURATION_COLORS = { 15: '#FF4444', 30: '#FFD700', 60: '#00D9FF', 120: '#B026FF' };

const WORDS_KEY = 'tsb_words_best';
const getWordsBest = () => {
    try { return parseInt(localStorage.getItem(WORDS_KEY) || '0', 10); } catch { return 0; }
};

const Stats = () => {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(60);
    const [leaderboards, setLeaderboards] = useState({});
    const [bests, setBests] = useState({});
    const [wordsBest] = useState(getWordsBest);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const lb = {};
        const best = {};
        DURATIONS.forEach(d => {
            lb[d] = getLeaderboard(d);
            best[d] = getBestWpm(d);
        });
        setLeaderboards(lb);
        setBests(best);
        setTimeout(() => setMounted(true), 100);
    }, []);

    const currentLb = leaderboards[selected] || [];
    const currentBest = bests[selected] || 0;
    const grade = currentBest >= 100 ? 'S' : currentBest >= 80 ? 'A' : currentBest >= 60 ? 'B' : currentBest >= 40 ? 'C' : currentBest > 0 ? 'D' : '—';
    const gradeColor = grade === 'S' ? '#FFD700' : grade === 'A' ? '#00FF41' : grade === 'B' ? '#00D9FF' : grade === 'C' ? '#B026FF' : grade === 'D' ? '#888' : '#333';

    const totalGames = DURATIONS.reduce((acc, d) => acc + (leaderboards[d]?.length || 0), 0);
    const overallBest = Math.max(0, ...DURATIONS.map(d => bests[d] || 0));
    const overallBestColor = DURATION_COLORS[DURATIONS.find(d => bests[d] === overallBest)] || '#00D9FF';

    return (
        <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
            {/* BG orbs */}
            <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,217,255,0.06), transparent 70%)', animation: 'float 7s ease-in-out infinite', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(176,38,255,0.06), transparent 70%)', animation: 'float 9s ease-in-out infinite reverse', pointerEvents: 'none' }} />

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">

                {/* Header */}
                <div className="text-center mb-8" style={{ animation: 'bounce-in 0.6s ease-out' }}>
                    <div className="text-6xl mb-3" style={{ animation: 'float 2.5s ease-in-out infinite' }}>📊</div>
                    <h1 className="text-4xl md:text-5xl font-black mb-2" style={{
                        fontFamily: 'Audiowide, sans-serif',
                        background: 'linear-gradient(135deg, #00D9FF, #B026FF)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>STATS DASHBOARD</h1>
                    <p className="text-gray-400">Your personal typing performance history</p>
                </div>

                {/* Overview cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'All-Time Best', value: overallBest > 0 ? `${overallBest} WPM` : '—', color: overallBestColor, icon: '👑' },
                        { label: 'Word Mode Best', value: wordsBest > 0 ? `${wordsBest} WPM` : '—', color: '#00FF41', icon: '💬' },
                        { label: 'Total Runs', value: totalGames, color: '#FFD700', icon: '🎮' },
                        { label: 'Modes Tried', value: DURATIONS.filter(d => (bests[d] || 0) > 0).length, color: '#B026FF', icon: '⚡' },
                    ].map((s, i) => (
                        <div key={i} className="rounded-2xl p-5 text-center" style={{
                            background: '#1a1a2e', border: `2px solid ${s.color}30`,
                            boxShadow: `0 0 20px ${s.color}15`,
                            animation: mounted ? `bounce-in 0.5s ease-out ${i * 0.1}s both` : 'none',
                            opacity: mounted ? 1 : 0,
                        }}>
                            <div className="text-3xl mb-2">{s.icon}</div>
                            <div className="text-2xl font-black" style={{ color: s.color, fontFamily: 'Orbitron, sans-serif' }}>{s.value}</div>
                            <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{s.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                    {/* Left: Duration selector + grade */}
                    <div className="space-y-4">
                        <div className="rounded-2xl p-5" style={{ background: '#1a1a2e', border: '1px solid #333' }}>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Select Duration</p>
                            <div className="grid grid-cols-2 gap-2">
                                {DURATIONS.map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setSelected(d)}
                                        className="py-3 rounded-xl font-bold text-sm transition-all duration-200"
                                        style={{
                                            background: selected === d
                                                ? `linear-gradient(135deg, ${DURATION_COLORS[d]}30, ${DURATION_COLORS[d]}10)`
                                                : '#0a0a0f',
                                            border: selected === d ? `2px solid ${DURATION_COLORS[d]}` : '2px solid #222',
                                            color: selected === d ? DURATION_COLORS[d] : '#555',
                                            fontFamily: 'Audiowide, sans-serif',
                                            transform: selected === d ? 'scale(1.05)' : 'scale(1)',
                                            boxShadow: selected === d ? `0 0 12px ${DURATION_COLORS[d]}40` : 'none',
                                        }}
                                    >
                                        {DURATION_LABELS[d]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Grade card */}
                        <div className="rounded-2xl p-5 text-center" style={{ background: '#1a1a2e', border: `2px solid ${gradeColor}30`, boxShadow: `0 0 20px ${gradeColor}10` }}>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">{DURATION_LABELS[selected]} Grade</p>
                            <div className="text-7xl font-black mb-1" style={{ color: gradeColor, fontFamily: 'Audiowide, sans-serif', textShadow: currentBest > 0 ? `0 0 30px ${gradeColor}` : 'none' }}>
                                {grade}
                            </div>
                            <div className="text-2xl font-black" style={{ color: DURATION_COLORS[selected], fontFamily: 'Orbitron, sans-serif' }}>
                                {currentBest > 0 ? `${currentBest} WPM` : 'No data yet'}
                            </div>
                            {currentBest === 0 && (
                                <button
                                    onClick={() => navigate('/timed')}
                                    className="mt-4 px-5 py-2 rounded-xl text-sm font-bold"
                                    style={{ background: `${DURATION_COLORS[selected]}20`, border: `1px solid ${DURATION_COLORS[selected]}60`, color: DURATION_COLORS[selected], fontFamily: 'Audiowide, sans-serif' }}
                                >
                                    Play {DURATION_LABELS[selected]} →
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Middle: Leaderboard */}
                    <div className="rounded-2xl p-5" style={{ background: '#1a1a2e', border: `1px solid ${DURATION_COLORS[selected]}20` }}>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">
                            🏅 {DURATION_LABELS[selected]} — Personal Best Runs
                        </p>
                        {currentLb.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-600">
                                <div className="text-5xl mb-3">🌊</div>
                                <p className="text-sm">No runs yet!</p>
                                <button
                                    onClick={() => navigate('/timed')}
                                    className="mt-4 px-5 py-2 rounded-xl text-sm font-bold"
                                    style={{ background: 'linear-gradient(135deg,#B026FF,#00D9FF)', color: '#fff', fontFamily: 'Audiowide, sans-serif' }}
                                >
                                    Start Now →
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {currentLb.map((score, i) => {
                                    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
                                    const pct = (score / currentLb[0]) * 100;
                                    const isTop = i === 0;
                                    return (
                                        <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-2"
                                            style={{ background: isTop ? `${DURATION_COLORS[selected]}15` : '#0a0a0f', border: isTop ? `1px solid ${DURATION_COLORS[selected]}40` : '1px solid #1a1a2e' }}>
                                            <span className="text-lg">{medals[i] || `${i + 1}.`}</span>
                                            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#222' }}>
                                                <div style={{ width: `${pct}%`, background: isTop ? `linear-gradient(90deg, ${DURATION_COLORS[selected]}, ${DURATION_COLORS[selected]}80)` : 'linear-gradient(90deg,#444,#333)', height: '100%', borderRadius: 9999, transition: 'width 0.8s ease' }} />
                                            </div>
                                            <span className="font-black text-sm" style={{ color: isTop ? DURATION_COLORS[selected] : '#aaa', fontFamily: 'Orbitron, sans-serif', minWidth: 60, textAlign: 'right' }}>
                                                {score} <span className="text-xs font-normal">WPM</span>
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right: WPM sparkline + cross-mode comparison */}
                    <div className="space-y-4">
                        {/* Sparkline of history for selected */}
                        <div className="rounded-2xl p-5" style={{ background: '#1a1a2e', border: '1px solid #333' }}>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">WPM Trend ({DURATION_LABELS[selected]})</p>
                            {currentLb.length > 0 ? (
                                <>
                                    <WpmSparkline
                                        history={[...currentLb].reverse()}
                                        color={DURATION_COLORS[selected]}
                                        height={80}
                                    />
                                    <p className="text-xs text-gray-600 mt-2 text-center">← oldest runs · newest →</p>
                                </>
                            ) : (
                                <div className="text-center text-gray-600 py-6 text-sm">No data yet</div>
                            )}
                        </div>

                        {/* Cross-mode summary */}
                        <div className="rounded-2xl p-5" style={{ background: '#1a1a2e', border: '1px solid #333' }}>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">All Modes Best</p>
                            <div className="space-y-2">
                                {DURATIONS.map(d => {
                                    const b = bests[d] || 0;
                                    const pct = overallBest > 0 ? (b / overallBest) * 100 : 0;
                                    return (
                                        <div key={d} className="flex items-center gap-2">
                                            <span className="text-xs w-14" style={{ color: DURATION_COLORS[d], fontFamily: 'Audiowide, sans-serif' }}>{DURATION_LABELS[d]}</span>
                                            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#0a0a0f' }}>
                                                <div style={{ width: `${pct}%`, background: `linear-gradient(90deg,${DURATION_COLORS[d]},${DURATION_COLORS[d]}80)`, height: '100%', borderRadius: 9999, transition: 'width 1s ease' }} />
                                            </div>
                                            <span className="text-xs font-bold" style={{ color: b > 0 ? DURATION_COLORS[d] : '#333', fontFamily: 'Orbitron, sans-serif', minWidth: 42, textAlign: 'right' }}>
                                                {b > 0 ? `${b}` : '—'}
                                            </span>
                                        </div>
                                    );
                                })}
                                {/* Word mode */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs w-14" style={{ color: '#00FF41', fontFamily: 'Audiowide, sans-serif' }}>Words</span>
                                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#0a0a0f' }}>
                                        <div style={{ width: `${overallBest > 0 ? (wordsBest / overallBest) * 100 : 0}%`, background: 'linear-gradient(90deg,#00FF41,#00FF4180)', height: '100%', borderRadius: 9999, transition: 'width 1s ease' }} />
                                    </div>
                                    <span className="text-xs font-bold" style={{ color: wordsBest > 0 ? '#00FF41' : '#333', fontFamily: 'Orbitron, sans-serif', minWidth: 42, textAlign: 'right' }}>
                                        {wordsBest > 0 ? `${wordsBest}` : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col md:flex-row gap-4 justify-center mt-8" style={{ animation: mounted ? 'bounce-in 0.5s ease-out 0.6s both' : 'none' }}>
                    <button onClick={() => navigate('/timed')} className="px-10 py-4 rounded-xl font-bold text-lg"
                        style={{ background: 'linear-gradient(135deg, #B026FF, #00D9FF)', color: '#fff', fontFamily: 'Audiowide, sans-serif', boxShadow: '0 0 30px #B026FF30' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                        ⏱️ Time Trial
                    </button>
                    <button onClick={() => navigate('/words')} className="px-10 py-4 rounded-xl font-bold text-lg"
                        style={{ background: 'linear-gradient(135deg, rgba(0,255,65,0.3), rgba(0,217,255,0.3))', border: '2px solid #00FF41', color: '#00FF41', fontFamily: 'Audiowide, sans-serif' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                        💬 Word Challenge
                    </button>
                    <button onClick={() => navigate('/')} className="px-10 py-4 rounded-xl font-bold text-lg"
                        style={{ background: '#1a1a2e', border: '2px solid #333', color: '#aaa', fontFamily: 'Audiowide, sans-serif' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                        🏠 Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Stats;
