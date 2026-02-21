import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSocket } from '../utils/socket';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import AnimatedCountdown from '../components/AnimatedCountdown';
import FloatingScore from '../components/FloatingScore';
import StreakBadge from '../components/StreakBadge';
import Confetti from '../components/Confetti';

// ─── Question bank ───────────────────────────────────────────────
const ALL_QUESTIONS = [
  { id: 1, category: 'One Piece', question: 'Who is the captain of the Straw Hat Pirates?', options: ['Zoro', 'Luffy', 'Sanji', 'Nami'], correct: 1, typingText: "Luffy is the captain of the Straw Hat Pirates and dreams of becoming the Pirate King!" },
  { id: 2, category: 'One Piece', question: "What is Zoro's dream?", options: ["Pirate King", "Find All Blue", "World's Greatest Swordsman", "Map the World"], correct: 2, typingText: "Zoro aims to become the world's greatest swordsman and never lose a fight again!" },
  { id: 3, category: 'One Piece', question: "What was the name of Luffy's first ship?", options: ["Thousand Sunny", "Red Force", "Moby Dick", "Going Merry"], correct: 3, typingText: "The Going Merry was the beloved first ship that carried the Straw Hat crew on their adventures!" },
  { id: 4, category: 'One Piece', question: "What Devil Fruit did Luffy eat?", options: ["Flame Fruit", "Gum-Gum Fruit", "Ice Fruit", "Dark Fruit"], correct: 1, typingText: "Luffy ate the Gum-Gum Fruit which gives him the power to stretch his body like rubber!" },
  { id: 5, category: 'One Piece', question: "How many crew members are in the Straw Hat Pirates?", options: ["7", "9", "11", "13"], correct: 2, typingText: "The Straw Hat Pirates currently have 11 crew members including Luffy Zoro Nami Sanji and others!" },
  { id: 6, category: 'One Piece', question: "What is Sanji's dream?", options: ["Become Pirate King", "Find All Blue", "Become a swordsman", "Protect Nami"], correct: 1, typingText: "Sanji dreams of finding All Blue, a legendary sea where fish from all four oceans gather!" },
  { id: 7, category: 'Anime', question: "Which studio produces Attack on Titan?", options: ["Ufotable", "Madhouse", "MAPPA", "Bones"], correct: 2, typingText: "MAPPA is the studio that produces Attack on Titan Season 4 with stunning animation quality!" },
  { id: 8, category: 'Anime', question: "What power does Naruto use most?", options: ["Sharingan", "Shadow Clone Jutsu", "Rasengan", "Chidori"], correct: 1, typingText: "Naruto's Shadow Clone Jutsu is one of his signature moves that uses multiple clones in battle!" },
  { id: 9, category: 'Anime', question: "In Dragon Ball Z, what is Goku's home planet?", options: ["Earth", "Namek", "Planet Vegeta", "Planet Frieza"], correct: 2, typingText: "Goku was born on Planet Vegeta as a Saiyan warrior and sent to Earth as a baby!" },
  { id: 10, category: 'Anime', question: "What is the name of the main character in Demon Slayer?", options: ["Zenitsu", "Inosuke", "Tanjiro", "Giyu"], correct: 2, typingText: "Tanjiro Kamado is the main character of Demon Slayer who fights demons to save his sister Nezuko!" },
  { id: 11, category: 'Typing', question: "What is the average typing speed in WPM?", options: ["20-30", "40-60", "80-100", "120+"], correct: 1, typingText: "The average person types at 40 to 60 words per minute while professional typists can reach 100 WPM!" },
  { id: 12, category: 'Typing', question: "Which finger should hit the spacebar?", options: ["Index", "Pinky", "Thumb", "Ring"], correct: 2, typingText: "The thumb is responsible for pressing the spacebar in proper touch typing technique!" },
  { id: 13, category: 'Typing', question: "What keyboard layout is QWERTY named after?", options: ["Inventor", "Top row keys", "Company name", "Country"], correct: 1, typingText: "QWERTY is named after the first six letters in the top row of the keyboard layout!" },
  { id: 14, category: 'One Piece', question: "What color is Luffy's iconic hat?", options: ["Black", "Blue", "Red", "Yellow"], correct: 2, typingText: "Luffy's iconic straw hat is red and it was given to him by his idol Shanks!" },
  { id: 15, category: 'Anime', question: "How many Dragon Balls are needed to summon Shenron?", options: ["5", "6", "7", "8"], correct: 2, typingText: "Seven Dragon Balls must be gathered together to summon the dragon Shenron and make a wish!" },
];

const CATEGORIES = ['All', 'One Piece', 'Anime', 'Typing'];

const Quiz = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [phase, setPhase] = useState('lobby'); // lobby | countdown | question | typing | finished
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('luffy');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerState, setAnswerState] = useState(null); // null | 'correct' | 'wrong'
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [typingText, setTypingText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [startTime, setStartTime] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [floatingScores, setFloatingScores] = useState([]);
  const [inputShake, setInputShake] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const typingRef = useRef(null);

  useEffect(() => {
    const newSocket = createSocket();
    setSocket(newSocket);
    newSocket.on('quiz-joined', (data) => setParticipants(data.participants || []));
    newSocket.on('quiz-result', (data) => setParticipants(data.leaderboard || []));
    return () => newSocket.disconnect();
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'question') return;
    const iv = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(iv);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentQ]);

  // Live WPM/acc in typing phase
  useEffect(() => {
    if (phase !== 'typing' || !startTime) return;
    const iv = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const correct = userInput.split('').filter((c, i) => c === typingText[i]).length;
      setWpm(Math.round((correct / 5) / (elapsed / 60)));
      setAccuracy(typingText.length > 0 ? Math.round((correct / typingText.length) * 100) : 100);
    }, 150);
    return () => clearInterval(iv);
  }, [phase, startTime, userInput, typingText]);

  const handleTimeUp = () => {
    setAnswerState('wrong');
    setStreak(0);
    setCorrectStreak(0);
    setTimeout(() => moveToTyping(), 1000);
  };

  const startQuiz = () => {
    if (!playerName.trim()) return;
    const filtered = selectedCategory === 'All'
      ? ALL_QUESTIONS
      : ALL_QUESTIONS.filter(q => q.category === selectedCategory);
    // Shuffle & take 8
    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 8);
    setQuestions(shuffled);
    if (socket) {
      socket.emit('join-quiz', { quizId: 'default', playerName, avatar: selectedAvatar });
    }
    setPhase('countdown');
  };

  const handleCountdownDone = () => {
    setPhase('question');
    setTimeLeft(20);
  };

  const handleAnswerSelect = (index) => {
    if (answerState !== null) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || answerState !== null) return;
    const q = questions[currentQ];
    const correct = selectedAnswer === q.correct;
    setAnswerState(correct ? 'correct' : 'wrong');

    if (correct) {
      const pts = 100 + streak * 10;
      setScore(prev => prev + pts);
      setStreak(prev => prev + 1);
      setCorrectStreak(prev => prev + 1);
      // Show floating score
      const id = Date.now();
      setFloatingScores(prev => [...prev, { id, text: `+${pts}`, color: '#00FF41' }]);
    } else {
      setStreak(0);
      setCorrectStreak(0);
    }

    setTimeout(() => moveToTyping(), 1200);
  };

  const moveToTyping = () => {
    const q = questions[currentQ];
    setTypingText(q.typingText);
    setUserInput('');
    setStartTime(Date.now());
    setPhase('typing');
    setTimeout(() => typingRef.current?.focus(), 100);
  };

  const handleTypingInput = (e) => {
    const value = e.target.value;
    setUserInput(value);

    // Check last char for shake
    if (value.length > 0) {
      const last = value.length - 1;
      if (value[last] !== typingText[last]) {
        setInputShake(true);
        setTimeout(() => setInputShake(false), 400);
      }
    }

    if (value === typingText) {
      moveToNextQuestion();
    }
  };

  const moveToNextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswerState(null);
      setUserInput('');
      setWpm(0);
      setAccuracy(100);
      setStartTime(null);
      setTimeLeft(20);
      setPhase('question');
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setPhase('finished');
    if (socket) {
      socket.emit('quiz-complete', { quizId: 'default', score, wpm, accuracy });
    }
  };

  const removeFloatingScore = (id) => {
    setFloatingScores(prev => prev.filter(s => s.id !== id));
  };

  // ─── LOBBY ───────────────────────────────────────────────────────
  if (phase === 'lobby') {
    return (
      <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['⚔️', '🌟', '🏴‍☠️', '⭐', '🧠', '⚡'].map((e, i) => (
            <div key={i} className="absolute text-5xl animate-float"
              style={{ left: `${10 + i * 15}%`, top: `${10 + i * 12}%`, animationDelay: `${i * 0.7}s`, opacity: 0.15 }}>
              {e}
            </div>
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8" style={{ animation: 'bounce-in 0.6s ease-out' }}>
              <div className="text-7xl mb-4 animate-bounce">🧠</div>
              <h1 className="text-5xl font-bold mb-3"
                style={{ fontFamily: 'Audiowide,sans-serif', background: 'linear-gradient(135deg,#00D9FF,#FFD700,#B026FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                QUIZ BATTLE
              </h1>
              <p className="text-gray-400">Answer fast. Type faster. Win BIG.</p>
            </div>

            {/* Form card */}
            <div className="rounded-2xl p-8 space-y-6" style={{ background: '#1a1a2e', border: '2px solid #FFD70040', boxShadow: '0 0 40px #FFD70015' }}>
              {/* Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 uppercase tracking-widest">Your Name</label>
                <input
                  type="text" value={playerName} onChange={e => setPlayerName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && startQuiz()}
                  placeholder="Enter your name..."
                  className="w-full px-4 py-3 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  style={{ background: '#0a0a0f', border: '2px solid #00D9FF40' }}
                />
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-sm text-gray-400 mb-3 uppercase tracking-widest">Choose Avatar</label>
                <div className="grid grid-cols-5 gap-3">
                  {['luffy', 'zoro', 'nami', 'sanji', 'chopper'].map(name => (
                    <Avatar key={name} name={name} selected={selectedAvatar === name} onClick={() => setSelectedAvatar(name)} size="md" />
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-gray-400 mb-3 uppercase tracking-widest">Topic</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)}
                      className="py-2 px-3 rounded-xl text-sm font-bold transition-all duration-200"
                      style={{
                        background: selectedCategory === cat ? 'linear-gradient(135deg,#00D9FF,#B026FF)' : '#0a0a0f',
                        border: selectedCategory === cat ? '2px solid #00D9FF' : '2px solid #333',
                        color: selectedCategory === cat ? '#fff' : '#666',
                        transform: selectedCategory === cat ? 'scale(1.05)' : 'scale(1)',
                      }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={startQuiz} disabled={!playerName.trim()}
                className="w-full py-4 rounded-xl text-xl font-bold transition-all duration-200"
                style={{
                  background: playerName.trim() ? 'linear-gradient(135deg,#FFD700,#FF6600)' : '#333',
                  color: playerName.trim() ? '#000' : '#666',
                  fontFamily: 'Audiowide, sans-serif',
                  boxShadow: playerName.trim() ? '0 0 30px #FFD70040' : 'none',
                  cursor: playerName.trim() ? 'pointer' : 'not-allowed',
                  transform: playerName.trim() ? 'scale(1)' : 'scale(0.98)',
                }}>
                🚀 Start Quiz Battle!
              </button>
            </div>

            <div className="text-center mt-6">
              <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── COUNTDOWN ──────────────────────────────────────────────────
  if (phase === 'countdown') {
    return <AnimatedCountdown from={3} onDone={handleCountdownDone} />;
  }

  // ─── FINISHED ───────────────────────────────────────────────────
  if (phase === 'finished') {
    const grade = score >= 700 ? 'S' : score >= 500 ? 'A' : score >= 300 ? 'B' : 'C';
    const gradeColor = grade === 'S' ? '#FFD700' : grade === 'A' ? '#00FF41' : grade === 'B' ? '#00D9FF' : '#B026FF';
    return (
      <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
        <Confetti count={90} />
        <div className="relative z-10 container mx-auto px-4 py-10">
          <div className="max-w-3xl mx-auto">
            {/* Banner */}
            <div className="text-center mb-8" style={{ animation: 'bounce-in 0.7s ease-out' }}>
              <div className="text-8xl mb-4">🏆</div>
              <h1 className="text-6xl font-bold" style={{ fontFamily: 'Audiowide,sans-serif', color: '#FFD700', textShadow: '0 0 30px #FFD700' }}>
                QUIZ COMPLETE!
              </h1>
              <div className="text-8xl font-black mt-2" style={{ color: gradeColor, fontFamily: 'Audiowide,sans-serif', textShadow: `0 0 40px ${gradeColor}` }}>
                {grade}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Score', value: score, color: '#FFD700' },
                { label: 'WPM', value: wpm, color: '#00D9FF' },
                { label: 'Accuracy', value: `${accuracy}%`, color: '#00FF41' },
              ].map((s, i) => (
                <div key={i} className="text-center rounded-2xl py-6"
                  style={{
                    background: '#1a1a2e', border: `2px solid ${s.color}40`, boxShadow: `0 0 20px ${s.color}20`,
                    animation: `bounce-in 0.5s ease-out ${i * 0.15}s both`
                  }}>
                  <div className="text-4xl font-black" style={{ color: s.color, fontFamily: 'Orbitron,sans-serif' }}>{s.value}</div>
                  <div className="text-sm text-gray-500 uppercase tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Leaderboard */}
            {participants.length > 0 && (
              <div className="rounded-2xl p-6 mb-8" style={{ background: '#1a1a2e', border: '1px solid #FFD70030' }}>
                <h3 className="text-xl font-bold mb-4 text-pirate-yellow" style={{ fontFamily: 'Audiowide,sans-serif' }}>🏆 Leaderboard</h3>
                <div className="space-y-2">
                  {participants.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: idx === 0 ? 'rgba(255,215,0,0.15)' : '#0a0a0f', border: `1px solid ${idx === 0 ? '#FFD70040' : '#333'}` }}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                        <Avatar name={p.avatar} size="sm" />
                        <span className="font-bold">{p.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-neon-blue">{p.score || 0} pts</div>
                        <div className="text-xs text-gray-500">{p.wpm || 0} WPM</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button onClick={() => window.location.reload()}
                className="px-8 py-4 rounded-xl font-bold text-lg"
                style={{ background: 'linear-gradient(135deg,#FFD700,#FF6600)', color: '#000', fontFamily: 'Audiowide,sans-serif' }}>
                🔄 Play Again
              </button>
              <button onClick={() => navigate('/')}
                className="px-8 py-4 rounded-xl font-bold text-lg"
                style={{ background: '#1a1a2e', border: '2px solid #333', color: '#aaa', fontFamily: 'Audiowide,sans-serif' }}>
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQ] || {};
  const timerPct = (timeLeft / 20) * 100;
  const timerColor = timeLeft > 10 ? '#00FF41' : timeLeft > 5 ? '#FFD700' : '#FF4444';

  // ─── TYPING PHASE ───────────────────────────────────────────────
  if (phase === 'typing') {
    const correctChars = userInput.split('').filter((c, i) => c === typingText[i]).length;
    const typingProgress = typingText.length > 0 ? (userInput.length / typingText.length) * 100 : 0;
    return (
      <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 rounded-xl p-4" style={{ background: '#1a1a2e', border: '1px solid #333' }}>
            <div className="text-sm text-gray-400" style={{ fontFamily: 'Orbitron,sans-serif' }}>
              Q {currentQ + 1} / {questions.length}
            </div>
            <h2 className="text-lg font-bold text-neon-blue" style={{ fontFamily: 'Audiowide,sans-serif' }}>⚡ Typing Challenge</h2>
            <div className="text-lg font-bold" style={{ color: '#FFD700', fontFamily: 'Orbitron,sans-serif' }}>
              {score} pts
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'WPM', value: wpm, color: '#00D9FF' },
              { label: 'Accuracy', value: `${accuracy}%`, color: '#00FF41' },
              { label: 'Streak', value: `${streak}🔥`, color: '#FF6600' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-3 text-center" style={{ background: '#1a1a2e', border: `1px solid ${s.color}30` }}>
                <div className="text-2xl font-bold" style={{ color: s.color, fontFamily: 'Orbitron,sans-serif' }}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Streak badge */}
          {correctStreak >= 3 && (
            <div className="flex justify-center mb-4">
              <StreakBadge streak={correctStreak} combo={Math.floor(correctStreak / 3)} />
            </div>
          )}

          {/* Typing progress bar */}
          <div className="h-2 rounded-full mb-5 overflow-hidden" style={{ background: '#0a0a0f' }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${typingProgress}%`, background: `linear-gradient(90deg, #00D9FF, #00FF41)`, boxShadow: '0 0 10px #00D9FF' }} />
          </div>

          {/* Floating scores */}
          <div className="relative">
            {floatingScores.map(s => (
              <FloatingScore key={s.id} text={s.text} color={s.color} onDone={() => removeFloatingScore(s.id)} />
            ))}
          </div>

          {/* Text */}
          <div className="rounded-2xl p-6 mb-5" style={{ background: '#1a1a2e', border: '1px solid #00D9FF30', minHeight: '180px' }}>
            <div className="text-xl md:text-2xl font-mono leading-relaxed">
              {typingText.split('').map((char, idx) => {
                let color = '#444';
                if (idx < userInput.length) color = userInput[idx] === char ? '#00FF41' : '#ff4444';
                return (
                  <span key={idx} style={{ color, background: idx < userInput.length && userInput[idx] !== char ? 'rgba(255,68,68,0.2)' : 'transparent', borderBottom: idx === userInput.length ? '2px solid #00D9FF' : 'none' }}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                );
              })}
            </div>
            <input
              ref={typingRef}
              type="text" value={userInput} onChange={handleTypingInput} autoFocus
              className="w-full mt-4 px-4 py-3 bg-transparent text-white text-lg focus:outline-none rounded-xl"
              style={{
                border: inputShake ? '2px solid #FF4444' : '2px solid #00D9FF40',
                animation: inputShake ? 'shake 0.4s ease-out' : 'none',
                background: '#0a0a0f',
              }}
              placeholder="Type the text above..." />
          </div>

          <div className="text-center text-sm text-gray-600">
            {typingText.length - userInput.length} characters remaining
          </div>
        </div>
      </div>
    );
  }

  // ─── QUESTION PHASE ─────────────────────────────────────────────
  const optionLabels = ['A', 'B', 'C', 'D'];
  return (
    <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-4 rounded-2xl p-4"
          style={{ background: '#1a1a2e', border: '1px solid #333' }}>
          <div className="flex items-center gap-3">
            <Avatar name={selectedAvatar} size="sm" />
            <span className="font-bold text-sm">{playerName}</span>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Question</div>
            <div className="font-bold" style={{ fontFamily: 'Orbitron,sans-serif', color: '#00D9FF' }}>
              {currentQ + 1} / {questions.length}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
            <div className="font-bold" style={{ fontFamily: 'Orbitron,sans-serif', color: '#FFD700' }}>{score}</div>
          </div>
        </div>

        {/* Timer bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Time remaining</span>
            <span className="font-bold" style={{ color: timerColor, fontFamily: 'Orbitron,sans-serif', animation: timeLeft <= 5 ? 'pulse-neon 0.5s infinite' : '' }}>
              {timeLeft}s
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: '#0a0a0f' }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${timerPct}%`, background: `linear-gradient(90deg, ${timerColor}80, ${timerColor})`, boxShadow: `0 0 8px ${timerColor}` }} />
          </div>
        </div>

        {/* Category badge */}
        <div className="flex justify-center mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(0,217,255,0.15)', border: '1px solid #00D9FF40', color: '#00D9FF' }}>
            {question.category || 'Quiz'}
          </span>
        </div>

        {/* Floating scores */}
        <div className="relative h-0">
          {floatingScores.map(s => (
            <FloatingScore key={s.id} text={s.text} color={s.color} onDone={() => removeFloatingScore(s.id)} />
          ))}
        </div>

        {/* Streak badge */}
        {streak >= 3 && (
          <div className="flex justify-center mb-4">
            <StreakBadge streak={streak} combo={Math.floor(streak / 3) + 1} />
          </div>
        )}

        {/* Question */}
        <div className="rounded-2xl p-6 mb-6 text-center"
          style={{ background: '#1a1a2e', border: '2px solid #00D9FF30', boxShadow: '0 0 30px rgba(0,217,255,0.05)', animation: 'pop-in 0.4s ease-out' }}>
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed" style={{ fontFamily: 'Audiowide,sans-serif' }}>
            {question.question}
          </h2>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {(question.options || []).map((opt, idx) => {
            let bg = 'linear-gradient(135deg, #1a1a2e, #0a0a0f)';
            let border = '#333';
            let shadow = 'none';
            let extraAnim = '';

            if (answerState !== null) {
              if (idx === question.correct) {
                bg = 'linear-gradient(135deg, rgba(0,255,65,0.3), rgba(0,255,65,0.1))';
                border = '#00FF41';
                shadow = '0 0 20px #00FF4140';
                extraAnim = 'answer-correct 0.6s ease-out';
              } else if (idx === selectedAnswer && answerState === 'wrong') {
                bg = 'linear-gradient(135deg, rgba(255,68,68,0.3), rgba(255,68,68,0.1))';
                border = '#FF4444';
                shadow = '0 0 20px #FF444440';
                extraAnim = 'shake 0.5s ease-out';
              }
            } else if (selectedAnswer === idx) {
              bg = 'linear-gradient(135deg, rgba(0,217,255,0.2), rgba(176,38,255,0.2))';
              border = '#00D9FF';
              shadow = '0 0 20px #00D9FF40';
            }

            return (
              <button key={idx} onClick={() => handleAnswerSelect(idx)}
                className="p-5 rounded-2xl text-left transition-all duration-200"
                style={{
                  background: bg, border: `2px solid ${border}`, boxShadow: shadow, animation: extraAnim,
                  transform: selectedAnswer === idx && answerState === null ? 'scale(1.02)' : 'scale(1)',
                  cursor: answerState !== null ? 'default' : 'pointer'
                }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-lg"
                    style={{ background: selectedAnswer === idx ? '#00D9FF' : '#333', color: selectedAnswer === idx ? '#000' : '#666', fontFamily: 'Orbitron,sans-serif' }}>
                    {optionLabels[idx]}
                  </div>
                  <span className="text-lg font-bold text-white">{opt}</span>
                  {answerState !== null && idx === question.correct && (
                    <span className="ml-auto text-2xl">✅</span>
                  )}
                  {answerState === 'wrong' && idx === selectedAnswer && idx !== question.correct && (
                    <span className="ml-auto text-2xl">❌</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit */}
        {answerState === null && (
          <div className="flex justify-center">
            <button onClick={handleSubmitAnswer} disabled={selectedAnswer === null}
              className="px-12 py-4 rounded-2xl font-bold text-xl transition-all duration-200"
              style={{
                background: selectedAnswer !== null ? 'linear-gradient(135deg,#FFD700,#FF6600)' : '#333',
                color: selectedAnswer !== null ? '#000' : '#666',
                fontFamily: 'Audiowide,sans-serif',
                boxShadow: selectedAnswer !== null ? '0 0 30px #FFD70040' : 'none',
                transform: selectedAnswer !== null ? 'scale(1.03)' : 'scale(1)',
                cursor: selectedAnswer !== null ? 'pointer' : 'not-allowed',
              }}>
              ✅ Submit Answer
            </button>
          </div>
        )}

        {/* Answer feedback */}
        {answerState !== null && (
          <div className="text-center mt-4" style={{ animation: 'bounce-in 0.4s ease-out' }}>
            <div className="text-4xl font-black" style={{
              color: answerState === 'correct' ? '#00FF41' : '#FF4444',
              fontFamily: 'Audiowide,sans-serif',
              textShadow: `0 0 20px ${answerState === 'correct' ? '#00FF41' : '#FF4444'}`,
            }}>
              {answerState === 'correct' ? '🎉 CORRECT! +' + (100 + streak * 10) + ' pts' : '❌ WRONG!'}
            </div>
            <div className="text-gray-400 mt-1 text-sm">Moving to typing challenge...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
