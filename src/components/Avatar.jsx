import React from 'react';

const avatars = {
  luffy: { emoji: '👒', color: 'from-red-500 to-pirate-red' },
  zoro: { emoji: '🗡️', color: 'from-green-500 to-hacker-green' },
  nami: { emoji: '🧭', color: 'from-orange-500 to-yellow-500' },
  usopp: { emoji: '🎯', color: 'from-brown-500 to-amber-600' },
  sanji: { emoji: '🍖', color: 'from-blue-500 to-cyan-500' },
  chopper: { emoji: '🦌', color: 'from-pink-500 to-rose-500' },
  robin: { emoji: '🌸', color: 'from-purple-500 to-indigo-500' },
  franky: { emoji: '🤖', color: 'from-blue-600 to-neon-blue' },
  brook: { emoji: '💀', color: 'from-gray-400 to-white' },
};

const Avatar = ({ name, selected = false, onClick, size = 'md' }) => {
  const avatar = avatars[name] || avatars.luffy;
  const sizes = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  };
  
  return (
    <div
      onClick={onClick}
      className={`
        ${sizes[size]}
        rounded-full bg-gradient-to-br ${avatar.color}
        flex items-center justify-center
        cursor-pointer transition-all duration-300
        transform hover:scale-110
        ${selected ? 'ring-4 ring-neon-blue ring-offset-2 ring-offset-dark-bg shadow-lg shadow-neon-blue/50' : 'opacity-70 hover:opacity-100'}
      `}
    >
      {avatar.emoji}
    </div>
  );
};

export { avatars };
export default Avatar;

