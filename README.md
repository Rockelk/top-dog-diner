# Top Dog Diner

A polished, original time-management hot dog shop game in the style of Papa's restaurant games. Built as a Progressive Web App with zero dependencies — all art is drawn in code.

## How to run locally

Any static file server works. From the project root:

```bash
npx serve
# or
python3 -m http.server 8000
# or
php -S localhost:8000
```

Then open `http://localhost:3000` (or whatever port) in your browser.

## Install as an app

- **Android (Chrome)**: Open the site → menu → "Add to Home screen" / "Install app".
- **iOS (Safari)**: Open the site → Share → "Add to Home Screen".

The service worker caches everything so it works fully offline after the first load.

## Tune difficulty

All balance numbers live in `js/config.js`:

- `DAY_DURATION` — length of a shift
- `CUSTOMER_ARRIVAL_BASE` / `SCALE` — how fast customers arrive
- `PATIENCE_BASE` / `DRAIN_RATE` — how long customers wait
- `COOK_SPEED`, `FRY_TIME`, topping coverage targets
- Unlock days and upgrade costs
- Scoring multipliers

Change values, refresh, and the new balance takes effect immediately (progress is saved in localStorage).

## Controls

- Tap station tabs at the bottom to switch.
- Drag sausages onto the grill, tap to rotate.
- Tap/drag bottles and bins to apply toppings.
- Tap fryer to drop/pull fries, hold on soda cup to fill.
- Large touch targets (44px+) — works great with finger or mouse.

## Files

- `index.html`, `style.css`, `manifest.json`, `service-worker.js`, `icon.svg`
- `js/` modules: `main.js` (loop), `state.js`, `config.js`, `customers.js`, `ui.js`, `audio.js`, `save.js`
- `js/stations/` — one file per station with enter/exit/update/render/handleInput

Have fun running the diner!
