// Camera system for side-scrolling

export class Camera {
  private x: number = 0;
  private y: number = 0;
  private canvasWidth: number;
  private canvasHeight: number;
  private worldWidth: number;
  private worldHeight: number;
  // How far from the left edge the player should be (0 = left edge, 0.5 = center, 1 = right edge)
  private followOffset: number = 0.5;

  constructor(canvasWidth: number, canvasHeight: number, worldWidth: number, worldHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
  }

  // Set follow offset (0 = player on left, 0.5 = center, 1 = right)
  setFollowOffset(offset: number) {
    this.followOffset = Math.max(0, Math.min(1, offset));
  }

  // Follow a target (player)
  follow(targetX: number, targetY: number) {
    // Position camera so player is at the follow offset position
    this.x = targetX - this.canvasWidth * this.followOffset;

    // Keep camera within world bounds
    this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.canvasWidth));

    // Keep vertical camera relatively static (or centered)
    this.y = Math.max(0, Math.min(targetY - this.canvasHeight / 2, this.worldHeight - this.canvasHeight));
  }

  // Get camera position
  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getWorldWidth(): number {
    return this.worldWidth;
  }

  // Apply camera transform to canvas context
  apply(ctx: CanvasRenderingContext2D) {
    ctx.translate(-this.x, -this.y);
  }

  // Reset camera transform
  reset(ctx: CanvasRenderingContext2D) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // Update canvas/world dimensions
  resize(canvasWidth: number, canvasHeight: number, worldWidth: number, worldHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
  }
}
