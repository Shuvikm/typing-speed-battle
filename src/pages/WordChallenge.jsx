import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedCountdown from '../components/AnimatedCountdown';
import StreakBadge from '../components/StreakBadge';
import Confetti from '../components/Confetti';
import useSounds from '../hooks/useSounds';

// ─── Word Pool ─────────────────────────────────────────────────────────────────
const WORDS = [
    // Common short words
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he',
    'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out',
    'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
    // Anime themed
    'luffy', 'zoro', 'nami', 'sanji', 'chopper', 'robin', 'franky', 'brook', 'usopp',
    'naruto', 'sasuke', 'sakura', 'kakashi', 'itachi', 'gaara', 'tsunade', 'orochimaru',
    'goku', 'vegeta', 'gohan', 'piccolo', 'frieza', 'trunks', 'bulma', 'krillin',
    'ichigo', 'rukia', 'orihime', 'chad', 'uryu', 'byakuya', 'toshiro', 'rangiku',
    'saitama', 'genos', 'garou', 'silver', 'tatsumaki', 'king', 'bang', 'tornado',
    'deku', 'bakugo', 'todoroki', 'iida', 'uraraka', 'all-might', 'endeavor',
    'eren', 'mikasa', 'armin', 'levi', 'hange', 'erwin', 'reiner', 'annie',
    'pirate', 'sword', 'devil', 'fruit', 'haki', 'grand', 'line', 'navy',
    'jutsu', 'chakra', 'sharingan', 'rinnegan', 'byakugan', 'rasengan', 'chidori',
    'titan', 'wall', 'survey', 'corps', 'omni', 'gear', 'thunder', 'lightning',
    // Action words
    'battle', 'fight', 'power', 'speed', 'combo', 'streak', 'blaze', 'fury',
    'strike', 'dash', 'slash', 'blast', 'surge', 'burst', 'smash', 'rush',
    'swift', 'quick', 'rapid', 'flash', 'turbo', 'hyper', 'ultra', 'mega', 'super',
    // Skill words
    'accuracy', 'precision', 'rhythm', 'flow', 'focus', 'stamina', 'agility',
    'master', 'legend', 'champion', 'victor', 'conquer', 'achieve', 'dominate',
];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const SAVE_KEY = 'tsb_words_best';

const getBest = () => {
    try { return parseInt(localStorage.getItem(SAVE_KEY) || '0', 10); } catch { return 0; }
};
const saveBest = (wpm) => {
    try {
        const prev = getBest();
        if (wpm > prev) { localStorage.setItem(SAVE_KEY, String(wpm)); return true; }
        return false;
    } catch { return false; }
};

// ─── Component ─────────────────────────────────────────────────────────────────
const WordChallenge = () => {
    const navigate = useNavigate();
    const { playTick, playError, playCombo } = useSounds();

    const [phase, setPhase] = useState('intro'); // intro | countdown | typing | results
    const [words, setWords] = useState(() => shuffle(WORDS));
    const [wordIndex, setWordIndex] = useState(0);
    const [input, setInput] = useState('');
    const [correct, setCorrect] = useState(0);
    const [wrong, setWrong] = useState(0);
    const [streak, setStreak] = useState(0);
    const [combo, setCombo] = useState(0);
    const [flashCorrect, setFlashCorrect] = useState(false);
    const [flashWrong, setFlashWrong] = useState(false);
    const [wpm, setWpm] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isNewBest, setIsNewBest] = useState(false);
    const [prevBest] = useState(getBest);

    const startTimeRef = useRef(null);
    const correctRef = useRef(0);
    const inputRef = useRef(null);
    const currentWord = words[wordIndex % words.length];

    // Timer
    useEffect(() => {
        if (phase !== 'typing') return;
        if (timeLeft <= 0) { endGame(); return; }
        const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, timeLeft]);

    // Live WPM
    useEffect(() => {
        if (phase !== 'typing') return;
        const iv = setInterval(() => {
            if (!startTimeRef.current) return;
            const mins = (Date.now() - startTimeRef.current) / 60000;
            setWpm(mins > 0 ? Math.round(correctRef.current / mins) : 0);
        }, 500);
        return () => clearInterval(iv);
    }, [phase]);

    const endGame = useCallback(() => {
        const mins = (Date.now() - startTimeRef.current) / 60000;
        const finalWpm = mins > 0 ? Math.round(correctRef.current / mins) : 0;
        setWpm(finalWpm);
        const nb = saveBest(finalWpm);
        setIsNewBest(nb);
        setPhase('results');
    }, []);

    const handleCountdownDone = () => {
        setPhase('typing');
        startTimeRef.current = Date.now();
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const handleKeyDown = (e) => {
        if (phase !== 'typing') return;
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            submitWord();
        }
    };

    const submitWord = () => {
        const typed = input.trim();
        if (!typed) return;

        if (typed.toLowerCase() === currentWord.toLowerCase()) {
            // Correct
            const newCorrect = correct + 1;
            const newStreak = streak + 1;
            const newCombo = Math.floor(newStreak / 5);
            setCorrect(newCorrect);
            correctRef.current = newCorrect;
            setStreak(newStreak);
            setCombo(newCombo);
            setFlashCorrect(true);
            setTimeout(() => setFlashCorrect(false), 350);
            playTick();
            if (newStreak % 5 === 0 && newStreak > 0) playCombo(newCombo);
        } else {
            // Wrong
            setWrong(w => w + 1);
            setStreak(0);
            setCombo(0);
            setFlashWrong(true);
            setTimeout(() => setFlashWrong(false), 400);
            playError();
        }
        setInput('');
        setWordIndex(i => i + 1);
    };

    const restart = () => {
        setPhase('intro');
        setWords(shuffle(WORDS));
        setWordIndex(0);
        setInput('');
        setCorrect(0);
        setWrong(0);
        setStreak(0);
        setCombo(0);
        setWpm(0);
        setTimeLeft(60);
        correctRef.current = 0;
    };

    const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 100;
    const timerColor = timeLeft > 45 ? '#00FF41' : timeLeft > 15 ? '#FFD700' : '#FF4444';
    const isDanger = timeLeft <= 15;

    // Previous 5 words for context
    const prevWords = words.slice(Math.max(0, wordIndex - 4), wordIndex);
    const nextWords = words.slice(wordIndex + 1, wordIndex + 5);

    // ─── INTRO ───────────────────────────────────────────────────────────────────
    if (phase === 'intro') {
        return (
            <div className="min-h-screen bg-dark-bg bg-grid-pattern flex items-center justify-center relative overflow-hidden">
                <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,65,0.1), transparent 70%)', animation: 'float 6s ease-in-out infinite', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,217,255,0.1), transparent 70%)', animation: 'float 8s ease-in-out infinite reverse', pointerEvents: 'none' }} />

                <div className="relative z-10 w-full max-w-lg px-6 text-center">
                    <div style={{ animation: 'bounce-in 0.6s ease-out' }}>
                        <div className="text-8xl mb-4" style={{ animation: 'float 2s ease-in-out infinite' }}>💬</div>
                        <h1 className="text-5xl font-black mb-2" style={{
                            fontFamily: 'Audiowide, sans-serif',
                            background: 'linear-gradient(135deg, #00FF41, #00D9FF)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>WORD CHALLENGE</h1>
                        <p className="text-gray-400 text-lg mb-8">Type each word and press <kbd style={{ background: '#1a1a2e', border: '1px solid #00FF41', borderRadius: 4, padding: '2px 8px', color: '#00FF41', fontFamily: 'Orbitron, sans-serif', fontSize: 12 }}>Space</kbd> to confirm. 60 seconds.</p>

                        <div className="rounded-2xl p-6 mb-6" style={{ background: '#1a1a2e', border: '2px solid #00FF4130', boxShadow: '0 0 30px rgba(0,255,65,0.08)' }}>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                {[
                                    { icon: '✅', label: 'Correct word', desc: '+1 word, streak up' },
                                    { icon: '❌', label: 'Wrong word', desc: 'Streak resets' },
                                    { icon: '🔥', label: '5 in a row', desc: 'Combo bonus!' },
                                ].map((r, i) => (
                                    <div key={i} className="rounded-xl p-3" style={{ background: '#0a0a0f' }}>
                                        <div className="text-3xl mb-1">{r.icon}</div>
                                        <div className="text-xs font-bold text-white mb-1">{r.label}</div>
                                        <div className="text-xs text-gray-500">{r.desc}</div>
                                    </div>
                                ))}
                            </div>
                            {prevBest > 0 && (
                                <div className="mt-4 text-sm text-gray-500">
                                    Your best: <span style={{ color: '#FFD700', fontFamily: 'Orbitron, sans-serif', fontWeight: 700 }}>{prevBest} WPM</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setPhase('countdown')}
                            className="w-full py-4 rounded-2xl text-xl font-bold"
                            style={{ background: 'linear-gradient(135deg, #00FF41, #00D9FF)', color: '#000', fontFamily: 'Audiowide, sans-serif', boxShadow: '0 0 30px #00FF4140' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            🚀 Start Challenge
                        </button>
                        <button onClick={() => navigate('/')} className="mt-4 text-gray-500 hover:text-gray-300 transition-colors text-sm">
                            ← Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── COUNTDOWN ───────────────────────────────────────────────────────────────
    if (phase === 'countdown') {
        return <AnimatedCountdown from={3} onDone={handleCountdownDone} />;
    }

    // ─── RESULTS ─────────────────────────────────────────────────────────────────
    if (phase === 'results') {
        const grade = wpm >= 80 ? 'S' : wpm >= 60 ? 'A' : wpm >= 40 ? 'B' : wpm >= 20 ? 'C' : 'D';
        const gradeColor = grade === 'S' ? '#FFD700' : grade === 'A' ? '#00FF41' : grade === 'B' ? '#00D9FF' : grade === 'C' ? '#B026FF' : '#888';
        return (
            <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
                {wpm >= 40 && <Confetti count={60} />}
                <div className="relative z-10 container mx-auto px-4 py-10 max-w-2xl">
                    <div className="text-center mb-8" style={{ animation: 'bounce-in 0.7s ease-out' }}>
                        <div className="text-8xl mb-3">{wpm >= 80 ? '👑' : wpm >= 60 ? '🔥' : wpm >= 40 ? '⭐' : '💪'}</div>
                        <h1 className="text-5xl font-black mb-2" style={{ fontFamily: 'Audiowide, sans-serif', color: '#00D9FF' }}>TIME'S UP!</h1>
                        <div className="text-9xl font-black" style={{ color: gradeColor, fontFamily: 'Audiowide, sans-serif', textShadow: `0 0 40px ${gradeColor}` }}>{grade}</div>
                    </div>

                    {isNewBest && (
                        <div className="text-center mb-6 rounded-2xl py-4 px-6" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,100,0,0.1))', border: '2px solid #FFD700', animation: 'bounce-in 0.5s ease-out', boxShadow: '0 0 30px #FFD70040' }}>
                            <div className="text-4xl mb-1">🏆</div>
                            <div className="text-xl font-black" style={{ color: '#FFD700', fontFamily: 'Audiowide, sans-serif' }}>NEW PERSONAL BEST!</div>
                            <div className="text-sm text-gray-400 mt-1">
                                {prevBest > 0 ? `Prev: ${prevBest} WPM → Now: ${wpm} WPM` : `First record: ${wpm} WPM!`}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'WPM', value: wpm, color: '#00D9FF', icon: '⌨️' },
                            { label: 'Accuracy', value: `${accuracy}%`, color: '#00FF41', icon: '🎯' },
                            { label: 'Correct', value: correct, color: '#00FF41', icon: '✅' },
                            { label: 'Wrong', value: wrong, color: '#FF4444', icon: '❌' },
                        ].map((s, i) => (
                            <div key={i} className="rounded-2xl p-5 text-center" style={{ background: '#1a1a2e', border: `2px solid ${s.color}30`, animation: `bounce-in 0.5s ease-out ${i * 0.1}s both` }}>
                                <div className="text-2xl mb-1">{s.icon}</div>
                                <div className="text-3xl font-black" style={{ color: s.color, fontFamily: 'Orbitron, sans-serif' }}>{s.value}</div>
                                <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 justify-center" style={{ animation: 'bounce-in 0.5s ease-out 0.4s both' }}>
                        <button onClick={restart} className="px-10 py-4 rounded-xl font-bold text-lg" style={{ background: 'linear-gradient(135deg, #00FF41, #00D9FF)', color: '#000', fontFamily: 'Audiowide, sans-serif' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                            🔄 Play Again
                        </button>
                        <button onClick={() => navigate('/timed')} className="px-10 py-4 rounded-xl font-bold text-lg" style={{ background: 'linear-gradient(135deg,rgba(176,38,255,0.3),rgba(0,217,255,0.3))', border: '2px solid #B026FF', color: '#fff', fontFamily: 'Audiowide, sans-serif' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                            ⏱️ Time Trial
                        </button>
                        <button onClick={() => navigate('/')} className="px-10 py-4 rounded-xl font-bold text-lg" style={{ background: '#1a1a2e', border: '2px solid #333', color: '#aaa', fontFamily: 'Audiowide, sans-serif' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                            🏠 Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── TYPING ──────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
            <div className="relative z-10 container mx-auto px-4 py-6 max-w-3xl">

                {/* Stats bar */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                    {/* Timer */}
                    <div className="rounded-xl p-3 text-center" style={{
                        background: '#1a1a2e', border: `2px solid ${timerColor}60`,
                        animation: isDanger ? 'timer-danger-pulse 0.4s ease-in-out infinite' : 'none',
                    }}>
                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Time</div>
                        <div className="text-3xl font-black" style={{ color: timerColor, fontFamily: 'Orbitron, sans-serif', textShadow: isDanger ? `0 0 15px ${timerColor}` : 'none' }}>{timeLeft}s</div>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: '#1a1a2e', border: '1px solid #00D9FF30' }}>
                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">WPM</div>
                        <div className="text-3xl font-black" style={{ color: '#00D9FF', fontFamily: 'Orbitron, sans-serif' }}>{wpm}</div>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: '#1a1a2e', border: '1px solid #00FF4130' }}>
                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Correct</div>
                        <div className="text-3xl font-black" style={{ color: '#00FF41', fontFamily: 'Orbitron, sans-serif' }}>{correct}</div>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: '#1a1a2e', border: '1px solid #FF444430' }}>
                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Wrong</div>
                        <div className="text-3xl font-black" style={{ color: '#FF4444', fontFamily: 'Orbitron, sans-serif' }}>{wrong}</div>
                    </div>
                </div>

                {/* Streak badge */}
                {streak >= 5 && (
                    <div className="flex justify-center mb-4">
                        <StreakBadge streak={streak} combo={combo} />
                    </div>
                )}

                {/* Word display */}
                <div
                    className="rounded-2xl p-8 mb-5 text-center"
                    style={{
                        background: flashCorrect
                            ? 'linear-gradient(135deg, rgba(0,255,65,0.25), rgba(0,217,255,0.15))'
                            : flashWrong
                                ? 'rgba(255,68,68,0.18)'
                                : '#1a1a2e',
                        border: flashCorrect ? '2px solid #00FF41' : flashWrong ? '2px solid #FF4444' : '2px solid #00D9FF20',
                        boxShadow: flashCorrect ? '0 0 30px #00FF4140' : flashWrong ? '0 0 30px #FF444440' : '0 0 20px rgba(0,217,255,0.05)',
                        transition: 'all 0.15s ease',
                        minHeight: 180,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* Context: previous words (faded) */}
                    <div className="flex gap-3 mb-4 flex-wrap justify-center">
                        {prevWords.map((w, i) => (
                            <span key={i} style={{ color: '#333', fontSize: 18, fontFamily: 'Rajdhani, monospace', textDecoration: 'line-through' }}>{w}</span>
                        ))}
                    </div>

                    {/* Current word */}
                    <div
                        className="font-black"
                        style={{
                            fontSize: 52,
                            fontFamily: 'Audiowide, sans-serif',
                            color: flashCorrect ? '#00FF41' : flashWrong ? '#FF4444' : '#fff',
                            textShadow: flashCorrect ? '0 0 30px #00FF41' : flashWrong ? '0 0 30px #FF4444' : '0 0 20px rgba(255,255,255,0.1)',
                            animation: flashWrong ? 'shake 0.4s ease-out' : flashCorrect ? 'pop-in 0.3s ease-out' : 'none',
                            letterSpacing: '0.05em',
                            transition: 'color 0.15s',
                        }}
                    >
                        {currentWord}
                    </div>

                    {/* Next words (faded) */}
                    <div className="flex gap-3 mt-4 flex-wrap justify-center">
                        {nextWords.map((w, i) => (
                            <span key={i} style={{ color: '#2a2a3e', fontSize: 16, fontFamily: 'Rajdhani, monospace' }}>{w}</span>
                        ))}
                    </div>
                </div>

                {/* Input */}
                <div className="rounded-xl mb-3" style={{ background: '#1a1a2e', border: `2px solid ${flashWrong ? '#FF4444' : '#00D9FF40'}` }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full px-5 py-4 bg-transparent text-white text-2xl focus:outline-none rounded-xl text-center"
                        style={{ fontFamily: 'Rajdhani, monospace', animation: flashWrong ? 'shake 0.4s ease-out' : 'none' }}
                        placeholder="Type the word → Space to confirm"
                        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
                    />
                </div>

                <div className="text-center text-xs text-gray-600">
                    <span className="mr-4">⌨️ Space / Enter → submit word</span>
                    <span>Esc → home</span>
                </div>
            </div>
        </div>
    );
};

export default WordChallenge;
