import React from 'react';

const Card = ({ children, className = '', glow = false, ...props }) => {
  const glowClass = glow ? 'ring-2 ring-neon-blue ring-opacity-50 shadow-lg shadow-neon-blue/50' : '';
  
  return (
    <div
      className={`bg-dark-card rounded-xl p-6 border border-gray-800 ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

