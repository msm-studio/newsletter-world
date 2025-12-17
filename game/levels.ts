import { PhysicsWorld } from './physics';
import { Player, LevelPlatform, Hazard, Goal, Collectible } from './entities';
import { Level, Character } from '@/db/supabase';
import { Camera } from './camera';
import { AudioManager } from './audio';

export class GameLevel {
  private platforms: LevelPlatform[] = [];
  private hazards: Hazard[] = [];
  private goal: Goal;
  private collectibles: Collectible[] = [];
  private player: Player | null = null;
  private levelData: Level;
  private startTime: number = 0;
  private deaths: number = 0;
  private isComplete: boolean = false;
  private isFailed: boolean = false;
  private camera: Camera;
  private score: number = 0;
  private coinsCollected: number = 0;
  private currentCombo: number = 0;
  private maxCombo: number = 0;
  private isGrounded: boolean = false;
  private audioManager: AudioManager | null = null;
  private coinsThisJump: number = 0; // Track coins collected in current jump

  constructor(private world: PhysicsWorld, levelData: Level, audioManager?: AudioManager) {
    this.levelData = levelData;
    this.audioManager = audioManager || null;

    // Calculate world bounds from level layout
    const worldWidth = this.calculateWorldWidth();
    const worldHeight = 700; // Standard height
    this.camera = new Camera(1300, 600, worldWidth, worldHeight);

    // Create platforms
    levelData.layout.platforms.forEach((platformData, index) => {
      this.platforms.push(
        new LevelPlatform(
          world,
          platformData.x + platformData.width / 2,
          platformData.y + platformData.height / 2,
          platformData.width,
          platformData.height,
          platformData.type,
          index
        )
      );
    });

    // Create hazards
    for (const hazardData of levelData.layout.hazards) {
      this.hazards.push(
        new Hazard(
          hazardData.x,
          hazardData.y,
          hazardData.width,
          hazardData.height,
          hazardData.type
        )
      );
    }

    // Create goal
    const goalData = levelData.layout.goal;
    this.goal = new Goal(goalData.x, goalData.y, goalData.width, goalData.height);

    // Create collectibles
    if (levelData.layout.collectibles) {
      for (const coinData of levelData.layout.collectibles) {
        this.collectibles.push(new Collectible(coinData.x, coinData.y));
      }
    }
  }

  spawnPlayer(characterData: Character) {
    if (this.player) {
      this.player.destroy();
    }

    const start = this.levelData.layout.start;
    // Reset coinsThisJump when a new jump starts - this ensures each jump
    // has its own independent coin count for combo scoring
    const onJump = () => {
      this.coinsThisJump = 0;
      if (this.audioManager) {
        this.audioManager.playJump();
      }
    };
    this.player = new Player(this.world, characterData, start.x, start.y, onJump);
    this.startTime = Date.now();
  }

  update(deltaTime: number, input: any) {
    if (!this.player || this.isComplete || this.isFailed) return;

    this.player.update(input, deltaTime);

    // Get player position for camera and bounds checking
    const playerPos = this.player.getPosition();

    // Update camera to follow player
    this.camera.follow(playerPos.x, playerPos.y);

    // Check if player is grounded (for combo system)
    const wasGrounded = this.isGrounded;
    this.isGrounded = this.player.getPhysicsBody().isGrounded();

    // Reset combo and coins-this-jump when landing on ground
    if (this.isGrounded && !wasGrounded) {
      this.currentCombo = 0;
      this.coinsThisJump = 0;
    }

    // Check collectible collisions
    for (const collectible of this.collectibles) {
      if (collectible.checkCollision(this.player)) {
        collectible.collect();
        this.coinsCollected++;

        // Play coin sound
        if (this.audioManager) {
          this.audioManager.playCoin();
        }

        // Track coins collected in current jump (only while airborne)
        if (!this.isGrounded) {
          this.coinsThisJump++;

          // Update max combo (for display)
          if (this.coinsThisJump > this.maxCombo) {
            this.maxCombo = this.coinsThisJump;
          }

          // Play combo sound when reaching 2+ coins in this jump
          if (this.coinsThisJump >= 2 && this.audioManager) {
            this.audioManager.playCombo(this.coinsThisJump);
          }
        }

        // Calculate score with jump multiplier
        // 1 coin in jump = 100 points (1x)
        // 2 coins in jump = 200 points each (2x)
        // 3 coins in jump = 300 points each (3x), etc.
        const basePoints = 100;
        const jumpMultiplier = Math.max(1, this.coinsThisJump);
        this.score += basePoints * jumpMultiplier;
      }
    }

    // Check hazard collisions
    for (const hazard of this.hazards) {
      if (hazard.checkCollision(this.player)) {
        this.handlePlayerDeath();
        return;
      }
    }

    // Check goal collision
    if (this.goal.checkCollision(this.player)) {
      this.isComplete = true;

      // Play level complete sound
      if (this.audioManager) {
        this.audioManager.playLevelComplete();
      }

      // Note: Perfect collection bonus (5000 points) is added in Game.tsx handleLevelComplete
    }

    // Check if player fell off the world
    if (playerPos.y > 700) {
      this.handlePlayerDeath();
    }
  }

  private handlePlayerDeath() {
    this.deaths++;
    this.isFailed = true;
  }

  respawn(characterData: Character) {
    this.isFailed = false;
    this.spawnPlayer(characterData);
  }

  private renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number, cameraX: number, theme: string) {
    // Render theme-specific backgrounds with parallax scrolling
    switch(theme) {
      case 'arctic':
        this.renderArcticBackground(ctx, width, height, cameraX);
        break;
      case 'desert':
        this.renderDesertBackground(ctx, width, height, cameraX);
        break;
      case 'jungle':
        this.renderJungleBackground(ctx, width, height, cameraX);
        break;
      case 'seaside':
        this.renderSeasideBackground(ctx, width, height, cameraX);
        break;
      case 'mountain':
        this.renderMountainBackground(ctx, width, height, cameraX);
        break;
      default:
        // Fallback to desert for unknown themes
        this.renderDesertBackground(ctx, width, height, cameraX);
    }
  }

  private renderArcticBackground(ctx: CanvasRenderingContext2D, width: number, height: number, cameraX: number) {
    const time = Date.now() / 1000;
    const worldWidth = this.camera.getWorldWidth(); // Get actual level width

    // Sky gradient - dark for night
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.65);
    skyGradient.addColorStop(0, '#0a1628'); // Very dark blue
    skyGradient.addColorStop(0.5, '#1a2a4a'); // Dark blue
    skyGradient.addColorStop(1, '#4a6a8a'); // Medium blue at horizon
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Moon with glow
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.arc(width * 0.75, height * 0.18, 32, 0, Math.PI * 2);
    ctx.fill();

    // Moon glow
    const moonGlow = ctx.createRadialGradient(width * 0.75, height * 0.18, 32, width * 0.75, height * 0.18, 60);
    moonGlow.addColorStop(0, 'rgba(240, 240, 255, 0.3)');
    moonGlow.addColorStop(1, 'rgba(200, 220, 255, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(width * 0.75, height * 0.18, 60, 0, Math.PI * 2);
    ctx.fill();

    // Moon craters for detail
    ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.beginPath();
    ctx.arc(width * 0.75 - 8, height * 0.18 - 6, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width * 0.75 + 10, height * 0.18 + 4, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width * 0.75 - 4, height * 0.18 + 10, 5, 0, Math.PI * 2);
    ctx.fill();

    // Stars - extend across world
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 60; i++) {
      const seed = Math.sin(i * 7.891) * 10000;
      const starX = ((i * 113 + seed) % (worldWidth + 400));
      const starY = ((i * 79 + seed * 0.5) % (height * 0.5));
      const starSize = 1 + (i % 2);
      const twinkle = 0.5 + Math.abs(Math.sin(time * 2 + i)) * 0.5;

      ctx.globalAlpha = twinkle;
      ctx.beginPath();
      ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Distant snowy mountains - tile across entire world
    const farParallax = cameraX * 0.08;
    ctx.save();
    ctx.translate(-farParallax, 0);
    ctx.fillStyle = 'rgba(220, 230, 250, 0.5)';

    const mountainSegmentWidth = width * 1.5;
    // Calculate how much total width we need to cover in this parallax layer
    const parallaxWorldWidth = worldWidth / (1 - 0.08); // Account for parallax ratio
    const numMountainSegments = Math.ceil(parallaxWorldWidth / mountainSegmentWidth) + 2;

    for (let seg = 0; seg < numMountainSegments; seg++) {
      const offsetX = seg * mountainSegmentWidth - 200;
      ctx.beginPath();
      ctx.moveTo(offsetX, height * 0.55);
      ctx.lineTo(offsetX + width * 0.15, height * 0.38);
      ctx.lineTo(offsetX + width * 0.35, height * 0.42);
      ctx.lineTo(offsetX + width * 0.55, height * 0.36);
      ctx.lineTo(offsetX + width * 0.75, height * 0.40);
      ctx.lineTo(offsetX + width * 0.95, height * 0.35);
      ctx.lineTo(offsetX + width * 1.2, height * 0.45);
      ctx.lineTo(offsetX + width * 1.5, height * 0.55);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Mid-distance snowy peaks - tile across entire world
    const midParallax = cameraX * 0.15;
    ctx.save();
    ctx.translate(-midParallax, 0);
    ctx.fillStyle = 'rgba(200, 215, 240, 0.7)';

    const midSegmentWidth = width * 1.3;
    const parallaxMidWidth = worldWidth / (1 - 0.15);
    const numMidSegments = Math.ceil(parallaxMidWidth / midSegmentWidth) + 2;

    for (let seg = 0; seg < numMidSegments; seg++) {
      const offsetX = seg * midSegmentWidth - 150;
      ctx.beginPath();
      ctx.moveTo(offsetX, height * 0.6);
      ctx.lineTo(offsetX + width * 0.2, height * 0.45);
      ctx.lineTo(offsetX + width * 0.45, height * 0.48);
      ctx.lineTo(offsetX + width * 0.7, height * 0.43);
      ctx.lineTo(offsetX + width, height * 0.5);
      ctx.lineTo(offsetX + width * 1.3, height * 0.6);
      ctx.closePath();
      ctx.fill();

      // Snow cap
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.moveTo(offsetX + width * 0.2 - 40, height * 0.47);
      ctx.lineTo(offsetX + width * 0.2, height * 0.45);
      ctx.lineTo(offsetX + width * 0.2 + 40, height * 0.48);
      ctx.fill();

      ctx.fillStyle = 'rgba(200, 215, 240, 0.7)';
    }
    ctx.restore();

    // Procedural foreground - ice crystals and snow drifts
    const fgParallax = cameraX * 0.35;
    ctx.save();
    ctx.translate(-fgParallax, 0);

    // Small ice crystals on ground (procedurally placed based on position)
    ctx.fillStyle = 'rgba(200, 230, 255, 0.6)';
    const parallaxFgWidth = worldWidth / (1 - 0.35);
    const numCrystals = Math.ceil(parallaxFgWidth / 70) + 5; // Distribute across world
    for (let i = 0; i < numCrystals; i++) {
      const seed = Math.sin(i * 12.345) * 10000;
      const x = i * 70 + (Math.abs(Math.sin(seed)) * 50);
      const y = height * 0.62 + (Math.sin(i * 7.89) * 15);
      const size = 4 + (i % 3);

      // Ice crystal shape
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x - size * 0.6, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x + size * 0.6, y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Falling snow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    for (let i = 0; i < 30; i++) {
      const x = ((i * 79 + time * 20) % (width * 1.1));
      const y = ((i * 103 + time * 30) % height);
      const size = 2 + (i % 3);
      ctx.globalAlpha = 0.5 + (i % 2) * 0.3;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Gentle water ripples in the playing area (no parallax - in world space)
    ctx.save();
    ctx.strokeStyle = 'rgba(140, 200, 230, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';

    // Subtle ripples across the water surface
    for (let i = 0; i < Math.ceil(worldWidth / 80); i++) {
      const x = i * 80 + (Math.sin(time * 0.8 + i * 0.3) * 15);
      const y = height * 0.68 + Math.sin(x * 0.015 + time * 1.2) * 2;
      const rippleSize = 12 + Math.sin(time * 1.5 + i) * 3;

      // Small circular ripple
      ctx.globalAlpha = 0.3 + Math.sin(time * 2 + i * 0.5) * 0.15;
      ctx.beginPath();
      ctx.arc(x, y, rippleSize, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
    ctx.restore();
  }

  private renderDesertBackground(ctx: CanvasRenderingContext2D, width: number, height: number, cameraX: number) {
    const time = Date.now() / 1000;
    const worldWidth = this.camera.getWorldWidth();

    // Desert sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.65);
    skyGradient.addColorStop(0, '#87CEEB'); // Sky blue
    skyGradient.addColorStop(0.5, '#FFD89C'); // Warm horizon
    skyGradient.addColorStop(1, '#FFEBCD'); // Pale sand color
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Hot desert sun with intense heat glow
    const sunX = width * 0.8;
    const sunY = height * 0.15;

    // Outer heat haze
    const outerGlow = ctx.createRadialGradient(sunX, sunY, 35, sunX, sunY, 75);
    outerGlow.addColorStop(0, 'rgba(255, 200, 80, 0)');
    outerGlow.addColorStop(0.4, 'rgba(255, 180, 60, 0.15)');
    outerGlow.addColorStop(1, 'rgba(255, 150, 40, 0)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 75, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow
    const innerGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 50);
    innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    innerGlow.addColorStop(0.3, 'rgba(255, 240, 180, 0.6)');
    innerGlow.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 50, 0, Math.PI * 2);
    ctx.fill();

    // Bright hot sun core
    const sunCore = ctx.createRadialGradient(sunX - 8, sunY - 8, 0, sunX, sunY, 35);
    sunCore.addColorStop(0, '#FFFEF0');
    sunCore.addColorStop(0.4, '#FFF4D0');
    sunCore.addColorStop(0.7, '#FFE080');
    sunCore.addColorStop(1, '#FFC850');
    ctx.fillStyle = sunCore;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 35, 0, Math.PI * 2);
    ctx.fill();

    // Distant rock formations (buttes) - tile across world
    const farParallax = cameraX * 0.1;
    ctx.save();
    ctx.translate(-farParallax, 0);

    const rockSegmentWidth = width * 1.2;
    const parallaxRockWidth = worldWidth / (1 - 0.1);
    const numRockSegments = Math.ceil(parallaxRockWidth / rockSegmentWidth) + 2;

    for (let seg = 0; seg < numRockSegments; seg++) {
      const offsetX = seg * rockSegmentWidth;

      // Draw buttes with irregular tops and texturing
      const drawButte = (x: number, y: number, w: number, h: number, seed: number) => {
        // Main butte body with gradient
        const butteGrad = ctx.createLinearGradient(x, y, x + w, y);
        butteGrad.addColorStop(0, 'rgba(160, 110, 80, 0.5)');
        butteGrad.addColorStop(0.5, 'rgba(180, 130, 90, 0.5)');
        butteGrad.addColorStop(1, 'rgba(140, 100, 70, 0.5)');
        ctx.fillStyle = butteGrad;

        // Irregular top - mesa-like with some variation
        ctx.beginPath();
        ctx.moveTo(x, height * 0.65); // Extend to horizon line
        ctx.lineTo(x, y + h * 0.2);

        // Jagged top edge
        const topVariation = Math.abs(Math.sin(seed * 1.234));
        ctx.lineTo(x + w * 0.1, y + h * 0.15 * topVariation);
        ctx.lineTo(x + w * 0.3, y + h * 0.1);
        ctx.lineTo(x + w * 0.5, y);
        ctx.lineTo(x + w * 0.7, y + h * 0.08);
        ctx.lineTo(x + w * 0.9, y + h * 0.12 * topVariation);

        ctx.lineTo(x + w, y + h * 0.25);
        ctx.lineTo(x + w, height * 0.65); // Extend to horizon line
        ctx.closePath();
        ctx.fill();

        // Vertical erosion lines only (no horizontal striations)
        ctx.strokeStyle = 'rgba(100, 70, 50, 0.3)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) {
          const lineX = x + w * (0.15 + i * 0.18);
          ctx.beginPath();
          ctx.moveTo(lineX, y + h * 0.15);
          ctx.lineTo(lineX + Math.sin(seed + i) * 4, y + h);
          ctx.stroke();
        }
      };

      drawButte(offsetX + width * 0.2, height * 0.48, 80, 60, seg * 2.5);
      drawButte(offsetX + width * 0.6, height * 0.45, 100, 70, seg * 3.7);
    }
    ctx.restore();

    // Sand dunes - tile across world
    const duneParallax = cameraX * 0.18;
    ctx.save();
    ctx.translate(-duneParallax, 0);

    // Back dune - tiled
    const backDuneGrad = ctx.createLinearGradient(0, height * 0.52, 0, height * 0.63);
    backDuneGrad.addColorStop(0, '#E4C088');
    backDuneGrad.addColorStop(1, '#C8A96D');
    ctx.fillStyle = backDuneGrad;

    const duneSegmentWidth = width * 1.2;
    const parallaxDuneWidth = worldWidth / (1 - 0.18);
    const numDuneSegments = Math.ceil(parallaxDuneWidth / duneSegmentWidth) + 2;

    for (let seg = 0; seg < numDuneSegments; seg++) {
      const offsetX = seg * duneSegmentWidth - 50;
      ctx.beginPath();
      ctx.moveTo(offsetX, height * 0.63);
      ctx.quadraticCurveTo(offsetX + width * 0.25, height * 0.52, offsetX + width * 0.5, height * 0.56);
      ctx.quadraticCurveTo(offsetX + width * 0.75, height * 0.6, offsetX + width * 1.2, height * 0.54);
      ctx.lineTo(offsetX + width * 1.2, height * 0.63);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Front dune - tiled
    const frontDuneParallax = cameraX * 0.25;
    ctx.save();
    ctx.translate(-frontDuneParallax, 0);
    const frontDuneGrad = ctx.createLinearGradient(0, height * 0.58, 0, height * 0.68);
    frontDuneGrad.addColorStop(0, '#F0D0A0');
    frontDuneGrad.addColorStop(1, '#D4B088');
    ctx.fillStyle = frontDuneGrad;

    const frontDuneSegmentWidth = width * 1.1;
    const parallaxFrontDuneWidth = worldWidth / (1 - 0.25);
    const numFrontDuneSegments = Math.ceil(parallaxFrontDuneWidth / frontDuneSegmentWidth) + 2;

    for (let seg = 0; seg < numFrontDuneSegments; seg++) {
      const offsetX = seg * frontDuneSegmentWidth - 30;
      ctx.beginPath();
      ctx.moveTo(offsetX, height * 0.68);
      ctx.quadraticCurveTo(offsetX + width * 0.3, height * 0.58, offsetX + width * 0.6, height * 0.62);
      ctx.quadraticCurveTo(offsetX + width * 0.85, height * 0.65, offsetX + width * 1.1, height * 0.6);
      ctx.lineTo(offsetX + width * 1.1, height * 0.68);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Cacti - tile across world
    const cactusParallax = cameraX * 0.3;
    ctx.save();
    ctx.translate(-cactusParallax, 0);

    const drawCactus = (x: number, y: number, h: number) => {
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(x + 6, y + h + 2, 12, 4);

      // Main trunk
      ctx.fillStyle = '#4A6B3A';
      ctx.fillRect(x - 6, y, 12, h);

      // Left arm
      ctx.fillRect(x - 18, y + h * 0.4, 10, 28);
      ctx.fillRect(x - 18, y + h * 0.4 - 18, 10, 18);

      // Right arm (slightly lower)
      ctx.fillRect(x + 8, y + h * 0.6, 10, 22);
      ctx.fillRect(x + 8, y + h * 0.6 - 15, 10, 15);
    };

    const cactusSegmentWidth = width * 1.0;
    const parallaxCactusWidth = worldWidth / (1 - 0.3);
    const numCactusSegments = Math.ceil(parallaxCactusWidth / cactusSegmentWidth) + 1;

    for (let seg = 0; seg < numCactusSegments; seg++) {
      const offsetX = seg * cactusSegmentWidth;
      drawCactus(offsetX + width * 0.15, height * 0.54, 70);
      drawCactus(offsetX + width * 0.7, height * 0.56, 65);
    }
    ctx.restore();

    // Procedural foreground - desert rocks and small plants
    const fgParallax = cameraX * 0.38;
    ctx.save();
    ctx.translate(-fgParallax, 0);

    // Small rocks scattered on ground
    ctx.fillStyle = 'rgba(160, 120, 90, 0.7)';
    for (let i = 0; i < 25; i++) {
      const seed = Math.sin(i * 9.876) * 10000;
      const x = ((i * 149 + seed) % (width * 1.6));
      const y = height * 0.64 + (Math.sin(i * 5.43) * 10);
      const size = 3 + (i % 4);

      // Rounded rock shape
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Small tufts of dry grass
    ctx.strokeStyle = 'rgba(200, 180, 120, 0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 15; i++) {
      const seed = Math.sin(i * 15.234) * 10000;
      const x = ((i * 167 + seed) % (width * 1.6));
      const y = height * 0.65;

      for (let blade = 0; blade < 3; blade++) {
        ctx.beginPath();
        ctx.moveTo(x + blade * 2 - 2, y);
        ctx.lineTo(x + blade * 2 - 2 + Math.sin(i + blade) * 2, y - 6);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  private renderJungleBackground(ctx: CanvasRenderingContext2D, width: number, height: number, cameraX: number) {
    const time = Date.now() / 1000;
    const worldWidth = this.camera.getWorldWidth();

    // Tropical sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
    skyGradient.addColorStop(0, '#4A9FD8'); // Bright tropical blue
    skyGradient.addColorStop(0.5, '#7BBFD8'); // Lighter blue
    skyGradient.addColorStop(1, '#A8D8C8'); // Teal-green horizon
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Distant jungle canopy - layered hills
    const farParallax = cameraX * 0.08;
    ctx.save();
    ctx.translate(-farParallax, 0);

    const hillSegmentWidth = width * 1.3;
    const parallaxHillWidth = worldWidth / (1 - 0.08);
    const numHillSegments = Math.ceil(parallaxHillWidth / hillSegmentWidth) + 2;

    for (let seg = 0; seg < numHillSegments; seg++) {
      const offsetX = seg * hillSegmentWidth - 100;

      // Distant canopy - very faded
      ctx.fillStyle = 'rgba(60, 100, 80, 0.4)';
      ctx.beginPath();
      ctx.moveTo(offsetX, height * 0.55);
      for (let x = 0; x <= width * 1.3; x += 40) {
        const y = height * (0.45 + Math.sin((offsetX + x) * 0.01) * 0.05);
        ctx.lineTo(offsetX + x, y);
      }
      ctx.lineTo(offsetX + width * 1.3, height * 0.55);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Mid-distance jungle trees - tall palm-like trees
    const treeParallax = cameraX * 0.15;
    ctx.save();
    ctx.translate(-treeParallax, 0);

    const drawTropicalTree = (x: number, baseY: number, h: number, seed: number) => {
      // Tall brown trunk
      const trunkGrad = ctx.createLinearGradient(x - 8, baseY - h, x + 8, baseY - h);
      trunkGrad.addColorStop(0, 'rgba(90, 60, 40, 0.6)');
      trunkGrad.addColorStop(0.5, 'rgba(110, 75, 50, 0.6)');
      trunkGrad.addColorStop(1, 'rgba(90, 60, 40, 0.6)');
      ctx.fillStyle = trunkGrad;
      ctx.fillRect(x - 6, baseY - h, 12, h);

      // Leafy canopy - multiple overlapping circles for bushy look
      ctx.fillStyle = 'rgba(40, 110, 60, 0.7)';
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const leafX = x + Math.cos(angle) * 25;
        const leafY = baseY - h - 10 + Math.sin(angle) * 20;
        ctx.beginPath();
        ctx.arc(leafX, leafY, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center leaf cluster
      ctx.fillStyle = 'rgba(50, 130, 70, 0.8)';
      ctx.beginPath();
      ctx.arc(x, baseY - h - 15, 35, 0, Math.PI * 2);
      ctx.fill();
    };

    const treeSegmentWidth = 1400;
    const parallaxTreeWidth = worldWidth / (1 - 0.15);
    const numTreeSegments = Math.ceil(parallaxTreeWidth / treeSegmentWidth) + 1;

    for (let seg = 0; seg < numTreeSegments; seg++) {
      for (let i = 0; i < 8; i++) {
        const x = seg * treeSegmentWidth + i * 175 + 80;
        const h = 110 + (i % 3) * 20;
        drawTropicalTree(x, height * 0.54, h, seg * 8 + i);
      }
    }
    ctx.restore();

    // Rushing river - the foreground playing area (NO parallax - this is world space)
    // River needs to be rendered AFTER camera transform is applied
    ctx.save();
    ctx.restore();

    // Hanging vines in foreground
    const vineParallax = cameraX * 0.35;
    ctx.save();
    ctx.translate(-vineParallax, 0);

    ctx.strokeStyle = 'rgba(40, 80, 40, 0.6)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const parallaxVineWidth = worldWidth / (1 - 0.35);
    const numVines = Math.ceil(parallaxVineWidth / 150) + 3;

    for (let i = 0; i < numVines; i++) {
      const seed = Math.sin(i * 13.579) * 10000;
      const x = i * 150 + (Math.abs(Math.sin(seed)) * 100);
      const swing = Math.sin(time * 0.8 + i) * 8;

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.quadraticCurveTo(x + swing, height * 0.3, x + swing * 1.5, height * 0.58);
      ctx.stroke();

      // Leaves on vine
      ctx.fillStyle = 'rgba(50, 120, 60, 0.7)';
      for (let j = 0; j < 4; j++) {
        const leafY = height * 0.15 + j * (height * 0.12);
        ctx.beginPath();
        ctx.ellipse(x + swing * (0.5 + j * 0.25), leafY, 8, 4, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private renderSeasideBackground(ctx: CanvasRenderingContext2D, width: number, height: number, cameraX: number) {
    const time = Date.now() / 1000;
    const worldWidth = this.camera.getWorldWidth();

    // Ocean sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.65);
    skyGradient.addColorStop(0, '#4A90E2'); // Deep blue
    skyGradient.addColorStop(0.5, '#87CEEB'); // Sky blue
    skyGradient.addColorStop(1, '#B0E0F6'); // Light blue
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Sun
    ctx.fillStyle = '#FFE87C';
    ctx.beginPath();
    ctx.arc(width * 0.75, height * 0.15, 30, 0, Math.PI * 2);
    ctx.fill();

    // Sun glow
    ctx.fillStyle = 'rgba(255, 240, 150, 0.4)';
    ctx.beginPath();
    ctx.arc(width * 0.75, height * 0.15, 45, 0, Math.PI * 2);
    ctx.fill();

    // Distant ocean - extend to world width
    ctx.fillStyle = '#3A6B88';
    ctx.fillRect(0, height * 0.5, worldWidth, height * 0.15);

    // Simple sailboat
    const boatParallax = cameraX * 0.12;
    ctx.save();
    ctx.translate(-boatParallax, 0);
    const boatX = width * 0.6;
    const boatY = height * 0.54;

    // Hull
    ctx.fillStyle = 'rgba(120, 80, 60, 0.7)';
    ctx.beginPath();
    ctx.moveTo(boatX - 15, boatY);
    ctx.lineTo(boatX + 15, boatY);
    ctx.lineTo(boatX + 10, boatY + 6);
    ctx.lineTo(boatX - 10, boatY + 6);
    ctx.closePath();
    ctx.fill();

    // Sail
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.moveTo(boatX, boatY - 2);
    ctx.lineTo(boatX + 14, boatY - 12);
    ctx.lineTo(boatX, boatY - 28);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Animated waves
    const waveParallax = cameraX * 0.22;
    ctx.save();
    ctx.translate(-waveParallax, 0);

    // Back wave layer - extend across world width
    ctx.fillStyle = '#5B9FB5';
    ctx.beginPath();
    ctx.moveTo(-50, height * 0.68);
    for (let x = -50; x <= worldWidth + waveParallax + 50; x += 30) {
      const y = height * 0.62 + Math.sin(x * 0.02 + time) * 8;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(worldWidth + waveParallax + 50, height * 0.68);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Front wave layer - extend across world width
    const frontWaveParallax = cameraX * 0.3;
    ctx.save();
    ctx.translate(-frontWaveParallax, 0);
    ctx.fillStyle = '#7BBFD0';
    ctx.beginPath();
    ctx.moveTo(-30, height * 0.72);
    for (let x = -30; x <= worldWidth + frontWaveParallax + 30; x += 20) {
      const y = height * 0.66 + Math.sin(x * 0.03 + time * 1.5) * 10;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(worldWidth + frontWaveParallax + 30, height * 0.72);
    ctx.closePath();
    ctx.fill();

    // Wave crests (white foam)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let x = -30; x <= worldWidth + frontWaveParallax + 30; x += 20) {
      const y = height * 0.66 + Math.sin(x * 0.03 + time * 1.5) * 10;
      if (Math.sin(x * 0.03 + time * 1.5) > 0.5) {
        ctx.beginPath();
        ctx.arc(x, y - 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Seagulls
    for (let i = 0; i < 4; i++) {
      const birdX = ((i * 187 + time * 35) % (width * 1.2));
      const birdY = height * 0.25 + Math.sin(time + i) * 30;

      ctx.strokeStyle = 'rgba(100, 100, 100, 0.7)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      // Simple M shape for bird
      ctx.beginPath();
      ctx.moveTo(birdX - 8, birdY);
      ctx.lineTo(birdX - 3, birdY - 4);
      ctx.lineTo(birdX, birdY);
      ctx.lineTo(birdX + 3, birdY - 4);
      ctx.lineTo(birdX + 8, birdY);
      ctx.stroke();
    }

    // Procedural foreground - beach debris and shells
    const fgParallax = cameraX * 0.42;
    ctx.save();
    ctx.translate(-fgParallax, 0);

    // Seashells on beach - distribute across world
    const parallaxShellWidth = worldWidth / (1 - 0.42);
    const numShells = Math.ceil(parallaxShellWidth / 70) + 5;

    for (let i = 0; i < numShells; i++) {
      const seed = Math.sin(i * 13.579) * 10000;
      const x = i * 70 + (Math.abs(Math.sin(seed)) * 50);
      const y = height * 0.66 + (Math.sin(i * 6.28) * 8);
      const size = 3 + (i % 3);

      ctx.fillStyle = 'rgba(240, 220, 200, 0.8)';
      // Spiral shell shape
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 1.2, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Shell detail
      ctx.strokeStyle = 'rgba(200, 180, 160, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.6, 0, Math.PI);
      ctx.stroke();
    }

    // Small pebbles - distribute across world
    const numPebbles = Math.ceil(parallaxShellWidth / 50) + 5;
    ctx.fillStyle = 'rgba(160, 140, 120, 0.6)';
    for (let i = 0; i < numPebbles; i++) {
      const seed = Math.sin(i * 17.234) * 10000;
      const x = i * 50 + (Math.abs(Math.sin(seed)) * 35);
      const y = height * 0.67 + (Math.sin(i * 4.56) * 6);
      const size = 2 + (i % 2);

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderMountainBackground(ctx: CanvasRenderingContext2D, width: number, height: number, cameraX: number) {
    const time = Date.now() / 1000;
    const worldWidth = this.camera.getWorldWidth();

    // Mountain sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.65);
    skyGradient.addColorStop(0, '#6BA3D4'); // Deep blue
    skyGradient.addColorStop(0.5, '#87CEEB'); // Sky blue
    skyGradient.addColorStop(1, '#D0E7F8'); // Pale blue
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Sun
    ctx.fillStyle = '#FFE87C';
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.18, 28, 0, Math.PI * 2);
    ctx.fill();

    // Far mountain range (blue-gray, distant) - tile across world
    const farParallax = cameraX * 0.08;
    ctx.save();
    ctx.translate(-farParallax, 0);
    ctx.fillStyle = 'rgba(140, 160, 190, 0.5)';

    const farMountainSegmentWidth = width * 1.3;
    const parallaxFarWidth = worldWidth / (1 - 0.08);
    const numFarSegments = Math.ceil(parallaxFarWidth / farMountainSegmentWidth) + 2;

    for (let seg = 0; seg < numFarSegments; seg++) {
      const offsetX = seg * farMountainSegmentWidth - 100;
      ctx.beginPath();
      ctx.moveTo(offsetX, height * 0.58);
      ctx.lineTo(offsetX + width * 0.2, height * 0.4);
      ctx.lineTo(offsetX + width * 0.5, height * 0.44);
      ctx.lineTo(offsetX + width * 0.8, height * 0.38);
      ctx.lineTo(offsetX + width * 1.3, height * 0.46);
      ctx.lineTo(offsetX + width * 1.3, height * 0.58);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Mid-distance mountain range (darker) - tile across world
    const midParallax = cameraX * 0.15;
    ctx.save();
    ctx.translate(-midParallax, 0);
    ctx.fillStyle = 'rgba(90, 110, 140, 0.7)';

    const midMountainSegmentWidth = width * 1.2;
    const parallaxMidWidth = worldWidth / (1 - 0.15);
    const numMidSegments = Math.ceil(parallaxMidWidth / midMountainSegmentWidth) + 2;

    for (let seg = 0; seg < numMidSegments; seg++) {
      const offsetX = seg * midMountainSegmentWidth - 80;
      ctx.beginPath();
      ctx.moveTo(offsetX, height * 0.62);
      ctx.lineTo(offsetX + width * 0.15, height * 0.46);
      ctx.lineTo(offsetX + width * 0.35, height * 0.5);
      ctx.lineTo(offsetX + width * 0.6, height * 0.44);
      ctx.lineTo(offsetX + width * 0.85, height * 0.48);
      ctx.lineTo(offsetX + width * 1.2, height * 0.52);
      ctx.lineTo(offsetX + width * 1.2, height * 0.62);
      ctx.closePath();
      ctx.fill();

      // Snow caps on mid mountains
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.moveTo(offsetX + width * 0.15 - 30, height * 0.48);
      ctx.lineTo(offsetX + width * 0.15, height * 0.46);
      ctx.lineTo(offsetX + width * 0.15 + 30, height * 0.49);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(offsetX + width * 0.6 - 35, height * 0.47);
      ctx.lineTo(offsetX + width * 0.6, height * 0.44);
      ctx.lineTo(offsetX + width * 0.6 + 35, height * 0.48);
      ctx.fill();

      ctx.fillStyle = 'rgba(90, 110, 140, 0.7)';
    }
    ctx.restore();

    // Simple pine trees (foreground) - tile across world
    const treeParallax = cameraX * 0.25;
    ctx.save();
    ctx.translate(-treeParallax, 0);

    const drawPineTree = (x: number, y: number, h: number) => {
      // Trunk
      ctx.fillStyle = '#3D2817';
      ctx.fillRect(x - 3, y, 6, h * 0.3);

      // Pine triangle layers
      ctx.fillStyle = '#2D5016';
      for (let layer = 0; layer < 3; layer++) {
        const layerY = y - layer * (h / 4);
        const layerW = (h / 3) - layer * (h / 12);
        ctx.beginPath();
        ctx.moveTo(x, layerY - h / 4);
        ctx.lineTo(x - layerW, layerY);
        ctx.lineTo(x + layerW, layerY);
        ctx.closePath();
        ctx.fill();
      }
    };

    const treeSegmentWidth = 1440; // 12 trees * 120 spacing
    const parallaxTreeWidth = worldWidth / (1 - 0.25);
    const numTreeSegments = Math.ceil(parallaxTreeWidth / treeSegmentWidth) + 1;

    for (let seg = 0; seg < numTreeSegments; seg++) {
      for (let i = 0; i < 12; i++) {
        const x = seg * treeSegmentWidth + i * 120 + 60;
        drawPineTree(x, height * 0.58, 60 + (i % 3) * 15);
      }
    }
    ctx.restore();

    // Flying birds
    for (let i = 0; i < 3; i++) {
      const birdX = ((i * 211 + time * 30) % (width * 1.3));
      const birdY = height * 0.22 + Math.sin(time + i) * 25;

      ctx.strokeStyle = 'rgba(60, 60, 60, 0.6)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      // Simple V shape for bird
      ctx.beginPath();
      ctx.moveTo(birdX - 10, birdY);
      ctx.lineTo(birdX - 3, birdY - 5);
      ctx.lineTo(birdX, birdY - 2);
      ctx.lineTo(birdX + 3, birdY - 5);
      ctx.lineTo(birdX + 10, birdY);
      ctx.stroke();
    }

    // Procedural foreground - mountain wildflowers and grasses
    const fgParallax = cameraX * 0.38;
    ctx.save();
    ctx.translate(-fgParallax, 0);

    // Wild mountain grasses - distribute across world
    ctx.strokeStyle = 'rgba(100, 120, 80, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';

    const parallaxFgWidth = worldWidth / (1 - 0.38);
    const numGrasses = Math.ceil(parallaxFgWidth / 100) + 5;

    for (let i = 0; i < numGrasses; i++) {
      const seed = Math.sin(i * 14.321) * 10000;
      const x = i * 100 + (Math.abs(Math.sin(seed)) * 70);
      const y = height * 0.64;

      // Grass blades
      for (let blade = 0; blade < 4; blade++) {
        const bladeX = x + blade * 2 - 3;
        const sway = Math.sin(time * 0.5 + i + blade) * 2;
        ctx.beginPath();
        ctx.moveTo(bladeX, y);
        ctx.lineTo(bladeX + sway, y - 8 - (blade % 2) * 3);
        ctx.stroke();
      }
    }

    // Small wildflowers - distribute across world
    const numFlowers = Math.ceil(parallaxFgWidth / 120) + 5;
    for (let i = 0; i < numFlowers; i++) {
      const seed = Math.sin(i * 18.765) * 10000;
      const x = i * 120 + (Math.abs(Math.sin(seed)) * 80);
      const y = height * 0.63;

      // Flower head
      const colors = ['rgba(220, 100, 180, 0.8)', 'rgba(180, 120, 220, 0.8)', 'rgba(240, 200, 80, 0.8)'];
      ctx.fillStyle = colors[i % 3];
      ctx.beginPath();
      ctx.arc(x, y - 6, 3, 0, Math.PI * 2);
      ctx.fill();

      // Stem
      ctx.strokeStyle = 'rgba(80, 120, 60, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 6);
      ctx.stroke();
    }
    ctx.restore();
  }

  render(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    const cameraX = this.camera.getX();
    const theme = this.levelData.theme.toLowerCase();

    // Draw base background (no camera transform)
    ctx.fillStyle = this.levelData.layout.background.color;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Render theme-specific backgrounds with parallax
    this.renderBackground(ctx, canvasWidth, canvasHeight, cameraX, theme);

    // Apply camera transform for game objects
    ctx.save();
    this.camera.apply(ctx);

    // Draw river water for jungle theme (in world coordinates)
    if (theme === 'jungle') {
      const time = Date.now() / 1000;
      const worldWidth = this.camera.getWorldWidth();
      const riverWidth = worldWidth + 500; // Extend beyond calculated width to ensure full coverage

      // River water - dark murky jungle river at the bottom
      const riverGradient = ctx.createLinearGradient(0, 520, 0, 700);
      riverGradient.addColorStop(0, '#2a5a4a');
      riverGradient.addColorStop(1, '#1a3a2a');
      ctx.fillStyle = riverGradient;
      ctx.fillRect(0, 520, riverWidth, 180);

      // Animated water flow - diagonal lines
      ctx.strokeStyle = 'rgba(60, 140, 100, 0.3)';
      ctx.lineWidth = 2;
      for (let i = 0; i < Math.ceil(riverWidth / 30); i++) {
        const x = i * 30 + ((time * 100) % 60) - 30;
        ctx.beginPath();
        ctx.moveTo(x, 520);
        ctx.lineTo(x + 20, 700);
        ctx.stroke();
      }

      // River ripples and waves
      ctx.strokeStyle = 'rgba(80, 160, 120, 0.4)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < Math.ceil(riverWidth / 60); i++) {
        const x = i * 60 + Math.sin(time * 2 + i * 0.5) * 15;
        const y = 560 + Math.sin(x * 0.02 + time * 1.5) * 3;
        const rippleSize = 12 + Math.sin(time * 1.5 + i) * 3;

        ctx.beginPath();
        ctx.arc(x, y, rippleSize, Math.PI * 1.2, Math.PI * 1.8);
        ctx.stroke();
      }

      // White water foam patches
      ctx.fillStyle = 'rgba(200, 230, 210, 0.5)';
      for (let i = 0; i < Math.ceil(riverWidth / 80); i++) {
        const x = i * 80 + ((time * 80) % 160);
        const y = 570 + Math.sin(time * 3 + i) * 4;
        ctx.beginPath();
        ctx.arc(x, y, 6 + Math.sin(time * 4 + i) * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw platforms
    for (const platform of this.platforms) {
      platform.render(ctx);
    }

    // Draw collectibles
    for (const collectible of this.collectibles) {
      collectible.render(ctx);
    }

    // Draw hazards
    for (const hazard of this.hazards) {
      hazard.render(ctx);
    }

    // Draw goal
    this.goal.render(ctx);

    // Draw player
    if (this.player) {
      this.player.render(ctx);
    }

    // Restore camera transform
    ctx.restore();
  }

  getCompletionTime(): number {
    return (Date.now() - this.startTime) / 1000;
  }

  getDeaths(): number {
    return this.deaths;
  }

  isLevelComplete(): boolean {
    return this.isComplete;
  }

  isLevelFailed(): boolean {
    return this.isFailed;
  }

  getLevelData(): Level {
    return this.levelData;
  }

  getScore(): number {
    return this.score;
  }

  getCoinsCollected(): number {
    return this.coinsCollected;
  }

  getTotalCoins(): number {
    return this.collectibles.length;
  }

  getCurrentCombo(): number {
    return this.coinsThisJump; // Display coins collected in current jump
  }

  getMaxCombo(): number {
    return this.maxCombo;
  }

  private calculateWorldWidth(): number {
    // Find the rightmost point in the level
    let maxX = 0;

    // Check platforms
    for (const platform of this.levelData.layout.platforms) {
      const right = platform.x + platform.width;
      if (right > maxX) maxX = right;
    }

    // Check goal
    const goalRight = this.levelData.layout.goal.x + this.levelData.layout.goal.width;
    if (goalRight > maxX) maxX = goalRight;

    // Add some padding
    return Math.max(maxX + 200, 1300);
  }

  // Set mobile mode - positions camera to show player on left side
  setMobileMode(enabled: boolean, canvasWidth?: number, canvasHeight?: number) {
    if (enabled) {
      // Update camera dimensions for mobile canvas
      if (canvasWidth && canvasHeight) {
        const worldWidth = this.calculateWorldWidth();
        this.camera.resize(canvasWidth, canvasHeight, worldWidth, 700);
      }
      // Keep player at 30% from left so they can see obstacles ahead
      this.camera.setFollowOffset(0.3);
    } else {
      // Default: center player
      this.camera.setFollowOffset(0.5);
    }
  }

  destroy() {
    if (this.player) {
      this.player.destroy();
    }
  }
}

export class LevelManager {
  private currentLevel: GameLevel | null = null;
  private audioManager: AudioManager | null = null;

  constructor(private world: PhysicsWorld, audioManager?: AudioManager) {
    this.audioManager = audioManager || null;
  }

  loadLevel(levelData: Level): GameLevel {
    if (this.currentLevel) {
      this.currentLevel.destroy();
    }

    this.currentLevel = new GameLevel(this.world, levelData, this.audioManager || undefined);
    return this.currentLevel;
  }

  getCurrentLevel(): GameLevel | null {
    return this.currentLevel;
  }

  unloadLevel() {
    if (this.currentLevel) {
      this.currentLevel.destroy();
      this.currentLevel = null;
    }
  }
}
