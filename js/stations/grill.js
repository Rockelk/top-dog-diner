// js/stations/grill.js
import { state } from '../state.js';
import { CONFIG } from '../config.js';
import { playSizzle, playPop } from '../audio.js';

export const grillStation = {
  enter() {},
  exit() {},
  update(dt) {
    state.grillSlots.forEach(slot => {
      if (slot) {
        slot.doneness += dt * CONFIG.COOK_SPEED * (slot.rotated ? 1.15 : 1);
        if (slot.doneness > CONFIG.BURN_THRESHOLD) slot.burned = true;
      }
    });
  },
  render(ctx, w, h) {
    ctx.fillStyle = '#37474f';
    ctx.fillRect(20, h * 0.25, w - 40, h * 0.5);
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, h * 0.25, w - 40, h * 0.5);
    const slots = state.grillSlots.length;
    const slotW = (w - 60) / slots;
    state.grillSlots.forEach((slot, i) => {
      const sx = 30 + i * slotW;
      const sy = h * 0.32;
      ctx.strokeStyle = '#546e7a';
      ctx.lineWidth = 2;
      for (let g = 0; g < 6; g++) {
        ctx.beginPath();
        ctx.moveTo(sx + 10, sy + g * 18);
        ctx.lineTo(sx + slotW - 20, sy + g * 18);
        ctx.stroke();
      }
      if (slot) {
        drawSausage(ctx, sx + slotW / 2 - 10, sy + 40, slot);
        const d = Math.min(4, slot.doneness);
        ctx.fillStyle = '#333';
        ctx.fillRect(sx + 8, sy - 20, slotW - 30, 10);
        const colors = ['#8d6e63', '#c44536', '#e76f51', '#2a9d8f', '#1d3557'];
        ctx.fillStyle = colors[Math.floor(d)] || colors[4];
        ctx.fillRect(sx + 8, sy - 20, (slotW - 30) * (d / 4), 10);
        ctx.fillStyle = '#fff';
        ctx.font = '11px system-ui';
        ctx.fillText(['Raw', 'Rare', 'Med', 'Well', 'Burn'][Math.floor(d)] || 'Burn', sx + 10, sy - 8);
      }
    });
    ctx.fillStyle = '#ffccbc';
    ctx.fillRect(w / 2 - 50, h * 0.8, 100, 40);
    ctx.strokeStyle = '#1d3557';
    ctx.strokeRect(w / 2 - 50, h * 0.8, 100, 40);
    ctx.fillStyle = '#c44536';
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.82, 30, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Drag Sausage', w / 2, h * 0.9);
  },
  handleInput(type, x, y, w, h) {
    if (type === 'tap') {
      state.grillSlots.forEach((slot, i) => {
        if (slot) {
          const slots = state.grillSlots.length;
          const slotW = (w - 60) / slots;
          const sx = 30 + i * slotW + slotW / 2;
          const sy = h * 0.32 + 40;
          if (Math.hypot(x - sx, y - sy) < 40) {
            slot.rotated = !slot.rotated;
            playPop();
          }
        }
      });
    }
    if (type === 'dragstart') {
      if (y > h * 0.78 && Math.abs(x - w / 2) < 60) {
        state.dragging = { type: 'sausage', x, y };
      }
    }
    if (type === 'dragend' && state.dragging?.type === 'sausage') {
      const slots = state.grillSlots.length;
      const slotW = (w - 60) / slots;
      for (let i = 0; i < slots; i++) {
        const sx = 30 + i * slotW;
        if (x > sx && x < sx + slotW && y > h * 0.25 && y < h * 0.7 && !state.grillSlots[i]) {
          state.grillSlots[i] = { doneness: 0, rotated: false, burned: false, type: state.activeOrder?.order.sausage || 'classic' };
          playSizzle();
          break;
        }
      }
      state.dragging = null;
    }
  }
};

function drawSausage(ctx, x, y, slot) {
  ctx.fillStyle = slot.burned ? '#3e2723' : '#c44536';
  ctx.beginPath();
  ctx.ellipse(x, y, 28, 14, slot.rotated ? 0.4 : 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1d3557';
  ctx.lineWidth = 3;
  ctx.stroke();
  if (!slot.burned) {
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 16, y - 4);
    ctx.lineTo(x + 16, y - 4);
    ctx.moveTo(x - 16, y + 4);
    ctx.lineTo(x + 16, y + 4);
    ctx.stroke();
  }
}
