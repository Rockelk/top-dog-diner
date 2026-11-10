// js/main.js
import { state, resetDay } from './state.js';
import { CONFIG } from './config.js';
import { updateCustomers, spawnCustomer } from './customers.js';
import { orderStation } from './stations/order.js';
import { grillStation } from './stations/grill.js';
import { toppingStation } from './stations/topping.js';
import { sidesStation } from './stations/sides.js';
import { renderHUD, renderScoreScreen, renderEndOfDay, renderShop, renderTitle, renderSettings, handleUIInput } from './ui.js';
import { initAudio, startMusic, playCash } from './audio.js';
import { loadGame, saveGame } from './save.js';

const stations = {
  order: orderStation,
  grill: grillStation,
  topping: toppingStation,
  sides: sidesStation
};

let canvas, ctx;
let lastTime = 0;
let customerTimer = 0;

function init() {
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  setupInput();
  loadGame();
  state.screen = 'title';
  initAudio();
  requestAnimationFrame(loop);
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.min(window.innerWidth, 430);
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function setupInput() {
  let pointerDown = false;
  let startX, startY;
  const getPos = e => {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  };
  const onDown = e => {
    e.preventDefault();
    const p = getPos(e);
    pointerDown = true;
    startX = p.x; startY = p.y;
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    if (handleUIInput('tap', p.x, p.y, w, h)) return;
    const st = stations[state.currentStation];
    if (st) st.handleInput('dragstart', p.x, p.y, w, h);
    if (state.currentStation === 'sides') st.handleInput('holdstart', p.x, p.y, w, h);
  };
  const onMove = e => {
    if (!pointerDown) return;
    const p = getPos(e);
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const st = stations[state.currentStation];
    if (st) st.handleInput('drag', p.x, p.y, w, h);
  };
  const onUp = e => {
    if (!pointerDown) return;
    pointerDown = false;
    const p = getPos(e);
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const st = stations[state.currentStation];
    if (st) {
      st.handleInput('tap', p.x, p.y, w, h);
      st.handleInput('dragend', p.x, p.y, w, h);
      st.handleInput('holdend', p.x, p.y, w, h);
    }
    handleUIInput('tap', p.x, p.y, w, h);
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('touchstart', onDown, { passive: false });
  canvas.addEventListener('touchmove', onMove, { passive: false });
  canvas.addEventListener('touchend', onUp);
}

function loop(ts) {
  const dt = Math.min(0.05, (ts - lastTime) / 1000);
  lastTime = ts;
  if (!state.paused && state.screen === 'game' && !state.scoreScreen && !state.endOfDay && !state.shopOpen) {
    state.timeLeft -= dt;
    updateCustomers(dt);
    const st = stations[state.currentStation];
    if (st) st.update(dt);
    customerTimer += dt;
    const interval = CONFIG.CUSTOMER_ARRIVAL_BASE * Math.pow(CONFIG.CUSTOMER_ARRIVAL_SCALE, state.day - 1);
    if (customerTimer > interval && state.customers.length < 4 && state.timeLeft > 30) {
      spawnCustomer();
      customerTimer = 0;
    }
    if (state.timeLeft <= 0) endDay();
  }
  render();
  requestAnimationFrame(loop);
}

function render() {
  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = CONFIG.COLORS.bg;
  ctx.fillRect(0, 0, w, h);
  if (state.screen === 'title') {
    renderTitle(ctx, w, h);
    renderSettings(ctx, w, h);
    return;
  }
  const st = stations[state.currentStation];
  if (st) st.render(ctx, w, h);
  renderHUD(ctx, w, h);
  renderScoreScreen(ctx, w, h);
  renderEndOfDay(ctx, w, h);
  renderShop(ctx, w, h);
  renderSettings(ctx, w, h);
  if (state.paused && state.screen === 'game' && !state.scoreScreen && !state.endOfDay && !state.shopOpen) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', w / 2, h / 2);
    ctx.font = '16px system-ui';
    ctx.fillText('Tap the pause icon to resume', w / 2, h / 2 + 30);
  }
  if (state.screenShake > 0) {
    ctx.save();
    ctx.translate((Math.random() - 0.5) * state.screenShake, (Math.random() - 0.5) * state.screenShake);
    state.screenShake *= 0.9;
  }
}

function endDay() {
  state.endOfDay = {
    served: Math.floor(Math.random() * 4 + 4),
    avg: Math.floor(Math.random() * 30 + 65),
    tips: Math.floor(Math.random() * 40 + 20)
  };
  state.stats.daysPlayed++;
  saveGame();
}

window.addEventListener('load', () => {
  init();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(console.warn);
  }
});
