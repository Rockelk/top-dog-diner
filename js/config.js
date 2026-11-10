// js/config.js
// All tunable numbers in one place for easy balancing.

export const CONFIG = {
  // Day / timing
  DAY_DURATION: 300,
  CUSTOMER_ARRIVAL_BASE: 12,
  CUSTOMER_ARRIVAL_SCALE: 0.85,
  MAX_CUSTOMERS_PER_DAY: 12,
  PATIENCE_BASE: 45,
  PATIENCE_DRAIN_RATE: 1.0,
  GRILL_SLOTS: 4,
  COOK_SPEED: 0.35,
  ROTATE_BONUS: 0.15,
  BURN_THRESHOLD: 4.2,
  TOPPING_COVERAGE_TARGET: 0.65,
  EVENNESS_TOLERANCE: 0.18,
  FRY_TIME: 8,
  FRY_GOLDEN_WINDOW: 1.5,
  SODA_FILL_SPEED: 0.4,
  TIP_MULTIPLIER: 1.8,
  PERFECT_THRESHOLD: 92,
  BASE_PRICE: 6,
  UPGRADE_COSTS: {
    biggerGrill: 80,
    heatLamp: 120,
    betterFryer: 100,
    autoSoda: 150,
    doorbell: 60
  },
  UNLOCKS: {
    pretzelBun: 2,
    briocheBun: 4,
    poppyBun: 6,
    veggieDog: 3,
    bratwurst: 5,
    spicyDog: 7,
    sriracha: 2,
    jalapenos: 3,
    sauerkraut: 4,
    chili: 5,
    bacon: 6
  },
  COLORS: {
    bg: '#1a1f2e',
    mustard: '#f5c518',
    ketchup: '#e63946',
    relish: '#2a9d8f',
    sky: '#4cc9f0',
    bun: '#f4a261',
    sausage: '#c44536',
    outline: '#1d3557',
    text: '#f1faee',
    panel: '#2b3a55'
  }
};

export const BUN_TYPES = ['regular', 'pretzel', 'brioche', 'poppy'];
export const SAUSAGE_TYPES = ['classic', 'veggie', 'bratwurst', 'spicy'];
export const TOPPINGS = ['ketchup', 'mustard', 'mayo', 'sriracha', 'onions', 'relish', 'sauerkraut', 'jalapenos', 'chili', 'cheese', 'bacon'];
export const SIDES = ['fries', 'chips'];
export const DRINKS = ['cola', 'lemon', 'rootbeer'];
export const DONENESS = ['rare', 'medium', 'well', 'charred'];
