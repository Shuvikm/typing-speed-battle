import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import AnimeBackground from '../components/AnimeBackground';

const TITLE = '⚔️ TYPING SPEED BATTLE ⚔️';

const Home = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [visibleLetters, setVisibleLetters] = useState(0);
  const [mascotFrame, setMascotFrame] = useState(0);

  // Letter-by-letter title entrance
  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!showContent) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setVisibleLetters(i);
      if (i >= TITLE.length) clearInterval(iv);
    }, 40);
    return () => clearInterval(iv);
  }, [showContent]);

  // Mascot animation frames
  useEffect(() => {
    const iv = setInterval(() => setMascotFrame(f => (f + 1) % 4), 600);
    return () => clearInterval(iv);
  }, []);

  const mascotFrames = ['🏴‍☠️', '⚔️', '🏴‍☠️', '👑'];

  const modes = [
    {
      emoji: '🎯',
      title: 'Solo Practice',
      desc: 'Train alone and improve your WPM score',
      color: '#00FF41',
      gradient: 'linear-gradient(135deg, rgba(0,255,65,0.15), rgba(0,255,65,0.05))',
      border: '#00FF41',
      shadow: '#00ff4140',
      delay: '0.1s',
      path: '/room?mode=solo',
    },
    {
      emoji: '⚔️',
      title: 'Battle Mode',
      desc: 'Challenge friends in real-time typing battles',
      color: '#FF4444',
      gradient: 'linear-gradient(135deg, rgba(255,68,68,0.15), rgba(255,100,0,0.05))',
      border: '#FF4444',
      shadow: '#ff444440',
      delay: '0.2s',
      path: '/room?mode=battle',
    },
    {
      emoji: '🧠',
      title: 'Quiz Battle',
      desc: 'Compete in Kahoot-style quiz + typing rounds!',
      color: '#FFD700',
      gradient: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(176,38,255,0.05))',
      border: '#FFD700',
      shadow: '#ffd70040',
      delay: '0.3s',
      path: '/quiz',
      badge: '⭐ NEW',
    },
  ];

  return (
    <AnimeBackground>
      <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
        {/* Animated background orbs */}
        <div style={{
          position: 'absolute', top: '-100px', left: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,217,255,0.08), transparent 70%)',
          animation: 'float 6s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(176,38,255,0.08), transparent 70%)',
          animation: 'float 8s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }} />

        {/* Matrix rain */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute text-hacker-green text-xs font-mono animate-matrix-fall"
              style={{
                left: `${(i / 15) * 100}%`,
                animationDelay: `${i * 1.3}s`,
                animationDuration: '20s',
              }}
            >
              {Math.random().toString(36).substring(2, 8)}
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">

          {/* XP bar strip at top */}
          {showContent && (
            <div
              className="fixed top-0 left-0 right-0 h-2 z-50"
              style={{ background: 'linear-gradient(90deg, #00D9FF, #B026FF, #FFD700)', animation: 'opacity-fade-bg 3s ease-in-out infinite' }}
            />
          )}

          {/* Mascot */}
          {showContent && (
            <div
              className="text-7xl mb-4 select-none"
              style={{
                animation: 'float 2s ease-in-out infinite',
                filter: 'drop-shadow(0 0 20px #FFD700)',
                transition: 'all 0.3s',
              }}
            >
              {mascotFrames[mascotFrame]}
            </div>
          )}

          {/* Title - letter by letter */}
          <h1
            className="text-4xl md:text-6xl font-bold mb-2 text-center"
            style={{ fontFamily: 'Audiowide, Orbitron, sans-serif', lineHeight: 1.2 }}
          >
            {TITLE.split('').map((char, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  opacity: i < visibleLetters ? 1 : 0,
                  transform: i < visibleLetters ? 'translateY(0)' : 'translateY(-30px)',
                  transition: 'all 0.2s ease',
                  color: i % 4 === 0 ? '#00D9FF' : i % 4 === 1 ? '#FFD700' : i % 4 === 2 ? '#B026FF' : '#00FF41',
                  textShadow: i < visibleLetters ? `0 0 20px currentColor` : 'none',
                  whiteSpace: char === ' ' ? 'pre' : 'normal',
                }}
              >
                {char}
              </span>
            ))}
          </h1>

          <p
            className="text-lg text-gray-400 mb-10 text-center"
            style={{
              opacity: showContent ? 1 : 0,
              transform: showContent ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.6s ease 0.8s',
              fontFamily: 'Rajdhani, sans-serif',
              letterSpacing: '0.1em',
            }}
          >
            Prove your typing skills. Become the{' '}
            <span style={{ color: '#FFD700', fontWeight: 700 }}>Pirate King</span> of keyboards!
          </p>

          {/* Mode cards */}
          <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl mb-10">
            {modes.map((mode, idx) => (
              <div
                key={idx}
                onClick={() => navigate(mode.path)}
                className="cursor-pointer relative group"
                style={{
                  animation: showContent ? `slide-up 0.6s cubic-bezier(0.34,1.56,0.64,1) ${mode.delay} both` : 'none',
                }}
              >
                {mode.badge && (
                  <div
                    className="absolute -top-3 -right-3 z-10 px-2 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: mode.color,
                      color: '#000',
                      fontFamily: 'Orbitron, sans-serif',
                      animation: 'bounce-in 0.5s ease-out',
                    }}
                  >
                    {mode.badge}
                  </div>
                )}
                <div
                  className="rounded-2xl p-6 text-center h-full transition-all duration-300"
                  style={{
                    background: mode.gradient,
                    border: `2px solid ${mode.border}`,
                    boxShadow: `0 0 0 0 ${mode.shadow}`,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = `0 20px 40px ${mode.shadow}, 0 0 30px ${mode.shadow}`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = `0 0 0 0 ${mode.shadow}`;
                  }}
                >
                  <div className="text-6xl mb-4" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: `${idx * 0.5}s` }}>
                    {mode.emoji}
                  </div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: mode.color, fontFamily: 'Audiowide, sans-serif' }}>
                    {mode.title}
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed">{mode.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div
            style={{
              animation: showContent ? 'bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.6s both' : 'none',
            }}
          >
            <button
              onClick={() => navigate('/room?mode=battle')}
              className="relative overflow-hidden px-14 py-5 rounded-2xl text-xl font-bold text-black transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FF6600)',
                boxShadow: '0 0 30px #FFD70060, 0 0 60px #FF660030',
                fontFamily: 'Audiowide, Orbitron, sans-serif',
                letterSpacing: '0.05em',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.08)';
                e.currentTarget.style.boxShadow = '0 0 50px #FFD70080, 0 0 80px #FF660060';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 30px #FFD70060, 0 0 60px #FF660030';
              }}
            >
              🚀 START BATTLE 🚀
            </button>
          </div>

          {/* Bottom stats strip */}
          {showContent && (
            <div
              className="mt-10 flex gap-8 text-center"
              style={{
                opacity: showContent ? 1 : 0,
                transform: showContent ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.6s ease 1s',
              }}
            >
              {[
                { label: 'Modes', value: '3' },
                { label: 'Questions', value: '15+' },
                { label: 'Players', value: '∞' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl font-bold text-neon-blue" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AnimeBackground>
  );
};

export default Home;
