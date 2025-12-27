import React from 'react';
import Card from './Card';

const Achievement = ({ title, description, icon, unlocked, progress = 0 }) => {
  return (
    <Card className={`${unlocked ? 'border-pirate-yellow' : 'opacity-50'}`}>
      <div className="flex items-center gap-4">
        <div className="text-4xl">{icon}</div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
          {!unlocked && progress > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-neon-blue h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-1">{progress}%</span>
            </div>
          )}
        </div>
        {unlocked && (
          <div className="text-2xl">✅</div>
        )}
      </div>
    </Card>
  );
};

export default Achievement;

