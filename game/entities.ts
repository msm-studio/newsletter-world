import { PhysicsWorld, PhysicsBody, Platform, CharacterPhysics } from './physics';
import { Animation, drawCharacterSprite } from './animation';
import { InputManager } from './input';
import { Character } from '@/db/supabase';

export class Player {
  private physicsBody: PhysicsBody;
  private animation: Animation;
  private characterData: Character;
  private width = 32;
  private height = 48;
  private facingRight = true;
  private onJumpCallback?: () => void;

  constructor(
    world: PhysicsWorld,
    characterData: Character,
    startX: number,
    startY: number,
    onJumpCallback?: () => void
  ) {
    this.characterData = characterData;
    this.onJumpCallback = onJumpCallback;

    const physics: CharacterPhysics = {
      speed: characterData.speed,
      jumpForce: characterData.jump_force,
      mass: characterData.mass,
      airControl: characterData.air_control,
      floatTime: characterData.float_time,
    };

    this.physicsBody = new PhysicsBody(
      world,
      startX,
      startY,
      this.width,
      this.height,
      physics
    );

    this.animation = new Animation(characterData.name);
  }

  update(input: InputManager, deltaTime: number) {
    // Handle horizontal movement
    let moveDirection = 0;
    if (input.left) moveDirection -= 1;
    if (input.right) moveDirection += 1;

    if (moveDirection !== 0) {
      this.facingRight = moveDirection > 0;
      this.physicsBody.moveHorizontal(moveDirection, deltaTime);
    }

    // Handle jumping
    this.physicsBody.jump(input.jump, deltaTime, this.onJumpCallback);

    // Update animation
    const velocity = this.physicsBody.getVelocity();
    const isGrounded = this.physicsBody.isGrounded();
    this.animation.update(deltaTime, velocity.x, velocity.y, isGrounded);
  }

  render(ctx: CanvasRenderingContext2D) {
    const pos = this.physicsBody.getPosition();
    const frame = this.animation.getCurrentFrame();

    drawCharacterSprite(
      ctx,
      this.characterData.name,
      frame.state,
      frame.index,
      pos.x - this.width / 2,
      pos.y - this.height / 2,
      this.width,
      this.height,
      this.facingRight,
      frame.isBlinking
    );
  }

  getPosition() {
    return this.physicsBody.getPosition();
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    const pos = this.physicsBody.getPosition();
    return {
      x: pos.x - this.width / 2,
      y: pos.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }

  getPhysicsBody() {
    return this.physicsBody;
  }

  destroy() {
    this.physicsBody.destroy();
  }
}

export class Hazard {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public type: string
  ) {}

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Use position-based seed for procedural variation
    const seed = Math.sin(this.x * 0.1 + this.y * 0.1) * 10000;
    const variation1 = Math.abs(Math.sin(seed * 1.234));
    const variation2 = Math.abs(Math.sin(seed * 5.678));
    const variation3 = Math.abs(Math.sin(seed * 9.012));

    if (this.type === 'cactus') {
      // Saguaro cactus - clearly recognizable and dangerous
      const numArms = Math.floor(variation1 * 3); // 0-2 arms
      const armPositions = [0.35, 0.55, 0.45]; // Different heights for variety

      // Shadow for depth
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(this.x + this.width + 2, this.y + this.height * 0.8, this.width * 0.4, this.height * 0.2);

      // Main trunk - rounded top
      const trunkGrad = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
      trunkGrad.addColorStop(0, '#1a4d0f');
      trunkGrad.addColorStop(0.5, '#2d6b1f');
      trunkGrad.addColorStop(1, '#1a4d0f');
      ctx.fillStyle = trunkGrad;
      ctx.fillRect(this.x, this.y + 6, this.width, this.height - 6);

      // Rounded top
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + 6, this.width / 2, Math.PI, 0);
      ctx.fill();

      // Vertical ribs for texture
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(this.x + (this.width / 3) * i, this.y + 8);
        ctx.lineTo(this.x + (this.width / 3) * i, this.y + this.height);
        ctx.stroke();
      }

      // Arms with rounded ends
      for (let i = 0; i < numArms; i++) {
        const side = i % 2 === 0 ? -1 : 1; // Alternate sides
        const armY = this.y + this.height * armPositions[i];
        const armWidth = this.width * 0.7;
        const armHeight = 20 + variation2 * 15;
        const armX = side < 0 ? this.x - armWidth : this.x + this.width;

        ctx.fillStyle = trunkGrad;
        // Vertical part
        ctx.fillRect(armX, armY - armHeight * 0.6, armWidth, armHeight);
        // Horizontal part
        ctx.fillRect(armX, armY, armWidth, armHeight * 0.5);

        // Rounded end of vertical part
        ctx.beginPath();
        ctx.arc(armX + armWidth / 2, armY - armHeight * 0.6, armWidth / 2, Math.PI, 0);
        ctx.fill();
      }

      // Sharp needle spikes - make it clearly dangerous!
      ctx.fillStyle = '#654321';
      const spikeCount = 8 + Math.floor(variation3 * 6);
      for (let i = 0; i < spikeCount; i++) {
        const spikeX = this.x + (this.width * 0.2) + Math.random() * (this.width * 0.6);
        const spikeY = this.y + 10 + Math.random() * (this.height - 15);
        const spikeLen = 3 + Math.random() * 4;

        ctx.beginPath();
        ctx.moveTo(spikeX, spikeY);
        ctx.lineTo(spikeX - spikeLen * 0.5, spikeY - spikeLen);
        ctx.lineTo(spikeX + spikeLen * 0.5, spikeY - spikeLen);
        ctx.closePath();
        ctx.fill();
      }
    } else if (this.type === 'icicle' || this.type === 'ice_spike') {
      // Ice spike pointing UP from ground - clearly sharp and dangerous
      const baseWidth = this.width * (0.7 + variation1 * 0.5);
      const tilt = (variation2 - 0.5) * this.width * 0.3;

      // Shadow at base
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(this.x + this.width / 2, this.y + this.height - 2, baseWidth * 0.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main ice spike with gradient (bottom to top)
      const icicleGrad = ctx.createLinearGradient(this.x, this.y + this.height, this.x, this.y);
      icicleGrad.addColorStop(0, '#a0d8e8');
      icicleGrad.addColorStop(0.5, '#c0e8f9');
      icicleGrad.addColorStop(1, '#e0f4ff');
      ctx.fillStyle = icicleGrad;

      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2 + tilt, this.y); // Sharp point at TOP
      ctx.lineTo(this.x + this.width / 2 - baseWidth / 2, this.y + this.height - 3);
      ctx.lineTo(this.x + this.width / 2 + baseWidth / 2, this.y + this.height - 3);
      ctx.closePath();
      ctx.fill();

      // Ice base at ground
      ctx.beginPath();
      ctx.ellipse(this.x + this.width / 2, this.y + this.height - 2, baseWidth * 0.6, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Highlight to show it's ice/glass - on the left side
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2 + tilt * 0.7, this.y + 5);
      ctx.lineTo(this.x + this.width / 2 - baseWidth * 0.3, this.y + this.height - 8);
      ctx.lineTo(this.x + this.width / 2 - baseWidth * 0.15, this.y + this.height - 8);
      ctx.closePath();
      ctx.fill();

      // Secondary smaller spikes for variety
      if (variation3 > 0.5) {
        ctx.fillStyle = '#c0e8f9';
        const sideSpikes = 1 + Math.floor(variation3 * 2);
        for (let i = 0; i < sideSpikes; i++) {
          const side = i % 2 === 0 ? -1 : 1;
          const spikeX = this.x + this.width / 2 + side * baseWidth * 0.4;
          const spikeHeight = this.height * (0.4 + variation3 * 0.3);
          ctx.beginPath();
          ctx.moveTo(spikeX, this.y + this.height - spikeHeight);
          ctx.lineTo(spikeX - 4, this.y + this.height - 3);
          ctx.lineTo(spikeX + 4, this.y + this.height - 3);
          ctx.closePath();
          ctx.fill();
        }
      }
    } else if (this.type === 'thorn') {
      // Spiky thorn bush - clearly dangerous
      const numClusters = 2 + Math.floor(variation1 * 2);

      // Base/ground
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(this.x, this.y + this.height - 3, this.width, 3);

      for (let cluster = 0; cluster < numClusters; cluster++) {
        const clusterX = this.x + (this.width / (numClusters + 1)) * (cluster + 1);
        const clusterSize = 12 + variation2 * 10;

        // Dark green bushy base
        const bushGrad = ctx.createRadialGradient(clusterX, this.y + this.height - clusterSize, 0, clusterX, this.y + this.height - clusterSize, clusterSize);
        bushGrad.addColorStop(0, '#2d5016');
        bushGrad.addColorStop(1, '#1a3010');
        ctx.fillStyle = bushGrad;
        ctx.beginPath();
        ctx.arc(clusterX, this.y + this.height - clusterSize * 0.5, clusterSize, 0, Math.PI * 2);
        ctx.fill();

        // Sharp thorns radiating outward - very dangerous looking!
        ctx.fillStyle = '#654321';
        ctx.strokeStyle = '#4a3210';
        ctx.lineWidth = 1.5;
        const thorns = 8 + Math.floor(variation3 * 4);
        for (let i = 0; i < thorns; i++) {
          const angle = (i / thorns) * Math.PI * 2;
          const thornLen = 6 + Math.random() * 8;
          const startX = clusterX + Math.cos(angle) * (clusterSize * 0.7);
          const startY = this.y + this.height - clusterSize * 0.5 + Math.sin(angle) * (clusterSize * 0.7);
          const endX = startX + Math.cos(angle) * thornLen;
          const endY = startY + Math.sin(angle) * thornLen;

          // Thorn as triangle
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(startX + Math.cos(angle + Math.PI / 2) * 1.5, startY + Math.sin(angle + Math.PI / 2) * 1.5);
          ctx.lineTo(startX + Math.cos(angle - Math.PI / 2) * 1.5, startY + Math.sin(angle - Math.PI / 2) * 1.5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    } else if (this.type === 'crab') {
      // Snapping crab - clearly a creature hazard
      const time = Date.now() / 1000;
      const snapAnimation = Math.sin(time * 3 + this.x * 0.1) * 0.3 + 0.7;

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(this.x + 2, this.y + this.height - 2, this.width - 4, 3);

      // Body - rounded shell
      const bodyGrad = ctx.createRadialGradient(this.x + this.width / 2, this.y + this.height * 0.5, 0, this.x + this.width / 2, this.y + this.height * 0.5, this.width * 0.5);
      bodyGrad.addColorStop(0, '#f08080');
      bodyGrad.addColorStop(1, '#cd5c5c');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height * 0.5, this.width * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Shell pattern
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height * 0.5, (this.width * 0.15) * (i + 1), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Snapping claws - animated
      const clawSize = 8;
      const clawOpenAngle = snapAnimation * 0.5;

      // Left claw
      ctx.fillStyle = '#b04040';
      ctx.beginPath();
      ctx.arc(this.x + 2, this.y + this.height * 0.5, clawSize, 0, Math.PI * 2);
      ctx.fill();
      // Pincer
      ctx.fillStyle = '#903030';
      ctx.beginPath();
      ctx.moveTo(this.x + 2, this.y + this.height * 0.5);
      ctx.lineTo(this.x - clawSize, this.y + this.height * 0.5 - clawSize * clawOpenAngle);
      ctx.lineTo(this.x - clawSize, this.y + this.height * 0.5 + clawSize * clawOpenAngle);
      ctx.closePath();
      ctx.fill();

      // Right claw
      ctx.fillStyle = '#b04040';
      ctx.beginPath();
      ctx.arc(this.x + this.width - 2, this.y + this.height * 0.5, clawSize, 0, Math.PI * 2);
      ctx.fill();
      // Pincer
      ctx.fillStyle = '#903030';
      ctx.beginPath();
      ctx.moveTo(this.x + this.width - 2, this.y + this.height * 0.5);
      ctx.lineTo(this.x + this.width + clawSize, this.y + this.height * 0.5 - clawSize * clawOpenAngle);
      ctx.lineTo(this.x + this.width + clawSize, this.y + this.height * 0.5 + clawSize * clawOpenAngle);
      ctx.closePath();
      ctx.fill();

      // Eyes on stalks
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x + this.width * 0.35, this.y + this.height * 0.2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x + this.width * 0.65, this.y + this.height * 0.2, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(this.x + this.width * 0.35, this.y + this.height * 0.2, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x + this.width * 0.65, this.y + this.height * 0.2, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Legs
      ctx.strokeStyle = '#cd5c5c';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const legX = this.x + this.width * (0.3 + i * 0.15);
        const legAngle = (i % 2) * 0.3 + 0.2;
        ctx.beginPath();
        ctx.moveTo(legX, this.y + this.height * 0.6);
        ctx.lineTo(legX + Math.cos(legAngle) * 8, this.y + this.height - 3);
        ctx.stroke();
      }
    } else if (this.type === 'piranha') {
      // Piranha fish - dangerous river creature
      const time = Date.now() / 1000;
      const swimAnimation = Math.sin(time * 4 + this.x * 0.1);
      const mouthOpen = Math.abs(Math.sin(time * 6 + this.x * 0.1)) * 0.5;

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(this.x + 2, this.y + this.height - 2, this.width - 4, 3);

      // Body - fish shape with gradient
      const bodyGrad = ctx.createRadialGradient(
        this.x + this.width * 0.3, this.y + this.height * 0.3,
        0,
        this.x + this.width / 2, this.y + this.height / 2,
        this.width * 0.6
      );
      bodyGrad.addColorStop(0, '#e85050');
      bodyGrad.addColorStop(0.5, '#c03030');
      bodyGrad.addColorStop(1, '#902020');
      ctx.fillStyle = bodyGrad;

      // Main body (oval)
      ctx.beginPath();
      ctx.ellipse(
        this.x + this.width * 0.45, this.y + this.height * 0.5,
        this.width * 0.4, this.height * 0.35,
        0, 0, Math.PI * 2
      );
      ctx.fill();

      // Tail fin
      ctx.fillStyle = '#c03030';
      ctx.beginPath();
      ctx.moveTo(this.x + this.width * 0.05, this.y + this.height * 0.5);
      ctx.lineTo(this.x, this.y + this.height * 0.3 + swimAnimation * 3);
      ctx.lineTo(this.x + this.width * 0.15, this.y + this.height * 0.5);
      ctx.lineTo(this.x, this.y + this.height * 0.7 + swimAnimation * 3);
      ctx.closePath();
      ctx.fill();

      // Dorsal fin
      ctx.fillStyle = '#a02828';
      ctx.beginPath();
      ctx.moveTo(this.x + this.width * 0.45, this.y + this.height * 0.15);
      ctx.lineTo(this.x + this.width * 0.4, this.y + this.height * 0.4);
      ctx.lineTo(this.x + this.width * 0.55, this.y + this.height * 0.35);
      ctx.closePath();
      ctx.fill();

      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x + this.width * 0.65, this.y + this.height * 0.4, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(this.x + this.width * 0.65, this.y + this.height * 0.4, 2, 0, Math.PI * 2);
      ctx.fill();

      // Mouth with sharp teeth
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(
        this.x + this.width * 0.75, this.y + this.height * 0.55,
        5 + mouthOpen * 8,
        Math.PI * 0.2, Math.PI * 0.8
      );
      ctx.stroke();

      // Sharp teeth
      ctx.fillStyle = '#ffffff';
      const numTeeth = 4;
      for (let i = 0; i < numTeeth; i++) {
        const angle = Math.PI * (0.2 + (i / numTeeth) * 0.6);
        const toothX = this.x + this.width * 0.75 + Math.cos(angle) * (5 + mouthOpen * 8);
        const toothY = this.y + this.height * 0.55 + Math.sin(angle) * (5 + mouthOpen * 8);

        ctx.beginPath();
        ctx.moveTo(toothX, toothY);
        ctx.lineTo(toothX + Math.cos(angle) * 3, toothY + Math.sin(angle) * 3);
        ctx.lineTo(toothX - 1, toothY);
        ctx.closePath();
        ctx.fill();
      }

      // Scales pattern
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(
          this.x + this.width * (0.25 + i * 0.1),
          this.y + this.height * 0.5,
          4, 0, Math.PI
        );
        ctx.stroke();
      }
    } else if (this.type === 'rock') {
      // Simple jagged triangular rock spike
      const baseWidth = this.width * (0.8 + variation1 * 0.3);
      const tilt = (variation2 - 0.5) * this.width * 0.15;

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(this.x + this.width * 0.1, this.y + this.height - 2, this.width * 0.8, 3);

      // Rock gradient
      const rockGrad = ctx.createLinearGradient(this.x, this.y + this.height, this.x, this.y);
      rockGrad.addColorStop(0, '#505050');
      rockGrad.addColorStop(0.5, '#707070');
      rockGrad.addColorStop(1, '#888888');
      ctx.fillStyle = rockGrad;

      // Simple triangular shape with slight jaggedness
      ctx.beginPath();
      // Sharp point at top
      ctx.moveTo(this.x + this.width / 2 + tilt, this.y + 2);

      // Right side with 2-3 small jags
      ctx.lineTo(this.x + this.width / 2 + baseWidth * 0.25, this.y + this.height * 0.4);
      ctx.lineTo(this.x + this.width / 2 + baseWidth * 0.35, this.y + this.height * 0.5);
      ctx.lineTo(this.x + this.width / 2 + baseWidth * 0.45, this.y + this.height * 0.7);
      ctx.lineTo(this.x + this.width / 2 + baseWidth * 0.5, this.y + this.height - 3);

      // Bottom
      ctx.lineTo(this.x + this.width / 2 - baseWidth * 0.5, this.y + this.height - 3);

      // Left side with 2-3 small jags
      ctx.lineTo(this.x + this.width / 2 - baseWidth * 0.45, this.y + this.height * 0.7);
      ctx.lineTo(this.x + this.width / 2 - baseWidth * 0.35, this.y + this.height * 0.5);
      ctx.lineTo(this.x + this.width / 2 - baseWidth * 0.25, this.y + this.height * 0.4);

      ctx.closePath();
      ctx.fill();

      // Dark edge on one side for depth
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2 + tilt, this.y + 2);
      ctx.lineTo(this.x + this.width / 2 + baseWidth * 0.25, this.y + this.height * 0.4);
      ctx.lineTo(this.x + this.width / 2 + baseWidth * 0.35, this.y + this.height * 0.5);
      ctx.lineTo(this.x + this.width / 2 + baseWidth * 0.45, this.y + this.height * 0.7);
      ctx.lineTo(this.x + this.width / 2 + baseWidth * 0.5, this.y + this.height - 3);
      ctx.lineTo(this.x + this.width / 2, this.y + this.height - 3);
      ctx.closePath();
      ctx.fill();
    } else {
      // Generic hazard
      const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
      ctx.fillStyle = `rgba(255, 0, 0, ${pulse})`;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = '#8B0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    ctx.restore();
  }

  checkCollision(player: Player): boolean {
    const playerBounds = player.getBounds();

    return (
      playerBounds.x < this.x + this.width &&
      playerBounds.x + playerBounds.width > this.x &&
      playerBounds.y < this.y + this.height &&
      playerBounds.y + playerBounds.height > this.y
    );
  }
}

export class Goal {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    const time = Date.now() / 1000;

    // Platform surface is 20px below the goal box bottom (standard positioning)
    // This matches how most levels position their goal boxes
    const platformY = this.y + this.height + 20;
    const poleHeight = this.height;

    // Pulsing scale effect centered on the flag pole
    const scale = 0.95 + Math.sin(time * 2) * 0.05;
    ctx.translate(this.x + this.width / 2, platformY - poleHeight / 2);
    ctx.scale(scale, scale);
    ctx.translate(-(this.x + this.width / 2), -(platformY - poleHeight / 2));

    // Flag pole base (small platform at surface level)
    ctx.fillStyle = '#654321';
    ctx.fillRect(this.x + this.width / 2 - 5, platformY - 4, 10, 4);

    // Flag pole with gradient - extends upward from platform surface
    const poleGradient = ctx.createLinearGradient(
      this.x + this.width / 2 - 3, platformY - poleHeight,
      this.x + this.width / 2 + 3, platformY
    );
    poleGradient.addColorStop(0, '#6B3410');
    poleGradient.addColorStop(0.5, '#8B4513');
    poleGradient.addColorStop(1, '#6B3410');
    ctx.fillStyle = poleGradient;
    ctx.fillRect(this.x + this.width / 2 - 3, platformY - poleHeight, 6, poleHeight);

    // Flag with gradient - at the top of the pole
    const flagGradient = ctx.createLinearGradient(
      this.x + this.width / 2, platformY - poleHeight + 5,
      this.x + this.width / 2 + 30, platformY - poleHeight + 15
    );
    flagGradient.addColorStop(0, '#FFD700');
    flagGradient.addColorStop(1, '#FFA500');
    ctx.fillStyle = flagGradient;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, platformY - poleHeight + 5);
    ctx.lineTo(this.x + this.width / 2 + 30, platformY - poleHeight + 15);
    ctx.lineTo(this.x + this.width / 2, platformY - poleHeight + 25);
    ctx.closePath();
    ctx.fill();

    // Flag outline
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Rotating sparkle particles around the middle of the flag pole
    const sparkleCount = 6;
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (time * 2 + (i / sparkleCount) * Math.PI * 2);
      const radius = 25 + Math.sin(time * 3 + i) * 5;
      const sparkleX = this.x + this.width / 2 + Math.cos(angle) * radius;
      const sparkleY = platformY - poleHeight / 2 + Math.sin(angle) * radius;

      const sparkleAlpha = Math.sin(time * 4 + i) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(255, 255, 0, ${sparkleAlpha})`;
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  checkCollision(player: Player): boolean {
    const playerBounds = player.getBounds();

    return (
      playerBounds.x < this.x + this.width &&
      playerBounds.x + playerBounds.width > this.x &&
      playerBounds.y < this.y + this.height &&
      playerBounds.y + playerBounds.height > this.y
    );
  }
}

export class LevelPlatform {
  private platform: Platform;
  private index: number;

  constructor(
    world: PhysicsWorld,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public type: string,
    index: number = 0
  ) {
    this.platform = new Platform(world, x, y, width, height);
    this.index = index;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    const pos = this.platform.getPosition();
    const x = pos.x - pos.width / 2;
    const y = pos.y - pos.height / 2;

    // Platform gradient based on type with alternating light/dark
    const isLight = this.index % 2 === 0;
    let gradient = ctx.createLinearGradient(x, y, x + pos.width, y);

    if (this.type === 'ground') {
      if (isLight) {
        gradient.addColorStop(0, '#8B7355');
        gradient.addColorStop(0.5, '#9C8466');
        gradient.addColorStop(1, '#8B7355');
      } else {
        gradient.addColorStop(0, '#6A5236');
        gradient.addColorStop(0.5, '#7A6347');
        gradient.addColorStop(1, '#6A5236');
      }
    } else if (this.type === 'sand') {
      if (isLight) {
        gradient.addColorStop(0, '#E4C088');
        gradient.addColorStop(0.5, '#EDD09E');
        gradient.addColorStop(1, '#E4C088');
      } else {
        gradient.addColorStop(0, '#C4A064');
        gradient.addColorStop(0.5, '#D4B078');
        gradient.addColorStop(1, '#C4A064');
      }
    } else if (this.type === 'ice') {
      if (isLight) {
        gradient.addColorStop(0, '#C0E8F9');
        gradient.addColorStop(0.5, '#D0F0FF');
        gradient.addColorStop(1, '#C0E8F9');
      } else {
        gradient.addColorStop(0, '#98C8D9');
        gradient.addColorStop(0.5, '#A8D8EA');
        gradient.addColorStop(1, '#98C8D9');
      }
    } else if (this.type === 'snow') {
      if (isLight) {
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.5, '#FFFFFF');
        gradient.addColorStop(1, '#FFFFFF');
      } else {
        gradient.addColorStop(0, '#E8F0F8');
        gradient.addColorStop(0.5, '#F0F8FF');
        gradient.addColorStop(1, '#E8F0F8');
      }
    } else if (this.type === 'wood') {
      if (isLight) {
        gradient.addColorStop(0, '#A0522D');
        gradient.addColorStop(0.5, '#B8653E');
        gradient.addColorStop(1, '#A0522D');
      } else {
        gradient.addColorStop(0, '#7A3F1F');
        gradient.addColorStop(0.5, '#8B4513');
        gradient.addColorStop(1, '#7A3F1F');
      }
    } else if (this.type === 'vine') {
      if (isLight) {
        gradient.addColorStop(0, '#3A6B1F');
        gradient.addColorStop(0.5, '#4A7B2F');
        gradient.addColorStop(1, '#3A6B1F');
      } else {
        gradient.addColorStop(0, '#254010');
        gradient.addColorStop(0.5, '#2D5016');
        gradient.addColorStop(1, '#254010');
      }
    } else if (this.type === 'stone') {
      if (isLight) {
        gradient.addColorStop(0, '#808080');
        gradient.addColorStop(0.5, '#909090');
        gradient.addColorStop(1, '#808080');
      } else {
        gradient.addColorStop(0, '#606060');
        gradient.addColorStop(0.5, '#696969');
        gradient.addColorStop(1, '#606060');
      }
    } else {
      if (isLight) {
        gradient.addColorStop(0, '#A0A0A0');
        gradient.addColorStop(0.5, '#B0B0B0');
        gradient.addColorStop(1, '#A0A0A0');
      } else {
        gradient.addColorStop(0, '#808080');
        gradient.addColorStop(0.5, '#909090');
        gradient.addColorStop(1, '#808080');
      }
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, pos.width, pos.height);

    // Top highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x, y, pos.width, 2);

    // Bottom shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x, y + pos.height - 2, pos.width, 2);

    // Border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, pos.width, pos.height);

    ctx.restore();
  }
}

// Collectible coin entity
export class Collectible {
  private x: number;
  private y: number;
  private width: number = 20;
  private height: number = 20;
  private collected: boolean = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.collected) return;

    ctx.save();

    // Floating animation
    const time = Date.now() / 1000;
    const floatOffset = Math.sin(time * 3 + this.x * 0.01) * 3;

    // Glow effect
    const glowGradient = ctx.createRadialGradient(
      this.x, this.y + floatOffset,
      0,
      this.x, this.y + floatOffset,
      this.width
    );
    glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
    glowGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)');
    glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y + floatOffset, this.width, 0, Math.PI * 2);
    ctx.fill();

    // Coin body with gradient
    const coinGradient = ctx.createRadialGradient(
      this.x - 3, this.y + floatOffset - 3,
      0,
      this.x, this.y + floatOffset,
      this.width / 2
    );
    coinGradient.addColorStop(0, '#FFD700');
    coinGradient.addColorStop(0.5, '#FFA500');
    coinGradient.addColorStop(1, '#FF8C00');
    ctx.fillStyle = coinGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y + floatOffset, this.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // Inner circle detail
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(this.x, this.y + floatOffset, this.width / 3, 0, Math.PI * 2);
    ctx.fill();

    // Shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(this.x - 2, this.y + floatOffset - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  checkCollision(player: Player): boolean {
    if (this.collected) return false;

    const playerBounds = player.getBounds();
    const coinRadius = this.width / 2;

    // Check if player's bounding box overlaps with coin circle
    return (
      playerBounds.x < this.x + coinRadius &&
      playerBounds.x + playerBounds.width > this.x - coinRadius &&
      playerBounds.y < this.y + coinRadius &&
      playerBounds.y + playerBounds.height > this.y - coinRadius
    );
  }

  collect() {
    this.collected = true;
  }

  isCollected(): boolean {
    return this.collected;
  }

  reset() {
    this.collected = false;
  }
}
