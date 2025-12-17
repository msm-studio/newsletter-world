'use client';

import { useEffect, useRef } from 'react';
import { PhysicsWorld } from '@/game/physics';
import { InputManager } from '@/game/input';
import { LevelManager } from '@/game/levels';
import { getAudioManager } from '@/game/audio';
import { Character, Level } from '@/db/supabase';

interface CanvasProps {
  width: number;
  height: number;
  character: Character;
  level: Level;
  isMobile?: boolean;
  onLevelComplete: (
    time: number,
    deaths: number,
    score: number,
    coinsCollected: number,
    totalCoins: number,
    maxCombo: number
  ) => void;
  onLevelFailed: () => void;
  onGameUpdate?: (
    score: number,
    coinsCollected: number,
    totalCoins: number,
    currentCombo: number
  ) => void;
  onInputManagerReady?: (inputManager: InputManager) => void;
}

export default function Canvas({
  width,
  height,
  character,
  level,
  isMobile = false,
  onLevelComplete,
  onLevelFailed,
  onGameUpdate,
  onInputManagerReady,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const physicsWorldRef = useRef<PhysicsWorld | undefined>(undefined);
  const inputManagerRef = useRef<InputManager | undefined>(undefined);
  const levelManagerRef = useRef<LevelManager | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const isRespawningRef = useRef<boolean>(false);
  const onGameUpdateRef = useRef(onGameUpdate);
  const onLevelCompleteRef = useRef(onLevelComplete);
  const onLevelFailedRef = useRef(onLevelFailed);

  // Keep the refs updated with the latest callbacks
  useEffect(() => {
    onGameUpdateRef.current = onGameUpdate;
  }, [onGameUpdate]);

  useEffect(() => {
    onLevelCompleteRef.current = onLevelComplete;
  }, [onLevelComplete]);

  useEffect(() => {
    onLevelFailedRef.current = onLevelFailed;
  }, [onLevelFailed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    // Initialize game systems
    const init = async () => {
      // Initialize physics
      const physicsWorld = new PhysicsWorld();
      await physicsWorld.initialize();
      physicsWorldRef.current = physicsWorld;

      // Initialize audio (requires user interaction)
      const audioManager = getAudioManager();
      audioManager.initialize();

      // Initialize input
      const inputManager = new InputManager();
      inputManagerRef.current = inputManager;

      // Notify parent that input manager is ready
      if (onInputManagerReady) {
        onInputManagerReady(inputManager);
      }

      // Initialize level
      const levelManager = new LevelManager(physicsWorld, audioManager);
      levelManagerRef.current = levelManager;

      const gameLevel = levelManager.loadLevel(level);
      gameLevel.setMobileMode(isMobile, width, height);
      gameLevel.spawnPlayer(character);

      // Start game loop
      lastTimeRef.current = performance.now();
      gameLoop(performance.now());
    };

    // Game loop with delta time
    const gameLoop = (currentTime: number) => {
      if (!isRunning) return;

      const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = currentTime;

      const currentLevel = levelManagerRef.current?.getCurrentLevel();
      if (currentLevel && inputManagerRef.current) {
        // Update game logic
        currentLevel.update(deltaTime, inputManagerRef.current);

        // Step physics
        physicsWorldRef.current?.step(deltaTime);

        // Update parent component with current game state
        if (onGameUpdateRef.current) {
          onGameUpdateRef.current(
            currentLevel.getScore(),
            currentLevel.getCoinsCollected(),
            currentLevel.getTotalCoins(),
            currentLevel.getCurrentCombo()
          );
        }

        // Check win/lose conditions
        if (currentLevel.isLevelComplete()) {
          onLevelCompleteRef.current(
            currentLevel.getCompletionTime(),
            currentLevel.getDeaths(),
            currentLevel.getScore(),
            currentLevel.getCoinsCollected(),
            currentLevel.getTotalCoins(),
            currentLevel.getMaxCombo()
          );
          isRunning = false;
          return;
        }

        if (currentLevel.isLevelFailed() && !isRespawningRef.current) {
          isRespawningRef.current = true;
          onLevelFailedRef.current();
          // Respawn after a short delay
          setTimeout(() => {
            currentLevel.respawn(character);
            isRespawningRef.current = false;
          }, 500);
        }
      }

      // Render
      ctx.clearRect(0, 0, width, height);
      currentLevel?.render(ctx, width, height);

      // Continue loop
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    init();

    // Cleanup
    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      inputManagerRef.current?.cleanup();
      levelManagerRef.current?.unloadLevel();
    };
  }, [character, level, width, height, isMobile]);

  return (
    <div className={isMobile ? "w-full h-full" : "w-full max-w-[1400px] mx-auto"}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={isMobile
          ? "w-full h-full"
          : "border-4 border-gray-800 rounded-lg shadow-lg w-full h-auto"
        }
        tabIndex={0}
        onClick={(e) => e.currentTarget.focus()}
        style={{ outline: 'none', display: 'block' }}
      />
    </div>
  );
}
