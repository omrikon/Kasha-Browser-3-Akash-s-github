# Enemies - Hostile Creatures

This folder contains enemy creatures that attack the player.

## Current Enemies

- **maroon_blob_enemy_1.js** - Maroon Blob Enemy 1
  - Basic enemy that patrols and bites the player
  - Red/maroon colored blob with eyes
  - Attacks when player is nearby
  - Takes 2 ground slams to kill

## Adding New Enemies

1. **Copy the template**: Copy `maroon_blob_enemy_1.js` as a starting point
2. **Rename the file**: Give it a descriptive name (e.g., `spike_enemy.js`, `flying_enemy.js`)
3. **Rename the class**: Change `class MaroonBlobEnemy1` to your enemy name (e.g., `class SpikeEnemy`)
4. **Modify properties**:
   - Change colors, size, speed
   - Modify attack patterns
   - Add special abilities
5. **Add to index.html**: In the "STEP 5: Creatures" section, add:
   ```html
   <script src="04-creatures/enemies/your_enemy.js"></script>
   ```
6. **Add to level creation**: In `02-systems/level.js`, add spawn code:
   ```javascript
   enemies.push(new YourEnemy(x, y));
   ```

## Enemy Properties

Each enemy should have:
- **Position** (x, y) - Where it spawns
- **Size** (width, height) - Collision box
- **Health** - How many hits to kill
- **Attack pattern** - How it attacks (bite, charge, shoot, etc.)
- **Movement** - How it moves (patrol, chase, etc.)

## Enemy vs Kasha

- **Enemies** (this folder) - Hostile, attack the player, cannot be caught
- **Kashas** (`../kashas/`) - Friendly/catchable, can be caught with kashaballs

