// Animation system for character sprites

export type AnimationState = 'idle' | 'run' | 'jump' | 'fall';

export interface AnimationFrame {
  state: AnimationState;
  frameIndex: number;
  duration: number;
}

export class Animation {
  private currentState: AnimationState = 'idle';
  private frameIndex: number = 0;
  private frameTime: number = 0;
  private frameDuration: number = 0.1; // seconds per frame
  private blinkTimer: number = 0;
  private isBlinking: boolean = false;
  private nextBlinkTime: number = 2 + Math.random() * 3; // Random 2-5 seconds

  // Frame counts for each animation state
  private frameCounts: Record<AnimationState, number> = {
    idle: 4,
    run: 6,
    jump: 1,
    fall: 1,
  };

  constructor(private characterName: string) {}

  update(deltaTime: number, velocityX: number, velocityY: number, isGrounded: boolean) {
    // Determine animation state based on physics
    let newState: AnimationState = 'idle';

    if (!isGrounded) {
      newState = velocityY < 0 ? 'jump' : 'fall';
    } else if (Math.abs(velocityX) > 0.1) {
      newState = 'run';
    }

    // Reset frame if state changed
    if (newState !== this.currentState) {
      this.currentState = newState;
      this.frameIndex = 0;
      this.frameTime = 0;
    }

    // Update frame timing
    this.frameTime += deltaTime;
    if (this.frameTime >= this.frameDuration) {
      this.frameTime = 0;
      this.frameIndex = (this.frameIndex + 1) % this.frameCounts[this.currentState];
    }

    // Update blink timer
    this.blinkTimer += deltaTime;
    if (this.blinkTimer >= this.nextBlinkTime) {
      this.isBlinking = true;
      if (this.blinkTimer >= this.nextBlinkTime + 0.15) {
        // Blink duration 150ms
        this.isBlinking = false;
        this.blinkTimer = 0;
        this.nextBlinkTime = 2 + Math.random() * 3; // Next blink in 2-5 seconds
      }
    }
  }

  getCurrentFrame(): { state: AnimationState; index: number; isBlinking: boolean } {
    return {
      state: this.currentState,
      index: this.frameIndex,
      isBlinking: this.isBlinking,
    };
  }

  getState(): AnimationState {
    return this.currentState;
  }
}

// Enhanced sprite rendering with gradients and details
export function drawCharacterSprite(
  ctx: CanvasRenderingContext2D,
  characterName: string,
  state: AnimationState,
  frameIndex: number,
  x: number,
  y: number,
  width: number,
  height: number,
  facingRight: boolean,
  isBlinking: boolean = false
) {
  ctx.save();

  // Add animation bounce for run cycle
  let bounce = 0;
  if (state === 'run') {
    bounce = Math.sin(frameIndex * Math.PI / 3) * 2;
  }

  // Flip if facing left
  if (!facingRight) {
    ctx.translate(x + width / 2, y + bounce + height / 2);
    ctx.scale(-1, 1);
    ctx.translate(-(x + width / 2), -(y + bounce + height / 2));
  } else {
    ctx.translate(0, bounce);
  }

  // Add drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  // Character-specific rendering
  if (characterName === 'Turtle') {
    drawTurtle(ctx, x, y, width, height, isBlinking);
  } else if (characterName === 'Pig') {
    drawPig(ctx, x, y, width, height, isBlinking);
  } else if (characterName === 'Lemur') {
    drawLemur(ctx, x, y, width, height, isBlinking, frameIndex);
  } else if (characterName === 'Pomeranian') {
    drawPomeranian(ctx, x, y, width, height, isBlinking, frameIndex);
  }

  ctx.restore();
}

function drawTurtle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isBlinking: boolean
) {
  // CHIBI STYLE - big head, tiny body, huge eyes
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Shell (main body - large and round)
  const shellGradient = ctx.createRadialGradient(centerX, centerY + height*0.05, 0, centerX, centerY + height*0.05, width*0.5);
  shellGradient.addColorStop(0, '#4DAF4D');
  shellGradient.addColorStop(1, '#2D7B2D');

  ctx.fillStyle = shellGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY + height*0.05, width*0.45, 0, Math.PI * 2);
  ctx.fill();

  // Shell pattern
  ctx.strokeStyle = '#1a5c1a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY + height*0.05, 8 + i*6, 0, Math.PI * 2);
    ctx.stroke();
  }

  // HUGE head (chibi style - head is disproportionately large)
  const headGradient = ctx.createRadialGradient(x + width*0.8, centerY - height*0.25, 0, x + width*0.8, centerY - height*0.25, 18);
  headGradient.addColorStop(0, '#4DAF4D');
  headGradient.addColorStop(1, '#3D9B3D');

  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.arc(x + width*0.8, centerY - height*0.25, 16, 0, Math.PI * 2);
  ctx.fill();

  // HUGE sparkly eyes
  const eyeX = x + width*0.82;
  const eyeY = centerY - height*0.27;

  if (!isBlinking) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Big white highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX + 2, eyeY - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eyeX - 4, eyeY);
    ctx.lineTo(eyeX + 4, eyeY);
    ctx.stroke();
  }

  // Tiny smile
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x + width*0.8, centerY - height*0.2, 5, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Stubby little legs
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.arc(x + width*0.7, centerY + height*0.35, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width*0.35, centerY + height*0.38, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawPig(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isBlinking: boolean
) {
  // CHIBI STYLE FROM SCRATCH - round body is THE dominant feature

  // Step 1: MASSIVE WIDE body (takes up most of the character)
  const bodyGradient = ctx.createRadialGradient(
    x + width*0.5, y + height*0.5,
    0,
    x + width*0.5, y + height*0.5,
    width*0.5
  );
  bodyGradient.addColorStop(0, '#FFB6C1');
  bodyGradient.addColorStop(1, '#FF9BAE');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  // Make it an ellipse - MUCH WIDER than it is tall (fat pig!)
  ctx.ellipse(x + width*0.5, y + height*0.5, width*0.48, height*0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Step 2: Big snout on front (overlapping body)
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.arc(x + width*0.85, y + height*0.5, 8, 0, Math.PI * 2);
  ctx.fill();

  // Nostrils
  ctx.fillStyle = '#D4909E';
  ctx.beginPath();
  ctx.arc(x + width*0.84, y + height*0.48, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width*0.84, y + height*0.52, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Step 3: Big eyes ON the body
  if (!isBlinking) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + width*0.55, y + height*0.42, 4, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + width*0.56, y + height*0.41, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + width*0.52, y + height*0.42);
    ctx.lineTo(x + width*0.58, y + height*0.42);
    ctx.stroke();
  }

  // Step 4: Small ear on top
  ctx.fillStyle = '#FF9BAE';
  ctx.beginPath();
  ctx.ellipse(x + width*0.3, y + height*0.25, 5, 8, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Step 5: Tiny stubby legs at bottom
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.arc(x + width*0.6, y + height*0.78, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width*0.4, y + height*0.78, 5, 0, Math.PI * 2);
  ctx.fill();

  // Step 6: Small curly tail on back
  ctx.strokeStyle = '#FF9BAE';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + width*0.08, y + height*0.5, 4, 0, Math.PI * 1.5);
  ctx.stroke();
}

function drawLemur(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isBlinking: boolean,
  frameIndex: number
) {
  // REALISTIC CUTE STYLE - natural lemur posture, alert eyes
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Natural lemur body (more vertical)
  const bodyGradient = ctx.createRadialGradient(centerX, centerY + height*0.05, 0, centerX, centerY + height*0.05, width*0.25);
  bodyGradient.addColorStop(0, '#A0522D');
  bodyGradient.addColorStop(0.5, '#8B4513');
  bodyGradient.addColorStop(1, '#6B3410');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + height*0.05, width*0.2, height*0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly patch
  ctx.fillStyle = 'rgba(222, 184, 135, 0.6)';
  ctx.beginPath();
  ctx.ellipse(x + width*0.55, centerY + height*0.08, width*0.12, height*0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.78, centerY - height*0.18, 11, 13, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Face markings
  ctx.fillStyle = '#F5DEB3';
  ctx.beginPath();
  ctx.ellipse(x + width*0.82, centerY - height*0.16, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Alert eyes
  const eyeX = x + width*0.83;
  const eyeY = centerY - height*0.2;

  if (!isBlinking) {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX + 1, eyeY - 1, 1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eyeX - 3, eyeY);
    ctx.lineTo(eyeX + 3, eyeY);
    ctx.stroke();
  }

  // Ear
  ctx.fillStyle = '#6B3410';
  ctx.beginPath();
  ctx.ellipse(x + width*0.72, centerY - height*0.26, 5, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Realistic ringed tail (animated swing)
  const tailSwing = Math.sin(frameIndex * 0.5) * 8;
  const tailSegments = 10;
  for (let i = 0; i < tailSegments; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#8B4513' : '#F5DEB3';
    const progress = i / tailSegments;
    const tailX = x + width*0.22 - i * 5 + tailSwing * progress;
    const tailY = centerY - height*0.12 + Math.sin(progress * Math.PI * 1.2) * 16;

    ctx.beginPath();
    ctx.ellipse(
      tailX,
      tailY,
      7,
      10,
      0.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Realistic legs (longer)
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.58, centerY + height*0.35, 5, 16, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.42, centerY + height*0.35, 5, 16, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Paws
  ctx.fillStyle = '#6B3410';
  ctx.beginPath();
  ctx.ellipse(x + width*0.58, centerY + height*0.48, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.42, centerY + height*0.48, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawPomeranian(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, width: number, height: number,
  isBlinking: boolean, frameIndex: number
) {
  const cx = x + width * 0.5;
  const cy = y + height * 0.5;
  const size = Math.min(width, height);

  // One big oval body
  const bodyGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size*0.45);
  bodyGrad.addColorStop(0, '#FFE0B2');
  bodyGrad.addColorStop(0.6, '#FFCC80');
  bodyGrad.addColorStop(1, '#FF9800');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, size*0.42, size*0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail puff
  ctx.fillStyle = '#FFB74D';
  ctx.beginPath();
  ctx.arc(cx - size*0.38, cy - size*0.05, size*0.14, 0, Math.PI * 2);
  ctx.fill();

  // Chest fluff
  ctx.fillStyle = '#FFF8E1';
  ctx.beginPath();
  ctx.ellipse(cx + size*0.12, cy + size*0.08, size*0.18, size*0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Small round ears on top
  ctx.fillStyle = '#FF9800';
  ctx.beginPath();
  ctx.arc(cx - size*0.2, cy - size*0.32, size*0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + size*0.2, cy - size*0.32, size*0.1, 0, Math.PI * 2);
  ctx.fill();

  // Tiny feet
  ctx.fillStyle = '#FFCC80';
  ctx.beginPath();
  ctx.ellipse(cx - size*0.15, cy + size*0.35, size*0.08, size*0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + size*0.2, cy + size*0.35, size*0.08, size*0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face positioned to the right
  const faceX = cx + size*0.1;
  const faceY = cy - size*0.05;

  // Muzzle
  ctx.fillStyle = '#FFF8E1';
  ctx.beginPath();
  ctx.ellipse(faceX + size*0.08, faceY + size*0.08, size*0.1, size*0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes - simple dots
  if (!isBlinking) {
    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.arc(faceX - size*0.05, faceY, size*0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(faceX + size*0.12, faceY, size*0.05, 0, Math.PI * 2);
    ctx.fill();
    // Sparkles
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(faceX - size*0.03, faceY - size*0.02, size*0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(faceX + size*0.14, faceY - size*0.02, size*0.02, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(faceX - size*0.05, faceY, size*0.035, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(faceX + size*0.12, faceY, size*0.035, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  // Nose
  ctx.fillStyle = '#3E2723';
  ctx.beginPath();
  ctx.arc(faceX + size*0.12, faceY + size*0.08, size*0.035, 0, Math.PI * 2);
  ctx.fill();

  // Simple W mouth
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(faceX + size*0.05, faceY + size*0.14);
  ctx.lineTo(faceX + size*0.1, faceY + size*0.17);
  ctx.lineTo(faceX + size*0.15, faceY + size*0.14);
  ctx.stroke();

  // Blush
  ctx.fillStyle = 'rgba(255,138,128,0.4)';
  ctx.beginPath();
  ctx.ellipse(faceX - size*0.12, faceY + size*0.06, size*0.045, size*0.025, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(faceX + size*0.22, faceY + size*0.06, size*0.045, size*0.025, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isBlinking: boolean
) {
  const eyeY = y + height * 0.3;

  if (!isBlinking) {
    // White of eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + width * 0.35, eyeY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + width * 0.65, eyeY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + width * 0.35, eyeY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + width * 0.65, eyeY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + width * 0.36, eyeY - 1, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + width * 0.66, eyeY - 1, 1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Blinking - draw horizontal lines
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.3, eyeY);
    ctx.lineTo(x + width * 0.4, eyeY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + width * 0.6, eyeY);
    ctx.lineTo(x + width * 0.7, eyeY);
    ctx.stroke();
  }
}
