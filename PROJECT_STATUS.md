# PROJECT_STATUS.md

## Overview
Turt World is a whimsical 2D platformer game built with Next.js and TypeScript. Players choose from 4 unique characters (Turtle, Pig, Lemur, Pomeranian), each with distinct physics properties, and navigate through 5 progressively challenging themed levels. The game features a coin collection system with combos, a leaderboard for competitive play, and a level progression system that unlocks new levels as players complete previous ones. Data is stored in Supabase (PostgreSQL) and the game is deployed on Vercel.

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Physics**: Custom manual physics engine (gravity, collision detection, platforming mechanics)
- **Database**: Supabase (PostgreSQL with JSONB for level layouts)
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel
- **Dependencies**: `@supabase/supabase-js`, `@dimforge/rapier2d-compat` (package included but not currently used)

### Directory Structure
```
turt-world/
├── app/                          # Next.js app router
│   ├── page.tsx                  # Main game page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── character-test/           # Character testing page
├── components/game/              # React game components
│   ├── Game.tsx                  # Main game state manager
│   ├── Canvas.tsx                # Game rendering and animation loop
│   ├── CharacterSelect.tsx       # Character selection UI
│   ├── UI.tsx                    # In-game UI and win screen
│   └── Leaderboard.tsx           # Leaderboard display
├── game/                         # Core game logic (TypeScript)
│   ├── physics.ts                # Custom physics engine
│   ├── entities.ts               # Player entity and game objects
│   ├── levels.ts                 # Level manager and rendering
│   ├── animation.ts              # Character animations
│   ├── camera.ts                 # Camera following logic
│   ├── input.ts                  # Keyboard input handling
│   └── audio.ts                  # Audio manager (Web Audio API)
├── db/                           # Database layer
│   ├── supabase.ts               # Supabase client and queries
│   └── schema.sql                # Database schema definition
└── [helper scripts]              # Various Node.js scripts for DB management
```

### Component Relationships
1. **Game.tsx** manages top-level state (character, level, score, progression)
2. **Canvas.tsx** handles the game loop, physics updates, and rendering
3. **Canvas** instantiates: PhysicsWorld → LevelManager → InputManager → Player Entity
4. Database queries run on mount and after level completion
5. LocalStorage persists unlocked levels and selected level between sessions

### Database Schema
- **characters**: id, name, speed, jump_force, mass, air_control, float_time, description
- **levels**: id, name, theme, order_index, layout (JSONB), unlocked_by_default
- **leaderboard**: id, player_name, character_name, level_id, completion_time, deaths, points, coins_collected, combo_max

## Current State

### ✅ Working Features
- **Character Selection**: 4 characters (Turtle, Pig, Lemur, Pomeranian) with unique physics (speed, jump force, mass, air control, float time)
- **5 Themed Levels** (in order):
  1. Arctic Adventure (arctic theme) - 30 coins, unlocked by default
  2. Sandy Scramble (desert theme) - 35 coins
  3. Jungle Jump (jungle theme) - 40 coins
  4. Seaside Sprint (seaside theme) - 45 coins
  5. Mountain Madness (mountain theme) - 50 coins
- **Level Progression**: Players unlock next level by completing the current level
- **Coin Collection System**: Collect coins for points with jump combo multipliers
- **Scoring System**:
  - Jump combos (2+ coins = 2x points, 3+ = 3x, etc.)
  - Perfect level bonus (5,000 points)
  - Perfect game bonus (25,000 points for all coins in all levels)
  - Score persists across levels
- **Audio System** (Procedural Web Audio API):
  - Unique background music for each level (different keys, modes, tempos)
  - Sound effects: jump, coin, combo, level complete, death (boing), game over (sad melody)
  - Mute/unmute button with localStorage persistence
- **Leaderboard**: Submit and view top scores across all levels
- **Physics**: Custom gravity, jumping, platforming, and collision detection
- **Camera**: Smooth following with boundaries
- **Character Animations**: Idle, walk, jump states with character-specific rendering
- **Hazards**: Level-specific procedurally varied hazards (icicles, cacti, piranhas, crabs, rocks)
- **UI**: Character select screen, arcade-style in-game HUD (inside canvas), win screen with stats
- **Lives System**: 5 lives per run, displayed as character emoji icons (e.g., 🐶🐶🐶)
- **Game Over System**: Game Over screen when all lives lost with Try Again, Restart Game, and Main Menu options
- **Quit Controls**: Q key on desktop, quit button on mobile (bottom-right)
- **Mobile Support**: Touch controls (tap to jump, swipe to change direction), muted by default with unmute button
- **LocalStorage Persistence**: Unlocked levels, selected level, and mute preference saved
- **Dev Mode**: Environment variable `NEXT_PUBLIC_DEV_MODE=true` unlocks all levels
- **Error Handling**: Error boundaries wrap components, database queries have try-catch blocks
- **Database Scripts**: Helper scripts organized in `scripts/` directory with environment variable support

### 🚧 In Progress
- None currently

### 📋 Planned/Potential Features
- Power-ups or special abilities
- Additional levels (more themes: Volcano, Space, Underwater)
- Mobile/touch controls optimization
- Multiplayer or time trial modes
- More character animations (hurt, celebration, landing squash)
- Particle effects for coins and combos
- Background parallax layers with more detail
- Level unlock sound effect

## Known Issues & Blockers

### Issues
- None currently

### Warnings/Technical Debt
- No automated tests (unit, integration, or E2E)
- Character animations are simple CSS-based (could be enhanced with sprite sheets)
- Rapier2D package installed but not used (could be removed to reduce bundle size)
- Mobile portrait mode not yet implemented (plan exists, current mobile uses landscape virtual buttons)

### Blockers
- None currently

## Recent Work
_Last updated: 2025-12-13 (Session 7)_

### Session 7: Game Over System, Death Sounds & Pomeranian Overhaul
**Date**: December 13, 2025

#### Overview
Added complete Game Over system with death/game over sounds, overhauled Pomeranian character to be the speedy/nimble option, and polished the Game Over screen UI.

#### Game Over System Implementation
**Files Modified**:
- `components/game/Game.tsx`:
  - Added `handleLevelFailed()` now plays death sound on lives 1-4, game over sound on final death
  - Added `handleRestartGame()` function - resets everything and returns to Level 1
  - Game Over screen conditionally shows "Restart Game" button only when not on Level 1
  - Added `isFirstLevel` prop to GameOverScreen

- `components/game/UI.tsx`:
  - Updated `GameOverScreenProps` interface with `isFirstLevel?: boolean` prop
  - "Restart Game" button only shows when `!isFirstLevel` (avoids redundancy with "Try Again")
  - Changed button text from "Restart Game (Level 1)" to just "Restart Game"

#### Death & Game Over Sound Effects
**Files Modified**:
- `game/audio.ts`:
  - Added `playDeath()` method - light-hearted cartoon "boing/bonk" sound
    - Descending triangle wave (400Hz → 100Hz, 0.3s)
    - Secondary sine wave overtone (600Hz → 200Hz, 0.2s)
    - Triggered on deaths 1-4 (when lives remain)
  - Added `playGameOver()` method - sad descending melody
    - Four-note descending melody: G4 → E4 → C4 → G3 (0.3s per note)
    - Triangle wave for softer, sadder tone
    - Final sustained low note (C3) fades out over 1.5s
    - Total duration: ~2.7 seconds
    - Triggered on final death (0 lives remaining)

#### Pomeranian Character Overhaul
**Problem**: Pomeranian had the worst stats (slowest: 2.5, lowest jump: 12) making it "lame to play".

**Solution**: Made Pomeranian the speedster/nimble character to match its energetic personality.

**Database Changes** (via script):
- `speed`: 2.5 → **5** (now fastest, was slowest)
- `jump_force`: 12 → **14** (bouncy, second-highest)
- `mass`: 1.2 → **0.8** (now lightest)
- `air_control`: 0.9 → **0.95** (now best air control)
- `float_time`: 0.3 → **0.4** (more fluffy float)
- `description`: Changed from character personality to gameplay description:
  - Old: "A fluffy cotton ball of joy! This adorable pup bounces through levels..."
  - New: "Fastest and lightest with nimble air control and fluffy float"

**Character Stats Comparison** (after changes):
| Character | Speed | Jump | Mass | Air Control | Float | Niche |
|-----------|-------|------|------|-------------|-------|-------|
| Pomeranian | **5** | 14 | **0.8** | **0.95** | **0.4** | Speedster/Nimble |
| Pig | 4.5 | 13 | 1.5 | 0.5 | 0 | Balanced/Fast |
| Lemur | 4 | **15** | 1 | 0.8 | 0 | High Jumper |
| Turtle | 3 | 13.2 | **2** | 0.85 | 0 | Heavy/Tanky |

#### Summary of Files Modified
1. **`game/audio.ts`** - Added `playDeath()` and `playGameOver()` methods
2. **`components/game/Game.tsx`** - Death sounds integration, `handleRestartGame()`, `isFirstLevel` prop
3. **`components/game/UI.tsx`** - `isFirstLevel` prop, conditional "Restart Game" button
4. **Database** - Pomeranian stats completely overhauled

#### Deployment
- Successfully deployed to Vercel production
- Production URL: https://turt-world.vercel.app

---

### Session 6: Character Replacement, UI Overhaul & Mobile Controls
**Date**: December 13, 2025

#### Overview
Major session replacing the Axolotl character with a Pomeranian, overhauling the UI/UX (lives system, arcade-style display, quit controls), and fixing mobile audio issues.

#### Character Replacement: Axolotl → Pomeranian
**Files Modified**:
- `game/animation.ts` - Replaced `drawAxolotl` with `drawPomeranian`
  - Created 4 variant designs for testing (FluffBall, FrontFace, TeddyBear, SimpleChonk)
  - Final choice: SimpleChonk - chunky oval body, small face, round ears, fluffy tail
  - Uses `Math.min(width, height)` as base size to prevent distortion
  - Features: gradient body, chest fluff, ears, sparkle eyes, button nose, W-shaped mouth, blush marks
- `components/game/CharacterSelect.tsx` - Updated character mappings:
  - `characterColors`: Added 'Pomeranian' → 'bg-orange-400 hover:bg-orange-500'
  - `characterEmojis`: Added 'Pomeranian' → '🐶'
- **Database**: Updated via script
  - Character name: 'Axolotl' → 'Pomeranian'
  - Description: "A fluffy cotton ball of joy! This adorable pup bounces through levels with endless enthusiasm and a wagging tail."
  - Physics unchanged (speed: 2.5, jump_force: 12, mass: 1.2, air_control: 0.9, float_time: 0.3)

#### Lives System (Replacing Deaths)
**Architectural Change**: Switched from tracking deaths (count up) to lives (count down from 5).

**Files Modified**:
- `components/game/Game.tsx`:
  - Changed `const [deaths, setDeaths] = useState(0)` to `const [lives, setLives] = useState(5)`
  - `handleCharacterSelect`: Now sets `lives = 5` instead of `deaths = 0`
  - `handleLevelFailed`: Now decrements lives (`setLives(l => Math.max(0, l - 1))`)
  - `handleSubmitScore`: Calculates `deaths = 5 - lives` for database compatibility
- `components/game/UI.tsx`:
  - Props changed from `deaths` to `lives`
  - Lives display shows character emoji icons (not hearts)
  - Lost lives show empty space (removed skull icons)
- `components/game/MobileTouchControls.tsx`:
  - Props changed from `deaths` to `lives`
  - "Tap to Continue" message shows when `lives < 5`

#### Lives Display with Character Icons
**Files Modified**:
- `components/game/UI.tsx`:
  - Added `characterLivesEmoji` mapping: Turtle→🐢, Pig→🐷, Lemur→🐵, Pomeranian→🐶
  - `GameUI` displays character emojis for remaining lives (e.g., "🐶🐶🐶" for 3 lives)
  - `WinScreen` also uses character emojis for "Lives Remaining" display
  - Lost lives show empty space (cleaner look than skulls)

#### Desktop UI Moved Inside Game Screen
**Problem**: On desktop, the UI (score, lives, etc.) was positioned outside the canvas area.

**Solution**: Wrapped canvas and UI in a relative container.

**Files Modified**:
- `components/game/Game.tsx`:
  - Desktop layout: Added `<div className="relative">` wrapper around Canvas and GameUI
  - UI now positions relative to canvas, not the full screen
  - Matches mobile behavior where UI overlays the game

#### Q Key to Quit (Desktop)
**Files Modified**:
- `components/game/Game.tsx`:
  - Added `useEffect` that listens for 'q' or 'Q' keydown events
  - Only active when `gameState === 'playing'` and not on mobile
  - Calls `handleMainMenu()` to return to character select
  - Properly placed after `handleMainMenu` definition to avoid initialization errors

#### Mobile Quit Button
**Problem**: Initial implementation in `UI.tsx` didn't work because `MobileTouchControls` captures all touch events with `fixed inset-0`.

**Solution**: Moved quit button inside `MobileTouchControls` with `stopPropagation`.

**Files Modified**:
- `components/game/MobileTouchControls.tsx`:
  - Added `onQuit?: () => void` prop
  - Added quit button in bottom-right corner
  - Uses `onTouchStart` and `onTouchEnd` with `stopPropagation()` to prevent game interaction
  - Button: "✕ Quit" with black/60 background
- `components/game/Game.tsx`:
  - Passes `onQuit={handleMainMenu}` to `MobileTouchControls`

#### Mobile Audio Fix
**Problem**: Music wasn't playing on mobile due to Web Audio API autoplay restrictions.

**Solution**: Mobile defaults to muted; user must tap unmute button to enable audio.

**Files Modified**:
- `game/audio.ts`:
  - Added `initializeForMobile()` - initializes AudioContext but doesn't start music
  - Added `unmuteAndPlay(theme)` - explicitly unmutes and starts music
  - Added `muteAndStop()` - mutes and stops music
  - `initializeForMobile()` only mutes if music isn't already playing (prevents re-muting on game start after user unmuted)
- `components/game/MobileTouchControls.tsx`:
  - First tap calls `audioManager.initializeForMobile()` instead of `playMusic()`
- `components/game/UI.tsx`:
  - Mobile toggle uses `unmuteAndPlay()` / `muteAndStop()` instead of `toggleMute()`
  - Checks localStorage for saved preference on mount
- `components/game/Game.tsx`:
  - Music effect checks localStorage before auto-starting on mobile

#### Combo System Bug Fix
**Problem**: Bonus system was counting coins across multiple jumps instead of per-jump.

**Root Cause**: `coinsThisJump` was reset on landing, but landing detection was unreliable.

**Solution**: Reset `coinsThisJump` when jump STARTS (in `onJump` callback).

**Files Modified**:
- `game/levels.ts`:
  - Moved `this.coinsThisJump = 0` from landing detection to `onJump` callback in `spawnPlayer()`
  - Jump callback now resets coin count before audio plays

#### Game Over Screen
**Files Modified**:
- `components/game/UI.tsx`:
  - Added `GameOverScreen` component with character emoji, score display, and buttons
  - Red gradient background (from-red-600 to-red-800)
  - Shows character name, final score
  - Buttons: "Try Again" (restart with fresh lives) and "Main Menu"
- `components/game/Game.tsx`:
  - Added 'gameover' to gameState type
  - `handleLevelFailed`: Now triggers 'gameover' state when lives reach 0 (with 500ms delay to show death)
  - Added `handleGameOverRestart`: Resets lives to 5, clears score, restarts level
  - Added GameOverScreen render section

#### Deployment
- Successfully deployed to Vercel production
- Production URL: https://turt-world-golq9l47g-ryan-sagers-projects.vercel.app
- Build error fixed: `deaths` variable undefined → calculated from `5 - lives`

#### Summary of All Files Modified
1. **`game/animation.ts`** - Pomeranian sprite (replaced Axolotl), removed variant code
2. **`game/audio.ts`** - Mobile audio methods (initializeForMobile, unmuteAndPlay, muteAndStop)
3. **`game/levels.ts`** - Combo reset fix (moved to onJump callback)
4. **`components/game/Game.tsx`** - Lives state, Q key quit, desktop UI wrapper, mobile audio, game over state
5. **`components/game/UI.tsx`** - Character emoji lives, arcade-style display, mobile audio toggle, GameOverScreen
6. **`components/game/MobileTouchControls.tsx`** - Lives prop, quit button, mobile audio init
7. **`components/game/CharacterSelect.tsx`** - Pomeranian color and emoji mappings
8. **Database** - Character name/description update

---

### Session 5: Level Polish & Visual Refinements
**Date**: December 11, 2025

#### Overview
Comprehensive visual polish pass through all 5 levels, fixing rendering issues, improving hazard/background aesthetics, and standardizing platform behavior across the game.

#### Arctic Adventure Fixes
**Water Ripples Added**:
- Added gentle animated ripples to foreground area at height 0.68
- Simple sine-wave animation creates subtle water movement effect
- File: `game/levels.ts` (lines ~358-378)

**Goal Flag Positioning Fixed**:
- Analyzed all 5 levels' goal positions to find consistent pattern
- Fixed formula: `this.y + this.height + 20` (goal bottom + 20px offset)
- Updated Arctic goal position in database from y=420 to y=380 to match pattern
- File: `game/entities.ts` (Goal render method)

#### Sandy Scramble (Desert) Fixes
**Buttes Redesigned**:
- Changed from rectangles to proper mesa shapes
- Removed horizontal lines, kept only vertical erosion scoring
- More authentic desert rock formation appearance

**Sun Made Hotter**:
- Added multiple gradient layers for heat glow effect
- More intense visual presence matching desert theme

**Platform Colors Fixed**:
- Standardized all platforms to "sand" type
- Script: `scripts/standardize-platform-types.js`

#### Jungle Jump Complete Redesign
**New Background Elements**:
- Better tropical tree rendering (more jungle-y appearance)
- Hanging vines added for atmosphere
- Removed old bizarre half-circle decorations

**Rushing River Added**:
- River rendered in world coordinates (not parallax background)
- Extended river width by +500 pixels to reach end of level
- River positioned in foreground layer
- File: `game/levels.ts` (lines ~1100-1145)

**Piranhas Introduced**:
- Changed hazard type from "thorn" to "piranha" in database
- New piranha rendering with animated tail and mouth
- Piranhas positioned in river (not on land)
- File: `game/entities.ts` (lines ~378-477)
- Script: `scripts/update-jungle-piranhas.js`

#### Seaside Sprint Fixes
**Hazards Extended**:
- Added more crab hazards to cover full level length
- Script: `scripts/extend-seaside-hazards.js`

**Platform Colors Fixed**:
- Standardized all platforms to "wood" type
- Script: `scripts/standardize-platform-types.js`

#### Mountain Madness Fixes
**Rock Hazards Simplified**:
- Old: Complex shapes that looked "like human figures in sheets"
- New: Simple triangular spikes with minor jagged variations
- Removed Math.random() sparkle effect (deterministic rendering)
- File: `game/entities.ts` (lines ~478-526)

#### Global Platform Improvements
**Alternating Colors System**:
- Added `index` parameter to LevelPlatform constructor
- All platform types now have light/dark variants based on index
- Platform types affected: ground, sand, ice, snow, wood, vine, stone
- File: `game/entities.ts` (LevelPlatform class)

**Platform Textures Removed**:
- Removed animated texture effects causing "buzzing" visual glitch
- Root cause: `Math.random()` in texture rendering caused different positions each frame
- Removed: sand dots, ice crystals, grass tufts, etc.
- Cleaner, more consistent platform appearance

#### Database Updates
- Arctic goal position: y=420 → y=380
- Jungle hazards: "thorn" → "piranha"
- Seaside hazards: Extended with additional crabs
- Sandy Scramble platforms: All standardized to "sand" type
- Seaside platforms: All standardized to "wood" type

#### Deployment
- Successfully deployed to Vercel production
- Production URL: https://turt-world-r2fc8oie5-ryan-sagers-projects.vercel.app

#### Files Modified
1. **`game/entities.ts`** - Major changes:
   - Goal flag positioning formula
   - LevelPlatform index property for alternating colors
   - All platform type color variants (light/dark)
   - Platform textures removed
   - Piranha hazard rendering (new)
   - Rock hazard simplified to triangular spikes

2. **`game/levels.ts`** - Major changes:
   - Arctic water ripples (foreground)
   - Desert buttes (vertical erosion only)
   - Desert sun (heat glow effect)
   - Jungle complete redesign (trees, river, vines)
   - River extended +500 pixels

3. **Scripts created**:
   - `scripts/standardize-platform-types.js` - Standardize platform types per level
   - `scripts/extend-seaside-hazards.js` - Add more crabs to Seaside
   - `scripts/update-jungle-piranhas.js` - Change Jungle hazards to piranhas

#### Mobile Plan Created (Not Yet Implemented)
- Plan file: `~/.claude/plans/dapper-percolating-beaver.md`
- User requested: Full screen portrait mode, tap/swipe to jump
- 5 approaches documented with recommendation to start with virtual buttons
- Implementation deferred to future session

---

### Session 4: Audio System & Scoring Mechanics Overhaul
**Date**: December 9, 2025 (evening)

#### Audio System Implementation (Major Feature)
**Problem**: Game had no audio feedback - no music, sound effects, or auditory cues for player actions.

**Solution**: Implemented complete procedural audio system using Web Audio API (no audio files needed).

**Files Created**:
1. **`game/audio.ts`** - NEW FILE (Complete audio manager ~270 lines)
   - AudioManager singleton class with Web Audio API integration
   - Master gain, music gain, and SFX gain nodes for volume mixing
   - Mute state persisted to localStorage
   - Auto-initialization on first sound play (browser requirement)

**Sound Effects Implemented**:
- **Jump Sound**: Upward pitch sweep (300Hz → 600Hz), square wave, 0.15s duration
- **Coin Sound**: Harmonic chime with two sine waves (E5 + B5), 0.3s duration
- **Combo Sound**: Four-note ascending arpeggio with two oscillators per note
  - Pitch increases with combo count (higher = more coins in jump)
  - Louder and longer than regular coin sound (0.54s total)
  - Only plays when collecting 2+ coins in one jump
- **Level Complete**: Triumphant fanfare (C-E-G-C octave) + final chord, 1.3s total

**Background Music** - Unique melodies for each level theme:
- **Arctic (E minor)**: Slow, spacious, crystalline - pure sine waves, 0.35s tempo
- **Desert (A minor pentatonic)**: Fast, exotic, energetic - triangle waves, 0.28s tempo
- **Jungle (F major)**: Upbeat, tropical, playful - triangle waves, 0.25s tempo
- **Seaside (D major/Lydian)**: Flowing, breezy, open - sine waves, 0.32s tempo
- **Mountain (G major)**: Majestic, grand, slow - triangle waves, 0.38s tempo
- Each melody uses different keys, modes, tempos, and waveforms to match level atmosphere
- Melodies loop seamlessly without interruption

**Files Modified for Audio Integration**:
1. **`game/physics.ts`** - Added optional `onJumpStart` callback to `jump()` method
2. **`game/entities.ts`** - Player constructor accepts jump callback, passes to physics
3. **`game/levels.ts`** - GameLevel and LevelManager accept AudioManager
   - Trigger coin sound on collection
   - Trigger combo sound when reaching 2+ coins in jump
   - Trigger level complete sound when reaching goal
4. **`components/game/Canvas.tsx`** - Initialize audio manager, pass to LevelManager
5. **`components/game/Game.tsx`** - Control music start/stop based on game state
6. **`components/game/UI.tsx`** - Added mute/unmute button (🔊/🔇) in top-right corner

**Volume Mixing**:
- Music: 30% volume (background)
- Sound effects: 50% volume (prominent)
- Master gain controls overall volume
- Mute button toggles all audio

#### Scoring Mechanics Overhaul
**Problem**: Original scoring was confusing with arbitrary multipliers (1.5x, 2x, 3x at certain thresholds). Combo wasn't tied to jump mechanics clearly.

**Solution**: Completely redesigned scoring to be intuitive and reward skillful play.

**New Scoring Rules**:
- **Base coin value**: 100 points
- **Jump combo multiplier**: Coins collected in ONE jump multiply by that count
  - 1 coin in jump = 100 × 1 = 100 points
  - 2 coins in jump = 100 × 2 = 200 points each (400 total)
  - 3 coins in jump = 100 × 3 = 300 points each (900 total)
  - 4 coins in jump = 100 × 4 = 400 points each (1600 total)
- **Combo definition**: 2+ coins collected in a single jump (1 coin is not a combo)
- **Perfect level bonus**: 5,000 points for collecting ALL coins in a level
- **Perfect game bonus**: 25,000 points for collecting ALL coins in ALL levels (once per game run)
- **Score persistence**: Score carries across levels through entire game

**Files Modified for Scoring**:
1. **`game/levels.ts`** - Complete rewrite of scoring logic
   - Added `coinsThisJump` tracker (resets on landing)
   - Changed from `currentCombo` (total) to per-jump counting
   - Scoring: `basePoints * coinsThisJump` (not arbitrary thresholds)
   - Removed 5000 bonus from level (moved to Game.tsx for proper tracking)

2. **`components/game/Game.tsx`** - Added game-wide coin tracking
   - New state: `totalCoinsCollected` (across all levels)
   - New state: `allCoinsCollected` (flag for 25k bonus)
   - `handleLevelComplete` now calculates:
     - Level bonus (5000 if all coins in level)
     - All coins bonus (25000 if all coins in all levels, one-time)
     - Final score = baseScore + levelScore + levelBonus + allCoinsBonus
   - Reset trackers on character select and main menu

3. **`components/game/UI.tsx`** - Updated combo display
   - Changed multiplier calculation from arbitrary thresholds to `currentCombo` value
   - Display shows "X coins (Xx points!)" when combo >= 2
   - Only shows combo UI when 2+ coins (not for 1 coin)

**Scoring Math Example**:
```
Level 1: Collect all 30 coins perfectly in combos
- Jump 1: 3 coins = 900 points (300 each)
- Jump 2: 2 coins = 400 points (200 each)
- ... continue pattern ...
- Level total: ~5000 points from coins
- Perfect bonus: +5000 points
- Level 1 score: ~10,000 points

Continue through all 5 levels collecting all coins...
- Level scores: ~50,000 points total
- Level bonuses: 5000 × 5 = 25,000 points
- All coins bonus: +25,000 points (one-time)
- Final game score: ~100,000 points
```

#### Coin Distribution Fix
**Problem**: Mountain Madness level had coins concentrated in first 80% of level, ending at x=4540 while level extends to x=5680 (goal at x=5550).

**Solution**: Redistributed existing 50 coins evenly across full level length.

**Database Changes**:
- Mountain Madness collectibles redistributed from x=120 to x=5280
- Maintained 50 coin count (per level rules)
- Average spacing: ~102 pixels between coins
- Last coin positioned 270 pixels before goal (good clearance)
- Coins placed above platforms with natural variation in x/y positions

#### Deployment
- Successfully deployed to Vercel production
- Production URL: https://turt-world-gwlu2hrla-ryan-sagers-projects.vercel.app
- Build completed with TypeScript checks passed
- All 5 static pages generated

#### Summary of Changes
**Files Created**: 1
- `game/audio.ts` - Complete audio system (~270 lines)

**Files Modified**: 8
- `game/physics.ts` - Jump callback support
- `game/entities.ts` - Player accepts jump callback
- `game/levels.ts` - Audio integration + scoring overhaul (~30 lines changed)
- `components/game/Canvas.tsx` - Audio manager initialization
- `components/game/Game.tsx` - Music control + advanced score tracking (~50 lines changed)
- `components/game/UI.tsx` - Mute button + combo display updates
- `components/game/TouchControls.tsx` - Indirectly affected (audio works with touch)
- Database: Mountain Madness collectibles repositioned

**Lines Changed**: ~400+ lines across all files

**Technical Achievements**:
- Zero external audio files (all procedural)
- Theme-specific music with different keys and modes
- Intuitive scoring system tied to skillful play
- Perfect score tracking across multi-level runs

### Session 3: Graphics Polish - Background Tiling & Goal Refinement
**Date**: December 9, 2025 (afternoon)

#### Background Tiling Fixes (Major Visual Improvement)
**Problem**: All level backgrounds were running out around 3/5 through the level. Mountains, ocean waves, and decorative foreground elements (cacti, trees, plants) would suddenly disappear as the player scrolled, leaving blank space.

**Root Cause**: Background elements were sized for the canvas width (1400px) instead of the full scrollable world width. Parallax layers need more coverage because they move slower than the camera.

**Solution**: Applied proper parallax tiling calculation across all background layers:
```typescript
parallaxWidth = worldWidth / (1 - parallaxRatio)
numSegments = Math.ceil(parallaxWidth / segmentWidth) + buffer
```

**Files Modified**:
1. `game/camera.ts` - Added `getWorldWidth()` getter method to expose world dimensions
2. `game/levels.ts` - Extensive modifications to all 5 level background rendering methods:

**Arctic Adventure (`renderArcticBackground`)**:
   - ✅ Ice crystals (foreground, 0.35 parallax) - changed from modulo distribution to calculated tiling
   - ✅ Mountains (already fixed in previous session)
   - ✅ Snow effects remain animated across full width

**Sandy Scramble (`renderDesertBackground`)**:
   - ✅ Cacti (mid-ground, 0.3 parallax) - now tile in segments across world
   - ✅ Rock formations (already fixed in previous session)
   - ✅ Sand dunes (already fixed in previous session)

**Jungle Jump (`renderJungleBackground`)**:
   - ✅ Bushes/shrubs (0.28 parallax) - now tile in segments (8 per segment)
   - ✅ Fern fronds (foreground, 0.4 parallax) - changed from modulo to calculated distribution
   - ✅ Tree line and mountains (already fixed in previous session)

**Seaside Sprint (`renderSeasideBackground`)**:
   - ✅ Seashells (foreground, 0.42 parallax) - changed from modulo to calculated distribution
   - ✅ Pebbles (foreground, 0.42 parallax) - changed from modulo to calculated distribution
   - ✅ Ocean and waves (already fixed in previous session)

**Mountain Madness (`renderMountainBackground`)**:
   - ✅ Pine trees (foreground, 0.25 parallax) - now tile in segments (12 per segment)
   - ✅ Mountain grasses (foreground, 0.38 parallax) - changed from modulo to calculated distribution
   - ✅ Wildflowers (foreground, 0.38 parallax) - changed from modulo to calculated distribution
   - ✅ Mountain ranges (already fixed in previous session)

**Technical Details**:
- Changed distribution from `x = ((i * constant + seed) % (width * factor))` to `x = i * spacing + variation`
- Ensures deterministic, evenly-spaced elements across entire level
- Each parallax layer calculates its own coverage needs based on ratio
- Added buffer segments (+1 or +2) to ensure no gaps at edges

#### Goal Visual Refinement
**Problem**: Glowing yellow rectangle around the goal was visually distracting and redundant with the flagpole and sparkle stars.

**Solution**: Removed the pulsing yellow glow rectangle effect.

**File Modified**: `game/entities.ts` (Goal class)
- Removed lines 523-530: glow effect rendering (shadowColor, shadowBlur, strokeRect)
- Kept flagpole with gradient
- Kept yellow/orange flag with outline
- Kept 6 rotating sparkle particles (stars)

**Result**: Cleaner, more focused goal visualization that doesn't compete with other visual elements.

#### Deployment
- Successfully deployed to Vercel production
- Production URL: https://turt-world-ngkdqmlg0-ryan-sagers-projects.vercel.app
- Build completed successfully with TypeScript checks passed
- All 5 static pages generated

#### Summary of Changes
- **Files Modified**: 2
  - `game/camera.ts` - 1 new method
  - `game/levels.ts` - 15+ background element tiling fixes across all 5 levels
  - `game/entities.ts` - Removed glow effect from Goal

- **Lines Changed**: ~150+ lines modified/added in levels.ts alone
- **Visual Impact**: Massive improvement - backgrounds now remain consistent from start to finish of every level
- **Performance**: No impact - same rendering logic, just extended coverage

### Session 2: Mobile Support Implementation
**Date**: December 8, 2025 (afternoon/evening)

#### Mobile Support (Primary Feature)
- **Created TouchControls component** (`components/game/TouchControls.tsx`)
  - Virtual button overlay with 3 buttons: ⬅️ Left, ➡️ Right, 🦘 Jump
  - Auto-detects touch device support using `'ontouchstart' in window`
  - Only renders on touch-enabled devices (invisible on desktop)
  - Semi-transparent buttons positioned at bottom of screen
  - Prevents accidental scrolling with `touchAction: 'none'`

- **Extended InputManager** (`game/input.ts`)
  - Added public methods: `setLeft()`, `setRight()`, `setJump()`
  - Touch controls integrate seamlessly with existing keyboard controls
  - Both input methods work simultaneously (keyboard + touch)
  - Uses virtual key names: 'TouchLeft', 'TouchRight', 'TouchJump'

- **Made Canvas responsive** (`components/game/Canvas.tsx`)
  - Wrapped canvas in responsive container with max-width
  - Canvas scales automatically to fit mobile screens using CSS
  - Maintains 1400×600 aspect ratio
  - Added `onInputManagerReady` callback to pass InputManager to parent

- **Updated Game component** (`components/game/Game.tsx`)
  - Added InputManager state management
  - Conditionally renders TouchControls when playing
  - Reduced padding on mobile (p-4 vs md:p-8)
  - TouchControls only render after InputManager is initialized

- **Fixed viewport configuration** (`app/layout.tsx`)
  - Moved viewport to separate export (Next.js 16 requirement)
  - Configured for mobile: no user scaling, initial scale 1
  - Added Apple Web App capabilities
  - Updated app title and description

#### Files Modified
1. `app/layout.tsx` - Viewport and metadata configuration
2. `game/input.ts` - Added touch control setter methods
3. `components/game/Canvas.tsx` - Responsive wrapper and InputManager callback
4. `components/game/Game.tsx` - TouchControls integration
5. `components/game/TouchControls.tsx` - NEW FILE (mobile controls UI)

#### Testing & Deployment
- Tested on local dev server (http://localhost:3000)
- Network URL available for mobile testing: http://10.0.1.4:3000
- Changes committed and ready for production deployment
- Desktop experience completely unchanged (backwards compatible)

### Session 1: Level Reordering & Code Quality
**Date**: December 8, 2025 (earlier)

#### Level Reordering & Coins
- Reordered levels: Arctic Adventure moved to Level 1, Sandy Scramble to Level 2
- Updated Arctic Adventure to be unlocked by default (first level)
- Adjusted coin counts: Level 1 = 30 coins, then +5 per level (35, 40, 45, 50)
- Created `reorder-and-update-coins.js` script to automate changes

#### Bug Fixes & Code Quality
- **Fixed README.md**: Updated physics engine description from "Rapier2D" to "Custom physics engine"
- **Updated all features**: README now accurately lists 5 levels, coin collection, combos, and progression
- **Organized helper scripts**: Moved to `scripts/` directory with documentation
- **Added environment variable support**: All scripts now use `.env.local` via dotenv instead of hardcoded credentials
- **Removed temporary files**: Deleted one-time migration scripts (`add-new-levels.js/sh`, `reorder-and-update-coins.js`)
- **Added error boundaries**: Created `ErrorBoundary` component wrapping the game (`components/ErrorBoundary.tsx`)
- **Improved error handling**: Added try-catch blocks to all database queries with user-friendly error messages
- **Installed dotenv**: Added as dependency for helper scripts
- **Created PROJECT_STATUS.md**: This file for session persistence

## Next Priorities

1. **Test on actual mobile devices**:
   - Verify touch controls, audio (unmute flow), and quit button work on iOS Safari and Android Chrome
   - Test Pomeranian's new speedy physics feel good on mobile
   - Test Game Over screen and death/game over sounds
   - Confirm combo system works correctly (per-jump counting)

2. **Consider additional audio polish**:
   - Add hazard collision sound (optional - could be too noisy)
   - Add sound for unlocking new level
   - Volume sliders instead of just mute toggle

3. **Consider additional visual polish**:
   - Add particle effects for coin collection (sparkles)
   - Add particle effects for combo milestones (2x, 3x, etc.)
   - Add screen shake or visual feedback for hazard collisions
   - Add celebration animation at goal

5. **Consider removing Rapier2D**: Package is installed but not used - could reduce bundle size (~500KB)

6. **Add more levels**: Create 5-10 additional themed levels
   - Potential themes: Volcano, Ice Cave, Space, Underwater, Forest
   - Each needs unique music in appropriate key/mode

7. **Enhance animations**: Add more character animation states
   - Death/respawn animation
   - Celebration animation at goal
   - Landing squash/stretch

8. **Improve leaderboard**: Add filtering by level, character, or time period
   - Add "perfect run" indicator (all coins collected)
   - Show combo stats on leaderboard

9. **Add automated tests**: Unit tests for game logic, E2E tests for gameplay
    - Test scoring calculations (especially combo multipliers)
    - Test audio initialization and playback
    - Test cross-level score persistence

10. **Mobile Portrait Mode** (Plan exists from Session 5):
    - Plan file: `~/.claude/plans/dapper-percolating-beaver.md`
    - Full-screen portrait, auto-run, tap-to-jump
    - Lower priority now that current mobile controls work

## Key Decisions

### Why Custom Physics Instead of Rapier2D?
Despite Rapier2D being listed in dependencies and mentioned in README, the project uses a custom manual physics engine (`game/physics.ts`). This provides:
- Simpler, more predictable platformer physics
- Full control over gravity, jump mechanics, and collision detection
- Lighter bundle size (no need to load Rapier WASM)
- Easier to tune for game feel (air control, float time, etc.)

**Trade-off**: Less realistic physics, but better for arcade-style platforming.

### Why Supabase for Database?
- Free tier sufficient for hobby project
- PostgreSQL provides robust querying for leaderboards
- JSONB storage perfect for flexible level layouts
- Built-in REST API eliminates need for custom backend
- Easy authentication if needed in future

### Why JSONB for Level Layouts?
Instead of separate tables for platforms/hazards/collectibles:
- Levels are self-contained data structures
- Easy to version and modify entire levels
- Simpler queries (one fetch gets complete level)
- Easier to add new level properties without migrations

**Trade-off**: Can't query for specific platform types across all levels, but this isn't needed for current gameplay.

### Why LocalStorage for Progression?
- No authentication required (frictionless onboarding)
- Instant load times (no database query)
- Works offline
- Simple implementation

**Trade-off**: Progress lost if user clears browser data or switches devices. Could add Supabase user accounts in future for cloud saves.

### Level Ordering Strategy
Arctic Adventure placed first because:
- Visually striking (ice theme catches attention)
- Simpler layout than some other levels
- Good introduction to physics and mechanics
- Provides variety from typical "desert first" trope

### Mobile Controls Approach (Approach 1: Virtual Button Overlay)
Chose virtual button overlay over other approaches because:
- **Simplest implementation**: 2-3 hours vs 6-10 hours for more complex solutions
- **Zero game logic changes**: InputManager API remained identical
- **Desktop unaffected**: Touch controls auto-hide on non-touch devices
- **Easy to iterate**: Button styling, positioning, and behavior can be refined based on user feedback
- **Future-proof**: Can evolve to Approach 5 (Hybrid Auto-Detect) later

**Implementation Details**:
- Touch events call InputManager setter methods (setLeft, setRight, setJump)
- Uses React's onTouchStart/onTouchEnd events with preventDefault
- TouchControls component conditionally rendered only when InputManager is ready
- Buttons use semi-transparent overlay (doesn't block game view)
- Touch action disabled on buttons to prevent scrolling

**Considered but deferred**:
- Gesture controls (swipe/tap): More immersive but requires tutorial
- Virtual joystick: More complex UI, longer implementation time
- Touch-to-keyboard remapping: Slightly hacky with synthetic events

**Next steps for mobile**:
- Test on real devices and gather user feedback
- Adjust button size, positioning, or opacity based on testing
- Consider adding Approach 5 features (auto-hide on keyboard detection)

### Audio Architecture (Web Audio API + Procedural Generation)
Chose procedural audio generation over audio files because:
- **Zero asset management**: No need to source, edit, or host audio files
- **Tiny bundle size**: ~270 lines of code vs hundreds of KB of audio files
- **Dynamic adaptation**: Can easily adjust pitches, tempos, and volumes programmatically
- **Instant iteration**: Change melodies and sounds by editing code, no audio editing tools needed
- **Thematic variety**: Each level gets unique music in different keys and modes

**Implementation Details**:
- Singleton pattern with `getAudioManager()` to ensure one AudioContext
- Auto-initialization on first sound (required by browsers for user gesture)
- Three gain nodes: master (mute control), music (30%), SFX (50%)
- Callback-based integration: physics/levels call audio methods at appropriate times
- LocalStorage persistence for mute preference

**Music Design Philosophy**:
- Each level uses music theory to match its theme:
  - Minor keys for cold/mysterious (Arctic)
  - Pentatonic scales for exotic (Desert)
  - Major keys for bright/happy (Jungle, Seaside)
  - Different tempos to match pacing (fast for Desert, slow for Mountain)
  - Different waveforms for timbre variety (sine for smooth, triangle for mellow, square for bright)

**Trade-offs**:
- Pro: Extremely lightweight, fully customizable, no licensing issues
- Con: Limited to simple synthesized sounds (no realistic instruments or vocals)
- Con: Melodies must be programmed as frequency arrays (not audio-editor friendly)

### Scoring System Philosophy (Skill-Based Rewards)
Redesigned scoring to reward skillful play rather than arbitrary thresholds:

**Old System Problems**:
- Arbitrary multipliers (1.5x at 5 combo, 2x at 10, 3x at 15)
- Unclear what "combo" meant (total coins? coins in level?)
- No incentive to collect multiple coins per jump
- Perfect collection bonus added mid-level (hard to track)

**New System Design**:
- **Jump-based combos**: Multiplier = coins collected in ONE jump
  - Clear cause-and-effect: more coins per jump = exponentially more points
  - Encourages skillful platforming (plan routes to grab multiple coins)
  - Visual feedback: combo display shows exactly what you're getting
- **Transparent bonuses**:
  - 5,000 per perfect level (calculated in Game.tsx for visibility)
  - 25,000 for perfect game (one-time, tracked across levels)
- **Score persistence**: Runs accumulate across all levels until main menu

**Why This Works**:
- Players immediately understand the system (2 coins = 2x, 3 coins = 3x)
- Creates risk/reward decisions (safe 1-coin jumps vs risky multi-coin jumps)
- Perfect runs are achievable and rewarding (~100k points possible)
- Combo sound reinforces the mechanic when it activates

**Implementation Benefits**:
- Simpler code (no complex threshold logic)
- Easier to balance (adjust base value or coin placement)
- Better for leaderboards (skilled players score significantly higher)
