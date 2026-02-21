import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createSocket, socketEvents } from '../utils/socket';
import { calculateWPM, calculateAccuracy, checkChar, calculateCombo } from '../utils/gameLogic';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Avatar from '../components/Avatar';
import AnimatedCountdown from '../components/AnimatedCountdown';
import StreakBadge from '../components/StreakBadge';
import RaceTrack from '../components/RaceTrack';
import Confetti from '../components/Confetti';

const SOLO_TEXT = "The quick brown fox jumps over the lazy dog. One Piece is the greatest anime of all time. Luffy will become the Pirate King! The Straw Hat crew sails the Grand Line together. Zoro aims to become the world's greatest swordsman. Nami navigates the treacherous seas with skill.";

const Game = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const mode = searchParams.get('mode') || 'solo';
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [opponents, setOpponents] = useState([]);
  const [finished, setFinished] = useState(false);
  const [inputShake, setInputShake] = useState(false);

  const inputRef = useRef(null);
  const timeElapsedRef = useRef(0);
  const correctCharsRef = useRef(0);

  // Keep refs updated for use inside closures
  useEffect(() => { timeElapsedRef.current = timeElapsed; }, [timeElapsed]);
  useEffect(() => { correctCharsRef.current = correctChars; }, [correctChars]);

  const handleCountdownDone = useCallback(() => {
    setShowCountdown(false);
    setGameStarted(true);
    if (mode === 'solo') {
      setText(SOLO_TEXT);
      inputRef.current?.focus();
    }
  }, [mode]);

  useEffect(() => {
    const newSocket = createSocket();
    setSocket(newSocket);

    newSocket.on(socketEvents.GAME_TEXT, (data) => {
      setText(data.text);
      inputRef.current?.focus();
    });

    newSocket.on(socketEvents.PLAYER_PROGRESS, (data) => {
      setOpponents(data.players.filter(p => p.id !== newSocket.id));
    });

    newSocket.on(socketEvents.PLAYER_FINISHED, (data) => {
      if (data.playerId !== newSocket.id) {
        setOpponents(prev => prev.map(p =>
          p.id === data.playerId ? { ...p, finished: true, wpm: data.wpm, accuracy: data.accuracy } : p
        ));
      }
    });

    newSocket.on(socketEvents.GAME_END, () => {
      const finalWpm = calculateWPM(correctCharsRef.current, timeElapsedRef.current || 1);
      const finalAccuracy = calculateAccuracy(correctCharsRef.current, totalChars || 1);
      navigate(`/results?roomId=${roomId}&wpm=${finalWpm}&accuracy=${finalAccuracy}&mode=${mode}`);
    });

    if (mode === 'battle') {
      // Request game text after countdown
    }

    return () => newSocket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, mode]);

  // After countdown done in battle mode, request text
  useEffect(() => {
    if (!showCountdown && mode === 'battle' && socket) {
      socket.emit('request-game-text', { roomId });
    }
  }, [showCountdown, mode, socket, roomId]);

  useEffect(() => {
    if (gameStarted && startTime) {
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setTimeElapsed(elapsed);
        setWpm(calculateWPM(correctChars, elapsed));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [gameStarted, startTime, correctChars]);

  useEffect(() => {
    if (gameStarted && !startTime && text) {
      setStartTime(Date.now());
    }
  }, [gameStarted, startTime, text]);

  const handleInputChange = (e) => {
    if (!gameStarted || finished) return;
    const value = e.target.value;
    setUserInput(value);
    setTotalChars(value.length);

    let newCorrect = 0;
    let newStreak = 0;
    let broken = false;
    let lastWasWrong = false;

    for (let i = 0; i < value.length; i++) {
      if (checkChar(text[i], value[i])) {
        newCorrect++;
        if (!broken) newStreak++;
      } else {
        broken = true;
        newStreak = 0;
        if (i === value.length - 1) lastWasWrong = true;
      }
    }

    setCorrectChars(newCorrect);
    setCorrectStreak(newStreak);
    setCombo(calculateCombo(newStreak));
    setAccuracy(calculateAccuracy(newCorrect, value.length));

    // Shake on wrong character
    if (lastWasWrong) {
      setInputShake(true);
      setTimeout(() => setInputShake(false), 400);
    }

    if (value === text) {
      setFinished(true);
      const finalWpm = calculateWPM(newCorrect, timeElapsed);
      const finalAccuracy = calculateAccuracy(newCorrect, value.length);

      if (socket && mode === 'battle') {
        socket.emit('player-finished', { roomId, wpm: finalWpm, accuracy: finalAccuracy });
      }

      setTimeout(() => {
        navigate(`/results?roomId=${roomId}&wpm=${finalWpm}&accuracy=${finalAccuracy}&mode=${mode}`);
      }, 1500);
    }

    if (socket && mode === 'battle' && text.length > 0) {
      const progress = (value.length / text.length) * 100;
      socket.emit('player-progress', {
        roomId,
        progress,
        wpm: calculateWPM(newCorrect, timeElapsed || 1),
      });
    }
  };

  const getCharClass = (index) => {
    if (index >= userInput.length) return 'text-gray-600';
    if (userInput[index] === text[index]) return 'text-hacker-green';
    return 'text-red-500 bg-red-500/20';
  };

  const progress = text.length > 0 ? (userInput.length / text.length) * 100 : 0;
  const progressColor = progress < 30 ? '#00D9FF' : progress < 70 ? '#FFD700' : '#00FF41';

  // Countdown overlay
  if (showCountdown) {
    return <AnimatedCountdown from={3} onDone={handleCountdownDone} />;
  }

  // Build race track players array (includes self)
  const selfPlayer = {
    id: 'self',
    name: 'You',
    avatar: 'luffy',
    progress,
    wpm,
    isYou: true,
  };
  const racePlayers = [selfPlayer, ...opponents.map(o => ({ ...o, progress: o.progress || 0 }))];

  return (
    <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 via-blue-900/20 to-dark-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,217,255,0.08),transparent_60%)]" />

      {finished && <Confetti count={80} />}

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'WPM', value: wpm, color: '#00D9FF' },
            { label: 'Accuracy', value: `${accuracy}%`, color: '#00FF41' },
            { label: 'Combo', value: `${combo}x`, color: '#FFD700' },
            { label: 'Time', value: `${Math.floor(timeElapsed)}s`, color: '#B026FF' },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-xl p-3 text-center"
              style={{
                background: '#1a1a2e',
                border: `1px solid ${stat.color}30`,
                boxShadow: `0 0 10px ${stat.color}15`,
              }}
            >
              <div className="text-2xl font-bold" style={{ color: stat.color, fontFamily: 'Orbitron, sans-serif' }}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Streak badge */}
        {correctStreak >= 3 && (
          <div className="flex justify-center mb-4">
            <StreakBadge streak={correctStreak} combo={combo} />
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-5">
          {/* Main Typing Area */}
          <div className="md:col-span-2 space-y-4">
            {/* Progress bar */}
            <div
              className="rounded-xl p-4"
              style={{ background: '#1a1a2e', border: '1px solid #ffffff10' }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Progress</span>
                <span className="text-xs font-bold" style={{ color: progressColor, fontFamily: 'Orbitron, sans-serif' }}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: '#0a0a0f' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${progressColor}80, ${progressColor})`,
                    boxShadow: `0 0 10px ${progressColor}`,
                  }}
                />
              </div>
            </div>

            {/* Text display */}
            <div
              className="rounded-xl p-6 min-h-[240px]"
              style={{
                background: '#1a1a2e',
                border: '1px solid #00D9FF30',
                boxShadow: '0 0 20px rgba(0,217,255,0.05)',
              }}
            >
              <div className="text-xl md:text-2xl font-mono leading-relaxed select-none">
                {text.split('').map((char, index) => (
                  <span
                    key={index}
                    className={getCharClass(index)}
                    style={{
                      borderBottom: index === userInput.length ? '2px solid #00D9FF' : 'none',
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="rounded-xl" style={{ background: '#1a1a2e', border: '1px solid #333' }}>
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                disabled={!gameStarted || finished}
                className="w-full px-5 py-4 bg-transparent text-white text-xl focus:outline-none rounded-xl"
                style={{
                  fontFamily: 'Rajdhani, monospace',
                  animation: inputShake ? 'shake 0.4s ease-out' : 'none',
                  border: inputShake ? '2px solid #FF4444' : '2px solid transparent',
                  transition: 'border-color 0.2s',
                }}
                placeholder={gameStarted ? 'Start typing...' : 'Waiting...'}
                autoFocus
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Race track */}
            {mode === 'battle' && <RaceTrack players={racePlayers} />}
            {mode === 'solo' && (
              <RaceTrack players={[selfPlayer]} />
            )}

            {/* Opponents (battle mode) */}
            {mode === 'battle' && opponents.length > 0 && (
              <div
                className="rounded-xl p-4"
                style={{ background: '#1a1a2e', border: '1px solid #FFD70030' }}
              >
                <h3 className="font-bold mb-3 text-pirate-yellow flex items-center gap-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  ⚔️ Opponents
                </h3>
                <div className="space-y-3">
                  {opponents.map((opponent) => (
                    <div key={opponent.id} className="p-3 rounded-lg" style={{ background: '#0a0a0f' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar name={opponent.avatar} size="sm" />
                        <span className="font-bold text-sm">{opponent.name}</span>
                        {opponent.finished && (
                          <span className="text-xs text-pirate-yellow ml-auto">✓ Done</span>
                        )}
                      </div>
                      <ProgressBar
                        progress={opponent.progress || 0}
                        color="neon-purple"
                        showLabel={false}
                      />
                      {opponent.wpm > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {opponent.wpm} WPM
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Finished overlay */}
        {finished && (
          <div className="mt-6 text-center" style={{ animation: 'bounce-in 0.6s ease-out' }}>
            <div
              className="inline-block rounded-2xl px-10 py-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,68,68,0.2))',
                border: '2px solid #FFD700',
                boxShadow: '0 0 40px #FFD70040',
              }}
            >
              <h2 className="text-5xl font-bold mb-2" style={{ color: '#FFD700', fontFamily: 'Audiowide, sans-serif' }}>
                🎉 FINISHED! 🎉
              </h2>
              <p className="text-gray-300">Calculating your pirate rank...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
