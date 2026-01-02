# Kashas - Catchable Creatures

This folder contains Kasha creatures that can be caught with kashaballs (like Pokemon).

## Current Kashas

- **cassieduck.js** - Cassieduck
  - Yellow duck-like creature
  - Waddles back and forth
  - Can be caught with kashaballs
  - Becomes a unique inventory item when caught

## Adding New Kashas

1. **Copy the template**: Copy `cassieduck.js` as a starting point
2. **Rename the file**: Give it a descriptive name (e.g., `fireduck.js`, `icekasha.js`)
3. **Rename the class**: Change `class CassieDuck` to your kasha name (e.g., `class FireDuck`)
4. **Modify properties**:
   - Change `type` property (e.g., `'fireduck'`)
   - Change colors, size, behavior
   - Add special abilities
   - Modify movement patterns
5. **Add to index.html**: In the "STEP 5: Creatures" section, add:
   ```html
   <script src="04-creatures/kashas/your_kasha.js"></script>
   ```
6. **Add to level creation**: In `02-systems/level.js`, add spawn code:
   ```javascript
   kashas.push(new YourKasha(x, y));
   ```

## Kasha Properties

Each kasha should have:
- **type** - Unique identifier (e.g., `'cassieduck'`, `'fireduck'`)
- **Position** (x, y) - Where it spawns
- **Size** (width, height) - Collision box
- **Movement** - How it moves (waddle, fly, swim, etc.)
- **Behavior** - What it does (patrol, follow, flee, etc.)
- **Abilities** - Special powers (for future fusion system)

## Catching System

When a kasha is hit by a kashaball:
1. It enters "catching" state
2. After a brief animation, it's caught
3. A special kashaball item is created on the ground
4. Player can pick it up to add to inventory
5. Caught kashas can be fused with weapons (future feature)

## Kasha vs Enemy

- **Kashas** (this folder) - Catchable, friendly, can be collected
- **Enemies** (`../enemies/`) - Hostile, attack player, cannot be caught

## Future: Creature Collector

This folder will grow as you add more kasha types for your Noita-like creature collector game!

