# 05-world - World System

This folder contains the world/tile system.

## Files

- **tilemap.js** - Tile-based world system
  - Converts the world into a grid of tiles
  - Handles tile types (solid, platform, dirt, water, etc.)
  - Collision detection with tiles
  - Tile destruction (ground slam breaks tiles)
  - Dirt physics (dirt particles settle into tiles)

## How It Works

The world is divided into a grid of tiles (like Minecraft or Noita):
- Each tile is 16x16 pixels
- Tiles can be solid (you can't walk through), empty (air), or special types
- When you ground slam, you can destroy certain tile types
- Dirt particles fall and settle into tiles

## Tile Types

- **EMPTY** - Air, nothing there
- **SOLID** - Solid ground (indestructible)
- **PLATFORM** - Platforms you can jump on (can be destroyed)
- **DIRT** - Dirt tiles (can be destroyed, particles settle into these)
- **WATER** - Liquid water (flows)
- **OIL** - Liquid oil (flows slowly, flammable)
- **FIRE** - Burning tiles
- **GRASS** - Grass tiles (flammable)
- **STONE** - Stone tiles (fireproof)
- **ASH** - Ash left after grass burns

This system makes the world destructible and interactive, like Noita!

