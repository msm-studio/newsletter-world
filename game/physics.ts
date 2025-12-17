// Simple manual physics - no Rapier for now
export class PhysicsWorld {
  private gravity = 800.0; // Increased gravity for faster falls
  private bodies: PhysicsBody[] = [];
  private platforms: Platform[] = [];

  async initialize() {
    // No async initialization needed
  }

  step(deltaTime: number) {
    // Apply gravity and update all bodies
    for (const body of this.bodies) {
      body.resetGroundedFlag(); // Reset at start of physics update
      body.applyGravity(this.gravity, deltaTime);
      body.integrateVelocity(deltaTime);

      // Check collisions with platforms
      for (const platform of this.platforms) {
        body.checkPlatformCollision(platform);
      }
    }
  }

  registerBody(body: PhysicsBody) {
    this.bodies.push(body);
  }

  unregisterBody(body: PhysicsBody) {
    const index = this.bodies.indexOf(body);
    if (index > -1) {
      this.bodies.splice(index, 1);
    }
  }

  registerPlatform(platform: Platform) {
    this.platforms.push(platform);
  }
}

// Character physics parameters
export interface CharacterPhysics {
  speed: number;
  jumpForce: number;
  mass: number;
  airControl: number;
  floatTime: number;
}

export class PhysicsBody {
  private world: PhysicsWorld;
  private physics: CharacterPhysics;
  private position: { x: number; y: number };
  private velocity: { x: number; y: number } = { x: 0, y: 0 };
  private width: number;
  private height: number;
  private jumpTimeRemaining: number = 0;
  private floatTimeRemaining: number = 0;
  private lastGrounded: boolean = false;
  private grounded: boolean = false;

  constructor(
    world: PhysicsWorld,
    x: number,
    y: number,
    width: number,
    height: number,
    physics: CharacterPhysics
  ) {
    this.world = world;
    this.physics = physics;
    this.position = { x, y };
    this.width = width;
    this.height = height;
    world.registerBody(this);
  }

  updateCache() {
    // No-op for manual physics
  }

  getPosition(): { x: number; y: number } {
    return this.position;
  }

  getVelocity(): { x: number; y: number } {
    return this.velocity;
  }

  setVelocity(x: number, y: number) {
    this.velocity = { x, y };
  }

  applyGravity(gravity: number, deltaTime: number) {
    this.velocity.y += gravity * deltaTime;
  }

  integrateVelocity(deltaTime: number) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  checkPlatformCollision(platform: Platform) {
    const platformPos = platform.getPosition();
    const platformLeft = platformPos.x - platformPos.width / 2;
    const platformRight = platformPos.x + platformPos.width / 2;
    const platformTop = platformPos.y - platformPos.height / 2;
    const platformBottom = platformPos.y + platformPos.height / 2;

    const bodyLeft = this.position.x - this.width / 2;
    const bodyRight = this.position.x + this.width / 2;
    const bodyTop = this.position.y - this.height / 2;
    const bodyBottom = this.position.y + this.height / 2;

    // Check if overlapping horizontally
    if (bodyRight > platformLeft && bodyLeft < platformRight) {
      // Landing on top
      if (bodyBottom > platformTop && bodyBottom < platformBottom && this.velocity.y > 0) {
        this.position.y = platformTop - this.height / 2;
        this.velocity.y = 0;
        this.grounded = true;
        return;
      }
      // Hitting bottom
      if (bodyTop < platformBottom && bodyTop > platformTop && this.velocity.y < 0) {
        this.position.y = platformBottom + this.height / 2;
        this.velocity.y = 0;
        return;
      }
    }

    // Check if overlapping vertically
    if (bodyBottom > platformTop && bodyTop < platformBottom) {
      // Hitting from left
      if (bodyRight > platformLeft && bodyRight < platformRight && this.velocity.x > 0) {
        this.position.x = platformLeft - this.width / 2;
        this.velocity.x = 0;
        return;
      }
      // Hitting from right
      if (bodyLeft < platformRight && bodyLeft > platformLeft && this.velocity.x < 0) {
        this.position.x = platformRight + this.width / 2;
        this.velocity.x = 0;
        return;
      }
    }
  }

  moveHorizontal(direction: number, deltaTime: number) {
    const isGrounded = this.isGrounded();
    const controlFactor = isGrounded ? 1.0 : this.physics.airControl;
    const targetVelX = direction * this.physics.speed * 80; // Scale for pixel velocity

    // Smooth acceleration
    const acceleration = (targetVelX - this.velocity.x) * controlFactor * 10;
    this.velocity.x += acceleration * deltaTime;

    // Apply damping
    this.velocity.x *= 0.85;
  }

  jump(isJumpHeld: boolean, deltaTime: number, onJumpStart?: () => void) {
    const isGrounded = this.isGrounded();

    // Start jump from ground
    if (isGrounded && isJumpHeld && this.jumpTimeRemaining <= 0) {
      this.jumpTimeRemaining = 0.2;
      this.velocity.y = -this.physics.jumpForce * 40; // Higher jump for platform navigation
      this.grounded = false;

      // Trigger jump sound callback
      if (onJumpStart) {
        onJumpStart();
      }
    }

    // Variable jump height
    if (this.jumpTimeRemaining > 0) {
      this.jumpTimeRemaining -= deltaTime;

      if (!isJumpHeld) {
        if (this.velocity.y < 0) {
          this.velocity.y *= 0.5;
        }
        this.jumpTimeRemaining = 0;
      }
    }

    // Floating (Axolotl)
    if (!isGrounded && this.physics.floatTime > 0) {
      if (this.lastGrounded) {
        this.floatTimeRemaining = this.physics.floatTime;
      }

      if (this.floatTimeRemaining > 0 && this.velocity.y > 0) {
        this.floatTimeRemaining -= deltaTime;
        this.velocity.y *= 0.8;
      }
    } else {
      this.floatTimeRemaining = this.physics.floatTime;
    }

    this.lastGrounded = isGrounded;
  }

  isGrounded(): boolean {
    return this.grounded;
  }

  resetGroundedFlag() {
    // Called at start of physics update
    this.grounded = false;
  }

  destroy() {
    this.world.unregisterBody(this);
  }
}

// Platform - static collision object
export class Platform {
  private position: { x: number; y: number; width: number; height: number };

  constructor(
    world: PhysicsWorld,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.position = { x, y, width, height };
    world.registerPlatform(this);
  }

  getPosition(): { x: number; y: number; width: number; height: number } {
    return this.position;
  }
}
