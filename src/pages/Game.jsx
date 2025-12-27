import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createSocket, socketEvents } from '../utils/socket';
import { calculateWPM, calculateAccuracy, checkChar, calculateCombo } from '../utils/gameLogic';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Avatar from '../components/Avatar';

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
  const [countdown, setCountdown] = useState(null);
  const [opponents, setOpponents] = useState([]);
  const [finished, setFinished] = useState(false);
  
  const inputRef = useRef(null);

  useEffect(() => {
    const newSocket = createSocket();
    setSocket(newSocket);

    newSocket.on(socketEvents.GAME_TEXT, (data) => {
      setText(data.text);
      setGameStarted(true);
      setCountdown(null);
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

    newSocket.on(socketEvents.GAME_END, (data) => {
      // Use current values at the time of game end
      const finalWpm = calculateWPM(correctChars, timeElapsed || 1);
      const finalAccuracy = calculateAccuracy(correctChars, totalChars || 1);
      navigate(`/results?roomId=${roomId}&wpm=${finalWpm}&accuracy=${finalAccuracy}&mode=${mode}`);
    });

    // Start countdown
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          if (mode === 'solo') {
            // Generate text for solo mode
            const soloText = "The quick brown fox jumps over the lazy dog. One Piece is the greatest anime. Luffy will become the Pirate King! The Straw Hat crew sails the Grand Line.";
            setText(soloText);
            setGameStarted(true);
            inputRef.current?.focus();
          } else {
            newSocket.emit('request-game-text', { roomId });
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, mode]);

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
    if (gameStarted && !startTime) {
      setStartTime(Date.now());
    }
  }, [gameStarted, startTime]);

  const handleInputChange = (e) => {
    if (!gameStarted || finished) return;
    
    const value = e.target.value;
    setUserInput(value);
    setTotalChars(value.length);

    // Check each character
    let newCorrect = 0;
    let newStreak = 0;
    let broken = false;

    for (let i = 0; i < value.length; i++) {
      if (checkChar(text[i], value[i])) {
        newCorrect++;
        if (!broken) {
          newStreak++;
        }
      } else {
        broken = true;
        newStreak = 0;
      }
    }

    setCorrectChars(newCorrect);
    setCorrectStreak(newStreak);
    setCombo(calculateCombo(newStreak));
    setAccuracy(calculateAccuracy(newCorrect, value.length));

    // Check if finished
    if (value === text) {
      setFinished(true);
      const finalWpm = calculateWPM(newCorrect, timeElapsed);
      const finalAccuracy = calculateAccuracy(newCorrect, value.length);
      
      if (socket && mode === 'battle') {
        socket.emit('player-finished', {
          roomId,
          wpm: finalWpm,
          accuracy: finalAccuracy,
        });
      }

      setTimeout(() => {
        navigate(`/results?roomId=${roomId}&wpm=${finalWpm}&accuracy=${finalAccuracy}&mode=${mode}`);
      }, 1000);
    }

    // Send progress update
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

  if (countdown !== null) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-glow-blue animate-pulse-neon mb-4">
            {countdown}
          </h1>
          <p className="text-3xl text-neon-purple">Get ready, pirate!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
      {/* Going Merry Deck + Abstract Aura Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 via-blue-900/20 to-dark-bg"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,217,255,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="text-center">
            <div className="text-2xl font-bold text-neon-blue">{wpm}</div>
            <div className="text-sm text-gray-400">WPM</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-hacker-green">{accuracy}%</div>
            <div className="text-sm text-gray-400">Accuracy</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-pirate-yellow">{combo}x</div>
            <div className="text-sm text-gray-400">Combo</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-neon-purple">{Math.floor(timeElapsed)}s</div>
            <div className="text-sm text-gray-400">Time</div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Typing Area */}
          <div className="md:col-span-2">
            <Card glow className="mb-4">
              <ProgressBar
                progress={text.length > 0 ? (userInput.length / text.length) * 100 : 0}
                label="Progress"
                color="neon-blue"
              />
            </Card>

            <Card glow className="min-h-[300px]">
              <div className="text-xl md:text-2xl font-mono leading-relaxed select-none">
                {text.split('').map((char, index) => (
                  <span
                    key={index}
                    className={getCharClass(index)}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="mt-4">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                disabled={!gameStarted || finished}
                className="w-full px-4 py-3 bg-gray-900 border-2 border-neon-blue rounded-lg text-white text-xl focus:outline-none focus:ring-2 focus:ring-neon-blue"
                placeholder={gameStarted ? "Start typing..." : "Waiting..."}
                autoFocus
              />
            </Card>
          </div>

          {/* Opponents Sidebar */}
          {mode === 'battle' && (
            <div>
              <Card>
                <h3 className="text-xl font-bold mb-4 text-pirate-yellow">⚔️ Opponents</h3>
                <div className="space-y-4">
                  {opponents.map((opponent) => (
                    <div key={opponent.id} className="p-3 bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar name={opponent.avatar} size="sm" />
                        <span className="font-bold">{opponent.name}</span>
                        {opponent.finished && (
                          <span className="text-xs text-pirate-yellow">✓ Finished</span>
                        )}
                      </div>
                      <ProgressBar
                        progress={opponent.progress || 0}
                        color="neon-purple"
                        showLabel={false}
                      />
                      {opponent.wpm && (
                        <div className="text-xs text-gray-400 mt-1">
                          {opponent.wpm} WPM • {opponent.accuracy}% Acc
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        {finished && (
          <div className="mt-6 text-center">
            <Card glow className="bg-gradient-to-r from-pirate-yellow/20 to-pirate-red/20">
              <h2 className="text-4xl font-bold text-glow-blue mb-2">
                🎉 FINISHED! 🎉
              </h2>
              <p className="text-xl">Calculating results...</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;

