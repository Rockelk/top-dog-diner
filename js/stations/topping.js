// js/stations/topping.js
import { state } from '../state.js';
import { CONFIG } from '../config.js';
import { playSquirt } from '../audio.js';

const BOTTLES = ['ketchup', 'mustard', 'mayo', 'sriracha'];
const BINS = ['onions', 'relish', 'sauerkraut', 'jalapenos', 'chili', 'cheese', 'bacon'];

export const toppingStation = {
  enter() {
    if (!state.buildTray && state.activeOrder) {
      const ready = state.grillSlots.findIndex(s => s && s.doneness >= 1 && s.doneness < CONFIG.BURN_THRESHOLD);
      if (ready >= 0) {
        state.buildTray = {
          sausage: state.grillSlots[ready],
          toppings: [],
          coverage: 0,
          order: state.activeOrder.order
        };
        state.grillSlots[ready] = null;
      }
    }
  },
  exit() {},
  update(dt) {},
  render(ctx, w, h) {
    ctx.fillStyle = '#fff3e0';
    ctx.fillRect(w / 2 - 140, h * 0.28, 280, 120);
    ctx.strokeStyle = '#1d3557';
    ctx.lineWidth = 4;
    ctx.strokeRect(w / 2 - 140, h * 0.28, 280, 120);
    if (state.buildTray) {
      const bx = w / 2;
      const by = h * 0.38;
      ctx.fillStyle = '#f4a261';
      ctx.beginPath();
      ctx.ellipse(bx, by + 8, 110, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = state.buildTray.sausage.burned ? '#3e2723' : '#c44536';
      ctx.beginPath();
      ctx.ellipse(bx, by, 100, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      state.buildTray.toppings.forEach((t, i) => {
        ctx.fillStyle = getToppingColor(t);
        ctx.globalAlpha = 0.7;
        ctx.fillRect(bx - 80 + (i % 5) * 32, by - 10 + Math.floor(i / 5) * 8, 28, 6);
        ctx.globalAlpha = 1;
      });
    } else {
      ctx.fillStyle = '#666';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Cook a sausage first!', w / 2, h * 0.4);
    }
    BOTTLES.forEach((b, i) => {
      if (!state.unlocked.has(b)) return;
      drawBottle(ctx, 40 + i * 80, h * 0.62, b);
    });
    BINS.forEach((b, i) => {
      if (!state.unlocked.has(b)) return;
      drawBin(ctx, 30 + (i % 4) * 85, h * 0.78 + Math.floor(i / 4) * 50, b);
    });
  },
  handleInput(type, x, y, w, h) {
    if (!state.buildTray) return;
    if (type === 'drag' || type === 'tap') {
      BOTTLES.forEach((b, i) => {
        if (!state.unlocked.has(b)) return;
        if (Math.hypot(x - (40 + i * 80), y - h * 0.62) < 35) {
          if (!state.buildTray.toppings.includes(b)) state.buildTray.toppings.push(b);
          state.buildTray.coverage = Math.min(1, state.buildTray.coverage + 0.12);
          playSquirt();
        }
      });
      BINS.forEach((b, i) => {
        if (!state.unlocked.has(b)) return;
        const bx = 30 + (i % 4) * 85;
        const by = h * 0.78 + Math.floor(i / 4) * 50;
        if (Math.hypot(x - bx - 25, y - by - 15) < 30) {
          if (!state.buildTray.toppings.includes(b)) state.buildTray.toppings.push(b);
          state.buildTray.coverage = Math.min(1, state.buildTray.coverage + 0.08);
        }
      });
    }
  }
};

function drawBottle(ctx, x, y, type) {
  const colors = { ketchup: '#e63946', mustard: '#f5c518', mayo: '#f8f9fa', sriracha: '#d62828' };
  ctx.fillStyle = colors[type] || '#ccc';
  ctx.fillRect(x - 12, y - 40, 24, 50);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x - 8, y - 55, 16, 18);
  ctx.strokeStyle = '#1d3557';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 12, y - 40, 24, 50);
  ctx.font = '10px system-ui';
  ctx.fillStyle = '#1d3557';
  ctx.textAlign = 'center';
  ctx.fillText(type.slice(0, 4), x, y + 20);
}

function drawBin(ctx, x, y, type) {
  ctx.fillStyle = '#e9ecef';
  ctx.fillRect(x, y, 60, 36);
  ctx.strokeStyle = '#1d3557';
  ctx.strokeRect(x, y, 60, 36);
  ctx.fillStyle = getToppingColor(type);
  ctx.fillRect(x + 6, y + 6, 48, 20);
  ctx.fillStyle = '#1d3557';
  ctx.font = '10px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(type.slice(0, 6), x + 30, y + 50);
}

function getToppingColor(t) {
  const map = {
    ketchup: '#e63946', mustard: '#f5c518', mayo: '#fff', sriracha: '#d62828',
    onions: '#f4f1de', relish: '#2a9d8f', sauerkraut: '#e9c46a', jalapenos: '#2d6a4f',
    chili: '#9b2226', cheese: '#f4a261', bacon: '#bc4749'
  };
  return map[t] || '#ccc';
}
