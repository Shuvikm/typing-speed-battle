import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createSocket, socketEvents } from '../utils/socket';
import { getRankTitle } from '../utils/gameLogic';
import Button from '../components/Button';
import Card from '../components/Card';
import Avatar from '../components/Avatar';

const Results = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const wpm = parseInt(searchParams.get('wpm')) || 0;
  const accuracy = parseInt(searchParams.get('accuracy')) || 0;
  const mode = searchParams.get('mode') || 'solo';
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);
  const [allResults, setAllResults] = useState([]);
  const [isWinner, setIsWinner] = useState(false);
  const [rank] = useState(getRankTitle(wpm));

  useEffect(() => {
    if (mode === 'battle' && roomId) {
      const newSocket = createSocket();
      setSocket(newSocket);

      newSocket.on(socketEvents.GAME_END, (data) => {
        setAllResults(data.results);
        const myResult = data.results.find(r => r.id === newSocket.id);
        if (myResult) {
          const highestWpm = Math.max(...data.results.map(r => r.wpm));
          setIsWinner(myResult.wpm === highestWpm && myResult.wpm > 0);
        }
      });

      newSocket.emit('get-game-results', { roomId });

      return () => newSocket.disconnect();
    } else {
      // Solo mode - just show personal results
      setAllResults([{ wpm, accuracy, isYou: true }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, mode]);

  // Confetti effect on win
  useEffect(() => {
    if (isWinner) {
      // Simple confetti effect with emojis
      const confetti = ['🏴‍☠️', '🎉', '⭐', '👑', '⚔️'];
      const interval = setInterval(() => {
        // Visual effect handled by CSS animations
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isWinner]);

  const sortedResults = [...allResults].sort((a, b) => b.wpm - a.wpm);

  return (
    <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
      {/* Victory Background Effects */}
      {isWinner && (
        <div className="absolute inset-0 bg-gradient-to-b from-pirate-yellow/20 via-pirate-red/20 to-dark-bg animate-pulse-neon"></div>
      )}
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Winner Banner */}
          {isWinner && (
            <Card glow className="text-center mb-8 border-4 border-pirate-yellow animate-pulse-neon">
              <h1 className="text-6xl font-bold text-glow-blue mb-4">
                🏆 VICTORY! 🏆
              </h1>
              <p className="text-3xl text-pirate-yellow">You are the Pirate King of Typing!</p>
            </Card>
          )}

          {/* Rank Title */}
          <Card glow className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-2">
              <span className={rank.color}>🏴‍☠️ {rank.title} 🏴‍☠️</span>
            </h2>
            <p className="text-xl text-gray-400">Your Typing Rank</p>
          </Card>

          {/* Your Stats */}
          <Card glow className="mb-6">
            <h3 className="text-2xl font-bold mb-4 text-neon-blue">Your Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <div className="text-4xl font-bold text-neon-blue">{wpm}</div>
                <div className="text-sm text-gray-400">Words Per Minute</div>
              </div>
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <div className="text-4xl font-bold text-hacker-green">{accuracy}%</div>
                <div className="text-sm text-gray-400">Accuracy</div>
              </div>
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <div className="text-4xl font-bold text-pirate-yellow">
                  {wpm >= 80 ? 'S' : wpm >= 60 ? 'A' : wpm >= 40 ? 'B' : 'C'}
                </div>
                <div className="text-sm text-gray-400">Grade</div>
              </div>
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <div className="text-4xl font-bold text-neon-purple">
                  {wpm >= 100 ? '👑' : wpm >= 80 ? '⭐' : wpm >= 60 ? '🔥' : '💪'}
                </div>
                <div className="text-sm text-gray-400">Rating</div>
              </div>
            </div>
          </Card>

          {/* Leaderboard (Battle Mode) */}
          {mode === 'battle' && sortedResults.length > 1 && (
            <Card glow className="mb-6">
              <h3 className="text-2xl font-bold mb-4 text-pirate-yellow">🏆 Battle Results</h3>
              <div className="space-y-3">
                {sortedResults.map((result, index) => (
                  <div
                    key={result.id || index}
                    className={`p-4 rounded-lg flex items-center justify-between ${
                      index === 0
                        ? 'bg-gradient-to-r from-pirate-yellow/20 to-pirate-red/20 border-2 border-pirate-yellow'
                        : 'bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold w-12 text-center">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      {result.avatar && (
                        <Avatar name={result.avatar} size="md" />
                      )}
                      <div>
                        <div className="font-bold text-lg">{result.name || 'Player'}</div>
                        {result.isYou && (
                          <span className="text-xs text-neon-blue">(You)</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-neon-blue">{result.wpm} WPM</div>
                      <div className="text-sm text-gray-400">{result.accuracy}% Accuracy</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button
              variant="pirate"
              size="lg"
              onClick={() => navigate(`/room?mode=${mode}`)}
            >
              🔄 Play Again
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/')}
            >
              🏠 Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;

