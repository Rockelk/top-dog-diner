// js/audio.js
import { state } from './state.js';

let audioCtx = null;
let musicGain = null;
let sfxGain = null;
let musicPlaying = false;

export function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.12;
    musicGain.connect(audioCtx.destination);
    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = 0.4;
    sfxGain.connect(audioCtx.destination);
  } catch (e) {
    console.warn('Audio init failed', e);
  }
}

function resume() {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

export function playSizzle() {
  if (!audioCtx || state.mutedSFX) return;
  resume();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(180 + Math.random() * 40, audioCtx.currentTime);
  g.gain.setValueAtTime(0.15, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
  o.connect(g).connect(sfxGain);
  o.start();
  o.stop(audioCtx.currentTime + 0.4);
}

export function playDing() {
  if (!audioCtx || state.mutedSFX) return;
  resume();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(880, audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15);
  g.gain.setValueAtTime(0.3, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
  o.connect(g).connect(sfxGain);
  o.start();
  o.stop(audioCtx.currentTime + 0.3);
}

export function playCash() {
  if (!audioCtx || state.mutedSFX) return;
  resume();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(600, audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.08);
  g.gain.setValueAtTime(0.2, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
  o.connect(g).connect(sfxGain);
  o.start();
  o.stop(audioCtx.currentTime + 0.2);
}

export function playSquirt() {
  if (!audioCtx || state.mutedSFX) return;
  resume();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(220, audioCtx.currentTime);
  g.gain.setValueAtTime(0.1, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
  o.connect(g).connect(sfxGain);
  o.start();
  o.stop(audioCtx.currentTime + 0.15);
}

export function playPop() {
  if (!audioCtx || state.mutedSFX) return;
  resume();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(400, audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.1);
  g.gain.setValueAtTime(0.25, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
  o.connect(g).connect(sfxGain);
  o.start();
  o.stop(audioCtx.currentTime + 0.12);
}

export function startMusic() {
  if (!audioCtx || musicPlaying || state.mutedMusic) return;
  resume();
  musicPlaying = true;
  const playNote = (freq, time, dur) => {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'triangle';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(0.08, time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.01, time + dur);
    o.connect(g).connect(musicGain);
    o.start(time);
    o.stop(time + dur);
  };
  const schedule = () => {
    if (!musicPlaying) return;
    const now = audioCtx.currentTime;
    const melody = [523, 587, 659, 698, 784, 698, 659, 587];
    melody.forEach((f, i) => playNote(f, now + i * 0.4, 0.35));
    setTimeout(schedule, 3200);
  };
  schedule();
}

export function stopMusic() { musicPlaying = false; }
export function toggleSFX() { state.mutedSFX = !state.mutedSFX; }
export function toggleMusic() {
  state.mutedMusic = !state.mutedMusic;
  if (state.mutedMusic) stopMusic();
  else startMusic();
}
