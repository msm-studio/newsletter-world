'use client';

import { Character, Level } from '@/db/supabase';
import { useState, useEffect } from 'react';
import { getAudioManager } from '@/game/audio';

// Character emoji mapping for lives display
const characterLivesEmoji: Record<string, string> = {
  Turtle: '🐢',
  Pig: '🐷',
  Lemur: '🐵',
  Pomeranian: '🐶',
};

interface GameUIProps {
  character: Character;
  level: Level;
  lives: number;
  score: number;
  coinsCollected: number;
  totalCoins: number;
  currentCombo: number;
  isMobile?: boolean;
  onQuit?: () => void;
}

export function GameUI({ character, level, lives, score, coinsCollected, totalCoins, currentCombo, isMobile = false, onQuit }: GameUIProps) {
  // Check AudioManager's actual mute state (respects user's previous choice)
  const [isMuted, setIsMuted] = useState(() => {
    if (isMobile) {
      const savedMute = localStorage.getItem('newsletter-world-muted');
      if (savedMute === 'false') {
        return false;
      }
      return true;
    }
    const audioManager = getAudioManager();
    return audioManager.getMuted();
  });

  const toggleMute = () => {
    const audioManager = getAudioManager();
    const theme = level.theme.toLowerCase();

    if (isMobile) {
      if (isMuted) {
        audioManager.unmuteAndPlay(theme);
        setIsMuted(false);
      } else {
        audioManager.muteAndStop();
        setIsMuted(true);
      }
    } else {
      const newMuted = audioManager.toggleMute(theme);
      setIsMuted(newMuted);
    }
  };

  // Generate lives display using character icons (empty space for lost lives)
  const emoji = characterLivesEmoji[character.name] || '❤️';
  const livesDisplay = emoji.repeat(lives);

  // Arcade-style UI - same for mobile and desktop, just different sizes
  const textSize = isMobile ? 'text-xs' : 'text-sm';
  const padding = isMobile ? 'px-2 py-1' : 'px-3 py-1.5';
  const gap = isMobile ? 'gap-3' : 'gap-6';

  return (
    <>
      {/* Top bar - Level, Score, Lives */}
      <div className={`absolute top-2 left-2 right-2 flex justify-between items-center pointer-events-none select-none z-50 ${textSize}`}>
        {/* Left side: Level and Score */}
        <div className={`bg-black/60 text-white ${padding} rounded-lg flex items-center ${gap} font-mono`}>
          <span className="text-cyan-400">{level.name}</span>
          <span className="text-yellow-300">{score.toLocaleString()}</span>
        </div>

        {/* Center: Bonus indicator (only shows when combo >= 2) */}
        {currentCombo >= 2 && (
          <div className={`bg-orange-500/90 text-white ${padding} rounded-lg font-bold animate-pulse`}>
            BONUS x{currentCombo}!
          </div>
        )}

        {/* Right side: Lives and Mute */}
        <div className="flex items-center gap-2">
          <div className={`bg-black/60 text-white ${padding} rounded-lg font-mono`}>
            {livesDisplay}
          </div>
          <button
            onClick={toggleMute}
            className={`bg-black/60 hover:bg-black/80 text-white ${padding} rounded-lg pointer-events-auto transition-colors`}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>
    </>
  );
}

interface WinScreenProps {
  character: Character;
  level: Level;
  completionTime: number;
  lives: number;
  score: number;
  coinsCollected: number;
  totalCoins: number;
  maxCombo: number;
  onRestart: () => void;
  onMainMenu: () => void;
  onSubmitScore?: (playerName: string) => void;
  onNextLevel?: () => void;
  hasNextLevel?: boolean;
}

export function WinScreen({
  character,
  level,
  completionTime,
  lives,
  score,
  coinsCollected,
  totalCoins,
  maxCombo,
  onRestart,
  onMainMenu,
  onSubmitScore,
  onNextLevel,
  hasNextLevel,
}: WinScreenProps) {
  const [playerName, setPlayerName] = useState('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  // Auto-advance disabled - user must click Next Level button
  // useEffect(() => {
  //   if (hasNextLevel && onNextLevel) {
  //     console.log('Setting up auto-advance timer for 2 seconds');
  //     const timer = setTimeout(() => {
  //       console.log('Auto-advancing to next level');
  //       onNextLevel();
  //     }, 2000);
  //     return () => {
  //       console.log('Cleaning up timer');
  //       clearTimeout(timer);
  //     };
  //   }
  // }, [hasNextLevel, onNextLevel]);

  const handleSubmit = () => {
    if (playerName.trim() && onSubmitScore) {
      onSubmitScore(playerName.trim());
      setScoreSubmitted(true);
    }
  };

  const isPerfectCollection = coinsCollected === totalCoins && totalCoins > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-yellow-400 to-orange-500 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Level Complete!
          </h1>
          <p className="text-2xl text-white mb-6">{level.name}</p>

          <div className="bg-orange-900 bg-opacity-60 rounded-lg p-6 mb-6 space-y-3 border-2 border-yellow-300">
            <div className="flex justify-between text-white text-lg">
              <span>Character:</span>
              <span className="font-bold">{character.name}</span>
            </div>
            <div className="flex justify-between text-white text-lg">
              <span>Time:</span>
              <span className="font-bold">{completionTime.toFixed(2)}s</span>
            </div>
            <div className="flex justify-between text-white text-lg">
              <span>Lives Remaining:</span>
              <span className="font-bold">{(characterLivesEmoji[character.name] || '❤️').repeat(lives)}</span>
            </div>
            <div className="border-t border-yellow-300 border-opacity-50 my-3"></div>
            <div className="flex justify-between text-white text-xl">
              <span className="font-bold">Final Score:</span>
              <span className="font-bold text-yellow-300">{score}</span>
            </div>
            <div className="flex justify-between text-white text-lg">
              <span>Coins Collected:</span>
              <span className={isPerfectCollection ? 'font-bold text-yellow-300' : 'font-bold'}>
                {coinsCollected}/{totalCoins} {isPerfectCollection && '🎉'}
              </span>
            </div>
            <div className="flex justify-between text-white text-lg">
              <span>Max Combo:</span>
              <span className="font-bold">{maxCombo}x</span>
            </div>
            {isPerfectCollection && (
              <div className="text-yellow-300 font-bold text-sm animate-pulse">
                +5000 Perfect Collection Bonus!
              </div>
            )}
          </div>


          {scoreSubmitted && (
            <p className="text-white mb-4">Score submitted! Thanks for playing!</p>
          )}

          {!scoreSubmitted && onSubmitScore && (
            <div className="mb-6">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 rounded-lg mb-2 text-gray-800"
                maxLength={20}
              />
              <button
                onClick={handleSubmit}
                disabled={!playerName.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Submit Score
              </button>
            </div>
          )}

          <div className="space-y-3">
            {hasNextLevel && onNextLevel && (
              <button
                onClick={onNextLevel}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
              >
                Next Level ➜
              </button>
            )}
            <button
              onClick={onRestart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Play Again
            </button>
            <button
              onClick={onMainMenu}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LoseScreenProps {
  onRespawn: () => void;
}

export function LoseScreen({ onRespawn }: LoseScreenProps) {
  return (
    <div className="fixed inset-0 bg-red-900 bg-opacity-50 flex items-center justify-center z-40 pointer-events-none">
      <div className="text-6xl font-bold text-white drop-shadow-lg animate-pulse">
        Ouch!
      </div>
    </div>
  );
}

interface GameOverScreenProps {
  character: Character;
  level: Level;
  score: number;
  onRestart: () => void;
  onRestartGame: () => void;
  onMainMenu: () => void;
  isFirstLevel?: boolean;
}

export function GameOverScreen({
  character,
  level,
  score,
  onRestart,
  onRestartGame,
  onMainMenu,
  isFirstLevel = false,
}: GameOverScreenProps) {
  const emoji = characterLivesEmoji[character.name] || '💀';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-red-600 to-red-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">{emoji}</div>
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Game Over
          </h1>
          <p className="text-xl text-white mb-6 opacity-80">
            {level.name}
          </p>

          <div className="bg-black bg-opacity-40 rounded-lg p-4 mb-6 border border-red-400">
            <div className="flex justify-between text-white text-lg mb-2">
              <span>Character:</span>
              <span className="font-bold">{character.name}</span>
            </div>
            <div className="flex justify-between text-white text-lg">
              <span>Final Score:</span>
              <span className="font-bold text-yellow-300">{score.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onRestart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Try Again
            </button>
            {!isFirstLevel && (
              <button
                onClick={onRestartGame}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Restart Game
              </button>
            )}
            <button
              onClick={onMainMenu}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
