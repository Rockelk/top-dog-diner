// js/stations/order.js
import { state } from '../state.js';
import { CONFIG } from '../config.js';
import { playDing } from '../audio.js';

export const orderStation = {
  enter() {},
  exit() {},
  update(dt) {},
  render(ctx, w, h) {
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(0, h * 0.55, w, h * 0.45);
    ctx.fillStyle = '#d7ccc8';
    ctx.fillRect(0, h * 0.52, w, 18);
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.48, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1d3557';
    ctx.lineWidth = 4;
    ctx.stroke();
    state.customers.forEach((c) => {
      if (c.state === 'waiting' || c.state === 'ordering') {
        drawCustomer(ctx, c.x, h * 0.42, c);
        const pw = 60;
        ctx.fillStyle = '#333';
        ctx.fillRect(c.x - 20, h * 0.32, pw, 8);
        const pct = Math.max(0, c.patience / c.maxPatience);
        ctx.fillStyle = pct > 0.5 ? '#4caf50' : pct > 0.25 ? '#ffc107' : '#f44336';
        ctx.fillRect(c.x - 20, h * 0.32, pw * pct, 8);
      }
    });
    if (state.buildTray) {
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(w / 2 - 70, h * 0.64, 140, 44);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('SERVE!', w / 2, h * 0.64 + 28);
    }
    const active = state.customers.find(c => c.state === 'ordering');
    if (active && active.order) {
      drawSpeech(ctx, active.x, h * 0.22, formatOrder(active.order));
    }
  },
  handleInput(type, x, y, w, h) {
    if (type !== 'tap') return;
    if (state.buildTray && y > h * 0.62 && y < h * 0.78 && Math.abs(x - w / 2) < 90) {
      const waitScore = Math.max(25, Math.min(100, 80 + Math.random() * 15));
      const grillScore = state.buildTray.sausage.burned ? 20 : 72 + Math.random() * 22;
      const topScore = Math.min(100, 45 + state.buildTray.coverage * 55);
      const sideScore = (state.buildTray.side || state.buildTray.drink) ? 70 + Math.random() * 25 : 45;
      const tip = Math.round(CONFIG.BASE_PRICE * ((waitScore + grillScore + topScore + sideScore) / 400) * CONFIG.TIP_MULTIPLIER);
      state.scoreScreen = { wait: waitScore, grill: grillScore, toppings: topScore, sides: sideScore, tip };
      import('../audio.js').then(m => m.playCash());
      state.stats.totalCustomers++;
      return;
    }
    if (Math.hypot(x - w * 0.5, y - h * 0.48) < 44) {
      const next = state.customers.find(c => c.state === 'waiting');
      if (next) {
        next.state = 'ordering';
        playDing();
        state.tickets.push({
          id: Date.now() + Math.random(),
          customerId: next.instanceId,
          order: next.order,
          created: state.timeLeft
        });
        state.activeOrder = state.tickets[state.tickets.length - 1];
      }
    }
  }
};

function drawCustomer(ctx, x, y, c) {
  ctx.fillStyle = c.color;
  ctx.beginPath();
  ctx.ellipse(x, y + 30, 28, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1d3557';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#ffdbac';
  ctx.beginPath();
  ctx.arc(x, y, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#3d2314';
  if (c.hair === 'spiky') {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) ctx.lineTo(x - 20 + i * 10, y - 20 - (i % 2) * 12);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(x, y - 8, 28, Math.PI, 0);
    ctx.fill();
  }
  if (c.hat === 'cap') {
    ctx.fillStyle = '#e63946';
    ctx.fillRect(x - 22, y - 18, 44, 10);
    ctx.fillRect(x - 8, y - 28, 16, 12);
  }
  if (c.glasses) {
    ctx.strokeStyle = '#1d3557';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x - 10, y - 2, 8, 0, Math.PI * 2);
    ctx.arc(x + 10, y - 2, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 2, y - 2);
    ctx.lineTo(x + 2, y - 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(c.name, x, y + 70);
}

function formatOrder(o) {
  return `${o.sausage} ${o.doneness}\n${o.bun} bun\n${o.toppings.slice(0, 2).join(', ')}\n${o.side} + ${o.drink}`;
}

function drawSpeech(ctx, x, y, text) {
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#1d3557';
  ctx.lineWidth = 3;
  const lines = text.split('\n');
  const bw = 160, bh = 20 + lines.length * 18;
  ctx.beginPath();
  ctx.roundRect(x - bw / 2, y - bh, bw, bh, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#1d3557';
  ctx.font = '13px system-ui';
  ctx.textAlign = 'center';
  lines.forEach((l, i) => ctx.fillText(l, x, y - bh + 20 + i * 18));
}
