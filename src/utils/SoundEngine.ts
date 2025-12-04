class SoundEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOscillators: OscillatorNode[] = [];
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  init() {
    if (this.isInitialized) return;
    
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.05; // Low volume for ambient
      this.masterGain.connect(this.context.destination);
      
      this.startAmbient();
      this.isInitialized = true;
    } catch (e) {
      console.error("AudioContext not supported", e);
    }
  }

  private startAmbient() {
    if (!this.context || !this.masterGain) return;

    // Create a low drone sound using multiple oscillators
    const freqs = [55, 110, 112]; // A1, A2, slightly detuned A2
    freqs.forEach(f => {
      const osc = this.context!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.connect(this.masterGain!);
      osc.start();
      this.droneOscillators.push(osc);
    });
  }

  playClick() {
    if (!this.context || this.isMuted) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.context.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.1);
  }

  playWarp() {
    if (!this.context || this.isMuted) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.context.currentTime);
    osc.frequency.linearRampToValueAtTime(600, this.context.currentTime + 1);
    
    gain.gain.setValueAtTime(0.05, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 1);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start();
    osc.stop(this.context.currentTime + 1);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.context) {
        if (this.isMuted) {
            this.context.suspend();
        } else {
            this.context.resume();
        }
    }
    return this.isMuted;
  }
}

export const soundEngine = new SoundEngine();