'use client';

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-orange-300 flex flex-col items-center justify-start p-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-7xl font-[family-name:var(--font-bungee)] text-white mb-4 drop-shadow-lg">
          Newsletter Enthusiast
        </h1>
        <p className="text-3xl text-white drop-shadow font-bold">Deliver them all!</p>
      </div>

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

      <div className="w-full max-w-4xl">
        <Leaderboard entries={topScores} />
      </div>
    </div>
  );
}
