// Retro 8-bit Audio Synthesizer using Web Audio API
class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.bgmVolumeNode = null;
    this.sfxVolumeNode = null;
    
    this.isMutedBgm = false;
    this.isMutedSfx = false;
    
    this.bgmIntervalId = null;
    this.bgmNotes = [
      // Melodious, calming retro arpeggio progression (C maj7 -> Am7 -> F maj7 -> G7)
      [261.63, 329.63, 392.00, 493.88], // C, E, G, B (Cmaj7)
      [220.00, 261.63, 329.63, 392.00], // A, C, E, G (Am7)
      [174.61, 220.00, 261.63, 329.63], // F, A, C, E (Fmaj7)
      [196.00, 246.94, 293.66, 392.00]  // G, B, D, G (G7)
    ];
    this.currentChordIndex = 0;
    this.currentNoteIndex = 0;
    this.bgmTempo = 250; // ms per note
    this.lastFootstepTime = 0;
  }

  init() {
    if (this.audioCtx) return;
    
    // Create audio context on user interaction (browser policy)
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContextClass();
    
    // Master gain nodes for BGM and SFX
    this.bgmVolumeNode = this.audioCtx.createGain();
    this.sfxVolumeNode = this.audioCtx.createGain();
    
    this.bgmVolumeNode.connect(this.audioCtx.destination);
    this.sfxVolumeNode.connect(this.audioCtx.destination);
    
    // Set default volumes (low BGM, moderate SFX)
    this.bgmVolumeNode.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
    this.sfxVolumeNode.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
    
    // Apply mute states
    this.updateVolumes();
    
    // Start BGM loop
    this.startBgmLoop();
  }

  updateVolumes() {
    if (!this.audioCtx) return;
    this.bgmVolumeNode.gain.setValueAtTime(this.isMutedBgm ? 0 : 0.08, this.audioCtx.currentTime);
    this.sfxVolumeNode.gain.setValueAtTime(this.isMutedSfx ? 0 : 0.15, this.audioCtx.currentTime);
  }

  toggleBgm() {
    this.init();
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    this.isMutedBgm = !this.isMutedBgm;
    this.updateVolumes();
    
    // Update BGM UI button state
    const bgmBtn = document.getElementById("mute-bgm-btn");
    if (bgmBtn) {
      bgmBtn.innerHTML = this.isMutedBgm ? "🔇 BGM" : "🎵 BGM";
      bgmBtn.classList.toggle("muted", this.isMutedBgm);
    }
  }

  toggleSfx() {
    this.init();
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    this.isMutedSfx = !this.isMutedSfx;
    this.updateVolumes();
    
    // Update SFX UI button state
    const sfxBtn = document.getElementById("mute-sfx-btn");
    if (sfxBtn) {
      sfxBtn.innerHTML = this.isMutedSfx ? "🔇 SFX" : "🔊 SFX";
      sfxBtn.classList.toggle("muted", this.isMutedSfx);
    }
  }

  startBgmLoop() {
    if (this.bgmIntervalId) clearInterval(this.bgmIntervalId);
    
    this.bgmIntervalId = setInterval(() => {
      if (this.isMutedBgm || !this.audioCtx || this.audioCtx.state === "suspended") return;
      
      const chord = this.bgmNotes[this.currentChordIndex];
      const freq = chord[this.currentNoteIndex];
      
      this.playBgmNote(freq);
      
      this.currentNoteIndex++;
      if (this.currentNoteIndex >= chord.length) {
        this.currentNoteIndex = 0;
        this.currentChordIndex = (this.currentChordIndex + 1) % this.bgmNotes.length;
      }
    }, this.bgmTempo);
  }

  playBgmNote(freq) {
    const time = this.audioCtx.currentTime;
    
    // Oscillator
    const osc = this.audioCtx.createOscillator();
    osc.type = "triangle"; // Warm, retro sound
    osc.frequency.setValueAtTime(freq, time);
    
    // Soft lowpass filter to remove harsh frequencies
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, time);
    
    // Gain envelope (soft attack, decay)
    const gainNode = this.audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.6, time + 0.05); // quick fade in
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + this.bgmTempo / 1000); // fade out
    
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.bgmVolumeNode);
    
    osc.start(time);
    osc.stop(time + this.bgmTempo / 1000);
  }

  playFootstep() {
    this.init();
    if (this.isMutedSfx || !this.audioCtx || this.audioCtx.state === "suspended") return;
    
    const now = this.audioCtx.currentTime;
    if (now - this.lastFootstepTime < 0.28) return; // rate limiting footsteps
    this.lastFootstepTime = now;
    
    // Synthesize low-pitched, percussive step
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(10, now + 0.08); // downward pitch sweep
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08); // quick fade
    
    osc.connect(gainNode);
    gainNode.connect(this.sfxVolumeNode);
    
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playInteract() {
    this.init();
    if (this.isMutedSfx || !this.audioCtx || this.audioCtx.state === "suspended") return;
    
    const now = this.audioCtx.currentTime;
    
    // Pleasant rising chime (arpeggio blip)
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.15); // rising pitch
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    
    osc.connect(gainNode);
    gainNode.connect(this.sfxVolumeNode);
    
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playClose() {
    this.init();
    if (this.isMutedSfx || !this.audioCtx || this.audioCtx.state === "suspended") return;
    
    const now = this.audioCtx.currentTime;
    
    // Falling pitch chime
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.linearRampToValueAtTime(250, now + 0.12); // falling pitch
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(this.sfxVolumeNode);
    
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playAchievement() {
    this.init();
    if (this.isMutedSfx || !this.audioCtx || this.audioCtx.state === "suspended") return;
    
    const now = this.audioCtx.currentTime;
    
    // Quick ascending retro arpeggio (C4 -> E4 -> G4 -> C5)
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      
      osc.type = "triangle"; 
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gainNode.gain.setValueAtTime(0.25, now + idx * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.18);
      
      osc.connect(gainNode);
      gainNode.connect(this.sfxVolumeNode);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.2);
    });
  }
}

export const sounds = new SoundEngine();
