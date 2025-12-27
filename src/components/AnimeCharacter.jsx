import React from 'react';

const AnimeCharacter = ({ 
  character = 'luffy', 
  size = 'md', 
  animated = true,
  position = 'center',
  className = '' 
}) => {
  const characters = {
    luffy: { emoji: '👒', color: 'from-red-500 to-pirate-red' },
    zoro: { emoji: '🗡️', color: 'from-green-500 to-hacker-green' },
    nami: { emoji: '🧭', color: 'from-orange-500 to-yellow-500' },
    sanji: { emoji: '🍖', color: 'from-blue-500 to-cyan-500' },
    chopper: { emoji: '🦌', color: 'from-pink-500 to-rose-500' },
    robin: { emoji: '🌸', color: 'from-purple-500 to-indigo-500' },
    usopp: { emoji: '🎯', color: 'from-brown-500 to-amber-600' },
    franky: { emoji: '🤖', color: 'from-blue-600 to-neon-blue' },
    brook: { emoji: '💀', color: 'from-gray-400 to-white' },
  };

  const sizes = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl',
    xl: 'text-9xl',
  };

  const positions = {
    center: 'flex items-center justify-center',
    left: 'flex items-center justify-start',
    right: 'flex items-center justify-end',
  };

  const char = characters[character] || characters.luffy;
  const animationClass = animated ? 'animate-float' : '';

  return (
    <div className={`${positions[position]} ${className}`}>
      <div
        className={`
          ${sizes[size]}
          ${animationClass}
          bg-gradient-to-br ${char.color}
          rounded-full
          p-4
          shadow-lg
          transform transition-all duration-300
          hover:scale-110
        `}
        style={{
          filter: 'drop-shadow(0 0 10px rgba(0, 217, 255, 0.5))',
        }}
      >
        {char.emoji}
      </div>
    </div>
  );
};

export default AnimeCharacter;

