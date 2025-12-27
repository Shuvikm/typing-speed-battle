import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import AnimeBackground from '../components/AnimeBackground';
import { initAnimeAnimations } from '../utils/animeHelper';

const Home = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Wanted poster entrance animation
    const timer = setTimeout(() => setShowContent(true), 500);
    // Initialize anime.js animations
    initAnimeAnimations();
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimeBackground>
      <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden bg-opacity-animated">
      {/* Matrix-style falling text effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-hacker-green text-xs font-mono animate-matrix-fall"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          >
            {Math.random().toString(36).substring(7)}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <div
          className={`transition-all duration-1000 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Wanted Poster Style Header */}
          <Card className="text-center mb-8 max-w-2xl mx-auto border-4 border-pirate-yellow">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-bold text-glow-blue animate-pulse-neon font-display" data-anime="fade-in">
                ⚔️ TYPING SPEED BATTLE ⚔️
              </h1>
              <div className="text-4xl mb-4">🏴‍☠️</div>
              <p className="text-xl text-gray-300">
                Prove your typing skills and become the <span className="text-pirate-yellow font-bold">Pirate King</span> of keyboards!
              </p>
            </div>
          </Card>

          {/* Mode Selection */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card
              glow
              className="text-center cursor-pointer transform hover:scale-105 transition-all duration-300"
              onClick={() => navigate('/room?mode=solo')}
            >
              <div className="text-6xl mb-4 animate-bounce">🎯</div>
              <h2 className="text-3xl font-bold text-neon-blue mb-2">Solo Practice</h2>
              <p className="text-gray-400">
                Train your skills alone and improve your WPM
              </p>
            </Card>

            <Card
              glow
              className="text-center cursor-pointer transform hover:scale-105 transition-all duration-300"
              onClick={() => navigate('/room?mode=battle')}
            >
              <div className="text-6xl mb-4 animate-pulse">⚔️</div>
              <h2 className="text-3xl font-bold text-neon-purple mb-2">Battle Mode</h2>
              <p className="text-gray-400">
                Challenge other pirates in real-time typing battles
              </p>
            </Card>

            <Card
              glow
              className="text-center cursor-pointer transform hover:scale-105 transition-all duration-300 border-4 border-pirate-yellow"
              onClick={() => navigate('/quiz')}
            >
              <div className="text-6xl mb-4 animate-pulse-neon">🎯</div>
              <h2 className="text-3xl font-bold text-pirate-yellow mb-2">Join My Quiz</h2>
              <p className="text-gray-400">
                Test your knowledge with fun anime-themed quizzes!
              </p>
              <div className="mt-4 text-2xl">🧠⚡⌨️</div>
            </Card>
          </div>

          {/* Quick Start Button */}
          <div className="mt-8 text-center">
            <Button
              variant="pirate"
              size="lg"
              onClick={() => navigate('/room?mode=battle')}
              className="text-2xl px-12 py-6"
            >
              🚀 START BATTLE 🚀
            </Button>
          </div>
        </div>
      </div>
    </div>
    </AnimeBackground>
  );
};

export default Home;

