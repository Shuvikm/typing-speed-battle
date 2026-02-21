import React from 'react';

/**
 * RaceTrack – shows player avatars racing across a horizontal track
 * Props: players = [{ id, name, avatar, progress, isYou }]
 */
const avatarEmoji = {
    luffy: '🏴‍☠️',
    zoro: '⚔️',
    nami: '🌊',
    sanji: '🔥',
    chopper: '🦌',
    robin: '🌸',
    franky: '🤖',
    brook: '💀',
};

const LANE_COLORS = ['#00D9FF', '#FFD700', '#FF4444', '#00FF41', '#B026FF'];

const RaceTrack = ({ players = [] }) => {
    if (players.length === 0) return null;

    return (
        <div className="w-full rounded-xl overflow-hidden" style={{ background: '#0d0d1a', border: '1px solid #333' }}>
            {/* Header */}
            <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid #222' }}>
                <span className="text-lg">🏁</span>
                <span className="text-sm font-bold text-gray-300" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    RACE TRACK
                </span>
            </div>

            {/* Lanes */}
            <div className="p-3 space-y-3">
                {players.map((player, i) => {
                    const color = LANE_COLORS[i % LANE_COLORS.length];
                    const emoji = avatarEmoji[player.avatar] || '👤';
                    const progress = Math.min(100, Math.max(0, player.progress || 0));

                    return (
                        <div key={player.id || i}>
                            {/* Player info row */}
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{emoji}</span>
                                    <span
                                        className="text-xs font-bold"
                                        style={{ color: player.isYou ? color : '#aaa', fontFamily: 'Orbitron, sans-serif' }}
                                    >
                                        {player.name || 'Player'}
                                        {player.isYou && <span className="ml-1" style={{ color: '#00D9FF' }}>(YOU)</span>}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {player.wpm > 0 && (
                                        <span className="text-xs font-bold" style={{ color, fontFamily: 'Orbitron, sans-serif' }}>
                                            {player.wpm} WPM
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
                                </div>
                            </div>

                            {/* Track lane */}
                            <div
                                className="relative h-8 rounded-full overflow-hidden"
                                style={{ background: '#1a1a2e' }}
                            >
                                {/* Track lines */}
                                {[25, 50, 75].map(pct => (
                                    <div
                                        key={pct}
                                        className="absolute top-0 bottom-0 w-px"
                                        style={{ left: `${pct}%`, background: '#ffffff15' }}
                                    />
                                ))}

                                {/* Progress fill */}
                                <div
                                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
                                    style={{
                                        width: `${progress}%`,
                                        background: `linear-gradient(90deg, ${color}33, ${color}99)`,
                                        boxShadow: `0 0 8px ${color}66`,
                                    }}
                                />

                                {/* Avatar icon riding the track */}
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 text-lg transition-all duration-300"
                                    style={{
                                        left: `calc(${progress}% - 20px)`,
                                        filter: `drop-shadow(0 0 6px ${color})`,
                                        animation: 'race-bounce 0.5s ease-in-out infinite',
                                        minLeft: 0,
                                    }}
                                >
                                    {emoji}
                                </div>

                                {/* Finish flag at end */}
                                {progress < 95 && (
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 text-base opacity-40">
                                        🏁
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RaceTrack;
