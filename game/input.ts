// Keyboard input handling system

export class InputManager {
  private keys: Map<string, boolean> = new Map();
  private keyJustPressed: Map<string, boolean> = new Map();
  private _autoRun: boolean = false;

  constructor(autoRun: boolean = false) {
    this._autoRun = autoRun;
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Don't capture input if user is typing in a form field
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Prevent default browser behavior for arrow keys and space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    if (!this.keys.get(e.key)) {
      this.keyJustPressed.set(e.key, true);
    }
    this.keys.set(e.key, true);
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    // Don't capture input if user is typing in a form field
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Prevent default browser behavior
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    this.keys.set(e.key, false);
    this.keyJustPressed.set(e.key, false);
  };

  isKeyDown(key: string): boolean {
    return this.keys.get(key) || false;
  }

  isKeyJustPressed(key: string): boolean {
    const justPressed = this.keyJustPressed.get(key) || false;
    if (justPressed) {
      this.keyJustPressed.set(key, false);
    }
    return justPressed;
  }

  // Convenience methods for common controls
  get left(): boolean {
    return this.isKeyDown('ArrowLeft') || this.isKeyDown('a') || this.isKeyDown('TouchLeft');
  }

  get right(): boolean {
    // In auto-run mode, always move right
    if (this._autoRun) return true;
    return this.isKeyDown('ArrowRight') || this.isKeyDown('d') || this.isKeyDown('TouchRight');
  }

  get autoRun(): boolean {
    return this._autoRun;
  }

  setAutoRun(enabled: boolean) {
    this._autoRun = enabled;
  }

  get jump(): boolean {
    return this.isKeyDown('ArrowUp') || this.isKeyDown('w') || this.isKeyDown(' ') || this.isKeyDown('TouchJump');
  }

  get jumpPressed(): boolean {
    return (
      this.isKeyJustPressed('ArrowUp') ||
      this.isKeyJustPressed('w') ||
      this.isKeyJustPressed(' ') ||
      this.isKeyJustPressed('TouchJump')
    );
  }

  cleanup() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
    }
  }

  update() {
    // Reset just-pressed states each frame
    // This is called after the game logic has read the input
  }

  // Public methods for touch controls to simulate key presses
  setLeft(pressed: boolean) {
    if (pressed && !this.keys.get('TouchLeft')) {
      this.keyJustPressed.set('TouchLeft', true);
    }
    this.keys.set('TouchLeft', pressed);
    if (!pressed) {
      this.keyJustPressed.set('TouchLeft', false);
    }
  }

  setRight(pressed: boolean) {
    if (pressed && !this.keys.get('TouchRight')) {
      this.keyJustPressed.set('TouchRight', true);
    }
    this.keys.set('TouchRight', pressed);
    if (!pressed) {
      this.keyJustPressed.set('TouchRight', false);
    }
  }

  setJump(pressed: boolean) {
    if (pressed && !this.keys.get('TouchJump')) {
      this.keyJustPressed.set('TouchJump', true);
    }
    this.keys.set('TouchJump', pressed);
    if (!pressed) {
      this.keyJustPressed.set('TouchJump', false);
    }
  }
}
