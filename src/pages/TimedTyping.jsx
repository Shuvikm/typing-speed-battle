import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from '../components/Confetti';
import AnimatedCountdown from '../components/AnimatedCountdown';
import WpmSparkline from '../components/WpmSparkline';
import VirtualKeyboard from '../components/VirtualKeyboard';
import KeyboardHeatmap from '../components/KeyboardHeatmap';
import NewRecordBanner from '../components/NewRecordBanner';
import useSounds from '../hooks/useSounds';
import { saveBestWpm, getBestWpm, getLeaderboard } from '../utils/gameLogic';

// ─── Passages by difficulty ────────────────────────────────────────────────────
const PASSAGES = {
    easy: [
        "The quick brown fox jumps over the lazy dog. Simple and short!",
        "One Piece is the greatest anime of all time. Luffy will become the Pirate King!",
        "The Straw Hat crew sails the Grand Line searching for the ultimate treasure.",
        "Naruto always believed in hard work and friendship above all else.",
        "Goku loves to eat rice balls after a long day of intense training.",
        "Pikachu is the most famous Pokemon in the entire world.",
        "Totoro lives in the forest and is a friendly spirit of nature.",
    ],
    medium: [
        "In the world of One Piece, Devil Fruits grant incredible powers to those who consume them. The Grand Line is a dangerous sea where only the strongest pirates survive.",
        "The Thousand Sunny replaced the Going Merry and became the new home of Luffy and his crew. Each crew member has unique abilities that make them essential to the team.",
        "Naruto Uzumaki grew up as an outcast in the Hidden Leaf Village, but his determination and the power of the Nine-Tailed Fox within him drove him to become the greatest Hokage.",
        "The Hero Association ranks heroes from C to S class based on power and contribution. Saitama remains unranked despite defeating every enemy with a single punch.",
        "Alchemy is the science of understanding, deconstructing, and reconstructing matter. If one wishes to obtain something, something of equal value must be given.",
    ],
    hard: [
        "The Will of D is a mysterious initial carried by certain individuals throughout history, suggesting a connection to the ancient kingdom and the Void Century. The World Government has hidden the true history for eight hundred years, and only those who reach Laugh Tale can discover the secrets of the world.",
        "Alchemy is the science of understanding, deconstructing, and reconstructing matter. However, it is not an all-powerful art; it is impossible to create something out of nothing. If one wishes to obtain something, something of equal value must be given. This is the Law of Equivalent Exchange, the basis of all alchemy.",
        "The concept of Haki is a mysterious power found in every living organism in the world. It is not that different from the force of will. There are three main types: Kenbunshoku, Busoshoku, and the rare Haoshoku Haki, which only one in several million people can use.",
        "In the shinobi world, chakra is the essential life force in every shinobi. It is formed through two components: physical energy collected from every cell of the body, and spiritual energy cultivated through experience and meditation. A shinobi who balances these two can perform extraordinary jutsu.",
        "The Survey Corps ventures beyond the safety of the walls to observe, study, and ultimately combat the Titans. Every expedition results in significant casualties, yet the soldiers march forth armed with Omni-Directional Mobility Gear, certain that sacrifice today means freedom for future generations.",
    ],
};

const TIME_OPTIONS = [15, 30, 60, 120];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const DIFF_COLORS = { easy: '#00FF41', medium: '#FFD700', hard: '#FF4444' };
const DIFF_LABELS = { easy: '😊 Easy', medium: '⚔️ Medium', hard: '💀 Hard' };

const TimedTyping = () => {
    const navigate = useNavigate();
    const { playTick, playError } = useSounds();
    const [phase, setPhase] = useState('select'); // select | countdown | typing | results
    const [selectedTime, setSelectedTime] = useState(60);
    const [difficulty, setDifficulty] = useState('medium');
    const [timeLeft, setTimeLeft] = useState(60);
    const [passages, setPassages] = useState(() =>
        [...PASSAGES.medium].sort(() => Math.random() - 0.5)
    );
    const [passageIndex, setPassageIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [inputShake, setInputShake] = useState(false);

    // Stats
    const [correctChars, setCorrectChars] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);

    // WPM mini-graph
    const [wpmHistory, setWpmHistory] = useState([]);

    // Ghost bot state
    const [ghostProgress, setGhostProgress] = useState(0);
    const ghostRef = useRef(null);
    const GHOST_WPM = 75; // target ghost speed in WPM

    // Results
    const [finalWpm, setFinalWpm] = useState(0);
    const [finalAccuracy, setFinalAccuracy] = useState(100);
    const [finalCorrect, setFinalCorrect] = useState(0);
    const [finalWrong, setFinalWrong] = useState(0);
    const [isNewPB, setIsNewPB] = useState(false);
    const [prevBest, setPrevBest] = useState(0);
    const [showNewRecordBanner, setShowNewRecordBanner] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [heatmap, setHeatmap] = useState({});

    const inputRef = useRef(null);
    const startTimeRef = useRef(null);
    const statsRef = useRef({ correct: 0, wrong: 0, total: 0, words: 0 });
    const heatmapRef = useRef({});  // keystroke frequency map

    const currentPassage = passages[passageIndex] || passages[0];

    // Update passages when difficulty changes
    useEffect(() => {
        setPassages([...PASSAGES[difficulty]].sort(() => Math.random() - 0.5));
    }, [difficulty]);

    // Timer countdown
    useEffect(() => {
        if (phase !== 'typing') return;
        if (timeLeft <= 0) { endTest(); return; }
        const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, timeLeft]);

    // Live WPM update + history
    useEffect(() => {
        if (phase !== 'typing') return;
        const iv = setInterval(() => {
            const elapsed = (Date.now() - startTimeRef.current) / 60000;
            const w = elapsed > 0 ? Math.round(statsRef.current.words / elapsed) : 0;
            const acc = statsRef.current.total > 0
                ? Math.round((statsRef.current.correct / statsRef.current.total) * 100)
                : 100;
            setWpm(w);
            setAccuracy(acc);
            setWpmHistory(prev => [...prev.slice(-9), w]);
        }, 1000);
        return () => clearInterval(iv);
    }, [phase]);

    // Ghost bot movement — advances at GHOST_WPM chars/sec
    useEffect(() => {
        if (phase !== 'typing') return;
        setGhostProgress(0);
        const charsPerSec = (GHOST_WPM * 5) / 60;
        const totalChars = currentPassage.length || 1;
        const tick = () => {
            setGhostProgress(prev => {
                const jitter = 0.75 + Math.random() * 0.5;
                const next = prev + (charsPerSec * jitter / totalChars) * 100 * 0.4;
                return Math.min(next, 100);
            });
        };
        ghostRef.current = setInterval(tick, 400);
        return () => clearInterval(ghostRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]);

    // Keyboard shortcuts during typing
    useEffect(() => {
        if (phase !== 'typing') return;
        const handler = (e) => {
            if (e.key === 'Escape') navigate('/');
            if (e.key === 'Tab') {
                e.preventDefault();
                restartTest();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]);

    const restartTest = useCallback(() => {
        setPhase('select');
        setUserInput('');
        setPassageIndex(0);
        setWpmHistory([]);
        statsRef.current = { correct: 0, wrong: 0, total: 0, words: 0 };
        heatmapRef.current = {};
    }, []);

    const endTest = useCallback(() => {
        clearInterval(ghostRef.current);
        const elapsed = (Date.now() - startTimeRef.current) / 60000;
        const fWpm = elapsed > 0 ? Math.round(statsRef.current.words / elapsed) : 0;
        const fAcc = statsRef.current.total > 0
            ? Math.round((statsRef.current.correct / statsRef.current.total) * 100)
            : 100;

        const pb = getBestWpm(selectedTime);
        setPrevBest(pb);
        const newPB = saveBestWpm(selectedTime, fWpm);
        setIsNewPB(newPB);
        if (newPB) setShowNewRecordBanner(true);
        setLeaderboard(getLeaderboard(selectedTime));

        setFinalWpm(fWpm);
        setFinalAccuracy(fAcc);
        setFinalCorrect(statsRef.current.correct);
        setFinalWrong(statsRef.current.wrong);
        setHeatmap({ ...heatmapRef.current });
        setPhase('results');
    }, [selectedTime]);

    const handleCountdownDone = () => {
        setPhase('typing');
        startTimeRef.current = Date.now();
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const handleInput = (e) => {
        const val = e.target.value;
        const target = currentPassage;

        let newCorrect = 0;
        let newWrong = 0;
        for (let i = 0; i < val.length; i++) {
            if (i < target.length) {
                if (val[i] === target[i]) newCorrect++;
                else newWrong++;
            }
        }

        // Sound FX & shake on last typed char
        if (val.length > userInput.length) {
            const lastIdx = val.length - 1;
            if (lastIdx < target.length && val[lastIdx] !== target[lastIdx]) {
                setInputShake(true);
                setTimeout(() => setInputShake(false), 400);
                playError();
            } else {
                playTick();
            }
            // Track keystroke heatmap
            const ch = val[val.length - 1].toLowerCase();
            if (/^[a-z]$/.test(ch)) {
                heatmapRef.current[ch] = (heatmapRef.current[ch] || 0) + 1;
            }
        }

        const completedText = val.slice(0, Math.min(val.length, target.length));
        const words = completedText.trim().split(/\s+/).filter(w => w.length > 0 && target.includes(w)).length;

        setUserInput(val);
        setCorrectChars(newCorrect);
        statsRef.current = { correct: newCorrect, wrong: newWrong, total: val.length, words };

        if (val === target) {
            setPassageIndex(prev => (prev + 1) % passages.length);
            setUserInput('');
        }
    };

    const timerPct = (timeLeft / selectedTime) * 100;
    const timerColor = timeLeft > selectedTime * 0.5 ? '#00FF41'
        : timeLeft > selectedTime * 0.25 ? '#FFD700' : '#FF4444';
    const isDanger = timeLeft <= selectedTime * 0.25;

    const grade = finalWpm >= 100 ? 'S' : finalWpm >= 80 ? 'A' : finalWpm >= 60 ? 'B' : finalWpm >= 40 ? 'C' : 'D';
    const gradeColor = grade === 'S' ? '#FFD700' : grade === 'A' ? '#00FF41' : grade === 'B' ? '#00D9FF' : grade === 'C' ? '#B026FF' : '#888';

    const wpmMax = wpmHistory.length > 0 ? Math.max(...wpmHistory, 1) : 1;

    // ─── SELECT PHASE ──────────────────────────────────────────────────────────
    if (phase === 'select') {
        return (
            <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden flex items-center justify-center">
                <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(176,38,255,0.1), transparent 70%)', animation: 'float 7s ease-in-out infinite', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,217,255,0.1), transparent 70%)', animation: 'float 9s ease-in-out infinite reverse', pointerEvents: 'none' }} />

                <div className="relative z-10 w-full max-w-2xl px-6">
                    <div className="text-center mb-10" style={{ animation: 'bounce-in 0.6s ease-out' }}>
                        <div className="text-8xl mb-4" style={{ animation: 'float 2.5s ease-in-out infinite' }}>⏱️</div>
                        <h1 className="text-5xl font-black mb-2" style={{
                            fontFamily: 'Audiowide, sans-serif',
                            background: 'linear-gradient(135deg, #B026FF, #00D9FF)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>TIME TRIAL</h1>
                        <p className="text-gray-400 text-lg">Type as much as you can. Every second counts.</p>
                    </div>

                    <div className="rounded-2xl p-8 mb-6" style={{ background: '#1a1a2e', border: '2px solid #B026FF30', boxShadow: '0 0 40px rgba(176,38,255,0.1)' }}>

                        {/* Difficulty tabs */}
                        <p className="text-center text-xs text-gray-400 uppercase tracking-widest mb-3">Difficulty</p>
                        <div className="grid grid-cols-3 gap-3 mb-7">
                            {DIFFICULTIES.map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className="py-3 rounded-xl font-bold text-sm transition-all duration-200"
                                    style={{
                                        background: difficulty === d
                                            ? `linear-gradient(135deg, ${DIFF_COLORS[d]}30, ${DIFF_COLORS[d]}10)`
                                            : '#0a0a0f',
                                        border: difficulty === d ? `2px solid ${DIFF_COLORS[d]}` : '2px solid #333',
                                        color: difficulty === d ? DIFF_COLORS[d] : '#555',
                                        fontFamily: 'Audiowide, sans-serif',
                                        transform: difficulty === d ? 'scale(1.05)' : 'scale(1)',
                                        boxShadow: difficulty === d ? `0 0 16px ${DIFF_COLORS[d]}40` : 'none',
                                    }}
                                >
                                    {DIFF_LABELS[d]}
                                </button>
                            ))}
                        </div>

                        {/* Duration selector */}
                        <p className="text-center text-xs text-gray-400 uppercase tracking-widest mb-3">Duration</p>
                        <div className="grid grid-cols-4 gap-4 mb-8">
                            {TIME_OPTIONS.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setSelectedTime(t)}
                                    className="py-5 rounded-2xl font-black text-2xl transition-all duration-200"
                                    style={{
                                        background: selectedTime === t ? 'linear-gradient(135deg, #B026FF, #00D9FF)' : '#0a0a0f',
                                        border: selectedTime === t ? '2px solid #B026FF' : '2px solid #333',
                                        color: selectedTime === t ? '#fff' : '#555',
                                        fontFamily: 'Orbitron, sans-serif',
                                        transform: selectedTime === t ? 'scale(1.08)' : 'scale(1)',
                                        boxShadow: selectedTime === t ? '0 0 20px #B026FF50' : 'none',
                                    }}
                                >
                                    {t}s
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => { setTimeLeft(selectedTime); setPassages([...PASSAGES[difficulty]].sort(() => Math.random() - 0.5)); setPhase('countdown'); }}
                            className="w-full py-4 rounded-2xl text-xl font-bold transition-all duration-200"
                            style={{ background: 'linear-gradient(135deg, #B026FF, #00D9FF)', color: '#fff', fontFamily: 'Audiowide, sans-serif', boxShadow: '0 0 30px #B026FF40' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            🚀 Start {selectedTime}s · {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </button>
                    </div>

                    <div className="text-center">
                        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
                            ← Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── COUNTDOWN ─────────────────────────────────────────────────────────────
    if (phase === 'countdown') {
        return <AnimatedCountdown from={3} onDone={handleCountdownDone} />;
    }

    // ─── RESULTS ───────────────────────────────────────────────────────────────
    if (phase === 'results') {
        return (
            <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
                {finalWpm >= 60 && <Confetti count={80} />}

                {/* 🏆 Full-screen New Record Banner overlay */}
                {showNewRecordBanner && (
                    <NewRecordBanner
                        wpm={finalWpm}
                        prevBest={prevBest}
                        onDone={() => setShowNewRecordBanner(false)}
                    />
                )}

                <div className="relative z-10 container mx-auto px-4 py-10">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-8" style={{ animation: 'bounce-in 0.7s ease-out' }}>
                            <div className="text-8xl mb-4">
                                {finalWpm >= 100 ? '👑' : finalWpm >= 80 ? '🔥' : finalWpm >= 60 ? '⭐' : '💪'}
                            </div>
                            <h1 className="text-5xl font-black mb-2" style={{ fontFamily: 'Audiowide, sans-serif', color: '#00D9FF' }}>
                                TIME'S UP!
                            </h1>
                            <div className="text-9xl font-black" style={{ color: gradeColor, fontFamily: 'Audiowide, sans-serif', textShadow: `0 0 40px ${gradeColor}` }}>
                                {grade}
                            </div>
                        </div>

                        {/* Personal Best delta (compact, shown after banner auto-dismisses) */}
                        {isNewPB && !showNewRecordBanner && (
                            <div
                                className="text-center mb-6 rounded-2xl py-4 px-6"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,100,0,0.1))',
                                    border: '2px solid #FFD700',
                                    animation: 'bounce-in 0.5s ease-out',
                                    boxShadow: '0 0 30px #FFD70040',
                                }}
                            >
                                <div className="text-4xl mb-1">🏆</div>
                                <div className="text-xl font-black" style={{ color: '#FFD700', fontFamily: 'Audiowide, sans-serif' }}>
                                    NEW PERSONAL BEST!
                                </div>
                                <div className="text-sm text-gray-400 mt-1">
                                    {prevBest > 0 ? `+${finalWpm - prevBest} WPM · ${prevBest} → ${finalWpm} WPM` : `First record: ${finalWpm} WPM! 🚀`}
                                </div>
                            </div>
                        )}

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'WPM', value: finalWpm, color: '#00D9FF', icon: '⌨️' },
                                { label: 'Accuracy', value: `${finalAccuracy}%`, color: '#00FF41', icon: '🎯' },
                                { label: 'Correct', value: finalCorrect, color: '#00FF41', icon: '✅' },
                                { label: 'Wrong', value: finalWrong, color: '#FF4444', icon: '❌' },
                            ].map((s, i) => (
                                <div key={i} className="rounded-2xl p-5 text-center"
                                    style={{
                                        background: '#1a1a2e', border: `2px solid ${s.color}30`,
                                        boxShadow: `0 0 20px ${s.color}15`,
                                        animation: `bounce-in 0.5s ease-out ${i * 0.12}s both`
                                    }}>
                                    <div className="text-2xl mb-1">{s.icon}</div>
                                    <div className="text-3xl font-black" style={{ color: s.color, fontFamily: 'Orbitron, sans-serif' }}>{s.value}</div>
                                    <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Accuracy bar */}
                        <div className="rounded-2xl p-6 mb-6" style={{ background: '#1a1a2e', border: '1px solid #333' }}>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Accuracy Breakdown</p>
                            <div className="h-6 rounded-full overflow-hidden flex" style={{ background: '#0a0a0f' }}>
                                {finalCorrect + finalWrong > 0 && (
                                    <>
                                        <div style={{ width: `${(finalCorrect / (finalCorrect + finalWrong)) * 100}%`, background: 'linear-gradient(90deg, #00FF41, #00D9FF)', transition: 'width 1s ease-out' }} />
                                        <div style={{ width: `${(finalWrong / (finalCorrect + finalWrong)) * 100}%`, background: 'linear-gradient(90deg, #FF4444, #FF6600)' }} />
                                    </>
                                )}
                            </div>
                            <div className="flex justify-between text-xs mt-2">
                                <span style={{ color: '#00FF41' }}>✅ {finalCorrect} correct</span>
                                <span style={{ color: '#FF4444' }}>❌ {finalWrong} wrong</span>
                            </div>
                        </div>

                        {/* 🏅 Local Leaderboard */}
                        {leaderboard.length > 0 && (
                            <div className="rounded-2xl p-6 mb-6" style={{ background: '#1a1a2e', border: '1px solid #FFD70030' }}>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">
                                    🏅 Your Top Scores — {selectedTime}s
                                </p>
                                <div className="space-y-2">
                                    {leaderboard.map((score, i) => {
                                        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                                        const isCurrentRun = score === finalWpm && isNewPB && i === 0;
                                        return (
                                            <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-2"
                                                style={{
                                                    background: isCurrentRun ? 'rgba(255,215,0,0.1)' : '#0a0a0f',
                                                    border: isCurrentRun ? '1px solid #FFD70060' : '1px solid #222',
                                                }}>
                                                <span className="text-lg">{medals[i]}</span>
                                                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#222' }}>
                                                    <div style={{ width: `${(score / leaderboard[0]) * 100}%`, background: i === 0 ? 'linear-gradient(90deg,#FFD700,#FF6600)' : 'linear-gradient(90deg,#00D9FF80,#B026FF80)', height: '100%', borderRadius: '9999px' }} />
                                                </div>
                                                <span className="font-black text-sm" style={{ color: i === 0 ? '#FFD700' : '#aaa', fontFamily: 'Orbitron, sans-serif', minWidth: '52px', textAlign: 'right' }}>
                                                    {score} <span className="text-xs font-normal">WPM</span>
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Keyboard heatmap */}
                        {Object.keys(heatmap).length > 0 && (
                            <div style={{ animation: 'bounce-in 0.5s ease-out 0.4s both', marginBottom: 24 }}>
                                <KeyboardHeatmap heatmap={heatmap} title="Keystroke Heatmap" />
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex flex-col md:flex-row gap-4 justify-center" style={{ animation: 'bounce-in 0.5s ease-out 0.5s both' }}>
                            <button
                                onClick={restartTest}
                                className="px-10 py-4 rounded-xl font-bold text-lg"
                                style={{ background: 'linear-gradient(135deg, #B026FF, #00D9FF)', color: '#fff', fontFamily: 'Audiowide, sans-serif', boxShadow: '0 0 30px #B026FF30' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                🔄 Play Again
                            </button>
                            <button onClick={() => navigate('/quiz')}
                                className="px-10 py-4 rounded-xl font-bold text-lg"
                                style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,100,0,0.2))', border: '2px solid #FFD700', color: '#FFD700', fontFamily: 'Audiowide, sans-serif' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                🧠 Try Quiz
                            </button>
                            <button onClick={() => navigate('/')}
                                className="px-10 py-4 rounded-xl font-bold text-lg"
                                style={{ background: '#1a1a2e', border: '2px solid #333', color: '#aaa', fontFamily: 'Audiowide, sans-serif' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                🏠 Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── TYPING PHASE ──────────────────────────────────────────────────────────
    const progress = currentPassage.length > 0 ? (userInput.length / currentPassage.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
            <div className="relative z-10 container mx-auto px-4 py-6">

                {/* Top bar: Timer + Stats */}
                <div className="grid grid-cols-5 gap-3 mb-5">
                    {/* Timer */}
                    <div className="col-span-2 rounded-xl p-3 text-center"
                        style={{
                            background: '#1a1a2e',
                            border: `2px solid ${timerColor}60`,
                            boxShadow: isDanger ? `0 0 20px ${timerColor}40` : 'none',
                            animation: isDanger ? 'timer-danger-pulse 0.4s ease-in-out infinite' : 'none',
                        }}>
                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Time Left</div>
                        <div className="text-5xl font-black" style={{ color: timerColor, fontFamily: 'Orbitron, sans-serif', textShadow: isDanger ? `0 0 20px ${timerColor}` : 'none' }}>
                            {timeLeft}s
                        </div>
                        <div className="h-2 rounded-full mt-2 overflow-hidden" style={{ background: '#0a0a0f' }}>
                            <div className="h-full rounded-full transition-all duration-1000"
                                style={{ width: `${timerPct}%`, background: `linear-gradient(90deg, ${timerColor}80, ${timerColor})`, boxShadow: `0 0 8px ${timerColor}` }} />
                        </div>
                    </div>

                    {/* WPM */}
                    <div className="rounded-xl p-3 text-center" style={{ background: '#1a1a2e', border: '1px solid #00D9FF30' }}>
                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">WPM</div>
                        <div className="text-3xl font-black" style={{ color: '#00D9FF', fontFamily: 'Orbitron, sans-serif' }}>{wpm}</div>
                    </div>

                    {/* Accuracy */}
                    <div className="rounded-xl p-3 text-center" style={{ background: '#1a1a2e', border: '1px solid #00FF4130' }}>
                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Accuracy</div>
                        <div className="text-3xl font-black" style={{ color: '#00FF41', fontFamily: 'Orbitron, sans-serif' }}>{accuracy}%</div>
                    </div>

                    {/* Correct chars */}
                    <div className="rounded-xl p-3 text-center" style={{ background: '#1a1a2e', border: '1px solid #FFD70030' }}>
                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Chars</div>
                        <div className="text-3xl font-black" style={{ color: '#FFD700', fontFamily: 'Orbitron, sans-serif' }}>{correctChars}</div>
                    </div>
                </div>

                {/* WPM sparkline */}
                {wpmHistory.length > 0 && (
                    <div className="rounded-xl p-3 mb-4" style={{ background: '#1a1a2e', border: '1px solid #B026FF20' }}>
                        <div className="text-xs text-gray-600 uppercase tracking-widest mb-1" style={{ fontSize: 9 }}>WPM Trend</div>
                        <WpmSparkline history={wpmHistory} color="#B026FF" height={56} />
                    </div>
                )}

                {/* Passage progress */}
                <div className="mb-3 flex items-center gap-3">
                    <span className="text-xs text-gray-500 uppercase tracking-widest">
                        Passage {passageIndex + 1}/{passages.length} · <span style={{ color: DIFF_COLORS[difficulty] }}>{difficulty}</span>
                    </span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#0a0a0f' }}>
                        <div className="h-full rounded-full transition-all duration-200"
                            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #B026FF, #00D9FF)', boxShadow: '0 0 8px #B026FF' }} />
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
                </div>

                {/* Ghost Bot Race */}
                <div className="rounded-xl mb-3 p-3" style={{ background: '#1a1a2e', border: '1px solid #B026FF20' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: '#555', fontFamily: 'Orbitron,sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>You</span>
                        <span style={{ fontSize: 10, color: '#B026FF88', fontFamily: 'Orbitron,sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🤖 Ghost ({GHOST_WPM} WPM)</span>
                    </div>
                    {/* User bar */}
                    <div style={{ position: 'relative', height: 8, borderRadius: 9999, background: '#0a0a0f', marginBottom: 4, overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, width: `${progress}%`, background: 'linear-gradient(90deg, #00D9FF, #B026FF)', borderRadius: 9999, boxShadow: '0 0 8px #00D9FF', transition: 'width 0.3s ease' }} />
                    </div>
                    {/* Ghost bar */}
                    <div style={{ position: 'relative', height: 6, borderRadius: 9999, background: '#0a0a0f', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, width: `${ghostProgress}%`, background: 'linear-gradient(90deg, #B026FF60, #FF4444a0)', borderRadius: 9999, boxShadow: '0 0 6px #B026FF', transition: 'width 0.5s ease' }} />
                    </div>
                </div>

                {/* Text display */}
                <div className="rounded-2xl p-6 mb-4" style={{ background: '#1a1a2e', border: '1px solid #B026FF30', minHeight: '140px', boxShadow: '0 0 20px rgba(176,38,255,0.05)' }}>
                    <div className="text-xl md:text-2xl font-mono leading-relaxed select-none">
                        {currentPassage.split('').map((char, idx) => {
                            let color = '#444';
                            let bg = 'transparent';
                            if (idx < userInput.length) {
                                if (userInput[idx] === char) { color = '#00FF41'; }
                                else { color = '#ff4444'; bg = 'rgba(255,68,68,0.2)'; }
                            }
                            const isCursor = idx === userInput.length;
                            return (
                                <span key={idx} className={isCursor ? 'typing-cursor-char' : ''} style={{ color, background: bg }}>
                                    {char === ' ' ? '\u00A0' : char}
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* Input */}
                <div className="rounded-xl mb-3" style={{ background: '#1a1a2e', border: `2px solid ${inputShake ? '#FF4444' : '#B026FF40'}` }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={handleInput}
                        className="w-full px-5 py-4 bg-transparent text-white text-xl focus:outline-none rounded-xl"
                        style={{ fontFamily: 'Rajdhani, monospace', animation: inputShake ? 'shake 0.4s ease-out' : 'none' }}
                        placeholder="Start typing the passage above..."
                        autoFocus
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                    />
                </div>

                {/* Interactive Virtual Keyboard */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                    <VirtualKeyboard
                        nextChar={currentPassage[userInput.length] || ''}
                        lastError={inputShake}
                        compact
                    />
                </div>

                {/* Hints */}
                <div className="text-center text-xs text-gray-600">
                    <span className="mr-4">⌨️ Tab → restart</span>
                    <span className="mr-4">Esc → home</span>
                    <span>{selectedTime}s · {difficulty} · {PASSAGES[difficulty].length} passages</span>
                </div>
            </div>
        </div>
    );
};

export default TimedTyping;
