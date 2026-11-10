// js/save.js
import { state } from './state.js';

const KEY = 'topDogDiner_save_v1';

export function saveGame() {
  try {
    const data = {
      day: state.day,
      money: state.money,
      unlocked: Array.from(state.unlocked),
      upgrades: state.upgrades,
      decor: state.decor,
      stats: state.stats,
      mutedSFX: state.mutedSFX,
      mutedMusic: state.mutedMusic
    };
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Save failed', e);
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    state.day = data.day || 1;
    state.money = data.money || 50;
    state.unlocked = new Set(data.unlocked || ['regular', 'classic', 'ketchup', 'mustard', 'onions', 'relish', 'fries', 'chips', 'cola']);
    state.upgrades = { ...state.upgrades, ...data.upgrades };
    state.decor = data.decor || 'classic';
    state.stats = { ...state.stats, ...data.stats };
    state.mutedSFX = !!data.mutedSFX;
    state.mutedMusic = !!data.mutedMusic;
    return true;
  } catch (e) {
    console.warn('Load failed', e);
    return false;
  }
}

export function resetSave() {
  try {
    localStorage.removeItem(KEY);
  } catch (e) {}
}
