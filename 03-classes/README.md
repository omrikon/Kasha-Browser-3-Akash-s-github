# 03-classes - Game Classes

This folder contains the classes (blueprints) for things in the game world.

## Files

- **player.js** - The player character
  - Movement (walk, jump, ground slam)
  - Combat (weapon attacks)
  - Health system
  - Sprite animations

- **inventory.js** - Inventory system
  - Item storage
  - Slot management
  - Drag and drop
  - Weapon fusion

- **gameObjects.js** - Game objects
  - **Platform** - Ground and platforms you can stand on
  - **Box** - Boxes that contain kashaballs
  - **Kashaball** - Pokeball-like items you throw
  - **KashaCorpse** - Dead creatures for core extraction

- **effects.js** - Visual effects
  - **GroundSlamEffect** - Shockwave when you ground slam
  - **PlatformBreakingEffect** - Breaking animation for platforms

- **particles.js** - Particle effects
  - **DirtTile** - Falling dirt particles that settle into tiles

## What's a Class?

A class is like a blueprint. For example, the `Player` class defines what a player is (has health, can move, can jump). When the game starts, it creates a `player` object from the `Player` class.

