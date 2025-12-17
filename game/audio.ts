// Audio manager for game sounds and music using Web Audio API

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private musicPlaying: boolean = false;
  private currentMusicTimeout: number | null = null;

  constructor() {
    // Don't initialize AudioContext until user interaction
    // Browsers require user gesture to start audio
  }

  initialize() {
    if (this.audioContext) {
      // Already initialized - just resume if suspended (needed for iOS)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      return;
    }

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Resume immediately (required for mobile browsers)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create gain nodes for volume control
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);

      this.musicGain = this.audioContext.createGain();
      this.musicGain.gain.value = 0.3; // Music is quieter
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.audioContext.createGain();
      this.sfxGain.gain.value = 0.5; // Sound effects moderate volume
      this.sfxGain.connect(this.masterGain);

      // Check for saved mute preference
      const savedMute = localStorage.getItem('newsletter-world-muted');
      if (savedMute === 'true') {
        this.setMuted(true);
      }
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 1;
    }
    localStorage.setItem('newsletter-world-muted', muted.toString());

    if (muted) {
      this.stopMusic();
    }
  }

  // For mobile: explicitly unmute and start music
  unmuteAndPlay(theme: string) {
    // Create AudioContext and gain nodes if needed
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (!this.masterGain) {
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
      }

      if (!this.musicGain) {
        this.musicGain = this.audioContext.createGain();
        this.musicGain.gain.value = 0.3;
        this.musicGain.connect(this.masterGain);
      }

      if (!this.sfxGain) {
        this.sfxGain = this.audioContext.createGain();
        this.sfxGain.gain.value = 0.5;
        this.sfxGain.connect(this.masterGain);
      }
    } catch (err) {
      console.error('Failed to create AudioContext:', err);
      return;
    }

    // Unmute
    this.isMuted = false;
    this.masterGain.gain.value = 1;
    localStorage.setItem('newsletter-world-muted', 'false');

    const startPlaying = () => {
      this.musicPlaying = true;
      this.playMusicLoop(theme);
    };

    // Resume AudioContext (must be in user gesture for mobile)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(startPlaying).catch(console.error);
    } else {
      startPlaying();
    }
  }

  // For mobile: mute and stop music
  muteAndStop() {
    this.isMuted = true;
    if (this.masterGain) {
      this.masterGain.gain.value = 0;
    }
    localStorage.setItem('newsletter-world-muted', 'true');
    this.stopMusic();
  }

  toggleMute(currentTheme?: string): boolean {
    this.setMuted(!this.isMuted);

    // If unmuting with a theme, try to play music
    if (!this.isMuted && currentTheme) {
      this.playMusic(currentTheme);
    }

    return this.isMuted;
  }

  // Initialize for mobile - starts muted, user must tap unmute
  initializeForMobile() {
    this.initialize();
    // Don't mute if music is already playing (user unmuted before starting game)
    if (!this.musicPlaying) {
      this.setMuted(true);
    }
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  // Jump sound - upward pitch sweep
  playJump() {
    // Auto-initialize if not already initialized
    if (!this.audioContext) {
      this.initialize();
    }

    if (!this.audioContext || !this.sfxGain) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.sfxGain);

    // Square wave for retro sound
    oscillator.type = 'square';

    // Pitch sweep from 300Hz to 600Hz
    oscillator.frequency.setValueAtTime(300, now);
    oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);

    // Volume envelope
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }

  // Coin collection sound - pleasant chime
  playCoin() {
    // Auto-initialize if not already initialized
    if (!this.audioContext) {
      this.initialize();
    }

    if (!this.audioContext || !this.sfxGain) return;

    const now = this.audioContext.currentTime;

    // Two oscillators for richer sound
    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.sfxGain);

    // Sine waves for smooth chime
    osc1.type = 'sine';
    osc2.type = 'sine';

    // Harmonious frequencies (E and B notes)
    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc2.frequency.setValueAtTime(987.77, now); // B5

    // Quick decay
    gainNode.gain.setValueAtTime(0.25, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  // Combo sound - exciting ascending arpeggio
  playCombo(comboCount: number) {
    // Auto-initialize if not already initialized
    if (!this.audioContext) {
      this.initialize();
    }

    if (!this.audioContext || !this.sfxGain) return;

    const now = this.audioContext.currentTime;

    // Pitch increases with combo count (capped at reasonable level)
    const baseFreq = 659.25; // E5 - higher starting note for prominence
    const pitchMultiplier = 1 + Math.min(comboCount - 2, 10) * 0.06; // Gets higher with more combos

    // Four note ascending arpeggio for more emphasis
    const frequencies = [
      baseFreq * pitchMultiplier,
      baseFreq * 1.25 * pitchMultiplier,  // Major third
      baseFreq * 1.5 * pitchMultiplier,   // Perfect fifth
      baseFreq * 2.0 * pitchMultiplier    // Octave up!
    ];

    frequencies.forEach((freq, i) => {
      const noteTime = now + i * 0.08; // Slightly slower for more presence

      // Use two oscillators per note for richer sound
      const osc1 = this.audioContext!.createOscillator();
      const osc2 = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain!);

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(freq, noteTime);
      osc2.frequency.setValueAtTime(freq * 2, noteTime); // Add harmonic octave

      // Longer, more prominent envelope
      gain.gain.setValueAtTime(0.35, noteTime); // Louder
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.3); // Longer sustain

      osc1.start(noteTime);
      osc2.start(noteTime);
      osc1.stop(noteTime + 0.3);
      osc2.stop(noteTime + 0.3);
    });
  }

  // Level complete sound - triumphant fanfare
  playLevelComplete() {
    // Auto-initialize if not already initialized
    if (!this.audioContext) {
      this.initialize();
    }

    if (!this.audioContext || !this.sfxGain) return;

    const now = this.audioContext.currentTime;

    // Triumphant ascending melody: C E G C (octave higher)
    const melody = [
      523.25,  // C5
      659.25,  // E5
      783.99,  // G5
      1046.50  // C6 (octave up for victory!)
    ];

    melody.forEach((freq, i) => {
      const noteTime = now + i * 0.12;
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.type = 'square'; // Brighter tone for celebration
      osc.frequency.setValueAtTime(freq, noteTime);

      // Envelope for musical note
      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.3, noteTime + 0.01); // Attack
      gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.06); // Sustain
      gain.gain.linearRampToValueAtTime(0, noteTime + 0.2); // Release

      osc.start(noteTime);
      osc.stop(noteTime + 0.2);
    });

    // Add a final celebratory chord at the end
    const chordTime = now + 0.5;
    [523.25, 659.25, 783.99].forEach(freq => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, chordTime);

      gain.gain.setValueAtTime(0.15, chordTime);
      gain.gain.exponentialRampToValueAtTime(0.01, chordTime + 0.8);

      osc.start(chordTime);
      osc.stop(chordTime + 0.8);
    });
  }

  // Death sound - light-hearted boing/bonk
  playDeath() {
    if (!this.audioContext) {
      this.initialize();
    }

    if (!this.audioContext || !this.sfxGain) return;

    const now = this.audioContext.currentTime;

    // Descending "wah-wah" cartoon sound
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.type = 'triangle';

    // Quick descending pitch - cartoon "bonk" style
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.start(now);
    osc.stop(now + 0.35);

    // Add a little "boing" overtone
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();

    osc2.connect(gain2);
    gain2.connect(this.sfxGain);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(600, now);
    osc2.frequency.exponentialRampToValueAtTime(200, now + 0.2);

    gain2.gain.setValueAtTime(0.2, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc2.start(now);
    osc2.stop(now + 0.25);
  }

  // Game over sound - sad descending melody
  playGameOver() {
    if (!this.audioContext) {
      this.initialize();
    }

    if (!this.audioContext || !this.sfxGain) return;

    const now = this.audioContext.currentTime;

    // Sad descending melody: G E C G (lower octave)
    const melody = [
      392.00,  // G4
      329.63,  // E4
      261.63,  // C4
      196.00   // G3 (octave down, very sad)
    ];

    melody.forEach((freq, i) => {
      const noteTime = now + i * 0.3;
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.type = 'triangle'; // Softer, sadder tone
      osc.frequency.setValueAtTime(freq, noteTime);

      // Slower envelope for melancholy feel
      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.35, noteTime + 0.05);
      gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.15);
      gain.gain.linearRampToValueAtTime(0, noteTime + 0.4);

      osc.start(noteTime);
      osc.stop(noteTime + 0.4);
    });

    // Add a final low sustained note
    const finalTime = now + 1.2;
    const finalOsc = this.audioContext.createOscillator();
    const finalGain = this.audioContext.createGain();

    finalOsc.connect(finalGain);
    finalGain.connect(this.sfxGain);

    finalOsc.type = 'sine';
    finalOsc.frequency.setValueAtTime(130.81, finalTime); // C3 - very low

    finalGain.gain.setValueAtTime(0.2, finalTime);
    finalGain.gain.exponentialRampToValueAtTime(0.01, finalTime + 1.5);

    finalOsc.start(finalTime);
    finalOsc.stop(finalTime + 1.5);
  }

  // Background music - cheerful melodic loop
  playMusic(theme: string = 'default') {
    // Auto-initialize if not already initialized
    if (!this.audioContext) {
      this.initialize();
    }

    if (!this.audioContext || !this.musicGain) return;

    // Check mute state but don't return early - we still need to try resuming
    // the AudioContext for future unmuting to work
    const shouldPlay = !this.isMuted;

    // Ensure AudioContext is running (required for mobile)
    // This resume() call MUST be in a user gesture call stack for mobile
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        if (shouldPlay) {
          this.musicPlaying = true;
          this.playMusicLoop(theme);
        }
      }).catch((err) => {
        console.error('Failed to resume AudioContext:', err);
      });
    } else if (shouldPlay) {
      this.musicPlaying = true;
      this.playMusicLoop(theme);
    }
  }

  private playMusicLoop(theme: string) {
    if (!this.audioContext || !this.musicGain || !this.musicPlaying) {
      return;
    }

    const now = this.audioContext.currentTime;

    // Different tempos and melodies for each theme
    const musicData: { [key: string]: { melody: number[], tempo: number, wave: OscillatorType } } = {
      default: {
        tempo: 0.3,
        wave: 'triangle',
        melody: [
          523.25, 587.33, 659.25, 587.33, // C D E D
          523.25, 659.25, 783.99, 659.25, // C E G E
          523.25, 587.33, 659.25, 698.46, // C D E F
          783.99, 783.99, 659.25, 523.25  // G G E C
        ]
      },
      arctic: {
        tempo: 0.35, // Slower, more spacious
        wave: 'sine', // Pure tone for crystalline feel
        melody: [
          // E minor - cold, crystalline, mysterious
          659.25, 587.33, 493.88, 587.33, // E D B D
          659.25, 783.99, 880.00, 783.99, // E G A G
          987.77, 880.00, 783.99, 659.25, // B A G E
          587.33, 493.88, 440.00, 329.63  // D B A E (lower)
        ]
      },
      desert: {
        tempo: 0.28, // Faster, energetic
        wave: 'triangle',
        melody: [
          // A minor pentatonic - exotic, warm, middle-eastern feel
          440.00, 523.25, 587.33, 523.25, // A C D C
          440.00, 659.25, 440.00, 659.25, // A E A E
          587.33, 523.25, 440.00, 523.25, // D C A C
          659.25, 587.33, 523.25, 440.00  // E D C A
        ]
      },
      jungle: {
        tempo: 0.25, // Upbeat and rhythmic
        wave: 'triangle',
        melody: [
          // F major - bright, playful, tropical
          698.46, 523.25, 698.46, 880.00, // F C F A
          783.99, 698.46, 659.25, 698.46, // G F E F
          880.00, 698.46, 880.00, 1046.50, // A F A C
          783.99, 698.46, 659.25, 523.25  // G F E C
        ]
      },
      seaside: {
        tempo: 0.32, // Flowing, wave-like
        wave: 'sine', // Smooth for water feel
        melody: [
          // D major (Lydian feel) - bright, open, breezy
          587.33, 659.25, 739.99, 659.25, // D E F# E
          783.99, 880.00, 987.77, 880.00, // G A B A
          739.99, 659.25, 587.33, 739.99, // F# E D F#
          880.00, 783.99, 659.25, 587.33  // A G E D
        ]
      },
      mountain: {
        tempo: 0.38, // Slower, more majestic
        wave: 'triangle',
        melody: [
          // G major - grand, majestic, open
          391.00, 493.88, 587.33, 493.88, // G B D B
          783.99, 659.25, 587.33, 659.25, // G E D E
          783.99, 880.00, 987.77, 880.00, // G A B A
          783.99, 587.33, 493.88, 391.00  // G D B G
        ]
      }
    };

    const data = musicData[theme] || musicData.default;
    const { melody, tempo, wave } = data;
    const totalDuration = melody.length * tempo;

    // Play each note in the melody
    melody.forEach((frequency, index) => {
      const noteTime = now + index * tempo;
      const noteDuration = tempo * 0.8; // Slightly staccato

      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.musicGain!);

      // Use theme-specific waveform
      oscillator.type = wave;
      oscillator.frequency.setValueAtTime(frequency, noteTime);

      // ADSR envelope for musical notes
      gainNode.gain.setValueAtTime(0, noteTime);
      gainNode.gain.linearRampToValueAtTime(0.15, noteTime + 0.02); // Attack
      gainNode.gain.linearRampToValueAtTime(0.1, noteTime + 0.1); // Decay
      gainNode.gain.setValueAtTime(0.1, noteTime + noteDuration - 0.05); // Sustain
      gainNode.gain.linearRampToValueAtTime(0, noteTime + noteDuration); // Release

      oscillator.start(noteTime);
      oscillator.stop(noteTime + noteDuration);
    });

    // Schedule next loop
    if (this.currentMusicTimeout) {
      window.clearTimeout(this.currentMusicTimeout);
    }
    this.currentMusicTimeout = window.setTimeout(() => {
      if (this.musicPlaying && !this.isMuted) {
        this.playMusicLoop(theme);
      }
    }, totalDuration * 1000);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.currentMusicTimeout) {
      window.clearTimeout(this.currentMusicTimeout);
      this.currentMusicTimeout = null;
    }
  }

  cleanup() {
    this.stopMusic();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Singleton instance
let audioManagerInstance: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
}
