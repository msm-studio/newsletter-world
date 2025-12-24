'use client';

import { useState } from 'react';
import { Character, LeaderboardEntry, Level } from '@/db/supabase';
import Leaderboard from './Leaderboard';

interface CharacterSelectProps {
  characters: Character[];
  topScores: LeaderboardEntry[];
  onSelect: (character: Character) => void;
  levels: Level[];
  selectedLevelIndex: number;
  unlockedLevelIndex: number;
  onLevelSelect: (index: number) => void;
  isDevMode: boolean;
}

const characterColors: Record<string, string> = {
  'Transactional Turtle': 'bg-green-600 hover:bg-green-700',
  'Postmaster Pig': 'bg-pink-400 hover:bg-pink-500',
  'Letter Lemur': 'bg-amber-700 hover:bg-amber-800',
  'Deliverability Dog': 'bg-orange-400 hover:bg-orange-500',
};

const characterEmojis: Record<string, string> = {
  'Transactional Turtle': '🐢',
  'Postmaster Pig': '🐷',
  'Letter Lemur': '🐵',
  'Deliverability Dog': '🐶',
};

export default function CharacterSelect({
  characters,
  topScores,
  onSelect,
  levels,
  selectedLevelIndex,
  unlockedLevelIndex,
  onLevelSelect,
  isDevMode,
}: CharacterSelectProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-orange-300 flex flex-col items-center justify-start p-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-7xl font-[family-name:var(--font-bungee)] text-white mb-4 drop-shadow-lg">
          Newsletter Enthusiast
        </h1>
        <p className="text-3xl text-white drop-shadow font-bold">Deliver them all!</p>
      </div>

      <h2 className="text-3xl font-bold text-white mb-6 text-center drop-shadow-lg">
        Select Your Character
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mb-8">
        {characters.map((character) => (
          <button
            key={character.id}
            onClick={() => onSelect(character)}
            className={`${
              characterColors[character.name] || 'bg-gray-600 hover:bg-gray-700'
            } text-white rounded-2xl p-8 shadow-2xl transform transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-4 min-w-[200px]`}
          >
            <div className="text-7xl mb-2">{characterEmojis[character.name] || '🦔'}</div>
            <h2 className="text-3xl font-bold">{character.name}</h2>
            <p className="text-sm opacity-90 text-center">{character.description}</p>
          </button>
        ))}
      </div>

      {/* Level Selector (Testing Mode) */}
      {levels.length > 0 && (
        <div className="mb-8 bg-gray-800 bg-opacity-90 backdrop-blur rounded-2xl p-6 max-w-2xl border-2 border-yellow-400">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
            Select Level
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {levels.map((level, index) => (
              <button
                key={level.id}
                onClick={() => onLevelSelect(index)}
                className={`p-4 rounded-lg font-bold transition-all transform hover:scale-105 ${
                  index === selectedLevelIndex
                    ? 'bg-yellow-500 text-gray-900 shadow-lg scale-105'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                <div className="text-lg">Level {index + 1}</div>
                <div className="text-base">{level.name}</div>
                <div className="text-sm opacity-80 capitalize">{level.theme}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setShowLeaderboard(true)}
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-full shadow-2xl transform transition-all hover:scale-105 active:scale-95 mb-8"
      >
        🏆 View Leaderboard
      </button>

      {/* Social Sharing */}
      <div className="text-center">
        <p className="text-white text-xl mb-4 font-semibold">
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

      {showLeaderboard && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLeaderboard(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Leaderboard entries={topScores} />
            <button
              onClick={() => setShowLeaderboard(false)}
              className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
