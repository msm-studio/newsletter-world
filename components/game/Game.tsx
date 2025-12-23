'use client';

import { useState, useEffect, useCallback } from 'react';
import { Character, Level, LeaderboardEntry, getCharacters, getLevels, getTopScores, submitScore, submitLead } from '@/db/supabase';
import { InputManager } from '@/game/input';
import { getAudioManager } from '@/game/audio';
import CharacterSelect from './CharacterSelect';
import Canvas from './Canvas';
import TouchControls from './TouchControls';
import MobileTouchControls from './MobileTouchControls';
import { GameUI, WinScreen, GameOverScreen } from './UI';
import EmailGate from './EmailGate';

export default function Game() {
  const [gameState, setGameState] = useState<'loading' | 'character-select' | 'playing' | 'win' | 'email-gate' | 'gameover'>(
    'loading'
  );
  const [characters, setCharacters] = useState<Character[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [topScores, setTopScores] = useState<LeaderboardEntry[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [lives, setLives] = useState(5);
  const [completionTime, setCompletionTime] = useState(0);
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [currentCombo, setCurrentCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [baseScore, setBaseScore] = useState(0); // Accumulated score from previous levels
  const [inputManager, setInputManager] = useState<InputManager | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [totalCoinsCollected, setTotalCoinsCollected] = useState(0); // Total coins across all levels
  const [allCoinsCollected, setAllCoinsCollected] = useState(false); // Track if all coins in game collected
  const [unlockedLevelIndex, setUnlockedLevelIndex] = useState(() => {
    // Load from localStorage on initial mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('newsletter-world-unlocked-level');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(() => {
    // Load from localStorage on initial mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('newsletter-world-selected-level');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [emailSubmitted, setEmailSubmitted] = useState(() => {
    // Load from localStorage on initial mount
    if (typeof window !== 'undefined') {
      return localStorage.getItem('newsletter-world-email-submitted') === 'true';
    }
    return false;
  });
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

  // Save unlocked level to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('newsletter-world-unlocked-level', unlockedLevelIndex.toString());
    }
  }, [unlockedLevelIndex]);

  // Save selected level to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('newsletter-world-selected-level', selectedLevelIndex.toString());
    }
  }, [selectedLevelIndex]);

  useEffect(() => {
    loadGameData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect mobile device and track window size (stays in mobile mode regardless of orientation)
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      // Use the smaller dimension to detect mobile (works in both orientations)
      const isMobileSize = Math.min(window.innerWidth, window.innerHeight) < 768;
      setIsMobile(isTouchDevice && isMobileSize);
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Start/stop music based on game state
  useEffect(() => {
    const audioManager = getAudioManager();

    if (gameState === 'playing' && currentLevel) {
      const theme = currentLevel.theme.toLowerCase();

      if (isMobile) {
        // On mobile, only auto-start if user has previously unmuted
        const savedMute = localStorage.getItem('newsletter-world-muted');
        if (savedMute === 'false') {
          audioManager.unmuteAndPlay(theme);
        }
      } else {
        // Desktop: always start music
        audioManager.playMusic(theme);
      }
    } else if (gameState !== 'playing') {
      audioManager.stopMusic();
    }

    return () => {
      if (!isMobile) {
        audioManager.stopMusic();
      }
    };
  }, [gameState, currentLevel, isMobile]);

  const loadGameData = async () => {
    try {
      const [charactersData, levelsData, topScoresData] = await Promise.all([
        getCharacters(),
        getLevels(),
        getTopScores(5),
      ]);

      if (!charactersData || charactersData.length === 0) {
        throw new Error('No characters found in database. Please check your database setup.');
      }

      if (!levelsData || levelsData.length === 0) {
        throw new Error('No levels found in database. Please check your database setup.');
      }

      setCharacters(charactersData);
      setLevels(levelsData);
      setTopScores(topScoresData);

      // In dev mode, unlock all levels. In production, use saved progress or start at level 1
      if (isDevMode) {
        setUnlockedLevelIndex(levelsData.length - 1);
      }
      // Don't reset unlocked level in production - it's loaded from localStorage

      // Set current level based on saved selection
      // Use functional update to get the current selectedLevelIndex
      setCurrentLevel((prevLevel) => {
        const savedIndex = typeof window !== 'undefined'
          ? parseInt(localStorage.getItem('newsletter-world-selected-level') || '0', 10)
          : 0;
        return levelsData[savedIndex] || levelsData[0];
      });

      setGameState('character-select');
    } catch (error) {
      console.error('Failed to load game data:', error);
      // Show error state instead of crashing
      alert('Failed to load game data. Please check your internet connection and refresh the page.');
    }
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    setLives(5); // Start with 5 lives
    setScore(0);
    setBaseScore(0); // Reset base score for new run
    setCoinsCollected(0);
    setTotalCoins(0);
    setCurrentCombo(0);
    setMaxCombo(0);
    setTotalCoinsCollected(0); // Reset total coins for new run
    setAllCoinsCollected(false); // Reset all coins bonus flag
    setGameState('playing');
  };

  const handleLevelComplete = (
    time: number,
    _deathCount: number, // Not used - we track lives at Game level
    finalScore: number,
    coins: number,
    total: number,
    combo: number
  ) => {
    setCompletionTime(time);

    // Check if all coins in this level were collected
    const perfectLevel = coins === total && total > 0;
    const levelBonus = perfectLevel ? 5000 : 0;

    // Track total coins collected across all levels
    const newTotalCoinsCollected = totalCoinsCollected + coins;
    setTotalCoinsCollected(newTotalCoinsCollected);

    // Calculate total coins available across all levels
    const totalCoinsInGame = levels.reduce((sum, level) => {
      return sum + (level.layout.collectibles?.length || 0);
    }, 0);

    // Award 25,000 bonus if all coins in all levels are collected
    let allCoinsBonus = 0;
    if (!allCoinsCollected && newTotalCoinsCollected === totalCoinsInGame) {
      allCoinsBonus = 25000;
      setAllCoinsCollected(true);
    }

    // Add base score + level score + level bonus + all coins bonus
    setScore(baseScore + finalScore + levelBonus + allCoinsBonus);
    setCoinsCollected(coins);
    setTotalCoins(total);
    setMaxCombo(combo);
    setGameState('win');
  };

  const handleGameUpdate = (
    currentScore: number,
    coins: number,
    total: number,
    combo: number
  ) => {
    // Add the current level's score to the base score from previous levels
    setScore(baseScore + currentScore);
    setCoinsCollected(coins);
    setTotalCoins(total);
    setCurrentCombo(combo);
  };

  const handleLevelFailed = () => {
    const audioManager = getAudioManager();

    setLives((prevLives) => {
      const newLives = Math.max(0, prevLives - 1);
      if (newLives === 0) {
        // Play game over sound (extended sad melody)
        audioManager.playGameOver();
        // Trigger game over after a delay to let death animation play
        setTimeout(() => {
          setGameState('gameover');
        }, 500);
      } else {
        // Play death sound (light-hearted boing)
        audioManager.playDeath();
      }
      return newLives;
    });
  };

  const handleGameOverRestart = () => {
    // Reset lives and restart the current level from scratch
    setLives(5);
    setBaseScore(0);
    setCoinsCollected(0);
    setTotalCoins(0);
    setCurrentCombo(0);
    setMaxCombo(0);
    setTotalCoinsCollected(0);
    setAllCoinsCollected(false);
    setGameState('playing');
  };

  const handleRestartGame = () => {
    // Reset everything and go back to Level 1
    setLives(5);
    setBaseScore(0);
    setScore(0);
    setCoinsCollected(0);
    setTotalCoins(0);
    setCurrentCombo(0);
    setMaxCombo(0);
    setTotalCoinsCollected(0);
    setAllCoinsCollected(false);
    setSelectedLevelIndex(0);
    setCurrentLevel(levels[0]);
    setGameState('playing');
  };

  const handleRestart = () => {
    // Keep lives as they are - player continues with remaining lives
    // Keep baseScore intact - we're just replaying the current level
    setCoinsCollected(0);
    setTotalCoins(0);
    setCurrentCombo(0);
    setMaxCombo(0);
    setGameState('playing');
  };

  const handleMainMenu = useCallback(async () => {
    setSelectedCharacter(null);
    setLives(5); // Reset lives when returning to main menu
    setBaseScore(0); // Reset base score when returning to main menu
    setTotalCoinsCollected(0); // Reset total coins collected
    setAllCoinsCollected(false); // Reset all coins bonus flag
    // Reload leaderboard to show any new scores
    try {
      const topScoresData = await getTopScores(5);
      setTopScores(topScoresData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      // Continue to character select even if leaderboard fails
    }
    setGameState('character-select');
  }, []);

  // Q key to quit on desktop
  useEffect(() => {
    if (isMobile || gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'q' || e.key === 'Q') {
        handleMainMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, gameState, handleMainMenu]);

  const handleLevelSelect = (levelIndex: number) => {
    if (levelIndex < levels.length) {
      setSelectedLevelIndex(levelIndex);
      setCurrentLevel(levels[levelIndex]);
      // For testing: unlock up to the selected level
      if (levelIndex > unlockedLevelIndex) {
        setUnlockedLevelIndex(levelIndex);
      }
    }
  };

  const handleNextLevel = useCallback(async () => {
    // Save current score as the base score for the next level
    setBaseScore(score);

    // Unlock next level if in production mode and player just beat their current max
    if (!isDevMode && selectedLevelIndex === unlockedLevelIndex && selectedLevelIndex < levels.length - 1) {
      setUnlockedLevelIndex(unlockedLevelIndex + 1);
    }

    // Move to next level (stay on last level if already there)
    const nextIndex = selectedLevelIndex < levels.length - 1 ? selectedLevelIndex + 1 : selectedLevelIndex;
    setSelectedLevelIndex(nextIndex);
    setCurrentLevel(levels[nextIndex]);

    // Reset per-level stats only
    // Score and deaths accumulate across levels (score via baseScore)
    setCoinsCollected(0);
    setTotalCoins(0);
    setCurrentCombo(0);
    setMaxCombo(0);

    // Reload leaderboard
    try {
      const topScoresData = await getTopScores(5);
      setTopScores(topScoresData);
    } catch (error) {
      console.error('Failed to reload leaderboard:', error);
      // Continue to next level even if leaderboard reload fails
    }

    // Show email gate after Level 1 if not already submitted (and not in dev mode)
    if (selectedLevelIndex === 0 && !emailSubmitted && !isDevMode) {
      setGameState('email-gate');
    } else {
      // Go directly to playing the next level with the same character
      setGameState('playing');
    }
  }, [isDevMode, selectedLevelIndex, unlockedLevelIndex, levels, score, emailSubmitted]);

  const handleSubmitScore = async (playerName: string) => {
    if (selectedCharacter && currentLevel) {
      try {
        const deaths = 5 - lives; // Calculate deaths from remaining lives
        const success = await submitScore(
          playerName,
          selectedCharacter.name,
          currentLevel.id,
          completionTime,
          deaths,
          score,
          coinsCollected,
          maxCombo
        );
        if (!success) {
          console.error('Failed to submit score to leaderboard');
          alert('Failed to submit score. Your score was not saved to the leaderboard.');
        }
      } catch (error) {
        console.error('Error submitting score:', error);
        alert('Failed to submit score. Please check your internet connection.');
      }
    }
  };

  // Submit lead to webhook (Zapier, etc.)
  const submitLeadToWebhook = async (name: string, email: string) => {
    const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('Webhook URL not configured - skipping lead submission');
      return;
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          source: 'Newsletter Enthusiast',
          level_completed: 1,
          character: selectedCharacter?.name,
          score: score,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to submit lead to webhook:', error);
      // Don't throw - we still want to unlock the game even if webhook fails
    }
  };

  // Handle email submission from the email gate
  const handleEmailSubmit = async (name: string, email: string) => {
    // Save to database (primary storage)
    const dbSuccess = await submitLead(
      name,
      email,
      selectedCharacter?.name || null,
      score,
      1, // Level completed
      'Newsletter Enthusiast'
    );

    // Also send to webhook if configured (for marketing automation)
    await submitLeadToWebhook(name, email);

    if (dbSuccess) {
      console.log('✅ Lead captured successfully');
    } else {
      console.warn('⚠️ Lead saved to webhook but database insert failed');
    }

    // Mark as submitted and continue to next level
    localStorage.setItem('newsletter-world-email-submitted', 'true');
    setEmailSubmitted(true);
    setGameState('playing');
  };

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 to-orange-300 flex items-center justify-center">
        <div className="text-4xl font-bold text-white">Loading Newsletter Enthusiast...</div>
      </div>
    );
  }

  if (gameState === 'character-select') {
    return (
      <CharacterSelect
        characters={characters}
        topScores={topScores}
        onSelect={handleCharacterSelect}
        levels={levels}
        selectedLevelIndex={selectedLevelIndex}
        unlockedLevelIndex={unlockedLevelIndex}
        onLevelSelect={handleLevelSelect}
        isDevMode={isDevMode}
      />
    );
  }

  if (gameState === 'playing' && selectedCharacter && currentLevel) {
    // Mobile mode: native portrait canvas, full screen
    if (isMobile && windowSize.width > 0) {
      // Use actual screen dimensions for portrait mode
      const canvasWidth = windowSize.width;
      const canvasHeight = windowSize.height;

      return (
        <div className="fixed inset-0 bg-gray-900 overflow-hidden">
          {/* Canvas fills the screen */}
          <Canvas
            width={canvasWidth}
            height={canvasHeight}
            character={selectedCharacter}
            level={currentLevel}
            isMobile={true}
            onLevelComplete={handleLevelComplete}
            onLevelFailed={handleLevelFailed}
            onGameUpdate={handleGameUpdate}
            onInputManagerReady={setInputManager}
          />
          {/* Touch controls overlay */}
          {inputManager && (
            <MobileTouchControls
              inputManager={inputManager}
              lives={lives}
              levelTheme={currentLevel.theme}
              onQuit={handleMainMenu}
            />
          )}
          {/* UI overlay */}
          <GameUI
            character={selectedCharacter}
            level={currentLevel}
            lives={lives}
            score={score}
            coinsCollected={coinsCollected}
            totalCoins={totalCoins}
            currentCombo={currentCombo}
            isMobile={true}
            onQuit={handleMainMenu}
          />
        </div>
      );
    }

    // Desktop mode: standard layout with UI inside canvas container
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 md:p-8">
        <div className="relative">
          <Canvas
            width={1400}
            height={600}
            character={selectedCharacter}
            level={currentLevel}
            onLevelComplete={handleLevelComplete}
            onLevelFailed={handleLevelFailed}
            onGameUpdate={handleGameUpdate}
            onInputManagerReady={setInputManager}
          />
          {inputManager && <TouchControls inputManager={inputManager} />}
          <GameUI
            character={selectedCharacter}
            level={currentLevel}
            lives={lives}
            score={score}
            coinsCollected={coinsCollected}
            totalCoins={totalCoins}
            currentCombo={currentCombo}
            onQuit={handleMainMenu}
          />
        </div>
      </div>
    );
  }

  if (gameState === 'win' && selectedCharacter && currentLevel) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <WinScreen
          character={selectedCharacter}
          level={currentLevel}
          completionTime={completionTime}
          lives={lives}
          score={score}
          coinsCollected={coinsCollected}
          totalCoins={totalCoins}
          maxCombo={maxCombo}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
          onSubmitScore={handleSubmitScore}
          onNextLevel={handleNextLevel}
          hasNextLevel={selectedLevelIndex < levels.length - 1 || isDevMode}
        />
      </div>
    );
  }

  if (gameState === 'email-gate' && selectedCharacter && currentLevel) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <EmailGate
          character={selectedCharacter}
          level={currentLevel}
          score={score}
          onSubmit={handleEmailSubmit}
        />
      </div>
    );
  }

  if (gameState === 'gameover' && selectedCharacter && currentLevel) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <GameOverScreen
          character={selectedCharacter}
          level={currentLevel}
          score={score}
          onRestart={handleGameOverRestart}
          onRestartGame={handleRestartGame}
          onMainMenu={handleMainMenu}
          isFirstLevel={selectedLevelIndex === 0}
        />
      </div>
    );
  }

  return null;
}
