# Kasha Browser Game Modularization Plan

## Overview
This document outlines the plan to modularize the `game.js` file (5169 lines) into smaller, manageable modules. The goal is to keep each file under 2000 lines and organize the code for easier maintenance and future expansion into a Noita-like creature collector game.

## File Structure

### Core Configuration & Setup
- **config.js** (~100 lines)
  - Canvas setup and pixel scale constants
  - DOM element references
  - Weapon type constants (WEAPON_TYPES)
  - Global configuration values

### Game State
- **gameState.js** (~100 lines)
  - Game state variables (camera, pause, level, etc.)
  - Game object arrays (platforms, enemies, kashaballs, etc.)
  - Player and inventory instances
  - Fusion slots

### Input Handling
- **input.js** (~600 lines)
  - Keyboard event handlers
  - Mouse event handlers
  - Input state management
  - Helper functions for UI interactions (button clicks, slot selection)

### Audio System
- **audio.js** (~150 lines)
  - Audio context setup
  - Background music functions
  - Sound effect functions
  - Audio initialization

### Effect Classes
- **classes/effects.js** (~200 lines)
  - GroundSlamEffect class
  - PlatformBreakingEffect class

### Particle Classes
- **classes/particles.js** (~300 lines)
  - DirtTile class (falling dirt particles)

### Game Object Classes
- **classes/gameObjects.js** (~700 lines)
  - Platform class
  - Box class
  - Kashaball class
  - KashaCorpse class

### Player Class
- **classes/player.js** (~1000 lines)
  - Player class (movement, combat, collision, drawing)

### Inventory System
- **classes/inventory.js** (~500 lines)
  - Inventory class (items, slots, drag & drop, fusion)

### Level System
- **level.js** (~500 lines)
  - createLevel() function
  - resetGame() function
  - nextLevel() function
  - loadLevel() function
  - Level-specific logic

### Drawing System
- **drawing.js** (~1500 lines)
  - drawPauseMenu()
  - drawInventorySlot()
  - drawLevelFinished()
  - drawGameOver()
  - drawLevelSelector()
  - drawInventoryHUD()
  - drawTileMap()
  - drawDirtTiles()
  - drawBackground()
  - drawCloud()
  - drawTrajectory()
  - updateCamera()
  - updateHealthDisplay()
  - Helper functions for UI drawing

### Game Loop & Utilities
- **gameLoop.js** (~300 lines)
  - gameLoop() function
  - Main game update logic
  - Utility functions (getWeaponBehavior, handleKashaDeath, throwKashaball)

### Main Entry Point
- **main.js** (~50 lines)
  - Initialize game
  - Start game loop
  - Setup initialization order

## Module Dependencies

```
main.js
├── config.js (first - sets up canvas and constants)
├── gameState.js (depends on config)
├── audio.js (independent)
├── classes/effects.js (depends on config, gameState)
├── classes/particles.js (depends on config, gameState, tilemap)
├── classes/gameObjects.js (depends on config, gameState, classes/effects)
├── classes/player.js (depends on config, gameState, classes/inventory, classes/effects)
├── classes/inventory.js (depends on config, gameState)
├── input.js (depends on config, gameState, classes/inventory)
├── level.js (depends on config, gameState, classes/*)
├── drawing.js (depends on config, gameState, classes/*)
└── gameLoop.js (depends on everything)
```

## Loading Order in index.html

1. tilemap.js (external dependency)
2. enemy.js (external dependency)
3. cassieduck.js (external dependency)
4. config.js
5. gameState.js
6. audio.js
7. classes/effects.js
8. classes/particles.js
9. classes/gameObjects.js
10. classes/inventory.js
11. classes/player.js
12. input.js
13. level.js
14. drawing.js
15. gameLoop.js
16. main.js

## Key Considerations

1. **Global Variables**: Some variables need to be global (window.*) for cross-file access. These will be documented in each file.

2. **Console Logging**: All files will include console.log statements for debugging, especially around initialization and error cases.

3. **No File Exceeds 2000 Lines**: Each module is designed to stay well under this limit.

4. **Backward Compatibility**: The game will function exactly the same as before, just organized differently.

5. **Future Expansion**: The modular structure makes it easier to:
   - Add new creature types (Kasha variants)
   - Add new weapon types
   - Add new level generation logic
   - Add new inventory features
   - Extend drawing/UI systems

## Implementation Notes

- All files will use ES6 modules if needed, or traditional script tags with careful ordering
- Shared state will be managed through window.* global variables where necessary
- Each module should be self-contained where possible
- Dependencies between modules should be explicit and clear

