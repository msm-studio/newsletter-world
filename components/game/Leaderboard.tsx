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

  const shareUrl = 'https://newsletter-world.vercel.app';
  const shareText = 'Check out Newsletter Enthusiast - a fun platformer game where you collect emails!';

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnX = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-md w-full border-2 border-yellow-400">
      <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
        🏆 Top Scores
      </h2>

      <div className="space-y-3 mb-6">
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

      {/* Social Sharing */}
      <div className="border-t border-yellow-400 border-opacity-30 pt-6">
        <p className="text-white text-center mb-4 font-semibold">
          Share with a fellow newsletter enthusiast! 💌
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={shareOnFacebook}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
          <button
            onClick={shareOnLinkedIn}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </button>
          <button
            onClick={shareOnX}
            className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X
          </button>
        </div>
      </div>
    </div>
  );
}
