# 04-creatures - Creatures

This folder contains all the creatures in your game! Organized into two categories:

## 📁 Structure

### 📁 enemies/
**Hostile creatures that attack the player**
- Cannot be caught
- Attack on sight
- Must be defeated

See `enemies/README.md` for details.

### 📁 kashas/
**Catchable creatures (like Pokemon)**
- Can be caught with kashaballs
- Friendly or neutral
- Become inventory items when caught
- Can be fused with weapons (future feature)

See `kashas/README.md` for details.

## Current Creatures

### Enemies
- **maroon_blob_enemy_1.js** - Basic maroon blob enemy

### Kashas
- **cassieduck.js** - Cassieduck (yellow duck-like kasha)

## How to Add a New Creature

### Adding an Enemy
1. Copy `enemies/maroon_blob_enemy_1.js`
2. Rename and modify
3. Add to `index.html` in enemies section
4. See `enemies/README.md` for details

### Adding a Kasha
1. Copy `kashas/cassieduck.js`
2. Rename and modify
3. Add to `index.html` in kashas section
4. See `kashas/README.md` for details

## Creature Categories

**Enemies** = Hostile, attack player, cannot be caught
**Kashas** = Friendly/catchable, can be collected, can be fused

## Future: Creature Collector System

This folder will grow as you add more creatures for your Noita-like creature collector game!

