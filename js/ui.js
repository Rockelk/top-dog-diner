// js/ui.js
import { state, addMoney, unlock, resetDay } from './state.js';
import { CONFIG } from './config.js';
import { saveGame, resetSave } from './save.js';
import { toggleSFX, toggleMusic, startMusic, stopMusic } from './audio.js';
import { spawnCustomer } from './customers.js';

export function renderHUD(ctx, w, h) {
  ctx.fillStyle = 'rgba(29,53,87,0.9)';
  ctx.fillRect(0, 0, w, 56);
  ctx.fillStyle = '#f1faee';
  ctx.font = 'bold 16px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(`Day ${state.day}`, 16, 34);
  ctx.textAlign = 'center';
  ctx.fillText(`$${state.money}`, w / 2, 34);
  const mins = Math.floor(state.timeLeft / 60);
  const secs = Math.floor(state.timeLeft % 60);
  ctx.textAlign = 'right';
  ctx.fillText(`${mins}:${secs.toString().padStart(2, '0')}`, w - 50, 34);
  ctx.fillStyle = '#fff';
  ctx.fillRect(w - 36, 12, 24, 24);
  ctx.fillStyle = '#1d3557';
  ctx.fillRect(w - 30, 16, 4, 16);
  ctx.fillRect(w - 22, 16, 4, 16);
  ctx.fillStyle = 'rgba(43,58,85,0.85)';
  ctx.fillRect(0, 56, w, 70);
  state.tickets.slice(0, 4).forEach((t, i) => {
    const tx = 10 + i * 90;
    ctx.fillStyle = '#fff8e1';
    ctx.fillRect(tx, 66, 80, 50);
    ctx.strokeStyle = '#1d3557';
    ctx.strokeRect(tx, 66, 80, 50);
    ctx.fillStyle = '#1d3557';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(t.order.sausage.slice(0, 6), tx + 40, 84);
    ctx.fillText(t.order.doneness, tx + 40, 98);
  });
  const tabs = [{ id: 'order', label: 'ORDER' }, { id: 'grill', label: 'GRILL' }, { id: 'topping', label: 'TOP' }, { id: 'sides', label: 'SIDES' }];
  tabs.forEach((tab, i) => {
    const tx = i * (w / 4);
    ctx.fillStyle = state.currentStation === tab.id ? '#f5c518' : '#455a64';
    ctx.fillRect(tx, h - 70, w / 4, 70);
    ctx.fillStyle = '#1d3557';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(tab.label, tx + w / 8, h - 35);
    if (needsAttention(tab.id)) {
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.arc(tx + w / 4 - 16, h - 54, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function needsAttention(id) {
  if (id === 'order') return state.customers.some(c => c.state === 'waiting');
  if (id === 'grill') return state.grillSlots.some(s => s && s.doneness > 2.5);
  if (id === 'topping') return !!state.buildTray && state.buildTray.toppings.length < (state.buildTray.order?.toppings.length || 0);
  if (id === 'sides') return state.fryer.state === 'cooking' && state.fryer.timer > CONFIG.FRY_TIME - 1;
  return false;
}

export function renderScoreScreen(ctx, w, h) {
  if (!state.scoreScreen) return;
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  ctx.fillRect(w / 2 - 160, h / 2 - 180, 320, 360);
  ctx.strokeStyle = '#1d3557';
  ctx.lineWidth = 4;
  ctx.strokeRect(w / 2 - 160, h / 2 - 180, 320, 360);
  const s = state.scoreScreen;
  ctx.fillStyle = '#1d3557';
  ctx.font = 'bold 22px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('ORDER SCORE', w / 2, h / 2 - 140);
  const cats = [{ name: 'Wait Time', score: s.wait }, { name: 'Grill', score: s.grill }, { name: 'Toppings', score: s.toppings }, { name: 'Sides & Drink', score: s.sides }];
  cats.forEach((c, i) => {
    const y = h / 2 - 100 + i * 50;
    ctx.font = '14px system-ui';
    ctx.fillText(c.name, w / 2, y);
    ctx.fillStyle = '#ddd';
    ctx.fillRect(w / 2 - 100, y + 8, 200, 16);
    ctx.fillStyle = c.score > 80 ? '#4caf50' : c.score > 50 ? '#ffc107' : '#f44336';
    ctx.fillRect(w / 2 - 100, y + 8, 200 * (c.score / 100), 16);
    ctx.fillStyle = '#1d3557';
    ctx.fillText(Math.round(c.score) + '%', w / 2, y + 22);
  });
  const total = (s.wait + s.grill + s.toppings + s.sides) / 4;
  ctx.font = 'bold 28px system-ui';
  ctx.fillText(Math.round(total) + '%', w / 2, h / 2 + 120);
  ctx.font = '18px system-ui';
  ctx.fillText(`Tip: $${s.tip}`, w / 2, h / 2 + 150);
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(w / 2 - 60, h / 2 + 170, 120, 36);
  ctx.fillStyle = '#fff';
  ctx.fillText('NEXT', w / 2, h / 2 + 194);
}

export function renderEndOfDay(ctx, w, h) {
  if (!state.endOfDay) return;
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  ctx.fillRect(30, 80, w - 60, h - 160);
  ctx.strokeStyle = '#f5c518';
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 80, w - 60, h - 160);
  ctx.fillStyle = '#1d3557';
  ctx.font = 'bold 26px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(`Day ${state.day} Complete!`, w / 2, 130);
  ctx.font = '16px system-ui';
  ctx.fillText(`Customers: ${state.endOfDay.served}`, w / 2, 180);
  ctx.fillText(`Avg Score: ${state.endOfDay.avg}%`, w / 2, 210);
  ctx.fillText(`Tips: $${state.endOfDay.tips}`, w / 2, 240);
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(w / 2 - 80, h - 180, 160, 44);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px system-ui';
  ctx.fillText('SHOP', w / 2, h - 152);
}

export function renderSettings(ctx, w, h) {
  if (!state.showSettings && !state.showHowTo) return;
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  ctx.fillRect(30, 80, w - 60, h - 160);
  ctx.strokeStyle = '#1d3557';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 80, w - 60, h - 160);
  ctx.fillStyle = '#1d3557';
  ctx.font = 'bold 24px system-ui';
  ctx.textAlign = 'center';
  if (state.showHowTo) {
    ctx.fillText('HOW TO PLAY', w / 2, 130);
    ctx.font = '15px system-ui';
    const lines = ['1. Customers walk up — tap the bell', '2. Switch stations with the bottom tabs', '3. Grill: drag sausage, tap to rotate', '4. Topping: tap bottles & bins', '5. Sides: fryer + hold soda cup', '6. Serve the finished tray for tips!', '', 'Faster + more accurate = bigger tips'];
    lines.forEach((l, i) => ctx.fillText(l, w / 2, 180 + i * 28));
  } else {
    ctx.fillText('SETTINGS', w / 2, 130);
    ctx.font = '18px system-ui';
    ctx.fillText(`SFX: ${state.mutedSFX ? 'OFF' : 'ON'}`, w / 2, 200);
    ctx.fillText(`Music: ${state.mutedMusic ? 'OFF' : 'ON'}`, w / 2, 250);
    ctx.fillText('RESET SAVE', w / 2, 320);
  }
  ctx.fillStyle = '#e63946';
  ctx.fillRect(w / 2 - 60, h - 140, 120, 40);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px system-ui';
  ctx.fillText('CLOSE', w / 2, h - 114);
}

export function renderShop(ctx, w, h) {
  if (!state.shopOpen) return;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  ctx.fillRect(20, 60, w - 40, h - 120);
  ctx.fillStyle = '#1d3557';
  ctx.font = 'bold 22px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('SHOP', w / 2, 100);
  ctx.font = '16px system-ui';
  ctx.fillText(`$${state.money}`, w / 2, 130);
  const items = [{ key: 'biggerGrill', name: 'Bigger Grill', cost: CONFIG.UPGRADE_COSTS.biggerGrill }, { key: 'heatLamp', name: 'Heat Lamp', cost: CONFIG.UPGRADE_COSTS.heatLamp }, { key: 'betterFryer', name: 'Better Fryer', cost: CONFIG.UPGRADE_COSTS.betterFryer }, { key: 'autoSoda', name: 'Auto Soda', cost: CONFIG.UPGRADE_COSTS.autoSoda }, { key: 'doorbell', name: 'Doorbell', cost: CONFIG.UPGRADE_COSTS.doorbell }];
  items.forEach((item, i) => {
    const y = 160 + i * 50;
    const owned = state.upgrades[item.key];
    ctx.fillStyle = owned ? '#4caf50' : state.money >= item.cost ? '#f5c518' : '#90a4ae';
    ctx.fillRect(40, y, w - 80, 40);
    ctx.fillStyle = '#1d3557';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(item.name, 50, y + 26);
    ctx.textAlign = 'right';
    ctx.fillText(owned ? 'OWNED' : `$${item.cost}`, w - 50, y + 26);
  });
  ctx.fillStyle = '#e63946';
  ctx.fillRect(w / 2 - 60, h - 100, 120, 40);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 16px system-ui';
  ctx.fillText('CLOSE', w / 2, h - 74);
}

export function renderTitle(ctx, w, h) {
  ctx.fillStyle = CONFIG.COLORS.mustard;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#1d3557';
  ctx.font = 'bold 42px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('TOP DOG', w / 2, h * 0.25);
  ctx.font = 'bold 28px system-ui';
  ctx.fillText('DINER', w / 2, h * 0.32);
  ctx.fillStyle = '#f4a261';
  ctx.beginPath();
  ctx.ellipse(w / 2, h * 0.45, 90, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c44536';
  ctx.beginPath();
  ctx.ellipse(w / 2, h * 0.45, 70, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1d3557';
  ctx.lineWidth = 4;
  ctx.stroke();
  const buttons = ['PLAY', 'CONTINUE', 'SETTINGS', 'HOW TO PLAY'];
  buttons.forEach((b, i) => {
    ctx.fillStyle = '#e63946';
    ctx.fillRect(w / 2 - 100, h * 0.55 + i * 60, 200, 48);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px system-ui';
    ctx.fillText(b, w / 2, h * 0.55 + i * 60 + 30);
  });
}

export function handleUIInput(type, x, y, w, h) {
  if (state.showSettings || state.showHowTo) {
    if (type === 'tap' && y > h - 140 && y < h - 100 && Math.abs(x - w / 2) < 60) {
      state.showSettings = false;
      state.showHowTo = false;
      return true;
    }
    if (state.showSettings && type === 'tap') {
      if (Math.abs(y - 200) < 25 && Math.abs(x - w / 2) < 100) toggleSFX();
      if (Math.abs(y - 250) < 25 && Math.abs(x - w / 2) < 100) toggleMusic();
      if (Math.abs(y - 320) < 25 && Math.abs(x - w / 2) < 100) {
        if (confirm('Reset all progress?')) {
          resetSave();
          location.reload();
        }
      }
    }
    return true;
  }
  if (state.screen === 'title') {
    if (type === 'tap') {
      if (y > h * 0.55 && y < h * 0.55 + 48) { state.screen = 'game'; startMusic(); startDay(); }
      if (y > h * 0.55 + 60 && y < h * 0.55 + 108) { state.screen = 'game'; startMusic(); startDay(); }
      if (y > h * 0.55 + 120 && y < h * 0.55 + 168) state.showSettings = true;
      if (y > h * 0.55 + 180 && y < h * 0.55 + 228) state.showHowTo = true;
    }
    return true;
  }
  if (state.screen === 'game' && type === 'tap' && x > w - 40 && y < 50 && !state.scoreScreen && !state.endOfDay && !state.shopOpen) {
    state.paused = !state.paused;
    return true;
  }
  if (y > h - 70 && state.screen === 'game' && !state.scoreScreen && !state.endOfDay && !state.shopOpen) {
    const idx = Math.floor(x / (w / 4));
    const stations = ['order', 'grill', 'topping', 'sides'];
    state.currentStation = stations[idx];
    return true;
  }
  if (state.scoreScreen && type === 'tap' && Math.hypot(x - w / 2, y - (h / 2 + 188)) < 70) {
    addMoney(state.scoreScreen.tip);
    state.scoreScreen = null;
    const cid = state.activeOrder?.customerId;
    state.customers = state.customers.filter(c => c.instanceId !== cid);
    state.tickets = state.tickets.filter(t => t.id !== state.activeOrder?.id);
    state.activeOrder = state.tickets[0] || null;
    state.buildTray = null;
    return true;
  }
  if (state.endOfDay && type === 'tap' && y > h - 180 && y < h - 136 && Math.abs(x - w / 2) < 80) {
    state.shopOpen = true;
    state.endOfDay = null;
    return true;
  }
  if (state.shopOpen) {
    const items = [{ key: 'biggerGrill', cost: CONFIG.UPGRADE_COSTS.biggerGrill }, { key: 'heatLamp', cost: CONFIG.UPGRADE_COSTS.heatLamp }, { key: 'betterFryer', cost: CONFIG.UPGRADE_COSTS.betterFryer }, { key: 'autoSoda', cost: CONFIG.UPGRADE_COSTS.autoSoda }, { key: 'doorbell', cost: CONFIG.UPGRADE_COSTS.doorbell }];
    items.forEach((item, i) => {
      const yb = 160 + i * 50;
      if (type === 'tap' && y > yb && y < yb + 40 && x > 40 && x < w - 40) {
        if (!state.upgrades[item.key] && state.money >= item.cost) {
          state.money -= item.cost;
          state.upgrades[item.key] = true;
          saveGame();
        }
      }
    });
    if (type === 'tap' && y > h - 100 && y < h - 60 && Math.abs(x - w / 2) < 60) {
      state.shopOpen = false;
      state.day++;
      startDay();
      saveGame();
    }
    return true;
  }
  return false;
}

function startDay() {
  resetDay();
  setTimeout(() => spawnCustomer(), 2000);
  setTimeout(() => spawnCustomer(), 8000);
}

export function setScreen(s) { state.screen = s; }
