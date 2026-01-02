# 02-systems - Game Systems

This folder contains the systems that make the game work.

## Files

- **audio.js** - Sound and music system
  - Background music
  - Sound effects (collect, throw, damage, etc.)
  - Audio initialization

- **input.js** - Input handling
  - Keyboard controls (WASD, arrows, etc.)
  - Mouse controls (clicking, dragging)
  - Input state tracking

- **level.js** - Level management
  - Creating levels
  - Resetting game
  - Loading next level
  - Level-specific logic

- **drawing.js** - Rendering system
  - Drawing UI (pause menu, inventory, HUD)
  - Drawing game objects
  - Drawing backgrounds and effects
  - Camera updates

- **gameLoop.js** - Main game loop
  - Runs every frame (60 times per second)
  - Updates all game objects
  - Draws everything
  - Handles game state

## How It Works

The game loop runs continuously:
1. Update all game objects (player, enemies, particles, etc.)
2. Check collisions
3. Draw everything to the screen
4. Repeat

