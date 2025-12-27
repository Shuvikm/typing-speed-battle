import React from 'react';

const PowerUp = ({ type, active, onClick }) => {
  const powerUps = {
    speed: { emoji: '⚡', color: 'from-yellow-400 to-yellow-600', name: 'Speed Boost' },
    accuracy: { emoji: '🎯', color: 'from-green-400 to-green-600', name: 'Accuracy Boost' },
    combo: { emoji: '🔥', color: 'from-red-400 to-red-600', name: 'Combo Multiplier' },
    shield: { emoji: '🛡️', color: 'from-blue-400 to-blue-600', name: 'Error Shield' },
  };

  const powerUp = powerUps[type] || powerUps.speed;

  return (
    <div
      onClick={onClick}
      className={`
        relative p-3 rounded-lg cursor-pointer transition-all duration-300
        bg-gradient-to-br ${powerUp.color}
        ${active ? 'ring-4 ring-white ring-opacity-50 scale-110' : 'opacity-70 hover:opacity-100'}
        transform hover:scale-105
      `}
      title={powerUp.name}
    >
      <div className="text-3xl">{powerUp.emoji}</div>
      {active && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
      )}
    </div>
  );
};

export default PowerUp;

