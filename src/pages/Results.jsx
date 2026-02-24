import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createSocket, socketEvents } from '../utils/socket';
import { getRankTitle, getBestWpm, saveBestWpm } from '../utils/gameLogic';
import Avatar from '../components/Avatar';
import Confetti from '../components/Confetti';
import NewRecordBanner from '../components/NewRecordBanner';

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
  const [displayWpm, setDisplayWpm] = useState(0);
  const [displayAcc, setDisplayAcc] = useState(0);
  const [podiumVisible, setPodiumVisible] = useState(false);
  const [showRecord, setShowRecord] = useState(false);
  const [prevBest] = useState(() => getBestWpm(60) || 0); // default 60s

  useEffect(() => {
    if (mode === 'battle' && roomId) {
      const newSocket = createSocket();
      setSocket(newSocket);
      newSocket.on(socketEvents.GAME_END, (data) => {
        setAllResults(data.results);
        const myResult = data.results.find(r => r.id === newSocket.id);
        if (myResult) {
          const highest = Math.max(...data.results.map(r => r.wpm));
          setIsWinner(myResult.wpm === highest && myResult.wpm > 0);
        }
      });
      newSocket.emit('get-game-results', { roomId });
      return () => newSocket.disconnect();
    } else {
      setAllResults([{ wpm, accuracy, isYou: true }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Count-up animation
  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      const pct = step / steps;
      const ease = 1 - Math.pow(1 - pct, 3); // ease-out cubic
      setDisplayWpm(Math.round(wpm * ease));
      setDisplayAcc(Math.round(accuracy * ease));
      if (step >= steps) clearInterval(iv);
    }, duration / steps);
    return () => clearInterval(iv);
  }, [wpm, accuracy]);

  // Podium entrance delay
  useEffect(() => {
    const t = setTimeout(() => setPodiumVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Check new PB for solo mode
  useEffect(() => {
    if (mode === 'solo' && wpm > 0) {
      const old = getBestWpm(60) || 0;
      if (wpm > old) {
        saveBestWpm(60, wpm);
        setShowRecord(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedResults = [...allResults].sort((a, b) => b.wpm - a.wpm);

  const grade = wpm >= 100 ? 'S' : wpm >= 80 ? 'A' : wpm >= 60 ? 'B' : wpm >= 40 ? 'C' : 'D';
  const gradeColor = grade === 'S' ? '#FFD700' : grade === 'A' ? '#00FF41' : grade === 'B' ? '#00D9FF' : grade === 'C' ? '#B026FF' : '#888';

  const podiumHeights = ['140px', '100px', '70px'];
  const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
      {showRecord && (
        <NewRecordBanner wpm={wpm} prevBest={prevBest} onDone={() => setShowRecord(false)} />
      )}

      {/* Background glow */}
      {isWinner && (
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(255,215,0,0.12), transparent 60%)',
        }} />
      )}

      {(isWinner || mode === 'solo') && <Confetti count={70} />}

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Winner Banner or Rank */}
          <div className="text-center mb-8" style={{ animation: 'bounce-in 0.7s ease-out' }}>
            {isWinner ? (
              <>
                <div className="text-8xl mb-2">🏆</div>
                <h1 className="text-6xl font-black" style={{ fontFamily: 'Audiowide,sans-serif', color: '#FFD700', textShadow: '0 0 40px #FFD700' }}>
                  VICTORY!
                </h1>
                <p className="text-xl mt-2" style={{ color: '#FFD700' }}>You are the Pirate King of Typing! 🏴‍☠️</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-2">🏴‍☠️</div>
                <h1 className="text-4xl font-black" style={{ fontFamily: 'Audiowide,sans-serif', color: '#00D9FF' }}>
                  Battle Complete!
                </h1>
              </>
            )}
            {/* Rank badge */}
            <div className="inline-block mt-3 px-6 py-2 rounded-full font-bold"
              style={{ background: `${gradeColor}20`, border: `2px solid ${gradeColor}60`, color: gradeColor, fontFamily: 'Orbitron,sans-serif' }}>
              {rank.title}
            </div>
          </div>

          {/* Grade + Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="col-span-1 rounded-2xl flex items-center justify-center"
              style={{ background: '#1a1a2e', border: `2px solid ${gradeColor}40`, boxShadow: `0 0 30px ${gradeColor}20`, minHeight: '100px', animation: 'bounce-in 0.5s ease-out 0.1s both' }}>
              <div className="text-center">
                <div className="text-6xl font-black" style={{ color: gradeColor, fontFamily: 'Audiowide,sans-serif', textShadow: `0 0 20px ${gradeColor}` }}>{grade}</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Grade</div>
              </div>
            </div>

            {[
              { label: 'WPM', value: displayWpm, color: '#00D9FF', icon: '⌨️' },
              { label: 'Accuracy', value: `${displayAcc}%`, color: '#00FF41', icon: '🎯' },
              { label: 'Rating', value: wpm >= 100 ? '👑' : wpm >= 80 ? '⭐' : wpm >= 60 ? '🔥' : '💪', color: '#B026FF', icon: '' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-4 flex flex-col items-center justify-center"
                style={{
                  background: '#1a1a2e', border: `2px solid ${s.color}30`, minHeight: '100px',
                  animation: `bounce-in 0.5s ease-out ${0.15 * (i + 1)}s both`
                }}>
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-3xl font-black" style={{ color: s.color, fontFamily: 'Orbitron,sans-serif' }}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          {/* PB Delta (solo mode) */}
          {mode === 'solo' && prevBest > 0 && (
            <div className="mb-6 rounded-2xl p-4 text-center" style={{
              background: wpm > prevBest
                ? 'linear-gradient(135deg,rgba(0,255,65,0.1),rgba(0,217,255,0.05))'
                : 'linear-gradient(135deg,rgba(176,38,255,0.08),rgba(255,68,68,0.05))',
              border: `1px solid ${wpm > prevBest ? '#00FF4140' : '#B026FF30'}`,
              animation: 'bounce-in 0.5s ease-out 0.3s both',
            }}>
              <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Orbitron,sans-serif', marginBottom: 4 }}>vs Personal Best</div>
              <div style={{
                fontSize: 28, fontWeight: 900, fontFamily: 'Orbitron,sans-serif',
                color: wpm > prevBest ? '#00FF41' : '#B026FF',
                filter: `drop-shadow(0 0 10px ${wpm > prevBest ? '#00FF41' : '#B026FF'})`,
              }}>
                {wpm > prevBest ? '+' : ''}{wpm - prevBest} WPM
              </div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                {wpm > prevBest ? '🎉 New personal best!' : `Best: ${prevBest} WPM`}
              </div>
            </div>
          )}

          {/* Podium (Battle Mode) */}
          {mode === 'battle' && sortedResults.length > 1 && podiumVisible && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-center mb-6 text-pirate-yellow" style={{ fontFamily: 'Audiowide,sans-serif' }}>
                🏆 Battle Podium
              </h3>
              {/* Podium visual */}
              <div className="flex items-end justify-center gap-4 mb-4">
                {[1, 0, 2].map(pos => {
                  const result = sortedResults[pos];
                  if (!result) return null;
                  const color = podiumColors[pos];
                  const height = podiumHeights[pos];
                  const medal = pos === 0 ? '🥇' : pos === 1 ? '🥈' : '🥉';
                  const order = pos === 1 ? 1 : pos === 0 ? 2 : 3; // 2nd left, 1st center, 3rd right
                  return (
                    <div key={pos} className="flex flex-col items-center" style={{ order }}>
                      <div className="text-4xl mb-1">{medal}</div>
                      {result.avatar && <Avatar name={result.avatar} size="md" />}
                      <div className="text-sm font-bold mb-1 text-white">{result.name || 'Player'}</div>
                      <div className="text-xs font-bold mb-2" style={{ color, fontFamily: 'Orbitron,sans-serif' }}>{result.wpm} WPM</div>
                      <div className="w-24 rounded-t-xl flex items-center justify-center text-2xl font-black border-t-4"
                        style={{
                          height,
                          background: `linear-gradient(180deg, ${color}40, ${color}15)`,
                          borderColor: color,
                          boxShadow: `0 0 20px ${color}30`,
                          color,
                          fontFamily: 'Orbitron,sans-serif',
                          animation: `podium-rise 0.8s ease-out`,
                          animationFillMode: 'both',
                        }}>
                        #{pos + 1}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Full results list */}
              {sortedResults.length > 3 && (
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #333' }}>
                  {sortedResults.slice(3).map((result, idx) => (
                    <div key={result.id || idx} className="flex items-center justify-between p-3 border-b"
                      style={{ background: '#1a1a2e', borderColor: '#222' }}>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 font-bold w-8 text-center" style={{ fontFamily: 'Orbitron,sans-serif' }}>#{idx + 4}</span>
                        {result.avatar && <Avatar name={result.avatar} size="sm" />}
                        <span className="font-bold">{result.name}</span>
                        {result.isYou && <span className="text-xs text-neon-blue">(You)</span>}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-neon-blue" style={{ fontFamily: 'Orbitron,sans-serif' }}>{result.wpm} WPM</div>
                        <div className="text-xs text-gray-500">{result.accuracy}% Acc</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center" style={{ animation: 'bounce-in 0.5s ease-out 0.5s both' }}>
            <button onClick={() => navigate(`/room?mode=${mode}`)}
              className="px-10 py-4 rounded-xl font-bold text-lg transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg,#FFD700,#FF6600)', color: '#000', fontFamily: 'Audiowide,sans-serif',
                boxShadow: '0 0 30px #FFD70040'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              🔄 Play Again
            </button>
            <button onClick={() => navigate('/quiz')}
              className="px-10 py-4 rounded-xl font-bold text-lg transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg,rgba(176,38,255,0.3),rgba(0,217,255,0.3))', color: '#fff',
                border: '2px solid #B026FF', fontFamily: 'Audiowide,sans-serif'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              🧠 Play Quiz
            </button>
            <button onClick={() => navigate('/')}
              className="px-10 py-4 rounded-xl font-bold text-lg transition-all duration-200"
              style={{ background: '#1a1a2e', border: '2px solid #333', color: '#aaa', fontFamily: 'Audiowide,sans-serif' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              🏠 Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
