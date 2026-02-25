import React, { useState } from 'react';
import PropTypes from 'prop-types';

const avatars = {
  luffy: { emoji: '👒', color: 'from-red-500 to-pirate-red', title: 'Luffy' },
  zoro: { emoji: '🗡️', color: 'from-green-500 to-hacker-green', title: 'Zoro' },
  nami: { emoji: '🧭', color: 'from-orange-500 to-yellow-500', title: 'Nami' },
  usopp: { emoji: '🎯', color: 'from-brown-500 to-amber-600', title: 'Usopp' },
  sanji: { emoji: '🍖', color: 'from-blue-500 to-cyan-500', title: 'Sanji' },
  chopper: { emoji: '🦌', color: 'from-pink-500 to-rose-500', title: 'Chopper' },
  robin: { emoji: '🌸', color: 'from-purple-500 to-indigo-500', title: 'Robin' },
  franky: { emoji: '🤖', color: 'from-blue-600 to-neon-blue', title: 'Franky' },
  brook: { emoji: '💀', color: 'from-gray-400 to-white', title: 'Brook' },
  ace: { emoji: '🔥', color: 'from-orange-600 to-red-500', title: 'Ace' },
  shanks: { emoji: '⚔️', color: 'from-red-700 to-red-500', title: 'Shanks' },
  law: { emoji: '⚙️', color: 'from-yellow-400 to-gray-500', title: 'Law' },
};

const Avatar = ({ name, selected = false, onClick, size = 'md', showLabel = false }) => {
  const [hovered, setHovered] = useState(false);
  const avatar = avatars[name] || avatars.luffy;
  const sizes = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  };

  return (
    <div className="relative inline-flex flex-col items-center">
      <div
        role="button"
        tabIndex={0}
        aria-label={`Select ${avatar.title} avatar`}
        aria-pressed={selected}
        onClick={onClick}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
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

      {/* Tooltip */}
      {hovered && !showLabel && (
        <div
          style={{
            position: 'absolute',
            bottom: '110%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10,10,15,0.95)',
            border: '1px solid #00D9FF40',
            color: '#00D9FF',
            fontSize: '0.7rem',
            padding: '3px 10px',
            borderRadius: 8,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            fontFamily: 'Audiowide, sans-serif',
            zIndex: 100,
          }}
        >
          {avatar.title}
        </div>
      )}

      {/* Persistent label */}
      {showLabel && (
        <span
          style={{
            fontSize: '0.65rem',
            marginTop: 4,
            color: selected ? '#00D9FF' : '#666',
            fontFamily: 'Audiowide, sans-serif',
            transition: 'color 0.2s',
          }}
        >
          {avatar.title}
        </span>
      )}
    </div>
  );
};

Avatar.propTypes = {
  name: PropTypes.oneOf(Object.keys(avatars)),
  selected: PropTypes.bool,
  onClick: PropTypes.func,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showLabel: PropTypes.bool,
};

export { avatars };
export default React.memo(Avatar);
