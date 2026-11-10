// js/state.js
import { CONFIG } from './config.js';

export const state = {
  day: 1,
  money: 50,
  unlocked: new Set(['regular', 'classic', 'ketchup', 'mustard', 'onions', 'relish', 'fries', 'chips', 'cola']),
  upgrades: {
    biggerGrill: false,
    heatLamp: false,
    betterFryer: false,
    autoSoda: false,
    doorbell: false
  },
  decor: 'classic',
  stats: {
    totalCustomers: 0,
    totalTips: 0,
    perfectOrders: 0,
    daysPlayed: 0
  },
  timeLeft: CONFIG.DAY_DURATION,
  customers: [],
  tickets: [],
  activeOrder: null,
  currentStation: 'order',
  paused: false,
  tutorialStep: 0,
  tutorialActive: true,
  grillSlots: [],
  buildTray: null,
  fryer: { basket: null, timer: 0, state: 'empty' },
  soda: { filling: false, level: 0, size: 'medium' },
  scoreScreen: null,
  endOfDay: null,
  shopOpen: false,
  showSettings: false,
  showHowTo: false,
  mutedSFX: false,
  mutedMusic: false,
  particles: [],
  screenShake: 0
};

export function resetDay() {
  state.timeLeft = CONFIG.DAY_DURATION;
  state.customers = [];
  state.tickets = [];
  state.activeOrder = null;
  state.grillSlots = Array(state.upgrades.biggerGrill ? 6 : 4).fill(null);
  state.buildTray = null;
  state.fryer = { basket: null, timer: 0, state: 'empty' };
  state.soda = { filling: false, level: 0, size: 'medium' };
  state.scoreScreen = null;
  state.endOfDay = null;
  state.tutorialStep = state.day === 1 ? 0 : 99;
  state.tutorialActive = state.day === 1;
  state.particles = [];
  state.screenShake = 0;
}

export function addMoney(amount) {
  state.money += Math.round(amount);
  state.stats.totalTips += Math.round(amount);
}

export function unlock(item) {
  state.unlocked.add(item);
}
