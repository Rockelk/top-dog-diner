// js/customers.js
import { CONFIG, BUN_TYPES, SAUSAGE_TYPES, TOPPINGS, SIDES, DRINKS, DONENESS } from './config.js';
import { state } from './state.js';

export const CUSTOMER_ROSTER = [
  { id: 'milo', name: 'Milo', color: '#ff9f1c', hair: 'spiky', hat: null, glasses: false, favorite: 'classic', pickiness: 0.3, unlockDay: 1 },
  { id: 'luna', name: 'Luna', color: '#e0aaff', hair: 'bob', hat: 'beret', glasses: false, favorite: 'veggie', pickiness: 0.5, unlockDay: 2 },
  { id: 'rex', name: 'Rex', color: '#90e0ef', hair: 'buzz', hat: 'cap', glasses: true, favorite: 'bratwurst', pickiness: 0.4, unlockDay: 3 },
  { id: 'nova', name: 'Nova', color: '#f72585', hair: 'ponytail', hat: null, glasses: false, favorite: 'spicy', pickiness: 0.6, unlockDay: 4 },
  { id: 'pip', name: 'Pip', color: '#06d6a0', hair: 'curly', hat: 'beanie', glasses: false, favorite: 'classic', pickiness: 0.2, unlockDay: 1 },
  { id: 'zara', name: 'Zara', color: '#ffd166', hair: 'long', hat: null, glasses: true, favorite: 'veggie', pickiness: 0.7, unlockDay: 5 },
  { id: 'otto', name: 'Otto', color: '#118ab2', hair: 'slick', hat: 'fedora', glasses: false, favorite: 'bratwurst', pickiness: 0.5, unlockDay: 6 },
  { id: 'cleo', name: 'Cleo', color: '#ef476f', hair: 'bob', hat: 'bow', glasses: false, favorite: 'classic', pickiness: 0.3, unlockDay: 1 },
  { id: 'finn', name: 'Finn', color: '#073b4c', hair: 'spiky', hat: 'cap', glasses: false, favorite: 'spicy', pickiness: 0.4, unlockDay: 7 },
  { id: 'maya', name: 'Maya', color: '#9b5de5', hair: 'ponytail', hat: null, glasses: true, favorite: 'veggie', pickiness: 0.6, unlockDay: 4 },
  { id: 'jace', name: 'Jace', color: '#00bbf9', hair: 'buzz', hat: null, glasses: false, favorite: 'bratwurst', pickiness: 0.5, unlockDay: 5 },
  { id: 'suki', name: 'Suki', color: '#fee440', hair: 'long', hat: 'beret', glasses: false, favorite: 'classic', pickiness: 0.3, unlockDay: 3 }
];

let nextCustomerId = 0;

export function getAvailableCustomers() {
  return CUSTOMER_ROSTER.filter(c => c.unlockDay <= state.day);
}

export function generateOrder(customer) {
  const availableBuns = BUN_TYPES.filter(b => state.unlocked.has(b));
  const availableSausages = SAUSAGE_TYPES.filter(s => state.unlocked.has(s));
  const availableToppings = TOPPINGS.filter(t => state.unlocked.has(t));
  const availableSides = SIDES.filter(s => state.unlocked.has(s));
  const availableDrinks = DRINKS.filter(d => state.unlocked.has(d));
  const numToppings = 1 + Math.floor(Math.random() * 3 + customer.pickiness * 2);
  const toppings = [];
  for (let i = 0; i < numToppings && availableToppings.length; i++) {
    const t = availableToppings[Math.floor(Math.random() * availableToppings.length)];
    if (!toppings.includes(t)) toppings.push(t);
  }
  return {
    bun: availableBuns[Math.floor(Math.random() * availableBuns.length)],
    sausage: availableSausages[Math.floor(Math.random() * availableSausages.length)],
    doneness: DONENESS[Math.floor(Math.random() * DONENESS.length)],
    toppings,
    side: availableSides[Math.floor(Math.random() * availableSides.length)],
    drink: availableDrinks[Math.floor(Math.random() * availableDrinks.length)],
    drinkSize: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)]
  };
}

export function spawnCustomer() {
  const pool = getAvailableCustomers();
  if (!pool.length) return null;
  const template = pool[Math.floor(Math.random() * pool.length)];
  const order = generateOrder(template);
  const customer = {
    ...template,
    instanceId: ++nextCustomerId,
    order,
    patience: CONFIG.PATIENCE_BASE * (state.upgrades.heatLamp ? 1.35 : 1),
    maxPatience: CONFIG.PATIENCE_BASE * (state.upgrades.heatLamp ? 1.35 : 1),
    state: 'waiting',
    arrivedAt: state.timeLeft,
    x: -80,
    targetX: 40 + Math.random() * 60
  };
  state.customers.push(customer);
  return customer;
}

export function updateCustomers(dt) {
  for (const c of state.customers) {
    if (c.state === 'waiting' || c.state === 'ordering') {
      c.patience -= dt * CONFIG.PATIENCE_DRAIN_RATE;
      if (c.patience <= 0) {
        c.state = 'leaving';
        c.comment = 'Too slow...';
      }
    }
    if (c.x < c.targetX) c.x += dt * 120;
  }
  state.customers = state.customers.filter(c => c.state !== 'gone');
}
