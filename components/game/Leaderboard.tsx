'use client';

import { LeaderboardEntry } from '@/db/supabase';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export default function Leaderboard({ entries }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-md w-full border-2 border-yellow-400">
        <h2 className="text-3xl font-bold text-yellow-400 mb-4 text-center">
          Top Scores
        </h2>
        <p className="text-white text-center opacity-75">
          No scores yet. Be the first!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-md w-full border-2 border-yellow-400">
      <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
        🏆 Top Scores
      </h2>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
              index === 0
                ? 'bg-yellow-600 bg-opacity-50 border-2 border-yellow-400'
                : index === 1
                ? 'bg-gray-600 bg-opacity-50 border-2 border-gray-400'
                : index === 2
                ? 'bg-orange-700 bg-opacity-50 border-2 border-orange-500'
                : 'bg-gray-700 bg-opacity-50'
            }`}
          >
            <div className="flex-shrink-0 w-8 text-center">
              {index === 0 && <span className="text-2xl">🥇</span>}
              {index === 1 && <span className="text-2xl">🥈</span>}
              {index === 2 && <span className="text-2xl">🥉</span>}
              {index > 2 && (
                <span className="text-white font-bold text-lg">{index + 1}</span>
              )}
            </div>

            <div className="flex-grow min-w-0">
              <div className="text-white font-bold truncate">
                {entry.player_name}
              </div>
              <div className="text-white text-sm opacity-75">
                {entry.character_name} • {entry.coins_collected} coins
                {entry.combo_max > 0 && ` • ${entry.combo_max}x combo`}
              </div>
            </div>

            <div className="flex-shrink-0 text-right">
              <div className="text-yellow-300 font-bold text-lg">
                {entry.points.toLocaleString()}
              </div>
              <div className="text-white text-xs opacity-75">
                {entry.completion_time.toFixed(1)}s
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
