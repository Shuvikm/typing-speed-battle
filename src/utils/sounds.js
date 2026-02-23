// Sound effects utility
const SOUND_ENABLED_KEY = 'tsb_sound_enabled';

class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = this.loadEnabled();
    this.volume = 0.5;
  }

  // Create audio context for sound effects
  playSound(type) {
    if (!this.enabled) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different sound types
    const sounds = {
      click: { frequency: 800, duration: 0.1 },
      success: { frequency: 600, duration: 0.2 },
      error: { frequency: 300, duration: 0.15 },
      keypress: { frequency: 400, duration: 0.05 },
      combo: { frequency: 1000, duration: 0.1 },
      victory: { frequency: 800, duration: 0.3 },
    };

    const sound = sounds[type] || sounds.click;
    oscillator.frequency.value = sound.frequency;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
  }

  enable() {
    this.enabled = true;
    this.saveEnabled();
  }

  disable() {
    this.enabled = false;
    this.saveEnabled();
  }

  toggle() {
    if (this.enabled) this.disable();
    else this.enable();
    return this.enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /** Persist enabled state to localStorage */
  saveEnabled() {
    try {
      localStorage.setItem(SOUND_ENABLED_KEY, JSON.stringify(this.enabled));
    } catch { /* ignore */ }
  }

  /** Load enabled state from localStorage (defaults to true) */
  loadEnabled() {
    try {
      const stored = localStorage.getItem(SOUND_ENABLED_KEY);
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  }
}

export const soundManager = new SoundManager();
