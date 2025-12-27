import React from 'react';

const ProgressBar = ({ progress, label, color = 'neon-blue', showLabel = true }) => {
  const colorClasses = {
    'neon-blue': 'bg-neon-blue',
    'neon-purple': 'bg-neon-purple',
    'hacker-green': 'bg-hacker-green',
    'pirate-yellow': 'bg-pirate-yellow',
    'pirate-red': 'bg-pirate-red',
  };
  
  return (
    <div className="w-full">
      {showLabel && label && (
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-gray-300">{label}</span>
          <span className="text-neon-blue font-bold">{progress}%</span>
        </div>
      )}
      <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-300 rounded-full shadow-lg`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-neon"></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;

