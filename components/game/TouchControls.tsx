'use client';

import { useEffect, useState } from 'react';
import { InputManager } from '@/game/input';

interface TouchControlsProps {
  inputManager: InputManager;
}

export default function TouchControls({ inputManager }: TouchControlsProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch support
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  if (!isTouchDevice) {
    return null;
  }

  const handleLeftDown = (e: React.TouchEvent) => {
    e.preventDefault();
    inputManager.setLeft(true);
  };

  const handleLeftUp = (e: React.TouchEvent) => {
    e.preventDefault();
    inputManager.setLeft(false);
  };

  const handleRightDown = (e: React.TouchEvent) => {
    e.preventDefault();
    inputManager.setRight(true);
  };

  const handleRightUp = (e: React.TouchEvent) => {
    e.preventDefault();
    inputManager.setRight(false);
  };

  const handleJumpDown = (e: React.TouchEvent) => {
    e.preventDefault();
    inputManager.setJump(true);
  };

  const handleJumpUp = (e: React.TouchEvent) => {
    e.preventDefault();
    inputManager.setJump(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex justify-between items-end p-4 pb-8 pointer-events-auto">
        {/* Left side - Movement buttons */}
        <div className="flex gap-3">
          <button
            onTouchStart={handleLeftDown}
            onTouchEnd={handleLeftUp}
            onTouchCancel={handleLeftUp}
            className="w-20 h-20 bg-blue-600/80 hover:bg-blue-700/80 active:bg-blue-800/90 rounded-full flex items-center justify-center text-4xl shadow-lg transition-colors select-none border-4 border-blue-400/50"
            style={{ touchAction: 'none' }}
          >
            ⬅️
          </button>
          <button
            onTouchStart={handleRightDown}
            onTouchEnd={handleRightUp}
            onTouchCancel={handleRightUp}
            className="w-20 h-20 bg-blue-600/80 hover:bg-blue-700/80 active:bg-blue-800/90 rounded-full flex items-center justify-center text-4xl shadow-lg transition-colors select-none border-4 border-blue-400/50"
            style={{ touchAction: 'none' }}
          >
            ➡️
          </button>
        </div>

        {/* Right side - Jump button */}
        <button
          onTouchStart={handleJumpDown}
          onTouchEnd={handleJumpUp}
          onTouchCancel={handleJumpUp}
          className="w-24 h-24 bg-green-600/80 hover:bg-green-700/80 active:bg-green-800/90 rounded-full flex items-center justify-center text-5xl shadow-lg transition-colors select-none border-4 border-green-400/50"
          style={{ touchAction: 'none' }}
        >
          🦘
        </button>
      </div>
    </div>
  );
}
