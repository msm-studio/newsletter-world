'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { InputManager } from '@/game/input';
import { getAudioManager } from '@/game/audio';

interface MobileTouchControlsProps {
  inputManager: InputManager;
  lives?: number;
  levelTheme?: string;
  onQuit?: () => void;
}

export default function MobileTouchControls({ inputManager, lives = 5, levelTheme, onQuit }: MobileTouchControlsProps) {
  const [isActive, setIsActive] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | 'none'>('right');
  const touchStartX = useRef<number | null>(null);
  const lastTouchX = useRef<number | null>(null);
  const prevLives = useRef(lives);

  // Reset on respawn (when lives decreases)
  useEffect(() => {
    if (lives < prevLives.current) {
      setHasStarted(false);
      setDirection('right');
      inputManager.setLeft(false);
      inputManager.setRight(false);
    }
    prevLives.current = lives;
  }, [lives, inputManager]);

  // Detect mobile device (stays active regardless of orientation)
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileSize = Math.min(window.innerWidth, window.innerHeight) < 768;
      setIsActive(isTouchDevice && isMobileSize);
    };

    checkMobile();
  }, []);

  // Update movement based on direction
  useEffect(() => {
    if (isActive && hasStarted) {
      if (direction === 'right') {
        inputManager.setRight(true);
        inputManager.setLeft(false);
      } else if (direction === 'left') {
        inputManager.setLeft(true);
        inputManager.setRight(false);
      } else {
        inputManager.setLeft(false);
        inputManager.setRight(false);
      }
    } else {
      inputManager.setLeft(false);
      inputManager.setRight(false);
    }
  }, [isActive, hasStarted, direction, inputManager]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    lastTouchX.current = touch.clientX;

    if (!hasStarted) {
      setHasStarted(true);
      // Initialize audio muted - user must tap unmute button to enable
      const audioManager = getAudioManager();
      audioManager.initializeForMobile();
    }
    inputManager.setJump(true);
  }, [inputManager, hasStarted, levelTheme]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (touchStartX.current === null || !hasStarted) return;

    const touch = e.touches[0];
    const currentX = touch.clientX;
    const deltaX = currentX - (lastTouchX.current || touchStartX.current);

    // Threshold for direction change (pixels)
    const threshold = 10;

    if (deltaX > threshold) {
      setDirection('right');
      lastTouchX.current = currentX;
    } else if (deltaX < -threshold) {
      setDirection('left');
      lastTouchX.current = currentX;
    }
  }, [hasStarted]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    inputManager.setJump(false);
    touchStartX.current = null;
    lastTouchX.current = null;
  }, [inputManager]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!hasStarted) {
      setHasStarted(true);
    }
    inputManager.setJump(true);
  }, [inputManager, hasStarted]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    inputManager.setJump(false);
  }, [inputManager]);

  if (!isActive) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 select-none"
      style={{
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Show "Tap to start/continue" when paused */}
      {!hasStarted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 rounded-2xl px-8 py-6 text-white text-center">
            <div className="text-4xl mb-2">👆</div>
            <div className="text-xl font-bold">
              {lives < 5 ? 'Tap to Continue' : 'Tap to Start'}
            </div>
            <div className="text-sm opacity-75 mt-1">Tap to jump • Swipe to change direction</div>
          </div>
        </div>
      )}

      {/* Quit button - bottom right */}
      {onQuit && (
        <button
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            onQuit();
          }}
          className="absolute bottom-4 right-4 bg-black/60 active:bg-black/80 text-white px-3 py-2 rounded-lg text-xs"
        >
          ✕ Quit
        </button>
      )}
    </div>
  );
}
