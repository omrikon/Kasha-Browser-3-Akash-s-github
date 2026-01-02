# Kasha Browser Game

A modular 2D platformer game built for easy expansion into a Noita-like creature collector.

## 🚫 Important Rule

**NO FILE SHALL EXCEED 2000 LINES OF CODE**

This is an absolute rule. See `CODING_RULES.md` for details. Run `./check-file-sizes.sh` to verify.

## How to Start

1. Open `index.html` in your web browser
2. That's it! The game will load automatically.

## File Structure (for non-coders)

### 📄 main.js
**This is where the game starts!** This file initializes everything and starts the game loop.

### 📁 01-core/
Basic game setup - loads first. Don't modify unless you know what you're doing.
- `config.js` - Game settings (canvas size, pixel scale, weapon types)
- `gameState.js` - Game variables (health, score, level, etc.)

### 📁 02-systems/
Game systems that make everything work.
- `audio.js` - Sounds and background music
- `input.js` - Keyboard and mouse controls
- `level.js` - Level creation and management
- `drawing.js` - Drawing everything on screen (UI, menus, game objects)
- `gameLoop.js` - The main game loop (runs every frame)

### 📁 03-classes/
Things that exist in the game world.
- `player.js` - The player character
- `inventory.js` - Player's inventory system
- `gameObjects.js` - Platforms, boxes, kashaballs, corpses
- `effects.js` - Visual effects (ground slam, breaking animations)
- `particles.js` - Particle effects (falling dirt)

### 📁 04-creatures/
Your creatures! This is where you'll add new creature types.
- `enemy.js` - Enemy creatures
- `cassieduck.js` - Cassieduck creature (example)
- **Add new creatures here!**

### 📁 05-world/
World and tile system.
- `tilemap.js` - Tile-based world system (like Minecraft/Noita)

### 📁 assets/
Images, sounds, and other game assets.
- `music/` - Background music files
- `sprites/` - Character and object images

## Want to Add a New Creature?

1. Copy `04-creatures/cassieduck.js` as a template
2. Rename it to your creature name (e.g., `04-creatures/fireduck.js`)
3. Modify the code to change how it looks and behaves
4. Add it to `index.html` in the "STEP 5: Creatures" section:
   ```html
   <script src="04-creatures/fireduck.js"></script>
   ```
5. That's it! Your new creature will appear in the game.

## Controls

- **WASD** or **Arrow Keys** - Move
- **Space** or **Up Arrow** - Jump
- **S** or **Down Arrow** - Ground Slam
- **Q** - Throw/Attack
- **1-9** - Select inventory slot
- **Mouse Wheel** - Scroll inventory
- **E** - Extract Core/Extended Inventory
- **Click** - Throw kashaball
- **ESC** - Pause

## Tips

- Check the browser console (F12) for debug messages
- All files log when they load successfully
- If something breaks, check the console for error messages

