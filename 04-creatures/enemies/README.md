# Enemies - Hostile Creatures

This folder contains enemy creatures that attack the player.

## Current Enemies

- **maroon_blob_enemy_1.js** - Maroon Blob Enemy 1
  - Patrols and bites the player
  - Red/maroon blob with eyes
  - Rain World–inspired vision / hunt / investigate AI
  - Takes 2 ground slams to kill
  - Used on Level 1 and Level 3

- **silt_stalker.js** - Silt Stalker
  - Long, low segmented earth-tone predator (original look — not a lizard)
  - Stronger pursuit: longer vision/memory, ghost estimate when LOS breaks
  - Lunge snap with telescoping snout (dodge window on wind-up)
  - Tilemap collision (works on Level 2)
  - Takes 3 hits to kill
  - **Level 2 trial** — placed at designed encounters on the Mario-style athletic course

## Level 2 note

Level 2 is an authored left-to-right athletic course (`02-systems/level2.js`), inspired by classic Mario overworld pacing (original geometry). Sections: intro → hills → tunnel → athletic → chase valley → hide pocket → finish. Silt Stalkers spawn at landmarks; maroon blobs are not used on L2 for a clean pursuit trial.

## Adding New Enemies

1. **Copy the template**: Copy `maroon_blob_enemy_1.js` or `silt_stalker.js` as a starting point
2. **Rename the file**: Give it a descriptive name (e.g., `spike_enemy.js`, `flying_enemy.js`)
3. **Rename the class**: Change the class name to match
4. **Modify properties**: colors, size, speed, attack patterns
5. **Add to index.html**: In the "STEP 5: Creatures" section:
   ```html
   <script src="04-creatures/enemies/your_enemy.js"></script>
   ```
6. **Add to level creation**: In `02-systems/level.js` or `level2.js`:
   ```javascript
   enemies.push(new YourEnemy(x, y));
   ```

## Enemy Properties

Each enemy should have:
- **Position** (x, y) - Where it spawns
- **Size** (width, height) - Collision box
- **Health** - How many hits to kill
- **Attack pattern** - How it attacks (bite, lunge, charge, etc.)
- **Movement** - How it moves (patrol, chase, etc.)
- For Level 2: **tilemap collision** via `worldMap` (see Silt Stalker)

## Enemy vs Kasha

- **Enemies** (this folder) - Hostile, attack the player, cannot be caught
- **Kashas** (`../kashas/`) - Friendly/catchable, can be caught with kashaballs
