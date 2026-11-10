// js/stations/sides.js
import { state } from '../state.js';
import { CONFIG } from '../config.js';
import { playDing } from '../audio.js';

export const sidesStation = {
  enter() {},
  exit() {},
  update(dt) {
    if (state.fryer.state === 'cooking') {
      state.fryer.timer += dt;
      if (state.fryer.timer > CONFIG.FRY_TIME + 3) state.fryer.state = 'burned';
    }
    if (state.soda.filling && !state.upgrades.autoSoda) {
      state.soda.level += dt * CONFIG.SODA_FILL_SPEED;
      if (state.soda.level > 1.15) state.soda.level = 1.15;
    }
  },
  render(ctx, w, h) {
    ctx.fillStyle = '#455a64';
    ctx.fillRect(30, h * 0.25, 140, 160);
    ctx.strokeStyle = '#1d3557';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, h * 0.25, 140, 160);
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('FRYER', 100, h * 0.23);
    if (state.fryer.basket) {
      const progress = Math.min(1, state.fryer.timer / CONFIG.FRY_TIME);
      ctx.fillStyle = progress > 0.9 ? '#8d6e63' : '#f4a261';
      ctx.fillRect(50, h * 0.45 - progress * 40, 100, 50);
      ctx.strokeRect(50, h * 0.45 - progress * 40, 100, 50);
      ctx.fillStyle = '#fff';
      ctx.fillText(state.fryer.state === 'golden' ? 'READY!' : Math.floor(state.fryer.timer) + 's', 100, h * 0.55);
    }
    ctx.fillStyle = '#ffb74d';
    ctx.fillRect(w - 160, h * 0.3, 100, 60);
    ctx.strokeRect(w - 160, h * 0.3, 100, 60);
    ctx.fillStyle = '#1d3557';
    ctx.fillText('CHIPS', w - 110, h * 0.36);
    ctx.fillStyle = '#0277bd';
    ctx.fillRect(w / 2 - 40, h * 0.55, 80, 140);
    ctx.strokeRect(w / 2 - 40, h * 0.55, 80, 140);
    const cupY = h * 0.78;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 30, cupY);
    ctx.lineTo(w / 2 + 30, cupY);
    ctx.lineTo(w / 2 + 22, cupY + 50);
    ctx.lineTo(w / 2 - 22, cupY + 50);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (state.soda.level > 0) {
      ctx.fillStyle = '#4fc3f7';
      const fillH = Math.min(48, state.soda.level * 48);
      ctx.fillRect(w / 2 - 20, cupY + 50 - fillH, 40, fillH);
    }
    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 25, cupY + 18);
    ctx.lineTo(w / 2 + 25, cupY + 18);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '12px system-ui';
    ctx.fillText(state.soda.size.toUpperCase(), w / 2, cupY + 70);
    ['small', 'medium', 'large'].forEach((s, i) => {
      ctx.fillStyle = state.soda.size === s ? '#4caf50' : '#90a4ae';
      ctx.fillRect(w / 2 - 90 + i * 60, h * 0.92, 50, 30);
      ctx.fillStyle = '#fff';
      ctx.font = '11px system-ui';
      ctx.fillText(s[0].toUpperCase(), w / 2 - 65 + i * 60, h * 0.94);
    });
  },
  handleInput(type, x, y, w, h) {
    if (type === 'tap' && x > 30 && x < 170 && y > h * 0.25 && y < h * 0.5) {
      if (state.fryer.state === 'empty') {
        state.fryer = { basket: 'fries', timer: 0, state: 'cooking' };
      } else if (state.fryer.state === 'cooking' && Math.abs(state.fryer.timer - CONFIG.FRY_TIME) < CONFIG.FRY_GOLDEN_WINDOW) {
        state.fryer.state = 'golden';
        playDing();
      }
    }
    if (type === 'tap' && x > w - 160 && x < w - 60 && y > h * 0.3 && y < h * 0.4) {
      if (state.buildTray) state.buildTray.side = 'chips';
    }
    if (type === 'holdstart' && Math.hypot(x - w / 2, y - h * 0.65) < 50) {
      state.soda.filling = true;
    }
    if (type === 'holdend') {
      state.soda.filling = false;
      if (state.buildTray && state.soda.level > 0.7 && state.soda.level < 1.05) {
        state.buildTray.drink = { size: state.soda.size, level: state.soda.level };
      }
    }
    if (type === 'tap') {
      ['small', 'medium', 'large'].forEach((s, i) => {
        if (x > w / 2 - 90 + i * 60 && x < w / 2 - 40 + i * 60 && y > h * 0.92 && y < h * 0.96) {
          state.soda.size = s;
          state.soda.level = 0;
        }
      });
    }
  }
};
